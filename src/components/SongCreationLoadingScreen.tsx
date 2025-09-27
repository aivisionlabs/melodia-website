"use client";

import React, { useState, useEffect } from "react";

interface SongCreationLoadingScreenProps {
  onComplete: () => void;
  duration?: number; // Duration in seconds, default 45
}

export default function SongCreationLoadingScreen({
  onComplete,
  duration = 45,
}: SongCreationLoadingScreenProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsComplete(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle completion in a separate useEffect to avoid calling onComplete during render
  useEffect(() => {
    if (isComplete) {
      onComplete();
    }
  }, [isComplete, onComplete]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-melodia-teal mb-8">Melodia</h1>
      </div>

      {/* Main Graphic */}
      <div className="flex flex-col items-center mb-12">
        {/* Musical Notes */}
        <div className="flex gap-2 mb-4">
          {[1, 2, 3, 4].map((note) => (
            <div
              key={note}
              className="w-6 h-6 bg-melodia-coral rounded-full animate-bounce"
              style={{
                animationDelay: `${note * 0.1}s`,
                animationDuration: "1s",
              }}
            />
          ))}
        </div>

        {/* Large Circle */}
        <div className="w-32 h-32 bg-melodia-yellow rounded-full flex items-center justify-center shadow-lg">
          <div className="w-24 h-24 bg-melodia-yellow rounded-full border-4 border-melodia-teal/20"></div>
        </div>
      </div>

      {/* Main Text */}
      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold text-melodia-teal mb-4">
          Crafting your song...
        </h2>
        <p className="text-lg text-melodia-teal/80 max-w-md">
          Our AI is turning your story into a musical masterpiece. Hang tight!
        </p>
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8">
        <div className="w-20 h-20 bg-melodia-yellow rounded-full border-4 border-melodia-yellow/50 flex items-center justify-center shadow-lg">
          <span className="text-2xl font-bold text-melodia-coral">
            {timeLeft}
          </span>
        </div>

        {/* Progress Ring */}
        <svg
          className="absolute inset-0 w-20 h-20 transform -rotate-90"
          viewBox="0 0 80 80"
        >
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            className="text-melodia-yellow/30"
          />
          <circle
            cx="40"
            cy="40"
            r="36"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
            strokeDasharray={`${2 * Math.PI * 36}`}
            strokeDashoffset={`${
              2 * Math.PI * 36 * (1 - (duration - timeLeft) / duration)
            }`}
            className="text-melodia-coral transition-all duration-1000 ease-linear"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Footer */}
      <div className="text-center">
        <p className="text-sm text-melodia-teal/60">© Melodia 2024</p>
      </div>
    </div>
  );
}
