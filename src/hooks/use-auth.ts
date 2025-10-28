/**
 * useAuth Hook
 * Provides authentication state and user data
 */

'use client';

import { useSession } from 'next-auth/react';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  image?: string;
  emailVerified: boolean;
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user = session?.user as AuthUser | undefined;

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: status === 'loading',
    isUnauthenticated: status === 'unauthenticated',
  };
}

