/**
 * Song Status Database Operations Service
 *
 * This service handles database operations related to song status checking,
 * including mapping database variants to variant data and determining refresh needs.
 */

import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { calculateSongStatus, SongStatus, VariantData, SONG_STATUS_MAP } from '@/lib/services/song-status-calculation-service'
import { SongDatabaseUpdateService } from '@/lib/services/song-database-update-service'

export interface DatabaseResponse {
  shouldReturn: boolean;
  status: SongStatus;
  sunoData: any[];
}

/**
 * Map database variants to VariantData format for status calculation
 */
export function mapDbVariantsToVariantData(song: any): { variantData: VariantData[]; sunoData: any[] } {
  const sunoData = Array.isArray(song.song_variants) ? song.song_variants : []
  const variantData: VariantData[] = sunoData.map((v: any) => ({
    id: v.id || '',
    audioUrl: v.audioUrl || null,
    sourceAudioUrl: v.sourceAudioUrl || null,
    streamAudioUrl: v.streamAudioUrl || null,
    sourceStreamAudioUrl: v.sourceStreamAudioUrl || null,
    imageUrl: v.imageUrl || v.sourceImageUrl || null,
    sourceImageUrl: v.sourceImageUrl || null,
    title: v.title || '',
    duration: typeof v.duration === 'number' ? v.duration : 0,
    prompt: v.prompt || '',
    modelName: v.modelName || '',
    tags: v.tags || '',
    createTime: v.createTime || ''
  }))
  return { variantData, sunoData }
}

/**
 * Determine if a refresh is needed based on current song status
 */
export function isRefreshNeeded(song: any): boolean {
  switch (SONG_STATUS_MAP[song.status as SongStatus]) {
    case SONG_STATUS_MAP.PENDING:
    case SONG_STATUS_MAP.STREAM_AVAILABLE:
      return true;

    case SONG_STATUS_MAP.FAILED:
    case SONG_STATUS_MAP.COMPLETED:
      return false;

    default:
      return true;
  }
}

/**
 * Try to respond from database without hitting external APIs
 */
export async function tryRespondFromDatabase(song: any): Promise<DatabaseResponse> {
  const { variantData, sunoData } = mapDbVariantsToVariantData(song)
  const calculated = calculateSongStatus(variantData)
  const databaseStatus = song.status as SongStatus

  console.log("🏁 [DB-FIRST] Database status check:", {
    databaseStatus,
    calculatedStatus: calculated.songStatus,
    variantsCount: sunoData.length
  })

  // If COMPLETE or FAILED in our DB view, we treat DB as source of truth
  if (databaseStatus === SONG_STATUS_MAP.COMPLETED) {
    return { shouldReturn: true, status: 'COMPLETED', sunoData: calculated.variants }
  }
  if (databaseStatus === SONG_STATUS_MAP.FAILED) {
    return { shouldReturn: true, status: 'FAILED', sunoData }
  }

  if (databaseStatus === SONG_STATUS_MAP.PENDING) {
    return { shouldReturn: false, status: 'PENDING', sunoData: calculated.variants }
  }

  // If we have at least stream-ready data, we can return immediately and refresh in background
  if (databaseStatus === SONG_STATUS_MAP.STREAM_AVAILABLE) {
    return { shouldReturn: false, status: 'STREAM_AVAILABLE', sunoData: calculated.variants }
  }

  return { shouldReturn: false, status: databaseStatus, sunoData: calculated.variants }
}

/**
 * Update database with song status and variant data
 */
export async function updateDatabase(songId: string, status: SongStatus, sunoData: any[], errorMessage?: string): Promise<void> {
  // Update database with the calculated status using pre-calculated status
  const dbUpdateResult = await SongDatabaseUpdateService.updateDatabaseWithPreCalculatedStatus(
    parseInt(songId),
    status,
    sunoData
  )
  if (!dbUpdateResult.success) {
    console.error('❌ [DB] Database update failed:', dbUpdateResult.error, errorMessage)
    // Continue with response even if DB update fails
  }
}

/**
 * Fetch song from database by ID
 */
export async function fetchSongById(songId: string) {
  const songs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, parseInt(songId)))

  if (songs.length === 0) {
    return null
  }

  return songs[0]
}

/**
 * Fetch updated song from database after an update
 */
export async function fetchUpdatedSong(songId: string) {
  const updatedSongs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, parseInt(songId)))

  return updatedSongs[0]
}
