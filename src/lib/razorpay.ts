// Razorpay Configuration and Utilities

import Razorpay from 'razorpay';
import crypto from 'crypto';
import { 
  RazorpayOrder, 
  RazorpayPayment, 
  RazorpayWebhookEvent
} from '@/types/payment';

// Lazy-loaded Razorpay instance
let razorpayInstance: Razorpay | null = null;

export function getRazorpayInstance(): Razorpay {
  if (!razorpayInstance) {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('Razorpay environment variables are not configured');
    }
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
}

// Validate Razorpay configuration
export function validateRazorpayConfig(): boolean {
  const requiredEnvVars = [
    'RAZORPAY_KEY_ID',
    'RAZORPAY_KEY_SECRET',
    'RAZORPAY_WEBHOOK_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('Missing required Razorpay environment variables:', missingVars);
    return false;
  }

  if (!process.env.RAZORPAY_KEY_ID?.startsWith('rzp_')) {
    console.error('Invalid Razorpay Key ID format');
    return false;
  }

  return true;
}

// Create Razorpay order
export async function createRazorpayOrder(
  amount: number,
  currency: string = 'INR',
  receipt: string,
  notes?: Record<string, any>
): Promise<RazorpayOrder> {
  try {
    const options = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt,
      notes: {
        ...notes,
        source: 'melodia-website',
        created_at: new Date().toISOString(),
      },
    };

    const order = await getRazorpayInstance().orders.create(options);
    
    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: order.receipt || '',
      status: order.status,
      created_at: order.created_at,
    };
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
}

// Verify Razorpay payment signature
export function verifyPaymentSignature(
  razorpay_payment_id: string,
  razorpay_order_id: string,
  razorpay_signature: string
): boolean {
  try {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    return expectedSignature === razorpay_signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
}

// Verify Razorpay webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying webhook signature:', error);
    return false;
  }
}

// Get payment details from Razorpay
export async function getPaymentDetails(paymentId: string): Promise<RazorpayPayment> {
  try {
    const payment = await getRazorpayInstance().payments.fetch(paymentId);
    
    return {
      id: payment.id,
      order_id: payment.order_id,
      amount: Number(payment.amount),
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description || '',
      created_at: payment.created_at,
      captured: payment.captured,
      international: payment.international,
      refund_status: payment.refund_status,
      amount_refunded: Number(payment.amount_refunded),
      notes: payment.notes,
      fee: Number(payment.fee),
      tax: Number(payment.tax),
      error_code: payment.error_code || undefined,
      error_description: payment.error_description || undefined,
      error_source: payment.error_source || undefined,
      error_step: payment.error_step || undefined,
      error_reason: payment.error_reason || undefined,
    };
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
}

// Get order details from Razorpay
export async function getOrderDetails(orderId: string): Promise<RazorpayOrder> {
  try {
    const order = await getRazorpayInstance().orders.fetch(orderId);
    
    return {
      id: order.id,
      amount: Number(order.amount),
      currency: order.currency,
      receipt: order.receipt || '',
      status: order.status,
      created_at: order.created_at,
    };
  } catch (error) {
    console.error('Error fetching order details:', error);
    throw new Error('Failed to fetch order details');
  }
}

// Create refund
export async function createRefund(
  paymentId: string,
  amount?: number,
  notes?: Record<string, any>
): Promise<any> {
  try {
    const refundOptions: any = {
      payment_id: paymentId,
      notes: {
        ...notes,
        refunded_at: new Date().toISOString(),
      },
    };

    if (amount) {
      refundOptions.amount = amount * 100; // Convert to paise
    }

    const refund = await getRazorpayInstance().payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Error creating refund:', error);
    throw new Error('Failed to create refund');
  }
}

// Parse webhook event
export function parseWebhookEvent(body: string): RazorpayWebhookEvent | null {
  try {
    const event = JSON.parse(body);
    
    // Validate webhook event structure
    if (!event.event || !event.created_at || !event.payload) {
      throw new Error('Invalid webhook event structure');
    }

    return event as RazorpayWebhookEvent;
  } catch (error) {
    console.error('Error parsing webhook event:', error);
    return null;
  }
}

// Get supported payment methods
export function getSupportedPaymentMethods(): string[] {
  return [
    'card',
    'upi',
    'netbanking',
    'wallet',
    'emi'
  ];
}

// Get supported currencies
export function getSupportedCurrencies(): string[] {
  return ['INR', 'USD', 'EUR'];
}

// Format amount for display
export function formatAmount(amount: number, currency: string = 'INR'): string {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

// Convert paise to rupees
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

// Convert rupees to paise
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Generate receipt ID
export function generateReceiptId(prefix: string = 'melodia'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}_${random}`;
}

// Validate payment amount
export function validatePaymentAmount(amount: number): boolean {
  return amount > 0 && amount <= 1000000; // Max 10 lakh rupees
}

// Get payment status from Razorpay status
export function mapRazorpayStatusToPaymentStatus(razorpayStatus: string): string {
  const statusMap: Record<string, string> = {
    'created': 'pending',
    'authorized': 'pending',
    'captured': 'completed',
    'refunded': 'refunded',
    'failed': 'failed',
  };

  return statusMap[razorpayStatus] || 'pending';
}

// Error handling utilities
export class RazorpayError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string,
    public step?: string,
    public reason?: string
  ) {
    super(message);
    this.name = 'RazorpayError';
  }
}

export function handleRazorpayError(error: any): RazorpayError {
  if (error.error) {
    return new RazorpayError(
      error.error.description || 'Payment processing failed',
      error.error.code,
      error.error.field,
      error.error.step,
      error.error.reason
    );
  }

  return new RazorpayError(
    error.message || 'Unknown payment error',
    'UNKNOWN_ERROR'
  );
}
