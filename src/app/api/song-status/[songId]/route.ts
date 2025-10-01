import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { SongDatabaseUpdateService } from '@/lib/services/song-database-update-service'
import { calculateSongStatus, SongStatus, VariantData, SONG_STATUS_MAP } from '@/lib/services/song-status-calculation-service'
import { db } from '@/lib/db'
import { songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/* Service provider song status */
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ songId: string }> }
) {
  try {
    const { songId } = await params

    if (!songId) {
      return NextResponse.json(
        { error: true, message: 'Song ID is required' },
        { status: 400 }
      )
    }

    // First, fetch the song to get the task_id from metadata
    const songs = await db
      .select()
      .from(songsTable)
      .where(eq(songsTable.id, parseInt(songId)))

    if (songs.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Song not found' },
        { status: 404 }
      )
    }

    const song = songs[0];
    const metadata = song.metadata as any
    const taskId = metadata?.suno_task_id

    // 1) DB-first: try to compute current status from our own DB variants
    const dbFirstResponse = await tryRespondFromDatabase(song)
    console.log('🏁 [API] DB-first response:', dbFirstResponse)
    if (dbFirstResponse.shouldReturn) {
      console.log('🏁 [API] DB-first satisfied, returning without hitting provider', {
        status: dbFirstResponse.status,
        from: 'database'
      })
      return NextResponse.json(createApiResponse(taskId, dbFirstResponse.status, dbFirstResponse.sunoData))
    }

    if (!taskId) {
      return NextResponse.json(
        { error: true, message: 'No task ID found for this song' },
        { status: 400 }
      )
    }

    // 2) Decide whether to refresh from provider based on staleness
    const refreshNeeded = isRefreshNeeded(song)
    console.log('⏱️ [API] Refresh check:', { refreshNeeded })

    if (!refreshNeeded) {
      // Return DB view but trigger background refresh for non-terminal states
      const { variantData, sunoData } = mapDbVariantsToVariantData(song)
      const calculated = calculateSongStatus(variantData)

      // Schedule background refresh if not in terminal state
      if (calculated.songStatus !== 'COMPLETED' && calculated.songStatus !== 'FAILED') {
        console.log('🧵 [API] Scheduling background refresh for non-terminal status:', calculated.songStatus)
        // Use Promise without await to fire-and-forget
        refreshInBackground(songId, taskId).catch(err => {
          console.error('❌ [API] Background refresh error:', err)
        })
      }

      // Use database status instead of calculated status for API response
      const databaseStatus = song.status as SongStatus
      console.log('🏁 [API] Using database status for response:', {
        databaseStatus,
        calculatedStatus: calculated.songStatus,
        variantsCount: sunoData.length
      })

      return NextResponse.json(createApiResponse(taskId, databaseStatus, sunoData))
    }

    // 3) Not satisfied by DB and refresh needed → hit appropriate source
    if (taskId.startsWith('demo-')) {
      return await handleDemoMode(songId, taskId)
    } else {
      return await handleProductionMode(songId, taskId)
    }
  } catch (error) {
    console.error('Error checking song status:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to check song status' },
      { status: 500 }
    )
  }
}

/**
 * DB-first quick path: compute status from our stored variants and metadata
 */
function mapDbVariantsToVariantData(song: any): { variantData: VariantData[]; sunoData: any[] } {
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

function isRefreshNeeded(song: any): boolean {
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

async function tryRespondFromDatabase(song: any): Promise<{ shouldReturn: boolean; status: SongStatus; sunoData: any[] }> {
  const { variantData, sunoData } = mapDbVariantsToVariantData(song)
  const calculated = calculateSongStatus(variantData)
  const databaseStatus = song.status as SongStatus

  console.log("🏁 [DB-FIRST] Database status check:", {
    databaseStatus,
    calculatedStatus: calculated.songStatus,
    variantsCount: sunoData.length
  })

  // If COMPLETE or FAILED in our DB view, we treat DB as source of truth
  if (databaseStatus === 'COMPLETED') {
    return { shouldReturn: true, status: 'COMPLETED', sunoData: calculated.variants }
  }
  if (databaseStatus === 'FAILED') {
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
 * Background refresh function - updates DB without blocking response
 */
async function refreshInBackground(songId: string, taskId: string): Promise<void> {
  try {
    console.log('🔄 [BACKGROUND] Starting refresh for song:', songId)

    if (taskId.startsWith('demo-')) {
      await performDemoRefresh(songId, taskId)
    } else {
      await performProductionRefresh(songId, taskId)
    }

    console.log('✅ [BACKGROUND] Refresh completed for song:', songId)
  } catch (error) {
    console.error('❌ [BACKGROUND] Refresh failed for song:', songId, error)
  }
}

/**
 * Perform demo refresh in background
 */
async function performDemoRefresh(songId: string, taskId: string): Promise<void> {
  const taskTimestamp = parseInt(taskId.split('-')[2]) || Date.now()
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

/**
 * Perform production refresh in background
 */
async function performProductionRefresh(songId: string, taskId: string): Promise<void> {
  const sunoAPI = SunoAPIFactory.getAPI()
  const statusResponse = await sunoAPI.getRecordInfo(taskId)

  if (statusResponse.code !== 0 && statusResponse.code !== 200) {
    console.error('❌ [BACKGROUND] Suno API error:', statusResponse.msg)
    return
  }

  if (!statusResponse.data?.response?.sunoData) {
    console.log('⏳ [BACKGROUND] No variant data from Suno API')
    return
  }

  // First, fetch current database data to use for calculateSongStatus
  const songs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, parseInt(songId)))

  if (songs.length === 0) {
    console.error('❌ [BACKGROUND] Song not found in database:', songId)
    return
  }

  const song = songs[0]
  const { variantData } = mapDbVariantsToVariantData(song)

  // Use database variant data for calculateSongStatus
  const statusResult = calculateSongStatus(variantData)

  // Convert Suno API data to VariantData format for database update
  const sunoVariants: VariantData[] = statusResponse.data.response.sunoData.map((variant: any) => ({
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

  console.log('🔄 [BACKGROUND] Using database variant data for status calculation:', {
    databaseVariantsCount: variantData.length,
    sunoVariantsCount: sunoVariants.length,
    calculatedStatus: statusResult.songStatus
  })

  await updateDatabase(songId, statusResult.songStatus, sunoVariants, statusResponse.data.errorMessage || undefined)
}

/**
 * Handle demo mode song status
 */
async function handleDemoMode(songId: string, taskId: string) {
  console.log('🎭 DEMO MODE: Using mock song status response for demo task:', taskId)

  // Simulate progressive processing time
  const taskTimestamp = parseInt(taskId.split('-')[2]) || Date.now()
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
  const updatedSongs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, parseInt(songId)))

  const updatedSong = updatedSongs[0]
  const databaseStatus = updatedSong.status as SongStatus

  console.log('🎭 [DEMO] Using database status after update:', {
    calculatedStatus: calculatedStatus,
    databaseStatus: databaseStatus,
    variantsCount: demoSunoData.length
  })

  // Return response using database status
  return NextResponse.json(createApiResponse(taskId, databaseStatus, demoSunoData))
}

/**
 * Handle production mode song status
 */
async function handleProductionMode(songId: string, taskId: string) {
  console.log('🏭 PRODUCTION MODE: Using real Suno API for production task:', taskId)

  const sunoAPI = SunoAPIFactory.getAPI()

  // Get song status from Suno API
  const statusResponse = await sunoAPI.getRecordInfo(taskId)
  console.log('statusResponse', statusResponse.data)

  if (statusResponse.code !== 0 && statusResponse.code !== 200) {
    return NextResponse.json(
      { error: true, message: statusResponse.msg },
      { status: 400 }
    )
  }

  // Check if we have valid response data
  if (!statusResponse.data) {
    console.error('No data in Suno API response:', statusResponse)
    return NextResponse.json(
      { error: true, message: 'No data received from Suno API' },
      { status: 500 }
    )
  }

  const { response } = statusResponse.data
  console.log('🔍 [API] Raw Suno API response:', {
    responseKeys: response ? Object.keys(response) : 'no response',
    sunoDataLength: response?.sunoData?.length || 0,
    hasTaskId: !!response?.taskId
  })

  // First, fetch current database data to use for calculateSongStatus
  const songs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, parseInt(songId)))

  if (songs.length === 0) {
    return NextResponse.json(
      { error: true, message: 'Song not found in database' },
      { status: 404 }
    )
  }

  const song = songs[0]
  const { variantData } = mapDbVariantsToVariantData(song)

  // Use database variant data for calculateSongStatus
  const statusResult = calculateSongStatus(variantData)
  const calculatedStatus = statusResult.songStatus

  console.log('🏭 [PRODUCTION] Using database variant data for status calculation:', {
    databaseVariantsCount: variantData.length,
    calculatedStatus: calculatedStatus
  })

  // Convert Suno API data to VariantData format for database update
  let sunoVariants: VariantData[] = []
  if (response?.sunoData && response.sunoData.length > 0) {
    sunoVariants = response.sunoData.map((variant: any) => ({
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
  } else {
    console.log('⏳ [API] No variant data available from Suno API')
  }

  // Update database using the same service as demo mode
  await updateDatabase(songId, calculatedStatus, sunoVariants, statusResponse.data.errorMessage || undefined)

  // After updating database, fetch the updated song to get the database status
  const updatedSongs = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, parseInt(songId)))

  const updatedSong = updatedSongs[0]
  const databaseStatus = updatedSong.status as SongStatus

  console.log('🏭 [PRODUCTION] Using database status after update:', {
    calculatedStatus: calculatedStatus,
    databaseStatus: databaseStatus,
    variantsCount: sunoVariants.length
  })

  // Return response using database status
  return NextResponse.json(createApiResponse(taskId, databaseStatus, sunoVariants))
}

/**
 * Unified database update function for both demo and production modes
 */
async function updateDatabase(songId: string, status: SongStatus, sunoData: any[], errorMessage?: string) {
  const sunoResponse = {
    status: status,
    response: {
      sunoData: sunoData
    },
    errorMessage: errorMessage || undefined
  }

  console.log('💾 [DB] Calling database update service with:', {
    songId: parseInt(songId),
    status: sunoResponse.status,
    hasResponse: !!sunoResponse.response,
    hasSunoData: !!sunoResponse.response?.sunoData,
    sunoDataLength: sunoResponse.response?.sunoData?.length || 0,
    hasErrorMessage: !!sunoResponse.errorMessage
  })

  // Update database with the calculated status using pre-calculated status
  const dbUpdateResult = await SongDatabaseUpdateService.updateDatabaseWithPreCalculatedStatus(
    parseInt(songId),
    status,
    sunoData
  )
  if (!dbUpdateResult.success) {
    console.error('❌ [DB] Database update failed:', dbUpdateResult.error)
    // Continue with response even if DB update fails
  } else {
    console.log('✅ [DB] Database update successful:', {
      songId: parseInt(songId),
      status: status,
      variantsCount: sunoData.length
    })
  }
}

/**
 * Generate demo suno data based on elapsed time
 */
function generateDemoSunoData(elapsedTime: number): any[] {
  if (elapsedTime > 40000) { // 40+ seconds - COMPLETE: both variants with download ready
    return [
      {
        id: "78df5b9b-6168-4524-81c0-969adee3073a",
        audioUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.mp3",
        sourceAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        streamAudioUrl: "https://mfile.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 181.88
      },
      {
        id: "980396fc-b213-4112-a903-419a3d1a9dc3",
        audioUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.mp3",
        sourceAudioUrl: "https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3",
        streamAudioUrl: "https://mfile.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 196.48
      }
    ]
  } else if (elapsedTime > 20000) { // 20-40 seconds - STREAM_AVAILABLE: first variant with stream only
    return [
      {
        id: "78df5b9b-6168-4524-81c0-969adee3073a",
        audioUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.mp3",
        sourceAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        streamAudioUrl: "https://mfile.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 181.88
      },
      {
        id: "980396fc-b213-4112-a903-419a3d1a9dc3",
        audioUrl: "",
        sourceAudioUrl: "",
        streamAudioUrl: "https://mfile.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz",
        sourceStreamAudioUrl: "https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3",
        imageUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 196.48
      }
    ]
  } else { // 0-20 seconds - PENDING: no variants ready
    return [
      {
        id: "78df5b9b-6168-4524-81c0-969adee3073a",
        audioUrl: "",
        sourceAudioUrl: "",
        streamAudioUrl: "",
        sourceStreamAudioUrl: "",
        imageUrl: "https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 181.88
      },
      {
        id: "980396fc-b213-4112-a903-419a3d1a9dc3",
        audioUrl: "",
        sourceAudioUrl: "",
        streamAudioUrl: "",
        sourceStreamAudioUrl: "",
        imageUrl: "https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg",
        sourceImageUrl: "https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg",
        prompt: "Demo song prompt",
        modelName: "chirp-bluejay",
        title: "Shehar Hila De",
        tags: "Demo song tags",
        createTime: 1756555316725,
        duration: 196.48
      }
    ]
  }
}

/**
 * Create standardized API response for both demo and production modes
 */
function createApiResponse(taskId: string, status: SongStatus, sunoData: any[]) {
  const response = {
    code: 200,
    msg: "success",
    data: {
      taskId: taskId,
      response: {
        taskId: taskId,
        sunoData: sunoData
      },
      status: status,
      errorCode: status === SONG_STATUS_MAP.FAILED ? "GENERATION_FAILED" : null,
      errorMessage: status === SONG_STATUS_MAP.FAILED ? 'Song generation failed' : null
    }
  }

  return response
}