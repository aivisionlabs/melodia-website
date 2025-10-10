import { NextRequest } from 'next/server'
import { verifyJWT } from '@/lib/auth/jwt'

export interface UserContext {
  userId?: number
  anonymousUserId?: string
  isAuthenticated: boolean
}

/**
 * Extract user context from request headers set by middleware or directly from cookies/headers
 * This should be used in API routes to get user information
 */
export function getUserContextFromRequest(request: NextRequest): UserContext {
  // First try to get from middleware headers
  const userIdHeader = request.headers.get('x-user-id')
  const anonymousUserIdHeader = request.headers.get('x-anonymous-user-id')
  const isAuthenticatedHeader = request.headers.get('x-is-authenticated')

  if (userIdHeader || anonymousUserIdHeader || isAuthenticatedHeader) {
    const userId = userIdHeader ? parseInt(userIdHeader, 10) : undefined
    const anonymousUserId = anonymousUserIdHeader || undefined
    const isAuthenticated = isAuthenticatedHeader === 'true'

    return {
      userId,
      anonymousUserId,
      isAuthenticated
    }
  }

  // Fallback: Extract directly from cookies and headers (if middleware didn't run)
  return extractUserContextDirect(request)
}

/**
 * Direct extraction from cookies and headers (fallback when middleware doesn't run)
 */
function extractUserContextDirect(request: NextRequest): UserContext {
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
      console.warn('Invalid JWT token in direct extraction:', error)
    }
  }

  // Try to get anonymous user ID from request headers (sent by frontend)
  const localStorageAnonymousId = request.headers.get('x-local-anonymous-user-id')
  if (localStorageAnonymousId) {
    anonymousUserId = localStorageAnonymousId
  }

  return {
    userId,
    anonymousUserId,
    isAuthenticated
  }
}

/**
 * Get the current user ID from request context
 * Returns either authenticated user ID or anonymous user ID
 */
export function getCurrentUserId(request: NextRequest): number | string | null {
  const context = getUserContextFromRequest(request)

  if (context.userId) {
    return context.userId
  }

  if (context.anonymousUserId) {
    return context.anonymousUserId
  }

  return null
}

/**
 * Check if the request has any user context (authenticated or anonymous)
 */
export function hasUserContext(request: NextRequest): boolean {
  const context = getUserContextFromRequest(request)
  return !!(context.userId || context.anonymousUserId)
}

/**
 * Validate that the request has proper user context
 * Throws an error if no user context is found
 */
export function requireUserContext(request: NextRequest): UserContext {
  const context = getUserContextFromRequest(request)

  if (!context.userId && !context.anonymousUserId) {
    throw new Error('No user context found in request')
  }

  return context
}
