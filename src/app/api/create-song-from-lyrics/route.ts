import { NextRequest, NextResponse } from 'next/server';
import { createSongFromLyricsAction } from '@/lib/lyrics-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestId } = body;

    if (!requestId) {
      return NextResponse.json(
        { error: true, message: 'Request ID is required' },
        { status: 400 }
      );
    }

    const result = await createSongFromLyricsAction(parseInt(requestId));

    if (result.success) {
      return NextResponse.json({
        success: true,
        taskId: result.taskId,
        message: 'Song creation started successfully'
      });
    } else {
      return NextResponse.json(
        { error: true, message: result.error || 'Failed to create song' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating song from lyrics:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to create song' },
      { status: 500 }
    );
  }
}
