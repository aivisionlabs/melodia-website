import { Song, LyricLine } from '@/types'
import { getSongById, getSongBySlug } from '@/lib/db/queries/select'
import { updateSongStatusWithTracking, updateSongUrl, incrementStatusCheckCount } from '@/lib/db/queries/update'
import { checkSunoJobStatusAction } from '@/lib/lyrics-actions'
import { getCachedSongStatus, setCachedSongStatus, getCachedSongData, setCachedSongData, invalidateSongCache } from './cache-service'
import { handleSongStatusError, SongStatusError } from './error-handling-service'

export interface SongStatus {
  status: 'loading' | 'ready' | 'processing' | 'failed' | 'pending'
  isReady: boolean
  songUrl?: string
  duration?: number
  estimatedCompletion?: Date
  error?: string
}

export interface SongWithStatus extends Song {
  statusInfo: SongStatus
}

/**
 * Check if a song is ready to play
 */
export function isSongReady(song: Song): boolean {
  return song.status === 'completed' && !!song.song_url
}

/**
 * Get human-readable status for a song
 */
export function getSongStatus(song: Song): string {
  switch (song.status) {
    case 'completed':
      return song.song_url ? 'Ready to Play' : 'Completed (No URL)'
    case 'processing':
      return 'Generating Song'
    case 'failed':
      return 'Generation Failed'
    case 'pending':
      return 'Waiting to Start'
    case 'draft':
      return 'Draft'
    default:
      return 'Unknown Status'
  }
}

/**
 * Get song with latest status from database
 */
export async function getSongWithStatus(songId: number): Promise<SongWithStatus | null> {
  try {
    // Check cache first
    const cachedSong = getCachedSongData(songId)
    if (cachedSong) {
      const statusInfo = await getSongStatusInfo(cachedSong as Song)
      return {
        ...cachedSong,
        statusInfo
      } as SongWithStatus
    }

    const song = await getSongById(songId)
    if (!song) return null

    // Convert database song to Song interface with proper type casting
    const convertedSong = {
      ...song,
      created_at: song.created_at instanceof Date ? song.created_at.toISOString() : song.created_at,
      status_checked_at: song.status_checked_at instanceof Date ? song.status_checked_at.toISOString() : song.status_checked_at,
      last_status_check: song.last_status_check instanceof Date ? song.last_status_check.toISOString() : song.last_status_check,
      duration: song.duration ? Number(song.duration) : null,
      timestamp_lyrics: song.timestamp_lyrics as LyricLine[] | null,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as { [variantIndex: number]: LyricLine[] } | null,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as { [variantIndex: number]: any } | null,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined
    } as Song

    // Cache the song data
    setCachedSongData(songId, convertedSong)

    const statusInfo = await getSongStatusInfo(convertedSong)
    return {
      ...convertedSong,
      statusInfo
    }
  } catch (error) {
    console.error('Error getting song with status:', error)
    return null
  }
}

/**
 * Get song with latest status by slug
 */
export async function getSongWithStatusBySlug(slug: string): Promise<SongWithStatus | null> {
  try {
    const song = await getSongBySlug(slug)
    if (!song) return null

    // Convert database song to Song interface
    const convertedSong: Song = {
      ...song,
      created_at: song.created_at instanceof Date ? song.created_at.toISOString() : song.created_at,
      status_checked_at: song.status_checked_at instanceof Date ? song.status_checked_at.toISOString() : song.status_checked_at,
      last_status_check: song.last_status_check instanceof Date ? song.last_status_check.toISOString() : song.last_status_check,
      duration: song.duration ? Number(song.duration) : null,
      timestamp_lyrics: song.timestamp_lyrics as LyricLine[] | null,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as { [variantIndex: number]: LyricLine[] } | null,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as { [variantIndex: number]: any } | null,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      negative_tags: song.negative_tags ?? undefined,
      suno_variants: song.suno_variants ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      metadata: song.metadata ?? undefined
    }

    const statusInfo = await getSongStatusInfo(convertedSong)
    return {
      ...convertedSong,
      statusInfo
    }
  } catch (error) {
    console.error('Error getting song with status by slug:', error)
    return null
  }
}

/**
 * Check and update song status from Suno API
 */
export async function checkAndUpdateSongStatus(songId: number): Promise<SongStatus> {
  try {
    // Check cache first for recent status
    const cachedStatus = getCachedSongStatus(songId)
    if (cachedStatus && typeof cachedStatus === 'object' && 'song' in cachedStatus && !shouldCheckStatus(cachedStatus.song as Song)) {
      return cachedStatus as SongStatus
    }

    // Get the song from database
    const song = await getSongById(songId)
    if (!song) {
      const errorStatus: SongStatus = {
        status: 'failed',
        isReady: false,
        error: 'Song not found'
      }
      return errorStatus
    }

    // Convert database song to Song interface
    const convertedSong: Song = {
      ...song,
      created_at: song.created_at instanceof Date ? song.created_at.toISOString() : song.created_at,
      status_checked_at: song.status_checked_at instanceof Date ? song.status_checked_at.toISOString() : song.status_checked_at,
      last_status_check: song.last_status_check instanceof Date ? song.last_status_check.toISOString() : song.last_status_check,
      duration: song.duration ? Number(song.duration) : null,
      timestamp_lyrics: song.timestamp_lyrics as LyricLine[] | null,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as { [variantIndex: number]: LyricLine[] } | null,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as { [variantIndex: number]: any } | null,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      negative_tags: song.negative_tags ?? undefined,
      suno_variants: song.suno_variants ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      metadata: song.metadata ?? undefined
    }

    // If song is already completed and has URL, return ready status
    if (isSongReady(convertedSong)) {
      const readyStatus: SongStatus = {
        status: 'ready',
        isReady: true,
        songUrl: convertedSong.song_url!,
        duration: convertedSong.duration || undefined
      }
      return readyStatus
    }

    // If song doesn't have a task ID, it's not being processed
    if (!convertedSong.suno_task_id) {
      const pendingStatus: SongStatus = {
        status: 'pending',
        isReady: false,
        error: 'No generation task found'
      }
      return pendingStatus
    }

    // Increment status check count
    await incrementStatusCheckCount(songId)

    // Check status with Suno API directly (same as the API endpoint)
    const result = await checkSunoJobStatusAction(convertedSong.suno_task_id)

    if (!result.success) {
      // Update song status to failed if API check failed
      await updateSongStatusWithTracking(songId, 'failed')
      const failedStatus: SongStatus = {
        status: 'failed',
        isReady: false,
        error: result.error || 'Failed to check status'
      }
      return failedStatus
    }

    // Handle different status responses
    switch (result.status) {
      case 'completed':
        if (result.audioUrl) {
          // Update song with completed status and URL
          await updateSongUrl(songId, result.audioUrl, result.duration?.toString())
          const completedStatus: SongStatus = {
            status: 'ready',
            isReady: true,
            songUrl: result.audioUrl,
            duration: result.duration || undefined
          }
          invalidateSongCache(songId) // Invalidate cache since song was updated
          return completedStatus
        } else {
          await updateSongStatusWithTracking(songId, 'failed')
          const failedStatus: SongStatus = {
            status: 'failed',
            isReady: false,
            error: 'Song completed but no audio URL found'
          }
          return failedStatus
        }

      case 'failed':
        await updateSongStatusWithTracking(songId, 'failed')
        const failedStatus: SongStatus = {
          status: 'failed',
          isReady: false,
          error: 'Song generation failed'
        }
        return failedStatus

      case 'processing':
        await updateSongStatusWithTracking(songId, 'generating')
        const processingStatus: SongStatus = {
          status: 'processing',
          isReady: false,
          estimatedCompletion: getEstimatedCompletion(convertedSong.created_at)
        }
        return processingStatus

      default:
        await updateSongStatusWithTracking(songId, 'generating')
        const defaultStatus: SongStatus = {
          status: 'processing',
          isReady: false,
          estimatedCompletion: getEstimatedCompletion(convertedSong.created_at)
        }
        return defaultStatus
    }
  } catch (error) {
    console.error('Error checking and updating song status:', error)
    const errorStatus: SongStatus = {
      status: 'failed',
      isReady: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
    return errorStatus
  }
}

/**
 * Get status info for a song without updating
 */
async function getSongStatusInfo(song: Song): Promise<SongStatus> {
  if (isSongReady(song)) {
    return {
      status: 'ready',
      isReady: true,
      songUrl: song.song_url!,
      duration: song.duration || undefined
    }
  }

  switch (song.status) {
    case 'completed':
      return {
        status: 'ready',
        isReady: false,
        error: 'Song completed but no URL available'
      }
    case 'generating':
      return {
        status: 'processing',
        isReady: false,
        estimatedCompletion: getEstimatedCompletion(song.created_at)
      }
    case 'processing':
      return {
        status: 'processing',
        isReady: false,
        estimatedCompletion: getEstimatedCompletion(song.created_at)
      }
    case 'failed':
      return {
        status: 'failed',
        isReady: false,
        error: 'Song generation failed'
      }
    case 'pending':
      return {
        status: 'pending',
        isReady: false
      }
    default:
      return {
        status: 'pending',
        isReady: false
      }
  }
}

/**
 * Calculate estimated completion time based on creation time
 * Suno typically takes 5-10 minutes for song generation
 */
function getEstimatedCompletion(createdAt: string): Date {
  const created = new Date(createdAt)
  const estimatedMinutes = 7.5 // Average of 5-10 minutes
  return new Date(created.getTime() + estimatedMinutes * 60 * 1000)
}

/**
 * Check if status check is needed (avoid checking too frequently)
 */
export function shouldCheckStatus(song: Song): boolean {
  if (!song.last_status_check) return true

  const lastCheck = new Date(song.last_status_check)
  const now = new Date()
  const minutesSinceLastCheck = (now.getTime() - lastCheck.getTime()) / (1000 * 60)

  // Check every 30 seconds for processing songs, 5 minutes for others
  const threshold = song.status === 'processing' ? 0.5 : 5
  return minutesSinceLastCheck >= threshold
}
