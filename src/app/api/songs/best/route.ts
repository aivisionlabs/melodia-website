import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { and, eq, desc } from 'drizzle-orm'

export async function GET() {
  try {
    const songs = await db
      .select({
        id: songsTable.id,
        title: songsTable.title,
        slug: songsTable.slug,
        song_url: songsTable.song_url,
        duration: songsTable.duration,
        status: songsTable.status,
        metadata: songsTable.metadata,
        created_at: songsTable.created_at,
      })
      .from(songsTable)
      .where(and(eq(songsTable.is_active, true), eq(songsTable.is_featured, true)))
      .orderBy(desc(songsTable.created_at))

    return NextResponse.json({ success: true, songs })
  } catch (error) {
    console.error('Error fetching featured songs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load best songs' },
      { status: 500 }
    )
  }
}







