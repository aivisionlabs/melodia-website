import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'
import { db } from '@/lib/db'
import { songRequestsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/user-actions'
import { getUserContextFromRequest } from '@/lib/middleware-utils'
import { createOrUpdateSongWithTask } from '@/lib/db/services'

// Types for better type safety
interface GenerateSongRequest {
  recipientDetails: any
  requestId: number
  userId?: number
  anonymousUserId?: string
  title: string
  lyrics: string
  style: string
}

interface UserContext {
  id?: number | null
  anonymousUserId?: string
}

// Error response helper
function createErrorResponse(message: string, status: number = 500, additionalData?: any) {
  return NextResponse.json(
    { error: true, message, ...additionalData },
    { status }
  )
}

// Success response helper
function createSuccessResponse(data: any) {
  return NextResponse.json({
    success: true,
    ...data
  })
}

// Validation helper
function validateRequestData(data: any): { isValid: boolean; error?: string } {
  const { title, lyrics, style } = data

  if (!title || !lyrics || !style) {
    return { isValid: false, error: 'Missing required fields: title, lyrics, style' }
  }

  return { isValid: true }
}

// User context resolution helper
async function resolveUserContext(
  request: NextRequest,
  userId?: number,
  anonymousUserId?: string,
  demoMode: boolean = false
): Promise<UserContext> {
  const userContext = getUserContextFromRequest(request)

  if (userContext.userId) {
    return { id: userContext.userId }
  }

  if (userId) {
    return { id: userId }
  }

  if (demoMode) {
    return { id: 1 } // Default demo user
  }

  // Try to get from authentication (fallback)
  const currentUser = await getCurrentUser()
  if (currentUser) {
    return { id: currentUser.id }
  }

  // Handle anonymous users
  if (userContext.anonymousUserId || anonymousUserId) {
    return { anonymousUserId: userContext.anonymousUserId || anonymousUserId }
  }

  return {}
}

// Authorization helper
function validateUserAuthorization(
  currentUser: UserContext,
  songRequest: any,
  userContext: any,
  anonymousUserId?: string
): { isAuthorized: boolean; resolvedUser?: UserContext } {
  // Check if this is an anonymous user request
  if ((userContext.anonymousUserId || anonymousUserId) &&
    songRequest.anonymous_user_id === (userContext.anonymousUserId || anonymousUserId)) {
    return {
      isAuthorized: true,
      resolvedUser: { id: null, anonymousUserId: userContext.anonymousUserId || anonymousUserId }
    }
  }

  // Check if this is a registered user request
  if (currentUser.id && songRequest.user_id === currentUser.id) {
    return { isAuthorized: true, resolvedUser: currentUser }
  }

  // Check if no user is logged in but the song request exists with user_id
  if (!currentUser.id && songRequest.user_id) {
    return { isAuthorized: true, resolvedUser: { id: songRequest.user_id } }
  }

  // Check if no user is logged in but the song request exists with anonymous_user_id
  if (!currentUser.id && songRequest.anonymous_user_id) {
    return { isAuthorized: true, resolvedUser: { id: null, anonymousUserId: songRequest.anonymous_user_id } }
  }

  return { isAuthorized: false }
}

// Demo mode handler
async function handleDemoMode(
  requestId: number,
  recipientDetails: any
): Promise<NextResponse> {
  console.log('🎭 DEMO MODE: Using mock response instead of real Suno API')

  const mockTaskId = `demo-task-${Date.now()}`

  try {
    const songResult = await createOrUpdateSongWithTask(
      requestId,
      mockTaskId,
      recipientDetails,
      true // isDemoMode
    )

    if (!songResult.success) {
      return createErrorResponse(
        songResult.error || 'Failed to create or find song in demo mode',
        500
      )
    }

    return createSuccessResponse({
      taskId: mockTaskId,
      songId: songResult.songId,
      message: 'Demo song generation started successfully',
      demoMode: true
    })
  } catch (error) {
    console.error('Demo mode error:', error)
    return createErrorResponse('Failed to process demo song generation', 500)
  }
}

// Production mode handler
async function handleProductionMode(
  requestId: number,
  recipientDetails: any,
  title: string,
  lyrics: string,
  style: string,
  currentUser: UserContext
): Promise<NextResponse> {
  try {
    // Initialize Suno API
    const sunoAPI = SunoAPIFactory.getAPI()
    console.log('SunoAPI initialized:', typeof sunoAPI)

    // Build callback URL with user context for proper song association
    const callbackParams = new URLSearchParams()
    if (currentUser.id) {
      callbackParams.set('userId', currentUser.id.toString())
    }
    if (currentUser.anonymousUserId) {
      callbackParams.set('anonymousUserId', currentUser.anonymousUserId)
    }
    callbackParams.set('requestId', requestId.toString())

    const callBackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/suno-webhook?${callbackParams.toString()}`
    console.log("Generated callback URL:", callBackUrl)

    const generateRequest = {
      prompt: lyrics,
      style,
      title,
      customMode: true,
      instrumental: false,
      model: 'V5',
      callBackUrl,
    }

    console.log('Sending request to Suno API:', generateRequest)

    // Generate song via Suno API
    const generateResponse = await sunoAPI.generateSong(generateRequest)
    console.log('Suno API response:', generateResponse)

    // Validate Suno API response
    if (generateResponse.code !== 0 && generateResponse.code !== 200) {
      console.error('Suno API returned error:', generateResponse)
      return createErrorResponse(
        generateResponse.msg || 'Suno API returned an error',
        400,
        { code: generateResponse.code }
      )
    }

    if (!generateResponse.data || !generateResponse.data.taskId) {
      console.error('Invalid response from Suno API:', generateResponse)
      return createErrorResponse('Invalid response from Suno API - no task ID received', 500)
    }

    const taskId = generateResponse.data.taskId

    // Update song with task ID
    let songId: number | null = null
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

    return createSuccessResponse({
      taskId,
      songId,
      message: 'Song generation completed successfully',
    })

  } catch (apiError) {
    console.error('Suno API error:', apiError)
    return createErrorResponse('Failed to generate song with Suno API', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const requestData: GenerateSongRequest = await request.json()
    const { recipientDetails, requestId, userId, anonymousUserId, title, lyrics, style } = requestData
    const demoMode = process.env.DEMO_MODE === 'true'

    // Validate request data
    const validation = validateRequestData(requestData)
    if (!validation.isValid) {
      return createErrorResponse(validation.error!, 400)
    }

    // Request ID is required
    if (!requestId) {
      return createErrorResponse('Request ID is required', 400)
    }

    // Get song request from database
    const songRequestResult = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1)

    if (songRequestResult.length === 0) {
      return createErrorResponse('Song request not found', 404)
    }

    const songRequest = songRequestResult[0]

    // Resolve user context
    const currentUser = await resolveUserContext(request, userId, anonymousUserId, demoMode)

    // Handle authorization for production mode
    if (!demoMode) {
      const userContext = getUserContextFromRequest(request)
      console.log('Authorization check:', {
        anonymousUserId,
        dbAnonymousUserId: songRequest.anonymous_user_id,
        currentUser,
        dbUserId: songRequest.user_id
      })

      const authResult = validateUserAuthorization(currentUser, songRequest, userContext, anonymousUserId)

      if (!authResult.isAuthorized) {
        return createErrorResponse('Unauthorized access', 403)
      }

      // Use the resolved user context
      if (authResult.resolvedUser) {
        Object.assign(currentUser, authResult.resolvedUser)
      }
    }

    // Route to appropriate handler based on mode
    if (demoMode) {
      return await handleDemoMode(requestId, recipientDetails)
    } else {
      return await handleProductionMode(
        requestId,
        recipientDetails,
        title,
        lyrics,
        style,
        currentUser
      )
    }

  } catch (error) {
    console.error('Error generating song:', error)
    return createErrorResponse('Failed to generate song', 500)
  }
}