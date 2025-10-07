import { NextRequest, NextResponse } from 'next/server';
import { generateLyrics } from '@/lib/services/llm/llm-lyrics-opearation';
import { db } from '@/lib/db';
import { lyricsDraftsTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { requestId, recipientDetails, languages, occassion, songStory, mood, userId, anonymousUserId } = await request.json();

    if (!requestId || !recipientDetails || !languages) {
      return NextResponse.json(
        { error: true, message: 'Missing required fields: requestId, recipient_details, languages' },
        { status: 400 }
      );
    }

    let generatedResponse;

    // Get the LLM model name from environment or use default
    const llmModelName = process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.5-flash';

    // Demo mode - use mock lyrics instead of real API
    if (process.env.DEMO_MODE === 'true') {
      console.log('🎭 DEMO MODE: Using mock lyrics instead of Gemini API');
      generatedResponse = {
        title: `Demo Song for ${recipientDetails}`,
        musicStyle: 'Temp Music Style',
        lyrics: `Demo lyrics for ${recipientDetails}:\n\nVerse 1:\nThis is a demo song\nCreated just for you\nWith love and care\nAnd friendship true\n\nChorus:\nHappy birthday to you\nMay all your dreams come true\nThis special day is yours\nThrough and through\n\nVerse 2:\nMemories we've shared\nWill always remain\nIn our hearts forever\nThrough joy and pain\n\nChorus:\nHappy birthday to you\nMay all your dreams come true\nThis special day is yours\nThrough and through\n\nOutro:\nSo here's to you, ${recipientDetails}\nOn this wonderful day\nMay happiness and joy\nAlways come your way`
      };
    } else {
      // Try to generate lyrics using the existing LLM integration
      try {
        generatedResponse = await generateLyrics({
          recipientDetails,
          occassion,
          languages,
          songStory,
          mood: mood || []
        });
      } catch (apiError) {
        console.error('Gemini API failed:', apiError);
        // Return proper error instead of fake lyrics
        return NextResponse.json(
          {
            error: true,
            message: 'Lyrics generation service is temporarily unavailable. Please try again in a few minutes.',
            details: 'The AI service is currently experiencing issues. We apologize for the inconvenience.'
          },
          { status: 503 }
        );
      }
    }

    // Get the latest version number for this request
    const latestDraft = await db
      .select({ version: lyricsDraftsTable.version })
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, requestId))
      .orderBy(desc(lyricsDraftsTable.version))
      .limit(1);

    const newVersion = latestDraft[0] ? latestDraft[0].version + 1 : 1;

    // Save lyrics draft to database
    const [draft] = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: requestId,
        version: newVersion,
        lyrics_edit_prompt: null,
        generated_text: generatedResponse.lyrics || '',
        song_title: generatedResponse.title,
        music_style: generatedResponse.musicStyle,
        llm_model_name: llmModelName,
        status: 'draft',
        created_by_user_id: userId || null,
        created_by_anonymous_user_id: anonymousUserId || null
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
      title: generatedResponse.title,
      styleOfMusic: generatedResponse.musicStyle,
      lyrics: generatedResponse.lyrics || '',
      draftId: draft.id,
      requestId: requestId
    });

  } catch (error) {
    console.error('Error in generate-lyrics API:', error);
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to generate lyrics. Please try again.'
      },
      { status: 500 }
    );
  }
}
