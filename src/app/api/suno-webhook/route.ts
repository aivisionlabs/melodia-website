import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Suno Webhook received:', JSON.stringify(body, null, 2));

    // Extract task ID and status from webhook
    const { taskId, status, data } = body;

    if (!taskId) {
      console.log('No taskId in webhook, skipping');
      return NextResponse.json({ success: true });
    }

    // Find song by task ID (check both primary task ID and variants)
    const songs = await db
      .select()
      .from(songsTable)
      .where(eq(songsTable.suno_task_id, taskId));

    if (songs.length === 0) {
      // Check if this task ID is in any of the variants
      const allSongs = await db.select().from(songsTable);
      let targetSong = null;

      for (const song of allSongs) {
        if (song.suno_variants && Array.isArray(song.suno_variants)) {
          const variant = song.suno_variants.find((v: any) => v.taskId === taskId);
          if (variant) {
            targetSong = song;
            break;
          }
        }
      }

      if (!targetSong) {
        console.log(`No song found for task ID: ${taskId}`);
        return NextResponse.json({ success: true });
      }

      // Update the specific variant
      const updatedVariants = targetSong.suno_variants.map((variant: any) => {
        if (variant.taskId === taskId) {
          return {
            ...variant,
            status: status === 'SUCCESS' ? 'completed' : 'failed',
            audioUrl: status === 'SUCCESS' ? data?.audioUrl : null,
            streamAudioUrl: status === 'SUCCESS' ? data?.streamAudioUrl : null,
            imageUrl: status === 'SUCCESS' ? data?.imageUrl : null,
            duration: status === 'SUCCESS' ? data?.duration : null
          };
        }
        return variant;
      });

      // Check if all variants are completed
      const allCompleted = updatedVariants.every((variant: any) =>
        variant.status === 'completed' || variant.status === 'failed'
      );

      if (allCompleted) {
        // Update song status to ready
        await db
          .update(songsTable)
          .set({
            status: 'ready',
            suno_variants: updatedVariants
          })
          .where(eq(songsTable.id, targetSong.id));

        // Update song request status
        await db
          .update(songRequestsTable)
          .set({ status: 'completed' })
          .where(eq(songRequestsTable.id, targetSong.song_request_id));

        console.log(`Song ${targetSong.id} completed with all variants`);
      } else {
        // Update variants but keep song as processing
        await db
          .update(songsTable)
          .set({ suno_variants: updatedVariants })
          .where(eq(songsTable.id, targetSong.id));

        console.log(`Updated variant for song ${targetSong.id}, still processing`);
      }
    } else {
      // Handle primary task ID completion
      const song = songs[0];

      if (status === 'SUCCESS') {
        await db
          .update(songsTable)
          .set({
            status: 'ready',
            song_url: data?.audioUrl || data?.streamAudioUrl,
            duration: data?.duration
          })
          .where(eq(songsTable.id, song.id));

        await db
          .update(songRequestsTable)
          .set({ status: 'completed' })
          .where(eq(songRequestsTable.id, song.song_request_id));

        console.log(`Song ${song.id} completed`);
      } else {
        await db
          .update(songsTable)
          .set({ status: 'failed' })
          .where(eq(songsTable.id, song.id));

        console.log(`Song ${song.id} failed`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Suno webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}