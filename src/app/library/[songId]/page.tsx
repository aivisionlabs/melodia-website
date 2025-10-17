import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FullPageMediaPlayer } from "@/components/FullPageMediaPlayer";
import { StructuredData } from "@/components/StructuredData";

import { getSongBySlug } from "@/lib/db/services";

// Generate dynamic metadata for each song page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ songId: string }>;
}): Promise<Metadata> {
  const { songId } = await params;

  try {
    const song = await getSongBySlug(songId);

    if (!song) {
      return {
        title: "Song Not Found | Melodia",
        description: "The song you're looking for could not be found.",
      };
    }

    // Get image URL from suno variants or use default
    const imageUrl =
      song.suno_variants?.[0]?.sourceImageUrl || "/images/melodia-logo-og.jpeg";

    // Create description from song_description or generate one
    const description =
      song.song_description ||
      `Listen to ${song.title}, a personalized ${song.music_style || "custom"} song created by Melodia. Perfect for special occasions and creating lasting memories.`;

    // Build keywords array
    const keywords = [
      song.title,
      ...(song.categories || []),
      song.music_style,
      "personalized song",
      "custom music",
      "AI generated song",
      "gift song",
      "musical gift",
    ].filter(Boolean);

    return {
      title: `${song.title} - Personalized Song | Melodia`,
      description: description.substring(0, 160), // Keep under 160 chars for SEO
      keywords: keywords.join(", "),
      authors: [{ name: "Melodia" }],
      creator: "Melodia",
      publisher: "Melodia",
      openGraph: {
        title: song.title,
        description: description.substring(0, 200),
        url: `https://melodia-songs.com/library/${song.slug}`,
        siteName: "Melodia",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${song.title} - Album Artwork`,
          },
        ],
        locale: "en_US",
        type: "music.song",
      },
      twitter: {
        card: "summary_large_image",
        title: song.title,
        description: description.substring(0, 200),
        images: [imageUrl],
        creator: "@melodia_songs",
        site: "@melodia_songs",
      },
      alternates: {
        canonical: `/library/${song.slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  } catch (error) {
    console.error("Error generating metadata for song:", error);
    return {
      title: "Song | Melodia",
      description: "Listen to personalized songs created by Melodia.",
    };
  }
}

// Server Component for song data loading
async function SongPageContent({ song }: { song: any }) {
  // Map the song data to match FullPageMediaPlayer's expected interface
  const mappedSong = {
    id: song.id.toString(),
    title: song.title,
    artist: song.service_provider || "Melodia",
    song_url: song.song_url || undefined,
    duration: song.duration || 0,
    timestamp_lyrics: song.timestamp_lyrics || undefined,
    timestamped_lyrics_variants: song.timestamped_lyrics_variants || undefined,
    selected_variant: song.selected_variant || undefined,
    lyrics: song.lyrics || null,
    show_lyrics: song.show_lyrics,
    slug: song.slug,
    likes_count: song.likes_count || 0,
    suno_variants: song.suno_variants || undefined,
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
