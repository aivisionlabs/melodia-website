"use client";

import { SunoVariant } from "@/lib/suno-api";
import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import DeleteSongButton from "@/components/DeleteSongButton";
import {
  getSongByTaskIdAction,
  updateSongWithVariantsAction,
  getSunoRecordInfoAction,
} from "@/lib/actions";
import { Download, Check } from "lucide-react";

interface GenerateProgressPageProps {
  params: Promise<{
    taskId: string;
  }>;
}

export default function GenerateProgressPage({
  params,
}: GenerateProgressPageProps) {
  const { taskId } = use(params);
  const router = useRouter();
  const [status, setStatus] = useState<string>("PENDING");
  const [variants, setVariants] = useState<SunoVariant[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [lyrics, setLyrics] = useState<string>("");
  const [songInfo, setSongInfo] = useState<{
    id: number;
    title: string;
    slug: string;
  } | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [addToLibrary, setAddToLibrary] = useState(true);

  useEffect(() => {
    let songInfoInterval: NodeJS.Timeout | null = null;

    const loadSongInfo = async () => {
      try {
        const result = await getSongByTaskIdAction(taskId);
        if (result.success && result.song) {
          setSongInfo({
            id: result.song.id,
            title: result.song.title,
            slug: result.song.slug,
          });
          // Set lyrics from the song record immediately
          if (result.song.lyrics) {
            setLyrics(result.song.lyrics);
          }

          // Stop polling once we successfully get song info
          if (songInfoInterval) {
            clearInterval(songInfoInterval);
            songInfoInterval = null;
          }
        } else {
          console.warn("Song not found by taskId, will retry:", taskId);
          // Song might not be ready yet, will retry in the next poll
        }
      } catch (error) {
        console.error("Error loading song info:", error);
      }
    };

    // Try to load song info immediately
    loadSongInfo();

    // Set up retry interval for song info (in case of race condition)
    songInfoInterval = setInterval(loadSongInfo, 5000); // Retry every 5 seconds

    return () => {
      if (songInfoInterval) {
        clearInterval(songInfoInterval);
      }
    };
  }, [taskId]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      try {
        // Use server action to get Suno status (ensures correct API mode)
        const response = await getSunoRecordInfoAction(taskId);

        if (response.code === 200) {
          const currentStatus = response.data?.status;
          const currentVariants = response.data?.response?.sunoData;

          setStatus(currentStatus);
          setVariants(currentVariants);

          // Update progress based on status
          switch (currentStatus) {
            case "PENDING":
              setProgress(10);
              break;
            case "TEXT_SUCCESS":
              setProgress(30);
              break;
            case "FIRST_SUCCESS":
              setProgress(60);
              break;
            case "SUCCESS":
              setProgress(100);
              // Stop polling when status becomes SUCCESS
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
              return;
            case "CREATE_TASK_FAILED":
            case "GENERATE_AUDIO_FAILED":
            case "CALLBACK_EXCEPTION":
            case "SENSITIVE_WORD_ERROR":
              setError(`Generation failed: ${currentStatus}`);
              setProgress(0);
              // Stop polling on error states
              if (interval) {
                clearInterval(interval);
                interval = null;
              }
              return;
          }

          // Set lyrics from the first variant if available
          if (currentVariants.length > 0 && currentVariants[0].prompt) {
            setLyrics(currentVariants[0].prompt);
          }
        } else {
          console.warn("Suno API returned error:", response.msg);
          // Don't set error for non-200 responses during polling, just log
        }
      } catch (err) {
        console.error("Error polling status:", err);
        // Don't set error during polling, just log
      }
    };

    // Poll immediately
    pollStatus();

    // Set up polling interval
    interval = setInterval(pollStatus, 20000); // Poll every 20 seconds

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [taskId]);

  const getStatusMessage = () => {
    switch (status) {
      case "PENDING":
        return "Initializing song generation...";
      case "TEXT_SUCCESS":
        return "Lyrics processed successfully, generating music...";
      case "FIRST_SUCCESS":
        return "First variant ready, generating second variant...";
      case "SUCCESS":
        return "Both variants generated successfully! Select your preferred variant below.";
      default:
        return "Processing...";
    }
  };

  const handleVariantSelect = (variantIndex: number) => {
    setSelectedVariant(variantIndex);
  };

  const handleDownload = async (variant: SunoVariant, variantIndex: number) => {
    try {
      const link = document.createElement("a");
      link.href = variant.audioUrl;
      link.download = `${variant.title}_variant_${variantIndex + 1}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Error downloading audio:", err);
    }
  };

  const handleSaveSelection = async () => {
    if (selectedVariant === null || !songInfo) {
      setError("Please select a variant first");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const result = await updateSongWithVariantsAction(
        songInfo.id,
        variants,
        selectedVariant,
        addToLibrary
      );

      if (result.success) {
        if (
          "timestampedLyricsGenerated" in result &&
          result.timestampedLyricsGenerated
        ) {
          console.log("Song saved with synchronized lyrics!");
        } else if ("lyricsError" in result && result.lyricsError) {
          console.warn(
            "Song saved but lyrics generation failed:",
            result.lyricsError
          );
          // Still redirect even if lyrics generation fails
        }

        // Redirect to the song page or dashboard
        router.push(`/library/${songInfo.slug}`);
      } else {
        setError(result.error || "Failed to save selection");
      }
    } catch (err) {
      console.error("Error saving selection:", err);
      setError("Failed to save selection");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Song Generation in Progress
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              It will take 30-40 seconds to start song generation
            </p>
          </div>

          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Generation Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Progress
                  </span>
                  <span className="text-sm font-medium text-gray-700">
                    {progress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-yellow-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {getStatusMessage()}
                </p>
              </div>

              {/* Variants Status */}
              {variants.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Generated Variants
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {variants.map((variant, index) => (
                      <div
                        key={variant.id}
                        className={`border-2 rounded-lg p-4 transition-all duration-200 ${
                          selectedVariant === index
                            ? "border-yellow-500 bg-yellow-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900">
                            Variant {index + 1}
                          </h4>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Ready
                            </span>
                            {selectedVariant === index && (
                              <Check className="h-4 w-4 text-yellow-600" />
                            )}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Duration: {Math.round(Number(variant.duration) || 0)}s
                        </p>
                        {variant.streamAudioUrl && (
                          <audio controls className="w-full mb-3">
                            <source
                              src={variant.streamAudioUrl}
                              type="audio/mpeg"
                            />
                            Your browser does not support the audio element.
                          </audio>
                        )}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleVariantSelect(index)}
                            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              selectedVariant === index
                                ? "bg-yellow-600 text-white"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            {selectedVariant === index ? "Selected" : "Select"}
                          </button>
                          <button
                            onClick={() => handleDownload(variant, index)}
                            className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
                            title="Download audio file"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Original Lyrics Display */}
              {lyrics && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Original Lyrics (Preview)
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                      {lyrics}
                    </pre>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Note: These are the original lyrics you entered.
                    Synchronized lyrics will be generated when you save your
                    selection.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Add to Library Checkbox - Only show when variants are ready */}
          {status === "SUCCESS" && variants.length >= 2 && (
            <div className="flex items-center justify-center mb-6">
              <input
                type="checkbox"
                id="addToLibrary"
                checked={addToLibrary}
                onChange={(e) => setAddToLibrary(e.target.checked)}
                className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label
                htmlFor="addToLibrary"
                className="ml-2 block text-sm text-gray-700"
              >
                Add to Library
              </label>
            </div>
          )}
          {status === "SUCCESS" && variants.length >= 2 && (
            <p className="text-center text-sm text-gray-500 mb-6">
              When checked, this song will be visible in the public library.
              Uncheck to keep it private.
            </p>
          )}

          {/* Action Buttons */}
          <div className="mt-8 text-center space-x-4">
            {status === "SUCCESS" && variants.length >= 2 && (
              <button
                onClick={handleSaveSelection}
                disabled={selectedVariant === null || isSaving}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedVariant === null || isSaving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                {isSaving ? "Saving & Generating Lyrics..." : "Save Selection"}
              </button>
            )}
            <button
              onClick={() => router.push("/song-admin-portal")}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md text-sm font-medium"
            >
              Back to Dashboard
            </button>
            {songInfo && (
              <DeleteSongButton
                songId={songInfo.id}
                songTitle={songInfo.title}
                variant="icon"
                onDelete={() => router.push("/song-admin-portal")}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
