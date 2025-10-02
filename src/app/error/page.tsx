"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

// Force dynamic rendering
export const dynamic = "force-dynamic";

function ErrorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const getErrorMessage = () => {
    switch (message) {
      case "song_creation_failed":
        return {
          title: "Song Creation Failed",
          description:
            "We were unable to process your request. Any amount debited will be refunded within 3-5 business days.",
          action: "Contact Support",
        };
      case "payment_failed":
        return {
          title: "Payment Failed",
          description:
            "Your payment could not be processed. Please try again or use a different payment method.",
          action: "Try Again",
        };
      default:
        return {
          title: "Something Went Wrong",
          description:
            "We encountered an unexpected error. Please try again or contact support if the issue persists.",
          action: "Go Home",
        };
    }
  };

  const errorInfo = getErrorMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {errorInfo.title}
        </h1>

        <p className="text-gray-600 mb-8 leading-relaxed">
          {errorInfo.description}
        </p>

        <div className="space-y-3">
          {message === "song_creation_failed" && (
            <button
              onClick={() =>
                window.open(
                  "mailto:support@melodia.com?subject=Song Creation Failed",
                  "_blank"
                )
              }
              className="w-full bg-melodia-coral text-white font-semibold py-3 px-6 rounded-xl hover:bg-melodia-coral/90 transition-colors"
            >
              Contact Support
            </button>
          )}

          {message === "payment_failed" && (
            <button
              onClick={() => router.back()}
              className="w-full bg-melodia-coral text-white font-semibold py-3 px-6 rounded-xl hover:bg-melodia-coral/90 transition-colors"
            >
              Try Again
            </button>
          )}

          <Link
            href="/"
            className="block w-full bg-gray-100 text-gray-700 font-semibold py-3 px-6 rounded-xl hover:bg-gray-200 transition-colors"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? Contact us at{" "}
            <a
              href="mailto:support@melodia.com"
              className="text-melodia-coral hover:underline"
            >
              support@melodia.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="animate-pulse">
              <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-6"></div>
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-8"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      }
    >
      <ErrorPageContent />
    </Suspense>
  );
}
