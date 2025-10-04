"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import LyricalSongPlayer from "@/components/LyricalSongPlayer";
import { LyricLine } from "@/types";
import { Loader2 } from "lucide-react";

interface SongLyricsData {
  id: number;
  slug: string;
  title: string;
  lyrics: LyricLine[];
  audioUrl: string | null;
  imageUrl: string | null;
  selectedVariant: number;
  isPublic: boolean;
  canDownload: boolean;
  status: string;
}

export default function SongLyricsPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const searchParams = useSearchParams();

  const [songData, setSongData] = useState<SongLyricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get user identification from URL parameters
        const userId = searchParams.get("userId");
        const anonymousUserId = searchParams.get("anonymousUserId");

        // Build the API URL with user parameters
        const apiUrl = new URL(
          `/api/song/${slug}/lyrics`,
          window.location.origin
        );
        if (userId) apiUrl.searchParams.set("userId", userId);
        if (anonymousUserId)
          apiUrl.searchParams.set("anonymousUserId", anonymousUserId);

        const response = await fetch(apiUrl.toString());
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setError("This song is private. Please sign in to view it.");
          } else if (response.status === 404) {
            setError("Song not found");
          } else {
            setError(data.error || "Failed to load song");
          }
          return;
        }

        setSongData(data);
      } catch (err) {
        console.error("Error fetching song data:", err);
        setError("Failed to load song. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchSongData();
    }
  }, [slug, searchParams]);

  const handleBack = () => {
    router.back();
  };

  const handleDownload = () => {
    if (songData?.audioUrl) {
      // Create a temporary link and trigger download
      const link = document.createElement("a");
      link.href = songData.audioUrl;
      link.download = `${songData.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: songData?.title || "Check out this song",
      text: `Listen to "${songData?.title}" with synchronized lyrics on Melodia`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } catch (err) {
      console.error("Error sharing:", err);
    }
  };

  const handleRequestPublicAccess = () => {
    alert(
      "This song is private. To share it publicly, please go to your song settings and enable public access."
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-melodia-yellow animate-spin mx-auto mb-4" />
          <p className="text-lg font-body text-neutral-600">Loading song...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !songData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-melodia-teal mb-2">
            Oops!
          </h2>
          <p className="text-base font-body text-neutral-600 mb-6">
            {error || "Song not found"}
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-full hover:bg-melodia-yellow/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // No lyrics available
  if (!songData.lyrics || songData.lyrics.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-neutral-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🎵</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-melodia-teal mb-2">
            No Lyrics Available
          </h2>
          <p className="text-base font-body text-neutral-600 mb-6">
            This song doesn&apos;t have synchronized lyrics yet.
          </p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-full hover:bg-melodia-yellow/90 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <LyricalSongPlayer
      songTitle={songData.title}
      artistName="Melodia"
      audioUrl={songData.audioUrl}
      lyrics={songData.lyrics}
      imageUrl={songData.imageUrl || undefined}
      showDownload={songData.canDownload}
      showShare={true}
      isPublic={songData.isPublic}
      onBack={handleBack}
      onDownload={handleDownload}
      onShare={handleShare}
      onRequestPublicAccess={handleRequestPublicAccess}
      mode="page"
    />
  );
}
