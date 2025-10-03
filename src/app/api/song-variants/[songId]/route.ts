import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params

    if (!songId) {
      return NextResponse.json(
        { error: true, message: 'Song ID is required' },
        { status: 400 }
      )
    }

    // Get song with variants
    const songs = await db
      .select({
        id: songsTable.id,
        song_variants: songsTable.song_variants,
        selected_variant: songsTable.selected_variant,
        status: songsTable.status,
        metadata: songsTable.metadata
      })
      .from(songsTable)
      .where(eq(songsTable.id, parseInt(songId)))

    if (songs.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Song not found' },
        { status: 404 }
      )
    }

    const song = songs[0]
    const variants = song.song_variants || []
    const selectedVariant = song.selected_variant || 0

    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        status: song.status,
        selectedVariant,
        suno_task_id: (song.metadata as any)?.suno_task_id
      },
      variants: Array.isArray(variants) ? variants.map((variant: any, index: number) => {
        // Handle both demo data format and current format
        const audioUrl = variant.audioUrl || variant.audio_url || variant.source_audio_url || "";
        const streamAudioUrl = variant.streamAudioUrl || variant.stream_audio_url || variant.source_stream_audio_url || "";
        const imageUrl = variant.imageUrl || variant.image_url || variant.source_image_url || "/images/melodia-logo.png";

        return {
          id: variant.id || `variant-${index}`,
          title: variant.title || `${(song.metadata as any)?.title || 'Untitled Song'} - Variant ${index + 1}`,
          audioUrl: audioUrl,
          streamAudioUrl: streamAudioUrl,
          imageUrl: imageUrl,
          duration: variant.duration || 180,
          downloadStatus: audioUrl ? "ready" : "generating",
          isLoading: !audioUrl,
          isSelected: index === selectedVariant
        };
      }) : []
    })

  } catch (error) {
    console.error('Error fetching song variants:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to fetch song variants' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params
    const body = await request.json()
    const { variantIndex } = body

    if (!songId || variantIndex === undefined) {
      return NextResponse.json(
        { error: true, message: 'Song ID and variant index are required' },
        { status: 400 }
      )
    }

    // Get song with variants
    const songs = await db
      .select({
        id: songsTable.id,
        song_variants: songsTable.song_variants
      })
      .from(songsTable)
      .where(eq(songsTable.id, parseInt(songId)))

    if (songs.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Song not found' },
        { status: 404 }
      )
    }

    const song = songs[0]
    const variants = song.song_variants || []

    if (variantIndex < 0 || variantIndex >= (Array.isArray(variants) ? variants.length : 0)) {
      return NextResponse.json(
        { error: true, message: 'Invalid variant index' },
        { status: 400 }
      )
    }

    // Update selected variant
    const selectedVariant = Array.isArray(variants) ? variants[variantIndex] : null

    await db
      .update(songsTable)
      .set({
        selected_variant: variantIndex
      })
      .where(eq(songsTable.id, parseInt(songId)))

    return NextResponse.json({
      success: true,
      message: 'Variant selected successfully',
      selectedVariant: {
        ...selectedVariant,
        isSelected: true
      }
    })

  } catch (error) {
    console.error('Error selecting song variant:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to select song variant' },
      { status: 500 }
    )
  }
}
