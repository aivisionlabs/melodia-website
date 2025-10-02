"use client";

import Image from "next/image";
import {
  Play,
  Pause,
  BookOpen,
  Download,
  ArrowRight,
  Loader,
} from "lucide-react";
import { Button } from "./ui/button";

type SongCardProps =
  | {
      variant: "in-progress";
      title: string;
      onView: () => void;
    }
  | {
      variant: "completed";
      title: string;
      option: number;
      status: string;
      imageUrl?: string;
      isPlaying: boolean;
      isLoading: boolean;
      currentTime: number;
      duration: number;
      onPlayPause: () => void;
      onViewLyrics: () => void;
      onDownload?: () => void;
      isDownloadReady: boolean;
    };

const formatTime = (time: number) => {
  if (isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

export function SongCard(props: SongCardProps) {
  if (props.variant === "in-progress") {
    return (
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow border border-neutral-200">
        <div>
          <p className="font-body text-sm text-neutral-500">In Progress</p>
          <p className="font-heading text-lg text-melodia-teal">
            {props.title}
          </p>
        </div>
        <Button
          onClick={props.onView}
          className="bg-melodia-yellow text-melodia-teal hover:bg-melodia-yellow/90"
        >
          View <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    );
  }

  const {
    title,
    option,
    status,
    imageUrl = "/images/melodia-logo.png",
    isPlaying,
    isLoading,
    currentTime,
    duration,
    onPlayPause,
    onViewLyrics,
    onDownload,
    isDownloadReady,
  } = props;

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4 mb-5">
        <div className="flex-1">
          <p className="text-sm font-body text-neutral-500 mb-1">
            Song Option {option}
          </p>
          <h3 className="text-xl font-heading text-melodia-teal mb-2">
            {title}
          </h3>
          <p className="text-melodia-coral font-body font-medium text-sm">
            {status}
          </p>
        </div>
        <div className="w-16 h-16 bg-amber-100 p-1 rounded-lg border-2 border-amber-300 flex-shrink-0">
          <div className="w-full h-full bg-white rounded overflow-hidden">
            <Image
              src={imageUrl}
              alt={`${title} album art`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/images/melodia-logo.png";
              }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="space-y-2">
          <div className="w-full bg-neutral-200 rounded-full h-2">
            <div
              className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-neutral-600 font-body">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={onPlayPause}
            disabled={isLoading}
            className="w-12 h-12 bg-melodia-yellow text-melodia-teal rounded-full flex items-center justify-center hover:bg-melodia-yellow/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
          </button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={onViewLyrics}
              className="border-melodia-yellow text-melodia-teal hover:bg-melodia-yellow/10"
            >
              <BookOpen className="w-4 h-4 mr-2" /> Lyrics
            </Button>
            {isDownloadReady && onDownload && (
              <Button
                onClick={onDownload}
                className="bg-melodia-coral text-white hover:bg-melodia-coral/90"
              >
                <Download className="w-4 h-4 mr-2" /> Download
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
