"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { FormField } from "@/components/forms/FormField";
import { PasswordField } from "@/components/forms/PasswordField";
import { GoogleAuthButton } from "@/components/forms/GoogleAuthButton";

// Single Responsibility: Component handles profile page with login/signup
export default function ProfilePage() {
  const { user, error, isAuthenticated, loading, loginWithGoogle, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{email?: string; password?: string}>({});

  // Check for success message from URL params
  useEffect(() => {
    const message = searchParams.get('message');
    const error = searchParams.get('error');
    
    if (message === 'password-reset-success') {
      setSuccessMessage('Password reset successful! You can now log in with your new password.');
      setTimeout(() => setSuccessMessage(null), 5000);
    }
    
    if (message === 'google-auth-success') {
      setSuccessMessage('Google authentication successful! Redirecting...');
      setTimeout(() => {
        router.push('/profile/logged-in');
      }, 1500);
    }
    
    if (error) {
      // Handle OAuth errors
      const errorMessages: Record<string, string> = {
        'oauth_error': 'Google authentication was cancelled or failed.',
        'missing_code': 'Authentication failed. Please try again.',
        'auth_failed': 'Authentication failed. Please try again.',
        'server_error': 'Server error occurred. Please try again later.'
      };
      
      const errorMessage = errorMessages[error] || 'An error occurred during authentication.';
      const detailedMessage = searchParams.get('message');
      setFormError(detailedMessage ? `${errorMessage}: ${decodeURIComponent(detailedMessage)}` : errorMessage);
    }
  }, [searchParams, router]);

  // Single Responsibility: Handle authentication redirect
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      router.replace("/profile/logged-in");
    }
  }, [loading, isAuthenticated, user, router]);

  // Form handlers
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);
    setErrors({});

    // Basic validation
    const newErrors: {email?: string; password?: string} = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/profile/logged-in");
      } else {
        setFormError(result.error || "Login failed. Please try again.");
      }
    } catch (error) {
      setFormError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Single Responsibility: Handle Google authentication
  const handleGoogleAuth = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      console.error('Google auth error:', error);
      setGoogleLoading(false);
    }
  };

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-secondary">
        <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
          <div className="text-text">Loading...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-secondary">
      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-6 text-center">
        <div className="w-full max-w-sm">
          {/* Header */}
          <h1 className="font-display text-4xl font-bold text-text mb-4">Profile</h1>
          <h2 className="font-display text-2xl text-text mb-8">Log in or sign up</h2>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm font-body">{successMessage}</p>
            </div>
          )}

          {/* Error Message */}
          {(error || formError) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm font-body">{error || formError}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Google Auth Button */}
            <GoogleAuthButton
              onClick={handleGoogleAuth}
              loading={googleLoading}
              disabled={isSubmitting}
            />

            {/* Divider */}
            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-text/20"></div>
              <span className="flex-shrink mx-4 text-text/60 font-body">OR</span>
              <div className="flex-grow border-t border-text/20"></div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={handleEmailChange}
                error={errors.email}
                required
                className="w-full h-14 px-5 bg-white border border-text/20 rounded-lg placeholder-text/50 focus:ring-2 focus:ring-primary focus:border-transparent font-body"
              />
              
              <PasswordField
                id="password"
                placeholder="Password"
                value={password}
                onChange={handlePasswordChange}
                error={errors.password}
                required
                showPassword={showPassword}
                onToggleVisibility={() => setShowPassword(!showPassword)}
              />

              <div className="text-right">
                <Link 
                  href="/auth/forgot-password" 
                  className="text-accent text-sm font-medium hover:underline font-body"
                >
                  Forgot Password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={!email.trim() || !password.trim() || isSubmitting}
                className="w-full h-14 bg-primary text-text font-display font-bold text-lg rounded-full shadow-md hover:bg-yellow-400 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Logging in..." : "Log In"}
              </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-center text-text/80 text-sm font-body">
              Don't have an account?{" "}
              <Link href="/auth/signup" className="font-bold text-accent hover:underline">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-secondary border-t border-text/10 shadow-[0_-1px_4px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-24 px-2 pb-safe">
          <Link href="/" className="flex flex-col items-center justify-center text-text/60 hover:text-accent transition-colors">
            <span className="material-symbols-outlined text-3xl">home</span>
            <span className="text-xs font-medium font-body mt-1">Home</span>
          </Link>
          <Link href="/best-songs" className="flex flex-col items-center justify-center text-text/60 hover:text-accent transition-colors">
            <span className="material-symbols-outlined text-3xl">star</span>
            <span className="text-xs font-medium font-body mt-1">Best Songs</span>
          </Link>
          <Link href="/my-songs" className="flex flex-col items-center justify-center text-text/60 hover:text-accent transition-colors">
            <span className="material-symbols-outlined text-3xl">music_note</span>
            <span className="text-xs font-medium font-body mt-1">My Songs</span>
          </Link>
          <Link href="/profile" className="flex flex-col items-center justify-center text-accent">
            <span className="material-symbols-outlined text-3xl text-accent">person</span>
            <span className="text-xs font-bold font-body mt-1">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}