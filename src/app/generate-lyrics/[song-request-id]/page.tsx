"use client";

import { useState, useEffect } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronDown, ArrowLeft, X } from "lucide-react";
import { getSongRequestDataAction } from "@/lib/lyrics-actions";
import { DBSongRequest } from "@/types/song-request";

export default function GenerateLyricsPage({
  params,
}: {
  params: Promise<{ "song-request-id": string }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{
    "song-request-id": string;
  } | null>(null);
  const [songRequest, setSongRequest] = useState<DBSongRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lyrics generation state
  const [editedLyrics, setEditedLyrics] = useState("");
  const [generatedTitle, setGeneratedTitle] = useState("");
  const [generatedStyle, setGeneratedStyle] = useState("");
  const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
  const [isMusicStyleExpanded, setIsMusicStyleExpanded] = useState(false);

  // Existing lyrics state
  const [isLyricsApproved, setIsLyricsApproved] = useState(false);

  // Editing state
  const [isEditingLyrics, setIsEditingLyrics] = useState(false);
  const [userEditInput, setUserEditInput] = useState("");
  const [isUpdatingLyrics, setIsUpdatingLyrics] = useState(false);

  // Song creation state
  const [isCreatingSong, setIsCreatingSong] = useState(false);

  // Toast state
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Resolve params
  useEffect(() => {
    const getParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    getParams();
  }, [params]);

  // Check for existing lyrics
  const checkExistingLyrics = async (requestId: number) => {
    try {
      const response = await fetch(
        `/api/lyrics-display?requestId=${requestId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setIsLyricsApproved(data.data.lyricsDraft.status === "approved");

          // If lyrics exist, populate the form with existing lyrics
          if (data.data.lyricsDraft) {
            const lyricsText = data.data.lyricsDraft.generated_text;
            setEditedLyrics(lyricsText);
            setGeneratedTitle(`For ${data.data.songRequest.recipient_details}`);
            setGeneratedStyle("Personalized song style");
            return true; // Lyrics exist
          }
        }
      } else if (response.status === 404) {
        // No lyrics exist yet - this is expected for new requests
        console.log(
          "No existing lyrics found for request",
          requestId,
          "- this is normal for new requests"
        );
        return false; // No lyrics exist
      } else {
        // Handle other error cases
        console.error(
          "Error checking existing lyrics:",
          response.status,
          response.statusText
        );
        return false; // Error occurred
      }
    } catch (error) {
      console.error("Error checking existing lyrics:", error);
      return false; // Error occurred
    }
    return false; // Default case
  };

  const handleGenerateLyrics = useCallback(
    async (songRequest: DBSongRequest) => {
      if (!songRequest) return;

      setIsGeneratingLyrics(true);

      try {
        const response = await fetch("/api/generate-lyrics-with-storage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            recipientDetails: songRequest.recipient_details,
            languages: songRequest.languages,
            songStory: songRequest.song_story,
            mood: songRequest.mood,
            requestId: songRequest.id,
            userId: songRequest.user_id,
            anonymousUserId: songRequest.anonymous_user_id,
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
          setGeneratedTitle(
            data.title || `${songRequest.recipient_details}'s Song`
          );
          setGeneratedStyle(data.styleOfMusic || "Personalized song style");
        } else {
          console.error(
            "Failed to generate lyrics:",
            data.error || "Failed to generate lyrics. Please try again."
          );
          setEditedLyrics("");
          setGeneratedTitle("");
          setGeneratedStyle("");
        }
      } catch (error) {
        console.error("Error generating lyrics:", error);
        console.error(
          "Sorry, there was an error generating your lyrics. Please check your connection and try again."
        );
        setEditedLyrics("");
        setGeneratedTitle("");
        setGeneratedStyle("");
      } finally {
        setIsGeneratingLyrics(false);
      }
    },
    []
  );

  // Load song request data
  useEffect(() => {
    const loadSongRequestAndGenerateLyrics = async () => {
      if (!resolvedParams) return;

      try {
        const requestId = parseInt(resolvedParams["song-request-id"]);
        console.log("Loading song request for ID:", requestId);

        const songRequestFromDB = await getSongRequestDataAction(requestId);
        console.log("Raw request data:", songRequestFromDB);

        if (songRequestFromDB) {
          // Convert Date objects to strings for SongRequest type
          const songRequest: DBSongRequest = {
            ...songRequestFromDB,
            created_at: songRequestFromDB.created_at.toISOString(),
            updated_at: songRequestFromDB.updated_at.toISOString(),
          } as DBSongRequest;

          setSongRequest(songRequest);

          // Check for existing lyrics
          const lyricsExist = await checkExistingLyrics(requestId);

          // If no lyrics exist, automatically start generating them
          if (!lyricsExist) {
            console.log(
              "No existing lyrics found, starting automatic generation..."
            );
            // Set loading state for lyrics generation
            setIsGeneratingLyrics(true);

            handleGenerateLyrics(songRequest);
          }
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

    loadSongRequestAndGenerateLyrics();
  }, [resolvedParams, handleGenerateLyrics]);

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
        setGeneratedTitle(`${songRequest.recipient_details}'s Song`);
        setGeneratedStyle("Personalized song style");
        setUserEditInput("");
        setIsEditingLyrics(false);
      } else {
        console.error(
          "Failed to update lyrics:",
          data.error || "Failed to update lyrics. Please try again."
        );
      }
    } catch (error) {
      console.error("Error updating lyrics:", error);
      console.error(
        "Sorry, there was an error updating your lyrics. Please try again."
      );
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
      setIsCreatingSong(true);

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

      const approveData = await approveResponse.json();

      if (approveData.success) {
        // Redirect to payment page
        console.log(
          "🎵 Lyrics approved successfully, redirecting to payment..."
        );
        router.push(approveData.redirectTo);
      } else {
        throw new Error("Failed to approve lyrics");
      }
    } catch (error) {
      console.error("Error in approve lyrics flow:", error);
      showErrorToast(
        "Something went wrong while approving your lyrics. Please try again."
      );
    } finally {
      setIsCreatingSong(false);
    }
  };

  const showErrorToast = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
    // Auto-hide after 5 seconds
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const hideToast = () => {
    setShowToast(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-melodia-cream text-melodia-teal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-melodia-coral mx-auto mb-4"></div>
          <p className="text-melodia-teal">Loading...</p>
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
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-bold text-melodia-teal">Lyrics</h1>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl p-6">
          {/* Generated Title */}
          <h2 className="text-xl font-bold text-melodia-teal text-center mb-4">
            {generatedTitle || `For ${songRequest.recipient_details}`}
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
          ) : editedLyrics ? (
            <div className="space-y-4">
              {/* Show approval status if lyrics are approved */}
              {isLyricsApproved && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <p className="text-green-800 font-medium">
                      Lyrics Approved
                    </p>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    These lyrics have been approved and cannot be modified. You
                    can proceed to create your song.
                  </p>
                </div>
              )}

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

        {/* Edit Input Field - Show when in edit mode and lyrics are not approved */}
        {isEditingLyrics && editedLyrics && !isLyricsApproved && (
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
                disabled={isCreatingSong}
              >
                {isCreatingSong ? "Processing..." : "Approve & Pay"}
              </Button>
              {/* Only show Edit button if lyrics are not approved */}
              {!isLyricsApproved && (
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
              )}
            </>
          ) : (
            <Button
              className="w-full h-14 bg-melodia-coral text-white text-lg font-bold rounded-full shadow-lg shadow-coral-500/30 hover:bg-opacity-90 hover:scale-105 transition-all duration-200"
              onClick={() => handleGenerateLyrics(songRequest)}
            >
              Generate Lyrics
            </Button>
          )}
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
          <div className="bg-white border border-orange-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-orange-500"
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
              <div className="flex-1">
                <p className="text-sm text-gray-800 font-medium">
                  {toastMessage}
                </p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={handleApproveLyrics}
                    className="text-xs bg-melodia-coral text-white px-3 py-1 rounded-full hover:bg-opacity-90 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
              <button
                onClick={hideToast}
                className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
