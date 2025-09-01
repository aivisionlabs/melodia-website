import { NextRequest, NextResponse } from 'next/server'
import { getSongBySlug } from '@/lib/db/queries/select'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug is required' },
        { status: 400 }
      )
    }

    const song = await getSongBySlug(slug)

    if (!song) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      songId: song.id
    })
  } catch (error) {
    console.error('Error getting song ID from slug:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
