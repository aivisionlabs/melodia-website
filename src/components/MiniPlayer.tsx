"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { FastForward, Rewind, Pause, Play } from "lucide-react";

interface MiniPlayerSong {
  title: string;
  artist?: string;
  song_url?: string;
}

interface MiniPlayerProps {
  song: MiniPlayerSong;
}

export function MiniPlayer({ song }: MiniPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const src = song.song_url;

  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;
    const onTime = () => setCurrentTime(audio.currentTime);
    const onLoaded = () => setDuration(audio.duration || 0);
    const onEnded = () => setIsPlaying(false);
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onLoaded);
    audio.addEventListener("ended", onEnded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onLoaded);
      audio.removeEventListener("ended", onEnded);
    };
  }, [src]);

  useEffect(() => {
    // Stop playback when song changes
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [src]);

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  const seekBy = (delta: number) => {
    if (!audioRef.current) return;
    const next = Math.max(
      0,
      Math.min(
        audioRef.current.duration || 0,
        audioRef.current.currentTime + delta
      )
    );
    audioRef.current.currentTime = next;
    setCurrentTime(next);
  };

  const format = (t: number) => {
    if (!isFinite(t)) return "0:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div className="sticky bottom-0 left-0 right-0 z-30 p-4 bg-[var(--secondary-light-cream)]/90 backdrop-blur-sm border-t border-gray-200">
      <audio ref={audioRef} src={src} preload="metadata" />
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="text-sm font-semibold truncate text-[var(--text-dark-teal)]">
            {song.title}
          </div>
          <div className="h-1.5 bg-gray-300 rounded-full mt-2">
            <div
              className="h-full bg-[var(--accent-vibrant-coral)] rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{format(currentTime)}</span>
            <span>{format(duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[var(--text-dark-teal)]">
          <button
            className="p-2"
            onClick={() => seekBy(-10)}
            aria-label="Rewind 10s"
          >
            <Rewind className="w-6 h-6" />
          </button>
          <button
            className="p-3 rounded-full bg-[var(--accent-vibrant-coral)] text-white shadow-lg"
            onClick={togglePlay}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" />
            ) : (
              <Play className="w-6 h-6" />
            )}
          </button>
          <button
            className="p-2"
            onClick={() => seekBy(10)}
            aria-label="Forward 10s"
          >
            <FastForward className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}





