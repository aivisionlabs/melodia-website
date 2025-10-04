"use client";

import React from "react";
import { CreditCard, X, AlertCircle } from "lucide-react";
import { PaymentRequiredProps } from "@/types/payment";
import { formatAmount } from "@/lib/razorpay-client";

export const PaymentRequired: React.FC<PaymentRequiredProps> = ({
  onProceedToPayment,
  onCancel,
  planName,
  amount,
  currency,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Payment Required</h2>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="text-center mb-6">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary/20 mb-4">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Complete Payment to Continue
            </h3>
            <p className="text-muted-foreground">
              You need to complete payment to generate your personalized song.
            </p>
          </div>

          <div className="bg-secondary rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">{planName}</p>
                <p className="text-sm text-muted-foreground">
                  One-time payment
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {formatAmount(amount, currency)}
                </p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5 mr-3 flex-shrink-0" />
              <div className="text-sm text-foreground">
                <p className="font-medium mb-1">What happens after payment?</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>AI will generate personalized lyrics for your song</li>
                  <li>You can review and edit the lyrics</li>
                  <li>AI will create the music and vocals</li>
                  <li>You can download and share your song</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-2 text-muted-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onProceedToPayment}
              className="flex-1 px-4 py-2 text-primary-foreground bg-gradient-primary rounded-lg hover:bg-gradient-primary/90 transition-colors shadow-glow"
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequired;
