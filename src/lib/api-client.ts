import { useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useAnonymousUser } from '@/hooks/use-anonymous-user'

/**
 * Centralized API client for making authenticated requests
 * Handles both authenticated users and anonymous users automatically
 */
export class AuthenticatedApiClient {
  private baseUrl: string

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl
  }

  /**
   * Make an authenticated GET request
   */
  async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    })
  }

  /**
   * Make an authenticated POST request
   */
  async post(endpoint: string, body?: any, options: RequestInit = {}): Promise<Response> {
    return this.request(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: body ? JSON.stringify(body) : undefined,
      ...options
    })
  }

  /**
   * Make an authenticated request with proper headers
   */
  async request(endpoint: string, options: RequestInit = {}): Promise<Response> {
    // Get anonymous user ID from localStorage if available
    const anonymousUserId = typeof window !== 'undefined'
      ? localStorage.getItem('anonymous_user_id')
      : null

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    }

    // Add anonymous user ID header if available (for anonymous users or pre-merge scenarios)
    if (anonymousUserId) {
      headers['x-local-anonymous-user-id'] = anonymousUserId
    }

    return fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include'
    })
  }
}

/**
 * Hook for making authenticated API calls
 * Automatically handles user context and headers
 */
export const useAuthenticatedApi = () => {
  const { user } = useAuth()
  const { anonymousUserId } = useAnonymousUser()

  // Memoize the API client to prevent infinite re-renders
  const apiClient = useMemo(() => new AuthenticatedApiClient(), [])

  return {
    apiClient,
    user,
    anonymousUserId,
    isAuthenticated: !!user,
    hasUserContext: !!(user || anonymousUserId)
  }
}

/**
 * Utility function for making authenticated API calls outside of React components
 */
export const makeAuthenticatedRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> => {
  const client = new AuthenticatedApiClient()
  return client.request(endpoint, options)
}
