'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { PaymentModalProps, PaymentFlowState } from '@/types/payment';
import { openRazorpayCheckout, handleRazorpayClientError } from '@/lib/razorpay-client';
import PricingPlans from './PricingPlans';

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  songRequestId,
  planId,
}) => {
  const [flowState, setFlowState] = useState<PaymentFlowState>({
    step: 'select-plan',
    loading: false,
  });
  const [selectedPlanId, setSelectedPlanId] = useState<number>(planId);
  const [ setOrderData] = useState<any>(null);

  useEffect(() => {
    if (isOpen) {
      setFlowState({ step: 'select-plan', loading: false });
      setSelectedPlanId(planId);
    }
  }, [isOpen, planId]);

  const handleCreateOrder = async () => {
    try {
      setFlowState({ step: 'payment', loading: true });

      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          songRequestId,
          planId: selectedPlanId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setOrderData(data);
        setFlowState({ step: 'payment', loading: false });
        await handlePayment(data);
      } else {
        setFlowState({ step: 'error', error: data.message, loading: false });
      }
    } catch (error) {
      setFlowState({ step: 'error', error: error instanceof Error ? error.message : 'Failed to create payment order', loading: false });
    }
  };

  const handlePayment = async (orderData: any) => {
    try {
      setFlowState({ step: 'payment', loading: true });

      await openRazorpayCheckout(
        orderData,
        async (paymentId, orderId, signature) => {
          setFlowState({ step: 'verification', loading: true });
          await verifyPayment(paymentId, orderId, signature);
        },
        (error) => {
          setFlowState({ step: 'error', error: error.description, loading: false });
        },
        () => {
          setFlowState({ step: 'select-plan', loading: false });
        }
      );
    } catch (error) {
      const clientError = handleRazorpayClientError(error);
      setFlowState({ step: 'error', error: clientError.message, loading: false });
    }
  };

  const verifyPayment = async (paymentId: string, orderId: string, signature: string) => {
    try {
      const response = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          razorpay_payment_id: paymentId,
          razorpay_order_id: orderId,
          razorpay_signature: signature,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFlowState({ step: 'success', loading: false });
        onSuccess(data.paymentId);
      } else {
        setFlowState({ step: 'error', error: data.message, loading: false });
      }
    } catch (error) {
      setFlowState({ step: 'error', error: error instanceof Error ? error.message : 'Failed to verify payment', loading: false });
    }
  };

  const handleRetry = () => {
    setFlowState({ step: 'select-plan', loading: false });
  };

  const handleClose = () => {
    if (flowState.step === 'success') {
      onSuccess(0); // Success already handled
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {flowState.step === 'select-plan' && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Choose Your Plan
                </h3>
                <p className="text-gray-600">
                  Select a plan to generate your personalized song
                </p>
              </div>

              <PricingPlans
                onSelectPlan={setSelectedPlanId}
                selectedPlanId={selectedPlanId}
                showDescription={true}
                compact={true}
              />

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!selectedPlanId}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Proceed to Payment
                </button>
              </div>
            </div>
          )}

          {flowState.step === 'payment' && flowState.loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Creating payment order...</p>
            </div>
          )}

          {flowState.step === 'payment' && !flowState.loading && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Opening payment gateway...</p>
            </div>
          )}

          {flowState.step === 'verification' && (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Verifying payment...</p>
            </div>
          )}

          {flowState.step === 'success' && (
            <div className="text-center py-8">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Successful!
              </h3>
              <p className="text-gray-600 mb-6">
                Your payment has been processed successfully. You can now generate your song.
              </p>
              <button
                onClick={handleClose}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {flowState.step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Payment Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {flowState.error || 'An error occurred during payment processing.'}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleRetry}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
