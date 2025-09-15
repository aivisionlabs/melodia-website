// Create Razorpay Order API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable, songRequestsTable, pricingPlansTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createRazorpayOrder, generateReceiptId, validateRazorpayConfig } from '@/lib/razorpay';
import { getCurrentUser } from '@/lib/user-actions';
import { CreateOrderRequest, CreateOrderResponse } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // Validate Razorpay configuration
    if (!validateRazorpayConfig()) {
      return NextResponse.json(
        { success: false, message: 'Payment service not configured' },
        { status: 500 }
      );
    }

    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: CreateOrderRequest = await request.json();
    const { songRequestId, planId } = body;

    if (!songRequestId || !planId) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
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

    if (songRequest[0].user_id !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if payment already exists for this request
    if (songRequest[0].payment_id) {
      return NextResponse.json(
        { success: false, message: 'Payment already exists for this request' },
        { status: 400 }
      );
    }

    // Get pricing plan
    const pricingPlan = await db
      .select()
      .from(pricingPlansTable)
      .where(eq(pricingPlansTable.id, planId))
      .limit(1);

    if (pricingPlan.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Pricing plan not found' },
        { status: 404 }
      );
    }

    if (!pricingPlan[0].is_active) {
      return NextResponse.json(
        { success: false, message: 'Pricing plan is not active' },
        { status: 400 }
      );
    }

    // Generate receipt ID
    const receiptId = generateReceiptId();

    // Create Razorpay order
    const razorpayOrder = await createRazorpayOrder(
      pricingPlan[0].price,
      pricingPlan[0].currency,
      receiptId,
      {
        song_request_id: songRequestId,
        plan_id: planId,
        user_id: currentUser.id,
        plan_name: pricingPlan[0].name,
      }
    );

    // Create payment record in database
    const [payment] = await db
      .insert(paymentsTable)
      .values({
        user_id: currentUser.id,
        song_request_id: songRequestId,
        razorpay_order_id: razorpayOrder.id,
        amount: pricingPlan[0].price,
        currency: pricingPlan[0].currency,
        status: 'pending',
        metadata: {
          plan_id: planId,
          plan_name: pricingPlan[0].name,
          receipt_id: receiptId,
          razorpay_order: razorpayOrder,
        },
      })
      .returning();

    // Update song request with payment ID
    await db
      .update(songRequestsTable)
      .set({
        payment_id: payment.id,
        payment_status: 'pending',
      })
      .where(eq(songRequestsTable.id, songRequestId));

    // Prepare response
    const response: CreateOrderResponse = {
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID!,
      name: 'Melodia',
      description: `Payment for ${pricingPlan[0].name} - ${pricingPlan[0].description}`,
      prefill: {
        name: currentUser.name || undefined,
        email: currentUser.email,
      },
      notes: {
        payment_id: payment.id,
        song_request_id: songRequestId,
        plan_id: planId,
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
