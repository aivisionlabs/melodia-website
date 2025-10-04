"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Song } from "@/types";
import { Music, Play } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
// Note: We'll need to create a server action to get songs

export default function SongLibraryPage() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadSongs() {
      try {
        // For now, use empty array until we create a proper server action
        const songs: Song[] = [];
        // Sort songs by created_at (newest first)
        const sortedSongs = songs.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setSongs(sortedSongs);
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

                return (
                  <Card
                    key={song.id}
                    className="bg-white border border-gray-200 hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer"
                  >
                    <Link href={`/library/${song.slug}`}>
                      <CardHeader className="text-center">
                        {/* Album Art Placeholder */}
                        <div
                          className={`w-32 h-32 mx-auto mb-4 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg`}
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
                          <span>Duration: {"1:20"}</span>
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
