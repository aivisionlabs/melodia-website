import { NextRequest, NextResponse } from 'next/server';
import { createSongRequest } from '@/lib/song-request-actions';
import { SongRequestPayload } from "@/types/song-request";
import { getCurrentUser } from '@/lib/user-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requesterName, recipientDetails, occasion, languages, story, userId, anonymousUserId, mood }: SongRequestPayload = body;


    // Get current user from session or request body
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.id || userId || null;

    // Create song request
    const result = await createSongRequest({
      requesterName,
      recipientDetails,
      occasion: occasion,
      languages,
      mood: mood,
      story,
      userId: currentUserId,
      anonymousUserId
    }, currentUserId, anonymousUserId);

    if (!result.success) {
      return NextResponse.json(
        { error: true, message: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      requestId: result.requestId
    });

  } catch (error) {
    console.error('Error creating song request:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to create song request' },
      { status: 500 }
    );
  }
}
