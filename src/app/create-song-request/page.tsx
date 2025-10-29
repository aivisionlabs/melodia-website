"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useAnonymousUser } from "@/hooks/use-anonymous-user";
import { ContactDetailsDialog } from "@/components/ContactDetailsDialog";
import { CreateSongRequestStep1 } from "@/components/create-song-request/CreateSongRequestStep1";
import { CreateSongRequestStep2 } from "@/components/create-song-request/CreateSongRequestStep2";
import { ReviewRequestPopup } from "@/components/create-song-request/ReviewRequestPopup";
import { HeaderLogo } from "@/components/OptimizedLogo";

type Step = 1 | 2;

interface SongRequestPayload {
  requesterName?: string; // Optional - user can choose not to provide name
  recipientDetails: string;
  occasion: string;
  languages: string;
  story: string;
  mood: string[];
  userId: number | string | null;
  anonymousUserId: string | null;
  mobileNumber?: string;
  email?: string;
}

export default function CreateSongRequestPage() {
  const router = useRouter();
  const { anonymousUserId } = useAnonymousUser();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);

  const [recipientDetails, setRecipientDetails] = useState("");
  const [occasion, setOccasion] = useState<string>("Birthday");
  const [customOccasion, setCustomOccasion] = useState("");
  const [languages, setLanguages] = useState<string>("English");
  const [story, setStory] = useState("");
  const [moods, setMoods] = useState<string[]>(["Sentimental"]);
  const [customMood, setCustomMood] = useState("");

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  const toggleMood = (m: string) => {
    if (m === "Other") {
      // If "Other" is already selected, deselect it and clear custom mood
      if (moods.includes("Other")) {
        setMoods((prev) => prev.filter((x) => x !== "Other"));
        setCustomMood("");
      } else {
        // Select "Other" and clear other moods
        setMoods(["Other"]);
        setCustomMood("");
      }
    } else {
      // For regular moods, remove "Other" if it's selected and toggle the mood
      setMoods((prev) => {
        const withoutOther = prev.filter((x) => x !== "Other");
        return withoutOther.includes(m)
          ? withoutOther.filter((x) => x !== m)
          : [...withoutOther, m];
      });
      // Clear custom mood when selecting regular moods
      if (!moods.includes(m)) {
        setCustomMood("");
      }
    }
  };

  const handleBack = () => {
    setStep((prevStep) => Math.max(1, (prevStep as number) - 1) as Step);
  };

  const handleNext = () => {
    // Validate recipient name format
    if (!recipientDetails || recipientDetails.trim().length === 0) {
      setError(
        "Please enter the recipient's name and relationship (e.g., 'Sarah, my best friend' or 'Rohan, my brother')."
      );
      return;
    }

    // Check minimum length (minimum 2 characters required by API)
    if (recipientDetails.trim().length < 2) {
      setError(
        "Please provide at least 2 characters for the recipient details."
      );
      return;
    }

    setError(null);
    setStep(2);
  };

  const handleCreateSongRequest = async (
    mobileNumber: string,
    email: string
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Create song request in database
      const songRequestPayload: SongRequestPayload = {
        // requesterName is optional - only include if provided
        recipientDetails,
        occasion: occasion === "Other" ? customOccasion : occasion,
        languages,
        story,
        mood: moods.includes("Other") ? [customMood] : moods,
        mobileNumber: mobileNumber,
        email: email,
        userId: null,
        anonymousUserId,
      };

      const createRequestResponse = await fetch("/api/create-song-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(songRequestPayload),
      });

      if (!createRequestResponse.ok) {
        const errorData = await createRequestResponse.json();
        console.log("🎵 Error data:", errorData);

        // Handle Zod validation errors
        if (errorData?.issues && Array.isArray(errorData.issues)) {
          const firstError = errorData.issues[0];
          let errorMessage = firstError?.message || "Validation error";

          // Provide context for common validation errors
          if (firstError?.path?.includes("recipientDetails")) {
            errorMessage =
              "Please enter the recipient's name and relationship (e.g., 'Sarah, my best friend').";
          } else if (firstError?.path?.includes("languages")) {
            errorMessage = "Please enter a language for the song.";
          }

          throw new Error(errorMessage);
        }

        throw new Error(
          errorData?.errorMessage ||
            errorData?.error ||
            "Failed to create song request"
        );
      }

      await createRequestResponse.json();

      // Redirect to success page
      console.log(
        "🎵 Song request created successfully, redirecting to success page"
      );
      router.push("/request-capture-success");
    } catch (error) {
      console.error("Error creating song request:", error);
      const errorMessage = `Sorry, there was an error creating your song request. ${error}`;
      setError(errorMessage);
      setShowReviewPopup(true); // Show popup again on error
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactDetailsSubmit = async (data: {
    mobileNumber: string;
    email: string;
  }) => {
    await handleCreateSongRequest(data.mobileNumber, data.email);
  };

  const handleSubmit = async () => {
    // Show contact details dialog instead of review popup
    setError(null);
    setShowReviewPopup(true);
  };

  return (
    <div
      className={`min-h-screen ${
        showReviewPopup ? "bg-primary-yellow" : "bg-secondary-cream"
      } text-text-teal flex flex-col font-body pb-20`}
    >
      {/* Logo Header */}
      <div className="px-6 pt-4 pb-2">
        <Link href="/" className="inline-block" aria-label="Go to homepage">
          <HeaderLogo alt="Melodia Logo" />
        </Link>
      </div>

      <div className="p-6 space-y-8 flex-grow">
        {step === 1 && (
          <CreateSongRequestStep1
            recipientDetails={recipientDetails}
            setRecipientDetails={setRecipientDetails}
            occasion={occasion}
            setOccasion={setOccasion}
            customOccasion={customOccasion}
            setCustomOccasion={setCustomOccasion}
            languages={languages}
            setLanguages={setLanguages}
          />
        )}

        {step === 2 && (
          <CreateSongRequestStep2
            story={story}
            setStory={setStory}
            moods={moods}
            toggleMood={toggleMood}
            customMood={customMood}
            setCustomMood={setCustomMood}
            onBack={handleBack}
          />
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-6">
          <div className="bg-error/10 border border-error rounded-lg p-4">
            <p className="text-error text-sm font-medium">{error}</p>
          </div>
        </div>
      )}

      <div className="p-6 sticky bottom-0 bg-white pt-4 pb-6">
        {step === 1 ? (
          <Button
            className="w-full h-14 bg-accent-coral text-white text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            className="w-full h-14 bg-primary-yellow text-text-teal text-lg font-bold rounded-full shadow-lg hover:scale-105 transition-transform duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </div>
            ) : (
              "Review inputs"
            )}
          </Button>
        )}
      </div>

      <ReviewRequestPopup
        isOpen={showReviewPopup}
        onClose={() => setShowReviewPopup(false)}
        onSubmit={() => setShowContactDialog(true)}
        isSubmitting={isSubmitting}
        error={error}
        formData={{
          recipientDetails,
          occasion,
          customOccasion,
          languages,
          moods,
          customMood,
        }}
      />

      {/* Contact Details Dialog */}
      <ContactDetailsDialog
        isOpen={showContactDialog}
        onClose={() => setShowContactDialog(false)}
        onSubmit={handleContactDetailsSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
