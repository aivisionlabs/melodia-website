import { NextRequest, NextResponse } from 'next/server';
import { getUserContent } from '@/lib/user-content-actions';

export async function GET(request: NextRequest) {
  try {
    // For now, we'll get user ID from query params
    // In a real app, this would come from session/auth
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: true, message: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user content
    const content = await getUserContent(parseInt(userId));

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
