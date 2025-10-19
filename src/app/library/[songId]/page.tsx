import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FullPageMediaPlayer } from "@/components/FullPageMediaPlayer";
import { StructuredData } from "@/components/StructuredData";
import { SongLoadingSkeleton } from "../../../components/SongLoadingSkeleton";

import {
  getSongBySlug,
  getSongBySlugLightweight,
} from "@/lib/db/queries/select";

// Generate dynamic metadata for each song page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ songId: string }>;
}): Promise<Metadata> {
  const { songId } = await params;

  try {
    // Use lightweight query for metadata generation (faster)
    const song = await getSongBySlugLightweight(songId);

    if (!song) {
      return {
        title: "Song Not Found | Melodia",
        description: "The song you're looking for could not be found.",
      };
    }

    // Get image URL from suno variants or use default
    const imageUrl =
      song.suno_variants &&
      Array.isArray(song.suno_variants) &&
      song.suno_variants.length > 0
        ? (song.suno_variants[0] as any)?.sourceImageUrl ||
          "/images/melodia-logo-og.jpeg"
        : "/images/melodia-logo-og.jpeg";

    // Create description
    const description = `Listen to ${song.title}, a personalized song created by Melodia. Perfect for special occasions and creating lasting memories.`;

    // Build keywords array
    const keywords = [
      song.title,
      "personalized song",
      "custom music",
      "AI generated song",
      "gift song",
      "musical gift",
    ];

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
  return <SongLoadingSkeleton />;
}

// Main page component
export default async function SongLibraryPage({
  params,
}: {
  params: Promise<{ songId: string }>;
}) {
  const { songId } = await params;

  // First, check if song exists with lightweight query (faster)
  let songExists = false;
  try {
    const lightweightSong = await getSongBySlugLightweight(songId);
    songExists = !!lightweightSong;
  } catch (error) {
    console.error("Error checking song existence:", error);
  }

  if (!songExists) {
    notFound();
  }

  return (
    <Suspense fallback={<SongLoading />}>
      <SongPageContentWrapper songId={songId} />
    </Suspense>
  );
}

// Wrapper component that handles the full song data loading
async function SongPageContentWrapper({ songId }: { songId: string }) {
  // Get full song data (this will be faster since we know the song exists)
  let song = null;
  try {
    song = await getSongBySlug(songId);
  } catch (error) {
    console.error("Error fetching song from database:", error);
  }

  if (!song) {
    notFound();
  }

  return <SongPageContent song={song} />;
}
