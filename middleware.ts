import { NextRequest, NextResponse } from 'next/server'

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
    '/api/songs/best'
  ]

  const isPublicEndpoint = publicEndpoints.some(endpoint =>
    pathname.startsWith(endpoint)
  )

  if (isPublicEndpoint) {
    return NextResponse.next()
  }

  // Extract user context
  const userContext = extractUserContext(request)

  // Create response
  const response = NextResponse.next()

  // Add user context to request headers for API routes to access
  if (userContext.userId) {
    response.headers.set('x-user-id', userContext.userId.toString())
  }

  if (userContext.anonymousUserId) {
    response.headers.set('x-anonymous-user-id', userContext.anonymousUserId)
  }

  response.headers.set('x-is-authenticated', userContext.isAuthenticated.toString())

  return response
}

/**
 * Extract user context from cookies and request headers
 */
function extractUserContext(request: NextRequest): UserContext {
  let userId: number | undefined
  let anonymousUserId: string | undefined
  let isAuthenticated = false

  // Try to get authenticated user from session cookie
  const sessionCookie = request.cookies.get('user-session')
  if (sessionCookie?.value) {
    try {
      const userSession = JSON.parse(sessionCookie.value)
      if (userSession && typeof userSession.id === 'number') {
        userId = userSession.id
        isAuthenticated = true
      }
    } catch (error) {
      console.warn('Invalid user session cookie:', error)
    }
  }

  // Try to get anonymous user ID from request headers (sent by frontend)
  const anonymousUserIdHeader = request.headers.get('x-anonymous-user-id')
  if (anonymousUserIdHeader) {
    anonymousUserId = anonymousUserIdHeader
  }

  // If no authenticated user, try to get anonymous user ID from localStorage via custom header
  // This is set by the frontend when making API calls
  if (!isAuthenticated && !anonymousUserId) {
    const localStorageAnonymousId = request.headers.get('x-local-anonymous-user-id')
    if (localStorageAnonymousId) {
      anonymousUserId = localStorageAnonymousId
    }
  }

  return {
    userId,
    anonymousUserId,
    isAuthenticated
  }
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
