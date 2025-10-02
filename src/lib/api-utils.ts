/**
 * Utility functions for making API calls with user context
 */

/**
 * Get default headers for API requests including user context
 */
export function getApiHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  // Add anonymous user ID from localStorage if available
  if (typeof window !== 'undefined') {
    const anonymousUserId = localStorage.getItem('anonymous_user_id')
    if (anonymousUserId) {
      headers['x-local-anonymous-user-id'] = anonymousUserId
    }
  }

  return headers
}

/**
 * Enhanced fetch function that automatically includes user context headers
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const defaultHeaders = getApiHeaders()

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  }

  return fetch(url, mergedOptions)
}

/**
 * Make a POST request with user context
 */
export async function apiPost(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(url, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * Make a GET request with user context
 */
export async function apiGet(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(url, {
    method: 'GET',
    ...options,
  })
}

/**
 * Make a PATCH request with user context
 */
export async function apiPatch(
  url: string,
  data: any,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(url, {
    method: 'PATCH',
    body: JSON.stringify(data),
    ...options,
  })
}

/**
 * Make a DELETE request with user context
 */
export async function apiDelete(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return apiFetch(url, {
    method: 'DELETE',
    ...options,
  })
}
