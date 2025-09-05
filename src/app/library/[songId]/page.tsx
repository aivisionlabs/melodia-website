'use client'

import { Suspense, useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { FullPageMediaPlayer } from "@/components/FullPageMediaPlayer";
import { StructuredData } from "@/components/StructuredData";
import { SongStatusIndicator } from "@/components/song/SongStatusIndicator";
import { SongProgressBar } from "@/components/song/SongProgressBar";
import { SongErrorDisplay } from "@/components/song/SongErrorDisplay";
import { useSongStatusBySlug } from "@/hooks/use-song-status-client";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Client Component for song data loading with status checking
function SongPageContent({ slug }: { slug: string }) {
  const {
    song,
    status,
    isLoading,
    error,
    refreshStatus,
    isReady,
    estimatedCompletion,
    songUrl,
    duration
  } = useSongStatusBySlug(slug, {
    autoCheck: true,
    pollingInterval: 10000, // 10 seconds
    maxPollingTime: 10 * 60 * 1000 // 10 minutes
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner size="xl" text="Loading song..." />
        </div>
      </div>
    );
  }

  // Show error state
  if (error || !song) {
    return (
      <SongErrorDisplay 
        error={error || 'Song not found'} 
        onRetry={refreshStatus}
      />
    );
  }

  // Show processing state
  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <SongStatusIndicator status={status} />
          <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
            {song.title}
          </h1>
          <p className="text-gray-600 mb-6">
            Your song is being generated. This usually takes 5-10 minutes.
          </p>
          <SongProgressBar 
            estimatedCompletion={estimatedCompletion}
            onRefresh={refreshStatus}
          />
        </div>
      </div>
    );
  }

  // Show ready state
  if (isReady && songUrl) {
    // Map the song data to match FullPageMediaPlayer's expected interface
    const mappedSong = {
      id: song.id.toString(),
      title: song.title,
      artist: song.service_provider || "Melodia",
      song_url: songUrl,
      duration: duration || song.duration || 0,
      lyrics: song.lyrics || undefined,
      timestamp_lyrics: song.timestamp_lyrics || undefined,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants || undefined,
      selected_variant: song.selected_variant || undefined,
      slug: song.slug,
    };

    return (
      <>
        <StructuredData
          type="song"
          song={{
            id: song.id,
            title: song.title,
            service_provider: song.service_provider,
            song_url: songUrl,
            duration: duration || song.duration,
            timestamp_lyrics: song.timestamp_lyrics,
            timestamped_lyrics_variants: song.timestamped_lyrics_variants,
            lyrics: song.lyrics,
            music_style: song.music_style,
            slug: song.slug,
          }}
        />
        <FullPageMediaPlayer song={mappedSong} />
      </>
    );
  }

  // Show pending state
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <SongStatusIndicator status={status} />
        <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
          {song.title}
        </h1>
        <p className="text-gray-600 mb-6">
          Your song is waiting to be processed.
        </p>
        <button
          onClick={refreshStatus}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Check Status
        </button>
      </div>
    </div>
  );
}

// Loading component
function SongLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
        <span className="text-lg text-gray-600">
          Loading song experience...
        </span>
      </div>
    </div>
  );
}

// Main page component
export default function SongLibraryPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const [slug, setSlug] = useState<string | null>(null);

  // Await params for Next.js 15 compatibility
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams.songId);
    };
    getParams();
  }, [params]);

  if (!slug) {
    return <SongLoading />;
  }

  return (
    <Suspense fallback={<SongLoading />}>
      <SongPageContent slug={slug} />
    </Suspense>
  );
}
