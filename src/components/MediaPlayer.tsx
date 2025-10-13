import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Pause, X, Rewind, FastForward, AlertCircle } from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/ShareButton";
import {
  trackPlayerEvent,
  trackEngagementEvent,
  trackNavigationEvent,
} from "@/lib/analytics";

// iOS Audio Context type declaration
declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}

interface LyricLine {
  index: number;
  text: string;
  start: number;
  end: number;
}

interface MediaPlayerProps {
  song: {
    title: string;
    artist: string;
    audioUrl?: string;
    song_url?: string; // New field for the actual audio URL
    videoUrl?: string;
    lyrics?: LyricLine[];
    timestamp_lyrics?: LyricLine[]; // Final variation of lyrics
    timestamped_lyrics_variants?: {
      [variantIndex: number]: LyricLine[];
    } | null;
    selected_variant?: number;
    slug?: string;
  };
  onClose: () => void;
}

export const MediaPlayer = ({ song, onClose }: MediaPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayLoading, setIsPlayLoading] = useState(false);

  const [iosAudioUnlocked, setIosAudioUnlocked] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lyricRefs = useRef<(HTMLDivElement | null)[]>([]);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Check if we're on iOS
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

  // Convert current time to milliseconds for timestamp comparison
  const currentTimeMs = currentTime * 1000;

  // Helper function to get the correct audio URL
  const getAudioUrl = useCallback(() => {
    // Priority: song_url (new field) > audioUrl (legacy field)
    return song.song_url || song.audioUrl;
  }, [song.song_url, song.audioUrl]);

  // Handle audio loading and errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Reset loading state when audio URL changes
    setIsLoading(false);
    setAudioError(false);

    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(false);
    };

    const handleError = () => {
      console.warn(
        "Audio file not available or failed to load. This is expected for demo purposes."
      );
      setIsLoading(false);
      setAudioError(true);
    };

    const handleLoadStart = () => {
      if (getAudioUrl()) {
        setIsLoading(true);
        setAudioError(false);
      }
    };

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setAudioError(false);
    };

    const handleCanPlayThrough = () => {
      setIsLoading(false);
      setAudioError(false);
    };

    // iOS-specific: Handle when audio is ready
    const handleLoadedData = () => {
      setIsLoading(false);
      setAudioError(false);
    };

    // Set a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(
      () => {
        if (isLoading) {
          setIsLoading(false);
          setAudioError(true);
        }
      },
      isIOS ? 5000 : 10000
    ); // 5 second timeout on iOS, 10 seconds on other platforms

    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("error", handleError);
    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("canplaythrough", handleCanPlayThrough);
    audio.addEventListener("loadeddata", handleLoadedData);

    return () => {
      clearTimeout(loadingTimeout);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("canplaythrough", handleCanPlayThrough);
      audio.removeEventListener("loadeddata", handleLoadedData);
    };
  }, [getAudioUrl, isLoading, isIOS]);

  const getLyricsAtTime = (timeMs: number) => {
    // Priority 1: Use timestamp_lyrics (final variation) if available
    if (song.timestamp_lyrics && song.timestamp_lyrics.length > 0) {
      return song.timestamp_lyrics.map((line: any) => ({
        ...line,
        isActive: timeMs >= line.start && timeMs < line.end,
        isPast: timeMs >= line.end,
      }));
    }

    // Priority 2: Use timestamped lyrics variants if available (fallback)
    if (song.timestamped_lyrics_variants) {
      // If no selected_variant is set, default to variant 0
      const variantToUse =
        song.selected_variant !== undefined ? song.selected_variant : 0;
      let selectedVariantLyrics =
        song.timestamped_lyrics_variants[variantToUse];

      // If the default variant doesn't exist, try to find any available variant
      if (!selectedVariantLyrics || selectedVariantLyrics.length === 0) {
        const availableVariants = Object.keys(song.timestamped_lyrics_variants);
        if (availableVariants.length > 0) {
          const firstVariant = parseInt(availableVariants[0]);
          selectedVariantLyrics =
            song.timestamped_lyrics_variants[firstVariant];
        }
      }

      if (selectedVariantLyrics && selectedVariantLyrics.length > 0) {
        return selectedVariantLyrics.map((line: any) => ({
          ...line,
          isActive: timeMs >= line.start && timeMs < line.end,
          isPast: timeMs >= line.end,
        }));
      }
    }

    // Priority 3: Use the legacy lyrics prop if available
    if (song.lyrics && song.lyrics.length > 0) {
      console.log("MediaPlayer: Using legacy lyrics prop");
      return song.lyrics.map((line: any) => ({
        ...line,
        isActive: timeMs >= line.start && timeMs < line.end,
        isPast: timeMs >= line.end,
      }));
    }

    // Priority 4: Fallback to static lyrics only if no song lyrics available
    const staticLyrics = [
      {
        index: 0,
        text: "Sweet dreams tonight, little one",
        start: 0,
        end: 5000,
      },
      {
        index: 1,
        text: "Close your eyes and rest",
        start: 5000,
        end: 10000,
      },
      {
        index: 2,
        text: "The stars are shining bright above",
        start: 10000,
        end: 15000,
      },
      {
        index: 3,
        text: "You are loved and blessed",
        start: 15000,
        end: 20000,
      },
      {
        index: 4,
        text: "Sleep now, my darling",
        start: 20000,
        end: 25000,
      },
      {
        index: 5,
        text: "Dream of happy things",
        start: 25000,
        end: 30000,
      },
      {
        index: 6,
        text: "Tomorrow brings new adventures",
        start: 30000,
        end: 35000,
      },
      {
        index: 7,
        text: "On happiness wings",
        start: 35000,
        end: 40000,
      },
    ];

    // When not playing, show static lyrics with first line highlighted
    if (!isPlaying || audioError) {
      return staticLyrics.map((line: any, index: number) => ({
        ...line,
        isActive: index === 0, // Highlight first line when not playing
        isPast: index > 0,
      }));
    }

    // When playing, show static lyrics with timing-based highlighting
    return staticLyrics.map((line: any) => ({
      ...line,
      isActive: timeMs >= line.start && timeMs < line.end,
      isPast: timeMs >= line.end,
    }));
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;

    // iOS-specific: Unlock audio on first interaction
    if (isIOS && !iosAudioUnlocked) {
      await unlockIOSAudio();
    }

    if (isPlaying) {
      if (audio) {
        audio.pause();
      }
      // Clear demo interval if running
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
        demoIntervalRef.current = null;
      }
      setIsPlaying(false);

      // Track pause event
      trackPlayerEvent.pause(song.title, song.slug || "unknown", currentTime);
    } else {
      // If no audio URL or audio error, simulate playing for demo
      if (!getAudioUrl() || audioError) {
        setIsPlaying(true);
        // Track demo play event
        trackPlayerEvent.play(song.title, song.slug || "unknown", true);

        // Simulate time progression for demo
        demoIntervalRef.current = setInterval(() => {
          setCurrentTime((prev) => {
            const newTime = prev + 0.1;
            if (newTime >= 40) {
              // Reset after 40 seconds
              if (demoIntervalRef.current) {
                clearInterval(demoIntervalRef.current);
                demoIntervalRef.current = null;
              }
              setIsPlaying(false);
              setCurrentTime(0);
              // Track demo end event
              trackPlayerEvent.audioEnd(song.title, song.slug || "unknown", 40);
              return 0;
            }
            return newTime;
          });
        }, 100);
      } else {
        // Show loading state when trying to play actual audio
        setIsPlayLoading(true);

        // Try to play actual audio with simplified iOS handling
        if (audio) {
          try {
            // Set volume before playing (iOS requirement)
            audio.volume = 1; // Always play at full volume

            // Simple play attempt
            const playPromise = audio.play();

            if (playPromise !== undefined) {
              await playPromise;
              setIsPlaying(true);
              setAudioError(false);
              setIsPlayLoading(false);
              // Track play event
              trackPlayerEvent.play(song.title, song.slug || "unknown", false);
            }
          } catch (error) {
            console.warn("Error playing audio:", error);
            setAudioError(true);
            setIsPlayLoading(false);
            // Track audio error
            trackPlayerEvent.audioError(
              song.title,
              song.slug || "unknown",
              "play_error"
            );
          }
        }
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const skipTime = (seconds: number) => {
    if (audioRef.current && !audioError) {
      const newTime = Math.max(
        0,
        Math.min(audioRef.current.currentTime + seconds, duration || Infinity)
      );
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // Track skip event
      if (seconds > 0) {
        trackPlayerEvent.skipForward(
          song.title,
          song.slug || "unknown",
          seconds
        );
      } else {
        trackPlayerEvent.skipBackward(
          song.title,
          song.slug || "unknown",
          Math.abs(seconds)
        );
      }
    } else if (!getAudioUrl() || audioError) {
      // Handle demo mode
      const newTime = Math.max(0, Math.min(currentTime + seconds, 40));
      setCurrentTime(newTime);

      // Track skip event in demo mode
      if (seconds > 0) {
        trackPlayerEvent.skipForward(
          song.title,
          song.slug || "unknown",
          seconds
        );
      } else {
        trackPlayerEvent.skipBackward(
          song.title,
          song.slug || "unknown",
          Math.abs(seconds)
        );
      }
    }
  };

  // iOS Audio unlock mechanism
  const unlockIOSAudio = useCallback(async () => {
    if (!isIOS || iosAudioUnlocked) return;

    try {
      // Method 1: Create a simple audio context and resume it
      try {
        const AudioContextClass =
          window.AudioContext || window.webkitAudioContext;
        const audioContext = new AudioContextClass();
        audioContextRef.current = audioContext;

        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
      } catch (contextError) {
        console.warn(`Audio context error: ${contextError}`);
      }

      // Method 2: Try to play the actual audio element with volume 0
      if (audioRef.current) {
        try {
          const audio = audioRef.current;
          audio.volume = 0;
          audio.currentTime = 0;

          const playPromise = audio.play();

          if (playPromise !== undefined) {
            await playPromise;

            // Immediately pause it
            audio.pause();
            audio.volume = 1; // Always play at full volume

            setIosAudioUnlocked(true);
            return;
          }
        } catch (audioError) {
          console.warn(`Volume 0 play error: ${audioError}`);
        }
      }

      // Method 3: Create a minimal audio element
      try {
        const testAudio = document.createElement("audio");
        testAudio.src =
          "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
        testAudio.volume = 0;
        testAudio.preload = "none";

        await testAudio.play();
        testAudio.pause();

        setIosAudioUnlocked(true);
      } catch (minimalError) {
        console.warn(`Minimal audio error: ${minimalError}`);

        // Last resort: just mark as unlocked and hope for the best
        setIosAudioUnlocked(true);
      }
    } catch (error) {
      console.warn(`iOS audio unlock failed: ${error}`);
      // Even if unlock fails, mark as unlocked to prevent repeated attempts
      setIosAudioUnlocked(true);
    }
  }, [isIOS, iosAudioUnlocked]);

  // Calculate lyrics
  const lyrics = getLyricsAtTime(currentTimeMs);

  // Auto-scroll to active lyric (Spotify-style)
  useEffect(() => {
    if (!isPlaying || audioError || !lyricsContainerRef.current) return;

    const activeIndex = lyrics.findIndex((line) => line.isActive);
    if (activeIndex === -1) return;

    const activeElement = lyricRefs.current[activeIndex];
    if (!activeElement) return;

    const container = lyricsContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const elementRect = activeElement.getBoundingClientRect();

    // Calculate the scroll position to center the active lyric
    const containerCenter = containerRect.height / 2;
    const elementCenter =
      elementRect.top + elementRect.height / 2 - containerRect.top;
    const scrollOffset = elementCenter - containerCenter;

    // Smooth scroll to the calculated position
    container.scrollTo({
      top: container.scrollTop + scrollOffset,
      behavior: "smooth",
    });
  }, [currentTime, isPlaying, audioError, lyrics]);

  // Reset lyrics position when audio stops or errors occur
  useEffect(() => {
    if (!isPlaying || audioError) {
      setCurrentTime(0);
      // Reset scroll position to top
      if (lyricsContainerRef.current) {
        lyricsContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, [isPlaying, audioError]);

  // Cleanup demo interval on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

  // iOS Audio Context initialization
  useEffect(() => {
    const initializeAudioContext = async () => {
      if (isIOS) {
        try {
          // Create a simple audio context
          const AudioContextClass =
            window.AudioContext || window.webkitAudioContext;
          const audioContext = new AudioContextClass();
          audioContextRef.current = audioContext;

          // Resume audio context on user interaction
          const resumeAudioContext = async () => {
            if (audioContext.state === "suspended") {
              await audioContext.resume();
            }

            // Try to unlock iOS audio on any interaction
            if (!iosAudioUnlocked) {
              await unlockIOSAudio();
            }

            // Remove event listeners after first interaction
            document.removeEventListener("touchstart", resumeAudioContext);
            document.removeEventListener("touchend", resumeAudioContext);
            document.removeEventListener("click", resumeAudioContext);
          };

          document.addEventListener("touchstart", resumeAudioContext);
          document.addEventListener("touchend", resumeAudioContext);
          document.addEventListener("click", resumeAudioContext);
        } catch (error) {
          console.warn(`Failed to initialize iOS Audio Context: ${error}`);
        }
      }
    };

    initializeAudioContext();
  }, [isIOS, iosAudioUnlocked, unlockIOSAudio]);

  // iOS-specific: Immediately set error state if no audio URL on iOS
  useEffect(() => {
    if (isIOS && !getAudioUrl()) {
      setAudioError(true);
      setIsLoading(false);
    }
  }, [isIOS, getAudioUrl]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 md:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
              <Image
                src="/images/melodia-logo.jpeg"
                alt="Melodia"
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10 rounded flex-shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg md:text-2xl font-bold truncate">
                  {song.title}
                </h2>
                <p className="text-sm md:text-base text-yellow-100 truncate">
                  {song.artist}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ShareButton
                slug={song.slug}
                title={`${song.title} by Melodia`}
                onShare={() =>
                  trackEngagementEvent.share(
                    song.title,
                    song.slug || "unknown",
                    "native_share"
                  )
                }
                onCopyLink={() =>
                  trackEngagementEvent.copyLink(
                    song.title,
                    song.slug || "unknown"
                  )
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  trackNavigationEvent.click(
                    "close_player",
                    window.location.href,
                    "button"
                  );
                  onClose();
                }}
                className="h-8 w-8 md:h-10 md:w-10 p-0 text-white hover:bg-white/20 rounded-full flex-shrink-0"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="p-4 md:p-6 bg-gray-50">
          <audio
            ref={audioRef}
            src={getAudioUrl() || undefined}
            preload="none"
            playsInline
            webkit-playsinline="true"
            onLoadStart={() => {
              if (getAudioUrl()) {
                setIsLoading(true);
                setAudioError(false);
              }
            }}
            onCanPlay={() => {
              setIsLoading(false);
              setAudioError(false);
            }}
            onError={() => {
              setAudioError(true);
              setIsLoading(false);
            }}
            onLoadedMetadata={() => {
              setIsLoading(false);
              setAudioError(false);
            }}
          />

          {/* Error State */}
          {audioError && (
            <div className="mb-4 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">
                  {isIOS
                    ? "iOS Demo mode: Audio playback may be limited. You can still experience synchronized lyrics by clicking play."
                    : "Demo mode: No audio file available. You can still experience the synchronized lyrics by clicking play."}
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !audioError && (
            <div className="mb-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-700"></div>
                <span className="text-xs md:text-sm">Loading audio...</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 md:gap-4 mb-4 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              disabled={isLoading}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rewind className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </Button>

            <Button
              variant="ghost"
              size="lg"
              onClick={togglePlay}
              disabled={isLoading || isPlayLoading}
              className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPlayLoading ? (
                <div className="flex flex-col items-center justify-center gap-1 text-center">
                  <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent flex-shrink-0"></div>
                  <span className="text-[10px] md:text-xs font-medium leading-none">
                    Loading...
                  </span>
                </div>
              ) : isPlaying ? (
                <Pause className="h-6 w-6 md:h-8 md:w-8" />
              ) : (
                <Play className="h-6 w-6 md:h-8 md:w-8 ml-0.5 md:ml-1" />
              )}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(10)}
              disabled={isLoading}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FastForward className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 40}
              step={1}
              className="w-full"
              disabled={isLoading}
              onValueChange={(value) => {
                const newTime = value[0];
                const previousTime = currentTime;

                // Track seek event
                trackPlayerEvent.seek(
                  song.title,
                  song.slug || "unknown",
                  previousTime,
                  newTime
                );

                if (audioRef.current && !audioError) {
                  audioRef.current.currentTime = newTime;
                  setCurrentTime(newTime);
                } else if (!getAudioUrl() || audioError) {
                  // Handle demo mode
                  setCurrentTime(newTime);
                }
              }}
            />
            <div className="flex justify-between text-xs md:text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration || 40)}</span>
            </div>
          </div>
        </div>

        {/* Lyrics Section - Spotify Style */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          {/* Status indicator */}
          {(!isPlaying || audioError) && (
            <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-100 border-b border-gray-200">
              <div className="flex items-center gap-3 text-sm md:text-base text-gray-600">
                <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                <span className="leading-relaxed">
                  {audioError
                    ? "Demo mode - click play to experience synchronized lyrics"
                    : "Click play to start synchronized lyrics"}
                </span>
              </div>
            </div>
          )}

          {/* Lyrics Container with Spotify-style design */}
          <div
            ref={lyricsContainerRef}
            className="h-64 md:h-80 overflow-y-auto px-6 md:px-12 py-8 md:py-12 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <div className="space-y-8 md:space-y-10">
              {lyrics.map((line, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    lyricRefs.current[index] = el;
                  }}
                  className={`text-center transition-all duration-700 ease-out min-h-[4rem] md:min-h-[4.5rem] flex items-center justify-center relative ${
                    line.isActive
                      ? "text-2xl md:text-3xl font-bold text-yellow-600 transform scale-110"
                      : line.isPast
                      ? "text-base md:text-lg text-gray-400 opacity-60"
                      : "text-base md:text-lg text-gray-500 opacity-80"
                  }`}
                  style={{
                    transform: line.isActive ? "scale(1.1)" : "scale(1)",
                    transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  {/* Active lyric indicator */}
                  {line.isActive && (
                    <div className="absolute -left-5 md:-left-6 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                  )}

                  {/* Progress indicator for active lyric */}
                  {line.isActive && (
                    <div className="absolute -left-6 md:-left-8 top-1/2 transform -translate-y-1/2 w-1 h-8 md:h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
                  )}

                  <span className="px-6 md:px-8 py-3 md:py-4 rounded-lg leading-relaxed">
                    {line.text || "\u00A0"}
                  </span>

                  {/* Subtle glow effect for active lyric */}
                  {line.isActive && (
                    <div className="absolute inset-0 bg-yellow-100 rounded-lg opacity-20 blur-sm"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Bottom padding for better scroll experience */}
            <div className="h-20 md:h-24"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
