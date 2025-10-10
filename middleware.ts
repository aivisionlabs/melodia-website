import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'

interface UserContext {
  userId?: number
  anonymousUserId?: string
  isAuthenticated: boolean
}

/**
 * Middleware to extract user context from cookies and headers
 * Adds user information to request headers for API routes to access
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply middleware to API routes
  if (!pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  // Skip middleware for certain public endpoints
  const publicEndpoints = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    '/api/users/anonymous',
    '/api/webhooks/',
    '/api/suno-webhook',
    '/api/song-callback',
    '/api/payments/verify',
    '/api/payments/status/',
    '/api/pricing-plans',
    '/api/songs/best-songs'
  ]

  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    pathname.startsWith(endpoint)
  )

  if (isPublicEndpoint) {
    return NextResponse.next()
  }

  // Extract user context
  const userContext = extractUserContext(request)

  // Create response with modified request headers
  const requestHeaders = new Headers(request.headers)

  // Add user context to request headers for API routes to access
  if (userContext.userId) {
    requestHeaders.set('x-user-id', userContext.userId.toString())
  }

  if (userContext.anonymousUserId) {
    requestHeaders.set('x-anonymous-user-id', userContext.anonymousUserId)
  }

  requestHeaders.set('x-is-authenticated', userContext.isAuthenticated.toString())

  // Create new request with modified headers
  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return response
}

/**
 * Extract user context from cookies and request headers
 * This is the central authentication system for the application
 */
function extractUserContext(request: NextRequest): UserContext {
  let userId: number | undefined
  let anonymousUserId: string | undefined
  let isAuthenticated = false

  // Try to get authenticated user from JWT token
  const authToken = request.cookies.get('auth-token')
  if (authToken?.value) {
    try {
      const payload = verifyJWT(authToken.value)
      if (payload && payload.userId) {
        userId = parseInt(payload.userId, 10)
        isAuthenticated = true
      }
    } catch (error) {
      console.warn('Invalid JWT token:', error)
    }
  }

  // Only process anonymous user ID if no authenticated user
  // This prevents confusion when both JWT and anonymous ID exist (during transition)
  if (!isAuthenticated) {
    // Try to get anonymous user ID from localStorage header (sent by frontend)
    const localStorageAnonymousId = request.headers.get('x-local-anonymous-user-id')
    if (localStorageAnonymousId) {
      anonymousUserId = localStorageAnonymousId
    }

    // Validate anonymous user ID format if present
    if (anonymousUserId && !isValidAnonymousUserId(anonymousUserId)) {
      console.warn('Invalid anonymous user ID format:', anonymousUserId)
      anonymousUserId = undefined
    }
  }

  return {
    userId,
    anonymousUserId,
    isAuthenticated
  }
}

/**
 * Validate anonymous user ID format
 * Anonymous user IDs should be UUIDs
 */
function isValidAnonymousUserId(id: string): boolean {
  // UUID v4 format validation
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}
