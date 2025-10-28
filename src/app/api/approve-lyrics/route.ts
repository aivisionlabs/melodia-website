/**
 * Approve Lyrics API
 * POST /api/approve-lyrics
 * Marks lyrics as approved and ready for song generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lyricsDraftsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const approveLyricsSchema = z.object({
  lyricsDraftId: z.number(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = approveLyricsSchema.parse(body);

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

    // Mark lyrics as approved
    await db
      .update(lyricsDraftsTable)
      .set({ status: 'approved' })
      .where(eq(lyricsDraftsTable.id, validatedData.lyricsDraftId));

    // Archive other drafts for this request
    await db
      .update(lyricsDraftsTable)
      .set({ status: 'archived' })
      .where(
        eq(lyricsDraftsTable.song_request_id, draft.song_request_id)
      );

    // Restore approved status
    await db
      .update(lyricsDraftsTable)
      .set({ status: 'approved' })
      .where(eq(lyricsDraftsTable.id, validatedData.lyricsDraftId));

    return NextResponse.json({
      success: true,
      message: 'Lyrics approved successfully',
    });
  } catch (error) {
    console.error('Approve lyrics error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to approve lyrics' },
      { status: 500 }
    );
  }
}

