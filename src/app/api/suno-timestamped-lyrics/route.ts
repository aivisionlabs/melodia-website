import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { taskId, audioId, musicIndex = 0 } = await request.json()

    if (!taskId || !audioId) {
      return NextResponse.json(
        { error: 'taskId and audioId are required' },
        { status: 400 }
      )
    }

    // Fetch the song from database using taskId
    const song = await db
      .select({
        id: songsTable.id,
        title: songsTable.title,
        lyrics: songsTable.lyrics,
        timestamp_lyrics: songsTable.timestamp_lyrics,
        timestamped_lyrics_variants: songsTable.timestamped_lyrics_variants,
        suno_variants: songsTable.suno_variants
      })
      .from(songsTable)
      .where(eq(songsTable.suno_task_id, taskId))
      .limit(1)

    if (!song[0]) {
      return NextResponse.json(
        { error: 'Song not found' },
        { status: 404 }
      )
    }

    const songData = song[0]
    let lyricsToUse = null

    // Check if we have variant-specific timestamped lyrics
    if (songData.timestamped_lyrics_variants && 
        typeof songData.timestamped_lyrics_variants === 'object' &&
        songData.timestamped_lyrics_variants[audioId as keyof typeof songData.timestamped_lyrics_variants]) {
      lyricsToUse = songData.timestamped_lyrics_variants[audioId as keyof typeof songData.timestamped_lyrics_variants]
    }
    // Check if we have general timestamped lyrics
    else if (songData.timestamp_lyrics) {
      lyricsToUse = songData.timestamp_lyrics
    }
    // Fall back to plain text lyrics and create simple timestamped format
    else if (songData.lyrics) {
      // Convert plain text lyrics to simple timestamped format
      const lines = songData.lyrics.split('\n').filter(line => line.trim() !== '')
      
      // Simple timing - just give each line a basic duration
      const durationPerLine = 4.0 // 4 seconds per line
      
      lyricsToUse = lines.map((line, index) => ({
        word: line,
        success: true,
        startS: index * durationPerLine,
        endS: (index + 1) * durationPerLine,
        palign: 0
      }))
    }

    if (!lyricsToUse) {
      return NextResponse.json(
        { error: 'No lyrics found for this song' },
        { status: 404 }
      )
    }

    // If lyricsToUse is already in the correct format, use it directly
    let alignedWords: any[] = []
    if (Array.isArray(lyricsToUse)) {
      if (lyricsToUse.length > 0 && !lyricsToUse[0].hasOwnProperty('word')) {
        // Convert plain text array to timestamped format
        const durationPerLine = 4.0
        alignedWords = lyricsToUse.map((line: any, index: number) => ({
          word: line,
          success: true,
          startS: index * durationPerLine,
          endS: (index + 1) * durationPerLine,
          palign: 0
        }))
      } else {
        alignedWords = lyricsToUse
      }
    }

    // Convert Suno format to our MediaPlayer format
    const convertedLyrics = alignedWords.map((word: any, index: number) => ({
      index,
      text: word.word,
      start: word.startS * 1000, // Convert seconds to milliseconds
      end: word.endS * 1000,
      success: word.success,
      palign: word.palign
    }))

    return NextResponse.json({
      success: true,
      lyrics: convertedLyrics,
      waveformData: [0, 1, 0.5, 0.75, 0.3, 0.8, 0.2, 0.9], // Mock waveform data
      hootCer: 0.3803191489361702, // Mock confidence score
      isStreamed: false
    })

  } catch (error) {
    console.error('Error fetching timestamped lyrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timestamped lyrics' },
      { status: 500 }
    )
  }
}
