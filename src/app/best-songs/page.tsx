"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MediaPlayer } from "@/components/MediaPlayer";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface BestSongItem {
  id: number;
  title: string;
  slug: string;
  song_url: string | null;
  duration: number | null;
  status: string | null;
  metadata: any;
  created_at: string;
}

export default function BestSongsPage() {
  const [songs, setSongs] = useState<BestSongItem[]>([]);
  const [selectedSong, setSelectedSong] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/songs/best");
        const data = await res.json();
        if (data?.success) setSongs(data.songs || []);
      } catch {}
    })();
  }, []);

  const handlePlay = (song: BestSongItem) => {
    if (!song.song_url) return;
    setSelectedSong({
      title: song.title,
      song_url: song.song_url,
      duration: song.duration || 0,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-20">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-heading mb-6">Best Songs</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map((song) => (
            <div
              key={song.id}
              className="bg-card border border-border rounded-xl overflow-hidden"
            >
              <div className="relative h-40">
                <Image
                  src={
                    (song.metadata?.coverUrl as string) ||
                    "/images/melodia-logo.png"
                  }
                  alt={song.title}
                  fill
                  className="object-cover"
                />
                <Button
                  size="sm"
                  className="absolute bottom-2 right-2 bg-melodia-yellow text-melodia-teal"
                  onClick={() => handlePlay(song)}
                >
                  <Play className="h-4 w-4 mr-1" /> Play
                </Button>
              </div>
              <div className="p-4">
                <div className="font-semibold">{song.title}</div>
              </div>
            </div>
          ))}
        </div>

        {selectedSong && (
          <div className="mt-10">
            <MediaPlayer
              song={selectedSong}
              onClose={() => setSelectedSong(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
