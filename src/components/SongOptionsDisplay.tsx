"use client";

import SongPlayerCard from "@/components/SongPlayerCard";
import { Button } from "@/components/ui/button";
import { selectSongVariantAction } from "@/lib/actions";
import { SongStatusResponse, SongVariant } from "@/lib/song-status-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface SongOptionsDisplayProps {
  songStatus: SongStatusResponse;
  onBack?: () => void;
  onBackupWithGoogle?: () => void;
  isStandalonePage?: boolean;
}

export default function SongOptionsDisplay({
  songStatus,
  onBackupWithGoogle,
  isStandalonePage = true,
}: SongOptionsDisplayProps) {
  const router = useRouter();
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
    const variant = songStatus.variants?.find((v) => v.id === variantId);
    return (
      variantStates[variantId] || {
        currentTime: 0,
        duration: variant?.duration,
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
      const variant = songStatus.variants?.find((v) => v.id === variantId);
      const currentState = prev[variantId] || {
        currentTime: 0,
        duration: variant?.duration,
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

  const content = (
    <>
      {/* Song Options */}
      <div className="space-y-4 px-2">
        {songStatus.variants?.map((variant, index) => {
          const variantState = getVariantState(variant.id);
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
                onDownload={handleDownload}
                onShareToggle={handleShareToggle}
                onEmailChange={handleEmailChange}
                onSendEmail={handleSendEmail}
                isPlaying={
                  activeStreamingVariant === variant.id &&
                  variantState.isPlaying
                }
                isLoading={variantState.isLoading}
                currentTime={variantState.currentTime}
                duration={variantState.duration}
                isSelected={isSelected}
                isPermanentlySelected={isPermanentlySelected}
                showLyricalSongButton={
                  isSelected &&
                  songStatus.variantTimestampLyricsProcessed?.[index]
                }
                onViewLyricalSong={() => {
                  router.push(
                    `/song/${songStatus.slug}?variantId=${variant.id}&userId=${
                      songStatus.userId || ""
                    }&anonymousUserId=${songStatus.anonymousUserId || ""}`
                  );
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Backup Option */}
      {isStandalonePage && onBackupWithGoogle && (
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
      )}
    </>
  );

  if (!isStandalonePage) {
    return content;
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <div className="px-6 pt-24 pb-4">
        {isFinalSelectionMade ? (
          <div className="text-center mb-8">
            <h1 className="font-heading text-melodia-teal">Your Songs</h1>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-4 mb-8">
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
            {isProcessingLyrics
              ? "Processing Lyrics..."
              : "Create Lyrical Version"}
          </Button>
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
