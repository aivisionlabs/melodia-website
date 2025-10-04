// Razorpay Client-Side Integration

import { 
  CreateOrderResponse, 
  PaymentError 
} from '@/types/payment';

// Declare Razorpay types for TypeScript
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Load Razorpay script dynamically
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

// Razorpay checkout options interface
export interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
  handler: (response: any) => void;
  modal?: {
    ondismiss?: () => void;
  };
  retry?: {
    enabled: boolean;
    max_count: number;
  };
  callback_url?: string;
}

// Create Razorpay checkout instance
export async function createRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<any> {
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    throw new Error('Failed to load Razorpay script');
  }

  if (!window.Razorpay) {
    throw new Error('Razorpay is not available');
  }

  return new window.Razorpay(options);
}

// Open Razorpay checkout modal
export async function openRazorpayCheckout(
  orderData: CreateOrderResponse,
  onSuccess: (paymentId: string, orderId: string, signature: string) => void,
  onError: (error: PaymentError) => void,
  onDismiss?: () => void
): Promise<void> {
  try {
    const checkout = await createRazorpayCheckout({
      key: orderData.key,
      amount: orderData.amount,
      currency: orderData.currency,
      name: orderData.name,
      description: orderData.description,
      order_id: orderData.orderId,
      prefill: orderData.prefill,
      notes: orderData.notes,
      theme: orderData.theme,
      handler: (response: any) => {
        onSuccess(response.razorpay_payment_id, response.razorpay_order_id, response.razorpay_signature);
      },
      modal: {
        ondismiss: onDismiss,
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
    });

    checkout.open();
  } catch (error) {
    console.error('Error opening Razorpay checkout:', error);
    onError({
      code: 'CHECKOUT_ERROR',
      description: 'Failed to open payment modal',
      source: 'client',
      step: 'checkout',
      reason: 'script_loading_failed',
    });
  }
}

// Verify payment on client side (basic validation)
export function validatePaymentResponse(response: any): boolean {
  return !!(
    response &&
    response.razorpay_payment_id &&
    response.razorpay_order_id &&
    response.razorpay_signature
  );
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

// Get payment method display name
export function getPaymentMethodDisplayName(method: string): string {
  const methodNames: Record<string, string> = {
    card: 'Card',
    upi: 'UPI',
    netbanking: 'Net Banking',
    wallet: 'Wallet',
    emi: 'EMI',
  };

  return methodNames[method] || method;
}

// Get payment status display name
export function getPaymentStatusDisplayName(status: string): string {
  const statusNames: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
  };

  return statusNames[status] || status;
}

// Get payment status color
export function getPaymentStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    pending: 'text-yellow-600',
    completed: 'text-green-600',
    failed: 'text-red-600',
    refunded: 'text-blue-600',
  };

  return statusColors[status] || 'text-gray-600';
}

// Get payment status background color
export function getPaymentStatusBgColor(status: string): string {
  const statusBgColors: Record<string, string> = {
    pending: 'bg-yellow-100',
    completed: 'bg-green-100',
    failed: 'bg-red-100',
    refunded: 'bg-blue-100',
  };

  return statusBgColors[status] || 'bg-gray-100';
}

// Error handling utilities
export class RazorpayClientError extends Error {
  constructor(
    message: string,
    public code?: string,
    public field?: string,
    public step?: string,
    public reason?: string
  ) {
    super(message);
    this.name = 'RazorpayClientError';
  }
}

export function handleRazorpayClientError(error: any): RazorpayClientError {
  if (error.error) {
    return new RazorpayClientError(
      error.error.description || 'Payment processing failed',
      error.error.code,
      error.error.field,
      error.error.step,
      error.error.reason
    );
  }

  return new RazorpayClientError(
    error.message || 'Unknown payment error',
    'UNKNOWN_ERROR'
  );
}

// Payment flow utilities
export interface PaymentFlowState {
  step: 'idle' | 'loading' | 'checkout' | 'verifying' | 'success' | 'error';
  error?: string;
  paymentId?: string;
  orderId?: string;
}

export function createPaymentFlowState(): PaymentFlowState {
  return {
    step: 'idle',
  };
}

// Local storage utilities for payment state
export function savePaymentState(state: PaymentFlowState): void {
  try {
    localStorage.setItem('razorpay_payment_state', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save payment state:', error);
  }
}

export function loadPaymentState(): PaymentFlowState | null {
  try {
    const state = localStorage.getItem('razorpay_payment_state');
    return state ? JSON.parse(state) : null;
  } catch (error) {
    console.error('Failed to load payment state:', error);
    return null;
  }
}

export function clearPaymentState(): void {
  try {
    localStorage.removeItem('razorpay_payment_state');
  } catch (error) {
    console.error('Failed to clear payment state:', error);
  }
}

// Payment retry utilities
export function shouldRetryPayment(error: PaymentError): boolean {
  const retryableErrors = [
    'NETWORK_ERROR',
    'TIMEOUT_ERROR',
    'SERVER_ERROR',
  ];

  return retryableErrors.includes(error.code || '');
}

export function getRetryDelay(attempt: number): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, 16s
  return Math.min(1000 * Math.pow(2, attempt), 16000);
}
