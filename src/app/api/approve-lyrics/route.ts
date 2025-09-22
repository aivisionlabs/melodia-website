import { NextRequest, NextResponse } from 'next/server';
import { approveLyricsAction } from '@/lib/lyrics-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { draftId, requestId } = body;

    if (!draftId || !requestId) {
      return NextResponse.json(
        { error: true, message: 'Draft ID and Request ID are required' },
        { status: 400 }
      );
    }

    const result = await approveLyricsAction(parseInt(draftId), parseInt(requestId));

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Lyrics approved successfully'
      });
    } else {
      return NextResponse.json(
        { error: true, message: result.error || 'Failed to approve lyrics' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error approving lyrics:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to approve lyrics' },
      { status: 500 }
    );
  }
}
