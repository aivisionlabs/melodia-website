/**
 * Lyrics Generation & Editor Page
 * Generate and edit lyrics for a song request
 */

"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Sparkles,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{
    songRequestId: string;
  }>;
}

export default function GenerateLyricsPage({ params }: PageProps) {
  const router = useRouter();
  const { songRequestId: songRequestIdParam } = use(params);
  const songRequestId = parseInt(songRequestIdParam);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [lyrics, setLyrics] = useState("");
  const [title, setTitle] = useState("");
  const [musicStyle, setMusicStyle] = useState("");
  const [lyricsDraftId, setLyricsDraftId] = useState<number | null>(null);
  const [refinePrompt, setRefinePrompt] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Auto-generate lyrics on page load
    if (songRequestId) {
      handleGenerateLyrics();
    }
  }, [songRequestId]);

  const handleGenerateLyrics = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/generate-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          songRequestId,
          language: "English",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate lyrics");
      }

      setLyrics(data.draft.lyrics);
      setTitle(data.draft.title);
      setMusicStyle(data.draft.musicStyle);
      setLyricsDraftId(data.draft.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefineLyrics = async () => {
    if (!refinePrompt.trim() || !lyricsDraftId) return;

    setIsRefining(true);
    setError("");

    try {
      const response = await fetch("/api/refine-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyricsDraftId,
          editPrompt: refinePrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to refine lyrics");
      }

      setLyrics(data.draft.lyrics);
      setLyricsDraftId(data.draft.id);
      setRefinePrompt("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRefining(false);
    }
  };

  const handleApproveLyrics = async () => {
    if (!lyricsDraftId) return;

    setIsApproving(true);
    setError("");

    try {
      // First approve the lyrics
      const approveResponse = await fetch("/api/approve-lyrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyricsDraftId,
        }),
      });

      if (!approveResponse.ok) {
        throw new Error("Failed to approve lyrics");
      }

      // Then generate the song
      const songResponse = await fetch("/api/generate-song", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lyricsDraftId,
          songRequestId,
        }),
      });

      const songData = await songResponse.json();

      if (!songResponse.ok) {
        throw new Error(songData.error || "Failed to start song generation");
      }

      // Redirect to home with success message
      router.push("/?songGenerated=true");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center text-text-teal hover:text-accent-coral transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Link>

        <div className="bg-white rounded-2xl shadow-elegant p-8">
          <h1 className="text-3xl font-bold text-text-teal font-heading mb-2">
            Your Song Lyrics
          </h1>
          <p className="text-text-teal/70 mb-8">
            Review and edit your AI-generated lyrics
          </p>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error rounded-lg">
              <p className="text-error text-sm font-medium">{error}</p>
            </div>
          )}

          {isGenerating ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-accent-coral mb-4" />
              <h3 className="text-xl font-semibold text-text-teal mb-2">
                Generating Your Lyrics...
              </h3>
              <p className="text-text-teal/70">
                Our AI is crafting a beautiful song just for you
              </p>
            </div>
          ) : lyrics ? (
            <div className="space-y-6">
              {/* Lyrics Display */}
              <div>
                <h2 className="text-2xl font-bold text-text-teal font-heading mb-2">
                  {title}
                </h2>
                <p className="text-accent-coral font-medium mb-4">
                  Style: {musicStyle}
                </p>
                <div className="bg-secondary-cream/50 rounded-lg p-6 whitespace-pre-line font-body text-text-teal leading-relaxed">
                  {lyrics}
                </div>
              </div>

              {/* Refine Section */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-text-teal mb-3 flex items-center">
                  <RefreshCw className="w-5 h-5 mr-2 text-accent-coral" />
                  Want to refine the lyrics?
                </h3>
                <textarea
                  value={refinePrompt}
                  onChange={(e) => setRefinePrompt(e.target.value)}
                  placeholder="E.g., Make it more romantic, add a verse about dancing, change the chorus..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent-coral focus:border-accent-coral resize-none"
                  rows={3}
                />
                <Button
                  onClick={handleRefineLyrics}
                  disabled={isRefining || !refinePrompt.trim()}
                  className="mt-3 bg-accent-coral text-white hover:bg-accent-coral/90"
                >
                  {isRefining ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Refining...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refine Lyrics
                    </>
                  )}
                </Button>
              </div>

              {/* Approve Section */}
              <div className="border-t border-gray-200 pt-6">
                <p className="text-text-teal/70 mb-4">
                  Happy with the lyrics? Let&apos;s create your song!
                </p>
                <Button
                  onClick={handleApproveLyrics}
                  disabled={isApproving}
                  className="bg-primary-yellow text-text-teal hover:bg-primary-yellow/90 font-bold py-6 px-8 text-lg"
                >
                  {isApproving ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Starting Generation...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate My Song
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
