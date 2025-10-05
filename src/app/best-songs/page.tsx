"use client";

import { useEffect, useState } from "react";
import SongOptionsDisplay from "@/components/SongOptionsDisplay";
import { SongStatusResponse } from "@/lib/song-status-client";

export default function BestSongsPage() {
  const [songs, setSongs] = useState<SongStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        console.log("Fetching library songs from frontend...");
        setLoading(true);
        const res = await fetch("/api/songs/library");
        const data = await res.json();
        console.log("API response:", data);
        if (data?.success) {
          console.log("Setting songs:", data.songs);
          setSongs(data.songs || []);
        } else {
          console.error("API returned success: false", data);
        }
      } catch (error) {
        console.error("Error fetching library songs:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-16 pb-20">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-heading mb-6">Library Songs</h1>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              Loading library songs...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="min-h-screen bg-background text-foreground pt-16 pb-20">
        <div className="max-w-6xl mx-auto p-6">
          <h1 className="text-3xl font-heading mb-6">Library Songs</h1>
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">
              No library songs found.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              Songs need to be marked with "add_to_library = true" to appear
              here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pt-16 pb-20">
      <div className="max-w-6xl mx-auto p-6">
        <h1 className="text-3xl font-heading mb-6">Library Songs</h1>

        <div className="space-y-8">
          {songs.map((song) => (
            <div
              key={song.songId}
              className="bg-card border border-border rounded-xl p-6"
            >
              <SongOptionsDisplay songStatus={song} isStandalonePage={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
