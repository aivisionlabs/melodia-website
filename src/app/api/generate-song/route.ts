import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { db } from '@/lib/db'
import { songsTable, songRequestsTable, paymentsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/user-actions'

export async function POST(request: NextRequest) {
  try {
    const { title, lyrics, style, recipient_name, requestId, demoMode, userId } = await request.json()

    console.log('Received request:', { title, lyrics: lyrics?.substring(0, 100) + '...', style, recipient_name, demoMode })

    if (!title || !lyrics || !style) {
      console.log('Missing required fields:', { title: !!title, lyrics: !!lyrics, style: !!style })
      return NextResponse.json(
        { error: true, message: 'Missing required fields: title, lyrics, style' },
        { status: 400 }
      )
    }

    // Check payment status if requestId is provided
    if (requestId) {
      // Get user ID from request body or try authentication
      let currentUser = null;
      
      if (userId) {
        // Use provided userId
        currentUser = { id: userId } as any;
      } else {
        // Try to get from authentication
        currentUser = await getCurrentUser();
        if (!currentUser) {
          return NextResponse.json(
            { error: true, message: 'User ID or authentication required' },
            { status: 401 }
          );
        }
      }

      // Get song request
      const songRequest = await db
        .select()
        .from(songRequestsTable)
        .where(eq(songRequestsTable.id, requestId))
        .limit(1);

      if (songRequest.length === 0) {
        return NextResponse.json(
          { error: true, message: 'Song request not found' },
          { status: 404 }
        );
      }

      if (songRequest[0].user_id !== currentUser.id) {
        return NextResponse.json(
          { error: true, message: 'Unauthorized access' },
          { status: 403 }
        );
      }

      // Check payment status only if payment is required
      if (songRequest[0].payment_required) {
        if (songRequest[0].payment_id) {
          const payment = await db
            .select()
            .from(paymentsTable)
            .where(eq(paymentsTable.id, songRequest[0].payment_id))
            .limit(1);

          if (payment.length === 0 || payment[0].status !== 'completed') {
            return NextResponse.json(
              { 
                error: true, 
                message: 'Payment required',
                requiresPayment: true,
                paymentStatus: payment[0]?.status || 'pending'
              },
              { status: 402 }
            );
          }
        } else {
          // No payment associated with this request
          return NextResponse.json(
            { 
              error: true, 
              message: 'Payment required',
              requiresPayment: true
            },
            { status: 402 }
          );
        }
      }

      // Demo mode - return mock response without hitting real APIs
      if (demoMode) {
        console.log('🎭 DEMO MODE: Using mock response instead of real Suno API')
        
        const mockTaskId = `demo-task-${Date.now()}`
        
        // Still create song record in database for testing
        let songId: number | null = null
        try {
          const timestamp = Date.now()
          const randomSuffix = Math.random().toString(36).substring(2, 8)
          const slug = `${recipient_name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`

          const [song] = await db
            .insert(songsTable)
            .values({
              song_request_id: requestId,
              user_id: currentUser.id,
              title,
              lyrics,
              music_style: style,
              service_provider: 'Suno',
              song_requester: recipient_name,
              prompt: `Personalized song for ${recipient_name}`,
              slug,
              status: 'processing',
              suno_task_id: mockTaskId,
              metadata: {
                original_request_id: requestId,
                demo_mode: true
              }
            })
            .returning({ id: songsTable.id })

          songId = song.id

          await db
            .update(songRequestsTable)
            .set({
              status: 'processing',
              suno_task_id: mockTaskId,
              generated_song_id: songId
            })
            .where(eq(songRequestsTable.id, requestId))

          console.log('Demo song created in database:', { songId, taskId: mockTaskId })
        } catch (dbError) {
          console.error('Database error in demo mode:', dbError)
        }

        return NextResponse.json({
          success: true,
          taskId: mockTaskId,
          songId,
          message: 'Demo song generation started successfully',
          demoMode: true
        })
      }

      // If not demo mode, proceed with real API call
      // Create the prompt for Suno API
      const prompt = `Title: ${title}\n\nLyrics:\n${lyrics}\n\nStyle: ${style}`

      // Initialize Suno API
      const sunoAPI = SunoAPIFactory.getAPI()
      console.log('SunoAPI initialized:', typeof sunoAPI)

      // Generate song
      const generateRequest = {
        prompt,
        style,
        title,
        customMode: true,
        instrumental: false,
        model: 'V4',  
        callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/song-callback`
      }
      
      console.log('Sending request to Suno API:', generateRequest)
      
      let generateResponse;
      try {
        generateResponse = await sunoAPI.generateSong(generateRequest)
        console.log('Suno API response:', generateResponse)
      } catch (apiError) {
        console.error('Suno API error:', apiError)
        return NextResponse.json(
          { error: true, message: 'Failed to generate song with Suno API' },
          { status: 500 }
        )
      }

      const taskId = generateResponse.data.taskId
      console.log('Generated task ID:', taskId)

      // Create song record in database
      let songId: number | null = null
      if (requestId) {
        try {
          const timestamp = Date.now()
          const randomSuffix = Math.random().toString(36).substring(2, 8)
          const slug = `${recipient_name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`

          const [song] = await db
            .insert(songsTable)
            .values({
              song_request_id: requestId,
              user_id: currentUser.id,
              title,
              lyrics,
              music_style: style,
              service_provider: 'Suno',
              song_requester: recipient_name,
              prompt: `Personalized song for ${recipient_name}`,
              slug,
              status: 'processing',
              suno_task_id: taskId,
              metadata: {
                original_request_id: requestId,
                demo_mode: false
              }
            })
            .returning({ id: songsTable.id })

          songId = song.id

          await db
            .update(songRequestsTable)
            .set({
              status: 'processing',
              suno_task_id: taskId,
              generated_song_id: songId
            })
            .where(eq(songRequestsTable.id, requestId))

          console.log('Song created in database:', { songId, taskId })
        } catch (dbError) {
          console.error('Database error:', dbError)
          // Continue with response even if DB update fails
        }
      }

      return NextResponse.json({
        success: true,
        taskId,
        songId,
        message: 'Song generation started successfully'
      })
    }

    // If no requestId, return error
    return NextResponse.json(
      { error: true, message: 'Request ID is required' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error generating song:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to generate song' },
      { status: 500 }
    )
  }
}