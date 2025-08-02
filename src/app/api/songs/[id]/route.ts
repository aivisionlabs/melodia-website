import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { PublicSong } from '@/types'

// Rate limiting map (in production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX = 50 // requests per window

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
  // Only allow numeric IDs
  return /^\d+$/.test(id)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    if (!validateSongId(params.id)) {
      return NextResponse.json(
        { error: 'Invalid song ID' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client
    const supabase = createServerSupabaseClient()

    // Query with only public fields
    const { data, error } = await supabase
      .from('songs')
      .select('id, title, lyrics, timestamp_lyrics, music_style, service_provider, song_url, duration')
      .eq('id', params.id)
      .single()

    if (error) {
      console.error('Database error:', error)
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Song not found' },
          { status: 404 }
        )
      }
      return NextResponse.json(
        { error: 'Unable to retrieve song' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
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

    return NextResponse.json(publicSong)

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}