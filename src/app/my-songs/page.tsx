"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { useAnonymousUser } from "@/hooks/use-anonymous-user";
import BottomNavigation from "@/components/BottomNavigation";
import { SongCard } from "@/components/SongCard";
import { MediaPlayer } from "@/components/MediaPlayer";
import type { SongVariant as SongVariantBase } from "@/lib/song-status-client";
import { LoginPromptCard } from "@/components/LoginPromptCard";

type DistinctSongVariant = SongVariantBase & {
  lyrics?: string;
  artist?: string;
};

type MediaPlayerSong = {
  metadata?: {
    title?: string;
    lyrics?: string;
    suno_task_id?: string;
    tags?: string;
  };
  song_variants?: DistinctSongVariant[];
  selected_variant?: number;
  suno_audio_id?: string;
};

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

  // Player State
  const [audioElements, setAudioElements] = useState<{
    [key: string]: HTMLAudioElement;
  }>({});
  const [playerState, setPlayerState] = useState<{
    [key: string]: {
      isPlaying: boolean;
      isLoading: boolean;
      currentTime: number;
      duration: number;
    };
  }>({});
  const [activePlayerId, setActivePlayerId] = useState<string | null>(null);
  const [showMediaPlayer, setShowMediaPlayer] = useState(false);
  const [mediaPlayerData, setMediaPlayerData] = useState<{
    song: MediaPlayerSong;
    selectedVariantIndex: number;
  } | null>(null);

  const getPlayerState = useCallback(
    (id: string) => {
      return (
        playerState[id] || {
          isPlaying: false,
          isLoading: false,
          currentTime: 0,
          duration: 0,
        }
      );
    },
    [playerState]
  );

  const updatePlayerState = useCallback((id: string, updates: object) => {
    setPlayerState((prev) => {
      const currentState = prev[id] || {
        isPlaying: false,
        isLoading: false,
        currentTime: 0,
        duration: 0,
      };
      return {
        ...prev,
        [id]: { ...currentState, ...updates },
      };
    });
  }, []);

  const handlePlayPause = useCallback(
    (song: ApiSongItem, variant: ApiSongVariant) => {
      const audioSrc =
        variant.sourceStreamAudioUrl ||
        variant.streamAudioUrl ||
        variant.sourceAudioUrl ||
        variant.audioUrl;
      const playerId = `${song.songId}-${variant.index}`;

      if (!audioSrc) return;

      if (activePlayerId && activePlayerId !== playerId) {
        const activeAudio = audioElements[activePlayerId];
        if (activeAudio) activeAudio.pause();
      }

      let audio = audioElements[playerId];
      if (!audio) {
        audio = new Audio(audioSrc);
        audio.preload = "metadata";
        setAudioElements((prev) => ({ ...prev, [playerId]: audio }));

        audio.onloadedmetadata = () =>
          updatePlayerState(playerId, {
            duration: audio.duration,
            isLoading: false,
          });
        audio.ontimeupdate = () =>
          updatePlayerState(playerId, { currentTime: audio.currentTime });
        audio.onplaying = () => {
          setActivePlayerId(playerId);
          updatePlayerState(playerId, { isPlaying: true, isLoading: false });
        };
        audio.onpause = () => {
          if (activePlayerId === playerId) {
            setActivePlayerId(null);
          }
          updatePlayerState(playerId, { isPlaying: false });
        };
        audio.onended = () => {
          setActivePlayerId(null);
          updatePlayerState(playerId, { isPlaying: false, currentTime: 0 });
        };
        audio.onerror = () => {
          console.error("Audio error:", audio.error);
          setActivePlayerId(null);
          updatePlayerState(playerId, { isLoading: false, isPlaying: false });
        };
      }

      const currentState = getPlayerState(playerId);

      if (currentState.isPlaying) {
        audio.pause();
      } else {
        updatePlayerState(playerId, { isLoading: true });
        audio.play().catch((e) => {
          console.error("Play error:", e);
          updatePlayerState(playerId, { isLoading: false });
        });
      }
    },
    [activePlayerId, audioElements, updatePlayerState, getPlayerState]
  );

  useEffect(() => {
    return () => {
      Object.values(audioElements).forEach((audio) => audio.pause());
    };
  }, [audioElements]);

  const handleViewLyrics = (song: ApiSongItem, variant: ApiSongVariant) => {
    const songForPlayer: MediaPlayerSong = {
      metadata: {
        title: song.title,
        tags: variant.tags,
        suno_task_id: song.requestId.toString(),
      },
      song_variants: song.variants.map(
        (v) =>
          ({
            id: v.suno_id || v.id || "",
            title: v.title || "",
            imageUrl: v.imageUrl || "",
            audioUrl: v.audioUrl || "",
            streamAudioUrl: v.streamAudioUrl,
            sourceAudioUrl: v.sourceAudioUrl,
            sourceStreamAudioUrl: v.sourceStreamAudioUrl,
            lyrics: v.lyrics,
            artist: v.artist,
            duration: v.duration || 0,
            variantStatus: v.variantStatus,
            tags: v.tags,
          } as DistinctSongVariant)
      ),
      selected_variant: variant.index,
      suno_audio_id: variant.suno_id,
    };
    setMediaPlayerData({
      song: songForPlayer,
      selectedVariantIndex: variant.index,
    });
    setShowMediaPlayer(true);
  };

  const handleDownload = (audioUrl: string, title: string) => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const allVariants = songs.flatMap((song) =>
    song.variants.map((variant) => ({ song, variant }))
  );

  return (
    <div className="min-h-screen bg-secondary-light-cream text-dark-teal font-body pt-20 pb-24">
      <div className="px-6">
        <div className="flex items-center gap-3 mb-6">
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
                <SongCard
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allVariants.map(({ song, variant }) => {
                const playerId = `${song.songId}-${variant.index}`;
                const state = getPlayerState(playerId);
                const downloadUrl = variant.sourceAudioUrl || variant.audioUrl;
                return (
                  <SongCard
                    key={playerId}
                    variant="completed"
                    title={song.title}
                    option={variant.index + 1}
                    status={variant.variantStatus.replace("_", " ")}
                    imageUrl={variant.imageUrl || undefined}
                    isPlaying={state.isPlaying}
                    isLoading={state.isLoading}
                    currentTime={state.currentTime}
                    duration={state.duration || variant.duration || 0}
                    onPlayPause={() => handlePlayPause(song, variant)}
                    onViewLyrics={() => handleViewLyrics(song, variant)}
                    isDownloadReady={variant.variantStatus === "DOWNLOAD_READY"}
                    onDownload={
                      downloadUrl
                        ? () => handleDownload(downloadUrl, song.title)
                        : undefined
                    }
                  />
                );
              })}
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
              onClick={() => router.push("/create-song")}
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

      {showMediaPlayer && mediaPlayerData && (
        <MediaPlayer
          song={mediaPlayerData.song}
          onClose={() => {
            setShowMediaPlayer(false);
            setMediaPlayerData(null);
            // Stop any active audio from the card players
            if (activePlayerId && audioElements[activePlayerId]) {
              audioElements[activePlayerId].pause();
            }
          }}
        />
      )}
    </div>
  );
}
