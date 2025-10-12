import { NextRequest, NextResponse } from 'next/server';
import { GoogleAuthService } from '@/lib/services/google-auth-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const anonymousUserId = searchParams.get('anonymous_user_id');
    
    const googleAuthService = new GoogleAuthService();
    const authUrl = googleAuthService.getAuthUrl(anonymousUserId);
    
    console.log('Initiating Google OAuth with anonymous_user_id:', anonymousUserId);
    
    // Redirect to Google OAuth
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Error initiating Google OAuth:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Google authentication' },
      { status: 500 }
    );
  }
}
