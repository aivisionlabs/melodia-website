/**
 * Refine Lyrics API
 * POST /api/refine-lyrics
 * Modifies existing lyrics based on user feedback
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lyricsDraftsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { refineLyrics, validatePrompt } from '@/lib/services/llm/lyrics-generation-service';
import { withRateLimit } from '@/lib/rate-limiting/middleware';
import { z } from 'zod';

const refineLyricsSchema = z.object({
  lyricsDraftId: z.number(),
  editPrompt: z.string().min(5, 'Please provide editing instructions'),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = refineLyricsSchema.parse(body);

    // Get existing lyrics draft
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

    // Validate prompt for security
    const promptValidation = validatePrompt(validatedData.editPrompt);
    if (!promptValidation.valid) {
      return NextResponse.json(
        { error: promptValidation.error },
        { status: 400 }
      );
    }

    // Refine lyrics
    const refinedLyrics = await refineLyrics(
      draft.generated_text,
      validatedData.editPrompt
    );

    // Get next version number
    const allDrafts = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, draft.song_request_id));

    const nextVersion = Math.max(...allDrafts.map(d => d.version || 1)) + 1;

    // Create new version
    const newDrafts = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: draft.song_request_id,
        version: nextVersion,
        generated_text: refinedLyrics,
        song_title: draft.song_title,
        music_style: draft.music_style,
        language: draft.language,
        llm_model_name: draft.llm_model_name,
        lyrics_edit_prompt: validatedData.editPrompt,
        status: 'draft',
      })
      .returning();

    const newDraft = newDrafts[0];

    return NextResponse.json({
      success: true,
      draft: {
        id: newDraft.id,
        lyrics: newDraft.generated_text,
        title: newDraft.song_title,
        musicStyle: newDraft.music_style,
        version: newDraft.version,
      },
    });
  } catch (error) {
    console.error('Refine lyrics error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to refine lyrics. Please try again.' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit('song.generate_lyrics', handler);

