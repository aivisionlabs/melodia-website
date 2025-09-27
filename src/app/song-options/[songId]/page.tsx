"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SongOptionsDisplay from "@/components/SongOptionsDisplay";

interface SongVariant {
  id: string;
  title: string;
  audioUrl: string;
  streamAudioUrl?: string;
  imageUrl: string;
  duration: number;
  downloadStatus: string;
  isLoading?: boolean;
}

interface SongData {
  id: number;
  title: string;
  artist?: string;
  suno_task_id?: string;
  status: string;
  variants?: SongVariant[];
}

export default function SongOptionsPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const router = useRouter();
  const [songId, setSongId] = useState<string>("");
  const [songData, setSongData] = useState<SongData | null>(null);
  const [variants, setVariants] = useState<SongVariant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve params
  useEffect(() => {
    const getParams = async () => {
      const resolved = await params;
      setSongId(resolved.songId);
    };
    getParams();
  }, [params]);

  // Load song data and variants
  useEffect(() => {
    const loadSongData = async () => {
      if (!songId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch song data and variants
        const response = await fetch(`/api/song-variants/${songId}`);

        if (!response.ok) {
          throw new Error(`Failed to load song data: ${response.status}`);
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || "Failed to load song data");
        }

        const song = data.song;
        const songVariants = data.variants || [];

        // Transform variants to match SongOptionsDisplay interface
        const transformedVariants: SongVariant[] = songVariants.map(
          (variant: any, index: number) => ({
            id: variant.id || `variant-${index}`,
            title: variant.title || `${song.title} - Variant ${index + 1}`,
            audioUrl: variant.audioUrl || variant.streamAudioUrl || "",
            streamAudioUrl: variant.streamAudioUrl,
            imageUrl: variant.imageUrl || "/images/melodia-logo.png",
            duration: variant.duration || 180,
            downloadStatus: variant.audioUrl ? "ready" : "generating",
            isLoading: !variant.audioUrl,
          })
        );

        setSongData({
          id: song.id,
          title: song.title,
          artist: song.artist || "Melodia",
          suno_task_id: song.suno_task_id,
          status: song.status,
        });

        setVariants(transformedVariants);
      } catch (err) {
        console.error("Error loading song data:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load song data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadSongData();
  }, [songId]);

  const handleBack = () => {
    router.back();
  };

  const handleSelectVariant = async (variantId: string) => {
    try {
      const variantIndex = variants.findIndex((v) => v.id === variantId);

      const response = await fetch(`/api/song-variants/${songId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variantIndex,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to select variant");
      }

      const data = await response.json();

      if (data.success) {
        // Redirect to home page after selection
        router.push("/");
      } else {
        throw new Error(data.message || "Failed to select variant");
      }
    } catch (err) {
      console.error("Error selecting variant:", err);
      alert("Failed to select variant. Please try again.");
    }
  };

  const handleBackupWithGoogle = () => {
    // TODO: Implement Google backup functionality
    console.log("Backup with Google clicked");
    alert("Google backup feature coming soon!");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white text-melodia-teal flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-melodia-coral mx-auto mb-4"></div>
          <p className="text-melodia-teal">Loading song options...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !songData) {
    return (
      <div className="min-h-screen bg-white text-melodia-teal flex items-center justify-center">
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
            {error || "Song Not Found"}
          </h3>
          <p className="text-gray-600 mb-4">
            {error ||
              "The song you're looking for doesn't exist or has been removed."}
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

  // No variants available
  if (variants.length === 0) {
    return (
      <div className="min-h-screen bg-white text-melodia-teal flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-yellow-600 mb-2">
            Song Still Generating
          </h3>
          <p className="text-gray-600 mb-4">
            Your song is still being generated. Please check back in a few
            minutes.
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

  return (
    <SongOptionsDisplay
      variants={variants}
      onBack={handleBack}
      onSelectVariant={handleSelectVariant}
      onBackupWithGoogle={handleBackupWithGoogle}
      songData={{
        suno_task_id: songData.suno_task_id,
        title: songData.title,
        artist: songData.artist,
        songId: songData.id,
      }}
    />
  );
}
