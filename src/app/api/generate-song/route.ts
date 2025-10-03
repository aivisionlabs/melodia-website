import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { db } from '@/lib/db'
import { songsTable, songRequestsTable, paymentsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/user-actions'
import { getUserContextFromRequest } from '@/lib/middleware-utils'

export async function POST(request: NextRequest) {
  try {
    const { recipientDetails, requestId, userId, anonymousUserId, title, lyrics, style } = await request.json()
    const demoMode = process.env.DEMO_MODE === 'true'

    if (!title || !lyrics || !style) {
      return NextResponse.json(
        { error: true, message: 'Missing required fields: title, lyrics, style' },
        { status: 400 }
      )
    }

    // Check payment status if requestId is provided
    if (requestId) {
      // Get user context from middleware
      const userContext = getUserContextFromRequest(request);

      // Get user ID from middleware, request body, or demo mode
      let currentUser = null;

      if (userContext.userId) {
        // Use authenticated user from middleware
        currentUser = { id: userContext.userId } as any;
      } else if (userId) {
        // Use provided userId (for registered users)
        currentUser = { id: userId } as any;
      } else if (demoMode) {
        // For demo mode, use a default user ID
        currentUser = { id: 1 } as any;
      } else {
        // Try to get from authentication (fallback)
        currentUser = await getCurrentUser();
        // If no authenticated user, we'll handle anonymous users below
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

      // Handle authorization for different user types
      if (!demoMode) {
        // Check if this is an anonymous user request
        console.log('Authorization check:', {
          anonymousUserId,
          dbAnonymousUserId: songRequest[0].anonymous_user_id,
          currentUser,
          dbUserId: songRequest[0].user_id
        });

        if ((userContext.anonymousUserId || anonymousUserId) && songRequest[0].anonymous_user_id === (userContext.anonymousUserId || anonymousUserId)) {
          // Anonymous user owns this request - allow access
          currentUser = { id: null, anonymousUserId: userContext.anonymousUserId || anonymousUserId } as any;
        }
        // Check if this is a registered user request
        else if (currentUser && songRequest[0].user_id === currentUser.id) {
          // Registered user owns this request - allow access
        }
        // Check if no user is logged in but the song request exists with user_id
        else if (!currentUser && songRequest[0].user_id) {
          // Use the user_id from the song request as the current user
          currentUser = { id: songRequest[0].user_id } as any;
        }
        // Check if no user is logged in but the song request exists with anonymous_user_id
        else if (!currentUser && songRequest[0].anonymous_user_id) {
          // Use the anonymous_user_id from the song request
          currentUser = { id: null, anonymousUserId: songRequest[0].anonymous_user_id } as any;
        }
        else {
          // No valid ownership found
          return NextResponse.json(
            { error: true, message: 'Unauthorized access' },
            { status: 403 }
          );
        }
      }

      // Check payment status only if payment is required and not in demo mode
      if (!demoMode) {
        // Check if there's a completed payment for this song request
        const payment = await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.song_request_id, requestId))
          .limit(1);

        // if (payment.length === 0 || payment[0].status !== 'completed') {
        //   return NextResponse.json(
        //     {
        //       error: true,
        //       message: 'Payment required',
        //       requiresPayment: true,
        //       paymentStatus: payment[0]?.status || 'pending'
        //     },
        //     { status: 402 }
        //   );
        // }
      }

      // Demo mode - return mock response without hitting real APIs
      if (demoMode) {
        console.log('🎭 DEMO MODE: Using mock response instead of real Suno API')

        const mockTaskId = `demo-task-${Date.now()}`

        // Check for existing song first, then create or update
        let songId: number | null = null
        try {
          // Check if song already exists for this request
          const existingSongs = await db
            .select()
            .from(songsTable)
            .where(eq(songsTable.song_request_id, requestId))
            .limit(1)

          if (existingSongs.length > 0) {
            // Song already exists - return existing song ID
            songId = existingSongs[0].id
            console.log('Demo mode: Found existing song:', { songId, requestId })

            // Update the existing song with new task ID
            await db
              .update(songsTable)
              .set({
                metadata: {
                  suno_task_id: mockTaskId,
                }
              })
              .where(eq(songsTable.id, songId))
          } else {
            // Create new song record
            const timestamp = Date.now()
            const randomSuffix = Math.random().toString(36).substring(2, 8)
            const slug = `${recipientDetails.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`

            const [song] = await db
              .insert(songsTable)
              .values({
                song_request_id: requestId,
                slug,
                status: 'PENDING',
                song_variants: {},
                variant_timestamp_lyrics_api_response: {},
                variant_timestamp_lyrics_processed: {},
                metadata: {
                  suno_task_id: mockTaskId,
                }
              })
              .returning({ id: songsTable.id })

            songId = song.id
            console.log('Demo song created in database:', { songId, taskId: mockTaskId })
          }

          await db
            .update(songRequestsTable)
            .set({
              status: 'PENDING'
            })
            .where(eq(songRequestsTable.id, requestId))

        } catch (dbError) {
          console.error('Database error in demo mode:', dbError)
          // If we still have a songId from existing song, continue
          if (!songId) {
            return NextResponse.json(
              { error: true, message: 'Failed to create or find song in demo mode' },
              { status: 500 }
            )
          }
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

      // Initialize Suno API
      const sunoAPI = SunoAPIFactory.getAPI()
      console.log('SunoAPI initialized:', typeof sunoAPI)
      // Generate song
      const generateRequest = {
        prompt: lyrics,
        style,
        title,
        customMode: true,
        instrumental: false,
        model: 'V4_5PLUS',
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

      // Check if the response has an error
      if (generateResponse.code !== 0 && generateResponse.code !== 200) {
        console.error('Suno API returned error:', generateResponse)
        return NextResponse.json(
          {
            error: true,
            message: generateResponse.msg || 'Suno API returned an error',
            code: generateResponse.code
          },
          { status: 400 }
        )
      }

      // Check if we have valid data
      if (!generateResponse.data || !generateResponse.data.taskId) {
        console.error('Invalid response from Suno API:', generateResponse)
        return NextResponse.json(
          { error: true, message: 'Invalid response from Suno API - no task ID received' },
          { status: 500 }
        )
      }

      const taskId = generateResponse.data.taskId;
      // Create or update song record in database
      let songId: number | null = null
      if (requestId) {
        try {
          // Check if song already exists for this request
          const existingSongs = await db
            .select()
            .from(songsTable)
            .where(eq(songsTable.song_request_id, requestId))
            .limit(1)

          let song
          if (existingSongs.length > 0) {
            // Update existing song
            song = existingSongs[0]
            console.log('🎵 Updating existing song:', song.id)

            await db
              .update(songsTable)
              .set({
                status: 'PENDING',
                metadata: {
                  suno_task_id: taskId,
                }
              })
              .where(eq(songsTable.id, song.id))
          } else {
            // Create new song record
            const timestamp = Date.now()
            const randomSuffix = Math.random().toString(36).substring(2, 8)
            const slug = `${recipientDetails.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`

            const [newSong] = await db
              .insert(songsTable)
              .values({
                song_request_id: requestId,
                slug,
                status: 'PENDING',
                song_variants: {},
                variant_timestamp_lyrics_api_response: {},
                variant_timestamp_lyrics_processed: {},
                metadata: {
                  suno_task_id: taskId,
                }
              })
              .returning({ id: songsTable.id })

            song = newSong
            console.log('🎵 Created new song:', song.id)
          }

          songId = song.id

          await db
            .update(songRequestsTable)
            .set({
              status: 'processing'
            })
            .where(eq(songRequestsTable.id, requestId))

          console.log('Song processed in database:', { songId, taskId })
        } catch (dbError) {
          console.error('Database error:', dbError)
          // Continue with response even if DB update fails
        }
      }

      return NextResponse.json({
        success: true,
        taskId,
        songId,
        message: 'Song generation completed successfully',
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