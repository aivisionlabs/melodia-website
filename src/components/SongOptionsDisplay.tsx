"use client";

import SongPlayerCard from "@/components/SongPlayerCard";
import { Button } from "@/components/ui/button";
import { LoginPromptCard } from "@/components/LoginPromptCard";
import { selectSongVariantAction } from "@/lib/actions";
import { SongStatusResponse, SongVariant } from "@/lib/song-status-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useStreamingPlayback } from "@/hooks/use-streaming-playback";
import { useAuth } from "@/hooks/use-auth";

interface SongOptionsDisplayProps {
  songStatus: SongStatusResponse;
  onBack?: () => void;
  onBackupWithGoogle?: () => void;
  isStandalonePage?: boolean;
}

export default function SongOptionsDisplay({
  songStatus,
  isStandalonePage = true,
}: SongOptionsDisplayProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<SongVariant | null>(
    null
  );
  const [isProcessingLyrics, setIsProcessingLyrics] = useState(false);

  const isFinalSelectionMade =
    songStatus.selectedVariantIndex !== undefined &&
    songStatus.selectedVariantIndex !== null &&
    !!songStatus.variantTimestampLyricsProcessed?.[
      songStatus.selectedVariantIndex
    ];

  useEffect(() => {
    if (
      songStatus.selectedVariantIndex !== undefined &&
      songStatus.selectedVariantIndex !== null &&
      songStatus.variants
    ) {
      setSelectedVariant(songStatus.variants[songStatus.selectedVariantIndex]);
    }
  }, [songStatus.selectedVariantIndex, songStatus.variants]);

  const [sharePublicly, setSharePublicly] = useState<{
    [key: string]: boolean;
  }>({});
  const [emailInput, setEmailInput] = useState<{ [key: string]: string }>({});

  // Use the new streaming playback hook
  const { getPlaybackState, togglePlayback, updateDuration, cleanup, seekTo } =
    useStreamingPlayback({
      onDurationAvailable: (variantId, duration) => {
        console.log(
          `Duration available for variant ${variantId}: ${duration}s`
        );
      },
    });

  // Update duration when songStatus changes (from polling)
  useEffect(() => {
    if (songStatus.variants) {
      songStatus.variants.forEach((variant) => {
        if (variant.duration && variant.duration > 0) {
          const currentState = getPlaybackState(variant.id);
          // Only update if duration has actually changed
          if (currentState.duration !== variant.duration) {
            updateDuration(variant.id, variant.duration);
          }
        }
      });
    }
  }, [songStatus.variants, updateDuration, getPlaybackState]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  // Streaming audio player functions
  const handleStreamingPlayPause = (
    variantId: string,
    streamAudioUrl: string
  ) => {
    togglePlayback(variantId, streamAudioUrl);
  };

  const handleSeek = (variantId: string, time: number) => {
    seekTo(variantId, time);
  };

  const handleSkipBackward = (variantId: string) => {
    const currentState = getPlaybackState(variantId);
    const newTime = Math.max(0, currentState.currentTime - 15);
    seekTo(variantId, newTime);
  };

  const handleSkipForward = (variantId: string) => {
    const currentState = getPlaybackState(variantId);
    const newTime = Math.min(
      currentState.duration,
      currentState.currentTime + 15
    );
    seekTo(variantId, newTime);
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

  const handleViewLyricalSong = async () => {
    if (!selectedVariant) return;

    setIsProcessingLyrics(true);
    try {
      const selectedIndex = songStatus.variants?.findIndex(
        (v) => v.id === selectedVariant.id
      );

      if (
        songStatus.songId === undefined ||
        songStatus.taskId === undefined ||
        selectedIndex === undefined ||
        selectedIndex === -1
      ) {
        console.error("Missing required data to process lyrics.");
        alert("Could not process lyrics. Please try again.");
        return;
      }

      const result = await selectSongVariantAction(
        songStatus.songId,
        songStatus.taskId,
        selectedIndex
      );

      if (result.success && songStatus.slug) {
        router.push(`/song/${songStatus.slug}`);
      } else {
        console.error("Failed to process lyrics:", result.error);
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessingLyrics(false);
    }
  };

  const content = (
    <>
      {/* Song Options */}
      <div className="space-y-4">
        {songStatus.variants?.map((variant, index) => {
          const playbackState = getPlaybackState(variant.id);
          const isSelected = selectedVariant?.id === variant.id;
          const isPermanentlySelected = isSelected && isFinalSelectionMade;

          return (
            <div
              key={variant.id}
              onClick={() =>
                !isFinalSelectionMade && setSelectedVariant(variant)
              }
            >
              <SongPlayerCard
                variant={variant}
                variantIndex={index}
                variantLabel={`Song Option ${index + 1}`}
                showSharing={false}
                showEmailInput={false}
                sharePublicly={sharePublicly[variant.id] || false}
                emailInput={emailInput[variant.id] || ""}
                onPlayPause={() =>
                  handleStreamingPlayPause(
                    variant.id,
                    variant.sourceStreamAudioUrl || variant.streamAudioUrl || ""
                  )
                }
                onSeek={(time) => handleSeek(variant.id, time)}
                onSkipBackward={() => handleSkipBackward(variant.id)}
                onSkipForward={() => handleSkipForward(variant.id)}
                onDownload={handleDownload}
                onShareToggle={handleShareToggle}
                onEmailChange={handleEmailChange}
                onSendEmail={handleSendEmail}
                isPlaying={playbackState.isPlaying}
                isLoading={playbackState.isLoading}
                currentTime={playbackState.currentTime}
                duration={playbackState.duration}
                isSelected={isSelected}
                isPermanentlySelected={isPermanentlySelected}
                showLyricalSongButton={true}
                onViewLyricalSong={() => {
                  router.push(`/song/${songStatus.slug}`);
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );

  if (!isStandalonePage) {
    return content;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-4 pt-24 pb-4">
        {isFinalSelectionMade ? (
          <div className="text-center mb-8">
            <h1 className="font-heading text-melodia-teal">Your Songs</h1>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-2">
              <h1 className="font-heading text-melodia-teal">
                Choose Your Song
              </h1>
            </div>
            <p className="text-melodia-teal mb-8">
              Choose one of the following songs to view a lyrical version of the
              song.
            </p>
          </>
        )}
        {content}
      </div>

      {!isFinalSelectionMade && selectedVariant && (
        <div className="bg-white p-4 shadow-lg-top">
          <Button
            onClick={handleViewLyricalSong}
            className="w-full bg-melodia-coral text-white hover:bg-melodia-coral/90 font-medium rounded-2xl"
            size="lg"
            disabled={isProcessingLyrics}
          >
            {isProcessingLyrics ? (
              "Processing Lyrics..."
            ) : (
              <span className="font-semibold">Create Lyrical Version</span>
            )}
          </Button>
        </div>
      )}

      {/* Backup Option - Only show for non-authenticated users */}
      {isStandalonePage && !isAuthenticated && (
        <div className="mt-8 px-4">
          <LoginPromptCard />
        </div>
      )}

      {/* Full-screen MediaPlayer for Lyrics */}
      {/* {showMediaPlayer && selectedVariant && (
        <MediaPlayer
          song={{
            metadata: {
              title: selectedVariant.title,
              suno_task_id: songStatus.variants?.[0]?.id,
            },
            song_variants: songStatus.variants,
            selected_variant: songStatus.variants?.findIndex(
              (v) => v.id === selectedVariant.id
            ),
            suno_audio_id: selectedVariant.id,
          }}
          onClose={() => {
            // Stop any audio that might be playing in MediaPlayer
            const mediaPlayerAudio = document.querySelector("audio");
            if (mediaPlayerAudio) {
              mediaPlayerAudio.pause();
              mediaPlayerAudio.currentTime = 0;
            }

            setShowMediaPlayer(false);
            setSelectedVariant(null);
          }}
        />
      )} */}
    </div>
  );
}
