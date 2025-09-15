import { NextRequest, NextResponse } from 'next/server'
import {  getSongWithStatus } from '@/lib/services/song-status-service'
import { checkSunoJobStatusAction } from '@/lib/lyrics-actions'
import { getSongById } from '@/lib/db/queries/select'
import { updateSongStatusWithTracking, updateSongUrl, incrementStatusCheckCount } from '@/lib/db/queries/update'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const songId = parseInt(id, 10)

    if (isNaN(songId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid song ID' },
        { status: 400 }
      )
    }

    const songWithStatus = await getSongWithStatus(songId)

    if (!songWithStatus) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      song: songWithStatus
    })
  } catch (error) {
    console.error('Error getting song status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const songId = parseInt(id, 10)
    const { searchParams } = new URL(request.url)
    const directTaskId = searchParams.get('taskId')

    if (isNaN(songId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid song ID' },
        { status: 400 }
      )
    }

    // If direct taskId is provided, use it directly (most efficient)
    if (directTaskId) {
      const result = await checkSunoJobStatusAction(directTaskId)

      
      if (!result.success) {
        return NextResponse.json({
          success: true,
          status: {
            status: 'failed',
            isReady: false,
            error: result.error || 'Failed to check status'
          }
        })
      }

      // Handle different status responses
      switch (result.status) {
        case 'completed':
          if (result.audioUrl) {
            // Update song with completed status and URL
            await updateSongUrl(songId, result.audioUrl, result.duration?.toString())

            // Get the updated song data with status info
            const updatedSong = await getSongWithStatus(songId)

            return NextResponse.json({
              success: true,
              status: {
                status: 'ready',
                isReady: true,
                songUrl: result.audioUrl,
                duration: result.duration || undefined
              },
              song: updatedSong // Include updated song data with statusInfo
            })
          } else {
            await updateSongStatusWithTracking(songId, 'failed')
            return NextResponse.json({
              success: true,
              status: {
                status: 'failed',
                isReady: false,
                error: 'Song completed but no audio URL found'
              }
            })
          }

        case 'failed':
          await updateSongStatusWithTracking(songId, 'failed')
          return NextResponse.json({
            success: true,
            status: {
              status: 'failed',
              isReady: false,
              error: 'Song generation failed'
            }
          })

        case 'processing':
          await updateSongStatusWithTracking(songId, 'generating')
        // Fall through to default case for processing status

        default:
          await updateSongStatusWithTracking(songId, 'generating')
          const created = new Date()
          const estimatedMinutes = 7.5 // Average of 5-10 minutes
          const estimatedCompletion = new Date(created.getTime() + estimatedMinutes * 60 * 1000)

          return NextResponse.json({
            success: true,
            status: {
              status: 'processing',
              isReady: false,
              estimatedCompletion
            }
          })
      }
    }

    // Get the song from database to get the taskId
    const song = await getSongById(songId)
    if (!song) {
      return NextResponse.json(
        { success: false, error: 'Song not found' },
        { status: 404 }
      )
    }

    // If song is already completed and has URL, return ready status
    if (song.status === 'completed' && song.song_url) {
      // Get song with status info for consistent response format
      const songWithStatus = await getSongWithStatus(songId)
      
      return NextResponse.json({
        success: true,
        status: {
          status: 'ready',
          isReady: true,
          songUrl: song.song_url,
          duration: song.duration ? Number(song.duration) : undefined
        },
        song: songWithStatus // Include song data with statusInfo
      })
    }

    // If song doesn't have a task ID, it's not being processed
    if (!song.suno_task_id) {
      return NextResponse.json({
        success: true,
        status: {
          status: 'pending',
          isReady: false,
          error: 'No generation task found'
        }
      })
    }

    // Increment status check count
    await incrementStatusCheckCount(songId)

    // Check status directly with Suno API (same as /api/check-suno-job-status)
    const result = await checkSunoJobStatusAction(song.suno_task_id)

    if (!result.success) {
      // Update song status to failed if API check failed
      await updateSongStatusWithTracking(songId, 'failed')
      return NextResponse.json({
        success: true,
        status: {
          status: 'failed',
          isReady: false,
          error: result.error || 'Failed to check status'
        }
      })
    }

    // Handle different status responses
    switch (result.status) {
      case 'completed':
        if (result.audioUrl) {
          // Update song with completed status and URL
          await updateSongUrl(songId, result.audioUrl, result.duration?.toString())

                      // Get the updated song data with status info
            const updatedSong = await getSongWithStatus(songId)

          return NextResponse.json({
            success: true,
            status: {
              status: 'ready',
              isReady: true,
              songUrl: result.audioUrl,
              duration: result.duration || undefined
            },
            song: updatedSong // Include updated song data
          })
        } else {
          await updateSongStatusWithTracking(songId, 'failed')
          return NextResponse.json({
            success: true,
            status: {
              status: 'failed',
              isReady: false,
              error: 'Song completed but no audio URL found'
            }
          })
        }

      case 'failed':
        await updateSongStatusWithTracking(songId, 'failed')
        return NextResponse.json({
          success: true,
          status: {
            status: 'failed',
            isReady: false,
            error: 'Song generation failed'
          }
        })

      case 'processing':
        await updateSongStatusWithTracking(songId, 'generating')
      // Fall through to default case for processing status

      default:
        await updateSongStatusWithTracking(songId, 'generating')
        const created = new Date(song.created_at)
        const estimatedMinutes = 7.5 // Average of 5-10 minutes
        const estimatedCompletion = new Date(created.getTime() + estimatedMinutes * 60 * 1000)

        return NextResponse.json({
          success: true,
          status: {
            status: 'processing',
            isReady: false,
            estimatedCompletion
          }
        })
    }
  } catch (error) {
    console.error('Error checking song status:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
