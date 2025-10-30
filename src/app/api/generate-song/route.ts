/**
 * Generate Song API
 * POST /api/generate-song
 * Generates the actual song using Suno API
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { userSongsTable, lyricsDraftsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateSong } from '@/lib/suno-api';
import { withRateLimit } from '@/lib/rate-limiting/middleware';
import { z } from 'zod';

const generateSongSchema = z.object({
  lyricsDraftId: z.number(),
  songRequestId: z.number(),
});

function generateSlug(title: string, requestId: number): string {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return `${baseSlug}-${requestId}-${Date.now()}`;
}

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generateSongSchema.parse(body);

    // Get lyrics draft
    const drafts = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.id, validatedData.lyricsDraftId))
      .limit(1);

    if (drafts.length === 0) {
      return NextResponse.json(
        { error: 'Lyrics draft not found' },
        { status: 404 }
      );
    }

    const draft = drafts[0];

    // Check if lyrics are approved
    if (draft.status !== 'approved') {
      return NextResponse.json(
        { error: 'Please approve the lyrics first' },
        { status: 400 }
      );
    }

    // Check if song already exists for this request
    const existingSongs = await db
      .select()
      .from(userSongsTable)
      .where(eq(userSongsTable.song_request_id, validatedData.songRequestId))
      .limit(1);

    if (existingSongs.length > 0) {
      return NextResponse.json(
        {
          error: 'Song already generated for this request',
          songId: existingSongs[0].id,
          slug: existingSongs[0].slug,
        },
        { status: 400 }
      );
    }

    // Generate callback URL for webhook
    const callbackUrl = process.env.NODE_ENV === 'production'
      ? `${process.env.NEXTAUTH_URL}/api/suno-webhook`
      : undefined;

    // Call Suno API
    const sunoResult = await generateSong({
      title: draft.song_title || 'Untitled Song',
      prompt: draft.generated_text,
      style: draft.music_style || 'Pop',
      callBackUrl: callbackUrl || '',
    });

    // Create user song record
    const slug = generateSlug(draft.song_title || 'song', validatedData.songRequestId);

    const newSongs = await db
      .insert(userSongsTable)
      .values({
        song_request_id: validatedData.songRequestId,
        slug,
        status: 'processing',
        approved_lyrics_id: validatedData.lyricsDraftId,
        song_variants: {
          [sunoResult.taskId]: {
            taskId: sunoResult.taskId,
            status: sunoResult.status,
            title: draft.song_title,
            style: draft.music_style,
          },
        },
        metadata: {
          sunoTaskId: sunoResult.taskId,
          estimatedTime: sunoResult.estimatedTime,
        },
      })
      .returning();

    const newSong = newSongs[0];

    // Update song request status
    await db
      .update(songRequestsTable)
      .set({ status: 'processing' })
      .where(eq(songRequestsTable.id, validatedData.songRequestId));

    return NextResponse.json({
      success: true,
      songId: newSong.id,
      slug: newSong.slug,
      taskId: sunoResult.taskId,
      estimatedTime: sunoResult.estimatedTime,
      message: 'Song generation started successfully!',
    });
  } catch (error) {
    console.error('Generate song error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to start song generation. Please try again.' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit('song.generate', handler);

