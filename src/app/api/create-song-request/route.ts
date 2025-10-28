/**
 * Create Song Request API
 * POST /api/create-song-request
 * Creates a new song generation request
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songRequestsTable } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getAnonymousCookie } from '@/lib/auth/cookies';
import { sendSongRequestConfirmation } from '@/lib/services/email-service';
import { withRateLimit } from '@/lib/rate-limiting/middleware';
import { z } from 'zod';

const createRequestSchema = z.object({
  requesterName: z.string().min(2, 'Name must be at least 2 characters'),
  recipientDetails: z.string().min(5, 'Please provide details about the recipient'),
  occasion: z.string().optional(),
  languages: z.string().min(1, 'Please select at least one language'),
  mood: z.array(z.string()).optional(),
  songStory: z.string().optional(),
  mobileNumber: z.string().optional(),
  email: z.string().email('Invalid email').optional(),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createRequestSchema.parse(body);

    // Get user ID (authenticated or anonymous)
    const user = await getCurrentUser(req);
    const anonymousId = await getAnonymousCookie();

    if (!user && !anonymousId) {
      return NextResponse.json(
        { error: 'Session required. Please enable cookies.' },
        { status: 400 }
      );
    }

    // Create song request
    const newRequests = await db
      .insert(songRequestsTable)
      .values({
        user_id: user?.id ? parseInt(user.id) : null,
        anonymous_user_id: anonymousId || null,
        requester_name: validatedData.requesterName,
        recipient_details: validatedData.recipientDetails,
        occasion: validatedData.occasion,
        languages: validatedData.languages,
        mood: validatedData.mood || [],
        song_story: validatedData.songStory,
        mobile_number: validatedData.mobileNumber,
        email: validatedData.email,
        status: 'pending',
      })
      .returning();

    const newRequest = newRequests[0];

    // Send confirmation email if email provided
    if (validatedData.email) {
      const recipientName = validatedData.recipientDetails.split(',')[0] || 'your loved one';
      await sendSongRequestConfirmation(
        validatedData.email,
        validatedData.requesterName,
        recipientName,
        newRequest.id
      );
    }

    return NextResponse.json({
      success: true,
      requestId: newRequest.id,
      message: 'Song request created successfully!',
    });
  } catch (error) {
    console.error('Create song request error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create song request. Please try again.' },
      { status: 500 }
    );
  }
}

// Apply rate limiting
export const POST = withRateLimit('song.create_request', handler);

