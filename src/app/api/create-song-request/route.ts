import { NextRequest, NextResponse } from 'next/server';
import { createSongRequest } from '@/lib/song-request-actions';
import { getCurrentUser } from '@/lib/user-actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requester_name, email, recipient_name, recipient_relationship, languages, additional_details, delivery_preference, user_id, anonymous_user_id } = body;

    // Get user IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    // Get current user from session or request body
    const currentUser = await getCurrentUser();
    const currentUserId = currentUser?.id || user_id;

    // Create song request
    const result = await createSongRequest({
      requester_name,
      phone_number: undefined,
      email: email || undefined,
      delivery_preference,
      recipient_name,
      recipient_relationship,
      languages,
      person_description: undefined,
      song_type: undefined,
      emotions: undefined,
      additional_details: additional_details || undefined
    }, currentUserId, ip, anonymous_user_id);

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
