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
        title: songsTable.title,
        song_url: songsTable.song_url,
        duration: songsTable.duration,
        suno_variants: songsTable.suno_variants,
        selected_variant: songsTable.selected_variant,
        status: songsTable.status
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
    const variants = song.suno_variants || []
    const selectedVariant = song.selected_variant || 0

    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        title: song.title,
        status: song.status,
        primaryUrl: song.song_url,
        duration: song.duration,
        selectedVariant,
        variants: Array.isArray(variants) ? variants.map((variant: any, index: number) => ({
          ...variant,
          isSelected: index === selectedVariant
        })) : []
      }
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
        suno_variants: songsTable.suno_variants
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
    const variants = song.suno_variants || []

    if (variantIndex < 0 || variantIndex >= (Array.isArray(variants) ? variants.length : 0)) {
      return NextResponse.json(
        { error: true, message: 'Invalid variant index' },
        { status: 400 }
      )
    }

    // Update selected variant and primary URL
    const selectedVariant = Array.isArray(variants) ? variants[variantIndex] : null
    const newPrimaryUrl = selectedVariant?.audioUrl || selectedVariant?.streamAudioUrl

    await db
      .update(songsTable)
      .set({
        selected_variant: variantIndex,
        song_url: newPrimaryUrl,
        duration: selectedVariant.duration
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
