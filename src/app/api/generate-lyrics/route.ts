import { NextRequest, NextResponse } from 'next/server';
import { generateLyrics } from '@/lib/llm-integration';
import { db } from '@/lib/db';
import { songRequestsTable, paymentsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/user-actions';
import { shouldRequirePayment } from '@/lib/payment-config';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipient_name, languages, additional_details, requestId, userId } = body;

    // Validate required fields
    if (!recipient_name || !languages || languages.length === 0) {
      return NextResponse.json(
        { error: true, message: 'Recipient name and languages are required' },
        { status: 400 }
      );
    }

    // Check payment status if requestId is provided
    if (requestId) {
      // Get user ID from request body or try authentication
      let currentUser = null;
      
      if (userId) {
        // Use provided userId
        currentUser = { id: userId } as any;
      } else {
        // Try to get from authentication
        currentUser = await getCurrentUser();
        if (!currentUser) {
          return NextResponse.json(
            { error: true, message: 'User ID or authentication required' },
            { status: 401 }
          );
        }
      }

      // Get song request
      const songRequest = await db
        .select()
        .from(songRequestsTable)
        .where(eq(songRequestsTable.id, requestId))
        .limit(1);

      if (songRequest.length === 0) {
        return NextResponse.json(
          { error: true, message: 'Song request not found' },
          { status: 404 }
        );
      }

      if (songRequest[0].user_id !== currentUser.id) {
        return NextResponse.json(
          { error: true, message: 'Unauthorized access' },
          { status: 403 }
        );
      }

      // Check payment status only if payment is required
      if (songRequest[0].payment_required) {
        if (songRequest[0].payment_id) {
          const payment = await db
            .select()
            .from(paymentsTable)
            .where(eq(paymentsTable.id, songRequest[0].payment_id))
            .limit(1);

          if (payment.length === 0 || payment[0].status !== 'completed') {
            return NextResponse.json(
              { 
                error: true, 
                message: 'Payment required',
                requiresPayment: true,
                paymentStatus: payment[0]?.status || 'pending'
              },
              { status: 402 }
            );
          }
        } else {
          return NextResponse.json(
            { 
              error: true, 
              message: 'Payment required',
              requiresPayment: true
            },
            { status: 402 }
          );
        }
      }
    }

    // Generate lyrics using Gemini API
    const result = await generateLyrics({
      recipient_name,
      languages,
      additional_details: additional_details || ''
    });

    if (result.error) {
      return NextResponse.json(
        { 
          error: true, 
          message: result.message || 'Failed to generate lyrics',
          example: result.example 
        },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      lyrics: result.lyrics
    });

  } catch (error) {
    console.error('Error generating lyrics:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to generate lyrics. Please try again.' },
      { status: 500 }
    );
  }
}