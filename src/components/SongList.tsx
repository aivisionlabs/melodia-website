"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import DeleteSongButton from "@/components/DeleteSongButton";
import TimestampLyricsEditor from "@/components/TimestampLyricsEditor";
import { getSongWithLyricsAction, toggleShowLyricsAction } from "@/lib/actions";
import { Song, LyricLine } from "@/types";
// Removed icon imports; using text CTA instead

interface SongListProps {
  songs: Song[];
}

export default function SongList({ songs }: SongListProps) {
  const router = useRouter();
  const [currentSongs, setCurrentSongs] = useState<Song[]>(songs);

  // Modal state for lyrics editor
  const [showLyricsEditor, setShowLyricsEditor] = useState(false);
  const [editorSongData, setEditorSongData] = useState<{
    songId: number;
    slug: string;
    timestampLyrics: LyricLine[] | null;
    plainLyrics: string | null;
  } | null>(null);

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

  const handleSongClick = (song: Song) => {
    // If song is in generating state, navigate to the generate page
    if (song.status === "generating" && song.suno_task_id) {
      router.push(`/song-admin-portal/generate/${song.suno_task_id}`);
    } else if (song.slug) {
      // Otherwise, navigate to the song page
      router.push(`/library/${song.slug}`);
    }
  };

  const handleFixLyrics = async (song: Song) => {
    try {
      const result = await getSongWithLyricsAction(song.id);
      if (result.success && result.song) {
        setEditorSongData({
          songId: result.song.id,
          slug: result.song.slug,
          timestampLyrics: result.song.timestamp_lyrics,
          plainLyrics: result.song.lyrics,
        });
        setShowLyricsEditor(true);
      }
    } catch (error) {
      console.error("Error loading song data:", error);
    }
  };

  const handleEditorSave = () => {
    setShowLyricsEditor(false);
    // Refresh the page to show updated data
    window.location.reload();
  };

  const handleEditorCancel = () => {
    setShowLyricsEditor(false);
  };

  const handleToggleShowLyrics = async (song: Song, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering song click
    try {
      const result = await toggleShowLyricsAction(song.id, !song.show_lyrics);
      if (result.success) {
        // Update the local state
        setCurrentSongs((prevSongs) =>
          prevSongs.map((s) =>
            s.id === song.id ? { ...s, show_lyrics: !song.show_lyrics } : s
          )
        );
      }
    } catch (error) {
      console.error("Error toggling show lyrics:", error);
    }
  };

  const handleDownload = (song: Song, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering song click
    try {
      const audioUrl = song.song_url;
      if (!audioUrl) {
        console.error("No audio URL available for download");
        return;
      }

      const link = document.createElement("a");
      link.href = audioUrl;
      link.download = `${song.title || "song"}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading audio:", error);
    }
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
    <>
      {/* Lyrics Editor Modal */}
      {showLyricsEditor && editorSongData && (
        <TimestampLyricsEditor
          songId={editorSongData.songId}
          slug={editorSongData.slug}
          timestampLyrics={editorSongData.timestampLyrics}
          plainLyrics={editorSongData.plainLyrics}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
        />
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {currentSongs.map((song) => (
            <li key={song.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div
                        className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center cursor-pointer"
                        onClick={() => handleSongClick(song)}
                      >
                        <span className="text-yellow-600 font-medium">
                          {song.title.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div
                      className="ml-4 flex-1 min-w-0 cursor-pointer"
                      onClick={() => handleSongClick(song)}
                    >
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {song.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {song.music_style} • {song.service_provider}
                      </div>
                    </div>
                  </div>
                  <div className="mt-1 sm:mt-0 flex flex-wrap items-center gap-2 sm:gap-4 sm:ml-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        song.status || "draft"
                      )}`}
                    >
                      {song.status || "draft"}
                    </span>
                    <div className="text-sm text-gray-500">
                      {song.add_to_library ? "In Library" : "Private"}
                    </div>

                    {/* Show Lyrics CTA */}
                    <button
                      onClick={(e) => handleToggleShowLyrics(song, e)}
                      className={`text-xs sm:text-sm font-medium px-2 py-1 rounded-md transition-colors ${
                        song.show_lyrics
                          ? "text-green-700 hover:text-green-800 hover:bg-green-50"
                          : "text-gray-600 hover:text-gray-800 hover:bg-gray-50"
                      }`}
                    >
                      {song.show_lyrics ? "Hide Lyrics" : "Show Lyrics"}
                    </button>

                    {/* Fix Lyrics Button - Only show if song has timestamp_lyrics */}
                    {song.timestamp_lyrics &&
                      song.timestamp_lyrics.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFixLyrics(song);
                          }}
                          className="text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Fix timestamp lyrics"
                        >
                          Fix Lyrics
                        </button>
                      )}

                    {/* Download Button - Only show if song has audio URL */}
                    {song.song_url && (
                      <button
                        onClick={(e) => handleDownload(song, e)}
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-900 text-xs sm:text-sm font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
                        title="Download song"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    )}
                    <Link
                      href={`/library/${song.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-yellow-600 hover:text-yellow-900 text-xs sm:text-sm font-medium"
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
    </>
  );
}
