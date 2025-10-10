import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable, songRequestsTable, lyricsDraftsTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import { convertAlignedWordsToLyricLines } from '@/lib/utils';
import { getUserContextFromRequest } from '@/lib/middleware-utils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Song slug is required' },
        { status: 400 }
      );
    }

    // Get user context from middleware - this is the ONLY source of truth
    const userContext = getUserContextFromRequest(request);

    // Validate that we have proper user context
    if (!userContext.userId && !userContext.anonymousUserId) {
      return NextResponse.json(
        { error: 'Authentication required. Please log in or ensure you have an active session.' },
        { status: 401 }
      );
    }

    const userId = userContext.userId;
    const anonymousUserId = userContext.anonymousUserId;

    // Fetch song with song request data to check ownership
    const songsWithRequest = await db
      .select({
        song: songsTable,
        songRequest: songRequestsTable,
      })
      .from(songsTable)
      .innerJoin(songRequestsTable, eq(songsTable.song_request_id, songRequestsTable.id))
      .where(eq(songsTable.slug, slug))
      .limit(1);

    if (!songsWithRequest || songsWithRequest.length === 0) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    const { song, songRequest } = songsWithRequest[0];

    // Check if song is deleted
    if (song.is_deleted) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      );
    }

    // Access control: Check ownership or public access
    const isPublic = song.add_to_library === true;
    let hasAccess = false;

    if (isPublic) {
      // Public songs are accessible to everyone
      hasAccess = true;
    } else {
      // Private songs require ownership verification
      if (userId && songRequest.user_id === userId) {
        // Registered user owns this song
        hasAccess = true;
      } else if (anonymousUserId && songRequest.anonymous_user_id === anonymousUserId) {
        // Anonymous user owns this song
        hasAccess = true;
      }
    }

    if (!hasAccess) {
      return NextResponse.json(
        {
          error: 'This song is private',
          requiresAuth: true,
          isPublic: false,
        },
        { status: 403 }
      );
    }

    // Get the selected variant (default to 0)
    const selectedVariant = song.selected_variant ?? 0;

    // Get variant data
    const variants = song.song_variants as any;
    const variantData = variants?.[selectedVariant] || variants?.[0] || null;

    // Get language and raw lyrics from lyrics_drafts table
    let language = 'English'; // Default fallback
    let rawLyricsText = ''; // Raw lyrics text for non-English songs
    try {
      const lyricsDraft = await db
        .select({ language: lyricsDraftsTable.language, generated_text: lyricsDraftsTable.generated_text })
        .from(lyricsDraftsTable)
        .where(eq(lyricsDraftsTable.song_request_id, song.song_request_id))
        .orderBy(desc(lyricsDraftsTable.version))
        .limit(1);

      if (lyricsDraft[0]) {
        language = lyricsDraft[0].language || 'English';
        rawLyricsText = lyricsDraft[0].generated_text || '';
      }
    } catch (error) {
      console.warn('Could not fetch language from lyrics_drafts:', error);
    }

    // Get timestamped lyrics for the selected variant
    const timestampLyrics = song.variant_timestamp_lyrics_processed as any;
    const rawLyrics = timestampLyrics?.[selectedVariant] || timestampLyrics?.[0] || [];

    // Convert aligned words to lyric lines format
    let lyrics = [];
    if (rawLyrics && rawLyrics.length > 0) {
      // Check if the data is in AlignedWord format or already LyricLine format
      const firstItem = rawLyrics[0];
      if (firstItem && firstItem.word && firstItem.startS !== undefined) {
        // Convert AlignedWord format to LyricLine format
        lyrics = convertAlignedWordsToLyricLines(rawLyrics);
      } else if (firstItem && firstItem.text && firstItem.start !== undefined) {
        // Already in LyricLine format
        lyrics = rawLyrics;
      }
    }

    // Fallback: If no timestamped lyrics, use lyrics from lyrics_drafts table
    if (lyrics.length === 0) {
      const { lyricsDraftsTable } = await import('@/lib/db/schema');
      const { desc } = await import('drizzle-orm');
      
      const lyricsDrafts = await db
        .select({
          generated_text: lyricsDraftsTable.generated_text,
        })
        .from(lyricsDraftsTable)
        .where(eq(lyricsDraftsTable.song_request_id, song.song_request_id))
        .orderBy(desc(lyricsDraftsTable.version), desc(lyricsDraftsTable.created_at))
        .limit(1);

      if (lyricsDrafts.length > 0 && lyricsDrafts[0].generated_text) {
        // Convert plain text lyrics to timed lyrics format
        const lyricsText = lyricsDrafts[0].generated_text;
        const lines = lyricsText.split('\n').filter(line => line.trim().length > 0);
        const songDurationMs = 180000; // Default 3 minutes for demo
        const lineDuration = songDurationMs / lines.length;

        lyrics = lines.map((line, index) => ({
          index,
          text: line.trim(),
          start: index * lineDuration,
          end: (index + 1) * lineDuration,
        }));
      } else {
        // Demo mode fallback: Create dummy lyrics for testing
        const dummyLyrics = [
          "Verse 1",
          "",
          "The first time I saw your face",
          "You smiled and lit up the whole place",
          "A tiny hand in mine to hold",
          "A story waiting to unfold",
          "",
          "Chorus",
          "",
          "You're my sunshine on a cloudy day",
          "You chase all of the blues away",
          "My little star, you shine so bright",
          "Filling my world with pure delight",
          "",
          "Verse 2",
          "",
          "Every laugh and every tear",
          "Makes my love for you more clear",
          "Growing up so fast it seems",
          "Living all your wildest dreams",
          "",
          "Chorus",
          "",
          "You're my sunshine on a cloudy day",
          "You chase all of the blues away",
          "My little star, you shine so bright",
          "Filling my world with pure delight",
          "",
          "Bridge",
          "",
          "No matter where life takes you",
          "Remember that I love you",
          "Forever and always",
          "Through all of your days"
        ];

        const songDurationMs = 180000; // 3 minutes
        const lineDuration = songDurationMs / dummyLyrics.length;

        lyrics = dummyLyrics.map((line, index) => ({
          index,
          text: line,
          start: index * lineDuration,
          end: (index + 1) * lineDuration,
        }));
      }
    }

    // Get audio URL from variant
    const audioUrl = variantData?.audioUrl || variantData?.sourceStreamAudioUrl || variantData?.streamAudioUrl || null;
    const imageUrl = variantData?.imageUrl || null;

    // Get song title from metadata or variant
    let songTitle = 'Untitled Song';
    if (song.metadata) {
      const metadata = song.metadata as any;
      songTitle = metadata?.title || variantData?.title || 'Untitled Song';
    } else if (variantData?.title) {
      songTitle = variantData.title;
    }

    // Prepare response
    const response = {
      id: song.id,
      slug: song.slug,
      title: songTitle,
      lyrics,
      rawLyricsText, // Raw lyrics text for non-English songs
      language, // Language of the lyrics
      audioUrl,
      imageUrl,
      selectedVariant,
      isPublic,
      canDownload: isPublic, // Can download if public
      status: song.status,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching song lyrics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

