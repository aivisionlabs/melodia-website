/**
 * Create Payment Order API
 * POST /api/payments/create-order
 * Creates a Razorpay payment order
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth/middleware';
import { getAnonymousCookie } from '@/lib/auth/cookies';
import { createOrder } from '@/lib/razorpay';
import { withRateLimit } from '@/lib/rate-limiting/middleware';
import { z } from 'zod';

const createOrderSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  songRequestId: z.number(),
});

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = createOrderSchema.parse(body);

    // Get user ID (authenticated or anonymous)
    const user = await getCurrentUser(req);
    const anonymousId = await getAnonymousCookie();

    if (!user && !anonymousId) {
      return NextResponse.json(
        { error: 'Session required' },
        { status: 401 }
      );
    }

    // Create Razorpay order
    const order = await createOrder({
      amount: validatedData.amount,
      currency: 'INR',
      receipt: `song_req_${validatedData.songRequestId}`,
      notes: {
        songRequestId: validatedData.songRequestId.toString(),
      },
    });

    // Create payment record
    const newPayments = await db
      .insert(paymentsTable)
      .values({
        song_request_id: validatedData.songRequestId,
        user_id: user?.id ? parseInt(user.id) : null,
        anonymous_user_id: anonymousId || null,
        razorpay_order_id: order.id,
        amount: validatedData.amount.toString(),
        currency: order.currency,
        status: 'pending',
      })
      .returning();

    const payment = newPayments[0];

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}

export const POST = withRateLimit('payment.create_order', handler);

