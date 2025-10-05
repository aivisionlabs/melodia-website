"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SongOptionsDisplay from "@/components/SongOptionsDisplay";
import SongCreationLoadingScreen from "@/components/SongCreationLoadingScreen";
import { useSongStatusPolling } from "@/hooks/use-song-status-polling";

export default function SongOptionsPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const router = useRouter();
  const [songId, setSongId] = useState<string>("");

  // Use the custom polling hook
  const { songStatus, isLoading, error, showLoadingScreen } =
    useSongStatusPolling(songId, {
      intervalMs: 10000,
      maxPollingTime: 10 * 60 * 1000, // 10 minutes
      autoStart: true,
      stopOnComplete: true,
      enableExponentialBackoff: true,
      maxRetries: 3,
      onStatusChange: (status) => {
        console.log("🎵 [PAGE] Song status update:", {
          status: status.status,
          hasVariants: !!status.variants,
          variantsCount: status.variants?.length || 0,
          success: status.success,
        });
      },
      onError: (error) => {
        console.error("❌ [PAGE] Song status polling error:", error);
      },
    });

  // Resolve params
  useEffect(() => {
    const getParams = async () => {
      const resolved = await params;
      setSongId(resolved.songId);
    };
    getParams();
  }, [params]);

  const handleBack = () => {
    router.back();
  };

  const handleBackupWithGoogle = () => {
    // LoginPromptCard handles navigation internally
    // This function is kept for compatibility but not used
  };

  // Loading state
  if (isLoading) {
    console.log("⏳ [PAGE] Rendering loading state");
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
  if (error || !songStatus) {
    console.log("❌ [PAGE] Rendering error state:", {
      error,
      hasSongStatus: !!songStatus,
    });
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

  // Song creation loading screen - show for PENDING status or when explicitly loading
  if (showLoadingScreen || songStatus?.status === "PENDING") {
    return (
      <SongCreationLoadingScreen
        duration={45}
        title="Crafting your song..."
        message="Our AI is turning your story into a musical masterpiece. Hang tight!"
        showTimer={true}
      />
    );
  }

  // Handle NOT_FOUND status - show error state
  if (songStatus?.status === "NOT_FOUND") {
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
            Song Not Found
          </h3>
          <p className="text-gray-600 mb-4">
            The song you&apos;re looking for doesn&apos;t exist or has been
            removed.
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

  // No variants available - show this for non-PENDING statuses without variants
  if (!songStatus.variants || songStatus.variants.length === 0) {
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

  return <SongOptionsDisplay songStatus={songStatus!} onBack={handleBack} />;
}
