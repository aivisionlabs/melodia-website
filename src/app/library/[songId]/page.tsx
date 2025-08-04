import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FullPageMediaPlayer } from "@/components/FullPageMediaPlayer";
import { customCreations } from "@/lib/constants";

// Server Component for song data loading
async function SongPageContent({ songId }: { songId: string }) {
  const song = customCreations.find((s) => s.slug === songId);

  if (!song) {
    notFound();
  }

  // Map the song data to match FullPageMediaPlayer's expected interface
  const mappedSong = {
    id: song.id.toString(),
    title: song.title,
    artist: song.service_provider || "Melodia",
    audioUrl: song.song_url || undefined,
    duration: song.duration || 0,
    timestamp_lyrics: song.timestamp_lyrics || undefined,
    slug: song.slug,
  };

  return <FullPageMediaPlayer song={mappedSong} />;
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
  const song = customCreations.find((s) => s.slug === songId);

  if (!song) {
    notFound();
  }

  return (
    <Suspense fallback={<SongLoading />}>
      <SongPageContent songId={songId} />
    </Suspense>
  );
}
