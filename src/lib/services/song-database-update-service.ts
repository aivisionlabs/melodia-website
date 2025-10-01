import { db } from '@/lib/db';
import { songsTable } from '@/lib/db/schema';
import { calculateSongStatus, SongStatus } from "@/lib/services/song-status-calculation-service";
import { eq } from 'drizzle-orm';

export interface SunoVariant {
  id: string
  audioUrl?: string | null
  sourceAudioUrl?: string | null
  streamAudioUrl?: string | null
  sourceStreamAudioUrl?: string | null
  imageUrl?: string | null
  sourceImageUrl?: string | null
  prompt?: string
  modelName?: string
  title?: string
  tags?: string
  createTime?: number | string
  duration?: number
}

export interface SunoApiResponse {
  status: string
  response?: {
    sunoData?: SunoVariant[]
  }
  errorMessage?: string | null
}

export interface DatabaseUpdateResult {
  success: boolean
  songId?: number
  songRequestId?: number
  error?: string
}

/**
 * Updates the database based on Suno API response status changes
 * Handles PENDING, STREAM_AVAILABLE, COMPLETE, and FAILED statuses
 */
export class SongDatabaseUpdateService {
  private static readonly MAX_RETRIES = 3
  private static readonly RETRY_DELAY = 1000 // 1 second

  /**
   * Updates database based on Suno API response
   * @param songId - Song ID to update
   * @param sunoResponse - Response from Suno API
   * @returns Database update result
   */
  static async updateDatabaseFromSunoResponse(
    songId: number,
    sunoResponse: SunoApiResponse
  ): Promise<DatabaseUpdateResult> {
    const { response } = sunoResponse

    try {
      // Find song by ID
      const songs = await db
        .select()
        .from(songsTable)
        .where(eq(songsTable.id, songId))

      if (songs.length === 0) {
        console.warn(`❌ [DB-SERVICE] No song found for song ID: ${songId}`)
        return {
          success: false,
          error: `No song found for song ID: ${songId}`
        }
      }

      const song = songs[0]
      // Handle different status types based on new two-level system
      const songStatus = calculateSongStatus(response?.sunoData || []);
      console.log(`🎯 [DB-SERVICE] Processing status: ${songStatus.songStatus}`)

      return await this.handleSongStatusUpdate(song, songStatus.songStatus, response)

    } catch (error) {
      console.error('Error updating database from Suno response:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Updates database with pre-calculated status (uses database variant data for calculation)
   * @param songId - Song ID to update
   * @param preCalculatedStatus - Pre-calculated status from database variant data
   * @param sunoData - Suno API data for updating variants
   * @returns Database update result
   */
  static async updateDatabaseWithPreCalculatedStatus(
    songId: number,
    preCalculatedStatus: SongStatus,
    sunoData: SunoVariant[]
  ): Promise<DatabaseUpdateResult> {
    try {
      // Find song by ID
      const songs = await db
        .select()
        .from(songsTable)
        .where(eq(songsTable.id, songId))

      if (songs.length === 0) {
        console.warn(`❌ [DB-SERVICE] No song found for song ID: ${songId}`)
        return {
          success: false,
          error: `No song found for song ID: ${songId}`
        }
      }

      const song = songs[0]
      console.log(`🎯 [DB-SERVICE] Using pre-calculated status: ${preCalculatedStatus}`)

      return await this.handleSongStatusUpdate(song, preCalculatedStatus, { sunoData })

    } catch (error) {
      console.error('Error updating database with pre-calculated status:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private static async handleSongStatusUpdate(
    song: any,
    status: SongStatus,
    response?: { sunoData?: SunoVariant[] },
  ): Promise<DatabaseUpdateResult> {
    const variants = this.processVariants(response?.sunoData || [])

    const updateData = {
      status,
      song_variants: variants
    }

    return await this.updateSongWithRetry(song.id, updateData)
  }

  /**
   * Processes Suno variants into our database format with new status system
   */
  private static processVariants(sunoData: SunoVariant[]): any[] {
    return sunoData.map((variant) => {
      // Calculate variant status based on URL availability
      let variantStatus: 'PENDING' | 'STREAM_READY' | 'DOWNLOAD_READY' = 'PENDING';

      if (!variant.sourceStreamAudioUrl) {
        variantStatus = 'PENDING';
      } else if (
        variant.sourceStreamAudioUrl &&
        !variant.audioUrl &&
        !variant.sourceAudioUrl
      ) {
        variantStatus = 'STREAM_READY';
      } else if (variant.audioUrl || variant.sourceAudioUrl) {
        variantStatus = 'DOWNLOAD_READY';
      }

      return {
        id: variant.id,
        audioUrl: variant.audioUrl,
        sourceAudioUrl: variant.sourceAudioUrl,
        streamAudioUrl: variant.streamAudioUrl,
        sourceStreamAudioUrl: variant.sourceStreamAudioUrl,
        imageUrl: variant.imageUrl || variant.sourceImageUrl,
        sourceImageUrl: variant.sourceImageUrl,
        prompt: variant.prompt,
        modelName: variant.modelName,
        title: variant.title,
        tags: variant.tags,
        createTime: variant.createTime,
        duration: variant.duration ? Math.round(variant.duration) : null,
        variantStatus: variantStatus,
      }
    })
  }

  /**
   * Updates song with retry logic
   */
  private static async updateSongWithRetry(
    songId: number,
    updateData: any
  ): Promise<DatabaseUpdateResult> {
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        await db
          .update(songsTable)
          .set(updateData)
          .where(eq(songsTable.id, songId))

        console.log(`Song ${songId} updated successfully (attempt ${attempt})`)
        return {
          success: true,
          songId
        }
      } catch (error) {
        console.error(`Failed to update song ${songId} (attempt ${attempt}):`, error)

        if (attempt === this.MAX_RETRIES) {
          return {
            success: false,
            songId,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY * attempt))
      }
    }

    return {
      success: false,
      songId,
      error: 'Max retries exceeded'
    }
  }
}
