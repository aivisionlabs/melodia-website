import { cookies } from 'next/headers';

// Cookie configuration
const COOKIE_NAME = 'auth-token';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Set authentication cookie
export const setAuthCookie = async (token: string): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/'
  });
};

// Get authentication cookie
export const getAuthCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value || null;
};

// Clear authentication cookie
export const clearAuthCookie = async (): Promise<void> => {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
};
