/**
 * Razorpay Integration
 * Handles payment processing
 */

import Razorpay from 'razorpay';
import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || '';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || '';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

let razorpayInstance: Razorpay | null = null;

/**
 * Get Razorpay instance
 */
function getRazorpay(): Razorpay {
  if (!razorpayInstance && !DEMO_MODE) {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance as Razorpay;
}

export interface CreateOrderOptions {
  amount: number; // in rupees
  currency?: string;
  receipt?: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

/**
 * Create a Razorpay order
 */
export async function createOrder(
  options: CreateOrderOptions
): Promise<RazorpayOrder> {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Razorpay - Create order:', options);
    return {
      id: `order_demo_${Date.now()}`,
      amount: options.amount * 100, // Convert to paise
      currency: options.currency || 'INR',
      receipt: options.receipt || `receipt_${Date.now()}`,
      status: 'created',
    };
  }

  try {
    const razorpay = getRazorpay();

    const order = await razorpay.orders.create({
      amount: options.amount * 100, // Convert rupees to paise
      currency: options.currency || 'INR',
      receipt: options.receipt || `receipt_${Date.now()}`,
      notes: options.notes || {},
    });

    return {
      id: order.id,
      amount: typeof order.amount === 'string' ? parseInt(order.amount, 10) : order.amount,
      currency: order.currency || 'INR',
      receipt: order.receipt || '',
      status: order.status || 'created',
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    throw new Error('Failed to create payment order');
  }
}

/**
 * Verify Razorpay payment signature
 */
export function verifyPaymentSignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Razorpay - Verify signature');
    return true;
  }

  try {
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Razorpay - Verify webhook signature');
    return true;
  }

  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Webhook signature verification error:', error);
    return false;
  }
}

/**
 * Fetch payment details
 */
export async function getPayment(paymentId: string) {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Razorpay - Get payment:', paymentId);
    return {
      id: paymentId,
      status: 'captured',
      amount: 99900, // 999 INR in paise
      currency: 'INR',
      method: 'card',
    };
  }

  try {
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Fetch payment error:', error);
    throw new Error('Failed to fetch payment details');
  }
}

/**
 * Initiate refund
 */
export async function createRefund(
  paymentId: string,
  amount?: number
) {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Razorpay - Create refund:', paymentId);
    return {
      id: `rfnd_demo_${Date.now()}`,
      payment_id: paymentId,
      amount: amount || 99900,
      status: 'processed',
    };
  }

  try {
    const razorpay = getRazorpay();
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount, // If not provided, full refund
    });
    return refund;
  } catch (error) {
    console.error('Refund creation error:', error);
    throw new Error('Failed to process refund');
  }
}

