"use client";

import { FormField } from "@/components/forms/FormField";

interface CreateSongRequestStep1Props {
  recipientDetails: string;
  setRecipientDetails: (value: string) => void;
  occasion: string;
  setOccasion: (value: string) => void;
  customOccasion: string;
  setCustomOccasion: (value: string) => void;
  languages: string;
  setLanguages: (value: string) => void;
}

export function CreateSongRequestStep1({
  recipientDetails,
  setRecipientDetails,
  occasion,
  setOccasion,
  customOccasion,
  setCustomOccasion,
  languages,
  setLanguages,
}: CreateSongRequestStep1Props) {
  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-3xl font-bold font-heading text-text-teal">
          Create your song
        </h1>
        <p className="text-md text-text-teal/80 mt-1">
          Tell us a little bit about it.
        </p>
      </header>

      <div>
        <FormField
          id="to-for"
          label="To / For"
          placeholder="Sarah, my best friend"
          value={recipientDetails}
          onChange={(e) => setRecipientDetails(e.target.value)}
          className="w-full h-14 px-5 bg-white border border-text-teal/20 rounded-lg placeholder-text-teal/50 focus:ring-2 focus:ring-primary-yellow focus:border-transparent font-body"
          helperText='Who is this song for? Enter their name and relationship. (e.g.,
            "Sarah, my best friend" OR "Rohan, my
            brother")'
        />
      </div>

      <div>
        <label className="block text-lg font-semibold text-text-teal mb-3">
          Occasion
        </label>
        <div className="flex flex-wrap gap-3">
          {(["Birthday", "Anniversary", "Wedding", "Other"] as const).map(
            (o) => (
              <button
                key={o}
                type="button"
                onClick={() => setOccasion(o)}
                className={`px-5 h-10 rounded-full border-2 transition-all duration-200 font-semibold text-sm ${
                  occasion === o
                    ? "bg-accent-coral text-white border-accent-coral shadow-lg"
                    : "bg-white text-text-teal border-gray-300 hover:border-accent-coral"
                }`}
              >
                {o}
              </button>
            )
          )}
        </div>
        {occasion === "Other" && (
          <div className="mt-4">
            <FormField
              label="Custom Occasion"
              placeholder="e.g., Graduation, Just because..."
              value={customOccasion}
              onChange={(e) => setCustomOccasion(e.target.value)}
              className="w-full h-14 px-5 bg-white border border-text-teal/20 rounded-lg placeholder-text-teal/50 focus:ring-2 focus:ring-primary-yellow focus:border-transparent font-body"
            />
          </div>
        )}
      </div>

      <div>
        <FormField
          id="language"
          label="Language"
          placeholder="English"
          value={languages}
          onChange={(e) => setLanguages(e.target.value)}
          className="w-full h-14 px-5 bg-white border border-text-teal/20 rounded-lg placeholder-text-teal/50 focus:ring-2 focus:ring-primary-yellow focus:border-transparent font-body"
          helperText="Feel free to mix it up! e.g., Hindi + English, Punjabi"
        />
      </div>
    </div>
  );
}
