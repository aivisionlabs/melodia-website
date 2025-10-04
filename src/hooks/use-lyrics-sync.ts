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
  /**
   * Pixel height of the fixed player controls overlaying the bottom of the viewport.
   * Used to center the active lyric in the actual visible area above the controls.
   */
  controlsHeight?: number;
  /**
   * If provided, use this as the visible viewport height for lyrics instead of
   * measuring the scroll container's clientHeight. Useful when the container
   * itself doesn't constrain height, and we compute available space externally.
   */
  visibleHeight?: number;
}

export const useLyricsSync = ({
  audioUrl,
  lyrics = [],
  onPlay,
  onPause,
  onTimeUpdate,
  controlsHeight = 0,
  visibleHeight,
}: UseLyricsSyncProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [audioError, setAudioError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lyricRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollTimeRef = useRef<number>(0);

  // Convert current time to milliseconds for timestamp comparison
  const currentTimeMs = currentTime * 1000;

  // Get lyrics with active/past states
  const getLyricsWithState = useCallback((): LyricLineWithState[] => {
    const lyricsWithState = lyrics.map((line) => ({
      ...line,
      isActive: currentTimeMs >= line.start && currentTimeMs < line.end,
      isPast: currentTimeMs >= line.end,
    }));

    // Debug logging to help troubleshoot lyrics highlighting
    if (process.env.NODE_ENV === 'development') {
      const activeLyrics = lyricsWithState.filter(line => line.isActive);
      if (activeLyrics.length > 0) {
        console.log('Active lyrics:', activeLyrics.map(line => ({
          text: line.text,
          start: line.start,
          end: line.end,
          currentTimeMs: currentTimeMs
        })));
      }
    }

    return lyricsWithState;
  }, [lyrics, currentTimeMs]);

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
      const newTime = audio.currentTime;
      setCurrentTime(newTime);
      onTimeUpdate?.(newTime);

      // Debug logging to help troubleshoot lyrics highlighting
      if (process.env.NODE_ENV === 'development') {
        console.log('Audio time update:', {
          currentTime: newTime,
          currentTimeMs: newTime * 1000,
          isPlaying: audio.paused === false,
          duration: audio.duration
        });
      }
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
    if (audioError || !lyricsContainerRef.current) return;

    // Calculate lyrics state directly here to avoid dependency issues
    const lyricsWithState = lyrics.map((line) => ({
      ...line,
      isActive: currentTimeMs >= line.start && currentTimeMs < line.end,
      isPast: currentTimeMs >= line.end,
    }));

    const activeIndex = lyricsWithState.findIndex((line) => line.isActive);

    // Debug logging for troubleshooting
    if (process.env.NODE_ENV === 'development') {
      console.log('Auto-scroll debug:', {
        lyricsCount: lyricsWithState.length,
        activeIndex,
        lyricRefsCount: lyricRefs.current.length,
        hasActiveLyric: activeIndex !== -1,
        currentTime,
        currentTimeMs: currentTime * 1000
      });
    }

    if (activeIndex === -1) return;

    const activeElement = lyricRefs.current[activeIndex];
    if (!activeElement) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Active element not found at index:', activeIndex);
      }
      return;
    }

    const container = lyricsContainerRef.current;

    try {
      // Get the element's position within the scrollable container
      const elementOffsetTop = activeElement.offsetTop;
      const elementHeight = activeElement.offsetHeight;
      const containerHeight = container.clientHeight;
      const hasExternalVisible = typeof visibleHeight === 'number' && visibleHeight > 0;
      const effectiveHeight = hasExternalVisible ? visibleHeight as number : containerHeight;

      // Calculate the center position for the element
      const elementCenter = elementOffsetTop + elementHeight / 2;

      // Account for player controls at bottom - center in the visible area above them
      // The player controls are fixed at bottom, so we need to center in the available space
      const playerControlsHeight = Math.max(0, controlsHeight);
      // If visibleHeight is provided, it already excludes controls. Don't subtract twice.
      const availableHeight = Math.max(
        0,
        effectiveHeight - (hasExternalVisible ? 0 : playerControlsHeight)
      );
      // Place the active line slightly above geometric center (like Spotify)
      // so upcoming lines are visible. 0.58 feels balanced on phones.
      const CENTER_BIAS = 0.58;
      const containerCenter = availableHeight * CENTER_BIAS;

      // Calculate the target scroll position to center the element
      const targetScrollTop = elementCenter - containerCenter;

      // Ensure we don't scroll beyond the container bounds
      const maxScrollTop = container.scrollHeight - effectiveHeight;
      const finalScrollTop = Math.max(0, Math.min(targetScrollTop, maxScrollTop));

      // Only scroll if the current position is significantly different
      const currentScrollTop = container.scrollTop;
      const scrollDifference = Math.abs(finalScrollTop - currentScrollTop);

      // Debug logging for centering behavior
      if (process.env.NODE_ENV === 'development') {
        console.log('Auto-scroll calculation:', {
          elementOffsetTop,
          elementHeight,
          containerHeight,
          playerControlsHeight,
          availableHeight,
          elementCenter,
          containerCenter,
          targetScrollTop,
          finalScrollTop,
          currentScrollTop,
          scrollDifference,
          willScroll: scrollDifference > 30,
          activeLyricText: lyricsWithState[activeIndex]?.text
        });
      }

      if (scrollDifference > 30) {
        // Throttle scrolling to prevent excessive calls
        const now = Date.now();
        if (now - lastScrollTimeRef.current > 100) { // Minimum 100ms between scrolls
          container.scrollTo({
            top: finalScrollTop,
            behavior: 'smooth',
          });
          lastScrollTimeRef.current = now;

          if (process.env.NODE_ENV === 'development') {
            console.log('Scrolling to:', finalScrollTop);
          }
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Auto-scroll calculation error:', error);
      }
    }
  }, [currentTime, audioError, lyrics, currentTimeMs, controlsHeight, visibleHeight]);

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


