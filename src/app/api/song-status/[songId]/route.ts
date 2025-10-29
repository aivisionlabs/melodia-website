/**
 * Song Status API
 * GET /api/song-status/[songId]
 * Checks the generation status of a song
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSongsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getSongStatus } from '@/lib/suno-api';
import { sendSongReadyNotification } from '@/lib/services/email-service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId: songIdParam } = await params;
    const songId = parseInt(songIdParam);

    if (isNaN(songId)) {
      return NextResponse.json(
        { error: 'Invalid song ID' },
        { status: 400 }
      );
    }

    // Get song record
    const songs = await db
      .select()
      .from(userSongsTable)
      .where(eq(userSongsTable.id, songId))
      .limit(1);

    if (songs.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    const song = songs[0];

    // If already completed or failed, return current status
    if (song.status === 'completed' || song.status === 'failed') {
      return NextResponse.json({
        status: song.status,
        songVariants: song.song_variants,
        slug: song.slug,
      });
    }

    // Get taskId from metadata
    const taskId = (song.metadata as any)?.sunoTaskId;
    if (!taskId) {
      return NextResponse.json(
        { error: 'No task ID found' },
        { status: 400 }
      );
    }

    // Check Suno API status
    const sunoStatus = await getSongStatus(taskId);

    // Update database based on status
    if (sunoStatus.status === 'completed' && sunoStatus.songs) {
      // Process completed songs
      const variants: Record<string, any> = {};
      const timestampedLyrics: Record<number, any> = {};

      sunoStatus.songs.forEach((song, index) => {
        variants[index] = {
          id: song.id,
          audioUrl: song.audioUrl,
          imageUrl: song.imageUrl,
          duration: song.duration,
        };

        if (song.timestampedLyrics) {
          timestampedLyrics[index] = song.timestampedLyrics;
        }
      });

      await db
        .update(userSongsTable)
        .set({
          status: 'completed',
          song_variants: variants,
          variant_timestamp_lyrics_api_response: timestampedLyrics,
          selected_variant: 0, // Default to first variant
        })
        .where(eq(userSongsTable.id, songId));

      // Update song request status
      await db
        .update(songRequestsTable)
        .set({ status: 'completed' })
        .where(eq(songRequestsTable.id, song.song_request_id));

      // Send notification email
      const songRequest = await db
        .select()
        .from(songRequestsTable)
        .where(eq(songRequestsTable.id, song.song_request_id))
        .limit(1);

      if (songRequest.length > 0 && songRequest[0].email) {
        await sendSongReadyNotification(
          songRequest[0].email,
          songRequest[0].requester_name ?? undefined,
          (song.metadata as any)?.title || 'Your Song',
          song.slug
        );
      }

      return NextResponse.json({
        status: 'completed',
        songVariants: variants,
        slug: song.slug,
      });
    } else if (sunoStatus.status === 'failed') {
      // Mark as failed
      await db
        .update(userSongsTable)
        .set({
          status: 'failed',
          metadata: {
            ...(song.metadata as any),
            error: sunoStatus.error,
          },
        })
        .where(eq(userSongsTable.id, songId));

      await db
        .update(songRequestsTable)
        .set({ status: 'failed' })
        .where(eq(songRequestsTable.id, song.song_request_id));

      return NextResponse.json({
        status: 'failed',
        error: sunoStatus.error,
      });
    }

    // Still processing
    return NextResponse.json({
      status: 'processing',
      message: 'Song is still being generated',
    });
  } catch (error) {
    console.error('Song status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check song status' },
      { status: 500 }
    );
  }
}

