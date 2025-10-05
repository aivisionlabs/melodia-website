import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { and, eq, desc, isNull, or } from 'drizzle-orm'
import { SongStatusResponse, SongVariant } from '@/lib/song-status-client'
import { SongStatus } from '@/lib/services/song-status-calculation-service'

export async function GET() {
  try {
    console.log('Fetching library songs...')

    // Get all songs with add_to_library = true and not deleted (handles both null and false)
    const songs = await db
      .select({
        id: songsTable.id,
        slug: songsTable.slug,
        status: songsTable.status,
        metadata: songsTable.metadata,
        song_variants: songsTable.song_variants,
        selected_variant: songsTable.selected_variant,
        created_at: songsTable.created_at,
        song_request_id: songsTable.song_request_id,
        variant_timestamp_lyrics_processed: songsTable.variant_timestamp_lyrics_processed,
        add_to_library: songsTable.add_to_library,
        is_deleted: songsTable.is_deleted,
      })
      .from(songsTable)
      .where(
        and(
          eq(songsTable.add_to_library, true),
          or(
            isNull(songsTable.is_deleted),
            eq(songsTable.is_deleted, false)
          )
        )
      )
      .orderBy(desc(songsTable.created_at))

    console.log(`Found ${songs.length} songs with add_to_library=true`)

    // Process songs to SongStatusResponse format
    const processedSongs: SongStatusResponse[] = songs.map(song => {
      const variants = song.song_variants as any[] || []
      const selectedVariantIndex = song.selected_variant || 0
      const selectedVariant = variants[selectedVariantIndex] || variants[0] || {}

      // Convert only the selected variant to SongVariant format
      const songVariants: SongVariant[] = [{
        id: selectedVariant.id || `variant-${song.id}-${selectedVariantIndex}`,
        title: selectedVariant.title || (song.metadata as any)?.title || 'Untitled Song',
        audioUrl: selectedVariant.audioUrl || selectedVariant.audio_url || selectedVariant.source_audio_url || '',
        sourceAudioUrl: selectedVariant.sourceAudioUrl || selectedVariant.source_audio_url || '',
        streamAudioUrl: selectedVariant.streamAudioUrl || selectedVariant.stream_audio_url || selectedVariant.source_stream_audio_url || '',
        sourceStreamAudioUrl: selectedVariant.sourceStreamAudioUrl || selectedVariant.source_stream_audio_url || '',
        imageUrl: selectedVariant.imageUrl || selectedVariant.image_url || selectedVariant.source_image_url || '/images/melodia-logo.jpeg',
        sourceImageUrl: selectedVariant.sourceImageUrl || selectedVariant.source_image_url || '',
        duration: selectedVariant.duration || 180,
        variantStatus: 'DOWNLOAD_READY' as any, // Assume all library songs are ready
        isLoading: false,
        prompt: selectedVariant.prompt || '',
        modelName: selectedVariant.modelName || 'Suno',
        tags: selectedVariant.tags || '',
        createTime: selectedVariant.createTime || song.created_at.toISOString(),
      }]

      return {
        success: true,
        status: 'COMPLETED' as SongStatus,
        variants: songVariants,
        songId: song.id,
        taskId: (song.metadata as any)?.suno_task_id || '',
        slug: song.slug,
        selectedVariantIndex: 0, // Always 0 since we only have one variant
        variantTimestampLyricsProcessed: song.variant_timestamp_lyrics_processed || {},
        userId: null,
        anonymousUserId: null,
      }
    })

    console.log(`Processed ${processedSongs.length} songs for response`)
    return NextResponse.json({
      success: true,
      songs: processedSongs
    })
  } catch (error) {
    console.error('Error fetching library songs:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load library songs' },
      { status: 500 }
    )
  }
}
