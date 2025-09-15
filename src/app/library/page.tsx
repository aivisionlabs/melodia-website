"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { formatDuration } from "@/lib/utils";
import { Song } from "@/types";
import { Music, Play } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getActiveSongsAction } from "@/lib/actions";

export default function SongLibraryPage() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

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
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <Header />

      <main className="flex flex-1 overflow-hidden flex-col bg-slate-50">
        {/* Page Title */}
        <div className="text-center py-8 md:py-12 bg-slate-50">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4">
            Library
          </h1>
          <p className="text-xl px-2 md:text-2xl text-gray-600">
            Experience music with synchronized lyrics
          </p>
        </div>

        {/* Songs Grid */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {loading ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
                <span className="text-lg text-gray-600">Loading songs...</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {songs.map((song) => {
                // Generate gradient colors based on song categories or style
                const getGradientColor = (
                  categories: string[] | null,
                  style: string | null
                ) => {
                  if (!categories || categories.length === 0) {
                    if (!style) return "from-yellow-400 to-yellow-600";

                    const styleLower = style.toLowerCase();
                    if (styleLower.includes("birthday"))
                      return "from-pink-400 to-red-500";
                    if (
                      styleLower.includes("wedding") ||
                      styleLower.includes("love")
                    )
                      return "from-green-400 to-teal-500";
                    if (styleLower.includes("lullaby"))
                      return "from-yellow-400 to-yellow-600";
                    if (styleLower.includes("motivational"))
                      return "from-yellow-400 to-yellow-600";
                    if (styleLower.includes("musical"))
                      return "from-yellow-400 to-yellow-600";
                    return "from-yellow-400 to-yellow-600";
                  }

                  // Use categories for color generation
                  const categoryText = categories.join(" ").toLowerCase();
                  if (categoryText.includes("birthday"))
                    return "from-pink-400 to-red-500";
                  if (
                    categoryText.includes("wedding") ||
                    categoryText.includes("love") ||
                    categoryText.includes("romantic")
                  )
                    return "from-green-400 to-teal-500";
                  if (
                    categoryText.includes("lullaby") ||
                    categoryText.includes("sleep")
                  )
                    return "from-yellow-400 to-yellow-600";
                  if (
                    categoryText.includes("motivational") ||
                    categoryText.includes("inspirational")
                  )
                    return "from-yellow-400 to-yellow-600";
                  if (
                    categoryText.includes("musical") ||
                    categoryText.includes("party")
                  )
                    return "from-yellow-400 to-yellow-600";
                  if (
                    categoryText.includes("acoustic") ||
                    categoryText.includes("ballad")
                  )
                    return "from-yellow-400 to-yellow-600";
                  return "from-yellow-400 to-yellow-600";
                };

                return (
                  <Card
                    key={song.id}
                    className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <Link href={`/library/${song.slug}`}>
                      <CardHeader className="text-center">
                        {/* Album Art Placeholder */}
                        <div
                          className={`w-32 h-32 mx-auto mb-4 rounded-xl bg-gradient-to-br ${getGradientColor(
                            song.categories || null,
                            song.music_style
                          )} flex items-center justify-center shadow-lg`}
                        >
                          <Music className="h-12 w-12 text-white" />
                        </div>
                        <CardTitle className="text-gray-800 text-xl font-bold">
                          {song.title}
                        </CardTitle>
                        <p className="text-gray-600 text-lg">
                          {song.service_provider}
                        </p>
                      </CardHeader>
                      <CardContent className="text-center space-y-4">
                        <p className="text-gray-700 text-sm">
                          {song.categories && song.categories.length > 0
                            ? song.categories.join(", ")
                            : song.music_style || "Custom Creation"}
                        </p>
                        <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                          <span>Duration: {formatDuration(song.duration)}</span>
                        </div>
                      </CardContent>
                    </Link>
                    <div className="p-4 pt-0">
                      <Button
                        className="w-full bg-yellow-400 text-gray-900 hover:bg-yellow-500"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePlaySong(song);
                        }}
                      >
                        <Play className="h-4 w-4 mr-2" />
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
          }}
          onClose={handleClosePlayer}
        />
      )}

      <Footer />
    </div>
  );
}
