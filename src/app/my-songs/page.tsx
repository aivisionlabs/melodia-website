"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Play,
  ArrowLeft,
  Music,
  Trash2,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useAnonymousUser } from "@/hooks/use-anonymous-user";
import {
  UserContentItem,
  getButtonForContent,
} from "@/lib/user-content-client";
import { useToast } from "@/components/ui/toast";
import { pollSongStatus } from "@/lib/song-status-client";
import { VariantSelectionModal } from "@/components/VariantSelectionModal";
import { MiniPlayer } from "@/components/MiniPlayer";
import BottomNavigation from "@/components/BottomNavigation";

export default function MySongsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { anonymousUserId, loading: anonymousLoading } = useAnonymousUser();
  const { addToast } = useToast();
  const [userContent, setUserContent] = useState<UserContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pollingSongs, setPollingSongs] = useState<Set<string>>(new Set());
  const cleanupFunctionsRef = useRef<Map<string, () => void>>(new Map());

  // Variant selection modal state
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [selectedSongForVariants, setSelectedSongForVariants] =
    useState<UserContentItem | null>(null);

  // Media player state
  const [selectedSong, setSelectedSong] = useState<any>(null);
  const [, setSongLyrics] = useState<any[]>([]);

  const stopPollingSong = (songId: string) => {
    const cleanup = cleanupFunctionsRef.current.get(songId);
    if (cleanup) {
      console.log(`Stopping polling for song ${songId}`);
      cleanup();
      cleanupFunctionsRef.current.delete(songId);
    }

    setPollingSongs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(songId);
      return newSet;
    });
  };

  const loadUserContent = useCallback(async () => {
    // Check if we have either a user ID or anonymous user ID
    if (!user?.id && !anonymousUserId) {
      console.log("No user ID or anonymous user ID available");
      return;
    }

    try {
      setIsLoading(true);
      console.log("=== LOADING USER CONTENT ===");
      console.log("User ID:", user?.id);
      console.log("Anonymous User ID:", anonymousUserId);
      console.log("User object:", user);
      
      // Use your existing API endpoint to get user content
      const apiUrl = user?.id 
        ? `/api/user-content?userId=${user.id}`
        : `/api/user-content?anonymousUserId=${anonymousUserId}`;
      console.log("API URL:", apiUrl);
      
      const response = await fetch(apiUrl);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      const result = await response.json();
      console.log("API Response:", result);
      
      if (result.success && result.content) {
        console.log("=== DEBUGGING MY SONGS ===");
        console.log("Total items loaded:", result.content.length);
        console.log("Raw content data:", result.content);
        
        // Show all items with their details
        result.content.forEach((item: UserContentItem, index: number) => {
          console.log(`Item ${index + 1}:`, {
            id: item.id,
            type: item.type,
            title: item.title,
            status: item.status,
            recipient_name: item.recipient_name,
            has_audio: !!item.audio_url
          });
        });
        
        // Show ALL content items (songs, lyrics drafts, everything)
        console.log("Showing ALL content items from database...");
        setUserContent(result.content);
      } else {
        console.error("Failed to load user content:", result.message);
        addToast({
          type: "error",
          title: "Error",
          message: result.message || "Failed to load your songs. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error loading user content:", error);
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to load your songs. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, anonymousUserId, addToast]);

  // Helper function to safely parse lyrics
  const parseLyrics = (lyrics: any): any[] => {
    if (!lyrics) return [];

    if (typeof lyrics === "string") {
      try {
        return JSON.parse(lyrics);
      } catch {
        const lines = lyrics.split("\n").filter((line) => line.trim() !== "");
        const lyricsArray = lines.map((line, index) => ({
          index: index,
          text: line.trim(),
          start: index * 5000,
          end: (index + 1) * 5000,
        }));
        return lyricsArray;
      }
    }

    return Array.isArray(lyrics) ? lyrics : [];
  };

  // Handle variant selection for MediaPlayer
  const handleVariantSelectForPlayer = (variant: any, variantIndex: number) => {
    if (!selectedSongForVariants) return;

    let variantLyrics = null;
    if (
      selectedSongForVariants.timestamped_lyrics_variants &&
      selectedSongForVariants.timestamped_lyrics_variants[variantIndex]
    ) {
      variantLyrics =
        selectedSongForVariants.timestamped_lyrics_variants[variantIndex];
    } else if (selectedSongForVariants.timestamp_lyrics) {
      variantLyrics = selectedSongForVariants.timestamp_lyrics;
    } else {
      variantLyrics = parseLyrics(selectedSongForVariants.lyrics);
    }

    const songForPlayer = {
      title: selectedSongForVariants.title,
      artist: selectedSongForVariants.recipient_name,
      song_url: variant.audioUrl || variant.streamAudioUrl,
      slug: selectedSongForVariants.title.toLowerCase().replace(/\s+/g, "-"),
      lyrics: variantLyrics,
      timestamp_lyrics: selectedSongForVariants.timestamp_lyrics || null,
      timestamped_lyrics_variants:
        selectedSongForVariants.timestamped_lyrics_variants || null,
      selected_variant: variantIndex,
      suno_task_id: selectedSongForVariants.suno_task_id,
      suno_audio_id: variant.id,
    };

    setSelectedSong(songForPlayer);
    setSongLyrics(variantLyrics || []);
  };

  // Handle listen button click
  const handleListenClick = (item: UserContentItem) => {
    if (item.variants && item.variants.length > 1) {
      setSelectedSongForVariants(item);
      setShowVariantModal(true);
    } else if (item.variants && item.variants.length === 1) {
      handleVariantSelectForPlayer(item.variants[0], 0);
    } else {
      let songLyrics = null;
      if (
        item.timestamped_lyrics_variants &&
        item.timestamped_lyrics_variants[0]
      ) {
        songLyrics = item.timestamped_lyrics_variants[0];
      } else if (item.timestamp_lyrics) {
        songLyrics = item.timestamp_lyrics;
      } else {
        songLyrics = parseLyrics(item.lyrics);
      }

      const songForPlayer = {
        title: item.title,
        artist: item.recipient_name,
        song_url: item.audio_url,
        slug: item.title.toLowerCase().replace(/\s+/g, "-"),
        lyrics: songLyrics,
        timestamp_lyrics: item.timestamp_lyrics || null,
        timestamped_lyrics_variants: item.timestamped_lyrics_variants || null,
        selected_variant: 0,
        suno_task_id: item.suno_task_id,
        suno_audio_id: item.song_id?.toString(),
      };
      setSelectedSong(songForPlayer);
      setSongLyrics(songLyrics || []);
    }
  };

  useEffect(() => {
    // Wait for both auth and anonymous user loading to complete
    if (authLoading || anonymousLoading) {
      return;
    }

    // If neither authenticated nor anonymous user, redirect to sign-in
    if (!isAuthenticated && !anonymousUserId) {
      router.push("/sign-in");
      return;
    }

    // Load content if we have either user ID or anonymous user ID
    if (user?.id || anonymousUserId) {
      loadUserContent();
    }
  }, [user, authLoading, isAuthenticated, anonymousUserId, anonymousLoading, router, loadUserContent]);

  // Refresh data when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadUserContent();
      } else if (document.hidden) {
        console.log("Page hidden - stopping all polling");
        cleanupFunctionsRef.current.forEach((cleanup, songId) => {
          console.log(`Stopping polling for song ${songId} - page hidden`);
          cleanup();
        });
        cleanupFunctionsRef.current.clear();
        setPollingSongs(new Set());
      }
    };

    const handleFocus = () => {
      if (user?.id) {
        loadUserContent();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user?.id, loadUserContent]);

  // Start individual song polling for processing songs
  useEffect(() => {
    if (user?.id && userContent.length > 0) {
      // Find songs that need polling
      const songsToPoll = userContent.filter(
        (item) =>
          item.type === "song" &&
          (item.status === "processing" || item.status === "generating") &&
          !pollingSongs.has(item.id)
      );

      if (songsToPoll.length > 0) {
        console.log(
          `Found ${songsToPoll.length} songs to poll:`,
          songsToPoll.map((s) => s.id)
        );

        songsToPoll.forEach((song) => {
          // Extract taskId from song metadata or use a fallback
          const taskId = song.suno_task_id || `demo-task-${Date.now()}`;

          console.log(
            `Starting polling for song ${song.id} with taskId ${taskId}`
          );

          // Mark as polling immediately to prevent duplicate polling
          setPollingSongs((prev) => new Set(prev.add(song.id)));

          // Start polling this individual song
          const cleanup = pollSongStatus(
            taskId,
            (status) => {
              console.log(`Song ${song.id} status update:`, status);

              // Song status will be updated in setUserContent below

              // If completed, update the user content
              if (status.status === "completed" && status.audioUrl) {
                setUserContent((prev) =>
                  prev.map((item) =>
                    item.id === song.id
                      ? { ...item, status: "ready", audio_url: status.audioUrl }
                      : item
                  )
                );

                addToast({
                  type: "success",
                  title: "Song Ready!",
                  message: `${song.title} has been generated and is ready to listen!`,
                });

                // Stop polling this song
                stopPollingSong(song.id);
              } else if (status.status === "failed") {
                setUserContent((prev) =>
                  prev.map((item) =>
                    item.id === song.id ? { ...item, status: "failed" } : item
                  )
                );

                addToast({
                  type: "error",
                  title: "Song Generation Failed",
                  message: `${song.title} failed to generate. You can try again.`,
                });

                // Stop polling this song
                stopPollingSong(song.id);
              }
            },
            (error) => {
              console.error(`Error polling song ${song.id}:`, error);
              addToast({
                type: "error",
                title: "Status Check Failed",
                message:
                  "Failed to check song status. Please refresh the page.",
              });

              // Stop polling this song on error
              stopPollingSong(song.id);
            },
            10000 // Poll every 10 seconds
          );

          // Store cleanup function in ref
          cleanupFunctionsRef.current.set(song.id, cleanup);
        });
      }
    }
  }, [userContent, user?.id, addToast, pollingSongs]); // Added missing dependencies

  // Cleanup polling when component unmounts
  useEffect(() => {
    const cleanupFunctions = cleanupFunctionsRef.current;
    return () => {
      console.log("Cleaning up all polling on component unmount");
      // Call all cleanup functions
      cleanupFunctions.forEach((cleanup, songId) => {
        console.log(`Stopping polling for song ${songId}`);
        cleanup();
      });
      // Clear the ref
      cleanupFunctions.clear();
    };
  }, []); // Empty dependency array - only run on unmount

  const handlePlaySong = (item: UserContentItem) => {
    const button = getButtonForContent(item);

    switch (button.action) {
      case "listen":
        handleListenClick(item);
        break;
      case "retry":
        if (item.request_id) {
          router.push(`/lyrics-display?requestId=${item.request_id}`);
        }
        break;
      case "generate":
        if (item.request_id) {
          router.push(`/lyrics-display?requestId=${item.request_id}`);
        }
        break;
      case "view":
      case "review":
      default:
        if (item.request_id) {
          router.push(`/lyrics-display?requestId=${item.request_id}`);
        }
        break;
    }
  };

  const handleDeleteSong = async (item: UserContentItem) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        const response = await fetch("/api/delete-content", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contentId: item.id,
            contentType: item.type,
          }),
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || "Failed to delete item");
        }

        // Remove from local state
        const updatedContent = userContent.filter(
          (content) => content.id !== item.id
        );
        setUserContent(updatedContent);

        addToast({
          type: "success",
          title: "Deleted",
          message: "Item deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting item:", error);
        addToast({
          type: "error",
          title: "Delete Failed",
          message:
            error instanceof Error ? error.message : "Failed to delete item",
        });
      }
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleRefresh = () => {
    loadUserContent();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Generate album art placeholder based on song title
  const generateAlbumArt = (title: string) => {
    const colors = [
      "bg-gradient-to-br from-blue-400 to-blue-600",
      "bg-gradient-to-br from-green-400 to-green-600", 
      "bg-gradient-to-br from-purple-400 to-purple-600",
      "bg-gradient-to-br from-pink-400 to-pink-600",
      "bg-gradient-to-br from-orange-400 to-orange-600",
      "bg-gradient-to-br from-teal-400 to-teal-600",
    ];
    
    const hash = title.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return colors[Math.abs(hash) % colors.length];
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-melodia-teal-light to-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-foreground">Loading your songs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-melodia-teal-light to-background">
      {/* Header - Light blue background matching design */}
      <div className="bg-blue-100 border-b border-blue-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-melodia-teal hover:bg-blue-200 p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <div className="text-center flex-1">
              <h1 className="text-xl font-bold text-melodia-teal">My Songs</h1>
            </div>

            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-melodia-teal hover:bg-blue-200 p-2"
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-6 pb-24">
        {userContent.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 mx-auto mb-4 text-melodia-teal" />
            <h3 className="text-xl font-bold text-melodia-teal mb-2">
              No Content Found
            </h3>
            <p className="text-muted-foreground mb-4">
              No songs or content found in your database. Start by creating your first song!
            </p>
            <Button
              onClick={() => router.push("/")}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold"
            >
              Create Your First Song
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {userContent.map((item) => {
              const button = getButtonForContent(item);
              return (
                <div
                  key={`${item.type}-${item.id}`}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start space-x-4">
                    {/* Album Art */}
                    <div className={`w-16 h-16 rounded-lg ${generateAlbumArt(item.title)} flex-shrink-0`}>
                      <div className="w-full h-full rounded-lg bg-white/20 flex items-center justify-center">
                        <Music className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-melodia-teal mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                        {item.type === "song" 
                          ? `A personalized song for ${item.recipient_name}`
                          : item.type === "lyrics_draft"
                          ? `Lyrics draft for ${item.recipient_name}`
                          : `Song request for ${item.recipient_name}`
                        }
                      </p>
                      <p className="text-xs text-gray-500 mb-3">
                        Created: {formatDate(item.created_at)}
                      </p>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => {
                            if (item.request_id) {
                              router.push(`/lyrics-display?requestId=${item.request_id}`);
                            }
                          }}
                          className="text-accent text-sm font-medium hover:text-accent/80"
                        >
                          View More
                        </button>

                        <div className="flex items-center space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              // Always navigate to lyrics display page when play button is clicked
                              if (item.request_id) {
                                router.push(`/lyrics-display?requestId=${item.request_id}`);
                              }
                            }}
                            size="sm"
                            className="bg-accent hover:bg-accent/90 text-white rounded-full w-10 h-10 p-0"
                          >
                            <Play className="w-4 h-4" />
                          </Button>

                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSong(item);
                            }}
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500 p-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Variant Selection Modal */}
      {showVariantModal && selectedSongForVariants && (
        <VariantSelectionModal
          isOpen={showVariantModal}
          onClose={() => {
            setShowVariantModal(false);
            setSelectedSongForVariants(null);
          }}
          songTitle={selectedSongForVariants.title}
          variants={selectedSongForVariants.variants || []}
          onSelectVariant={handleVariantSelectForPlayer}
        />
      )}

      {/* Sticky Mini Player */}
      {selectedSong && (
        <MiniPlayer
          song={{
            title: selectedSong.title,
            artist: selectedSong.artist,
            song_url: selectedSong.song_url,
          }}
        />
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
