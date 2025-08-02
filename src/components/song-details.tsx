"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDuration } from "@/lib/utils";
import { Music, Clock, ExternalLink } from "lucide-react";
import { PublicSong } from "@/types";

interface SongDetailsProps {
  song: PublicSong;
}

export function SongDetails({ song }: SongDetailsProps) {
  return (
    <>
      {/* Song Details */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Main Content */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Music className="h-6 w-6 text-purple-600" />
                {song.title}
              </CardTitle>
              <CardDescription>
                {song.music_style && (
                  <span className="inline-block bg-purple-100 text-purple-800 text-sm px-3 py-1 rounded-full mr-2 mb-2">
                    {song.music_style}
                  </span>
                )}
                {song.service_provider && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                    {song.service_provider}
                  </span>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {song.duration && (
                <div className="flex items-center text-sm text-gray-600">
                  <Clock className="h-4 w-4 mr-2" />
                  Duration: {formatDuration(song.duration)}
                </div>
              )}

              {song.song_url && (
                <div className="flex gap-2">
                  <Button asChild>
                    <a
                      href={song.song_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Listen to Song
                    </a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Lyrics */}
        {song.lyrics && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Lyrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {song.lyrics}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Timestamped Lyrics */}
      {song.timestamp_lyrics && song.timestamp_lyrics.length > 0 && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>
                Click on any line to jump to that part of the song
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {song.timestamp_lyrics.map((line, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                    onClick={() => {
                      // This would integrate with an audio player
                      console.log(`Jump to ${line.start}s`);
                    }}
                  >
                    <span className="text-xs text-gray-500 min-w-[60px]">
                      {Math.floor(line.start / 60)}:
                      {(line.start % 60).toString().padStart(2, "0")}
                    </span>
                    <span className="text-sm">{line.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
