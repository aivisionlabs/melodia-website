"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, ArrowLeft, BookOpen, Share2 } from 'lucide-react';

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
  const [currentTime, setCurrentTime] = useState<{ [key: string]: number }>({});
  const [duration, setDuration] = useState<{ [key: string]: number }>({});
  const [sharePublicly, setSharePublicly] = useState<{ [key: string]: boolean }>({});
  const [emailInput, setEmailInput] = useState<{ [key: string]: string }>({});
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handlePlayPreview = (variantId: string, audioUrl: string) => {
    // Don't play if no audio URL (still loading)
    if (!audioUrl || audioUrl === '') {
      console.log('Audio not ready yet');
      return;
    }
  
    // If clicking the same song that's playing, pause it
    if (playingVariant === variantId) {
      const audio = audioElements[variantId];
      if (audio) {
        audio.pause();
        setPlayingVariant(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      }
      return;
    }
  
    // Stop any currently playing audio and reset their currentTime
    Object.entries(audioElements).forEach(([id, audio]) => {
      audio.pause();
      audio.currentTime = 0;
    });
  
    // Clear any existing progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
  
    let audio: HTMLAudioElement;
  
    // Create new audio element if it doesn't exist
    if (!audioElements[variantId]) {
      audio = new Audio(audioUrl);
      audio.preload = 'metadata';
      
      // Update the audioElements state immediately
      setAudioElements(prev => ({ ...prev, [variantId]: audio }));
      
      audio.addEventListener('loadedmetadata', () => {
        setDuration(prev => ({ ...prev, [variantId]: audio.duration }));
      });
      
      audio.addEventListener('ended', () => {
        setPlayingVariant(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });
  
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        setPlayingVariant(null);
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      });
    } else {
      audio = audioElements[variantId];
    }
    
    // Set playing state BEFORE starting playback
    setPlayingVariant(variantId);
    
    // Reset to beginning and play
    audio.currentTime = 0;
    
    audio.play()
      .then(() => {
        // Start progress tracking only after successful play
        progressIntervalRef.current = setInterval(() => {
          setCurrentTime(prev => ({ ...prev, [variantId]: audio.currentTime }));
        }, 100);
      })
      .catch((error) => {
        console.error('Error playing audio:', error);
        setPlayingVariant(null);
      });
  };
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60); // Round to whole number
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareToggle = (variantId: string) => {
    setSharePublicly(prev => ({
      ...prev,
      [variantId]: !prev[variantId]
    }));
  };

  const handleEmailChange = (variantId: string, email: string) => {
    setEmailInput(prev => ({
      ...prev,
      [variantId]: email
    }));
  };

  const handleSendEmail = (variantId: string) => {
    const email = emailInput[variantId];
    if (email) {
      // TODO: Implement email sending functionality
      console.log(`Sending song link to ${email} for variant ${variantId}`);
      alert(`Song link will be sent to ${email}`);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      // Pause all audio elements
      Object.values(audioElements).forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
    };
  }, []);

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

              {/* Play Preview Button or Player UI */}
              {(!variant.audioUrl || variant.audioUrl === '') ? (
                <div className="w-full h-12 bg-gray-100 text-gray-500 font-semibold rounded-xl flex items-center justify-center gap-2 cursor-not-allowed">
                  <LoadingDots />
                  <span>Generating audio...</span>
                </div>
              ) : playingVariant === variant.id ? (
                // Player UI when playing
                <div className="space-y-4">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-melodia-yellow h-2 rounded-full transition-all duration-100"
                        style={{ 
                          width: `${duration[variant.id] ? (currentTime[variant.id] || 0) / duration[variant.id] * 100 : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formatDuration(currentTime[variant.id] || 0)}</span>
                      <span>{formatDuration(duration[variant.id] || 0)}</span>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex gap-3">
                    {/* Play/Pause Button */}
                    <button
                      onClick={() => handlePlayPreview(variant.id, variant.audioUrl)}
                      className="w-12 h-12 bg-melodia-yellow text-melodia-teal rounded-full flex items-center justify-center hover:bg-melodia-yellow/90 transition-colors"
                    >
                      <Pause className="w-5 h-5" />
                    </button>

                    {/* Lyrics Button */}
                    <button
                      onClick={() => alert('Lyrics feature coming soon!')}
                      className="flex-1 h-12 bg-white border-2 border-melodia-yellow text-melodia-teal font-semibold rounded-xl hover:bg-melodia-yellow/10 transition-colors flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      Lyrics
                    </button>

                    {/* Download Button */}
                    <button
                      onClick={() => handleDownload(variant.audioUrl, variant.title)}
                      className="flex-1 h-12 bg-pink-500 text-white font-semibold rounded-xl hover:bg-pink-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>

                  {/* Sharing Section */}
                  <div className="space-y-3">
                    {/* Horizontal Divider */}
                    <div className="w-full h-px bg-gray-200"></div>

                    {/* Share Publicly Checkbox */}
                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sharePublicly[variant.id] || false}
                          onChange={() => handleShareToggle(variant.id)}
                          className="w-4 h-4 text-pink-500 bg-pink-500 border-pink-500 rounded focus:ring-pink-500 focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">Share publicly</span>
                      </label>
                      <Share2 className="w-4 h-4 text-gray-400" />
                    </div>

                    {/* Email Input (Conditional) */}
                    {sharePublicly[variant.id] && (
                      <div className="space-y-2">
                        <p className="text-sm text-gray-600">Get your song link via email</p>
                        <div className="flex gap-2">
                          <input
                            type="email"
                            placeholder="Enter your email ID"
                            value={emailInput[variant.id] || ''}
                            onChange={(e) => handleEmailChange(variant.id, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-melodia-yellow focus:border-transparent"
                          />
                          <button
                            onClick={() => handleSendEmail(variant.id)}
                            className="px-4 py-2 bg-melodia-yellow text-melodia-teal font-semibold rounded-lg hover:bg-melodia-yellow/90 transition-colors"
                          >
                            Send
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                // Play Button when not playing
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
