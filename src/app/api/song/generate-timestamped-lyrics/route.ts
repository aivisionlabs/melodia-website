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

    // Check if song has variants
    if (!song.song_variants || !Array.isArray(song.song_variants) || song.song_variants.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Song variants not found - this song may not have been generated through Suno API' },
        { status: 404 }
      )
    }

    if (!(song.song_variants as any)[variantIndex]) {
      return NextResponse.json(
        { success: false, error: `Variant ${variantIndex} not found - only ${song.song_variants.length} variants available` },
        { status: 404 }
      )
    }

    // Check if timestamped lyrics already exist
    if (song.variant_timestamp_lyrics_processed && (song.variant_timestamp_lyrics_processed as any)[variantIndex]) {
      return NextResponse.json({
        success: true,
        message: 'Timestamped lyrics already exist',
        lyrics: (song.variant_timestamp_lyrics_processed as any)[variantIndex]
      })
    }

    // Generate timestamped lyrics
    const sunoTaskId =
      song.metadata && typeof song.metadata === 'object' && 'suno_task_id' in song.metadata
        ? (song.metadata as { suno_task_id?: string }).suno_task_id || ''
        : '';
    const result = await generateTimestampedLyricsAction(sunoTaskId, variantIndex);

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
