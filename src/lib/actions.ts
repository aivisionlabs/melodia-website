'use server'

import { Song, PublicSong } from '@/types';
import { createSong, incrementSongPlay, incrementSongView, updateSongStatus, validateAdminCredentials } from './db/services';
import { createServerSupabaseClient } from './supabase';


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

/**
 * Get all songs with optional search and pagination
 */
export async function getSongs(
  search?: string,
  limit: number = 50,
  offset: number = 0,
  ip: string = 'unknown'
): Promise<{
  songs: PublicSong[]
  total: number
  hasMore: boolean
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return {
        songs: [],
        total: 0,
        hasMore: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    if (limit > 100 || limit < 1) {
      return {
        songs: [],
        total: 0,
        hasMore: false,
        error: 'Invalid limit parameter'
      }
    }

    if (offset < 0) {
      return {
        songs: [],
        total: 0,
        hasMore: false,
        error: 'Invalid offset parameter'
      }
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Build query with only public fields
    let query = supabase
      .from('songs')
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration, slug')
      .range(offset, offset + limit - 1)

    // Add search filter if provided
    if (search?.trim()) {
      const sanitizedSearch = sanitizeSearchQuery(search)
      query = query.ilike('title', `%${sanitizedSearch}%`)
    }

    // Execute query
    const { data, error } = await query.order('title', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return {
        songs: [],
        total: 0,
        hasMore: false,
        error: 'Unable to retrieve songs'
      }
    }

    // Transform data to public format
    const publicSongs: PublicSong[] = (data || []).map(song => ({
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      timestamp_lyrics: song.timestamp_lyrics,
      music_style: song.music_style,
      service_provider: song.service_provider ?? null,
      song_url: song.song_url,
      duration: song.duration,
      slug: song.slug
    }))

    return {
      songs: publicSongs,
      total: publicSongs.length,
      hasMore: publicSongs.length === limit
    }

  } catch (error) {
    console.error('Server action error:', error)
    return {
      songs: [],
      total: 0,
      hasMore: false,
      error: 'Internal server error'
    }
  }
}

/**
 * Get a specific song by ID
 */
export async function getSong(
  id: string,
  ip: string = 'unknown'
): Promise<{
  song: PublicSong | null
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return {
        song: null,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    if (!validateSongId(id)) {
      return {
        song: null,
        error: 'Invalid song ID'
      }
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Query with only public fields
    const { data, error } = await supabase
      .from('songs')
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration, slug')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return {
          song: null,
          error: 'Song not found'
        }
      }
      return {
        song: null,
        error: 'Unable to retrieve song'
      }
    }

    if (!data) {
      return {
        song: null,
        error: 'Song not found'
      }
    }

    // Transform data to public format
    const publicSong: PublicSong = {
      id: data.id,
      title: data.title,
      lyrics: data.lyrics,
      timestamp_lyrics: data.timestamp_lyrics,
      music_style: data.music_style,
      service_provider: data.service_provider,
      song_url: data.song_url,
      duration: data.duration,
      slug: data.slug
    }

    return { song: publicSong }

  } catch (error) {
    console.error('Server action error:', error)
    return {
      song: null,
      error: 'Internal server error'
    }
  }
}

/**
 * Search songs by title
 */
export async function searchSongs(
  query: string,
  ip: string = 'unknown'
): Promise<{
  songs: PublicSong[]
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip)) {
      return {
        songs: [],
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    if (!query || typeof query !== 'string' || query.length < 2) {
      return { songs: [] }
    }

    // Sanitize search query
    const sanitizedQuery = sanitizeSearchQuery(query)

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()

    const { data, error } = await supabase
      .from('songs')
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration, slug')
      .ilike('title', `%${sanitizedQuery}%`)
      .limit(20)

    if (error) {
      console.error('Search error:', error)
      return {
        songs: [],
        error: 'Search failed'
      }
    }

    // Transform data to public format
    const publicSongs: PublicSong[] = (data || []).map(song => ({
      id: song.id,
      title: song.title,
      lyrics: song.lyrics,
      timestamp_lyrics: song.timestamp_lyrics,
      music_style: song.music_style,
      service_provider: song.service_provider,
      song_url: song.song_url,
      duration: song.duration,
      slug: song.slug
    }))

    return { songs: publicSongs }

  } catch (error) {
    console.error('Search error:', error)
    return {
      songs: [],
      error: 'Search failed'
    }
  }
}

/**
 * Get song statistics
 */
export async function getSongStats(): Promise<{
  totalSongs: number
  totalDuration: number
  popularStyles: string[]
  error?: string
}> {
  try {
    const supabase = createServerSupabaseClient()

    // Get total count
    const { count, error: countError } = await supabase
      .from('songs')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      throw countError
    }

    // Get duration sum
    const { data: durationData, error: durationError } = await supabase
      .from('songs')
      .select('duration')

    if (durationError) {
      throw durationError
    }

    const totalDuration = durationData?.reduce((sum, song) => sum + (song.duration || 0), 0) || 0

    // Get popular styles
    const { data: stylesData, error: stylesError } = await supabase
      .from('songs')
      .select('music_style')
      .not('music_style', 'is', null)

    if (stylesError) {
      throw stylesError
    }

    const styleCounts = stylesData?.reduce((acc, song) => {
      if (song.music_style) {
        acc[song.music_style] = (acc[song.music_style] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>) || {}

    const popularStyles = Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([style]) => style)

    return {
      totalSongs: count || 0,
      totalDuration,
      popularStyles
    }

  } catch (error) {
    console.error('Stats error:', error)
    return {
      totalSongs: 0,
      totalDuration: 0,
      popularStyles: [],
      error: 'Unable to retrieve statistics'
    }
  }
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
      model: "V4_5PLUS",
      negativeTags: negativeTags || undefined,
      callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/suno-webhook`
    };

    try {
      const sunoResponse = await sunoAPI.generateSong(generateRequest);

      if (sunoResponse.code === 200) {
        // Update song with task ID
        await updateSongStatus(
          songResult.songId!,
          'generating',
          undefined,
          sunoResponse.data.taskId
        );

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
      return {
        success: false,
        error: 'Failed to start song generation'
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

export async function getActiveSongsAction(): Promise<
  | { success: true; songs: Song[] }
  | { success: false; error: string; songs: Song[] }
> {
  try {
    const { getAllSongs } = await import('@/lib/db/queries/select');
    const dbSongs = await getAllSongs();

    // Transform database songs to match Song type
    const songs: Song[] = dbSongs.map(song => ({
      id: song.id,
      created_at: song.created_at.toISOString(),
      title: song.title,
      lyrics: song.lyrics ?? null,
      timestamp_lyrics: song.timestamp_lyrics as any,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as any,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as any,
      music_style: song.music_style ?? null,
      service_provider: song.service_provider ?? null,
      song_requester: song.song_requester ?? null,
      prompt: song.prompt ?? null,
      song_url: song.song_url ?? null,
      duration: song.duration ?? null,
      slug: song.slug,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      negative_tags: song.negative_tags ?? undefined,
      suno_variants: song.suno_variants as any,
      selected_variant: song.selected_variant ?? undefined,
      metadata: song.metadata as any,
    }));

    return { success: true, songs };
  } catch (error) {
    console.error('Error in getActiveSongsAction:', error);
    return { success: false, error: 'Failed to get active songs', songs: [] };
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
              song_url: variants[selectedVariant]?.audioUrl || song.song_url,
              duration: variants[selectedVariant]?.duration || song.duration
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
      audioId: variant.id,
      musicIndex: variantIndex
    };

    const response = await sunoAPI.getTimestampedLyrics(timestampedLyricsRequest);

    if (response.code !== 200) {
      return {
        success: false,
        error: `Failed to get timestamped lyrics: ${response.msg}`
      };
    }

    // Convert aligned words to lyric lines
    const { convertAlignedWordsToLyricLines } = await import('@/lib/utils');
    const lyricLines = convertAlignedWordsToLyricLines(response.data.alignedWords);

    // Store the timestamped lyrics and API response for this variant
    const { updateTimestampedLyricsForVariant } = await import('@/lib/db/queries/update');
    await updateTimestampedLyricsForVariant(
      songResult.song.id,
      variantIndex,
      lyricLines,
      response // Store the full API response
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