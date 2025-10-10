"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAnonymousUser } from "@/hooks/use-anonymous-user";
import BottomNavigation from "@/components/BottomNavigation";
import { SongRequestInProgressCard } from "@/components/SongRequestInProgressCard";
import SongOptionsDisplay from "@/components/SongOptionsDisplay";
import type { SongStatusResponse } from "@/lib/song-status-client";
import { LoginPromptCard } from "@/components/LoginPromptCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useAuthenticatedApi } from "@/lib/api-client";

type ApiSongVariant = {
  index: number;
  id?: string;
  title?: string;
  imageUrl?: string | null;
  duration?: number;
  sourceStreamAudioUrl?: string | null;
  sourceAudioUrl?: string | null;
  streamAudioUrl?: string | null;
  audioUrl?: string | null;
  variantStatus: "PENDING" | "STREAM_READY" | "DOWNLOAD_READY";
  lyrics?: string;
  artist?: string;
  tags?: string;
  suno_id?: string;
};

type ApiSongItem = {
  songId: number;
  requestId: number;
  title: string;
  slug: string;
  createdAt: string;
  variants: ApiSongVariant[];
  selectedVariantIndex?: number | null;
  variantTimestampLyricsProcessed?: any;
};

type FetchResponse = {
  success: boolean;
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
  songs: ApiSongItem[];
  items: {
    requestId: number;
    createdAt: string;
    stage: "SONG_REQUEST_CREATED" | "LYRICS_CREATED" | "SONG_CREATED";
    title: string;
    song: { id: number; slug: string } | null;
  }[];
};

export default function MySongsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { anonymousUserId, loading: anonLoading } = useAnonymousUser();
  const { apiClient, hasUserContext } = useAuthenticatedApi();

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // Track pagination only
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<ApiSongItem[]>([]);
  const [items, setItems] = useState<
    {
      requestId: number;
      createdAt: string;
      stage: "SONG_REQUEST_CREATED" | "LYRICS_CREATED" | "SONG_CREATED";
      title: string;
      song: { id: number; slug: string } | null;
    }[]
  >([]);

  const isAuthResolved = !authLoading && !anonLoading;
  const pageSize = 10;

  const fetchPage = useCallback(
    async (page: number) => {
      if (!isAuthResolved || loading || !hasUserContext) return;
      setLoading(true);

      const qp = new URLSearchParams();
      qp.set("page", String(page));
      qp.set("pageSize", String(pageSize));

      try {
        const res = await apiClient.get(
          `/api/fetch-user-song?${qp.toString()}`
        );
        if (!res.ok) {
          if (res.status === 401) {
            // Handle authentication error
            console.warn("Authentication required for fetching songs");
            return;
          }
          throw new Error("Failed to fetch songs");
        }
        const data: FetchResponse = await res.json();

        if (data?.success) {
          setSongs(data.songs);
          setTotalPages(Math.ceil(data.total / pageSize));
          if (page === 1) setItems(data.items || []);
        }
      } catch (error) {
        console.error("Error fetching user songs:", error);
        // Optionally, handle the error in the UI
      } finally {
        setLoading(false);
      }
    },
    [isAuthResolved, loading, pageSize, apiClient, hasUserContext]
  );

  useEffect(() => {
    if (isAuthResolved) {
      setSongs([]);
      setItems([]);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [isAuthResolved, hasUserContext]);

  useEffect(() => {
    if (isAuthResolved && currentPage === 1) {
      fetchPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthResolved, currentPage]); // Removed fetchPage from dependencies to prevent infinite loop

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
      fetchPage(newPage);
    }
  };

  const handlePreviousPage = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    handlePageChange(currentPage + 1);
  };

  const allSongs = songs.map((song) => {
    const songStatus: SongStatusResponse = {
      success: true,
      status: "COMPLETED",
      songId: song.songId,
      slug: song.slug, // Now available from API
      selectedVariantIndex: song.selectedVariantIndex,
      variantTimestampLyricsProcessed: song.variantTimestampLyricsProcessed,
      variants: song.variants.map((variant) => ({
        id: variant.suno_id || variant.id || "",
        title: song.title,
        imageUrl: variant.imageUrl || "",
        audioUrl: variant.audioUrl || "",
        streamAudioUrl: variant.streamAudioUrl || undefined,
        sourceAudioUrl: variant.sourceAudioUrl || undefined,
        sourceStreamAudioUrl: variant.sourceStreamAudioUrl || undefined,
        duration: variant.duration || 0,
        variantStatus: variant.variantStatus,
      })),
    };
    return { song, songStatus };
  });

  return (
    <div className="min-h-screen bg-secondary-light-cream text-dark-teal font-body pt-20 pb-24">
      <div className="px-4">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading">My Songs</h1>
        </div>

        {!user && anonymousUserId && (
          <div className="mb-8">
            <LoginPromptCard />
          </div>
        )}

        {items.filter((i) => i.stage !== "SONG_CREATED").length > 0 && (
          <div className="mb-8">
            <div className="text-xl font-semibold  mb-4">In progress</div>
            <div className="space-y-4">
              {items
                .filter(
                  (i) =>
                    i.stage === "SONG_REQUEST_CREATED" ||
                    i.stage === "LYRICS_CREATED"
                )
                .map((i) => (
                  <SongRequestInProgressCard
                    key={i.requestId}
                    variant="in-progress"
                    title={i.title}
                    onView={() =>
                      router.push(`/generate-lyrics/${i.requestId}`)
                    }
                  />
                ))}
            </div>
          </div>
        )}

        {songs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-l font-semibold mb-4">Completed songs</h2>
            <div className="space-y-4">
              {allSongs.map(({ song, songStatus }) => (
                <SongOptionsDisplay
                  key={song.songId}
                  songStatus={songStatus}
                  isStandalonePage={false}
                />
              ))}
            </div>
          </div>
        )}

        {songs.length === 0 && items.length === 0 && !loading && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-heading font-bold mb-2">
              No songs yet
            </h2>
            <p className="text-dark-teal/70 mb-6">Ready to make some music?</p>
            <Button
              className="bg-accent-vibrant-coral text-white"
              onClick={() => router.push("/")}
              size="lg"
            >
              Create Your First Song
            </Button>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={currentPage === 1 || loading}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    disabled={loading}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages || loading}
              className="flex items-center gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Loading indicator */}
        {loading && (
          <div className="py-6 text-center text-sm opacity-70">
            Loading songs...
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
