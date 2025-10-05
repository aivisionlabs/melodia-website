"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAnonymousUser } from "@/hooks/use-anonymous-user";
import BottomNavigation from "@/components/BottomNavigation";
import { SongRequestInProgressCard } from "@/components/SongRequestInProgressCard";
import SongOptionsDisplay from "@/components/SongOptionsDisplay";
import type { SongStatusResponse } from "@/lib/song-status-client";
import { LoginPromptCard } from "@/components/LoginPromptCard";

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
  inProgressRequests: {
    id: number;
    status: string | null;
    created_at: string;
    title: string;
  }[];
};

export default function MySongsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { anonymousUserId, loading: anonLoading } = useAnonymousUser();

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [songs, setSongs] = useState<ApiSongItem[]>([]);
  const [inProgressRequests, setInProgressRequests] = useState<
    { id: number; status: string | null; created_at: string; title: string }[]
  >([]);

  const isAuthResolved = !authLoading && !anonLoading;

  const fetchPage = useCallback(async () => {
    if (!isAuthResolved || loading || !hasMore) return;
    setLoading(true);

    const qp = new URLSearchParams();
    qp.set("page", String(page));
    qp.set("pageSize", "10");
    if (user?.id) qp.set("userId", String(user.id));
    else if (anonymousUserId) qp.set("anonymousUserId", anonymousUserId);

    try {
      const res = await fetch(`/api/fetch-user-song?${qp.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch songs");
      const data: FetchResponse = await res.json();

      if (data?.success) {
        setSongs((prev) => [...prev, ...data.songs]);
        setHasMore(data.hasMore);
        if (page === 1) setInProgressRequests(data.inProgressRequests || []);
        setPage((p) => p + 1);
      }
    } catch (error) {
      console.error("Error fetching user songs:", error);
      // Optionally, handle the error in the UI
    } finally {
      setLoading(false);
    }
  }, [isAuthResolved, loading, hasMore, page, user?.id, anonymousUserId]);

  useEffect(() => {
    if (isAuthResolved) {
      setSongs([]);
      setInProgressRequests([]);
      setPage(1);
      setHasMore(true);
    }
  }, [isAuthResolved, user?.id, anonymousUserId]);

  useEffect(() => {
    if (isAuthResolved && page === 1 && hasMore && !loading) {
      fetchPage();
    }
  }, [isAuthResolved, page, hasMore, loading, fetchPage]);

  // Infinite scroll
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!sentinelRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchPage();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [fetchPage, hasMore, loading]);

  const allSongs = songs.map((song) => {
    const songStatus: SongStatusResponse = {
      success: true,
      status: "COMPLETED",
      songId: song.songId,
      slug: "", // Not available here, will need adjustment if lyrical song nav is direct
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
      <div className="px-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-heading">My Songs</h1>
        </div>

        {!user && anonymousUserId && (
          <div className="mb-8">
            <LoginPromptCard />
          </div>
        )}

        {inProgressRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold font-heading mb-4">
              In progress
            </h2>
            <div className="space-y-4">
              {inProgressRequests.map((r) => (
                <SongRequestInProgressCard
                  key={r.id}
                  variant="in-progress"
                  title={r.title}
                  onView={() => router.push(`/generate-lyrics/${r.id}`)}
                />
              ))}
            </div>
          </div>
        )}

        {songs.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-semibold font-heading mb-4">
              Completed songs
            </h2>
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

        {songs.length === 0 && inProgressRequests.length === 0 && !loading && (
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

        {(loading || hasMore) && (
          <div
            ref={sentinelRef}
            className="py-6 text-center text-sm opacity-70"
          >
            {loading ? "Loading more songs..." : ""}
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}
