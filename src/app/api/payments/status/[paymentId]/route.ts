// Get Payment Status API

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/user-actions';
import { PaymentStatusResponse, PaymentStatus } from '@/types/payment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ paymentId: string }> }
) {
  try {
    // Get current user
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get payment ID from params
    const { paymentId } = await params;
    const paymentIdNum = parseInt(paymentId);

    if (isNaN(paymentIdNum)) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment ID' },
        { status: 400 }
      );
    }

    // Get payment record
    const payment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentIdNum))
      .limit(1);

    if (payment.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
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

    const response: PaymentStatusResponse = {
      success: true,
      payment: {
        id: payment[0].id,
        user_id: payment[0].user_id,
        song_request_id: payment[0].song_request_id || 0,
        razorpay_payment_id: payment[0].razorpay_payment_id || '',
        razorpay_order_id: payment[0].razorpay_order_id || '',
        amount: Number(payment[0].amount),
        currency: payment[0].currency || 'USD',
        status: payment[0].status as PaymentStatus,
        payment_method: payment[0].payment_method || undefined,
        created_at: payment[0].created_at?.toISOString() || new Date().toISOString(),
        updated_at: payment[0].updated_at?.toISOString() || new Date().toISOString(),
        metadata: payment[0].metadata as Record<string, any> | undefined,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching payment status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
