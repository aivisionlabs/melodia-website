// Verify Razorpay Payment API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable, songRequestsTable, songsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPaymentSignature, getPaymentDetails, mapRazorpayStatusToPaymentStatus } from '@/lib/razorpay';
import { getCurrentUser } from '@/lib/user-actions';
import { VerifyPaymentRequest, VerifyPaymentResponse } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body: VerifyPaymentRequest = await request.json();
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Get payment details from Razorpay
    const razorpayPayment = await getPaymentDetails(razorpay_payment_id);

    // Find payment record in database
    const payment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.razorpay_order_id, razorpay_order_id))
      .limit(1);

    if (payment.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Payment record not found' },
        { status: 404 }
      );
    }

    // Verify payment belongs to current user
    if (payment[0].user_id !== currentUser.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized access' },
        { status: 403 }
      );
    }

    // Check if payment is already verified
    if (payment[0].status === 'completed') {
      return NextResponse.json(
        { success: true, paymentId: payment[0].id, message: 'Payment already verified' }
      );
    }

    // Map Razorpay status to our payment status
    const paymentStatus = mapRazorpayStatusToPaymentStatus(razorpayPayment.status);

    // Update payment record
    const [updatedPayment] = await db
      .update(paymentsTable)
      .set({
        razorpay_payment_id: razorpay_payment_id,
        status: paymentStatus,
        payment_method: razorpayPayment.method,
        metadata: {
          ...payment[0].metadata,
          razorpay_payment: razorpayPayment,
          verified_at: new Date().toISOString(),
        },
      })
      .where(eq(paymentsTable.id, payment[0].id))
      .returning();

    // Update song request payment status
    await db
      .update(songRequestsTable)
      .set({
        payment_status: paymentStatus === 'completed' ? 'paid' : 'failed',
      })
      .where(eq(songRequestsTable.payment_id, payment[0].id));

    // If payment is completed, update any associated songs
    if (paymentStatus === 'completed') {
      await db
        .update(songsTable)
        .set({
          payment_id: payment[0].id,
        })
        .where(eq(songsTable.id, payment[0].song_request_id));
    }

    const response: VerifyPaymentResponse = {
      success: true,
      paymentId: updatedPayment.id,
      message: 'Payment verified successfully',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
