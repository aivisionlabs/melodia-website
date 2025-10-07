import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { convertAlignedWordsToLyricLines } from '@/lib/utils';
import { getUserContextFromRequest } from '@/lib/middleware-utils';
import { sanitizeAnonymousUserId } from '@/lib/utils/validation';

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

