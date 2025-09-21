import { NextRequest, NextResponse } from 'next/server';
import { refineLyricsAction } from '@/lib/lyrics-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId, refineText } = body;

    if (!requestId || !refineText) {
      return NextResponse.json(
        { success: false, error: 'Request ID and refine text are required' },
        { status: 400 }
      );
    }

    const result = await refineLyricsAction(refineText, parseInt(requestId));

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
