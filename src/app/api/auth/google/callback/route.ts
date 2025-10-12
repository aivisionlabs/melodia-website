import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Handle OAuth error
    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/profile?error=oauth_error`
      );
    }

    // Handle missing authorization code
    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/profile?error=missing_code`
      );
    }

    // Extract anonymous_user_id from state if present
    let anonymousUserId: string | null = null;
    if (state) {
      try {
        const stateData = JSON.parse(state);
        anonymousUserId = stateData.anonymous_user_id || null;
        console.log('Extracted anonymous_user_id from state:', anonymousUserId);
      } catch (e) {
        console.warn('Failed to parse state parameter:', e);
      }
    }

    // Process the OAuth callback
    console.log('Processing Google OAuth callback with code:', code.substring(0, 20) + '...');
    const googleAuthService = new GoogleAuthService();
    const result = await googleAuthService.handleCallback(code, anonymousUserId);

    console.log('Google auth result:', { 
      success: result.success, 
      hasUser: !!result.user, 
      hasToken: !!result.token,
      error: result.error 
    });

    if (result.success && result.user && result.token) {
      console.log(`Google auth successful for user: ${result.user.email}`);
      
      // Create response and set authentication cookies
      const response = NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/profile/logged-in`
      );

      // Set JWT token cookie for authentication
      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      // Set user session cookie for client-side access
      response.cookies.set('user-session', JSON.stringify(result.user), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      });

      console.log('Cookies set, redirecting to /profile/logged-in');
      return response;
    } else {
      // Authentication failed
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/profile?error=auth_failed&message=${encodeURIComponent(result.error || 'Authentication failed')}`
      );
    }
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/profile?error=server_error`
    );
  }
}
