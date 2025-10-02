import { NextRequest, NextResponse } from 'next/server';
import { refineLyricsAction } from '@/lib/lyrics-actions';
import { getCurrentUser } from '@/lib/user-actions';
import { getUserContextFromRequest } from '@/lib/middleware-utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, refineText, userId, anonymous_user_id } = body;

    if (!requestId || !refineText) {
      return NextResponse.json(
        { success: false, error: 'Request ID and refine text are required' },
        { status: 400 }
      );
    }

    // Get user context from middleware
    const userContext = getUserContextFromRequest(request);

    // Get user information
    let currentUser = null;
    if (userContext.userId) {
      currentUser = { id: userContext.userId } as any;
    } else if (userId) {
      currentUser = { id: userId } as any;
    } else {
      currentUser = await getCurrentUser();
    }

    const result = await refineLyricsAction(
      refineText,
      parseInt(requestId),
      currentUser?.id,
      userContext.anonymousUserId || anonymous_user_id
    );

    if (result.success) {
      return NextResponse.json({
        success: true,
        draft: result.draft
      });
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in refine-lyrics API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
