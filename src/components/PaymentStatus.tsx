"use client";

import React from "react";
import { CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { PaymentStatusProps } from "@/types/payment";
import {
  formatAmount,
  getPaymentStatusDisplayName,
  getPaymentStatusColor,
  getPaymentStatusBgColor,
  getPaymentMethodDisplayName,
} from "@/lib/razorpay-client";

export const PaymentStatus: React.FC<PaymentStatusProps> = ({
  paymentId,
  status,
  amount,
  currency,
  createdAt,
  paymentMethod,
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "failed":
        return <XCircle className="h-5 w-5 text-red-500" />;
      case "refunded":
        return <RefreshCw className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    return getPaymentStatusDisplayName(status);
  };

  const getStatusColor = () => {
    return getPaymentStatusColor(status);
  };

  const getStatusBgColorClass = () => {
    return getPaymentStatusBgColor(status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-card rounded-lg border border-melodia-teal-medium p-4 shadow-elegant">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`font-medium ${getStatusColor()}`}>
            {getStatusText()}
          </span>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">
            {formatAmount(amount, currency)}
          </p>
          <p className="text-sm text-gray-600">Payment ID: {paymentId}</p>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{formatDate(createdAt)}</span>
        </div>
        {paymentMethod && (
          <div className="flex justify-between">
            <span>Method:</span>
            <span>{getPaymentMethodDisplayName(paymentMethod)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Status:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBgColorClass()} ${getStatusColor()}`}
          >
            {getStatusText()}
          </span>
        </div>
      </div>

      {status === "pending" && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            Your payment is being processed. This may take a few minutes.
          </p>
        </div>
      )}

      {status === "failed" && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Payment failed. Please try again or contact support if the issue
            persists.
          </p>
        </div>
      )}

      {status === "refunded" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            This payment has been refunded. The amount will be credited to your
            original payment method.
          </p>
        </div>
      )}
    </div>
  );
};

export default PaymentStatus;
