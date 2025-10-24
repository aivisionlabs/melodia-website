"use client";

import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  Rewind,
  FastForward,
  AlertCircle,
  Music,
  ArrowRight,
  FileText,
  X,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ShareButton } from "@/components/ShareButton";
import { SongLikeButton } from "@/components/SongLikeButton";
import {
  trackEngagementEvent,
  trackNavigationEvent,
  trackCTAEvent,
} from "@/lib/analytics";
import { HeaderLogo } from "./OptimizedLogo";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useLyrics } from "@/hooks/useLyrics";

interface LyricLine {
  index: number;
  text: string;
  start: number;
  end: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  audioUrl?: string;
  song_url?: string;
  duration: number;
  timestamp_lyrics?: LyricLine[];
  timestamped_lyrics_variants?: { [variantIndex: number]: LyricLine[] } | null;
  selected_variant?: number;
  lyrics?: string | null;
  slug?: string;
  show_lyrics?: boolean;
  likes_count?: number;
  suno_variants?: Array<{
    id: string;
    audioUrl: string;
    streamAudioUrl: string;
    sourceImageUrl: string;
    prompt: string;
    modelName: string;
    title: string;
    tags: string;
    createTime: string;
    duration: number;
  }>;
}

interface FullPageMediaPlayerProps {
  song: Song;
}

export const FullPageMediaPlayer = ({ song }: FullPageMediaPlayerProps) => {
  // Use audio player hook
  const {
    isPlaying,
    currentTime,
    duration,
    audioError,
    isLoading,
    isPlayLoading,
    togglePlay,
    skipTime,
    seekTo,
    formatTime,
    audioRef,
  } = useAudioPlayer({
    audioUrl: song.song_url || song.audioUrl,
    songTitle: song.title,
    songId: song.id,
  });

  // Convert current time to milliseconds for timestamp comparison
  const currentTimeMs = currentTime * 1000;

  // Use lyrics hook
  const {
    lyrics,
    showLyricsViewer,
    setShowLyricsViewer,
    hasLyrics,
    getLyricsData,
    lyricsContainerRef,
    lyricRefs,
  } = useLyrics({
    song,
    currentTimeMs,
    isPlaying,
    audioError,
  });

  // Helper function to get the variant image URL
  const getVariantImageUrl = () => {
    if (song.suno_variants && song.suno_variants.length > 0) {
      return song.suno_variants[0]?.sourceImageUrl;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Single Refined Header with Branding and Song Info */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 pb-1 text-white">
        <div className="flex items-center justify-between mb-1">
          {/* Melodia Branding */}
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <HeaderLogo className="py-2" />
          </Link>

          {/* Share Button */}
          <div className="flex items-center">
            <ShareButton
              slug={song.slug}
              title={`${song.title}`}
              onShare={() =>
                trackEngagementEvent.share(song.title, song.id, "native_share")
              }
              onCopyLink={() =>
                trackEngagementEvent.copyLink(song.title, song.id)
              }
            />
          </div>
        </div>

        {/* Status Messages */}
        {audioError && (
          <div className="flex items-center gap-2 text-yellow-100 text-xs md:text-sm justify-center">
            <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
            <span>
              {song.show_lyrics !== false
                ? "Demo mode: Use controls below to experience synchronized lyrics"
                : "Demo mode: Use controls below to experience the music"}
            </span>
          </div>
        )}
        {isLoading && !audioError && (
          <div className="flex items-center gap-2 text-yellow-100 text-xs md:text-sm justify-center">
            <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-yellow-100"></div>
            <span>Loading audio...</span>
          </div>
        )}
      </div>

      {/* Main Content Section - Conditional rendering based on show_lyrics */}
      {song.show_lyrics !== false ? (
        /* Main Lyrics Section - Fixed height for proper scrolling */
        <div className="flex-1 bg-gradient-to-b from-gray-50 to-white">
          <div
            ref={lyricsContainerRef}
            className="h-[calc(100vh-200px)] overflow-y-auto px-6 md:px-12 scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {/* Top padding to allow first lyric to be centered */}
            <div className="h-[calc(40vh-80px)]"></div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8 md:space-y-10">
                {lyrics.map((line, index) => (
                  <div
                    key={index}
                    ref={(el) => {
                      lyricRefs.current[index] = el;
                    }}
                    className={`text-center transition-all duration-700 ease-out min-h-[4rem] md:min-h-[4.5rem] flex items-center justify-center relative ${
                      line.isActive
                        ? "text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600 transform scale-110"
                        : line.isPast
                          ? "text-base md:text-lg text-gray-400 opacity-60"
                          : "text-base md:text-lg text-gray-500 opacity-80"
                    }`}
                    style={{
                      transform: line.isActive ? "scale(1.1)" : "scale(1)",
                      transition:
                        "all 0.7s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.5s cubic-bezier(0.4, 0, 0.2, 1), line-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                  >
                    {/* Active lyric indicator */}
                    {line.isActive && (
                      <div className="absolute -left-0 md:-left-6 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
                    )}

                    {/* Progress indicator for active lyric */}
                    {line.isActive && (
                      <div className="absolute -left-1 md:-left-8 top-1/2 transform -translate-y-1/2 w-1 h-8 md:h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
                    )}

                    <span
                      className="px-6 md:px-8 py-3 md:py-4 rounded-lg leading-relaxed max-w-full break-words transition-all duration-500 ease-out"
                      style={{
                        transition:
                          "all 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease-out",
                      }}
                    >
                      {line.text || "\u00A0"}
                    </span>

                    {/* Subtle glow effect for active lyric */}
                    {line.isActive && (
                      <div className="absolute inset-0 bg-yellow-100 rounded-lg opacity-20 blur-sm"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom padding to allow last lyric to be centered */}
            <div className="h-[calc(40vh-80px)]"></div>
          </div>
        </div>
      ) : (
        /* Main Content Section - Centered Music Experience */
        <div className="flex-1 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
          <div className="text-center max-w-2xl mx-auto px-6">
            {/* Large Music Icon */}
            <div className="mb-8">
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                <Music className="h-16 w-16 md:h-20 md:w-20 text-white" />
              </div>
            </div>

            {/* Song Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              {song.title}
            </h1>

            {/* Artist */}
            <p className="text-lg md:text-xl text-gray-600 mb-8">
              {song.artist}
            </p>

            {/* Lyrics CTA Button - Only show if lyrics are available */}
            {hasLyrics() && (
              <div className="mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowLyricsViewer(true);
                    trackCTAEvent.ctaClick(
                      "view_lyrics",
                      "song_player",
                      "button"
                    );
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 border-gray-300 hover:border-yellow-400 hover:text-yellow-600 hover:bg-yellow-50 transition-all duration-200 shadow-sm"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">View Lyrics</span>
                </Button>
              </div>
            )}

            {/* Visualizer Placeholder */}
            <div className="mb-8">
              <div className="flex items-center justify-center space-x-1 h-16">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1 bg-gradient-to-t from-yellow-400 to-yellow-600 rounded-full transition-all duration-300 ${
                      isPlaying ? "animate-pulse" : ""
                    }`}
                    style={{
                      height: isPlaying
                        ? `${Math.random() * 40 + 20}px`
                        : "20px",
                      animationDelay: `${i * 0.1}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Player Controls */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-lg z-50">
        <audio
          ref={audioRef}
          src={song.song_url || song.audioUrl || undefined}
          preload="none"
          playsInline
          webkit-playsinline="true"
        />

        {/* Song Info and Logo */}
        <div className="flex items-center justify-between mb-4">
          {/* Song Information */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {getVariantImageUrl() ? (
                <Image
                  src={getVariantImageUrl()!}
                  alt={song.title}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Image
                  src="/images/melodia-logo.jpeg"
                  alt="Melodia"
                  width={80}
                  height={80}
                  className={`w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 object-contain`}
                  priority={true}
                />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-xl md:text-base font-semibold text-gray-900 truncate">
                {song.title}
              </h3>
            </div>
          </div>

          {/* Like Button and All Library CTA */}
          <div className="flex items-center gap-2">
            <SongLikeButton
              slug={song.slug || ""}
              initialCount={song.likes_count || 0}
              size="sm"
              songTitle={song.title}
              songId={song.id}
              pageContext="song_player"
            />
            <Link href="/library">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  trackNavigationEvent.click(
                    "all_library_cta",
                    window.location.href,
                    "button"
                  )
                }
                className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
              >
                <Music className="h-3 w-3 md:h-4 md:w-4" />
                <span className="text-xs md:text-sm font-medium">
                  All Library
                </span>
                <ArrowRight className="h-2 w-2 md:h-3 md:w-3" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 md:gap-4 mb-4 justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(-10)}
            disabled={isLoading}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-100 shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Rewind className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </Button>

          <Button
            variant="ghost"
            size="lg"
            onClick={togglePlay}
            disabled={isLoading || isPlayLoading}
            className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPlayLoading ? (
              <div className="flex flex-col items-center justify-center gap-1 text-center">
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent flex-shrink-0"></div>
                <span className="text-[10px] md:text-xs font-medium leading-none">
                  Loading...
                </span>
              </div>
            ) : isPlaying ? (
              <Pause className="h-6 w-6 md:h-8 md:w-8" />
            ) : (
              <Play className="h-6 w-6 md:h-8 md:w-8 ml-0.5 md:ml-1" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => skipTime(10)}
            disabled={isLoading}
            className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-100 shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FastForward className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Slider
            value={[currentTime]}
            max={duration || 40}
            step={0.1}
            className="w-full"
            disabled={isLoading}
            onValueChange={(value) => {
              const newTime = value[0];
              seekTo(newTime);
            }}
          />
          <div className="flex justify-between text-xs md:text-sm text-gray-600">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration || 40)}</span>
          </div>
        </div>
      </div>

      {/* Lyrics Viewer Modal */}
      {showLyricsViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {song.title}
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLyricsViewer(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Lyrics Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {(() => {
                const lyricsData = getLyricsData();

                if (!lyricsData) {
                  return (
                    <div className="text-center text-gray-500 py-8">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>No lyrics available for this song.</p>
                    </div>
                  );
                }

                // Display plain text lyrics
                return (
                  <div className="whitespace-pre-wrap text-base md:text-lg leading-relaxed text-gray-800">
                    {lyricsData}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Enjoying the lyrics? Share this song with others!
                </p>
                <ShareButton
                  slug={song.slug}
                  title={song.title}
                  onShare={() =>
                    trackEngagementEvent.share(
                      song.title,
                      song.id,
                      "native_share"
                    )
                  }
                  onCopyLink={() =>
                    trackEngagementEvent.copyLink(song.title, song.id)
                  }
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
