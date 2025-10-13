"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SongArtwork } from "@/components/SongArtwork";
import { getActiveSongsAction } from "@/lib/actions";
import { formatDuration } from "@/lib/utils";
import { Song } from "@/types";
import { Play } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SongLibraryPage() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to get variant image URL with fallback to Melodia logo
  const getVariantImageUrl = (song: Song) => {
    if (song.suno_variants && song.suno_variants.length > 0) {
      return song.suno_variants[0]?.sourceImageUrl;
    }
    return null;
  };

  useEffect(() => {
    async function loadSongs() {
      try {
        const result = await getActiveSongsAction();
        if (result.success) {
          // Sort songs by sequence field, with fallback to created_at for backward compatibility
          const sortedSongs = (result.songs || []).sort((a, b) => {
            // If both songs have sequence values, sort by sequence
            if (a.sequence !== undefined && b.sequence !== undefined) {
              return a.sequence - b.sequence;
            }
            // If only one has sequence, prioritize the one with sequence
            if (a.sequence !== undefined && b.sequence === undefined) {
              return -1;
            }
            if (a.sequence === undefined && b.sequence !== undefined) {
              return 1;
            }
            // Fallback to created_at for songs without sequence
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
          setSongs(sortedSongs);
        } else {
          console.error("Failed to load songs:", result.error);
          setSongs([]);
        }
      } catch (error) {
        console.error("Error loading songs:", error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }

    loadSongs();
  }, []);

  const handlePlaySong = (song: Song) => {
    setSelectedSong(song);
  };

  const handleClosePlayer = () => {
    setSelectedSong(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-secondary-cream via-primary-yellow/5 to-accent-coral/5 flex flex-col overflow-hidden">
      <Header />

      <main className="flex flex-1 flex-col">
        {/* Page Title */}
        <div className="text-center py-10 md:py-16 bg-transparent">
          <h1 className="text-4xl md:text-5xl font-bold text-text-teal font-heading mb-3">
            Our Song Library
          </h1>
          <p className="text-lg md:text-xl text-text-teal/80 font-body max-w-2xl mx-auto px-4">
            Explore a collection of heartfelt songs crafted for moments that
            matter.
          </p>
        </div>

        {/* Songs Grid */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-12">
          {loading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto mb-4"></div>
                <span className="text-lg text-text-teal/80">
                  Loading songs...
                </span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8 max-w-screen-2xl mx-auto">
              {songs.map((song, index) => {
                return (
                  <Card
                    key={song.id}
                    className="bg-white/80 backdrop-blur-sm border border-primary-yellow/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden animate-fade-in opacity-0"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <Link
                      href={`/library/${song.slug}`}
                      className="block p-2 sm:p-5 text-center"
                    >
                      <CardHeader className="p-0 mb-2 sm:mb-4">
                        {/* Album Art */}
                        <div className="aspect-square w-full mx-auto rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105">
                          {getVariantImageUrl(song) ? (
                            <Image
                              src={getVariantImageUrl(song)!}
                              alt={song.title}
                              width={256}
                              height={256}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <SongArtwork />
                          )}
                        </div>
                        <CardTitle className="text-text-teal text-sm sm:text-xl font-bold font-heading mt-2 sm:mt-5 line-clamp-2">
                          {song.title}
                        </CardTitle>
                        <p className="text-text-teal/70 text-xs sm:text-base font-body line-clamp-1">
                          {song.service_provider}
                        </p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <p className="text-text-teal/80 text-xs sm:text-sm font-body mb-2 sm:mb-3 line-clamp-1">
                          {song.categories && song.categories.length > 0
                            ? song.categories.join(", ")
                            : song.music_style || "Custom Creation"}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-text-teal/60 text-xs sm:text-sm font-body">
                          <span>{formatDuration(song.duration)}</span>
                        </div>
                      </CardContent>
                    </Link>
                    <div className="p-2 sm:p-5 pt-0">
                      <Button
                        className="w-full bg-gradient-to-r from-primary-yellow to-accent-coral text-white font-bold py-1.5 px-3 sm:py-3 sm:px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 text-xs sm:text-base"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlaySong(song);
                        }}
                      >
                        <Play className="h-5 w-5 mr-2" />
                        Listen Now
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Media Player Modal */}
      {selectedSong && (
        <MediaPlayer
          song={{
            title: selectedSong.title,
            artist: selectedSong.service_provider || "Melodia",
            song_url: selectedSong.song_url || undefined,
            timestamp_lyrics: selectedSong.timestamp_lyrics || undefined,
            timestamped_lyrics_variants:
              selectedSong.timestamped_lyrics_variants || undefined,
            selected_variant: selectedSong.selected_variant || undefined,
            slug: selectedSong.slug,
            show_lyrics: selectedSong.show_lyrics,
            plain_lyrics: selectedSong.lyrics,
          }}
          onClose={handleClosePlayer}
        />
      )}

      <Footer />
    </div>
  );
}
