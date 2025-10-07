"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Play,
  Pause,
  Download,
  Share2,
  FileText,
  Check,
  Rewind,
  FastForward,
} from "lucide-react";
import { SongVariant } from "@/lib/song-status-client";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SongPlayerCardProps {
  variant: SongVariant;
  variantIndex: number;
  variantLabel?: string; // Customizable label (e.g., "Song Option 1", "Completed")
  showSharing?: boolean;
  showEmailInput?: boolean;
  sharePublicly?: boolean;
  emailInput?: string;
  onPlayPause: () => void;
  onDownload?: (audioUrl: string, title: string) => void;
  onShareToggle?: (variantId: string) => void;
  onEmailChange?: (variantId: string, email: string) => void;
  onSendEmail?: (variantId: string) => void;
  onSeek?: (time: number) => void;
  onSkipBackward?: () => void;
  onSkipForward?: () => void;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  isSelected?: boolean;
  isPermanentlySelected?: boolean;
  showLyricalSongButton?: boolean;
  onViewLyricalSong?: () => void;
}

// Memoized Album Art Component to prevent unnecessary re-renders
const AlbumArt = React.memo(
  ({
    imageUrl,
    title,
    className,
  }: {
    imageUrl: string;
    title: string;
    className?: string;
  }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    // Memoize the fallback URL to prevent unnecessary changes
    const fallbackUrl = useMemo(() => "/images/melodia-logo.png", []);

    // Memoize the final image URL to prevent unnecessary re-renders
    const finalImageUrl = useMemo(() => {
      if (imageError || !imageUrl) return fallbackUrl;
      return imageUrl;
    }, [imageUrl, imageError, fallbackUrl]);

    const handleImageLoad = useCallback(() => {
      setImageLoading(false);
    }, []);

    const handleImageError = useCallback(() => {
      setImageError(true);
      setImageLoading(false);
    }, []);

    return (
      <div
        className={cn(
          "w-full h-full bg-white rounded overflow-hidden relative",
          className
        )}
      >
        {imageLoading && (
          <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        <Image
          src={finalImageUrl}
          alt={`${title} album art`}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          onLoad={handleImageLoad}
          onError={handleImageError}
          priority={false}
          loading="lazy"
          unoptimized={false}
        />
      </div>
    );
  }
);

AlbumArt.displayName = "AlbumArt";

// Reusable Play Controls Component
interface PlayControlsProps {
  onPlayPause: () => void;
  onSkipBackward: () => void;
  onSkipForward: () => void;
  onSeek?: (time: number) => void;
  isPlaying: boolean;
  isLoading: boolean;
  duration: number;
  streamAudioUrl: string;
  variantStatus: string;
  showStatusText?: boolean;
  statusText?: string;
  showDownloadButton?: boolean;
  downloadUrl?: string;
  onDownload?: () => void;
}

function PlayControls({
  onPlayPause,
  onSkipBackward,
  onSkipForward,
  onSeek,
  isPlaying,
  isLoading,
  duration,
  streamAudioUrl,
  variantStatus,
  showStatusText = false,
  statusText,
  showDownloadButton = false,
  downloadUrl,
  onDownload,
}: PlayControlsProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onSkipBackward}
          disabled={
            !onSeek ||
            duration === 0 ||
            (variantStatus !== "STREAM_READY" &&
              variantStatus !== "DOWNLOAD_READY")
          }
          className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Skip backward 15 seconds"
        >
          <Rewind className="w-6 h-6 text-melodia-teal" />
        </button>
        <button
          onClick={onPlayPause}
          disabled={isLoading || !streamAudioUrl}
          className="w-16 h-16 bg-melodia-yellow hover:bg-melodia-yellow/90 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-3 border-melodia-teal border-t-transparent"></div>
          ) : isPlaying ? (
            <Pause className="w-8 h-8 text-melodia-teal" />
          ) : (
            <Play className="w-8 h-8 text-melodia-teal ml-1" />
          )}
        </button>
        <button
          onClick={onSkipForward}
          disabled={
            !onSeek ||
            duration === 0 ||
            (variantStatus !== "STREAM_READY" &&
              variantStatus !== "DOWNLOAD_READY")
          }
          className="p-3 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          title="Skip forward 15 seconds"
        >
          <FastForward className="w-6 h-6 text-melodia-teal" />
        </button>
      </div>

      {/* Right side: Download button or Status text */}
      {showDownloadButton && downloadUrl && onDownload ? (
        <button
          onClick={onDownload}
          className="w-12 h-12 bg-melodia-coral text-white rounded-full hover:bg-melodia-coral/90 transition-colors flex items-center justify-center"
          title="Download"
        >
          <Download className="w-5 h-5" />
        </button>
      ) : showStatusText ? (
        <div className="text-sm font-body text-gray-500">{statusText}</div>
      ) : null}
    </div>
  );
}

const SongPlayerCard = React.memo(function SongPlayerCard({
  variant,
  variantIndex,
  variantLabel = `Song Option ${variantIndex + 1}`,
  showSharing = false,
  showEmailInput = false,
  sharePublicly = false,
  emailInput = "",
  onPlayPause,
  onDownload,
  onShareToggle,
  onEmailChange,
  onSendEmail,
  onSeek,
  onSkipBackward,
  onSkipForward,
  isPlaying,
  isLoading,
  currentTime,
  duration,
  isSelected = false,
  isPermanentlySelected = false,
  showLyricalSongButton = false,
  onViewLyricalSong,
}: SongPlayerCardProps) {
  // Memoize expensive calculations
  const formatTime = useCallback((time: number) => {
    if (time === 0) return "0:00";
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, []);

  const handlePlayPause = useCallback(() => {
    onPlayPause();
  }, [onPlayPause]);

  const handleDownloadClick = useCallback(() => {
    const audioUrl = variant.audioUrl || variant.sourceAudioUrl || "";
    if (audioUrl && onDownload) {
      onDownload(audioUrl, variant.title);
    }
  }, [variant.audioUrl, variant.sourceAudioUrl, variant.title, onDownload]);

  // Memoize derived values
  const streamAudioUrl = useMemo(() => {
    return variant.sourceStreamAudioUrl || variant.streamAudioUrl || "";
  }, [variant.sourceStreamAudioUrl, variant.streamAudioUrl]);

  const downloadUrl = useMemo(() => {
    return variant.audioUrl || variant.sourceAudioUrl || "";
  }, [variant.audioUrl, variant.sourceAudioUrl]);

  const progress = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  const statusText = useMemo(() => {
    switch (variant.variantStatus) {
      case "DOWNLOAD_READY":
        return "Ready to download";
      case "STREAM_READY":
        return "Preparing download...";
      case "PENDING":
        return "Generating...";
      default:
        return "Generating...";
    }
  }, [variant.variantStatus]);

  // Seekbar functionality
  const seekbarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSeekbarClick = useCallback(
    (clientX: number) => {
      if (!seekbarRef.current || !onSeek || duration === 0) return;

      const rect = seekbarRef.current.getBoundingClientRect();
      const clickX = clientX - rect.left;
      const percentage = clickX / rect.width;
      const newTime = percentage * duration;

      onSeek(Math.max(0, Math.min(newTime, duration)));
    },
    [onSeek, duration]
  );

  const handleSeekbarMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    handleSeekbarClick(e.clientX);
  };

  const handleSeekbarMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    handleSeekbarClick(e.clientX);
  };

  const handleSeekbarMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile
  const handleSeekbarTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    const touch = e.touches[0];
    handleSeekbarClick(touch.clientX);
  };

  const handleSeekbarTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    handleSeekbarClick(touch.clientX);
  };

  const handleSeekbarTouchEnd = () => {
    setIsDragging(false);
  };

  // Global touch event handling for mobile drag
  useEffect(() => {
    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        handleSeekbarClick(e.touches[0].clientX);
      }
    };

    const handleGlobalTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("touchmove", handleGlobalTouchMove, {
        passive: false,
      });
      document.addEventListener("touchend", handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [isDragging, handleSeekbarClick]);

  const handleSkipBackward = useCallback(() => {
    if (onSkipBackward) {
      onSkipBackward();
    } else if (onSeek) {
      onSeek(Math.max(0, currentTime - 15));
    }
  }, [onSkipBackward, onSeek, currentTime]);

  const handleSkipForward = useCallback(() => {
    if (onSkipForward) {
      onSkipForward();
    } else if (onSeek) {
      onSeek(Math.min(duration, currentTime + 15));
    }
  }, [onSkipForward, onSeek, duration, currentTime]);

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border transition-all duration-300 relative",
        isPermanentlySelected
          ? "border-melodia-yellow shadow-lg"
          : isSelected
          ? "border-melodia-coral shadow-lg"
          : "border-gray-200 shadow-sm hover:shadow-md"
      )}
    >
      {isSelected && !isPermanentlySelected && (
        <div className="absolute -top-2 -right-2 bg-melodia-coral rounded-full p-1 text-white">
          <Check className="w-4 h-4" />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        {/* Left side: Info, progress, controls */}
        <div className="flex-1 space-y-3">
          {/* Top part: song info */}
          <div>
            <p className="text-sm font-body text-gray-500 mb-1 flex justify-between items-center">
              <span>{variantLabel}</span>
              {isPermanentlySelected && (
                <span className="bg-melodia-yellow text-melodia-teal font-bold text-xs px-2 py-1 rounded-md">
                  Selected
                </span>
              )}
            </p>
            <h3 className="text-xl font-heading text-melodia-teal font-bold mb-2">
              {variant.title}
            </h3>
            {/* Subtle text for STREAM_READY */}
            {variant.variantStatus === "STREAM_READY" && (
              <p className="text-xs text-gray-400 font-body mb-2">
                Download Ready Soon
              </p>
            )}
          </div>

          {/* Player section */}
          {variant.variantStatus === "PENDING" ? (
            <div className="w-full h-12 bg-gray-100 text-gray-500 font-body font-semibold rounded-xl flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          ) : variant.variantStatus === "STREAM_READY" ? (
            <div className="space-y-4">
              {/* Interactive Progress Bar section */}
              <div className="flex items-center gap-3">
                <div
                  ref={seekbarRef}
                  className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer relative touch-none select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSeekbarClick(e.clientX);
                  }}
                  onMouseDown={handleSeekbarMouseDown}
                  onMouseMove={handleSeekbarMouseMove}
                  onMouseUp={handleSeekbarMouseUp}
                  onMouseLeave={handleSeekbarMouseUp}
                  onTouchStart={handleSeekbarTouchStart}
                  onTouchMove={handleSeekbarTouchMove}
                  onTouchEnd={handleSeekbarTouchEnd}
                >
                  <div
                    className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 font-body w-24 text-right">
                  {formatTime(currentTime)} /{" "}
                  {duration > 0 ? formatTime(duration) : "..."}
                </span>
              </div>

              {/* Player Controls for STREAM_READY */}
              <PlayControls
                onPlayPause={handlePlayPause}
                onSkipBackward={handleSkipBackward}
                onSkipForward={handleSkipForward}
                onSeek={onSeek}
                isPlaying={isPlaying}
                isLoading={isLoading}
                duration={duration}
                streamAudioUrl={streamAudioUrl}
                variantStatus={variant.variantStatus}
                showStatusText={true}
                statusText={statusText}
              />
            </div>
          ) : variant.variantStatus === "DOWNLOAD_READY" ? (
            <div className="space-y-4">
              {/* Interactive Progress Bar section - Only for DOWNLOAD_READY */}
              <div className="flex items-center gap-3">
                <div
                  ref={seekbarRef}
                  className="flex-1 bg-gray-200 rounded-full h-2 cursor-pointer relative touch-none select-none"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSeekbarClick(e.clientX);
                  }}
                  onMouseDown={handleSeekbarMouseDown}
                  onMouseMove={handleSeekbarMouseMove}
                  onMouseUp={handleSeekbarMouseUp}
                  onMouseLeave={handleSeekbarMouseUp}
                  onTouchStart={handleSeekbarTouchStart}
                  onTouchMove={handleSeekbarTouchMove}
                  onTouchEnd={handleSeekbarTouchEnd}
                >
                  <div
                    className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 font-body w-24 text-right">
                  {formatTime(currentTime)} /{" "}
                  {duration > 0 ? formatTime(duration) : "..."}
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Simple Progress Bar for other states */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600 font-body w-24 text-right">
                  {formatTime(currentTime)} /{" "}
                  {duration > 0 ? formatTime(duration) : "..."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Album art */}
        <div className="w-20 h-20 bg-gradient-to-br from-melodia-yellow to-melodia-yellow/80 p-1 rounded-lg border-2 border-melodia-yellow/30 flex-shrink-0">
          <AlbumArt imageUrl={variant.imageUrl || ""} title={variant.title} />
        </div>
      </div>
      {variant.variantStatus === "DOWNLOAD_READY" &&
        (showLyricalSongButton && onViewLyricalSong ? (
          <div className="mt-4 space-y-4">
            {/* Player Controls */}
            <PlayControls
              onPlayPause={handlePlayPause}
              onSkipBackward={handleSkipBackward}
              onSkipForward={handleSkipForward}
              onSeek={onSeek}
              isPlaying={isPlaying}
              isLoading={isLoading}
              duration={duration}
              streamAudioUrl={streamAudioUrl}
              variantStatus={variant.variantStatus}
              showDownloadButton={!!downloadUrl}
              downloadUrl={downloadUrl}
              onDownload={handleDownloadClick}
            />

            <div className="border-t border-gray-200" />
            <button
              onClick={onViewLyricalSong}
              className="h-12 px-4 w-full bg-melodia-coral text-white font-body font-semibold rounded-full hover:bg-melodia-coral/90 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>View Lyrical Song</span>
            </button>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {/* Player Controls */}
            <PlayControls
              onPlayPause={handlePlayPause}
              onSkipBackward={handleSkipBackward}
              onSkipForward={handleSkipForward}
              onSeek={onSeek}
              isPlaying={isPlaying}
              isLoading={isLoading}
              duration={duration}
              streamAudioUrl={streamAudioUrl}
              variantStatus={variant.variantStatus}
              showDownloadButton={!!downloadUrl}
              downloadUrl={downloadUrl}
              onDownload={handleDownloadClick}
            />
          </div>
        ))}

      {/* Sharing Section */}
      {(showSharing || showEmailInput) &&
        variant.variantStatus !== "PENDING" && (
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
            {/* Share Publicly Checkbox */}
            {showSharing && onShareToggle && (
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sharePublicly}
                    onChange={() => onShareToggle(variant.id)}
                    className="w-5 h-5 text-melodia-coral bg-gray-100 border-gray-300 rounded focus:ring-melodia-coral dark:focus:ring-melodia-coral dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className="text-md font-body text-gray-700">
                    Share publicly
                  </span>
                </label>
                <button className="p-2 rounded-full hover:bg-gray-100">
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}

            {/* Email Input */}
            {showEmailInput && onEmailChange && onSendEmail && (
              <div className="space-y-2">
                <p className="text-md font-body text-gray-800">
                  Get your song link via email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email ID"
                    value={emailInput}
                    onChange={(e) => onEmailChange(variant.id, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent font-body"
                  />
                  <button
                    onClick={() => onSendEmail && onSendEmail(variant.id)}
                    className="px-5 py-2 bg-melodia-yellow text-melodia-teal font-body font-semibold rounded-lg hover:bg-melodia-yellow/90 transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
    </div>
  );
});

SongPlayerCard.displayName = "SongPlayerCard";

export default SongPlayerCard;
