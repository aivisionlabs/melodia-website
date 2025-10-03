"use client";

import React, { useEffect, useState } from "react";
import LyricalSongPlayer from "./LyricalSongPlayer";
import { LyricLine } from "@/types";
import { Loader2 } from "lucide-react";

interface LyricalSongPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  slug: string;
}

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

export default function LyricalSongPlayerModal({
  isOpen,
  onClose,
  slug,
}: LyricalSongPlayerModalProps) {
  const [songData, setSongData] = useState<SongLyricsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !slug) {
      return;
    }

    const fetchSongData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/song/${slug}/lyrics`);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setError('This song is private.');
          } else if (response.status === 404) {
            setError('Song not found');
          } else {
            setError(data.error || 'Failed to load song');
          }
          return;
        }

        setSongData(data);
      } catch (err) {
        console.error('Error fetching song data:', err);
        setError('Failed to load song. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSongData();
  }, [isOpen, slug]);

  const handleDownload = () => {
    if (songData?.audioUrl) {
      const link = document.createElement('a');
      link.href = songData.audioUrl;
      link.download = `${songData.title}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/song/${slug}`;
    const shareData = {
      title: songData?.title || 'Check out this song',
      text: `Listen to "${songData?.title}" with synchronized lyrics on Melodia`,
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareUrl);
        alert('Link copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  const handleRequestPublicAccess = () => {
    alert(
      'This song is private. To share it publicly, please go to your song settings and enable public access.'
    );
  };

  if (!isOpen) {
    return null;
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
          <Loader2 className="w-12 h-12 text-melodia-yellow animate-spin mx-auto mb-4" />
          <p className="text-lg font-body text-neutral-600">Loading song...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !songData) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">😕</span>
          </div>
          <h2 className="text-2xl font-heading font-bold text-melodia-teal mb-2">
            Oops!
          </h2>
          <p className="text-base font-body text-neutral-600 mb-6">
            {error || 'Song not found'}
          </p>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-full hover:bg-melodia-yellow/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // No lyrics available
  if (!songData.lyrics || songData.lyrics.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
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
            onClick={onClose}
            className="px-6 py-3 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-full hover:bg-melodia-yellow/90 transition-colors"
          >
            Close
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
      onDownload={handleDownload}
      onShare={handleShare}
      onRequestPublicAccess={handleRequestPublicAccess}
      mode="modal"
      onClose={onClose}
    />
  );
}


