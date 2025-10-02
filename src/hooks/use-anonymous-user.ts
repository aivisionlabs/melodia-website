'use client'

import { useState, useEffect, useCallback } from 'react'
import { apiPost } from '@/lib/api-utils'

interface AnonymousUserState {
  anonymousUserId: string | null
  loading: boolean
  error: string | null
}

/**
 * Hook for managing anonymous user sessions
 * Automatically creates anonymous user on first visit
 * Persists session until browser close
 */
export const useAnonymousUser = () => {
  const [state, setState] = useState<AnonymousUserState>({
    anonymousUserId: null,
    loading: true,
    error: null
  })

  // Create anonymous user
  const createAnonymousUser = useCallback(async () => {
    try {
      const response = await apiPost('/api/users/anonymous', {})

      if (!response.ok) {
        throw new Error('Failed to create anonymous user')
      }

      const data = await response.json()

      if (data.success && data.anonymous_user_id) {
        // Store in localStorage (persists until browser close)
        localStorage.setItem('anonymous_user_id', data.anonymous_user_id)

        setState({
          anonymousUserId: data.anonymous_user_id,
          loading: false,
          error: null
        })

        return data.anonymous_user_id
      } else {
        throw new Error('Failed to create anonymous user')
      }
    } catch (error) {
      console.error('Error creating anonymous user:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create anonymous user'
      }))
      return null
    }
  }, [])

  // Initialize anonymous user on mount
  useEffect(() => {
    const initializeAnonymousUser = async () => {
      try {
        // Check if anonymous user already exists in localStorage
        const existingAnonymousId = localStorage.getItem('anonymous_user_id')

        if (existingAnonymousId) {
          // Verify the anonymous user still exists in database
          // For now, we'll trust localStorage, but in production you might want to verify
          setState({
            anonymousUserId: existingAnonymousId,
            loading: false,
            error: null
          })
        } else {
          // Create new anonymous user
          await createAnonymousUser()
        }
      } catch (error) {
        console.error('Error initializing anonymous user:', error)
        setState(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to initialize anonymous user'
        }))
      }
    }

    initializeAnonymousUser()
  }, [createAnonymousUser])

  // Clear anonymous user (useful when user logs in)
  const clearAnonymousUser = useCallback(() => {
    localStorage.removeItem('anonymous_user_id')
    setState({
      anonymousUserId: null,
      loading: false,
      error: null
    })
  }, [])

  return {
    anonymousUserId: state.anonymousUserId,
    loading: state.loading,
    error: state.error,
    createAnonymousUser,
    clearAnonymousUser
  }
}
