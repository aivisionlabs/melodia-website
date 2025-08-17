import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FullPageMediaPlayer } from "@/components/FullPageMediaPlayer";
import { StructuredData } from "@/components/StructuredData";

import { getSongBySlug } from "@/lib/db/services";

// Server Component for song data loading
async function SongPageContent({ song }: { song: any }) {
  // Map the song data to match FullPageMediaPlayer's expected interface
  const mappedSong = {
    id: song.id.toString(),
    title: song.title,
    artist: song.service_provider || "Melodia",
    song_url: song.song_url || undefined,
    duration: song.duration || 0,
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
          song_url: song.song_url,
          duration: song.duration,
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
export default async function SongLibraryPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;

  // Get song from database (only active songs)
  let song = null;
  try {
    song = await getSongBySlug(songId);
  } catch (error) {
    console.error("Error fetching song from database:", error);
  }

  if (!song) {
    notFound();
  }

  return (
    <Suspense fallback={<SongLoading />}>
      <SongPageContent song={song} />
    </Suspense>
  );
}
