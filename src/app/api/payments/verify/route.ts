/**
 * Verify Payment API
 * POST /api/payments/verify
 * Verifies Razorpay payment signature
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable, userSongsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { sendPaymentConfirmation } from '@/lib/services/email-service';
import { z } from 'zod';

const verifyPaymentSchema = z.object({
  razorpay_payment_id: z.string(),
  razorpay_order_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = verifyPaymentSchema.parse(body);

    // Verify signature
    const isValid = verifyPaymentSignature(
      validatedData.razorpay_order_id,
      validatedData.razorpay_payment_id,
      validatedData.razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      );
    }

    // Find payment record
    const payments = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.razorpay_order_id, validatedData.razorpay_order_id))
      .limit(1);

    if (payments.length === 0) {
      return NextResponse.json(
        { error: 'Payment record not found' },
        { status: 404 }
      );
    }

    const payment = payments[0];

    // Update payment record
    await db
      .update(paymentsTable)
      .set({
        razorpay_payment_id: validatedData.razorpay_payment_id,
        status: 'completed',
        updated_at: new Date(),
      })
      .where(eq(paymentsTable.id, payment.id));

    // Link payment to song if exists
    if (payment.song_request_id) {
      const userSongs = await db
        .select()
        .from(userSongsTable)
        .where(eq(userSongsTable.song_request_id, payment.song_request_id))
        .limit(1);

      if (userSongs.length > 0) {
        await db
          .update(userSongsTable)
          .set({ payment_id: payment.id })
          .where(eq(userSongsTable.id, userSongs[0].id));
      }
    }

    // Send confirmation email (implement based on user data)
    // await sendPaymentConfirmation(...)

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Verify payment error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}

