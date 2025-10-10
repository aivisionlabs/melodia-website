"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuthenticatedApi } from "@/lib/api-client";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestId = searchParams.get("requestId");
  const { addToast } = useToast();
  const { apiClient, hasUserContext } = useAuthenticatedApi();

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!requestId) {
      router.push("/");
      return;
    }
  }, [requestId, router]);

  const handlePayment = async () => {
    if (!requestId || !hasUserContext) return;

    setLoading(true);
    try {
      const response = await apiClient.post("/api/payment/create", {
        requestId: parseInt(requestId),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create payment");
      }

      if (data.success) {
        if (data.demoMode && data.status === "completed") {
          // Demo mode - payment completed immediately
          await handlePaymentSuccess(data.paymentId, requestId);
        } else {
          // Production mode - redirect to payment gateway
          // In production, redirect to Razorpay checkout
          // window.location.href = data.redirectUrl;
          await handlePaymentSuccess(data.paymentId, requestId);
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      addToast({
        type: "error",
        title: "Payment Failed",
        message: error instanceof Error ? error.message : "Payment failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentId: string, requestId: string) => {
    try {
      const response = await apiClient.post("/api/payment/success", {
        paymentId,
        requestId,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to process payment success");
      }

      if (data.success) {
        addToast({
          type: "success",
          title: "Payment Successful!",
          message: "Creating your song...",
        });
        // Redirect to song options page
        router.push(`/song-options/${data.songId}`);
      }
    } catch (error) {
      console.error("Payment success error:", error);
      addToast({
        type: "error",
        title: "Song Creation Failed",
        message:
          "Payment processed but song creation failed. Please contact support.",
      });
      router.push("/error?message=song_creation_failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-melodia-yellow to-melodia-coral flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-melodia-coral rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-melodia-teal mb-2">
            Complete Your Payment
          </h1>
          <p className="text-gray-600">
            Pay Rs. 299 to generate your personalized song
          </p>
        </div>

        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Order Summary</h3>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">
                Personalized Song Generation
              </span>
              <span className="font-semibold">Rs. 299</span>
            </div>
            <div className="border-t border-gray-200 mt-2 pt-2">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total</span>
                <span className="text-melodia-coral">Rs. 299</span>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-900">Payment Method</h3>
            <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
              <input
                type="radio"
                id="razorpay"
                name="paymentMethod"
                value="razorpay"
                defaultChecked
                className="text-melodia-coral focus:ring-melodia-coral"
              />
              <label htmlFor="razorpay" className="flex items-center space-x-2">
                <span className="text-sm font-medium">Razorpay</span>
                <span className="text-xs text-gray-500">
                  (Cards, UPI, Net Banking)
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-melodia-coral text-white font-semibold py-3 px-6 rounded-xl hover:bg-melodia-coral/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                  <span>Pay Rs. 299</span>
                </>
              )}
            </button>

            <button
              onClick={() => router.push(`/generate-lyrics/${requestId}`)}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Back to Lyrics
            </button>
          </div>

          {/* Security Notice */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              🔒 Your payment is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-melodia-yellow to-melodia-coral flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-16 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  );
}
