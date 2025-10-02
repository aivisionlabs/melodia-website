import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lyricsDraftsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, lyrics, userId, anonymous_user_id } = body;

    // Validate required fields
    if (!requestId || !lyrics) {
      return NextResponse.json(
        { error: true, message: 'Request ID and lyrics are required' },
        { status: 400 }
      );
    }

    // Store lyrics in lyrics_drafts table
    const [newLyricsDraft] = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: requestId,
        version: 1,
        generated_text: lyrics,
        song_title: null, // No title for manually stored lyrics
        music_style: 'Personal', // Default value for manually stored lyrics
        status: 'draft',
        created_by_user_id: userId || null,
        created_by_anonymous_user_id: anonymous_user_id || null
      })
      .returning({
        id: lyricsDraftsTable.id
      });

    if (!newLyricsDraft) {
      return NextResponse.json(
        { error: true, message: 'Failed to store lyrics' },
        { status: 500 }
      );
    }

    // Update song request status to indicate lyrics are ready
    await db
      .update(songRequestsTable)
      .set({
        updated_at: new Date()
      })
      .where(eq(songRequestsTable.id, requestId));

    return NextResponse.json({
      success: true,
      lyricsDraftId: newLyricsDraft.id
    });

  } catch (error) {
    console.error('Error storing lyrics:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to store lyrics. Please try again.' },
      { status: 500 }
    );
  }
}
