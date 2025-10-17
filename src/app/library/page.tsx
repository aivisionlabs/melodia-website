"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SongArtwork } from "@/components/SongArtwork";
import {
  getActiveSongsAction,
  getCategoriesWithCountsAction,
  getSongsByCategoryAction,
} from "@/lib/actions";
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
  const [categories, setCategories] = useState<
    Array<{ name: string; slug: string; count: number; sequence: number }>
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Helper function to get variant image URL with fallback to Melodia logo
  const getVariantImageUrl = (song: Song) => {
    if (song.suno_variants && song.suno_variants.length > 0) {
      return song.suno_variants[0]?.sourceImageUrl;
    }
    return null;
  };

  useEffect(() => {
    async function loadInitial() {
      try {
        const [catsRes, songsRes] = await Promise.all([
          getCategoriesWithCountsAction(),
          getActiveSongsAction(),
        ]);

        if (catsRes.success) {
          // Build fixed list: All + canonical order
          const pillCats = [
            { name: "All", slug: "all", count: catsRes.total, sequence: -1 },
            ...catsRes.categories.map((c) => ({
              name: c.name,
              slug: c.slug,
              count: c.count,
              sequence: c.sequence,
            })),
          ];
          setCategories(pillCats);
        } else {
          setCategories([
            {
              name: "All",
              slug: "all",
              count: songsRes.success ? songsRes.songs.length : 0,
              sequence: -1,
            },
          ]);
        }

        if (songsRes.success) {
          const sortedSongs = (songsRes.songs || []).sort((a, b) => {
            if (a.sequence !== undefined && b.sequence !== undefined)
              return a.sequence - b.sequence;
            if (a.sequence !== undefined && b.sequence === undefined) return -1;
            if (a.sequence === undefined && b.sequence !== undefined) return 1;
            return (
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
            );
          });
          setSongs(sortedSongs);
        } else {
          setSongs([]);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setSongs([]);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  const handleSelectCategory = async (slug: string) => {
    try {
      setSelectedCategory(slug);
      setLoading(true);
      const res = await getSongsByCategoryAction(slug === "all" ? null : slug);
      if (res.success) {
        const sortedSongs = (res.songs || []).sort((a, b) => {
          if (a.sequence !== undefined && b.sequence !== undefined)
            return a.sequence - b.sequence;
          if (a.sequence !== undefined && b.sequence === undefined) return -1;
          if (a.sequence === undefined && b.sequence !== undefined) return 1;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        setSongs(sortedSongs);
      } else {
        setSongs([]);
      }
    } catch (e) {
      console.error("Failed to filter songs:", e);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

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

        {/* Category Pills */}
        <div className="px-4 md:px-8 pb-4">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.slug}
                onClick={() => handleSelectCategory(cat.slug)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-full border transition-all duration-300 shadow-elegant ${selectedCategory === cat.slug ? "bg-[var(--primary-yellow)] text-[var(--text-teal)] border-[var(--primary-yellow)]" : "bg-white/90 text-[var(--text-teal)] border-[var(--border)] hover:bg-[var(--secondary-cream)]"}`}
                aria-pressed={selectedCategory === cat.slug}
              >
                <span className="font-body text-sm font-medium">
                  {cat.name}
                </span>
                <span className="ml-2 text-xs text-[color:rgba(7,59,76,0.7)] opacity-80">
                  {cat.count}
                </span>
              </button>
            ))}
          </div>
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
                      </CardHeader>
                      <CardContent className="p-0">
                        {song.song_description && (
                          <p className="text-text-teal/80 text-xs sm:text-sm font-body line-clamp-2">
                            {song.song_description}
                          </p>
                        )}
                        <div className="flex items-center justify-center gap-2 text-text-teal/60 text-xs sm:text-sm font-body mt-2">
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
