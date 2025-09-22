import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { db } from '@/lib/db'
import { songsTable, songRequestsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params

    if (!taskId) {
      return NextResponse.json(
        { error: true, message: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Demo mode - return mock response for demo tasks
    if (taskId.startsWith('demo-task-')) {
      console.log('🎭 DEMO MODE: Using mock song status response')
      
      // Simulate processing time - return completed after 2 minutes
      const taskTimestamp = parseInt(taskId.split('-')[2])
      const elapsedTime = Date.now() - taskTimestamp
      const isCompleted = elapsedTime > 120000 // 2 minutes

      if (isCompleted) {
        // Update database with completed demo song
        try {
          const songs = await db
            .select()
            .from(songsTable)
            .where(eq(songsTable.suno_task_id, taskId))

          if (songs.length > 0) {
            const song = songs[0]
            const demoAudioUrl = 'https://demo-audio-url.com/song.mp3'
            
            // Create demo variants
            const demoVariants = [
              {
                id: 'demo-variant-1',
                audioUrl: demoAudioUrl,
                streamAudioUrl: demoAudioUrl,
                imageUrl: 'https://demo-image-url.com/song1.jpg',
                prompt: 'Demo song variant 1',
                modelName: 'demo-model',
                title: 'Demo Song - Variant 1',
                tags: 'demo,test',
                createTime: new Date().toISOString(),
                duration: 180
              },
              {
                id: 'demo-variant-2',
                audioUrl: 'https://demo-audio-url.com/song-variant2.mp3',
                streamAudioUrl: 'https://demo-stream-url.com/song-variant2.mp3',
                imageUrl: 'https://demo-image-url.com/song2.jpg',
                prompt: 'Demo song variant 2',
                modelName: 'demo-model',
                title: 'Demo Song - Variant 2',
                tags: 'demo,test,alternative',
                createTime: new Date().toISOString(),
                duration: 165
              }
            ]
            
            await db
              .update(songsTable)
              .set({
                status: 'ready',
                song_url: demoAudioUrl,
                duration: 180,
                suno_variants: demoVariants,
                selected_variant: 0
              })
              .where(eq(songsTable.id, song.id))

            await db
              .update(songRequestsTable)
              .set({
                status: 'completed'
              })
              .where(eq(songRequestsTable.generated_song_id, song.id))

            console.log('Demo song completed and updated in database:', { songId: song.id })
          }
        } catch (dbError) {
          console.error('Database update error in demo mode:', dbError)
        }

        return NextResponse.json({
          success: true,
          status: 'completed',
          audioUrl: 'https://demo-audio-url.com/song.mp3',
          variants: [{
            audioUrl: 'https://demo-audio-url.com/song.mp3',
            streamAudioUrl: 'https://demo-stream-url.com/song.mp3',
            duration: 180
          }],
          demoMode: true
        })
      } else {
        return NextResponse.json({
          success: true,
          status: 'processing',
          message: 'Demo song is still being generated',
          demoMode: true
        })
      }
    }

    // Initialize Suno API
    const sunoAPI = SunoAPIFactory.getAPI()

    // Get song status
    const statusResponse = await sunoAPI.getRecordInfo(taskId)
    console.log('statusResponse', statusResponse.data)
    if (statusResponse.code !== 0 && statusResponse.code !== 200) {
      return NextResponse.json(
        { error: true, message: statusResponse.msg },
        { status: 400 }
      )
    }

    const { status, response } = statusResponse.data
    console.log('Suno API status:', status, 'Response:', response)

    if (status === 'SUCCESS' && response?.sunoData?.length > 0) {
      // Update database with completed song
      try {
        // Find song by task ID
        const songs = await db
          .select()
          .from(songsTable)
          .where(eq(songsTable.suno_task_id, taskId))

        if (songs.length > 0) {
          const song = songs[0]
          const audioUrl = response.sunoData[0].audioUrl || response.sunoData[0].streamAudioUrl
          
          // Update song with audio URL and ready status
          // Convert duration from float to integer (round to nearest second)
          const duration = response.sunoData[0].duration ? Math.round(response.sunoData[0].duration) : null
          
          // Store all variants in the suno_variants field
          const variants = response.sunoData.map((variant: any) => ({
            id: variant.id,
            audioUrl: variant.audioUrl,
            streamAudioUrl: variant.streamAudioUrl,
            imageUrl: variant.imageUrl,
            prompt: variant.prompt,
            modelName: variant.modelName,
            title: variant.title,
            tags: variant.tags,
            createTime: variant.createTime,
            duration: Math.round(variant.duration) // Convert to integer
          }))
          
          await db
            .update(songsTable)
            .set({
              status: 'ready',
              song_url: audioUrl, // Primary variant (first one)
              duration: duration,
              suno_variants: variants,
              selected_variant: 0 // Default to first variant
            })
            .where(eq(songsTable.id, song.id))

          // Update song request status
          await db
            .update(songRequestsTable)
            .set({
              status: 'completed'
            })
            .where(eq(songRequestsTable.generated_song_id, song.id))

          console.log('Song completed and updated in database:', { songId: song.id, audioUrl })
        }
      } catch (dbError) {
        console.error('Database update error:', dbError)
        // Continue with response even if DB update fails
      }

      // Return the first variant's audio URL
      const audioUrl = response.sunoData[0].audioUrl || response.sunoData[0].streamAudioUrl
      
      return NextResponse.json({
        success: true,
        status: 'completed',
        audioUrl,
        variants: response.sunoData
      })
    } else if (status === 'FAILED' || status === 'failed') {
      // Update database with failed status
      try {
        const songs = await db
          .select()
          .from(songsTable)
          .where(eq(songsTable.suno_task_id, taskId))

        if (songs.length > 0) {
          const song = songs[0]
          
          // Update song with failed status
          await db
            .update(songsTable)
            .set({
              status: 'failed'
            })
            .where(eq(songsTable.id, song.id))

          // Update song request status
          await db
            .update(songRequestsTable)
            .set({
              status: 'failed'
            })
            .where(eq(songRequestsTable.generated_song_id, song.id))

          console.log('Song failed and updated in database:', { songId: song.id })
        }
      } catch (dbError) {
        console.error('Database update error:', dbError)
      }

      return NextResponse.json({
        success: true,
        status: 'failed',
        errorMessage: statusResponse.data.errorMessage || 'Song generation failed'
      })
    } else {
      // Handle other status values (PROCESSING, PENDING, etc.)
      console.log('Song still processing with status:', status)
      return NextResponse.json({
        success: true,
        status: 'processing',
        message: `Song is still being generated (status: ${status})`
      })
    }

  } catch (error) {
    console.error('Error checking song status:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to check song status' },
      { status: 500 }
    )
  }
}
