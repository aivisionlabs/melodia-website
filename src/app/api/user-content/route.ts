import { NextRequest, NextResponse } from 'next/server';
import { getUserContent } from '@/lib/user-content-actions';

export async function GET(request: NextRequest) {
  try {
    // Get user ID or anonymous user ID from query params
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const anonymousUserId = searchParams.get('anonymousUserId');

    if (!userId && !anonymousUserId) {
      return NextResponse.json(
        { error: true, message: 'User ID or Anonymous User ID is required' },
        { status: 400 }
      );
    }

    // Get user content
    const content = await getUserContent(
      userId ? parseInt(userId) : null,
      anonymousUserId || null
    );

    return NextResponse.json({
      success: true,
      content
    });

  } catch (error) {
    console.error('Error fetching user content:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to fetch user content' },
      { status: 500 }
    );
  }
}
