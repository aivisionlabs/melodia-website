'use server'

import { createServerSupabaseClient } from './supabase'
import { PublicSong } from '@/types'


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
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration')
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
      service_provider: song.service_provider,
      song_url: song.song_url,
      duration: song.duration
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
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration')
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
      duration: data.duration
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
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration')
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
      duration: song.duration
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