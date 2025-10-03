import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params

    if (!requestId) {
      return NextResponse.json(
        { error: true, message: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get song by request ID
    const songs = await db
      .select()
      .from(songsTable)
      .where(eq(songsTable.song_request_id, parseInt(requestId)))
      .limit(1)

    if (songs.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Song not found for this request' },
        { status: 404 }
      )
    }

    const song = songs[0]

    return NextResponse.json({
      success: true,
      song: {
        id: song.id,
        status: song.status,
        created_at: song.created_at
      }
    })

  } catch (error) {
    console.error('Error fetching song by request:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to fetch song' },
      { status: 500 }
    )
  }
}
