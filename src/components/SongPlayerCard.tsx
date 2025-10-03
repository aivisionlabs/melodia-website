"use client";

import React from "react";
import { Play, Pause, Download, Share2, FileText, Check } from "lucide-react";
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
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  isSelected?: boolean;
  showLyricalSongButton?: boolean;
  onViewLyricalSong?: () => void;
}

export default function SongPlayerCard({
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
  isPlaying,
  isLoading,
  currentTime,
  duration,
  isSelected = false,
  showLyricalSongButton = false,
  onViewLyricalSong,
}: SongPlayerCardProps) {
  const formatTime = (time: number) => {
    if (time === 0) return "0:00";
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handlePlayPause = () => {
    onPlayPause();
  };

  const handleDownloadClick = () => {
    const audioUrl = variant.audioUrl || variant.sourceAudioUrl || "";
    if (audioUrl && onDownload) {
      onDownload(audioUrl, variant.title);
    }
  };

  const getStatusText = () => {
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
  };

  const getStreamAudioUrl = () => {
    return variant.sourceStreamAudioUrl || variant.streamAudioUrl || "";
  };

  const getDownloadUrl = () => {
    return variant.audioUrl || variant.sourceAudioUrl || "";
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const streamAudioUrl = getStreamAudioUrl();
  const downloadUrl = getDownloadUrl();

  return (
    <div
      className={cn(
        "bg-white rounded-2xl p-5 border transition-all duration-300 relative",
        isSelected
          ? "border-melodia-coral shadow-lg"
          : "border-neutral-200 shadow-sm hover:shadow-md"
      )}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 bg-melodia-coral rounded-full p-1 text-white">
          <Check className="w-4 h-4" />
        </div>
      )}
      <div className="flex items-start justify-between gap-4">
        {/* Left side: Info, progress, controls */}
        <div className="flex-1 space-y-3">
          {/* Top part: song info */}
          <div>
            <p className="text-sm font-body text-neutral-500 mb-1 flex justify-between items-center">
              <span>{variantLabel}</span>
            </p>
            <h3 className="text-xl font-heading text-melodia-teal font-bold mb-2">
              {variant.title}
            </h3>
            {/* Subtle text for STREAM_READY */}
            {variant.variantStatus === "STREAM_READY" && (
              <p className="text-xs text-neutral-400 font-body mb-2">
                Preview available - Download ready soon
              </p>
            )}
          </div>

          {/* Player section */}
          {variant.variantStatus === "PENDING" ? (
            <div className="w-full h-12 bg-neutral-100 text-neutral-500 font-body font-semibold rounded-xl flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
              Generating...
            </div>
          ) : variant.variantStatus === "STREAM_READY" ? (
            <div className="space-y-4">
              {/* Progress Bar section */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-neutral-600 font-body w-24 text-right">
                  {formatTime(currentTime)} /{" "}
                  {duration > 0 ? formatTime(duration) : "..."}
                </span>
              </div>

              {/* Status text */}
              <p className="text-sm text-neutral-500 font-body">
                {getStatusText()}
              </p>
              {/* Large CTA Button for STREAM_READY */}
              <button
                onClick={handlePlayPause}
                disabled={isLoading || !streamAudioUrl}
                className="w-full h-14 bg-melodia-yellow text-melodia-teal rounded-full flex items-center justify-center gap-3 hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50 font-body font-medium"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-melodia-teal border-t-transparent"></div>
                ) : isPlaying ? (
                  <>
                    <Pause className="w-6 h-6" />
                    <span>Pause Preview</span>
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6" />
                    <span>Play Preview</span>
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Progress Bar section */}
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-neutral-200 rounded-full h-2">
                  <div
                    className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <span className="text-sm text-neutral-600 font-body w-24 text-right">
                  {formatTime(currentTime)} /{" "}
                  {duration > 0 ? formatTime(duration) : "..."}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right side: Album art */}
        <div className="w-20 h-20 bg-amber-100 p-1 rounded-lg border-2 border-amber-300 flex-shrink-0">
          <div className="w-full h-full bg-white rounded overflow-hidden">
            <Image
              src={variant.imageUrl || "/images/melodia-logo.png"}
              alt={`${variant.title} album art`}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/melodia-logo.png";
              }}
            />
          </div>
        </div>
      </div>
      {variant.variantStatus === "DOWNLOAD_READY" && (
        <div className="flex items-center justify-between mt-4">
          {/* Play/Pause Button */}
          <button
            onClick={handlePlayPause}
            disabled={isLoading || !streamAudioUrl}
            className="w-14 h-14 bg-melodia-yellow text-melodia-teal rounded-full flex items-center justify-center hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-melodia-teal border-t-transparent"></div>
            ) : isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>

          {showLyricalSongButton && onViewLyricalSong ? (
            <button
              onClick={onViewLyricalSong}
              className="h-12 px-4 bg-melodia-coral text-white font-body font-semibold rounded-full hover:bg-melodia-coral/90 transition-colors flex items-center justify-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span>View Lyrical Song</span>
            </button>
          ) : (
            <>
              {/* Download Button */}
              {variant.variantStatus === "DOWNLOAD_READY" && downloadUrl ? (
                <button
                  onClick={handleDownloadClick}
                  className="h-12 px-4 bg-melodia-coral text-white font-body font-semibold rounded-full hover:bg-melodia-coral/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </button>
              ) : (
                <div className="text-sm font-body text-neutral-500">
                  {getStatusText()}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Sharing Section */}
      {(showSharing || showEmailInput) &&
        variant.variantStatus !== "PENDING" && (
          <div className="mt-4 pt-4 border-t border-neutral-200 space-y-4">
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
                  <span className="text-md font-body text-neutral-700">
                    Share publicly
                  </span>
                </label>
                <button className="p-2 rounded-full hover:bg-neutral-100">
                  <Share2 className="w-5 h-5 text-neutral-500" />
                </button>
              </div>
            )}

            {/* Email Input */}
            {showEmailInput && onEmailChange && onSendEmail && (
              <div className="space-y-2">
                <p className="text-md font-body text-neutral-800">
                  Get your song link via email
                </p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email ID"
                    value={emailInput}
                    onChange={(e) => onEmailChange(variant.id, e.target.value)}
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent font-body"
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
}
