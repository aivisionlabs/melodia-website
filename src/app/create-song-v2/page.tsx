"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Step = 1 | 2;

export default function CreateSongV2Page() {
  const router = useRouter();

  const [step, setStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [recipientName, setRecipientName] = useState("");
  const [occasion, setOccasion] = useState<string>("Birthday");
  const [customOccasion, setCustomOccasion] = useState("");
  const [languages, setLanguages] = useState<string>("English");
  const [story, setStory] = useState("");
  const [moods, setMoods] = useState<string[]>(["Sentimental"]);
  const [customMood, setCustomMood] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const done = localStorage.getItem("onboarding_complete");
      if (done !== "true") router.replace("/onboarding");
    }
  }, [router]);

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

  const handleNext = () => {
    if (!recipientName.trim()) {
      setError("Please enter who this song is for.");
      return;
    }
    setError(null);
    setStep(2);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!recipientName.trim() || !languages.trim()) {
      setError("Please fill in the required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const anonymousId =
        typeof window !== "undefined"
          ? localStorage.getItem("anonymous_user_id") || undefined
          : undefined;

      // 1) Create song request
      const createRes = await fetch("/api/create-song-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_name: user?.name || "Anonymous",
          email: user?.email || null,
          recipient_name: recipientName,
          recipient_relationship:
            occasion === "Other" ? customOccasion || "friend" : occasion,
          languages: languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          additional_details:
            moods.includes("Other") && customMood.trim()
              ? `${story}${story ? " | " : ""}Mood: ${customMood}`
              : story,
          delivery_preference: "email",
          user_id: user?.id || null,
          anonymous_user_id: anonymousId,
        }),
      });
      if (!createRes.ok) throw new Error("Failed to create song request");
      const createData = await createRes.json();
      const requestId = createData.requestId;

      // 2) Generate lyrics (payment gating handled in API)
      const lyricsRes = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient_name: recipientName,
          languages: languages
            .split(",")
            .map((l) => l.trim())
            .filter(Boolean),
          additional_details:
            moods.includes("Other") && customMood.trim()
              ? `${story}${story ? " | " : ""}Mood: ${customMood}`
              : story,
          requestId,
          userId: user?.id,
        }),
      });

      if (lyricsRes.status === 402) {
        router.replace("/"); // Home shows payment required modal
        return;
      }
      if (!lyricsRes.ok) throw new Error("Failed to generate lyrics");

      // 3) Redirect to lyrics display
      router.replace(`/lyrics-display?requestId=${requestId}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-melodia-cream text-melodia-teal flex flex-col font-body pt-16 pb-20">
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
            <div>
              <label
                className="block text-lg font-semibold text-melodia-teal mb-2"
                htmlFor="to-for"
              >
                To / For
              </label>
              <p className="text-sm text-melodia-teal opacity-70 mb-3">
                Who is this song for?
              </p>
              <input
                id="to-for"
                placeholder="My best friend, Rohan"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
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
            <header className="text-center">
              <h1 className="text-3xl font-bold font-heading text-melodia-teal">
                Add your personal touch
              </h1>
              <p className="text-base text-gray-500">
                This step is optional, but it makes the song truly unique!
              </p>
            </header>
            <div>
              <label
                className="text-xl font-bold font-heading mb-2 block text-melodia-teal"
                htmlFor="song-story"
              >
                The Story Behind the Song{" "}
                <span className="font-normal text-gray-400 text-sm">
                  (Optional)
                </span>
              </label>
              <textarea
                id="song-story"
                value={story}
                onChange={(e) => setStory(e.target.value)}
                placeholder="Share a memory, an inside joke, or what makes them special."
                className="w-full min-h-40 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent text-melodia-teal placeholder:text-gray-400 transition-all duration-200"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold font-heading mb-4 text-melodia-teal">
                The Vibe
              </h2>
              <h3 className="font-semibold text-lg mb-3 text-gray-600">Mood</h3>
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
            {isSubmitting ? "Creating..." : "Create My Song"}
          </Button>
        )}
      </div>
    </div>
  );
}
