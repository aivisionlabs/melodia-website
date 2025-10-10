"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ParsedLyricLine {
  text: string;
  start: number;
  end: number;
  index: number;
  isSection?: boolean;
  isActive?: boolean;
  isPast?: boolean;
}

interface SynchronizedLyricsDisplayProps {
  lyrics: ParsedLyricLine[];
  lyricRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  seekTo: (time: number) => void;
}

export default function SynchronizedLyricsDisplay({
  lyrics,
  lyricRefs,
  seekTo,
}: SynchronizedLyricsDisplayProps) {
  return (
    <div className="space-y-6 md:space-y-8">
      {lyrics.map((line, index) => {
        if (line.isSection) {
          // Render section headers
          return (
            <div
              key={index}
              ref={(el) => {
                lyricRefs.current[index] = el;
              }}
              className="text-center text-sm md:text-base font-body font-semibold text-neutral-400 uppercase tracking-wider py-4"
            >
              {line.text}
            </div>
          );
        }

        // Render synchronized lyrics
        return (
          <div
            key={index}
            ref={(el) => {
              lyricRefs.current[index] = el;
            }}
            className={cn(
              "text-center transition-all duration-700 ease-out min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center relative cursor-pointer",
              line.isActive
                ? "text-2xl md:text-4xl font-bold font-heading text-melodia-coral transform scale-105"
                : line.isPast
                ? "text-base md:text-xl font-body text-neutral-400 opacity-60"
                : "text-base md:text-xl font-body text-neutral-500 opacity-80"
            )}
            onClick={() => seekTo(line.start / 1000)}
            style={{
              transform: line.isActive ? "scale(1.05)" : "scale(1)",
              transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            {/* Active lyric indicator */}
            {line.isActive && (
              <div className="absolute -left-5 md:-left-6 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-melodia-coral rounded-full animate-pulse shadow-lg"></div>
            )}

            <span className="px-4 md:px-6 py-2 md:py-3 rounded-lg leading-relaxed whitespace-pre-line break-words max-w-full">
              {line.text || "\u00A0"}
            </span>

            {/* Subtle glow effect for active lyric */}
            {line.isActive && (
              <div className="absolute inset-0 bg-melodia-coral/10 rounded-lg blur-sm"></div>
            )}
          </div>
        );
      })}
    </div>
  );
}
