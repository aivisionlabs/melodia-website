"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface StaticLyricLine {
  text: string;
  isSection: boolean;
  index: number;
}

interface StaticLyricsDisplayProps {
  lyrics: StaticLyricLine[];
  lyricRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export default function StaticLyricsDisplay({
  lyrics,
  lyricRefs,
}: StaticLyricsDisplayProps) {
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
              className="text-center text-lg md:text-xl font-body font-semibold text-text/60 uppercase tracking-wider py-4 border-b border-text/10"
            >
              {line.text}
            </div>
          );
        }

        // Render static lyrics
        return (
          <div
            key={index}
            ref={(el) => {
              lyricRefs.current[index] = el;
            }}
            className="text-center text-lg md:text-xl font-body text-text leading-relaxed py-2"
          >
            <span className="px-4 md:px-6 py-2 md:py-3 rounded-lg whitespace-pre-line break-words max-w-full">
              {line.text || "\u00A0"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

