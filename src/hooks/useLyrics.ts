"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface LyricLine {
  index: number;
  text: string;
  start: number;
  end: number;
  isActive?: boolean;
  isPast?: boolean;
}

interface LyricsData {
  timestamp_lyrics?: LyricLine[];
  timestamped_lyrics_variants?: { [variantIndex: number]: LyricLine[] };
  selected_variant?: number;
  plain_lyrics?: string;
}

interface Song {
  title: string;
  artist: string;
  audioUrl?: string;
  song_url?: string;
  videoUrl?: string;
  lyrics?: LyricLine[] | string | null;
  timestamp_lyrics?: LyricLine[];
  timestamped_lyrics_variants?: {
    [variantIndex: number]: LyricLine[];
  } | null;
  selected_variant?: number;
  slug?: string;
  show_lyrics?: boolean;
  plain_lyrics?: string | null;
  likes_count?: number;
}

interface LyricsState {
  lyrics: LyricLine[];
  isLoadingLyrics: boolean;
  fetchedLyrics: LyricsData | null;
  showLyricsViewer: boolean;
}

interface LyricsActions {
  setShowLyricsViewer: (show: boolean) => void;
  hasLyrics: () => boolean;
  getLyricsData: () => string | null;
  lyricsContainerRef: React.RefObject<HTMLDivElement | null>;
  lyricRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  shouldShowLyrics: boolean;
}

interface UseLyricsOptions {
  song: Song;
  currentTimeMs: number;
  isPlaying: boolean;
  audioError: boolean;
}

export function useLyrics({
  song,
  currentTimeMs,
  isPlaying,
  audioError,
}: UseLyricsOptions): LyricsState & LyricsActions {
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false);
  const [showLyricsViewer, setShowLyricsViewer] = useState(false);
  const [fetchedLyrics, setFetchedLyrics] = useState<LyricsData | null>(null);

  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const lyricRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper function to check if lyrics should be shown
  const shouldShowLyrics = song.show_lyrics !== false; // Default to true if undefined

  // Helper function to check if lyrics are available
  const hasLyrics = useCallback(() => {
    const plainLyrics = song.plain_lyrics || fetchedLyrics?.plain_lyrics;
    return (
      plainLyrics !== null &&
      typeof plainLyrics === "string" &&
      plainLyrics.trim().length > 0
    );
  }, [song.plain_lyrics, fetchedLyrics?.plain_lyrics]);

  // Helper function to get lyrics data
  const getLyricsData = useCallback(() => {
    // If show_lyrics is false, only use the plain lyrics field
    if (song.show_lyrics === false) {
      return song.lyrics as string | null;
    }
    // If show_lyrics is true or undefined, use the plain lyrics field as well
    return song.plain_lyrics || fetchedLyrics?.plain_lyrics || null;
  }, [song.lyrics, song.show_lyrics, song.plain_lyrics, fetchedLyrics?.plain_lyrics]);

  // Function to fetch lyrics for library songs
  const fetchSongLyrics = useCallback(async () => {
    // Only fetch if we don't have timestamp lyrics and we have a slug
    if (
      song.timestamp_lyrics ||
      song.timestamped_lyrics_variants ||
      !song.slug
    ) {
      return;
    }

    try {
      setIsLoadingLyrics(true);
      const response = await fetch(`/api/song-lyrics/${song.slug}`);
      const data = await response.json();

      if (data.success && data.song) {
        setFetchedLyrics({
          timestamp_lyrics: data.song.timestamp_lyrics,
          timestamped_lyrics_variants: data.song.timestamped_lyrics_variants,
          selected_variant: data.song.selected_variant,
          plain_lyrics: data.song.lyrics,
        });
      }
    } catch (error) {
      console.warn("Failed to fetch song lyrics:", error);
    } finally {
      setIsLoadingLyrics(false);
    }
  }, [song.slug, song.timestamp_lyrics, song.timestamped_lyrics_variants]);

  // Fetch lyrics when component mounts
  useEffect(() => {
    fetchSongLyrics();
  }, [fetchSongLyrics]);

  const getLyricsAtTime = (timeMs: number) => {
    // If we're loading lyrics, return loading state
    if (isLoadingLyrics) {
      return [
        {
          index: 0,
          text: "Loading lyrics...",
          start: 0,
          end: 1000,
          isActive: true,
          isPast: false,
        },
      ];
    }

    // Priority 1: Use timestamp_lyrics (final variation) if available
    const timestampLyrics =
      song.timestamp_lyrics || fetchedLyrics?.timestamp_lyrics;
    if (timestampLyrics && timestampLyrics.length > 0) {
      return timestampLyrics.map((line: any) => ({
        ...line,
        isActive: timeMs >= line.start && timeMs < line.end,
        isPast: timeMs >= line.end,
      }));
    }

    // Priority 2: Use timestamped lyrics variants if available (fallback)
    const timestampedVariants =
      song.timestamped_lyrics_variants ||
      fetchedLyrics?.timestamped_lyrics_variants;
    if (timestampedVariants) {
      // If no selected_variant is set, default to variant 0
      const selectedVariant =
        song.selected_variant !== undefined
          ? song.selected_variant
          : fetchedLyrics?.selected_variant !== undefined
            ? fetchedLyrics.selected_variant
            : 0;
      let selectedVariantLyrics = timestampedVariants[selectedVariant];

      // If the default variant doesn't exist, try to find any available variant
      if (!selectedVariantLyrics || selectedVariantLyrics.length === 0) {
        const availableVariants = Object.keys(timestampedVariants);
        if (availableVariants.length > 0) {
          const firstVariant = parseInt(availableVariants[0]);
          selectedVariantLyrics = timestampedVariants[firstVariant];
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
    if (song.lyrics && Array.isArray(song.lyrics) && song.lyrics.length > 0) {
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
  }, [currentTimeMs, isPlaying, audioError, lyrics]);

  // Reset lyrics position when audio stops or errors occur
  useEffect(() => {
    if (!isPlaying || audioError) {
      // Reset scroll position to top
      if (lyricsContainerRef.current) {
        lyricsContainerRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    }
  }, [isPlaying, audioError]);

  return {
    // State
    lyrics,
    isLoadingLyrics,
    fetchedLyrics,
    showLyricsViewer,
    // Actions
    setShowLyricsViewer,
    hasLyrics,
    getLyricsData,
    // Refs for components to use
    lyricsContainerRef,
    lyricRefs,
    // Helper
    shouldShowLyrics,
  };
}
