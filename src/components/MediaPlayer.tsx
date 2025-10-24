import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Play,
  Pause,
  X,
  Rewind,
  FastForward,
  AlertCircle,
  Music,
  FileText,
} from "lucide-react";
import Image from "next/image";
import { ShareButton } from "@/components/ShareButton";
import { SongLikeButton } from "@/components/SongLikeButton";
import { trackEngagementEvent, trackNavigationEvent } from "@/lib/analytics";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { useLyrics } from "@/hooks/useLyrics";

interface LyricLine {
  index: number;
  text: string;
  start: number;
  end: number;
}

interface MediaPlayerProps {
  song: {
    title: string;
    artist: string;
    audioUrl?: string;
    song_url?: string; // New field for the actual audio URL
    videoUrl?: string;
    lyrics?: LyricLine[];
    timestamp_lyrics?: LyricLine[]; // Final variation of lyrics
    timestamped_lyrics_variants?: {
      [variantIndex: number]: LyricLine[];
    } | null;
    selected_variant?: number;
    slug?: string;
    show_lyrics?: boolean; // Field to control whether to show lyrics
    plain_lyrics?: string | null; // Plain text lyrics for static display
    likes_count?: number; // Like count for the song
  };
  onClose: () => void;
}

export const MediaPlayer = ({ song, onClose }: MediaPlayerProps) => {
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
    songId: song.slug || "unknown",
  });

  // Convert current time to milliseconds for timestamp comparison
  const currentTimeMs = currentTime * 1000;

  // Use lyrics hook
  const {
    lyrics,
    isLoadingLyrics,
    showLyricsViewer,
    setShowLyricsViewer,
    hasLyrics,
    getLyricsData,
    lyricsContainerRef,
    lyricRefs,
    shouldShowLyrics,
  } = useLyrics({
    song,
    currentTimeMs,
    isPlaying,
    audioError,
  });

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 md:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-4 md:p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3 min-w-0 flex-1 pr-4">
              <Image
                src="/images/melodia-logo-transparent.png"
                alt="Melodia"
                width={40}
                height={40}
                className="h-8 w-8 md:h-10 md:w-10 rounded flex-shrink-0 object-contain"
              />
              <div className="min-w-0 flex-1">
                <h2 className="text-lg md:text-2xl font-bold truncate">
                  {song.title}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <SongLikeButton
                slug={song.slug || ""}
                initialCount={song.likes_count || 0}
                size="sm"
                songTitle={song.title}
                songId={song.slug || ""}
                pageContext="media_player"
              />
              <ShareButton
                slug={song.slug}
                title={`${song.title}`}
                onShare={() =>
                  trackEngagementEvent.share(
                    song.title,
                    song.slug || "unknown",
                    "native_share"
                  )
                }
                onCopyLink={() =>
                  trackEngagementEvent.copyLink(
                    song.title,
                    song.slug || "unknown"
                  )
                }
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  trackNavigationEvent.click(
                    "close_player",
                    window.location.href,
                    "button"
                  );
                  onClose();
                }}
                className="h-8 w-8 md:h-10 md:w-10 p-0 text-white hover:bg-white/20 rounded-full flex-shrink-0"
              >
                <X className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Audio Controls */}
        <div className="p-4 md:p-6 bg-gray-50">
          <audio
            ref={audioRef}
            src={song.song_url || song.audioUrl || undefined}
            preload="none"
            playsInline
            webkit-playsinline="true"
          />

          {/* Error State */}
          {audioError && (
            <div className="mb-4 p-3 md:p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                <span className="text-xs md:text-sm font-medium">
                  Demo mode: Audio playback may be limited. You can still
                  experience synchronized lyrics by clicking play.
                </span>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && !audioError && (
            <div className="mb-4 p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700">
                <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-blue-700"></div>
                <span className="text-xs md:text-sm">Loading audio...</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 md:gap-4 mb-4 justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => skipTime(-10)}
              disabled={isLoading}
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
              className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white shadow-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FastForward className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Slider
              value={[currentTime]}
              max={duration || 40}
              step={1}
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

        {/* Lyrics Section - Conditional Rendering */}
        <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white">
          {shouldShowLyrics ? (
            // Synchronized Lyrics Section - Spotify Style
            <>
              {/* Status indicator */}
              {(!isPlaying || audioError) && (
                <div className="px-4 md:px-6 py-3 md:py-4 bg-gray-100 border-b border-gray-200">
                  <div className="flex items-center gap-3 text-sm md:text-base text-gray-600">
                    <div className="w-2 h-2 bg-gray-400 rounded-full flex-shrink-0"></div>
                    <span className="leading-relaxed">
                      {isLoadingLyrics
                        ? "Loading lyrics..."
                        : audioError
                          ? "Demo mode - click play to experience synchronized lyrics"
                          : "Click play to start synchronized lyrics"}
                    </span>
                  </div>
                </div>
              )}

              {/* Lyrics Container with Spotify-style design */}
              <div
                ref={lyricsContainerRef}
                className="h-64 md:h-80 overflow-y-auto px-6 md:px-12 py-8 md:py-12 scroll-smooth [&::-webkit-scrollbar]:hidden"
                style={{
                  scrollbarWidth: "none",
                  msOverflowStyle: "none",
                }}
              >
                {isLoadingLyrics ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                      <p className="text-lg text-gray-600">Loading lyrics...</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 md:space-y-10">
                    {lyrics.map((line, index) => (
                      <div
                        key={index}
                        ref={(el) => {
                          lyricRefs.current[index] = el;
                        }}
                        className={`text-center transition-all duration-700 ease-out min-h-[4rem] md:min-h-[4.5rem] flex items-center justify-center relative ${
                          line.isActive
                            ? "text-2xl md:text-3xl font-bold text-yellow-600 transform scale-110"
                            : line.isPast
                              ? "text-base md:text-lg text-gray-400 opacity-60"
                              : "text-base md:text-lg text-gray-500 opacity-80"
                        }`}
                        style={{
                          transform: line.isActive ? "scale(1.1)" : "scale(1)",
                          transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
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

                        <span className="px-6 md:px-8 py-3 md:py-4 rounded-lg leading-relaxed">
                          {line.text || "\u00A0"}
                        </span>

                        {/* Subtle glow effect for active lyric */}
                        {line.isActive && (
                          <div className="absolute inset-0 bg-yellow-100 rounded-lg opacity-20 blur-sm"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom padding for better scroll experience */}
                <div className="h-20 md:h-24"></div>
              </div>
            </>
          ) : (
            // No Lyrics Section - Music Experience with CTA
            <div className="flex-1 flex items-center justify-center p-6 md:p-12">
              <div className="text-center max-w-2xl mx-auto">
                {/* Large Music Icon */}
                <div className="mb-8">
                  <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <Music className="h-16 w-16 md:h-20 md:w-20 text-white" />
                  </div>
                </div>

                {/* Song Title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  {song.title}
                </h2>

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
                        trackEngagementEvent.share(
                          song.title,
                          song.slug || "unknown",
                          "view_lyrics_cta"
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
                      song.slug || "unknown",
                      "native_share"
                    )
                  }
                  onCopyLink={() =>
                    trackEngagementEvent.copyLink(
                      song.title,
                      song.slug || "unknown"
                    )
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
