'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // For now, we'll check localStorage for a simple session
        // In a real implementation, you'd verify the session with the server
        const sessionData = localStorage.getItem('user-session')

        if (sessionData) {
          try {
            const user = JSON.parse(sessionData) as User
            setAuthState({
              user,
              loading: false,
              error: null
            })
          } catch {
            // Invalid session data, clear it
            localStorage.removeItem('user-session')
            setAuthState({
              user: null,
              loading: false,
              error: null
            })
          }
        } else {
          setAuthState({
            user: null,
            loading: false,
            error: null
          })
        }
      } catch (error) {
        console.error('Error checking session:', error)
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to check session'
        })
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, anonymous_user_id: localStorage.getItem('anonymous_user_id') || undefined })
      })

      const result = await response.json()

      if (result.success && result.user) {
        // Store user data in localStorage (simplified session management)
        localStorage.setItem('user-session', JSON.stringify(result.user))
        // Clear anonymous id after merge
        localStorage.removeItem('anonymous_user_id')

        setAuthState({
          user: result.user,
          loading: false,
          error: null
        })

        return { success: true }
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Login failed'
        }))

        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Login error:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred'
      }))

      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [])

  const register = useCallback(async (email: string, password: string, name: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, name, anonymous_user_id: localStorage.getItem('anonymous_user_id') || undefined })
      })

      const result = await response.json()

      if (result.success && result.user) {
        // Store user data in localStorage (simplified session management)
        localStorage.setItem('user-session', JSON.stringify(result.user))
        // Clear anonymous id after signup
        localStorage.removeItem('anonymous_user_id')

        setAuthState({
          user: result.user,
          loading: false,
          error: null
        })

        return { success: true }
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Registration failed'
        }))

        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Registration error:', error)
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: 'An unexpected error occurred'
      }))

      return { success: false, error: 'An unexpected error occurred' }
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }))

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      const result = await response.json()

      if (result.success) {
        // Clear session data
        localStorage.removeItem('user-session')

        setAuthState({
          user: null,
          loading: false,
          error: null
        })

        return { success: true }
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: result.error || 'Logout failed'
        }))

        return { success: false, error: result.error }
      }
    } catch (error) {
      console.error('Logout error:', error)

      // Even if logout fails, clear local session
      localStorage.removeItem('user-session')

      setAuthState({
        user: null,
        loading: false,
        error: null
      })

      return { success: true }
    }
  }, [])

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    clearError,
    isAuthenticated: !!authState.user
  }
}
