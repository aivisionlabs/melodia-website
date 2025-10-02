/**
 * Demo Mode Handler Service
 *
 * This service handles song status requests in demo mode,
 * generating mock data based on elapsed time.
 */

import { NextResponse } from 'next/server'
import { calculateSongStatus, SongStatus, VariantData } from '@/lib/services/song-status-calculation-service'
import { generateDemoSunoData, extractTaskTimestamp } from '@/lib/services/demo-data-service'
import { updateDatabase, fetchUpdatedSong } from '@/lib/services/song-status-database-service'
import { createApiResponse } from '@/lib/services/song-status-api-utils'

/**
 * Handle demo mode song status
 */
export async function handleDemoMode(songId: string, taskId: string) {
  console.log('🎭 DEMO MODE: Using mock song status response for demo task:', taskId)

  // Simulate progressive processing time
  const taskTimestamp = extractTaskTimestamp(taskId)
  const elapsedTime = Date.now() - taskTimestamp

  console.log(`Demo elapsed time: ${elapsedTime}ms`)

  // Generate progressive demo data based on elapsed time
  const demoSunoData = generateDemoSunoData(elapsedTime)

  // Convert to VariantData format and calculate status using the same service
  const variantData: VariantData[] = demoSunoData.map((variant: any) => ({
    id: variant.id || '',
    audioUrl: variant.audioUrl || null,
    sourceAudioUrl: variant.sourceAudioUrl || null,
    streamAudioUrl: variant.streamAudioUrl || null,
    sourceStreamAudioUrl: variant.sourceStreamAudioUrl || null,
    imageUrl: variant.imageUrl || variant.sourceImageUrl || null,
    sourceImageUrl: variant.sourceImageUrl || null,
    title: variant.title || '',
    duration: variant.duration || 0,
    prompt: variant.prompt || '',
    modelName: variant.modelName || '',
    tags: variant.tags || '',
    createTime: variant.createTime || ''
  }))

  // Calculate status using the same service as production
  const statusResult = calculateSongStatus(variantData)
  const calculatedStatus = statusResult.songStatus

  console.log('🧮 [DEMO] Calculated status from variant data:', {
    songStatus: calculatedStatus,
    variantsCount: variantData.length,
    hasAnyStreamReady: statusResult.hasAnyStreamReady,
    hasAnyDownloadReady: statusResult.hasAnyDownloadReady,
    allVariantsDownloadReady: statusResult.allVariantsDownloadReady
  })

  // Update database using the same service as production
  await updateDatabase(songId, calculatedStatus, demoSunoData)

  // After updating database, fetch the updated song to get the database status
  const updatedSong = await fetchUpdatedSong(songId)
  const databaseStatus = updatedSong.status as SongStatus

  console.log('🎭 [DEMO] Using database status after update:', {
    calculatedStatus: calculatedStatus,
    databaseStatus: databaseStatus,
    variantsCount: demoSunoData.length
  })

  // Return response using database status
  return NextResponse.json(createApiResponse(databaseStatus, demoSunoData))
}

/**
 * Perform demo refresh in background
 */
export async function performDemoRefresh(songId: string, taskId: string): Promise<void> {
  const taskTimestamp = extractTaskTimestamp(taskId)
  const elapsedTime = Date.now() - taskTimestamp
  const demoSunoData = generateDemoSunoData(elapsedTime)

  const variantData: VariantData[] = demoSunoData.map((variant: any) => ({
    id: variant.id || '',
    audioUrl: variant.audioUrl || null,
    sourceAudioUrl: variant.sourceAudioUrl || null,
    streamAudioUrl: variant.streamAudioUrl || null,
    sourceStreamAudioUrl: variant.sourceStreamAudioUrl || null,
    imageUrl: variant.imageUrl || variant.sourceImageUrl || null,
    sourceImageUrl: variant.sourceImageUrl || null,
    title: variant.title || '',
    duration: variant.duration || 0,
    prompt: variant.prompt || '',
    modelName: variant.modelName || '',
    tags: variant.tags || '',
    createTime: variant.createTime || ''
  }))

  const statusResult = calculateSongStatus(variantData)
  await updateDatabase(songId, statusResult.songStatus, demoSunoData)
}
