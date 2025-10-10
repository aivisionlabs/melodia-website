/**
 * Production Mode Handler Service
 *
 * This service handles song status requests in production mode,
 * making real API calls to Suno and updating the database.
 */

import { NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { calculateSongStatus, SongStatus, VariantData } from '@/lib/services/song-status-calculation-service'
import { mapDbVariantsToVariantData, updateDatabase, fetchSongById, fetchUpdatedSong } from '@/lib/services/song-status-database-service'
import { createApiResponse, convertSunoVariantsToVariantData } from '@/lib/services/song-status-api-utils'

/**
 * Handle production mode song status
 */
export async function handleProductionMode(songId: string, taskId: string) {

  const sunoAPI = SunoAPIFactory.getAPI()

  // Get song status from Suno API
  const statusResponse = await sunoAPI.getRecordInfo(taskId)

  if (statusResponse.code !== 0 && statusResponse.code !== 200) {
    return NextResponse.json(
      { error: true, message: statusResponse.msg },
      { status: 400 }
    )
  }

  // Check if we have valid response data
  if (!statusResponse.data) {
    return NextResponse.json(
      { error: true, message: 'No data received from Suno API' },
      { status: 500 }
    )
  }

  const { response } = statusResponse.data

  // First, fetch current database data to use for calculateSongStatus
  const song = await fetchSongById(songId)
  if (!song) {
    return NextResponse.json(
      { error: true, message: 'Song not found in database' },
      { status: 404 }
    )
  }

  const { variantData } = mapDbVariantsToVariantData(song)

  // Use database variant data for calculateSongStatus
  const statusResult = calculateSongStatus(variantData)
  const calculatedStatus = statusResult.songStatus

  // Convert Suno API data to VariantData format for database update
  let sunoVariants: VariantData[] = []
  if (response?.sunoData && response.sunoData.length > 0) {
    sunoVariants = convertSunoVariantsToVariantData(response.sunoData)
  }

  // Update database using the same service as demo mode
  await updateDatabase(songId, calculatedStatus, sunoVariants, statusResponse.data.errorMessage || undefined)

  // After updating database, fetch the updated song to get the database status
  const updatedSong = await fetchUpdatedSong(songId)
  const databaseStatus = updatedSong.status as SongStatus

  // Return response using database status
  return NextResponse.json(createApiResponse(databaseStatus, sunoVariants, updatedSong));
}

/**
 * Perform production refresh in background
 */
export async function performProductionRefresh(songId: string, taskId: string): Promise<void> {
  const sunoAPI = SunoAPIFactory.getAPI()
  const statusResponse = await sunoAPI.getRecordInfo(taskId)

  if (statusResponse.code !== 0 && statusResponse.code !== 200) {
    return
  }

  if (!statusResponse.data?.response?.sunoData) {
    return
  }

  // First, fetch current database data to use for calculateSongStatus
  const song = await fetchSongById(songId)
  if (!song) {
    return
  }

  const { variantData } = mapDbVariantsToVariantData(song)

  // Use database variant data for calculateSongStatus
  const statusResult = calculateSongStatus(variantData)

  // Convert Suno API data to VariantData format for database update
  const sunoVariants: VariantData[] = convertSunoVariantsToVariantData(statusResponse.data.response.sunoData)

  await updateDatabase(songId, statusResult.songStatus, sunoVariants, statusResponse.data.errorMessage || undefined)
}
