import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

interface PlaybackState {
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  isLoading: boolean;
  audioElement: HTMLAudioElement | null;
}

interface UseStreamingPlaybackOptions {
  /** Callback when playback state changes */
  onPlaybackChange?: (variantId: string, state: PlaybackState) => void;
  /** Callback when duration becomes available */
  onDurationAvailable?: (variantId: string, duration: number) => void;
}

interface UseStreamingPlaybackReturn {
  /** Get current playback state for a variant */
  getPlaybackState: (variantId: string) => PlaybackState;
  /** Update playback state for a variant */
  updatePlaybackState: (variantId: string, updates: Partial<PlaybackState>) => void;
  /** Start/stop playback for a variant */
  togglePlayback: (variantId: string, streamAudioUrl: string) => void;
  /** Seek to a specific time */
  seekTo: (variantId: string, time: number) => void;
  /** Update duration when it becomes available */
  updateDuration: (variantId: string, duration: number) => void;
  /** Clean up all audio elements */
  cleanup: () => void;
}

/**
 * Custom hook for managing streaming audio playback with seamless duration updates
 *
 * Features:
 * - Maintains playback state across duration updates
 * - Preserves current playback position when duration becomes available
 * - Handles multiple variants simultaneously
 * - Automatic cleanup of audio elements
 */
export function useStreamingPlayback(
  options: UseStreamingPlaybackOptions = {}
): UseStreamingPlaybackReturn {
  const { onPlaybackChange, onDurationAvailable } = options;

  // State for all variants
  const [playbackStates, setPlaybackStates] = useState<{
    [variantId: string]: PlaybackState;
  }>({});

  // Refs for audio elements
  const audioElementsRef = useRef<{ [variantId: string]: HTMLAudioElement }>({});
  const playbackTimestampsRef = useRef<{ [variantId: string]: number }>({});

  // Stable default state to prevent unnecessary re-renders
  const defaultPlaybackState: PlaybackState = useMemo(() => ({
    currentTime: 0,
    duration: 0,
    isPlaying: false,
    isLoading: false,
    audioElement: null,
  }), []);

  /**
   * Get current playback state for a variant
   */
  const getPlaybackState = useCallback((variantId: string): PlaybackState => {
    const state = playbackStates[variantId];
    if (state) {
      return state;
    }

    return defaultPlaybackState;
  }, [playbackStates, defaultPlaybackState]);

  /**
   * Update playback state for a variant
   */
  const updatePlaybackState = useCallback((
    variantId: string,
    updates: Partial<PlaybackState>
  ) => {
    setPlaybackStates(prev => {
      const currentState = prev[variantId] || defaultPlaybackState;

      const newState = { ...currentState, ...updates };

      // Notify callback
      onPlaybackChange?.(variantId, newState);

      return {
        ...prev,
        [variantId]: newState,
      };
    });
  }, [onPlaybackChange, defaultPlaybackState]);

  /**
   * Create or get audio element for a variant
   */
  const getOrCreateAudioElement = useCallback((variantId: string): HTMLAudioElement => {
    if (!audioElementsRef.current[variantId]) {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.crossOrigin = 'anonymous';

      // Store reference
      audioElementsRef.current[variantId] = audio;

      // Set up event listeners
      audio.addEventListener('loadstart', () => {
        updatePlaybackState(variantId, { isLoading: true });
      });

      audio.addEventListener('canplay', () => {
        updatePlaybackState(variantId, { isLoading: false });
      });

      audio.addEventListener('timeupdate', () => {
        const currentTime = audio.currentTime;
        updatePlaybackState(variantId, { currentTime });

        // Store timestamp for duration updates
        playbackTimestampsRef.current[variantId] = currentTime;
      });

      audio.addEventListener('durationchange', () => {
        const duration = audio.duration;
        if (duration && !isNaN(duration) && isFinite(duration)) {
          updatePlaybackState(variantId, { duration });
          onDurationAvailable?.(variantId, duration);
        }
      });

      audio.addEventListener('play', () => {
        updatePlaybackState(variantId, { isPlaying: true });
      });

      audio.addEventListener('pause', () => {
        updatePlaybackState(variantId, { isPlaying: false });
      });

      audio.addEventListener('ended', () => {
        updatePlaybackState(variantId, {
          isPlaying: false,
          currentTime: 0
        });
      });

      audio.addEventListener('error', (e) => {
        console.error(`Audio error for variant ${variantId}:`, e);
        updatePlaybackState(variantId, {
          isLoading: false,
          isPlaying: false
        });
      });
    }

    return audioElementsRef.current[variantId];
  }, [updatePlaybackState, onDurationAvailable]);

  /**
   * Start/stop playback for a variant
   */
  const togglePlayback = useCallback((
    variantId: string,
    streamAudioUrl: string
  ) => {
    const audio = getOrCreateAudioElement(variantId);
    const currentState = getPlaybackState(variantId);

    // Update audio element reference in state
    updatePlaybackState(variantId, { audioElement: audio });

    if (currentState.isPlaying) {
      // Pause playback
      audio.pause();
    } else {
      // Start playback
      if (audio.src !== streamAudioUrl) {
        audio.src = streamAudioUrl;
      }

      // If we have a stored timestamp, seek to that position
      const storedTimestamp = playbackTimestampsRef.current[variantId];
      if (storedTimestamp && storedTimestamp > 0) {
        audio.currentTime = storedTimestamp;
      }

      audio.play().catch(error => {
        console.error(`Failed to play audio for variant ${variantId}:`, error);
        updatePlaybackState(variantId, {
          isLoading: false,
          isPlaying: false
        });
      });
    }
  }, [getOrCreateAudioElement, getPlaybackState, updatePlaybackState]);

  /**
   * Seek to a specific time
   */
  const seekTo = useCallback((variantId: string, time: number) => {
    const audio = audioElementsRef.current[variantId];
    if (audio) {
      audio.currentTime = time;
      updatePlaybackState(variantId, { currentTime: time });
      playbackTimestampsRef.current[variantId] = time;
    }
  }, [updatePlaybackState]);

  /**
   * Update duration when it becomes available from external source
   */
  const updateDuration = useCallback((variantId: string, duration: number) => {
    const currentState = getPlaybackState(variantId);

    // Only update if duration is valid and different
    if (duration > 0 && duration !== currentState.duration) {
      updatePlaybackState(variantId, { duration });
      onDurationAvailable?.(variantId, duration);
    }
  }, [getPlaybackState, updatePlaybackState, onDurationAvailable]);

  /**
   * Clean up all audio elements
   */
  const cleanup = useCallback(() => {
    Object.values(audioElementsRef.current).forEach(audio => {
      audio.pause();
      audio.src = '';
      audio.remove();
    });

    audioElementsRef.current = {};
    playbackTimestampsRef.current = {};
    setPlaybackStates({});
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    getPlaybackState,
    updatePlaybackState,
    togglePlayback,
    seekTo,
    updateDuration,
    cleanup,
  };
}
