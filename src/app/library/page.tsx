"use client";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { SongArtwork } from "@/components/SongArtwork";
import { LibrarySearchBar } from "@/components/LibrarySearchBar";
import { SongLikeButton } from "@/components/SongLikeButton";
import {
  getActiveSongsAction,
  getCategoriesWithCountsAction,
  getSongsByCategoryAction,
  fuzzySearchSongsAction,
} from "@/lib/actions";
import { formatDuration } from "@/lib/utils";
import { trackSearchEvent } from "@/lib/analytics";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSongs, setTotalSongs] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const SONGS_PER_PAGE = 20;

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
          getActiveSongsAction(SONGS_PER_PAGE, 0),
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
              count: songsRes.success ? songsRes.total : 0,
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
          setTotalSongs(songsRes.total);
          setHasMore(songsRes.hasMore);
          setCurrentPage(0);
        } else {
          setSongs([]);
          setTotalSongs(0);
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error loading initial data:", error);
        setSongs([]);
        setTotalSongs(0);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    }

    loadInitial();
  }, []);

  const handleSelectCategory = async (slug: string) => {
    try {
      setSelectedCategory(slug);
      setSearchQuery(""); // Clear search when selecting category
      setLoading(true);
      setCurrentPage(0);

      const res = await getSongsByCategoryAction(
        slug === "all" ? null : slug,
        SONGS_PER_PAGE,
        0
      );
      if (res.success) {
        const sortedSongs = (res.songs || []).sort((a: Song, b: Song) => {
          if (a.sequence !== undefined && b.sequence !== undefined)
            return a.sequence - b.sequence;
          if (a.sequence !== undefined && b.sequence === undefined) return -1;
          if (a.sequence === undefined && b.sequence !== undefined) return 1;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        setSongs(sortedSongs);
        setTotalSongs(res.total);
        setHasMore(res.hasMore);
        setCurrentPage(0);
      } else {
        setSongs([]);
        setTotalSongs(0);
        setHasMore(false);
      }
    } catch (e) {
      console.error("Failed to filter songs:", e);
      setSongs([]);
      setTotalSongs(0);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    try {
      setSearchQuery(query);
      setIsSearching(true);
      setCurrentPage(0);

      if (!query.trim()) {
        // If search is cleared, go back to selected category
        await handleSelectCategory(selectedCategory);
        return;
      }

      const res = await fuzzySearchSongsAction(query, 50);
      if (res.success) {
        // Fuzzy search already returns results sorted by relevance
        setSongs(res.songs || []);
        setTotalSongs(res.total);
        setHasMore(false); // Fuzzy search doesn't use pagination
        setCurrentPage(0);

        // Track search analytics
        trackSearchEvent.search(query, res.songs.length, "text", "fuzzy");
      } else {
        setSongs([]);
        setTotalSongs(0);
        setHasMore(false);

        // Track no results
        trackSearchEvent.searchNoResults(query, "text");
      }
    } catch (e) {
      console.error("Failed to search songs:", e);
      setSongs([]);
      setTotalSongs(0);
      setHasMore(false);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePlaySong = (song: Song) => {
    setSelectedSong(song);
  };

  const handleClosePlayer = () => {
    setSelectedSong(null);
  };

  const loadMoreSongs = async () => {
    if (loadingMore || !hasMore) return;

    try {
      setLoadingMore(true);
      const nextPage = currentPage + 1;
      const offset = nextPage * SONGS_PER_PAGE;

      let res;
      if (searchQuery.trim()) {
        res = await fuzzySearchSongsAction(searchQuery, 50);
      } else {
        res = await getSongsByCategoryAction(
          selectedCategory === "all" ? null : selectedCategory,
          SONGS_PER_PAGE,
          offset
        );
      }

      if (res.success) {
        const sortedSongs = (res.songs || []).sort((a: Song, b: Song) => {
          if (a.sequence !== undefined && b.sequence !== undefined)
            return a.sequence - b.sequence;
          if (a.sequence !== undefined && b.sequence === undefined) return -1;
          if (a.sequence === undefined && b.sequence !== undefined) return 1;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });

        setSongs((prev) => [...prev, ...sortedSongs]);
        setHasMore("hasMore" in res ? res.hasMore : false);
        setCurrentPage(nextPage);
      }
    } catch (e) {
      console.error("Failed to load more songs:", e);
    } finally {
      setLoadingMore(false);
    }
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

        {/* Search Bar */}
        <div className="px-4 md:px-8 pb-6">
          <LibrarySearchBar
            onSearch={handleSearch}
            placeholder="Search songs by title, description, or speak to search..."
            className="max-w-lg"
          />
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
          {loading || isSearching ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-yellow mx-auto mb-4"></div>
                <span className="text-lg text-text-teal/80">
                  {isSearching ? "Searching songs..." : "Loading songs..."}
                </span>
              </div>
            </div>
          ) : songs.length === 0 ? (
            <div className="flex items-center justify-center min-h-64">
              <div className="text-center">
                <div className="text-6xl mb-4">🎵</div>
                <h3 className="text-xl font-semibold text-text-teal mb-2">
                  {searchQuery ? "No songs found" : "No songs available"}
                </h3>
                <p className="text-text-teal/60">
                  {searchQuery
                    ? `No songs match "${searchQuery}". Try a different search term.`
                    : "There are no songs in this category yet."}
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8 max-w-screen-2xl mx-auto">
              {songs.map((song, index) => {
                // Calculate animation delay relative to current page to avoid long delays
                const animationDelay = (index % SONGS_PER_PAGE) * 50; // Reduced delay for smoother animation
                const isNewSong = index >= songs.length - SONGS_PER_PAGE; // Check if this is a newly loaded song

                return (
                  <Card
                    key={song.id}
                    className={`bg-white/80 backdrop-blur-sm border border-primary-yellow/20 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden ${
                      isNewSong ? "animate-fade-in opacity-0" : "opacity-100"
                    }`}
                    style={{
                      animationDelay: `${animationDelay}ms`,
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
                      <div className="flex justify-start mb-2">
                        <SongLikeButton
                          slug={song.slug}
                          initialCount={song.likes_count || 0}
                          size="sm"
                          songTitle={song.title}
                          songId={song.id.toString()}
                          pageContext="library_grid"
                        />
                      </div>
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

          {/* Load More Button */}
          {hasMore && songs.length > 0 && (
            <div className="flex flex-col items-center mt-8">
              <Button
                onClick={loadMoreSongs}
                disabled={loadingMore}
                className="bg-gradient-to-r from-primary-yellow to-accent-coral text-white font-bold py-3 px-8 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingMore ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Loading more songs...
                  </>
                ) : (
                  `Load More Songs (${songs.length} of ${totalSongs})`
                )}
              </Button>

              {/* Loading skeleton for new songs */}
              {loadingMore && (
                <div className="mt-6 w-full max-w-screen-2xl mx-auto">
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 md:gap-8">
                    {Array.from({ length: SONGS_PER_PAGE }).map((_, index) => (
                      <div
                        key={`loading-${index}`}
                        className="bg-white/40 backdrop-blur-sm border border-primary-yellow/10 rounded-xl shadow-lg animate-pulse"
                      >
                        <div className="p-2 sm:p-5 text-center">
                          <div className="aspect-square w-full mx-auto rounded-lg bg-gray-200 mb-2 sm:mb-4"></div>
                          <div className="h-4 bg-gray-200 rounded mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
                          <div className="h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex items-center justify-center text-text-teal/60">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-yellow mr-2"></div>
                    <span className="text-sm">Adding new songs...</span>
                  </div>
                </div>
              )}
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
            likes_count: selectedSong.likes_count || 0,
          }}
          onClose={handleClosePlayer}
        />
      )}

      <Footer />
    </div>
  );
}
