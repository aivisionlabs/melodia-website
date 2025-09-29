"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useProfileInfoForm } from "@/hooks/use-profile-info-form";
import { FormField } from "@/components/forms/FormField";

// Single Responsibility: Component handles signup page UI and authentication
export default function SignupPage() {
  const { user, error, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  // Dependency Inversion: Use custom hook for form management
  const form = useProfileInfoForm();

  // Single Responsibility: Handle authentication redirect
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace("/profile/logged-in");
    }
  }, [loading, isAuthenticated, user, router]);

  // Single Responsibility: Handle close/cancel action
  const handleClose = () => {
    router.back();
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-melodia-teal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleClose}
          className="text-melodia-teal text-2xl font-bold hover:text-melodia-teal/80 transition-colors"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-screen px-6 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-melodia-teal mb-2">
            Tell us about you
          </h1>
          <p className="text-base text-melodia-teal max-w-xs">
            We need a little more info to set up your account.
          </p>
        </div>

        {/* Form Section */}
        <div className="w-full max-w-sm">
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <FormField
              id="name"
              placeholder="Full name"
              value={form.name}
              onChange={form.handleNameChange}
              error={form.validation.errors.name}
              required
            />
            
            <FormField
              id="dateOfBirth"
              placeholder="Date of birth (DD/MM/YYYY)"
              value={form.dateOfBirth}
              onChange={form.handleDateOfBirthChange}
              error={form.validation.errors.dateOfBirth}
              maxLength={10}
              required
            />
            
            <FormField
              id="email"
              type="email"
              placeholder="Email address (required)"
              value={form.email}
              onChange={form.handleEmailChange}
              error={form.validation.errors.email}
              required
            />
            
            <FormField
              id="phoneNumber"
              type="tel"
              placeholder="Phone number (optional)"
              value={form.phoneNumber}
              onChange={form.handlePhoneNumberChange}
              error={form.validation.errors.phoneNumber}
            />

            <Button
              type="submit"
              disabled={!form.isFormValid || form.isSubmitting}
              className="w-full bg-melodia-yellow text-melodia-teal font-bold py-4 px-4 rounded-lg hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.isSubmitting ? "Continuing..." : "Continue"}
            </Button>

            {error && (
              <div className="text-sm text-melodia-coral text-center">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Footer with Legal Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-melodia-teal">
            By continuing, you agree to Melodia's{" "}
            <Link href="/terms" className="text-melodia-coral hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-melodia-coral hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
