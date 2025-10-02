'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@/types'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false
  })

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check authentication status via API (JWT cookie will be sent automatically)
        const response = await fetch('/api/auth/me', {
          method: 'GET',
          credentials: 'include', // Include cookies
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data.user) {
            setAuthState({
              user: data.data.user,
              loading: false,
              error: null,
              isAuthenticated: true
            });
          } else {
            setAuthState({
              user: null,
              loading: false,
              error: null,
              isAuthenticated: false
            });
          }
        } else {
          // No valid session
          setAuthState({
            user: null,
            loading: false,
            error: null,
            isAuthenticated: false
          });
        }
      } catch (error) {
        console.error('Session check error:', error);
        setAuthState({
          user: null,
          loading: false,
          error: 'Failed to check authentication status',
          isAuthenticated: false
        });
      }
    };

    checkSession();
  }, []);

  // Login function (for future use)
  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setAuthState({
          user: data.data.user,
          loading: false,
          error: null,
          isAuthenticated: true
        });
        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: data.error?.message || 'Login failed'
        }));
        return { success: false, error: data.error?.message };
      }
    } catch (error) {
      const errorMessage = 'Network error. Please try again.';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      return { success: false, error: errorMessage };
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setAuthState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false
      });
    }
  }, []);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data.user) {
          setAuthState(prev => ({
            ...prev,
            user: data.data.user,
            isAuthenticated: true
          }));
        }
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,
    refreshUser
  };
};