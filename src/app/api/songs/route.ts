import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
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

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Input validation
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''

    // Validate parameters
    if (limit > 100 || limit < 1) {
      return NextResponse.json(
        { error: 'Invalid limit parameter' },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Invalid offset parameter' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Build query with only public fields
    let query = supabase
      .from('songs')
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration')
      .range(offset, offset + limit - 1)

    // Add search filter if provided
    if (search.trim()) {
      const sanitizedSearch = search.trim().toLowerCase().slice(0, 50)
      query = query.ilike('title', `%${sanitizedSearch}%`)
    }

    // Execute query
    const { data, error } = await query.order('title', { ascending: true })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Unable to retrieve songs' },
        { status: 500 }
      )
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

    return NextResponse.json({
      songs: publicSongs,
      total: publicSongs.length,
      hasMore: publicSongs.length === limit
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}