import { NextRequest, NextResponse } from 'next/server'
import { SONG_STATUS_MAP, SongStatus, calculateSongStatus } from '@/lib/services/song-status-calculation-service'
import { fetchSongById, tryRespondFromDatabase, isRefreshNeeded, mapDbVariantsToVariantData } from '@/lib/services/song-status-database-service'
import { extractTaskId, createApiResponse } from '@/lib/services/song-status-api-utils'
import { handleDemoMode } from '@/lib/services/song-status-demo-handler'
import { handleProductionMode } from '@/lib/services/song-status-production-handler'
import { refreshInBackground } from '@/lib/services/song-status-background-refresh'

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
    const song = await fetchSongById(songId)
    if (!song) {
      return NextResponse.json(
        { error: true, message: 'Song not found' },
        { status: 404 }
      )
    }

    const taskId = extractTaskId(song)

    // 1) DB-first: try to compute current status from our own DB variants
    const dbFirstResponse = await tryRespondFromDatabase(song)

    if (dbFirstResponse.shouldReturn) {
      console.log('🏁 [API] DB-first satisfied, returning without hitting provider', {
        status: dbFirstResponse.status,
        from: 'database'
      })
      return NextResponse.json(createApiResponse(dbFirstResponse.status, dbFirstResponse.sunoData))
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
      if (calculated.songStatus !== SONG_STATUS_MAP.COMPLETED && calculated.songStatus !== SONG_STATUS_MAP.FAILED) {
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

      return NextResponse.json(createApiResponse(databaseStatus, sunoData))
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