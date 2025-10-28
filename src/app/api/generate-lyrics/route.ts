/**
 * Generate Lyrics API
 * POST /api/generate-lyrics
 * Generates song lyrics using AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lyricsDraftsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { generateLyrics, validatePrompt } from '@/lib/services/llm/lyrics-generation-service';
import { withRateLimit } from '@/lib/rate-limiting/middleware';
import { z } from 'zod';

const generateLyricsSchema = z.object({
  songRequestId: z.number(),
  language: z.string().optional(),
  refineText: z.string().optional(),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = generateLyricsSchema.parse(body);

    // Get song request
    const requests = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, validatedData.songRequestId))
      .limit(1);

    if (requests.length === 0) {
      return NextResponse.json(
        { error: 'Song request not found' },
        { status: 404 }
      );
    }

    const request = requests[0];

    // Validate prompt for security
    const promptValidation = validatePrompt(
      `${request.recipient_details} ${request.song_story || ''} ${validatedData.refineText || ''}`
    );

    if (!promptValidation.valid) {
      return NextResponse.json(
        { error: promptValidation.error },
        { status: 400 }
      );
    }

    // Parse recipient details
    const recipientParts = request.recipient_details.split(',');
    const recipientName = recipientParts[0]?.trim() || 'loved one';
    const relationship = recipientParts[1]?.trim() || '';

    // Generate lyrics
    const result = await generateLyrics({
      recipientName,
      relationship,
      occasion: request.occasion || '',
      languages: request.languages.split(',').map(l => l.trim()),
      mood: request.mood || [],
      story: request.song_story || '',
      additionalDetails: validatedData.refineText,
    });

    // Get current version number
    const existingDrafts = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, validatedData.songRequestId));

    const nextVersion = existingDrafts.length + 1;

    // Save lyrics draft
    const newDrafts = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: validatedData.songRequestId,
        version: nextVersion,
        generated_text: result.lyrics,
        song_title: result.title,
        music_style: result.musicStyle,
        language: result.language,
        llm_model_name: result.modelName,
        lyrics_edit_prompt: validatedData.refineText,
        status: 'draft',
      })
      .returning();

    const newDraft = newDrafts[0];

    // Update song request status
    await db
      .update(songRequestsTable)
      .set({ status: 'processing' })
      .where(eq(songRequestsTable.id, validatedData.songRequestId));

    return NextResponse.json({
      success: true,
      draft: {
        id: newDraft.id,
        lyrics: newDraft.generated_text,
        title: newDraft.song_title,
        musicStyle: newDraft.music_style,
        language: newDraft.language,
        version: newDraft.version,
      },
    });
  } catch (error) {
    console.error('Generate lyrics error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate lyrics. Please try again.' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit('song.generate_lyrics', handler);

