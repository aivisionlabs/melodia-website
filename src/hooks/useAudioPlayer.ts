"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { trackPlayerEvent } from "@/lib/analytics";
import { useIOSAudio } from "./useIOSAudio";

interface AudioPlayerState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  audioError: boolean;
  isLoading: boolean;
  isPlayLoading: boolean;
}

interface AudioPlayerActions {
  togglePlay: () => Promise<void>;
  skipTime: (seconds: number) => void;
  seekTo: (time: number) => void;
  formatTime: (time: number) => string;
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

interface UseAudioPlayerOptions {
  audioUrl?: string;
  songTitle: string;
  songId: string;
  onPlay?: () => void;
  onPause?: () => void;
  onError?: (error: string) => void;
}

export function useAudioPlayer({
  audioUrl,
  songTitle,
  songId,
  onPlay,
  onPause,
  onError,
}: UseAudioPlayerOptions): AudioPlayerState & AudioPlayerActions {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPlayLoading, setIsPlayLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { isIOS, iosAudioUnlocked, unlockIOSAudio } = useIOSAudio();

  // Helper function to get the correct audio URL
  const getAudioUrl = useCallback(() => {
    return audioUrl;
  }, [audioUrl]);

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
      onPause?.();

      // Track pause event
      trackPlayerEvent.pause(songTitle, songId, currentTime);
    } else {
      // If no audio URL or audio error, simulate playing for demo
      if (!getAudioUrl() || audioError) {
        setIsPlaying(true);
        onPlay?.();
        // Track demo play event
        trackPlayerEvent.play(songTitle, songId, true);

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
              trackPlayerEvent.audioEnd(songTitle, songId, 40);
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
              onPlay?.();
              // Track play event
              trackPlayerEvent.play(songTitle, songId, false);
            }
          } catch (error) {
            console.warn("Error playing audio:", error);
            setAudioError(true);
            setIsPlayLoading(false);
            onError?.("play_error");
            // Track audio error
            trackPlayerEvent.audioError(songTitle, songId, "play_error");
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
        trackPlayerEvent.skipForward(songTitle, songId, seconds);
      } else {
        trackPlayerEvent.skipBackward(songTitle, songId, Math.abs(seconds));
      }
    } else if (!getAudioUrl() || audioError) {
      // Handle demo mode
      const newTime = Math.max(0, Math.min(currentTime + seconds, 40));
      setCurrentTime(newTime);

      // Track skip event in demo mode
      if (seconds > 0) {
        trackPlayerEvent.skipForward(songTitle, songId, seconds);
      } else {
        trackPlayerEvent.skipBackward(songTitle, songId, Math.abs(seconds));
      }
    }
  };

  const seekTo = (time: number) => {
    const previousTime = currentTime;

    // Track seek event
    trackPlayerEvent.seek(songTitle, songId, previousTime, time);

    if (audioRef.current && !audioError) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    } else if (!getAudioUrl() || audioError) {
      // Handle demo mode
      setCurrentTime(time);
    }
  };

  // iOS-specific: Immediately set error state if no audio URL on iOS
  useEffect(() => {
    if (isIOS && !getAudioUrl()) {
      setAudioError(true);
      setIsLoading(false);
    }
  }, [isIOS, getAudioUrl]);

  // Cleanup demo interval on unmount
  useEffect(() => {
    return () => {
      if (demoIntervalRef.current) {
        clearInterval(demoIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    audioError,
    isLoading,
    isPlayLoading,
    // Actions
    togglePlay,
    skipTime,
    seekTo,
    formatTime,
    // Refs for components to use
    audioRef,
  };
}
