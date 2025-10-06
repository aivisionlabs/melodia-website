'use client';

import { useState, useEffect, useCallback } from 'react';
import { User } from '@/types';
import { apiPost } from '@/lib/api-utils';

interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

export const useAuth = () => {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        loading: true,
        error: null,
        isAuthenticated: false,
    });

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
                            isAuthenticated: true,
                        });
                    } else {
                        setAuthState({
                            user: null,
                            loading: false,
                            error: null,
                            isAuthenticated: false,
                        });
                    }
                } else {
                    // No valid session
                    setAuthState({
                        user: null,
                        loading: false,
                        error: null,
                        isAuthenticated: false,
                    });
                }
            } catch (error) {
                console.error('Session check error:', error);
                setAuthState({
                    user: null,
                    loading: false,
                    error: 'Failed to check authentication status',
                    isAuthenticated: false,
                });
            }
        };

        checkSession();
    }, []);

    // Login function (for future use)
    const login = useCallback(async (email: string, password: string) => {
        setAuthState((prev) => ({ ...prev, loading: true, error: null }));

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password,
                    anonymous_user_id:
                        localStorage.getItem('anonymous_user_id') || undefined,
                }),
            });

            const data = await response.json();

            if (data.success) {
                // Store user data in localStorage for consistency
                localStorage.setItem('user-session', JSON.stringify(data.data.user));
                
                setAuthState({
                    user: data.data.user,
                    loading: false,
                    error: null,
                    isAuthenticated: true,
                });
                
                return { success: true };
            } else {
                setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: data.error?.message || 'Login failed',
                }));
                return { success: false, error: data.error?.message };
            }
        } catch (error) {
            const errorMessage = 'Network error. Please try again.';
            setAuthState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            return { success: false, error: errorMessage };
        }
    }, []);

    const register = useCallback(
        async (email: string, password: string, name: string) => {
            setAuthState((prev) => ({ ...prev, loading: true, error: null }));

            try {
                const response = await apiPost('/api/auth/register', {
                    email,
                    password,
                    name,
                    anonymous_user_id:
                        localStorage.getItem('anonymous_user_id') || undefined,
                });

                const result = await response.json();

                if (result.success && result.user) {
                    // Store user data in localStorage (simplified session management)
                    localStorage.setItem(
                        'user-session',
                        JSON.stringify(result.user)
                    );
                    // Clear anonymous id after signup
                    localStorage.removeItem('anonymous_user_id');

                    setAuthState({
                        user: result.user,
                        loading: false,
                        error: null,
                        isAuthenticated: true,
                    });

                    return { success: true };
                } else {
                    setAuthState((prev) => ({
                        ...prev,
                        loading: false,
                        error: result.error || 'Registration failed',
                    }));

                    return { success: false, error: result.error };
                }
            } catch (error) {
                console.error('Registration error:', error);
                setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: 'An unexpected error occurred',
                }));

                return {
                    success: false,
                    error: 'An unexpected error occurred',
                };
            }
        },
        []
    );

    // Logout function
    const logout = useCallback(async () => {
        try {
            const response = await apiPost(
                '/api/auth/logout',
                {},
                {
                    credentials: 'include',
                }
            );

            const result = await response.json();

            if (result.success) {
                // Clear session data
                localStorage.removeItem('user-session');

                setAuthState({
                    user: null,
                    loading: false,
                    error: null,
                    isAuthenticated: false,
                });

                return { success: true };
            } else {
                setAuthState((prev) => ({
                    ...prev,
                    loading: false,
                    error: result.error || 'Logout failed',
                }));

                return { success: false, error: result.error };
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setAuthState({
                user: null,
                loading: false,
                error: null,
                isAuthenticated: false,
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
                    setAuthState((prev) => ({
                        ...prev,
                        user: data.data.user,
                        isAuthenticated: true,
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
        register,
        logout,
        refreshUser,
    };
};
