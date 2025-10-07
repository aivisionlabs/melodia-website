// Create Razorpay Order API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable, songRequestsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createRazorpayOrder, generateReceiptId, validateRazorpayConfig } from '@/lib/razorpay';
import { getCurrentUser } from '@/lib/user-actions';
import { CreateOrderRequest, CreateOrderResponse } from '@/types/payment';
import { validatePaymentRequest, sanitizeAnonymousUserId } from '@/lib/utils/validation';
import { getUserContextFromRequest } from '@/lib/middleware-utils';

export async function POST(request: NextRequest) {
  try {
    // Validate Razorpay configuration
    if (!validateRazorpayConfig()) {
      return NextResponse.json(
        { success: false, message: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Get user context from middleware
    const userContext = getUserContextFromRequest(request);

    // Get current user (optional for anonymous users)
    const currentUser = await getCurrentUser();

    // Parse request body
    const body: CreateOrderRequest = await request.json();
    const { songRequestId, anonymous_user_id } = body;

    // Fixed pricing - no longer using planId
    const FIXED_PRICE = 299.00; // ₹299
    const CURRENCY = 'INR';

    // Sanitize anonymous user ID from middleware or request body
    const sanitizedAnonymousUserId = sanitizeAnonymousUserId(userContext.anonymousUserId || anonymous_user_id);

    // Validate payment request data
    const validation = validatePaymentRequest({
      songRequestId,
      userId: userContext.userId || currentUser?.id || null,
      anonymousUserId: sanitizedAnonymousUserId
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, message: validation.error },
        { status: 400 }
      );
    }

    // Verify song request exists and belongs to user
    const songRequest = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, songRequestId))
      .limit(1);

    if (songRequest.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Song request not found' },
        { status: 404 }
      );
    }

    // Check ownership for both user types
    const finalUserId = userContext.userId || currentUser?.id;
    const isOwner = (finalUserId && songRequest[0].user_id === finalUserId) ||
      (sanitizedAnonymousUserId && songRequest[0].anonymous_user_id === sanitizedAnonymousUserId);

    if (!isOwner) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if payment already exists for this request
    const existingPayment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.song_request_id, songRequestId))
      .limit(1);

    if (existingPayment.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Payment already exists for this request' },
        { status: 400 }
      );
    }

    // Generate receipt ID
    const receiptId = generateReceiptId();

    // Create Razorpay order with fixed pricing
    const razorpayOrder = await createRazorpayOrder(
      FIXED_PRICE,
      CURRENCY,
      receiptId,
      {
        song_request_id: songRequestId,
        user_id: finalUserId || null,
        anonymous_user_id: sanitizedAnonymousUserId,
        plan_name: 'Song Generation',
      }
    );

    // Create payment record in database
    const [payment] = await db
      .insert(paymentsTable)
      .values({
        user_id: finalUserId || null,
        anonymous_user_id: sanitizedAnonymousUserId,
        song_request_id: songRequestId,
        razorpay_order_id: razorpayOrder.id,
        amount: FIXED_PRICE.toString(),
        currency: CURRENCY,
        status: 'pending',
        metadata: {
          plan_name: 'Song Generation',
          receipt_id: receiptId,
          razorpay_order: razorpayOrder,
        },
      })
      .returning();

    // Payment record is created, no need to update song request

    // Prepare response
    const response: CreateOrderResponse = {
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID!,
      name: 'Melodia',
      description: `Payment for Song Generation - ₹${FIXED_PRICE}`,
      prefill: {
        name: currentUser?.name || undefined,
        email: currentUser?.email || undefined,
      },
      notes: {
        payment_id: payment.id,
        song_request_id: songRequestId,
      },
      theme: {
        color: '#3B82F6', // Blue theme
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error creating payment order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
