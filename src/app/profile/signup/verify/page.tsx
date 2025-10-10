"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { OTPInput } from "@/components/forms/OTPInput";
import { ResendButton } from "@/components/forms/ResendButton";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Single Responsibility: Component handles OTP verification page UI and flow
export default function VerifyEmailPage() {
  const { user, loading: authLoading, refreshUser } = useAuth();
  const router = useRouter();

  // Simplified state management
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(
    null
  );

  // Single Responsibility: Send verification email
  const handleSendVerification = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      const data = await response.json();
      if (!data.success) {
        setError(data.error?.message || "Failed to send verification code");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle authentication and auto-send verification email
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace("/profile/signup");
      return;
    }

    if (user.email_verified) {
      router.replace("/profile");
      return;
    }

    // Auto-send verification email for unverified users
    handleSendVerification();
  }, [authLoading, user, router, handleSendVerification]);

  // Handle close/back action
  const handleClose = () => {
    router.back();
  };

  // Single Responsibility: Handle OTP verification
  const handleVerifyOTP = async (otpValue?: string) => {
    const codeToVerify = otpValue || otp;

    if (codeToVerify.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeToVerify }),
      });

      const data = await response.json();

      if (data.success || data.error?.code === "ALREADY_VERIFIED") {
        // Clear anonymous user ID after successful email verification (signup completion)
        localStorage.removeItem("anonymous_user_id");
        await refreshUser();
        router.push("/profile");
      } else {
        setError(data.error?.message || "Invalid verification code");
        setAttemptsRemaining(data.error?.details?.attemptsRemaining || null);
        setOtp("");
      }
    } catch {
      setError("Network error. Please try again.");
      setOtp("");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Don't render if user is not authenticated or already verified
  if (!user || user.email_verified) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header with Close Button */}
      <header className="flex items-center justify-between p-4">
        <div></div>
        <button
          onClick={handleClose}
          className="text-melodia-teal hover:text-melodia-coral transition-colors"
          aria-label="Close"
        >
          <svg
            fill="currentColor"
            height="28"
            viewBox="0 0 256 256"
            width="28"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"></path>
          </svg>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm">
          {/* Title Section */}
          <h1 className="font-display text-4xl font-bold text-melodia-teal mb-4">
            Check your email
          </h1>
          <p className="text-melodia-teal/80 mb-8">
            We sent a 6-digit confirmation code to your email. Please enter it
            below.
          </p>

          {/* OTP Input Section */}
          <div className="space-y-8">
            <OTPInput
              value={otp}
              onChange={setOtp}
              onComplete={(value) => handleVerifyOTP(value)}
              disabled={isLoading}
              error={!!error}
            />

            {/* Error Message */}
            {error && (
              <div className="text-sm text-melodia-coral text-center">
                {error}
                {attemptsRemaining !== null && attemptsRemaining > 0 && (
                  <div className="mt-1 text-xs text-melodia-teal/60">
                    {attemptsRemaining} attempt
                    {attemptsRemaining !== 1 ? "s" : ""} remaining
                  </div>
                )}
              </div>
            )}

            {/* Verify Button */}
            <Button
              onClick={() => handleVerifyOTP(otp)}
              disabled={otp.length !== 6 || isLoading}
              size="lg"
              className="w-full h-14 bg-primary text-text font-display font-bold text-lg rounded-full shadow-md hover:bg-yellow-400 transition-colors duration-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Verifying...
                </div>
              ) : (
                "Verify"
              )}
            </Button>
          </div>

          {/* Resend Section */}
          <div className="mt-6 text-center">
            <p className="text-sm text-melodia-teal/60 mb-2">
              Didn&apos;t receive the code?
            </p>
            <ResendButton
              onResend={handleSendVerification}
              disabled={isLoading}
              cooldownSeconds={60}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center">
        <p className="text-xs text-melodia-teal/60">
          © 2024 Melodia. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
