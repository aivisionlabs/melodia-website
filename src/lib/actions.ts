'use server'

import { Song, PublicSong, AlignedWord } from '@/types';
import { createSong, incrementSongPlay, incrementSongView, updateSongStatus, validateAdminCredentials } from './db/services';
import { createServerSupabaseClient } from './supabase';
import { unstable_cache } from 'next/cache';


// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 100 // requests per window

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(ip)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX) {
    return false
  }

  userLimit.count++
  return true
}

// Input validation
function validateSongId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return /^\d+$/.test(id)
}

function sanitizeSearchQuery(query: string): string {
  return query.trim().toLowerCase().slice(0, 50)
}


// Song creation action with Suno integration
export async function createSongAction(formData: FormData) {
  try {
    const title = formData.get('title') as string;
    const lyrics = formData.get('lyrics') as string;
    const music_style = formData.get('music_style') as string;
    const categories = formData.get('categories') as string;
    const tags = formData.get('tags') as string;
    const negativeTags = formData.get('negativeTags') as string;


    if (!title || !lyrics || !music_style) {
      console.error('Missing required fields');
      return {
        success: false,
        error: 'Please fill in all required fields (title, lyrics, and music style)'
      };
    }

    // Create song in database
    const songData: any = {
      title,
      lyrics,
      music_style,
      categories: categories ? categories.split(',').map(c => c.trim()) : [],
      tags: tags ? tags.split(',').map(t => t.trim()) : [],
      negative_tags: negativeTags,
      prompt: lyrics,
    };

    const songResult = await createSong(songData);

    if (!songResult.success) {
      console.error('Failed to create song:', songResult.error);
      return {
        success: false,
        error: songResult.error || 'Failed to create song in database'
      };
    }

    // Update status to pending
    await updateSongStatus(songResult.songId!, 'pending');

    // Call Suno API to generate song
    const { SunoAPIFactory } = await import('@/lib/suno-api');
    const sunoAPI = SunoAPIFactory.getAPI();

    const generateRequest = {
      prompt: lyrics,
      style: music_style,
      title: title,
      customMode: true,
      instrumental: false,
      model: "V5",
      negativeTags: negativeTags || undefined,
      callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/suno-webhook`
    };

    try {
      const sunoResponse = await sunoAPI.generateSong(generateRequest);

      if (sunoResponse.code === 200) {
        // Update song with task ID
        const updateResult = await updateSongStatus(
          songResult.songId!,
          'generating',
          undefined,
          sunoResponse.data.taskId
        );

        if (!updateResult.success) {
          console.error('Failed to update song with task ID:', updateResult.error);
          // Still redirect but log the error
        }

        // Small delay to ensure database transaction is committed
        await new Promise(resolve => setTimeout(resolve, 100));

        // Redirect to progress page
        return {
          success: true,
          taskId: sunoResponse.data.taskId,
          redirect: `/song-admin-portal/generate/${sunoResponse.data.taskId}`
        };
      } else {
        throw new Error(`Suno API error: ${sunoResponse.msg}`);
      }
    } catch (sunoError) {
      console.error('Suno API error:', sunoError);
      await updateSongStatus(songResult.songId!, 'failed');

      const detailedMessage =
        sunoError instanceof Error
          ? sunoError.message
          : typeof sunoError === 'string'
            ? sunoError
            : (sunoError as any)?.message || 'Failed to start song generation';

      return {
        success: false,
        error: detailedMessage,
      };
    }

  } catch (error) {
    console.error('Error in createSongAction:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Analytics tracking actions
export async function trackSongView(songId: number) {
  try {
    await incrementSongView(songId);
  } catch (error) {
    console.error('Error tracking song view:', error);
  }
}

export async function trackSongPlay(songId: number) {
  try {
    await incrementSongPlay(songId);
  } catch (error) {
    console.error('Error tracking song play:', error);
  }
}

// Admin authentication action
export async function authenticateAdmin(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    const result = await validateAdminCredentials(username, password);
    return result;
  } catch (error) {
    console.error('Error in authenticateAdmin:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getSongByTaskIdAction(taskId: string) {
  try {
    const { getSongByTaskId } = await import('@/lib/db/services');
    const song = await getSongByTaskId(taskId);
    return { success: true, song };
  } catch (error) {
    console.error('Error in getSongByTaskIdAction:', error);
    return { success: false, error: 'Failed to get song by task ID' };
  }
}

export async function getActiveSongsAction(limit: number = 20, offset: number = 0): Promise<
  | { success: true; songs: Song[]; total: number; hasMore: boolean }
  | { success: false; error: string; songs: Song[]; total: number; hasMore: boolean }
> {
  try {
    const cachedResult = await unstable_cache(
      async () => {
        const { getAllSongsPaginated } = await import('@/lib/db/queries/select');
        const { songs: dbSongs, total } = await getAllSongsPaginated(limit, offset);

        // Transform database songs to match Song type (optimized - no heavy fields)
        const songs: Song[] = dbSongs.map(song => ({
          id: song.id,
          created_at: song.created_at.toISOString(),
          title: song.title,
          lyrics: null, // Not loaded for library view
          song_description: song.song_description ?? null,
          timestamp_lyrics: null, // Not loaded for library view
          timestamped_lyrics_variants: null, // Not loaded for library view
          timestamped_lyrics_api_responses: null, // Not loaded for library view
          music_style: song.music_style ?? null,
          service_provider: song.service_provider ?? null,
          song_requester: null, // Not needed for library view
          prompt: null, // Not needed for library view
          song_url: song.song_url ?? null,
          duration: song.duration ?? null,
          slug: song.slug,
          add_to_library: song.add_to_library ?? undefined,
          is_deleted: song.is_deleted ?? undefined,
          status: song.status ?? undefined,
          categories: song.categories ?? undefined,
          tags: song.tags ?? undefined,
          suno_task_id: undefined, // Not exposed in library
          negative_tags: undefined, // Not needed for library view
          suno_variants: song.suno_variants as any,
          selected_variant: song.selected_variant ?? undefined,
          metadata: undefined, // Not needed for library view
          sequence: song.sequence ?? undefined,
          show_lyrics: song.show_lyrics ?? true,
          likes_count: (song as any).likes_count ?? 0,
        }));

        const hasMore = offset + songs.length < total;
        return { songs, total, hasMore };
      },
      [`songs-all-${limit}-${offset}`],
      {
        tags: ['songs', 'library'],
        revalidate: 60, // 1 minute
      }
    )();

    return { success: true, ...cachedResult };
  } catch (error) {
    console.error('Error in getActiveSongsAction:', error);
    return { success: false, error: 'Failed to get active songs', songs: [], total: 0, hasMore: false };
  }
}

// Server-side: get songs by category slug with pagination and caching
export async function getSongsByCategoryAction(categorySlug: string | null, limit: number = 20, offset: number = 0): Promise<
  | { success: true; songs: Song[]; total: number; hasMore: boolean }
  | { success: false; error: string; songs: Song[]; total: number; hasMore: boolean }
> {
  try {
    const cachedResult = await unstable_cache(
      async () => {
        const { getSongsByCategorySlugPaginated } = await import('@/lib/db/queries/select');
        const { songs: dbSongs, total } = await getSongsByCategorySlugPaginated(categorySlug, limit, offset);

        // Transform database songs to match Song type (optimized - no heavy fields)
        const songs: Song[] = dbSongs.map(song => ({
          id: song.id,
          created_at: song.created_at.toISOString(),
          title: song.title,
          lyrics: null, // Not loaded for library view
          song_description: song.song_description ?? null,
          timestamp_lyrics: null, // Not loaded for library view
          timestamped_lyrics_variants: null, // Not loaded for library view
          timestamped_lyrics_api_responses: null, // Not loaded for library view
          music_style: song.music_style ?? null,
          service_provider: song.service_provider ?? null,
          song_requester: null, // Not needed for library view
          prompt: null, // Not needed for library view
          song_url: song.song_url ?? null,
          duration: song.duration ?? null,
          slug: song.slug,
          add_to_library: song.add_to_library ?? undefined,
          is_deleted: song.is_deleted ?? undefined,
          status: song.status ?? undefined,
          categories: song.categories ?? undefined,
          tags: song.tags ?? undefined,
          suno_task_id: undefined, // Not exposed in library
          negative_tags: undefined, // Not needed for library view
          suno_variants: song.suno_variants as any,
          selected_variant: song.selected_variant ?? undefined,
          metadata: undefined, // Not needed for library view
          sequence: song.sequence ?? undefined,
          show_lyrics: song.show_lyrics ?? true,
          likes_count: (song as any).likes_count ?? 0,
        }));

        const hasMore = offset + songs.length < total;
        return { songs, total, hasMore };
      },
      [`songs-category-${categorySlug}-${limit}-${offset}`],
      {
        tags: ['songs', 'library'],
        revalidate: 60, // 1 minute
      }
    )();

    return { success: true, ...cachedResult };
  } catch (error) {
    console.error('Error in getSongsByCategoryAction:', error);
    return { success: false, error: 'Failed to get songs for category', songs: [], total: 0, hasMore: false };
  }
}

// Server-side: list categories with counts and caching
export async function getCategoriesWithCountsAction(): Promise<
  | { success: true; categories: Array<{ id: number; name: string; slug: string; sequence: number; count: number }>; total: number }
  | { success: false; error: string; categories: Array<any>; total: number }
> {
  try {
    const { libraryCache, getCacheTTL } = await import('@/lib/cache');
    const cacheKey = libraryCache.getCategoriesKey();

    // Check cache first
    const cached = libraryCache.get<{ categories: Array<{ id: number; name: string; slug: string; sequence: number; count: number }>; total: number }>(cacheKey);
    if (cached) {
      return { success: true, ...cached };
    }

    const { getCategoriesWithCounts, getAllSongsPaginated } = await import('@/lib/db/queries/select');
    const [categories, { total }] = await Promise.all([
      getCategoriesWithCounts(),
      getAllSongsPaginated(1, 0), // Just get count, not actual songs
    ]);

    const result = {
      categories: categories.map(c => ({ ...c, sequence: c.sequence ?? 0 })),
      total
    };

    // Cache the result
    libraryCache.set(cacheKey, result, getCacheTTL('categories'));

    return { success: true, ...result };
  } catch (error) {
    console.error('Error in getCategoriesWithCountsAction:', error);
    return { success: false, error: 'Failed to get categories', categories: [], total: 0 };
  }
}

// Search songs action with pagination and caching
export async function searchSongsAction(query: string, limit: number = 20, offset: number = 0): Promise<
  | { success: true; songs: Song[]; total: number; hasMore: boolean }
  | { success: false; error: string; songs: Song[]; total: number; hasMore: boolean }
> {
  try {
    const { libraryCache, getCacheTTL } = await import('@/lib/cache');
    const cacheKey = libraryCache.getSearchKey(query, limit, offset);

    // Check cache first
    const cached = libraryCache.get<{ songs: Song[]; total: number; hasMore: boolean }>(cacheKey);
    if (cached) {
      return { success: true, ...cached };
    }

    const { searchSongsPaginated } = await import('@/lib/db/queries/select');
    const { songs: dbSongs, total } = await searchSongsPaginated(query, limit, offset);

    // Transform database songs to match Song type (optimized - no heavy fields)
    const songs: Song[] = dbSongs.map(song => ({
      id: song.id,
      created_at: song.created_at.toISOString(),
      title: song.title,
      lyrics: null, // Not loaded for library view
      song_description: song.song_description ?? null,
      timestamp_lyrics: null, // Not loaded for library view
      timestamped_lyrics_variants: null, // Not loaded for library view
      timestamped_lyrics_api_responses: null, // Not loaded for library view
      music_style: song.music_style ?? null,
      service_provider: song.service_provider ?? null,
      song_requester: null, // Not needed for library view
      prompt: null, // Not needed for library view
      song_url: song.song_url ?? null,
      duration: song.duration ?? null,
      slug: song.slug,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: undefined, // Not exposed in library
      negative_tags: undefined, // Not needed for library view
      suno_variants: song.suno_variants as any,
      selected_variant: song.selected_variant ?? undefined,
      metadata: undefined, // Not needed for library view
      sequence: song.sequence ?? undefined,
      show_lyrics: song.show_lyrics ?? true,
      likes_count: (song as any).likes_count ?? 0,
    }));

    const hasMore = offset + songs.length < total;
    const result = { songs, total, hasMore };

    // Cache the result
    libraryCache.set(cacheKey, result, getCacheTTL('search'));

    return { success: true, ...result };
  } catch (error) {
    console.error('Error in searchSongsAction:', error);
    return { success: false, error: 'Failed to search songs', songs: [], total: 0, hasMore: false };
  }
}

// Fuzzy search songs action with intelligent matching
export async function fuzzySearchSongsAction(query: string, limit: number = 50): Promise<
  | { success: true; songs: Song[]; total: number; suggestions?: string[] }
  | { success: false; error: string; songs: Song[]; total: number; suggestions?: string[] }
> {
  try {
    if (!query || query.trim().length < 2) {
      return { success: true, songs: [], total: 0, suggestions: [] };
    }

    const { FuzzySongSearch, songToSearchable, searchableToSong } = await import('@/lib/fuzzy-search');
    const { getAllSongsWithCategoriesForFuzzySearch } = await import('@/lib/db/queries/select');

    // Get all songs with category names for enhanced fuzzy search
    const dbSongs = await getAllSongsWithCategoriesForFuzzySearch();

    // Transform to searchable format
    const searchableSongs = dbSongs.map(song => ({
      id: song.id,
      title: song.title,
      song_description: song.song_description ?? null,
      music_style: song.music_style ?? null,
      service_provider: song.service_provider ?? null,
      categories: song.categories ?? null,
      categoryNames: song.categoryNames ?? null, // NEW: Include category names
      tags: song.tags ?? null,
      slug: song.slug,
    }));

    // Create fuzzy search instance
    const fuzzySearch = new FuzzySongSearch(searchableSongs);

    // Perform fuzzy search
    const searchResults = fuzzySearch.search(query, limit);

    // Get suggestions for autocomplete
    const suggestions = fuzzySearch.getSuggestions(query, 5);

    // Transform results back to Song format
    const songs: Song[] = searchResults.map(result => {
      const dbSong = dbSongs.find(s => s.id === result.item.id);
      if (!dbSong) return null;

      return {
        id: dbSong.id,
        created_at: dbSong.created_at.toISOString(),
        title: dbSong.title,
        lyrics: null, // Not loaded for library view
        song_description: dbSong.song_description ?? null,
        timestamp_lyrics: null, // Not loaded for library view
        timestamped_lyrics_variants: null, // Not loaded for library view
        timestamped_lyrics_api_responses: null, // Not loaded for library view
        music_style: dbSong.music_style ?? null,
        service_provider: dbSong.service_provider ?? null,
        song_requester: null, // Not needed for library view
        prompt: null, // Not needed for library view
        song_url: dbSong.song_url ?? null,
        duration: dbSong.duration ?? null,
        slug: dbSong.slug,
        add_to_library: dbSong.add_to_library ?? undefined,
        is_deleted: dbSong.is_deleted ?? undefined,
        status: dbSong.status ?? undefined,
        categories: dbSong.categories ?? undefined,
        tags: dbSong.tags ?? undefined,
        suno_task_id: undefined, // Not exposed in library
        negative_tags: undefined, // Not needed for library view
        suno_variants: dbSong.suno_variants as any,
        selected_variant: dbSong.selected_variant ?? undefined,
        metadata: undefined, // Not needed for library view
        sequence: dbSong.sequence ?? undefined,
        show_lyrics: dbSong.show_lyrics ?? true,
        likes_count: (dbSong as any).likes_count ?? 0,
      };
    }).filter(Boolean) as Song[];

    // Track search analytics
    const { trackSearchEvent } = await import('@/lib/analytics');
    trackSearchEvent.search(query, songs.length, 'text', 'fuzzy');

    return {
      success: true,
      songs,
      total: songs.length,
      suggestions
    };
  } catch (error) {
    console.error('Error in fuzzySearchSongsAction:', error);
    return {
      success: false,
      error: 'Failed to perform fuzzy search',
      songs: [],
      total: 0,
      suggestions: []
    };
  }
}

// Suno helpers for client: server-backed status to avoid exposing tokens
export async function getSunoModeAction(): Promise<{ useMock: boolean }> {
  try {
    const { shouldUseMockAPI } = await import('@/lib/config')
    return { useMock: shouldUseMockAPI() }
  } catch (error) {
    console.error('Error in getSunoModeAction:', error)
    // Default safe: assume real API in case of failure
    return { useMock: false }
  }
}

export async function getSunoRecordInfoAction(taskId: string) {
  try {
    const { SunoAPIFactory } = await import('@/lib/suno-api')
    const api = SunoAPIFactory.getAPI()
    const response = await api.getRecordInfo(taskId)
    return response
  } catch (error) {
    console.error('Error in getSunoRecordInfoAction:', error)
    return {
      code: 500,
      msg: 'Failed to fetch record info',
      data: {
        taskId,
        parentMusicId: '',
        param: '',
        response: { taskId, sunoData: [] },
        status: 'PENDING',
        type: 'generate',
        errorCode: 'INTERNAL_ERROR',
        errorMessage: 'Failed to fetch record info',
      }
    }
  }
}

export async function updateSongWithVariantsAction(
  songId: number,
  variants: any[],
  selectedVariant: number,
  addToLibrary?: boolean
) {
  try {
    const { updateSongWithSunoVariants } = await import('@/lib/db/services');
    const result = await updateSongWithSunoVariants(songId, variants, selectedVariant, addToLibrary);

    if (result.success) {
      // After successfully updating the song with variants, generate timestamped lyrics
      try {
        // Get the song to access suno_task_id
        const { getSongById } = await import('@/lib/db/services');
        const song = await getSongById(songId);

        if (song && song.suno_task_id) {
          console.log(`Generating timestamped lyrics for selected variant ${selectedVariant}`);

          // Generate timestamped lyrics for the selected variant
          const lyricsResult = await generateTimestampedLyricsAction(
            song.suno_task_id,
            selectedVariant
          );

          if (lyricsResult.success) {
            console.log(`Successfully generated timestamped lyrics for variant ${selectedVariant}`);

            // Update the main timestamp_lyrics field for compatibility with existing components
            const { updateSong } = await import('@/lib/db/queries/update');
            await updateSong(songId, {
              timestamp_lyrics: lyricsResult.lyricLines,
              song_url: variants[selectedVariant]?.sourceAudioUrl || song.song_url,
              duration: (variants[selectedVariant]?.duration || song.duration)?.toString()
            });

            return {
              ...result,
              timestampedLyricsGenerated: true,
              lyricLines: lyricsResult.lyricLines
            };
          } else {
            console.warn(`Failed to generate timestamped lyrics: ${lyricsResult.error}`);
            // Continue with the result even if lyrics generation fails
            return {
              ...result,
              timestampedLyricsGenerated: false,
              lyricsError: lyricsResult.error
            };
          }
        }
      } catch (lyricsError) {
        console.error('Error generating timestamped lyrics:', lyricsError);
        // Continue with the result even if lyrics generation fails
        return {
          ...result,
          timestampedLyricsGenerated: false,
          lyricsError: 'Failed to generate timestamped lyrics'
        };
      }
    }

    return result;
  } catch (error) {
    console.error('Error in updateSongWithVariantsAction:', error);
    return { success: false, error: 'Failed to update song with variants' };
  }
}

export async function softDeleteSongAction(songId: number) {
  try {
    const { softDeleteSong } = await import('@/lib/db/services');
    const result = await softDeleteSong(songId);
    return result;
  } catch (error) {
    console.error('Error in softDeleteSongAction:', error);
    return { success: false, error: 'Failed to delete song' };
  }
}

export async function restoreSongAction(songId: number) {
  try {
    const { restoreSong } = await import('@/lib/db/services');
    const result = await restoreSong(songId);
    return result;
  } catch (error) {
    console.error('Error in restoreSongAction:', error);
    return { success: false, error: 'Failed to restore song' };
  }
}

// Action to generate timestamped lyrics for a variant
export async function generateTimestampedLyricsAction(
  taskId: string,
  variantIndex: number
) {
  try {
    // Get song by task ID
    const songResult = await getSongByTaskIdAction(taskId);
    if (!songResult.success || !songResult.song) {
      return {
        success: false,
        error: 'Song not found'
      };
    }

    // Check if lyrics already exist for this variant
    if (songResult.song.timestamped_lyrics_variants &&
      songResult.song.timestamped_lyrics_variants[variantIndex]) {
      console.log(`Lyrics for variant ${variantIndex} already exist in database, returning cached data`);
      return {
        success: true,
        lyricLines: songResult.song.timestamped_lyrics_variants[variantIndex],
        apiResponse: songResult.song.timestamped_lyrics_api_responses?.[variantIndex] || null,
        variant: songResult.song.suno_variants?.[variantIndex],
        fromCache: true
      };
    }

    // Get variants from the song
    const variants = songResult.song.suno_variants;
    if (!variants || !variants[variantIndex]) {
      return {
        success: false,
        error: 'Variant not found'
      };
    }

    const variant = variants[variantIndex];

    // Call Suno API to get timestamped lyrics
    const { SunoAPIFactory } = await import('@/lib/suno-api');
    const sunoAPI = SunoAPIFactory.getAPI();

    const timestampedLyricsRequest = {
      taskId: taskId,
      audioId: variant.id || "", // Use variant ID if available, otherwise empty string
      musicIndex: variantIndex
    };

    let response;
    try {
      response = await sunoAPI.getTimestampedLyrics(timestampedLyricsRequest);
    } catch (error) {
      console.error('Error calling Suno API:', error);
      throw error;
    }

    if (response.code !== 200) {
      return {
        success: false,
        error: `Failed to get timestamped lyrics: ${response.msg}`
      };
    }

    // Check if we have aligned words data

    if (!response.data || !response.data.alignedWords || !Array.isArray(response.data.alignedWords)) {
      console.error('Invalid response format:', response);
      return {
        success: false,
        error: 'Invalid response format: missing alignedWords data'
      };
    }



    // Check if timing data exists
    const hasTimingData = response.data.alignedWords.every(word =>
      typeof word.startS === 'number' && typeof word.endS === 'number'
    );

    if (!hasTimingData) {
      console.error('Missing timing data in API response');
    }

    // Transform the aligned words to match the expected format

    const transformedAlignedWords = response.data.alignedWords.map((word: any) => {
      const transformed = {
        word: word.word,
        startS: word.startS, // Use startS from API response
        endS: word.endS,     // Use endS from API response
        success: word.success,
        palign: word.palign || 0 // API response uses 'palign'
      };

      return transformed;
    });

    // Validate that we have timing data

    const transformedHasTimingData = transformedAlignedWords.every(word =>
      typeof word.startS === 'number' && typeof word.endS === 'number'
    );

    if (!transformedHasTimingData) {
      console.error('Missing timing data in transformed words');
      return {
        success: false,
        error: 'Missing timing data in aligned words'
      };
    }

    // Convert aligned words to lyric lines using the conversion logic

    // Validate that we have valid timing data before conversion
    const validWords = transformedAlignedWords.filter(word =>
      typeof word.startS === 'number' && typeof word.endS === 'number' &&
      !isNaN(word.startS) && !isNaN(word.endS) &&
      word.startS >= 0 && word.endS > word.startS
    );




    if (validWords.length === 0) {
      console.error('No valid words with timing data found!');
      return {
        success: false,
        error: 'No valid words with timing data found'
      };
    }



    const lyricLines = convertToLyricLines(validWords);



    if (lyricLines.length > 0) {
      console.log('First converted line:', lyricLines[0]);
      console.log('Last converted line:', lyricLines[lyricLines.length - 1]);
    }



    // Store the timestamped lyrics and only the alignedWords for this variant
    const { updateTimestampedLyricsForVariant } = await import('@/lib/db/queries/update');

    // Validate that we have valid timing data before storage
    const linesWithNullValues = lyricLines.filter(line =>
      line.start === null || line.end === null ||
      typeof line.start === 'undefined' || typeof line.end === 'undefined'
    );

    if (linesWithNullValues.length > 0) {
      console.error('Cannot store lyrics with null timing values');
      return {
        success: false,
        error: 'Cannot store lyrics with null timing values'
      };
    }

    await updateTimestampedLyricsForVariant(
      songResult.song.id,
      variantIndex,
      lyricLines,
      response.data.alignedWords // Store only the alignedWords, not the entire response
    );



    return {
      success: true,
      lyricLines,
      apiResponse: response,
      variant,
      fromCache: false
    };
  } catch (error) {
    console.error('Error generating timestamped lyrics:', error);
    return {
      success: false,
      error: 'Failed to generate timestamped lyrics'
    };
  }
}

/**
 * Convert aligned words to line-by-line lyrics format using timing and content analysis
 * This function is rewritten from scratch based on the working version from scripts/convert-aligned-words.mjs
 * @param words - Array of word objects with timing information
 * @returns {Array} Array of LyricLine objects
 */
function convertToLyricLines(words: any[]) {
  const lines: any[] = [];
  let currentLine: any[] = [];
  let currentLineStart: number | null = null;
  let lineIndex = 0;

  // Helper function to check if we should break line
  function shouldBreakLine(currentWord: any, nextWord: any, currentLineWords: any[]) {
    if (!nextWord) return true; // End of words

    // Break after section markers
    if (currentWord.word.includes("(") && currentWord.word.includes(")")) {
      return true;
    }

    // Break before section markers
    if (nextWord.word.includes("(") && nextWord.word.includes(")")) {
      return true;
    }

    // Break after significant punctuation
    const endPunctuation = [".", "!", "?", "…"];
    if (endPunctuation.some((punct) => currentWord.word.includes(punct))) {
      return true;
    }

    // Break if there's a significant timing gap (> 1.5 seconds)
    const gap = nextWord.startS - currentWord.endS;
    if (gap > 1.5) {
      return true;
    }

    // Break if current line is getting too long (> 80 characters)
    const currentLineText =
      currentLineWords.map((w) => w.word).join(" ") + " " + nextWord.word;
    if (currentLineText.length > 80) {
      return true;
    }

    return false;
  }

  // Process each word
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];

    // Initialize line start time if this is the first word of a line
    if (currentLine.length === 0) {
      currentLineStart = word.startS;
    }

    // Add word to current line
    currentLine.push(word);

    // Check if we should end the current line
    if (shouldBreakLine(word, nextWord, currentLine)) {
      // Create the line text
      const lineText = currentLine
        .map((w) => w.word.trim())
        .join(" ")
        .trim();

      // Only add non-empty lines
      if (lineText && lineText.length > 0) {
        // Calculate timing values - subtract a small offset to show lyrics slightly before audio
        const startMs = Math.round((currentLineStart! - 0.2) * 1000); // 200ms early
        const endMs = Math.round(word.endS * 1000);

        const line = {
          index: lineIndex,
          text: lineText,
          start: startMs,
          end: endMs,
        };

        lines.push(line);
        lineIndex++;
      }

      // Reset for next line
      currentLine = [];
      currentLineStart = null;
    }
  }

  // Handle the last line if it wasn't processed in the loop
  if (currentLine.length > 0) {
    const lineText = currentLine
      .map((w) => w.word.trim())
      .join(" ")
      .trim();

    if (lineText && lineText.length > 0) {
      const startMs = Math.round((currentLineStart! - 0.2) * 1000); // 200ms early
      const endMs = Math.round(currentLine[currentLine.length - 1].endS * 1000);

      const line = {
        index: lineIndex,
        text: lineText,
        start: startMs,
        end: endMs,
      };

      lines.push(line);
    }
  }

  const cleanedLines = cleanLyrics(lines);
  return cleanedLines;
}

/**
 * Clean and format the lyrics for better readability
 * @param lines - Array of LyricLine objects
 * @returns {Array} Cleaned LyricLine objects
 */
function cleanLyrics(lines: any[]) {
  return lines
    .map((line) => {
      let cleanedText = line.text;

      // Remove extra spaces
      cleanedText = cleanedText.replace(/\s+/g, " ");

      // Clean up section markers
      cleanedText = cleanedText.replace(/\(\s*/g, "(").replace(/\s*\)/g, ")");

      // Remove standalone section markers that don't have content
      if (cleanedText.match(/^\([^)]+\)$/)) {
        return null;
      }

      return {
        ...line,
        text: cleanedText.trim(),
      };
    })
    .filter((line) => line !== null && line.text.length > 0);
}

// Action to complete song creation with synchronized lyrics
export async function completeSongWithLyricsAction(
  songId: number,
  selectedVariant: number,
  addToLibrary: boolean = true
) {
  try {
    const { updateSongWithVariants } = await import('@/lib/db/queries/update');

    // Get the song to access variants and check if selected variant has lyrics
    const { getSongById } = await import('@/lib/db/services');
    const song = await getSongById(songId);

    if (!song || !song.suno_variants) {
      return {
        success: false,
        error: 'Song or variants not found'
      };
    }

    // Validate that the selected variant has synchronized lyrics
    if (!song.timestamped_lyrics_variants || !song.timestamped_lyrics_variants[selectedVariant]) {
      return {
        success: false,
        error: `Selected variant ${selectedVariant + 1} does not have synchronized lyrics. Please generate lyrics for this variant first.`
      };
    }

    // Get the selected variant's lyrics to copy to main timestamp_lyrics field
    const selectedVariantLyrics = song.timestamped_lyrics_variants[selectedVariant];
    const selectedVariantData = song.suno_variants[selectedVariant];

    // Update the song with the selected variant and copy lyrics to main field
    await updateSongWithVariants(
      songId,
      song.suno_variants,
      selectedVariant,
      addToLibrary
    );

    // Also update the main timestamp_lyrics field for compatibility with existing components
    const { updateSong } = await import('@/lib/db/queries/update');
    await updateSong(songId, {
      timestamp_lyrics: selectedVariantLyrics,
      song_url: selectedVariantData?.audioUrl || song.song_url,
      duration: selectedVariantData?.duration || song.duration
    });

    return {
      success: true,
      song: {
        ...song,
        timestamp_lyrics: selectedVariantLyrics,
        song_url: selectedVariantData?.audioUrl || song.song_url,
        duration: selectedVariantData?.duration || song.duration
      }
    };
  } catch (error) {
    console.error('Error completing song with lyrics:', error);
    return {
      success: false,
      error: 'Failed to complete song'
    };
  }
}