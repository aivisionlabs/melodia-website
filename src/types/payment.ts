// Payment System TypeScript Types

export interface Payment {
  id: number;
  user_id?: number | null;
  anonymous_user_id?: string | null;
  song_request_id: number;
  razorpay_payment_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  payment_method?: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  features: PlanFeatures;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlanFeatures {
  songs: number; // -1 for unlimited
  lyrics_generation: boolean;
  music_generation: boolean;
  download: boolean;
  sharing: boolean;
  priority_support?: boolean;
  custom_styles?: boolean;
}

export interface PaymentWebhook {
  id: number;
  razorpay_event_id: string;
  event_type: string;
  payment_id: number;
  webhook_data: Record<string, any>;
  processed: boolean;
  created_at: string;
  processed_at?: string;
}

// Razorpay API Types
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

export interface RazorpayPayment {
  id: string;
  order_id: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  description: string;
  created_at: number;
  captured: boolean;
  international: boolean;
  refund_status?: string;
  amount_refunded: number;
  notes: Record<string, any>;
  fee: number;
  tax: number;
  error_code?: string;
  error_description?: string;
  error_source?: string;
  error_step?: string;
  error_reason?: string;
}

export interface RazorpayWebhookEvent {
  event: string;
  created_at: number;
  account_id: string;
  contains: string[];
  payload: {
    payment: {
      entity: RazorpayPayment;
    };
  };
}

// API Request/Response Types
export interface CreateOrderRequest {
  songRequestId: number;
  anonymous_user_id?: string;
}

export interface CreateOrderResponse {
  success: boolean;
  orderId: string;
  amount: number;
  currency: string;
  key: string;
  name: string;
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, any>;
  theme?: {
    color?: string;
  };
}

export interface VerifyPaymentRequest {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  anonymous_user_id?: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  paymentId?: number;
  message?: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  payment?: Payment;
  message?: string;
}

export interface PricingPlansResponse {
  success: boolean;
  plans: PricingPlan[];
}

// UI Component Props
export interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: number) => void;
  onError: (error: string) => void;
  songRequestId: number;
  planId: number;
  amount: number;
  currency: string;
}

export interface PricingPlansProps {
  onSelectPlan: (planId: number) => void;
  selectedPlanId?: number;
  showDescription?: boolean;
  compact?: boolean;
}

export interface PaymentStatusProps {
  paymentId: number;
  status: PaymentStatus;
  amount: number;
  currency: string;
  createdAt: string;
  paymentMethod?: string;
}

export interface PaymentRequiredProps {
  onProceedToPayment: () => void;
  onCancel: () => void;
  planName: string;
  amount: number;
  currency: string;
}

// Error Types
export interface PaymentError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
}

export interface RazorpayError {
  error: {
    code: string;
    description: string;
    source: string;
    step: string;
    reason: string;
  };
}

// Payment Flow Types
export interface PaymentFlowState {
  step: 'select-plan' | 'payment' | 'verification' | 'success' | 'error';
  selectedPlan?: PricingPlan;
  paymentId?: number;
  error?: string;
  loading: boolean;
}

// Constants
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_METHODS = {
  CARD: 'card',
  UPI: 'upi',
  NETBANKING: 'netbanking',
  WALLET: 'wallet',
  EMI: 'emi',
} as const;

export const CURRENCIES = {
  INR: 'INR',
  USD: 'USD',
  EUR: 'EUR',
} as const;

export const WEBHOOK_EVENTS = {
  PAYMENT_CAPTURED: 'payment.captured',
  PAYMENT_FAILED: 'payment.failed',
  ORDER_PAID: 'order.paid',
  REFUND_CREATED: 'refund.created',
  REFUND_PROCESSED: 'refund.processed',
} as const;
