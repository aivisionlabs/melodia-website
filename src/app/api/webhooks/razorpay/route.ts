// Razorpay Webhook Handler

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { paymentsTable, paymentWebhooksTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyWebhookSignature, parseWebhookEvent, mapRazorpayStatusToPaymentStatus } from '@/lib/razorpay';
import { RazorpayWebhookEvent } from '@/types/payment';

export async function POST(request: NextRequest) {
  try {
    // Get webhook signature
    const signature = request.headers.get('x-razorpay-signature');
    if (!signature) {
      console.error('Missing Razorpay signature');
      return NextResponse.json(
        { success: false, message: 'Missing signature' },
        { status: 400 }
      );
    }

    // Get raw body
    const body = await request.text();

    // Verify webhook signature
    const isValidSignature = verifyWebhookSignature(body, signature);
    if (!isValidSignature) {
      console.error('Invalid webhook signature');
      return NextResponse.json(
        { success: false, message: 'Invalid signature' },
        { status: 400 }
      );
    }

    // Parse webhook event
    const webhookEvent = parseWebhookEvent(body);
    if (!webhookEvent) {
      console.error('Failed to parse webhook event');
      return NextResponse.json(
        { success: false, message: 'Invalid webhook data' },
        { status: 400 }
      );
    }

    // Check if webhook already processed
    const existingWebhook = await db
      .select()
      .from(paymentWebhooksTable)
      .where(eq(paymentWebhooksTable.razorpay_event_id, webhookEvent.created_at.toString()))
      .limit(1);

    if (existingWebhook.length > 0) {
      console.log('Webhook already processed:', webhookEvent.created_at);
      return NextResponse.json({ success: true, message: 'Webhook already processed' });
    }

    // Store webhook event
    const [webhookRecord] = await db
      .insert(paymentWebhooksTable)
      .values({
        razorpay_event_id: webhookEvent.created_at.toString(),
        event_type: webhookEvent.event,
        webhook_data: webhookEvent,
        processed: false,
      })
      .returning();

    // Process webhook event
    await processWebhookEvent(webhookEvent, webhookRecord.id);

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, message: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function processWebhookEvent(event: RazorpayWebhookEvent, webhookId: number) {
  try {
    const { event: eventType, payload } = event;
    const payment = payload.payment.entity;

    console.log('Processing webhook event:', eventType, payment.id);

    // Find payment record by Razorpay payment ID
    const paymentRecord = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.razorpay_payment_id, payment.id))
      .limit(1);

    if (paymentRecord.length === 0) {
      console.error('Payment record not found for Razorpay payment ID:', payment.id);
      return;
    }

    const paymentId = paymentRecord[0].id;

    // Process different event types
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentId, payment);
        break;
      case 'payment.failed':
        await handlePaymentFailed(paymentId, payment);
        break;
      case 'order.paid':
        await handleOrderPaid(paymentId, payment);
        break;
      case 'refund.created':
        await handleRefundCreated(paymentId, payment);
        break;
      case 'refund.processed':
        await handleRefundProcessed(paymentId, payment);
        break;
      default:
        console.log('Unhandled webhook event type:', eventType);
    }

    // Mark webhook as processed
    await db
      .update(paymentWebhooksTable)
      .set({
        processed: true,
        processed_at: new Date(),
      })
      .where(eq(paymentWebhooksTable.id, webhookId));

    console.log('Webhook event processed successfully:', eventType);
  } catch (error) {
    console.error('Error processing webhook event:', error);
    throw error;
  }
}

async function handlePaymentCaptured(paymentId: number, payment: any) {
  const paymentStatus = mapRazorpayStatusToPaymentStatus(payment.status);

  // Update payment record
  await db
    .update(paymentsTable)
    .set({
      status: paymentStatus,
      payment_method: payment.method,
      metadata: {
        ...payment,
        captured_at: new Date().toISOString(),
      },
    })
    .where(eq(paymentsTable.id, paymentId));

  // Payment status is tracked in payments table, no need to update song request

  console.log('Payment captured:', paymentId);
}

async function handlePaymentFailed(paymentId: number, payment: any) {
  // Update payment record
  await db
    .update(paymentsTable)
    .set({
      status: 'failed',
      metadata: {
        ...payment,
        failed_at: new Date().toISOString(),
        error: {
          code: payment.error_code,
          description: payment.error_description,
          source: payment.error_source,
          step: payment.error_step,
          reason: payment.error_reason,
        },
      },
    })
    .where(eq(paymentsTable.id, paymentId));

  // Payment status is tracked in payments table, no need to update song request

  console.log('Payment failed:', paymentId);
}

async function handleOrderPaid(paymentId: number, payment: any) {
  // Similar to payment captured
  await handlePaymentCaptured(paymentId, payment);
  console.log('Order paid:', paymentId);
}

async function handleRefundCreated(paymentId: number, payment: any) {
  // Update payment record with refund info
  await db
    .update(paymentsTable)
    .set({
      status: 'refunded',
      metadata: {
        ...payment,
        refund_created_at: new Date().toISOString(),
      },
    })
    .where(eq(paymentsTable.id, paymentId));

  // Payment status is tracked in payments table, no need to update song request

  console.log('Refund created:', paymentId);
}

async function handleRefundProcessed(paymentId: number, payment: any) {
  // Update payment record with processed refund info
  await db
    .update(paymentsTable)
    .set({
      metadata: {
        ...payment,
        refund_processed_at: new Date().toISOString(),
      },
    })
    .where(eq(paymentsTable.id, paymentId));

  console.log('Refund processed:', paymentId);
}
