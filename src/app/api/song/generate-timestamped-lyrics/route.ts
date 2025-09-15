import { NextRequest, NextResponse } from 'next/server'
import { generateTimestampedLyricsAction } from '@/lib/actions'
import { getSongById } from '@/lib/db/queries/select'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Timestamped lyrics API endpoint is working'
  })
}

export async function POST(request: NextRequest) {
  try {
    const { songId, variantIndex = 0 } = await request.json()

    if (!songId) {
      return NextResponse.json(
        { success: false, error: 'Song ID is required' },
        { status: 400 }
      )
    }

    // Get the song to check if it has variants
    const song = await getSongById(songId)
    if (!song) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      )
    }

    console.log('Song data for timestamped lyrics generation:', {
      id: song.id,
      title: song.title,
      hasSunoVariants: !!song.suno_variants,
      sunoVariantsLength: Array.isArray(song.suno_variants) ? song.suno_variants.length : 0,
      hasSunoTaskId: !!song.suno_task_id,
      sunoTaskId: song.suno_task_id,
      hasTimestampedLyricsVariants: !!song.timestamped_lyrics_variants,
      timestampedLyricsVariantsLength: Array.isArray(song.timestamped_lyrics_variants) ? song.timestamped_lyrics_variants.length : 0
    });

    // Check if song has variants
    if (!song.suno_variants || !Array.isArray(song.suno_variants) || song.suno_variants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Song variants not found - this song may not have been generated through Suno API' },
        { status: 404 }
      )
    }

    if (!(song.suno_variants as any)[variantIndex]) {
      return NextResponse.json(
        { success: false, error: `Variant ${variantIndex} not found - only ${song.suno_variants.length} variants available` },
        { status: 404 }
      )
    }

    // Check if timestamped lyrics already exist
    if (song.timestamped_lyrics_variants && (song.timestamped_lyrics_variants as any)[variantIndex]) {
      return NextResponse.json({
        success: true,
        message: 'Timestamped lyrics already exist',
        lyrics: (song.timestamped_lyrics_variants as any)[variantIndex]
      })
    }

    // Generate timestamped lyrics
    const result = await generateTimestampedLyricsAction(song.suno_task_id!, variantIndex)

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Timestamped lyrics generated successfully',
      lyrics: result.lyricLines
    })
  } catch (error) {
    console.error('Error generating timestamped lyrics:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
