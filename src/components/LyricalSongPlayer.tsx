"use client";

import React from "react";
import {
  ChevronLeft,
  Download,
  Share2,
  Play,
  Pause,
  Rewind,
  FastForward,
  X,
} from "lucide-react";
import { useLyricsSync } from "@/hooks/use-lyrics-sync";
import { LyricLine } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { Slider } from "@/components/ui/slider";
import SynchronizedLyricsDisplay from "@/components/SynchronizedLyricsDisplay";
import StaticLyricsDisplay from "@/components/StaticLyricsDisplay";

interface LyricalSongPlayerProps {
  songTitle: string;
  artistName?: string;
  audioUrl?: string | null;
  lyrics: LyricLine[];
  rawLyricsText?: string; // Raw lyrics text for non-English songs
  language?: string; // Language of the lyrics
  imageUrl?: string;
  showDownload?: boolean;
  showShare?: boolean;
  isPublic?: boolean;
  onBack?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onRequestPublicAccess?: () => void;
  mode?: "page" | "modal";
  onClose?: () => void;
}

// Parse raw lyrics text into sections and lines for static display
function parseRawLyricsText(lyricsText: string) {
  const lines = lyricsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return lines.map((line, index) => {
    // Check if it's a section header (e.g., "(Verse 1)", "(Chorus)")
    const isSection = /^\([^)]+\)\s*$/.test(line);

    return {
      text: line,
      isSection,
      index,
    };
  });
}

export default function LyricalSongPlayer({
  songTitle,
  artistName = "Melodia",
  audioUrl,
  lyrics,
  rawLyricsText,
  language = "English",
  imageUrl = "/images/melodia-logo.png",
  showDownload = false,
  showShare = true,
  isPublic = false,
  onBack,
  onDownload,
  onShare,
  onRequestPublicAccess,
  mode = "page",
  onClose,
}: LyricalSongPlayerProps) {
  const [controlsHeight, setControlsHeight] = React.useState<number>(0);
  const controlsRef = React.useRef<HTMLDivElement>(null);

  // Defensive programming: filter out invalid lyrics entries
  const validLyrics = lyrics.filter(
    (line) =>
      line &&
      typeof line === "object" &&
      typeof line.text === "string" &&
      typeof line.start === "number" &&
      typeof line.end === "number" &&
      typeof line.index === "number"
  );

  // Determine if we should show synchronized lyrics or static lyrics
  const isEnglish = language.toLowerCase() === "english";
  const shouldShowStaticLyrics = !isEnglish && rawLyricsText;

  // Compute visible height for lyrics area (viewport height minus header and controls)
  const visibleLyricsHeight = React.useMemo(() => {
    if (typeof window === "undefined") return undefined;
    const viewportH = window.innerHeight || 0;
    // Simple header: p-4 (~56px), keep conservative 60
    const headerApprox = 60;
    const topPadding = 32; // our top spacer
    const effective = viewportH - headerApprox - controlsHeight - topPadding;
    return effective > 0 ? Math.round(effective) : undefined;
  }, [controlsHeight]);

  const {
    isPlaying,
    currentTime,
    duration,
    audioError,
    isLoading,
    audioRef,
    lyricsContainerRef,
    lyricRefs,
    togglePlay,
    skipTime,
    seekTo,
    formatTime,
    getLyricsWithState,
  } = useLyricsSync({
    audioUrl,
    lyrics: shouldShowStaticLyrics ? [] : validLyrics, // Only pass synchronized lyrics for English
    controlsHeight,
    visibleHeight: visibleLyricsHeight,
  });

  const lyricsWithState = shouldShowStaticLyrics ? [] : getLyricsWithState();

  // Measure controls height on mount and when layout changes
  React.useEffect(() => {
    const node = controlsRef.current;
    const updateHeight = () => {
      const h = node?.getBoundingClientRect().height || 0;
      setControlsHeight(Math.round(h));
    };
    updateHeight();
    // Resize observer for dynamic layout changes
    let resizeObserver: any = null;
    const RO: any = (window as any).ResizeObserver;
    if (RO) {
      resizeObserver = new RO(() => updateHeight());
      if (node) {
        resizeObserver.observe(node);
      }
    }
    window.addEventListener("resize", updateHeight);
    return () => {
      window.removeEventListener("resize", updateHeight);
      if (resizeObserver && node) resizeObserver.unobserve(node);
    };
  }, []);

  const handleShareClick = () => {
    if (!isPublic && onRequestPublicAccess) {
      onRequestPublicAccess();
    } else if (onShare) {
      onShare();
    }
  };

  const Container = mode === "modal" ? "div" : React.Fragment;
  const containerProps =
    mode === "modal"
      ? {
          className:
            "fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4",
        }
      : {};

  return (
    <Container {...(mode === "modal" ? containerProps : {})}>
      <div
        className={cn(
          "bg-gradient-to-b from-white to-neutral-50 flex flex-col",
          mode === "modal"
            ? "rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-hidden"
            : "min-h-screen"
        )}
      >
        {/* Simple Header */}
        <div className="bg-white border-b border-neutral-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left: Back/Close button */}
            {mode === "page" && onBack ? (
              <button
                onClick={onBack}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-neutral-700" />
              </button>
            ) : mode === "modal" && onClose ? (
              <button
                onClick={onClose}
                className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-neutral-700" />
              </button>
            ) : (
              <div className="w-10" />
            )}

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2">
              {showShare && (
                <button
                  onClick={handleShareClick}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title={!isPublic ? "Request public access to share" : "Share"}
                >
                  <Share2 className="w-5 h-5 text-neutral-700" />
                </button>
              )}
              {showDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
                  title="Download song"
                >
                  <Download className="w-5 h-5 text-neutral-700" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 flex flex-col overflow-hidden",
            mode === "page" ? "pb-44 md:pb-40" : ""
          )}
        >
          {/* Lyrics Section */}
          <div className="flex-1 overflow-hidden relative">
            <div
              ref={lyricsContainerRef}
              className="h-full overflow-y-auto px-6 md:px-12 py-8 md:py-12 scroll-smooth [&::-webkit-scrollbar]:hidden"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                // Constrain height to computed visible height if available
                maxHeight: visibleLyricsHeight
                  ? visibleLyricsHeight
                  : undefined,
              }}
            >
              {/* Top padding to ensure first lyrics are centered */}
              <div className="h-24 md:h-32"></div>

              {/* Lyrics Display */}
              {shouldShowStaticLyrics ? (
                <StaticLyricsDisplay
                  lyrics={
                    rawLyricsText ? parseRawLyricsText(rawLyricsText) : []
                  }
                  lyricRefs={lyricRefs}
                />
              ) : (
                <SynchronizedLyricsDisplay
                  lyrics={lyricsWithState}
                  lyricRefs={lyricRefs}
                  seekTo={seekTo}
                />
              )}

              {/* Bottom padding equals measured controls height + buffer */}
              <div style={{ height: Math.max(controlsHeight + 40, 120) }}></div>
            </div>

            {/* Gradient overlays */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white to-transparent pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Player Controls - Fixed at bottom when in page mode */}
        <div
          ref={controlsRef}
          className={cn(
            "bg-white border-t border-neutral-200 p-4 md:p-6",
            mode === "page"
              ? "fixed bottom-0 left-0 right-0 z-40 shadow-lg"
              : "flex-shrink-0"
          )}
        >
          <audio
            ref={audioRef}
            src={audioUrl || undefined}
            preload="metadata"
            onLoadStart={() => {
              if (audioUrl) {
                // Loading handled in hook
              }
            }}
          />

          {/* Error State */}
          {audioError && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm font-body text-center">
              Audio unavailable. Lyrics display only.
            </div>
          )}

          {/* Album Art + Time Display */}
          <div className="flex items-center gap-4 mb-4">
            {/* Album art */}
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-melodia-yellow to-melodia-yellow/80 p-1 rounded-lg border-2 border-melodia-yellow/30 flex-shrink-0">
              <div className="w-full h-full bg-white rounded overflow-hidden">
                <Image
                  src={imageUrl}
                  alt={songTitle}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/images/melodia-logo.png";
                  }}
                />
              </div>
            </div>

            {/* Song info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-lg md:text-xl font-heading font-bold text-melodia-teal truncate">
                {songTitle}
              </h3>
              <p className="text-sm md:text-base font-body text-gray-600 truncate">
                {artistName}
              </p>
            </div>

            {/* Time display */}
            <div className="text-sm md:text-base font-body text-gray-600 text-right flex-shrink-0">
              <span>{formatTime(currentTime)}</span>
              <span className="text-gray-400 mx-1">/</span>
              <span>{formatTime(duration || 0)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={0.1}
              className="w-full"
              disabled={isLoading || !audioUrl}
              onValueChange={(value) => {
                seekTo(value[0]);
              }}
            />
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-4 md:gap-6">
            <button
              onClick={() => skipTime(-10)}
              disabled={isLoading || !audioUrl}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Rewind className="w-6 h-6 text-melodia-teal" />
            </button>

            <button
              onClick={togglePlay}
              disabled={isLoading || !audioUrl}
              className="w-16 h-16 md:w-20 md:h-20 bg-melodia-yellow hover:bg-melodia-yellow/90 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-melodia-teal border-t-transparent"></div>
              ) : isPlaying ? (
                <Pause className="w-8 h-8 md:w-10 md:h-10 text-melodia-teal" />
              ) : (
                <Play className="w-8 h-8 md:w-10 md:h-10 text-melodia-teal ml-1" />
              )}
            </button>

            <button
              onClick={() => skipTime(10)}
              disabled={isLoading || !audioUrl}
              className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FastForward className="w-6 h-6 text-melodia-teal" />
            </button>
          </div>
        </div>
      </div>
    </Container>
  );
}
