"use client";

import { FormField } from "@/components/forms/FormField";

interface CreateSongRequestStep2Props {
  story: string;
  setStory: (value: string) => void;
  moods: string[];
  toggleMood: (mood: string) => void;
  customMood: string;
  setCustomMood: (value: string) => void;
  onBack: () => void;
}

export function CreateSongRequestStep2({
  story,
  setStory,
  moods,
  toggleMood,
  customMood,
  setCustomMood,
  onBack,
}: CreateSongRequestStep2Props) {
  return (
    <div className="space-y-8">
      <header>
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-text-teal hover:scale-105 transition-transform py-2 mb-4"
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
        <h2 className="font-bold text-text-teal leading-tight mb-1">
          Add your personal touch
        </h2>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 leading-relaxed">
          This step is optional, but it makes the song truly unique!
        </p>
      </header>

      <div>
        <label
          className="text-lg mb-2 block text-text-teal"
          htmlFor="song-story"
        >
          The Story Behind the Song, Tell us about the person and what kind of
          song you have in mind?
          <span className="font-normal text-gray-400 text-xs ml-2">
            (Optional)
          </span>
        </label>
        <textarea
          id="song-story"
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Share a memory, an inside joke, or what makes them special."
          className="w-full min-h-32 p-4 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary-yellow focus:border-transparent text-text-teal placeholder:text-gray-400 transition-all duration-200 text-sm"
        />
      </div>

      <div>
        <h3 className="text-lg font-bold font-heading mb-4 text-text-teal">
          The Vibe
        </h3>
        <h3 className="font-semibold text-base mb-3 text-gray-600">Mood</h3>
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
                  ? "bg-accent-coral text-white border-accent-coral shadow-lg"
                  : "bg-white text-text-teal border-gray-200 hover:bg-gray-50 hover:transform hover:-translate-y-0.5 hover:shadow-md"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {moods.includes("Other") && (
          <div className="mt-4">
            <FormField
              label="Custom Mood"
              placeholder="e.g., Melancholic, Energetic, Peaceful..."
              value={customMood}
              onChange={(e) => setCustomMood(e.target.value)}
              className="w-full h-14 px-5 bg-white border border-text-teal/20 rounded-lg placeholder-text-teal/50 focus:ring-2 focus:ring-primary-yellow focus:border-transparent font-body"
            />
          </div>
        )}
      </div>
    </div>
  );
}
