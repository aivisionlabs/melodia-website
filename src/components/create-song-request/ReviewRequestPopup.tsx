"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";

interface ReviewRequestPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  error: string | null;
  formData: {
    recipientDetails: string;
    occasion: string;
    customOccasion: string;
    languages: string;
    moods: string[];
    customMood: string;
  };
}

export function ReviewRequestPopup({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  error,
  formData,
}: ReviewRequestPopupProps) {
  if (!isOpen) {
    return null;
  }

  const {
    recipientDetails,
    occasion,
    customOccasion,
    languages,
    moods,
    customMood,
  } = formData;

  return (
    <div className="fixed inset-0 bg-primary-yellow z-50 flex flex-col">
      {/* Back Button */}
      <div className="p-6 pt-16 bg-primary-yellow flex-shrink-0">
        <button
          onClick={onClose}
          className="flex items-center gap-2 text-text-teal hover:scale-105 transition-transform"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto bg-primary-yellow">
        <div className="min-h-full flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
            {/* Sparkle Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-text-teal mb-4">
              Review & Create Your Song
            </h1>

            {/* Summary Text */}
            <p className="text-text-teal text-base leading-relaxed mb-8">
              Okay <span className="font-bold">there</span>! We&apos;re creating
              a{" "}
              <span className="font-bold">
                {moods.includes("Other") ? customMood : moods.join(", ")}
              </span>{" "}
              song in <span className="font-bold">{languages}</span> for{" "}
              <span className="font-bold">{recipientDetails}</span>, for the
              occassion of{" "}
              <span className="font-bold">
                {occasion === "Other" ? customOccasion : occasion}
              </span>
              . Ready to see the magic?
            </p>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Create Button */}
            <Button
              onClick={onSubmit}
              disabled={isSubmitting}
              className="w-full h-14 bg-accent-coral text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </div>
              ) : (
                "Capture My Song Request"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
