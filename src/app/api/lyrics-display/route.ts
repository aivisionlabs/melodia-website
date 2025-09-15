import { NextRequest, NextResponse } from 'next/server';
import { getLyricsDisplayData } from '@/lib/lyrics-display-actions';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: true, message: 'Request ID is required' },
        { status: 400 }
      );
    }

    // Get lyrics display data
    const data = await getLyricsDisplayData(parseInt(requestId));

    if (!data) {
      return NextResponse.json(
        { error: true, message: 'Lyrics data not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data
    });

  } catch (error) {
    console.error('Error fetching lyrics display data:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to fetch lyrics data' },
      { status: 500 }
    );
  }
}
