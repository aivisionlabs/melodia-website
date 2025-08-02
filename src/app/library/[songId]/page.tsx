import { Suspense } from "react";
import { notFound } from "next/navigation";
import { FullPageMediaPlayer } from "@/components/FullPageMediaPlayer";

import {
  // pakurKiChhayaLyricsData,
  ruchiMyQueenLyricsData,
} from "@/lib/lyrics-data";

// Hardcoded song data for demo purposes
const DEMO_SONGS = {
  // "pakur-ki-chhaya": {
  //   id: "pakur-ki-chhaya",
  //   title: "Pakur Ki Chhaya",
  //   artist: "Melodia",
  //   audioUrl: "/audio/song-library/pakur-ki-chhaya.mp3",
  //   duration: 249, // Updated duration based on converted lyrics
  //   timestamp_lyrics: pakurKiChhayaLyricsData, // Use the converted lyrics
  // },
  "ruchi-my-queen": {
    id: "ruchi-my-queen",
    title: "Ruchi My Queen",
    artist: "Melodia",
    audioUrl: "/audio/song-library/ruchi-my-queen.mp3",
    duration: 179,
    timestamp_lyrics: ruchiMyQueenLyricsData,
  },
};

// Server Component for song data loading
async function SongPageContent({ songId }: { songId: string }) {
  const song = DEMO_SONGS[songId as keyof typeof DEMO_SONGS];

  if (!song) {
    notFound();
  }

  return <FullPageMediaPlayer song={song} />;
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
  const song = DEMO_SONGS[songId as keyof typeof DEMO_SONGS];

  if (!song) {
    notFound();
  }

  return (
    <Suspense fallback={<SongLoading />}>
      <SongPageContent songId={songId} />
    </Suspense>
  );
}
