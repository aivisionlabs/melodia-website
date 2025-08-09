"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteSongButton from "@/components/DeleteSongButton";
import { Song } from "@/types";

interface SongListProps {
  songs: Song[];
}

export default function SongList({ songs }: SongListProps) {
  const [currentSongs, setCurrentSongs] = useState<Song[]>(songs);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "generating":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSongDelete = (deletedSongId: number) => {
    setCurrentSongs((prevSongs) =>
      prevSongs.filter((song) => song.id !== deletedSongId)
    );
  };

  if (currentSongs.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No songs found
        </h3>
        <p className="text-gray-500 mb-4">
          Get started by creating your first song.
        </p>
        <Link
          href="/song-admin-portal/create"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Create Song
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {currentSongs.map((song) => (
          <li key={song.id}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                      <span className="text-yellow-600 font-medium">
                        {song.title.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {song.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {song.music_style} • {song.service_provider}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                      song.status || "draft"
                    )}`}
                  >
                    {song.status || "draft"}
                  </span>
                  <div className="text-sm text-gray-500">
                    {song.add_to_library
                      ? "Added to Library"
                      : "Not in Library"}
                  </div>
                  <Link
                    href={`/library/${song.slug}`}
                    className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                  >
                    View
                  </Link>
                  <DeleteSongButton
                    songId={song.id}
                    songTitle={song.title}
                    variant="dropdown"
                    onDelete={() => handleSongDelete(song.id)}
                  />
                </div>
              </div>
              {song.categories && song.categories.length > 0 && (
                <div className="mt-2">
                  <div className="flex flex-wrap gap-1">
                    {song.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
