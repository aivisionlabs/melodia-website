"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { getSongRequestDataAction } from "@/lib/lyrics-actions";

interface SongRequest {
  id: number;
  requester_name: string;
  recipient_name: string;
  recipient_relationship: string;
  languages: string[];
  song_story: string;
  status: string;
  // lyrics_status moved to lyrics_drafts table
  created_at: string;
  updated_at: string;
  user_id: number | null;
  anonymous_user_id: string | null;
}

export default function GenerateLyricsPage({
  params,
}: {
  params: Promise<{ "song-request-id": string }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    "song-request-id": string;
  } | null>(null);
  const [songRequest, setSongRequest] = useState<SongRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lyrics generation state
  const [editedLyrics, setEditedLyrics] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedStyle, setGeneratedStyle] = useState("");
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [lyricsError, setLyricsError] = useState("");
  const [isMusicStyleExpanded, setIsMusicStyleExpanded] = useState(false);

  // Editing state
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [userEditInput, setUserEditInput] = useState("");
  const [isUpdatingLyrics, setIsUpdatingLyrics] = useState(false);

  // Resolve params
  useEffect(() => {
    const getParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    getParams();
  }, [params]);

  // Load song request data
  useEffect(() => {
    const loadSongRequest = async () => {
      if (!resolvedParams) return;

      try {
        const requestId = parseInt(resolvedParams["song-request-id"]);
        console.log("Loading song request for ID:", requestId);

        const request = await getSongRequestDataAction(requestId);
        console.log("Raw request data:", request);

        if (request) {
          // Convert Date objects to strings for SongRequest type
          const songRequest: SongRequest = {
            ...request,
            status: request.status as
              | "pending"
              | "processing"
              | "completed"
              | "failed",
            // lyrics_status moved to lyrics_drafts table
            created_at: request.created_at.toISOString(),
            updated_at: request.updated_at.toISOString(),
          } as SongRequest;
          setSongRequest(songRequest);
        } else {
          setError("Song request not found");
        }
      } catch (error) {
        console.error("Error loading song request:", error);
        setError("Failed to load song request");
      } finally {
        setLoading(false);
      }
    };

    loadSongRequest();
  }, [resolvedParams]);

  const handleGenerateLyrics = async () => {
    if (!songRequest) return;

    setIsGeneratingLyrics(true);
    setLyricsError("");

    try {
      const response = await fetch("/api/generate-lyrics-with-storage", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient_name: songRequest.recipient_name,
          languages: songRequest.languages,
          song_story: songRequest.song_story,
          requestId: songRequest.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to generate lyrics");
      }

      const data = await response.json();
      console.log("API Response:", data);

      if (data.success && data.lyrics) {
        console.log(
          "🎵 Lyrics generated successfully, title:",
          data.title,
          "style:",
          data.styleOfMusic
        );
        setEditedLyrics(data.lyrics);
        setGeneratedTitle(data.title || `${songRequest.recipient_name}'s Song`);
        setGeneratedStyle(data.styleOfMusic || "Personalized song style");
        setLyricsError("");
      } else {
        const errorMessage =
          data.error || "Failed to generate lyrics. Please try again.";
        setLyricsError(errorMessage);
        setEditedLyrics("");
        setGeneratedTitle("");
        setGeneratedStyle("");
      }
    } catch (error) {
      console.error("Error generating lyrics:", error);
      const errorMessage =
        "Sorry, there was an error generating your lyrics. Please check your connection and try again.";
      setLyricsError(errorMessage);
      setEditedLyrics("");
      setGeneratedTitle("");
      setGeneratedStyle("");
    } finally {
      setIsGeneratingLyrics(false);
    }
  };

  const handleUpdateLyrics = async () => {
    if (!userEditInput.trim()) {
      alert("Please enter your changes in the text field below.");
      return;
    }

    if (!songRequest) {
      alert("No song request found. Please try again.");
      return;
    }

    setIsUpdatingLyrics(true);
    setLyricsError("");

    try {
      const response = await fetch("/api/refine-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          requestId: songRequest.id,
          refineText: userEditInput.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        throw new Error(errorData.message || "Failed to update lyrics");
      }

      const data = await response.json();
      console.log("Updated lyrics response:", data);

      if (data.success && data.draft) {
        console.log("Successfully updated lyrics:", data.draft.generated_text);
        setEditedLyrics(data.draft.generated_text);
        setGeneratedTitle(`${songRequest.recipient_name}'s Song`);
        setGeneratedStyle("Personalized song style");
        setUserEditInput("");
        setIsEditingLyrics(false);
        setLyricsError("");
      } else {
        const errorMessage =
          data.error || "Failed to update lyrics. Please try again.";
        console.error("Failed to update lyrics:", errorMessage);
        setLyricsError(errorMessage);
      }
    } catch (error) {
      console.error("Error updating lyrics:", error);
      const errorMessage =
        "Sorry, there was an error updating your lyrics. Please try again.";
      setLyricsError(errorMessage);
    } finally {
      setIsUpdatingLyrics(false);
    }
  };

  const handleApproveLyrics = async () => {
    if (!songRequest || !editedLyrics) {
      alert(
        "No song request or lyrics found. Please try generating lyrics again."
      );
      return;
    }

    try {
      // Step 1: Fetch lyrics draft
      console.log("🎵 Fetching lyrics draft for requestId:", songRequest.id);
      const drafts = await fetch(
        `/api/lyrics-display?requestId=${songRequest.id}`
      );

      if (!drafts.ok) {
        throw new Error(
          `Failed to fetch lyrics draft: ${drafts.status} ${drafts.statusText}`
        );
      }

      const draftsData = await drafts.json();
      console.log("🎵 Lyrics draft response:", draftsData);

      if (
        !draftsData.success ||
        !draftsData.data ||
        !draftsData.data.lyricsDraft
      ) {
        throw new Error(
          "No lyrics draft found. Please try generating lyrics again."
        );
      }

      // Step 2: Approve the current draft
      const approveResponse = await fetch("/api/approve-lyrics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          draftId: draftsData.data.lyricsDraft.id,
          requestId: songRequest.id,
        }),
      });

      if (!approveResponse.ok) {
        const errorData = await approveResponse.json().catch(() => ({}));
        throw new Error(
          errorData.message ||
            `Failed to approve lyrics: ${approveResponse.status}`
        );
      }

      // Success! Redirect to song creation page
      console.log("🎵 Lyrics approved successfully");
      router.push(`/create-song-from-lyrics/${songRequest.id}`);
    } catch (error) {
      console.error("Error approving lyrics:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while approving lyrics. Please try again.";
      setLyricsError(errorMessage);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-melodia-cream text-melodia-teal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-melodia-coral mx-auto mb-4"></div>
          <p className="text-melodia-teal">Loading song request...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !songRequest) {
    return (
      <div className="min-h-screen bg-melodia-cream text-melodia-teal flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">
            {error || "Song Request Not Found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {error ||
              "The song request you're looking for doesn't exist or has been removed."}
          </p>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-melodia-coral text-white rounded-full hover:bg-opacity-90 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Main lyrics generation interface
  return (
    <div className="min-h-screen bg-melodia-yellow text-melodia-teal flex flex-col font-body pt-16 pb-20">
      <div className="p-6 space-y-8 flex-grow">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity p-2"
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
          <h1 className="text-2xl font-bold text-melodia-teal">
            Generate Lyrics
          </h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6">
          {/* Generated Title */}
          <h2 className="text-xl font-bold text-melodia-teal text-center mb-4">
            {generatedTitle || `For ${songRequest.recipient_name}`}
          </h2>

          {/* Music Style Dropdown */}
          {generatedStyle && (
            <div
              className="flex items-center justify-between py-3 border-b border-gray-200 mb-4 cursor-pointer"
              onClick={() => setIsMusicStyleExpanded(!isMusicStyleExpanded)}
            >
              <span className="text-melodia-teal font-medium">Music Style</span>
              <ChevronDown
                className={`w-5 h-5 text-gray-400 transition-transform ${
                  isMusicStyleExpanded ? "rotate-180" : ""
                }`}
              />
            </div>
          )}

          {/* Music Style Content */}
          {isMusicStyleExpanded && generatedStyle && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">{generatedStyle}</p>
            </div>
          )}

          {/* Lyrics Content */}
          {isGeneratingLyrics || isUpdatingLyrics ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-melodia-coral mx-auto mb-4"></div>
              <p className="text-melodia-teal">
                {isGeneratingLyrics
                  ? "Generating your lyrics..."
                  : "Updating your lyrics..."}
              </p>
            </div>
          ) : lyricsError ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Generation Failed
              </h3>
              <p className="text-gray-600 mb-4">{lyricsError}</p>
              <button
                onClick={() => {
                  setLyricsError("");
                  handleGenerateLyrics();
                }}
                className="px-6 py-2 bg-melodia-coral text-white rounded-full hover:bg-opacity-90 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : editedLyrics ? (
            <div className="space-y-4">
              <div className="bg-blue-100 p-2 rounded mb-2">
                <p className="text-sm text-blue-800">
                  📝 Lyrics loaded! Click Edit button below to modify.
                </p>
              </div>
              {editedLyrics.split("\n").map((line, index) => {
                if (line.startsWith("[") && line.endsWith("]")) {
                  return (
                    <div
                      key={index}
                      className="font-semibold text-melodia-teal mt-6 mb-2"
                    >
                      {line}
                    </div>
                  );
                }
                return (
                  <p key={index} className="text-gray-600 leading-relaxed">
                    {line}
                  </p>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
              </div>
              <p className="text-gray-500">No lyrics generated yet</p>
            </div>
          )}
        </div>

        {/* Edit Input Field - Show when in edit mode */}
        {isEditingLyrics && editedLyrics && (
          <div className="mt-6">
            <div className="bg-white rounded-3xl p-6">
              <label className="block text-lg font-semibold text-melodia-teal mb-3">
                What changes would you like to make?
              </label>
              <textarea
                value={userEditInput}
                onChange={(e) => setUserEditInput(e.target.value)}
                className="w-full h-32 p-4 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-melodia-coral focus:border-transparent"
                placeholder="Type your changes here... (e.g., 'Make it more romantic', 'Add more Hindi lyrics', 'Change the chorus')"
              />
              <p className="text-sm text-gray-500 mt-3">
                Your input will be added to the existing details and new lyrics
                will be generated.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      {!isGeneratingLyrics && !isUpdatingLyrics && (
        <div className="p-6 sticky bottom-0 bg-white pt-4 pb-6">
          {isEditingLyrics ? (
            <>
              <Button
                className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200 mb-3"
                onClick={handleUpdateLyrics}
                disabled={isUpdatingLyrics}
              >
                {isUpdatingLyrics ? "Updating Lyrics..." : "Submit Changes"}
              </Button>
              <button
                className="w-full text-melodia-teal font-semibold text-center py-2"
                onClick={() => {
                  setIsEditingLyrics(false);
                  setUserEditInput("");
                }}
              >
                Cancel
              </button>
            </>
          ) : editedLyrics ? (
            <>
              <Button
                className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200 mb-3"
                onClick={handleApproveLyrics}
              >
                Approve Lyrics
              </Button>
              <button
                className="w-full text-melodia-teal font-semibold text-center py-2"
                onClick={() => {
                  console.log(
                    "Edit clicked - current editedLyrics:",
                    editedLyrics
                  );
                  console.log("Setting isEditingLyrics to true");
                  setIsEditingLyrics(true);
                }}
              >
                Edit
              </button>
            </>
          ) : (
            <Button
              className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
              onClick={handleGenerateLyrics}
            >
              Generate Lyrics
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
