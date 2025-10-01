import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { SongDatabaseUpdateService } from '@/lib/services/song-database-update-service';

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
        if (song.song_variants && Array.isArray(song.song_variants)) {
          const variant = song.song_variants.find((v: any) => v.id === taskId);
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

      // Use the new database update service
      const updateResult = await SongDatabaseUpdateService.updateDatabaseFromSunoResponse(
        targetSong.id,
        {
          status: status,
          response: { sunoData: data?.variants || [] },
          errorMessage: status === 'FAILED' ? data?.errorMessage : null
        }
      );

      console.log(`Updated song ${targetSong.id} via webhook:`, updateResult);
    } else {
      // Handle primary task ID completion
      const song = songs[0];

      // Use the new database update service
      const updateResult = await SongDatabaseUpdateService.updateDatabaseFromSunoResponse(
        song.id,
        {
          status: status,
          response: { sunoData: data?.variants || [] },
          errorMessage: status === 'FAILED' ? data?.errorMessage : null
        }
      );

      console.log(`Updated song ${song.id} via webhook:`, updateResult);
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