import { NextRequest, NextResponse } from 'next/server';
import { generateLyrics } from '@/lib/llm-integration';
import { db } from '@/lib/db';
import { lyricsDraftsTable, songRequestsTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { requestId, recipient_name, languages, additional_details, demoMode } = await request.json();

    if (!requestId || !recipient_name || !languages) {
      return NextResponse.json(
        { error: true, message: 'Missing required fields: requestId, recipient_name, languages' },
        { status: 400 }
      );
    }

    let generatedResponse;

    // Demo mode - use mock lyrics instead of real API
    if (demoMode) {
      console.log('🎭 DEMO MODE: Using mock lyrics instead of Gemini API');
      generatedResponse = {
        title: `Demo Song for ${recipient_name}`,
        styleOfMusic: 'Personal',
        lyrics: `Demo lyrics for ${recipient_name}:\n\nVerse 1:\nThis is a demo song\nCreated just for you\nWith love and care\nAnd friendship true\n\nChorus:\nHappy birthday to you\nMay all your dreams come true\nThis special day is yours\nThrough and through\n\nVerse 2:\nMemories we've shared\nWill always remain\nIn our hearts forever\nThrough joy and pain\n\nChorus:\nHappy birthday to you\nMay all your dreams come true\nThis special day is yours\nThrough and through\n\nOutro:\nSo here's to you, ${recipient_name}\nOn this wonderful day\nMay happiness and joy\nAlways come your way`,
        error: false
      };
    } else {
      // Try to generate lyrics using the existing LLM integration
      try {
        generatedResponse = await generateLyrics({
          recipient_name,
          languages,
          additional_details
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

    if (generatedResponse.error) {
      return NextResponse.json(
        { error: true, message: generatedResponse.message || 'Failed to generate lyrics' },
        { status: 500 }
      );
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
        language: languages,
        structure: null,
        prompt_input: { 
          recipient_name, 
          languages, 
          additional_details,
          refineText: null 
        },
        generated_text: generatedResponse.lyrics || '',
        status: 'draft'
      })
      .returning();

    // Update song request status
    await db
      .update(songRequestsTable)
      .set({ lyrics_status: 'needs_review' })
      .where(eq(songRequestsTable.id, requestId));

    return NextResponse.json({
      success: true,
      title: generatedResponse.title || `Song for ${recipient_name}`,
      styleOfMusic: generatedResponse.styleOfMusic || 'Personal',
      lyrics: generatedResponse.lyrics || '',
      draftId: draft.id,
      requestId: requestId
    });

  } catch (error) {
    console.error('Error in generate-lyrics-with-storage API:', error);
    return NextResponse.json(
      {
        error: true,
        message: 'Failed to generate lyrics. Please try again.'
      },
      { status: 500 }
    );
  }
}
