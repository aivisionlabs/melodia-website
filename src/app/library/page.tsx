"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { customCreations } from "@/lib/constants";
import { Song } from "@/types";
import { Music, Play } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function SongLibraryPage() {
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {customCreations.map((song) => {
              // Generate gradient colors based on song style
              const getGradientColor = (style: string | null) => {
                if (!style) return "from-blue-400 to-purple-500";

                const styleLower = style.toLowerCase();
                if (styleLower.includes("birthday"))
                  return "from-pink-400 to-red-500";
                if (
                  styleLower.includes("wedding") ||
                  styleLower.includes("love")
                )
                  return "from-green-400 to-teal-500";
                if (styleLower.includes("lullaby"))
                  return "from-indigo-400 to-blue-500";
                if (styleLower.includes("motivational"))
                  return "from-orange-400 to-red-500";
                if (styleLower.includes("musical"))
                  return "from-purple-400 to-pink-500";
                return "from-blue-400 to-purple-500";
              };

              const formatDuration = (duration: number | null) => {
                if (!duration) return "Unknown";
                const minutes = Math.floor(duration / 60);
                const seconds = duration % 60;
                return `${minutes}:${seconds.toString().padStart(2, "0")}`;
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
                        {song.music_style || "Custom Creation"}
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
        </div>
      </main>

      {/* Media Player Modal */}
      {selectedSong && (
        <MediaPlayer
          song={{
            title: selectedSong.title,
            artist: selectedSong.service_provider || "Melodia",
            audioUrl: selectedSong.song_url || undefined,
            lyrics: selectedSong.timestamp_lyrics || undefined,
            slug: selectedSong.slug,
          }}
          onClose={handleClosePlayer}
        />
      )}

      <Footer />
    </div>
  );
}
