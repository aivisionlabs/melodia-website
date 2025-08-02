"use client";

import { useState, useEffect } from "react";
import { getSongs } from "@/lib/actions";
import { PublicSong } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

export const SongList = () => {
  const [songs, setSongs] = useState<PublicSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  async function fetchSongs() {
    try {
      setLoading(true);
      setError(null);
      const result = await getSongs();

      if (result.error) {
        setError(result.error);
        return;
      }

      setSongs(result.songs);
    } catch (error) {
      console.error("Error fetching songs:", error);
      setError("Failed to load songs");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2">Loading songs...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSongs}>Try Again</Button>
      </div>
    );
  }

  if (songs.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No songs found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {songs.map((song) => (
        <Card key={song.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg">{song.title}</CardTitle>
            <p className="text-gray-600">
              {song.service_provider || "Unknown Artist"}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {song.music_style && (
                <p className="text-sm text-gray-500">
                  Style: {song.music_style}
                </p>
              )}
              {song.duration && (
                <p className="text-sm text-gray-500">
                  Duration: {formatDuration(song.duration)}
                </p>
              )}
              <Button asChild className="w-full">
                <Link href={`/songs/${song.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
