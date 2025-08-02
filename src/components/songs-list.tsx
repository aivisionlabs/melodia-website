"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatDuration } from "@/lib/utils";
import { Music, Clock } from "lucide-react";
import { PublicSong } from "@/types";

interface SongsListProps {
  initialSongs: PublicSong[];
  hasMore: boolean;
  searchQuery?: string;
}

export function SongsList({
  initialSongs,
  searchQuery,
}: Omit<SongsListProps, 'hasMore'>) {
  const [songs] = useState(initialSongs);

  if (songs.length === 0) {
    return (
      <div className="text-center py-12">
        <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No songs found
        </h3>
        <p className="text-gray-600 mb-4">
          {searchQuery
            ? "Try adjusting your search terms."
            : "Check back later for new songs."}
        </p>
        {searchQuery && (
          <Link href="/songs">
            <Button>Clear Search</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {songs.map((song) => (
        <Card key={song.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Music className="h-5 w-5 text-purple-600" />
              {song.title}
            </CardTitle>
            <CardDescription>
              {song.music_style && (
                <span className="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mr-2">
                  {song.music_style}
                </span>
              )}
              {song.service_provider && (
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {song.service_provider}
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {song.duration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatDuration(song.duration)}
                </div>
              )}

              {song.lyrics && (
                <p className="text-sm text-gray-700 line-clamp-3">
                  {song.lyrics}
                </p>
              )}

              <div className="flex gap-2">
                <Link href={`/songs/${song.id}`} className="flex-1">
                  <Button className="w-full" size="sm">
                    View Details
                  </Button>
                </Link>
                {song.song_url && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={song.song_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Listen
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
