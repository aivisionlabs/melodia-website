import { NextRequest } from 'next/server'

export interface UserContext {
  userId?: number
  anonymousUserId?: string
  isAuthenticated: boolean
}

/**
 * Extract user context from request headers set by middleware
 * This should be used in API routes to get user information
 */
export function getUserContextFromRequest(request: NextRequest): UserContext {
  const userIdHeader = request.headers.get('x-user-id')
  const anonymousUserIdHeader = request.headers.get('x-anonymous-user-id')
  const isAuthenticatedHeader = request.headers.get('x-is-authenticated')

  const userId = userIdHeader ? parseInt(userIdHeader, 10) : undefined
  const anonymousUserId = anonymousUserIdHeader || undefined
  const isAuthenticated = isAuthenticatedHeader === 'true'

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
