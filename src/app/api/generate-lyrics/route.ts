import { NextRequest, NextResponse } from 'next/server';
import { generateLyrics } from '@/lib/llm-integration';
import { db } from '@/lib/db';
import { songRequestsTable, paymentsTable, lyricsDraftsTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/user-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipient_name, languages, song_story, requestId, userId, requester_name, mood, recipient_relationship } = body;

    // Validate required fields
    if (!recipient_name || !languages || languages.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Recipient name and languages are required' },
        { status: 400 }
      );
    }

    // Check payment status if requestId is provided
    if (requestId) {
      // Get user ID from request body or try authentication
      let currentUser = null;

      if (userId) {
        // Use provided userId
        currentUser = { id: userId } as any;
      } else {
        // Try to get from authentication, but allow anonymous users
        currentUser = await getCurrentUser();
        if (!currentUser) {
          // Allow anonymous users for create-song-v2 flow
          currentUser = { id: null } as any;
        }
      }

      // Get song request
      const songRequest = await db
        .select()
        .from(songRequestsTable)
        .where(eq(songRequestsTable.id, requestId))
        .limit(1);

      if (songRequest.length === 0) {
        return NextResponse.json(
          { error: true, message: 'Song request not found' },
          { status: 404 }
        );
      }

      // Allow access if user_id matches or if both are null (anonymous users)
      if (songRequest[0].user_id !== currentUser.id && !(songRequest[0].user_id === null && currentUser.id === null)) {
        return NextResponse.json(
          { error: true, message: 'Unauthorized access' },
          { status: 403 }
        );
      }

      // Check payment status only if payment is required (skip for anonymous users)

    }

    // Generate lyrics using Gemini API
    const result = await generateLyrics({
      recipient_name,
      recipient_relationship,
      languages,
      song_story: song_story || '',
      mood,
      requester_name: requester_name || 'Anonymous',
    });

    if (result.error) {
      return NextResponse.json(
        {
          error: true,
          message: result.message || 'Failed to generate lyrics',
          example: result.example
        },
        { status: 503 }
      );
    }

    // Store lyrics in database if requestId is provided
    if (requestId) {
      try {
        // Get the latest version number for this request
        const latestDraft = await db
          .select({ version: lyricsDraftsTable.version })
          .from(lyricsDraftsTable)
          .where(eq(lyricsDraftsTable.song_request_id, requestId))
          .orderBy(desc(lyricsDraftsTable.version))
          .limit(1);

        const newVersion = latestDraft[0] ? latestDraft[0].version + 1 : 1;

        // Save lyrics draft
        const [draft] = await db
          .insert(lyricsDraftsTable)
          .values({
            song_request_id: requestId,
            version: newVersion,
            language: languages,
            generated_text: result.lyrics || '',
            status: 'draft'
          })
          .returning();

        // Update lyrics draft status (lyrics_status moved to lyrics_drafts table)
        if (draft) {
          await db
            .update(lyricsDraftsTable)
            .set({ status: 'needs_review' })
            .where(eq(lyricsDraftsTable.id, draft.id));
        }

        return NextResponse.json({
          success: true,
          lyrics: result.lyrics,
          draft: draft
        });
      } catch (dbError) {
        console.error('Error storing lyrics in database:', dbError);
        // Still return the lyrics even if database storage fails
        return NextResponse.json({
          success: true,
          lyrics: result.lyrics,
          warning: 'Lyrics generated but not saved to database'
        });
      }
    }

    return NextResponse.json({
      success: true,
      lyrics: result.lyrics
    });

  } catch (error) {
    console.error('Error generating lyrics:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to generate lyrics. Please try again.' },
      { status: 500 }
    );
  }
}