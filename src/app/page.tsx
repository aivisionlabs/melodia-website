"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/user-actions";
import { useAnonymousUser } from "@/hooks/use-anonymous-user";
import { SongRequestPayload } from "@/types/song-request";

type Step = 1 | 2;

export default function CreateSongPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReviewPopup, setShowReviewPopup] = useState(false);

  const [requesterName, setRequesterName] = useState("");
  const [recipientDetails, setRecipientDetails] = useState("");
  const [occasion, setOccasion] = useState<string>("Birthday");
  const [customOccasion, setCustomOccasion] = useState("");
  const [languages, setLanguages] = useState<string>("English");
  const [story, setStory] = useState("");
  const [moods, setMoods] = useState<string[]>(["Sentimental"]);
  const [customMood, setCustomMood] = useState("");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Anonymous user hook
  const { anonymousUserId } = useAnonymousUser();

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // Get current user on component mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.log("No user logged in or error getting user:", error);
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

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
    if (!recipientDetails) {
      setError(
        "Please enter the recipient's name and relationship (e.g., 'Sarah, my best friend' or 'Rohan, my brother')."
      );
      return;
    }

    setError(null);
    setStep(2);
  };

  const handleCreateSongRequest = async () => {
    setShowReviewPopup(false);

    try {
      // Parse recipient name to extract name and relationship
      // Create song request in database
      const songRequestPayload: SongRequestPayload = {
        requesterName: requesterName || currentUser?.name || "Anonymous",
        recipientDetails,
        occasion: occasion === "Other" ? customOccasion : occasion,
        languages,
        story,
        mood: moods.includes("Other") ? [customMood] : moods,
        userId: currentUser?.id || null,
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
        throw new Error(
          errorData?.errorMessage || "Failed to create song request"
        );
      }

      const createRequestData = await createRequestResponse.json();
      const newRequestId = createRequestData.requestId;

      // Redirect to lyrics generation page
      console.log(
        "🎵 Song request created successfully, redirecting to lyrics generation"
      );
      router.push(`/generate-lyrics/${newRequestId}`);
    } catch (error) {
      console.error("Error creating song request:", error);
      const errorMessage = `Sorry, there was an error creating your song request. ${error}`;
      setError(errorMessage);
    }
  };

  const handleSubmit = async () => {
    // Show review popup instead of submitting
    setError(null);
    setShowReviewPopup(true);
  };

  return (
    <div
      className={`min-h-screen ${
        showReviewPopup ? "bg-melodia-yellow" : "bg-melodia-cream"
      } text-melodia-teal flex flex-col font-body pt-16 pb-20`}
    >
      <div className="p-6 space-y-8 flex-grow">
        {step === 1 && (
          <div className="space-y-8">
            <header className="text-center">
              <h1 className="text-3xl font-bold font-heading text-melodia-teal">
                Create your song
              </h1>
              <p className="text-md text-melodia-teal/80 mt-1">
                Tell us a little bit about it.
              </p>
            </header>
            {/* <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="requester-name"
              >
                Your Name
              </label>
              <p className="text-sm text-melodia-teal opacity-70 mb-3">
                What should we call you?
              </p>
              <input
                id="requester-name"
                placeholder="Your name"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="form-input w-full"
              />
            </div> */}
            <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="to-for"
              >
                To / For
              </label>
              <p className="text-sm text-melodia-teal opacity-70 mb-3">
                Who is this song for? Enter their name and relationship. (e.g.,
                &quot;Sarah, my best friend&quot; OR &quot;Rohan, my
                brother&quot;)
              </p>
              <input
                id="to-for"
                placeholder="Sarah, my best friend"
                value={recipientDetails}
                onChange={(e) => setRecipientDetails(e.target.value)}
                className="form-input w-full"
              />
            </div>
            <div>
              <label className="block text-lg font-semibold text-melodia-teal mb-3">
                Occasion
              </label>
              <div className="flex flex-wrap gap-3">
                {(["Birthday", "Anniversary", "Wedding", "Other"] as const).map(
                  (o) => (
                    <button
                      key={o}
                      type="button"
                      onClick={() => setOccasion(o)}
                      className={`chip ${occasion === o ? "active" : ""}`}
                    >
                      {o}
                    </button>
                  )
                )}
              </div>
              {occasion === "Other" && (
                <div className="mt-4">
                  <input
                    placeholder="e.g., Graduation, Just because..."
                    value={customOccasion}
                    onChange={(e) => setCustomOccasion(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              )}
            </div>
            <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="language"
              >
                Language
              </label>
              <input
                id="language"
                placeholder="English"
                value={languages}
                onChange={(e) => setLanguages(e.target.value)}
                className="form-input w-full"
              />
              <p className="text-sm text-melodia-teal opacity-70 mt-2 px-1">
                Feel free to mix it up! e.g., Hindi + English, Punjabi
              </p>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-8">
            <header>
              {/* Back Button */}
              <button
                onClick={handleBack}
                className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity py-2 mb-4"
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

              {/* Title */}
              <h2 className="font-bold[!important] text-melodia-teal leading-tight mb-1">
                Add your personal touch
              </h2>

              {/* Subtitle */}
              <p className="text-sm text-gray-500 leading-relaxed">
                This step is optional, but it makes the song truly unique!
              </p>
            </header>
            <div>
              <label
                className="text-lg mb-2 block text-melodia-teal"
                htmlFor="song-story"
              >
                The Story Behind the Song{" "}
                <span className="font-normal text-gray-400 text-xs">
                  (Optional)
                </span>
              </label>
              <textarea
                id="song-story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Share a memory, an inside joke, or what makes them special."
                className="w-full min-h-32 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent text-melodia-teal placeholder:text-gray-400 transition-all duration-200 text-sm"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold font-heading mb-4 text-melodia-teal">
                The Vibe
              </h3>
              <h3 className="font-semibold text-base mb-3 text-gray-600">
                Mood
              </h3>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    "Joyful",
                    "Sentimental",
                    "Upbeat & Fun",
                    "Romantic",
                    "Other",
                  ] as const
                ).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleMood(m)}
                    className={`px-5 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${
                      moods.includes(m)
                        ? "bg-melodia-coral text-white border-[var(--accent-vibrant-coral)] shadow-lg shadow-coral-500/30"
                        : "bg-white text-melodia-teal border-gray-200 hover:bg-gray-50 hover:transform hover:-translate-y-0.5 hover:shadow-md"
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              {moods.includes("Other") && (
                <div className="mt-4">
                  <input
                    placeholder="e.g., Melancholic, Energetic, Peaceful..."
                    value={customMood}
                    onChange={(e) => setCustomMood(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {error && <div className="text-red-600 text-sm">{error}</div>}
      </div>

      <div className="p-6 sticky bottom-0 bg-white pt-4 pb-6">
        {step === 1 ? (
          <Button
            className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
            onClick={handleNext}
          >
            Next
          </Button>
        ) : (
          <Button
            className="w-full h-14 bg-melodia-yellow text-melodia-teal text-lg font-bold rounded-full shadow-lg shadow-yellow-500/30 hover:scale-105 transition-all duration-200"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Review inputs"}
          </Button>
        )}
      </div>

      {/* Review Popup Modal - Full Screen Design */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-melodia-yellow z-50 flex flex-col">
          {/* Back Button */}
          <div className="p-6 pt-16 bg-melodia-yellow flex-shrink-0">
            <button
              onClick={() => setShowReviewPopup(false)}
              className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity"
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
          <div className="flex-1 overflow-y-auto bg-melodia-yellow">
            <div className="min-h-full flex items-center justify-center p-6">
              <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center">
                {/* Sparkle Icon */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-melodia-coral rounded-full flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-melodia-teal mb-4">
                  Review & Create Your Song
                </h1>

                {/* Summary Text */}
                <p className="text-melodia-teal text-base leading-relaxed mb-8">
                  Okay{" "}
                  <span className="font-bold">
                    {requesterName || currentUser?.name || "there"}
                  </span>
                  ! We&apos;re creating a{" "}
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
                  onClick={handleCreateSongRequest}
                  className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
                >
                  Create My Lyrics
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
