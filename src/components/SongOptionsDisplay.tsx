"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  ArrowLeft,
  Home,
  Disc3,
  Music,
  User,
  Pause,
  BookOpen,
  Download,
  Share2,
} from "lucide-react";
import { MediaPlayer } from "@/components/MediaPlayer";
import { SongStatusResponse, SongVariant } from "@/lib/song-status-client";
import Image from "next/image";

interface SongOptionsDisplayProps {
  songStatus: SongStatusResponse;
  onBack: () => void;
  onBackupWithGoogle: () => void;
}

export default function SongOptionsDisplay({
  songStatus,
  onBack,
  onBackupWithGoogle,
}: SongOptionsDisplayProps) {
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [selectedVariantForLyrics, setSelectedVariantForLyrics] =
    useState<SongVariant | null>(null);
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});
  const [sharePublicly, setSharePublicly] = useState<{
    [key: string]: boolean;
  }>({});
  const [emailInput, setEmailInput] = useState<{ [key: string]: string }>({});

  // Media player state for streaming audio - per variant
  const [variantStates, setVariantStates] = useState<{
    [variantId: string]: {
      currentTime: number;
      duration: number;
      isPlaying: boolean;
      isLoading: boolean;
    };
  }>({});
  const [activeStreamingVariant, setActiveStreamingVariant] = useState<
    string | null
  >(null);

  // Helper function to get variant state
  const getVariantState = (variantId: string) => {
    return (
      variantStates[variantId] || {
        currentTime: 0,
        duration: 180, // Default 3 minutes
        isPlaying: false,
        isLoading: false,
      }
    );
  };

  // Helper function to update variant state
  const updateVariantState = (
    variantId: string,
    updates: Partial<{
      currentTime: number;
      duration: number;
      isPlaying: boolean;
      isLoading: boolean;
    }>
  ) => {
    setVariantStates((prev) => {
      const currentState = prev[variantId] || {
        currentTime: 0,
        duration: 180,
        isPlaying: false,
        isLoading: false,
      };
      return {
        ...prev,
        [variantId]: {
          ...currentState,
          ...updates,
        },
      };
    });
  };

  // Streaming audio player functions
  const handleStreamingPlayPause = (
    variantId: string,
    streamAudioUrl: string
  ) => {
    const variant = songStatus.variants?.find((v) => v.id === variantId);
    if (!variant || !streamAudioUrl) return;

    const currentVariantState = getVariantState(variantId);

    if (activeStreamingVariant === variantId && currentVariantState.isPlaying) {
      // Pause current audio
      const audio = audioElements[variantId];
      if (audio) {
        audio.pause();
        updateVariantState(variantId, { isPlaying: false });
        setActiveStreamingVariant(null);
      }
    } else {
      // Stop any currently playing streaming audio
      if (activeStreamingVariant && audioElements[activeStreamingVariant]) {
        audioElements[activeStreamingVariant].pause();
        audioElements[activeStreamingVariant].currentTime = 0;
        updateVariantState(activeStreamingVariant, { isPlaying: false });
      }

      // Start playing the selected variant
      let audio: HTMLAudioElement;
      if (!audioElements[variantId]) {
        audio = new Audio(streamAudioUrl);
        audio.preload = "metadata";
        audio.crossOrigin = "anonymous";

        // Update the audioElements state
        setAudioElements((prev) => ({ ...prev, [variantId]: audio }));

        audio.addEventListener("loadedmetadata", () => {
          updateVariantState(variantId, {
            duration: audio.duration,
            isLoading: false,
          });
        });

        audio.addEventListener("timeupdate", () => {
          updateVariantState(variantId, { currentTime: audio.currentTime });
        });

        audio.addEventListener("playing", () => {
          // Fired when audio actually starts playing
          console.log("Playing event fired for:", variantId);
          setActiveStreamingVariant(variantId);
          updateVariantState(variantId, {
            isPlaying: true,
            isLoading: false,
          });
        });

        audio.addEventListener("pause", () => {
          // Fired when audio is paused
          updateVariantState(variantId, {
            isPlaying: false,
          });
        });

        audio.addEventListener("ended", () => {
          updateVariantState(variantId, {
            isPlaying: false,
            currentTime: 0,
          });
          setActiveStreamingVariant(null);
        });

        audio.addEventListener("error", (e) => {
          console.error("Audio streaming error:", e);
          updateVariantState(variantId, {
            isLoading: false,
            isPlaying: false,
          });
          setActiveStreamingVariant(null);
        });
      } else {
        audio = audioElements[variantId];
      }

      updateVariantState(variantId, { isLoading: true });
      setActiveStreamingVariant(variantId);

      audio
        .play()
        .then(() => {
          setActiveStreamingVariant(variantId);
          updateVariantState(variantId, {
            isPlaying: true,
            isLoading: false,
          });
        })
        .catch((error) => {
          console.error("Error playing streaming audio:", error);
          updateVariantState(variantId, {
            isLoading: false,
            isPlaying: false,
          });
          setActiveStreamingVariant(null);
        });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleLyricsClick = (variant: SongVariant) => {
    setSelectedVariantForLyrics(variant);
    setShowMediaPlayer(true);
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToggle = (variantId: string) => {
    setSharePublicly((prev) => ({
      ...prev,
      [variantId]: !prev[variantId],
    }));
  };

  const handleEmailChange = (variantId: string, email: string) => {
    setEmailInput((prev) => ({
      ...prev,
      [variantId]: email,
    }));
  };

  const handleSendEmail = (variantId: string) => {
    const email = emailInput[variantId];
    if (email) {
      console.log(`Sending song link to ${email} for variant ${variantId}`);
      alert(`Song link will be sent to ${email}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Pause all audio elements
      Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      // Reset streaming player state
      setActiveStreamingVariant(null);
      setVariantStates({});
    };
  }, [audioElements]);

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-24 pb-4">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity p-2 -ml-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-large font-heading text-melodia-teal">
            Your Song Options
          </h1>
        </div>

        {/* Song Options */}
        <div className="space-y-4 px-2">
          {songStatus.variants?.map((variant, index) => {
            const variantState = getVariantState(variant.id);
            return (
              <div
                key={variant.id}
                className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Song Info */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="flex-1">
                    <p className="text-sm font-body text-neutral-500 mb-1">
                      Song Option {index + 1}
                    </p>
                    <h3 className="text-xl font-heading text-melodia-teal mb-2">
                      {variant.title}
                    </h3>
                    <p className="text-melodia-coral font-body font-medium text-sm">
                      {variant.variantStatus === "DOWNLOAD_READY"
                        ? "Ready to download"
                        : variant.variantStatus === "STREAM_READY"
                        ? "Stream ready - Download preparing..."
                        : "Generating..."}
                    </p>
                  </div>

                  {/* Album Art with Wood Frame */}
                  <div className="w-16 h-16 bg-amber-100 p-1 rounded-lg border-2 border-amber-300 flex-shrink-0">
                    <div className="w-full h-full bg-white rounded overflow-hidden">
                      <Image
                        src={variant.imageUrl}
                        alt={`${variant.title} album art`}
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to a placeholder if image fails to load
                          e.currentTarget.src = "/images/melodia-logo.png";
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Conditional UI based on variant status */}
                {variant.variantStatus === "PENDING" ? (
                  // PENDING: Show generating state
                  <div className="w-full h-12 bg-neutral-100 text-neutral-500 font-body font-semibold rounded-xl flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
                    Generating...
                  </div>
                ) : variant.variantStatus === "STREAM_READY" ||
                  variant.variantStatus === "DOWNLOAD_READY" ? (
                  // STREAM_READY or DOWNLOAD_READY: Full player with controls
                  <div className="space-y-3">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="w-full bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                          style={{
                            width: `${
                              variantState.duration > 0
                                ? (variantState.currentTime /
                                    variantState.duration) *
                                  100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-sm text-neutral-600">
                        <span>{formatTime(variantState.currentTime)}</span>
                        <span>{formatTime(variantState.duration)}</span>
                      </div>
                    </div>

                    {/* Player Controls */}
                    <div className="flex items-center justify-between">
                      {/* Play/Pause Button */}
                      <button
                        onClick={() =>
                          handleStreamingPlayPause(
                            variant.id,
                            variant.sourceStreamAudioUrl ||
                              variant.streamAudioUrl ||
                              ""
                          )
                        }
                        disabled={
                          variantState.isLoading ||
                          (!variant.sourceStreamAudioUrl &&
                            !variant.streamAudioUrl)
                        }
                        className="w-12 h-12 bg-melodia-yellow text-melodia-teal rounded-full flex items-center justify-center hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50"
                      >
                        {variantState.isLoading ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-melodia-teal border-t-transparent"></div>
                        ) : activeStreamingVariant === variant.id &&
                          variantState.isPlaying ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                      </button>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2">
                        {/* Lyrics Button */}
                        <button
                          onClick={() => handleLyricsClick(variant)}
                          className="h-10 px-4 bg-white border border-melodia-yellow text-melodia-teal font-body font-semibold rounded-full hover:bg-melodia-yellow/10 transition-colors flex items-center justify-center gap-2"
                        >
                          <BookOpen className="w-4 h-4" />
                          Lyrics
                        </button>

                        {/* Download Button - Only show when DOWNLOAD_READY */}
                        {variant.variantStatus === "DOWNLOAD_READY" &&
                          (variant.audioUrl || variant.sourceAudioUrl) && (
                            <button
                              onClick={() =>
                                handleDownload(
                                  variant.audioUrl ||
                                    variant.sourceAudioUrl ||
                                    "",
                                  variant.title
                                )
                              }
                              className="h-10 px-4 bg-melodia-coral text-white font-body font-semibold rounded-full hover:bg-melodia-coral/90 transition-colors flex items-center justify-center gap-2"
                            >
                              <Download className="w-4 h-4" />
                              Download
                            </button>
                          )}
                      </div>
                    </div>

                    {/* Sharing Section */}
                    <div className="space-y-3">
                      {/* Horizontal Divider */}
                      <div className="w-full h-px bg-neutral-200"></div>

                      {/* Share Publicly Checkbox */}
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={sharePublicly[variant.id] || false}
                            onChange={() => handleShareToggle(variant.id)}
                            className="w-4 h-4 text-melodia-coral bg-melodia-coral border-melodia-coral rounded focus:ring-melodia-coral focus:ring-2"
                          />
                          <span className="text-sm font-body text-neutral-700">
                            Share publicly
                          </span>
                        </label>
                        <Share2 className="w-4 h-4 text-neutral-400" />
                      </div>

                      {/* Email Input */}
                      <div className="space-y-2">
                        <p className="text-sm font-body text-neutral-600">
                          Get your song link via email
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Enter your email ID"
                            value={emailInput[variant.id] || ""}
                            onChange={(e) =>
                              handleEmailChange(variant.id, e.target.value)
                            }
                            className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent font-body"
                          />
                          <button
                            onClick={() => handleSendEmail(variant.id)}
                            className="px-4 py-2 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-lg hover:bg-melodia-yellow/90 transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        {/* Backup Option */}
        <div className="mt-8 px-4 text-center">
          <button
            onClick={onBackupWithGoogle}
            className="flex items-center justify-center gap-3 text-neutral-600 hover:text-neutral-800 transition-colors mx-auto py-2"
          >
            {/* Google Logo */}
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            </div>
            <span className="font-body font-medium text-melodia-teal">
              Backup song with Google
            </span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 pb-6">
        <div className="flex justify-around items-center">
          <div className="flex flex-col items-center gap-1">
            <Home className="w-6 h-6 text-melodia-teal" />
            <span className="text-xs font-body text-melodia-teal font-medium">
              Home
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Disc3 className="w-6 h-6 text-neutral-400" />
            <span className="text-xs font-body text-neutral-500">
              Best Songs
            </span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Music className="w-6 h-6 text-neutral-400" />
            <span className="text-xs font-body text-neutral-500">My Songs</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <User className="w-6 h-6 text-neutral-400" />
            <span className="text-xs font-body text-neutral-500">Profile</span>
          </div>
        </div>
      </div>

      {/* Full-screen MediaPlayer for Lyrics */}
      {showMediaPlayer && selectedVariantForLyrics && (
        <MediaPlayer
          song={{
            metadata: {
              title: selectedVariantForLyrics.title,
              suno_task_id: songStatus.variants?.[0]?.id,
            },
            song_variants: songStatus.variants,
            selected_variant: songStatus.variants?.findIndex(
              (v) => v.id === selectedVariantForLyrics.id
            ),
            suno_audio_id: selectedVariantForLyrics.id,
          }}
          onClose={() => {
            // Stop any audio that might be playing in MediaPlayer
            const mediaPlayerAudio = document.querySelector("audio");
            if (mediaPlayerAudio) {
              mediaPlayerAudio.pause();
              mediaPlayerAudio.currentTime = 0;
            }

            setShowMediaPlayer(false);
            setSelectedVariantForLyrics(null);
          }}
        />
      )}
    </div>
  );
}
