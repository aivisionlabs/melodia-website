"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useLoginForm } from "@/hooks/use-login-form";
import { FormField } from "@/components/forms/FormField";
import { PasswordField } from "@/components/forms/PasswordField";
import { GoogleAuthButton } from "@/components/forms/GoogleAuthButton";

// Single Responsibility: Component handles login page UI and authentication
export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}

function LoginPageContent() {
  const { user, error, isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Dependency Inversion: Use custom hook for form management
  const form = useLoginForm();

  // Check for success message from URL params
  useEffect(() => {
    const message = searchParams.get("message");
    if (message === "password-reset-success") {
      setSuccessMessage(
        "Password reset successful! You can now log in with your new password."
      );
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(null), 5000);
    }
  }, [searchParams]);

  // Single Responsibility: Handle authentication redirect
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      // Redirect to logged-in profile page
      router.replace("/profile/logged-in");
    }
  }, [loading, isAuthenticated, user, router]);

  // Additional effect to handle redirect after successful login
  useEffect(() => {
    if (!loading && isAuthenticated && user && !form.isSubmitting) {
      // Small delay to ensure state is fully updated
      const timer = setTimeout(() => {
        router.replace("/profile/logged-in");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, isAuthenticated, user, form.isSubmitting, router]);

  // Fallback redirect mechanism - check for successful login
  useEffect(() => {
    const checkForSuccessfulLogin = () => {
      // Check if user is authenticated (from JWT token)
      if (!loading && isAuthenticated && user) {
        router.replace("/profile/logged-in");
      }
    };

    // Check immediately and also after a delay
    checkForSuccessfulLogin();
    const timer = setTimeout(checkForSuccessfulLogin, 500);

    return () => clearTimeout(timer);
  }, [loading, isAuthenticated, user, router]);

  // Single Responsibility: Handle Google authentication
  const handleGoogleAuth = () => {
    // Placeholder for Google authentication
    // TODO: Implement Google OAuth
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center p-4 text-center">
        {/* Melodia Logo */}
        <div className="mb-8">
          <Image
            src="/images/melodia-logo.jpeg"
            alt="Melodia Logo"
            width={180}
            height={180}
            className="mx-auto"
            priority
          />
        </div>

        <h2 className="font-heading text-2xl text-melodia-teal mb-8">
          Log in to your account
        </h2>

        <div className="w-full max-w-sm space-y-4">
          {/* Google Sign In Button */}
          <GoogleAuthButton onClick={handleGoogleAuth} />

          {/* OR Divider */}
          <div className="relative flex py-4 items-center">
            <div className="flex-grow border-t border-melodia-teal/20"></div>
            <span className="flex-shrink mx-4 text-melodia-teal/60 font-body">
              OR
            </span>
            <div className="flex-grow border-t border-melodia-teal/20"></div>
          </div>

          {/* Login Form */}
          <form onSubmit={form.handleSubmit} className="space-y-4">
            <FormField
              id="email"
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={form.handleEmailChange}
              error={form.validation.errors.email}
              required
            />

            <PasswordField
              id="password"
              placeholder="Password"
              value={form.password}
              onChange={form.handlePasswordChange}
              error={form.validation.errors.password}
              required
              showPassword={form.showPassword}
              onToggleVisibility={() =>
                form.setShowPassword(!form.showPassword)
              }
            />

            <div className="text-right">
              <Link href="/profile/forgot-password">
                <span className="text-accent text-sm hover:underline font-body font-bold mb-2">
                  Forgot Password?
                </span>
              </Link>
            </div>

            <Button
              type="submit"
              disabled={!form.isFormValid || form.isSubmitting}
              className="w-full bg-melodia-yellow text-melodia-teal font-bold py-3 px-4 rounded-xl hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {form.isSubmitting ? "Logging in..." : "Log In"}
            </Button>

            {/* Success Message */}
            {successMessage && (
              <div className="text-sm text-green-600 text-center bg-green-50 border border-green-200 rounded-lg p-3">
                {successMessage}
              </div>
            )}

            {/* Form Error Message */}
            {form.error && (
              <div className="text-sm text-red-500 text-center bg-red-50 border border-red-200 rounded-lg p-3">
                {form.error}
              </div>
            )}

            {/* Auth Error Message */}
            {error && (
              <div className="text-sm text-melodia-coral text-center">
                {error}
              </div>
            )}

            {form.isSubmitting && (
              <div className="text-sm text-melodia-teal text-center">
                Logging you in...
              </div>
            )}
          </form>

          {/* Sign Up Link */}
          <div className="text-center">
            <span className="text-melodia-teal font-body">
              Don&apos;t have an account?
            </span>
            <Link
              href="/profile/signup"
              className="ml-1 text-melodia-coral font-medium hover:underline font-body"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
