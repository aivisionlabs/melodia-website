"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Download, ArrowLeft } from 'lucide-react';

interface SongVariant {
  id: string;
  title: string;
  audioUrl: string;
  imageUrl: string;
  duration: number;
  downloadStatus: string;
  isLoading?: boolean; // New property to track loading state
}

interface SongOptionsDisplayProps {
  variants: SongVariant[];
  onBack: () => void;
  onSelectVariant: (variantId: string) => void;
  onBackupWithGoogle: () => void;
}

export default function SongOptionsDisplay({
  variants,
  onBack,
  onSelectVariant,
  onBackupWithGoogle
}: SongOptionsDisplayProps) {
  const [playingVariant, setPlayingVariant] = useState<string | null>(null);
  const [audioElements, setAudioElements] = useState<{ [key: string]: HTMLAudioElement }>({});

  const handlePlayPreview = (variantId: string, audioUrl: string) => {
    // Don't play if no audio URL (still loading)
    if (!audioUrl || audioUrl === '') {
      console.log('Audio not ready yet');
      return;
    }

    // Stop any currently playing audio
    Object.values(audioElements).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });

    // Create new audio element if it doesn't exist
    if (!audioElements[variantId]) {
      const audio = new Audio(audioUrl);
      audio.preload = 'metadata';
      setAudioElements(prev => ({ ...prev, [variantId]: audio }));
      
      audio.addEventListener('ended', () => {
        setPlayingVariant(null);
      });
    }

    const audio = audioElements[variantId] || new Audio(audioUrl);
    
    if (playingVariant === variantId) {
      // Pause if currently playing
      audio.pause();
      setPlayingVariant(null);
    } else {
      // Play the preview
      setPlayingVariant(variantId);
      audio.currentTime = 0;
      audio.play().catch(console.error);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading dots animation component
  const LoadingDots = () => (
    <div className="flex items-center gap-1">
      <div className="w-2 h-2 bg-melodia-coral rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
      <div className="w-2 h-2 bg-melodia-coral rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
      <div className="w-2 h-2 bg-melodia-coral rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="p-6 pt-16">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-melodia-teal hover:opacity-70 transition-opacity p-2"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold text-melodia-teal">
            Your Song Options
          </h1>
        </div>

        {/* Song Options */}
        <div className="space-y-6">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
            >
              {/* Song Info */}
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <p className="text-sm text-gray-500 mb-1">
                    Song Option {index + 1}
                  </p>
                  <h3 className="text-xl font-bold text-melodia-teal mb-2">
                    {variant.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    {(!variant.audioUrl || variant.audioUrl === '') ? (
                      <>
                        <LoadingDots />
                        <span className="text-melodia-coral font-medium text-sm">Generating...</span>
                      </>
                    ) : (
                      <p className="text-melodia-coral font-medium">
                        {variant.downloadStatus}
                      </p>
                    )}
                  </div>
                </div>

                {/* Album Art with Wood Frame */}
                <div className="w-20 h-20 bg-amber-100 p-1 rounded-lg border-2 border-amber-300">
                  <div className="w-full h-full bg-white rounded overflow-hidden">
                    <img
                      src={variant.imageUrl}
                      alt={`${variant.title} album art`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to a placeholder if image fails to load
                        e.currentTarget.src = '/images/melodia-logo.png';
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Play Preview Button or Loading State */}
              {(!variant.audioUrl || variant.audioUrl === '') ? (
                <div className="w-full h-12 bg-gray-100 text-gray-500 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  <LoadingDots />
                  <span>Generating audio...</span>
                </div>
              ) : (
                <Button
                  onClick={() => handlePlayPreview(variant.id, variant.audioUrl)}
                  className="w-full h-12 bg-melodia-yellow text-melodia-teal font-semibold rounded-xl hover:bg-melodia-yellow/90 transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Play 15s Preview
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Backup Option */}
        <div className="mt-8 text-center">
          <button
            onClick={onBackupWithGoogle}
            className="flex items-center justify-center gap-3 text-gray-700 hover:text-gray-900 transition-colors mx-auto"
          >
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-sm"></div>
              <div className="w-4 h-4 bg-green-500 rounded-sm"></div>
              <div className="w-4 h-4 bg-blue-500 rounded-sm"></div>
            </div>
            <span className="font-medium">Backup song with Google</span>
          </button>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <div className="flex justify-around items-center">
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-melodia-teal" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <span className="text-xs text-melodia-teal font-medium">Home</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <span className="text-xs text-gray-500">Best Songs</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
            <span className="text-xs text-gray-500">My Songs</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <span className="text-xs text-gray-500">Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
}
