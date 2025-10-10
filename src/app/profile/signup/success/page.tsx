"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { CountdownTimer } from "@/components/ui/countdown-timer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Single Responsibility: Component handles account creation success page
export default function SignupSuccessPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  // Single Responsibility: Handle authentication and verification checks
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        // No user, redirect to signup
        router.replace("/profile/signup");
      } else if (!user.email_verified) {
        // User not verified, redirect to verification
        router.replace("/profile/signup/verify");
      }
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (user?.email_verified && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Redirect to profile page
            router.push("/profile");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, countdown, router]);

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  // Don't render if user is not authenticated or not verified
  if (!user || !user.email_verified) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header - Empty for clean look */}
      <header className="flex items-center justify-between p-4 invisible">
        <div></div>
        <button className="text-melodia-teal hover:text-melodia-coral">
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
          {/* Success Icon */}
          <div className="mb-8">
            <svg
              className="mx-auto h-24 w-24 text-melodia-coral"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Title and Description */}
          <h1 className="font-display text-4xl font-bold text-melodia-teal mb-4">
            Account Created!
          </h1>
          <p className="text-melodia-teal/80 mb-8">
            Your account has been successfully created. You can now save and
            revisit your musical creations.
          </p>

          {/* Countdown Section */}
          <div className="mt-12">
            <p className="text-melodia-teal/80 mb-2">
              Redirecting to Profile in...
            </p>
            <CountdownTimer seconds={countdown} size="lg" className="mx-auto" />
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
