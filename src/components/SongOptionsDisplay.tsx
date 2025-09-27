"use client";

import React, { useState, useEffect, useRef } from "react";
import { Play, ArrowLeft, Home, Disc3, Music, User } from "lucide-react";
import { MediaPlayer } from "@/components/MediaPlayer";
import Image from "next/image";

interface SongVariant {
  id: string;
  title: string;
  audioUrl: string;
  streamAudioUrl?: string;
  imageUrl: string;
  duration: number;
  downloadStatus: string;
  isLoading?: boolean; // New property to track loading state
}

interface SongOptionsDisplayProps {
  variants: SongVariant[];
  onBack: () => void;
  onSelectVariant: (variantId: string) => void;
  onBackupWithGoogle: () => void;
  songData?: {
    suno_task_id?: string;
    title: string;
    artist?: string;
    songId?: number; // Add song ID for updating add_to_library
  };
}

export default function SongOptionsDisplay({
  variants,
  onBack,
  onBackupWithGoogle,
  songData,
}: SongOptionsDisplayProps) {
  const [playingVariant, setPlayingVariant] = useState<string | null>(null);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [selectedVariantForLyrics, setSelectedVariantForLyrics] =
    useState<SongVariant | null>(null);
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPreview = (variantId: string, audioUrl: string) => {
    // Don't play if no audio URL (still loading)
    if (!audioUrl || audioUrl === "") {
      console.log("Audio not ready yet");
      return;
    }

    // If clicking the same song that's playing, pause it
    if (playingVariant === variantId) {
      const audio = audioElements[variantId];
      if (audio) {
        audio.pause();
        setPlayingVariant(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
      return;
    }

    // Stop any currently playing audio and reset their currentTime
    Object.entries(audioElements).forEach(([, audio]) => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Clear any existing progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }

    let audio: HTMLAudioElement;

    // Create new audio element if it doesn't exist
    if (!audioElements[variantId]) {
      audio = new Audio(audioUrl);
      audio.preload = "metadata";

      // Update the audioElements state immediately
      setAudioElements((prev) => ({ ...prev, [variantId]: audio }));

      audio.addEventListener("ended", () => {
        setPlayingVariant(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });

      audio.addEventListener("error", (e) => {
        console.error("Audio loading error:", e);
        setPlayingVariant(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });
    } else {
      audio = audioElements[variantId];
    }

    // Set playing state BEFORE starting playback
    setPlayingVariant(variantId);

    // Reset to beginning and play
    audio.currentTime = 0;

    audio
      .play()
      .then(() => {
        // Start progress tracking only after successful play
        progressIntervalRef.current = setInterval(() => {
          // Progress tracking removed for simplified design
        }, 100);
      })
      .catch((error) => {
        console.error("Error playing audio:", error);
        setPlayingVariant(null);
      });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Pause all audio elements
      Object.values(audioElements).forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
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
          {variants.map((variant, index) => (
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
                    Download in 2 minutes
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

              {/* Play Preview Button */}
              <button
                onClick={() => handlePlayPreview(variant.id, variant.audioUrl)}
                disabled={!variant.audioUrl || variant.audioUrl === ""}
                className="w-full h-12 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-xl hover:bg-melodia-yellow/90 transition-colors flex items-center justify-center gap-2 disabled:bg-neutral-100 disabled:text-neutral-500 disabled:cursor-not-allowed"
              >
                <Play className="w-5 h-5" />
                Play 15s Preview
              </button>
            </div>
          ))}
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
      {showMediaPlayer && selectedVariantForLyrics && songData && (
        <MediaPlayer
          song={{
            title: songData.title,
            artist: songData.artist || "Melodia",
            audioUrl: selectedVariantForLyrics.audioUrl,
            song_url:
              selectedVariantForLyrics.streamAudioUrl ||
              selectedVariantForLyrics.audioUrl,
            suno_task_id: songData.suno_task_id,
            suno_audio_id: selectedVariantForLyrics.id,
            selected_variant: variants.findIndex(
              (v) => v.id === selectedVariantForLyrics.id
            ),
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
