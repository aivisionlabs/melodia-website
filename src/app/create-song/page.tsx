"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { SongFormData } from "@/lib/services/llm/llm-lyrics-opearation";
import { createSongRequest } from "@/lib/song-request-actions";
import { useToast } from "@/components/ui/toast";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function CreateSongPage() {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState<SongFormData>({
    requesterName: "",
    recipientDetails: "",
    languages: "English",
    mood: [],
    songStory: "",
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // If first-time, go to onboarding
  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("onboarding_complete");
      if (done !== "true") {
        router.replace("/onboarding");
        return;
      }
    }
  }, [router]);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        requesterName: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.recipientDetails.trim()) {
      errors.recipientDetails = "Who is this song for? (Required)";
    } else if (formData.recipientDetails.length < 3) {
      errors.recipientDetails = "Name must be at least 3 characters";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof SongFormData,
    value: string | string[]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Clear general error when user makes changes
    if (error) {
      setError(null);
    }
  };

  const isFormValid = (): boolean => {
    return formData.recipientDetails.trim().length >= 3;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateForm()) {
      setError("Please fill in all required fields to continue.");
      return;
    }

    setIsSubmitting(true);

    try {
      const anonymousId =
        typeof window !== "undefined"
          ? localStorage.getItem("anonymous_user_id") || undefined
          : undefined;
      const result = await createSongRequest(
        {
          requesterName: formData.requesterName || "",
          recipientDetails: formData.recipientDetails,
          occasion: formData.occassion || "",
          languages: formData.languages,
          story: formData.songStory,
          mood: Array.isArray(formData.mood) ? formData.mood : [formData.mood],
          userId: user?.id || null,
          anonymousUserId: anonymousId || null,
        },
        user?.id || null,
        anonymousId || null
      );

      if (result.success) {
        setSuccess(true);
        addToast({
          type: "success",
          title: "Request Submitted!",
          message:
            "Your song request has been submitted successfully. Now let's create the lyrics!",
        });
        // Redirect to lyrics creation page after success
        setTimeout(() => {
          router.push(`/create-lyrics/${result.requestId}`);
        }, 2000);
      } else {
        const errorMessage =
          result.error || "Failed to submit song request. Please try again.";
        setError(errorMessage);
        addToast({
          type: "error",
          title: "Submission Failed",
          message: errorMessage,
        });
      }
    } catch {
      const errorMessage = "Failed to submit song request. Please try again.";
      setError(errorMessage);
      addToast({
        type: "error",
        title: "Error",
        message: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading..." />;
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-melodia-cream relative overflow-hidden">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold font-heading text-melodia-teal mb-4">
              Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Your song request has been submitted successfully. Now let&apos;s
              create the lyrics!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-melodia-coral"></div>
              <span>Redirecting to lyrics creation...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-melodia-cream text-melodia-teal flex flex-col font-body pt-16 pb-20">
      <div className="p-6 space-y-8 flex-grow">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-melodia-coral transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-melodia-coral focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <header className="text-center">
            <h1 className="text-3xl font-bold font-heading text-melodia-teal">
              Create your song
            </h1>
            <p className="text-md text-melodia-teal/80 mt-1">
              Tell us a little bit about it.
            </p>
          </header>

          {/* Who is this song for? */}
          <div>
            <label
              className="block text-lg font-semibold text-melodia-teal mb-2"
              htmlFor="recipient_name"
            >
              To / For
            </label>
            <p className="text-sm text-melodia-teal opacity-70 mb-3">
              Who is this song for?
            </p>
            <input
              id="recipient_name"
              value={formData.recipientDetails}
              onChange={(e) =>
                handleInputChange("recipientDetails", e.target.value)
              }
              placeholder="My best friend, Rohan"
              className={`form-input w-full ${
                validationErrors.recipientDetails ? "border-red-500" : ""
              }`}
            />
            {validationErrors.recipientDetails && (
              <p className="text-red-500 text-sm mt-2">
                {validationErrors.recipientDetails}
              </p>
            )}
          </div>

          {/* Language */}
          <div>
            <label
              className="block text-lg font-semibold text-melodia-teal mb-2"
              htmlFor="language"
            >
              Language
            </label>
            <input
              id="language"
              value={formData.languages}
              onChange={(e) =>
                handleInputChange(
                  "languages",
                  e.target.value
                    .split(",")
                    .map((l) => l.trim())
                    .filter(Boolean)
                )
              }
              placeholder="English"
              className="form-input w-full"
            />
            <p className="text-sm text-melodia-teal opacity-70 mt-2 px-1">
              Feel free to mix it up! e.g., Hindi + English, Punjabi
            </p>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Submit Button */}
      <div className="p-6">
        <Button
          type="submit"
          onClick={handleSubmit}
          className={`w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg hover:bg-opacity-90 transition-all duration-200 ease-in-out transform hover:scale-105 ${
            !isFormValid() || isSubmitting
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
          disabled={!isFormValid() || isSubmitting}
        >
          {isSubmitting ? "Creating Request..." : "Next"}
        </Button>
      </div>
    </div>
  );
}
