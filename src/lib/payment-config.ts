/**
 * Payment Configuration Utility
 * Handles payment feature flags and configuration
 */

export const getPaymentConfig = () => {
  const requirePayment = process.env.REQUIRE_PAYMENT === 'true';
  const currency = process.env.PAYMENT_CURRENCY || 'INR';
  const description = process.env.PAYMENT_DESCRIPTION || 'Melodia Song Generation';

  return {
    requirePayment,
    currency,
    description,
    isPaymentEnabled: requirePayment && !!process.env.RAZORPAY_KEY_ID && !!process.env.RAZORPAY_KEY_SECRET
  };
};

export const shouldRequirePayment = (): boolean => {
  return getPaymentConfig().requirePayment;
};

export const isPaymentEnabled = (): boolean => {
  return getPaymentConfig().isPaymentEnabled;
};
