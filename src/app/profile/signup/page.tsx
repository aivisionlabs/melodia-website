/**
 * Signup Page
 * User registration with email/password
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FormField } from "@/components/forms/FormField";
import { PasswordField } from "@/components/forms/PasswordField";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    dateOfBirth: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          dateOfBirth: formData.dateOfBirth,
          phoneNumber: formData.phoneNumber || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.details) {
          const newErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.error || "Registration failed" });
        }
        return;
      }

      // Redirect to verification page
      router.push(
        `/profile/signup/verify?email=${encodeURIComponent(formData.email)}`
      );
    } catch (error) {
      console.error("Signup error:", error);
      setErrors({ general: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 py-12 px-4">
      <div className="max-w-md mx-auto">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-flex items-center text-text-teal hover:text-accent-coral transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <h1 className="text-3xl font-bold text-text-teal font-heading mb-2">
            Create Account
          </h1>
          <p className="text-text-teal/70 mb-6">
            Join Melodia to create personalized songs
          </p>

          {errors.general && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-error text-sm font-medium">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField
              id="name"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              error={errors.name}
              required
            />

            <FormField
              id="email"
              label="Email Address"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              error={errors.email}
              required
            />

            <PasswordField
              id="password"
              label="Password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              error={errors.password}
              showStrengthIndicator
              required
            />

            <FormField
              id="dateOfBirth"
              label="Date of Birth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) =>
                setFormData({ ...formData, dateOfBirth: e.target.value })
              }
              error={errors.dateOfBirth}
              required
            />

            <FormField
              id="phoneNumber"
              label="Phone Number (Optional)"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              error={errors.phoneNumber}
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-yellow text-text-teal hover:bg-primary-yellow/90 font-bold py-6 text-lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-text-teal/70">
              Already have an account?{" "}
              <Link
                href="/profile/login"
                className="text-accent-coral font-semibold hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

