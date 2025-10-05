import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { db } from '@/lib/db'
import { songRequestsTable, paymentsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/user-actions'
import { getUserContextFromRequest } from '@/lib/middleware-utils'
import { createOrUpdateSongWithTask } from '@/lib/db/services'

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
        await db
          .select()
          .from(paymentsTable)
          .where(eq(paymentsTable.song_request_id, requestId))
          .limit(1);

        // Payment validation is currently disabled
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

        // Use unified service for song creation/update
        const songResult = await createOrUpdateSongWithTask(
          requestId,
          mockTaskId,
          recipientDetails,
          true // isDemoMode
        )

        if (!songResult.success) {
          return NextResponse.json(
            { error: true, message: songResult.error || 'Failed to create or find song in demo mode' },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          taskId: mockTaskId,
          songId: songResult.songId,
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
        model: 'V5',
        callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/song-callback`
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

      // Use unified service for song creation/update
      let songId: number | null = null
      if (requestId) {
        const songResult = await createOrUpdateSongWithTask(
          requestId,
          taskId,
          recipientDetails,
          false // isDemoMode
        )

        if (!songResult.success) {
          console.error('Failed to create or update song:', songResult.error)
          // Continue with response even if DB update fails
        } else {
          songId = songResult.songId || null
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