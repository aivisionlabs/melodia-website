import { useState, useRef, useEffect, useCallback } from 'react';
import { LyricLine } from '@/types';

interface LyricLineWithState extends LyricLine {
  isActive: boolean;
  isPast: boolean;
  isSection?: boolean;
}

interface UseLyricsSyncProps {
  audioUrl?: string | null;
  lyrics?: LyricLine[];
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (time: number) => void;
}

export const useLyricsSync = ({
  audioUrl,
  lyrics = [],
  onPlay,
  onPause,
  onTimeUpdate,
}: UseLyricsSyncProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lyricRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Convert current time to milliseconds for timestamp comparison
  const currentTimeMs = currentTime * 1000;

  // Get lyrics with active/past states
  const getLyricsWithState = useCallback((): LyricLineWithState[] => {
    return lyrics.map((line) => ({
      ...line,
      isActive: isPlaying && currentTimeMs >= line.start && currentTimeMs < line.end,
      isPast: isPlaying && currentTimeMs >= line.end,
    }));
  }, [lyrics, isPlaying, currentTimeMs]);

  // Handle audio loading and errors
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setIsLoading(false);
    setAudioError(false);

    const handleCanPlay = () => {
      setIsLoading(false);
      setAudioError(false);
    };

    const handleError = () => {
      console.warn('Audio file not available or failed to load.');
      setIsLoading(false);
      setAudioError(true);
    };

    const handleLoadStart = () => {
      if (audioUrl) {
        setIsLoading(true);
        setAudioError(false);
      }
    };

    const handleLoadedMetadata = () => {
      setIsLoading(false);
      setAudioError(false);
    };

    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [audioUrl]);

  // Update time and duration
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
      onTimeUpdate?.(audio.currentTime);
    };
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [onTimeUpdate]);

  // Auto-scroll to active lyric (Spotify-style)
  useEffect(() => {
    if (!isPlaying || audioError || !lyricsContainerRef.current) return;

    const lyricsWithState = getLyricsWithState();
    const activeIndex = lyricsWithState.findIndex((line) => line.isActive);
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
      behavior: 'smooth',
    });
  }, [currentTime, isPlaying, audioError, getLyricsWithState]);

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current;

    if (isPlaying) {
      if (audio) {
        audio.pause();
      }
      setIsPlaying(false);
      onPause?.();
    } else {
      if (!audioUrl || audioError) {
        // No audio available
        setIsPlaying(false);
        return;
      }

      if (audio) {
        try {
          await audio.play();
          setIsPlaying(true);
          setAudioError(false);
          onPlay?.();
        } catch (error) {
          console.warn('Error playing audio:', error);
          setAudioError(true);
        }
      }
    }
  }, [isPlaying, audioUrl, audioError, onPlay, onPause]);

  const skipTime = useCallback(
    (seconds: number) => {
      const audio = audioRef.current;
      if (audio && !audioError) {
        const newTime = Math.max(
          0,
          Math.min(audio.currentTime + seconds, duration || Infinity)
        );
        audio.currentTime = newTime;
        setCurrentTime(newTime);
      }
    },
    [audioError, duration]
  );

  const seekTo = useCallback(
    (time: number) => {
      const audio = audioRef.current;
      if (audio && !audioError) {
        audio.currentTime = time;
        setCurrentTime(time);
      }
    },
    [audioError]
  );

  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    // State
    isPlaying,
    currentTime,
    duration,
    audioError,
    isLoading,
    currentTimeMs,

    // Refs
    audioRef,
    lyricsContainerRef,
    lyricRefs,

    // Methods
    togglePlay,
    skipTime,
    seekTo,
    formatTime,
    getLyricsWithState,
  };
};


