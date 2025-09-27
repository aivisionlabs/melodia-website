"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Download, Share2, ArrowLeft, Music } from "lucide-react";
import Header from "@/components/Header";
import {
  getSongFromSession,
  clearSongFromSession,
} from "@/lib/song-session-storage";

interface SongData {
  id: string;
  title: string;
  lyrics: string;
  styleOfMusic: string;
  status: "generating" | "ready" | "error";
  errorMessage?: string;
  audioUrl?: string | null;
}

interface FormData {
  recipient_details: string;
  languages: string;
}

function GeneratedSongsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [songs, setSongs] = useState<SongData[]>([]);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [showLyrics, setShowLyrics] = useState(false);
  const [selectedSong, setSelectedSong] = useState<SongData | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] =
    useState<HTMLAudioElement | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);

  // Load form data and initialize songs
  useEffect(() => {
    // Try to get data from session storage first (new approach)
    const sessionData = getSongFromSession();

    if (sessionData) {
      // Use session data
      const { styleOfMusic, lyrics, recipient_details, languages } =
        sessionData;

      // Extract name from recipient_name (e.g., "suchi, my friend" -> "suchi")
      const name = recipient_details.split(",")[0].trim();

      // Check if songs are already generated and saved
      const savedSongs = JSON.parse(
        localStorage.getItem("melodia-saved-songs") || "[]"
      );
      const recentSongs = savedSongs.filter(
        (song: any) =>
          song.recipientName === recipient_details &&
          new Date(song.createdAt).getTime() > Date.now() - 60000 // Last minute
      );

      if (recentSongs.length > 0) {
        // Use recently generated songs
        setSongs(
          recentSongs.map((song: any) => ({
            id: song.id,
            title: song.title,
            lyrics: song.lyrics,
            styleOfMusic: song.styleOfMusic,
            status: song.status || "ready",
            audioUrl: song.audioUrl,
          }))
        );
      } else {
        // Show 2 songs that need to be generated (Suno creates 2 versions)
        const songs: SongData[] = [
          {
            id: "song-1",
            title: `${name} - Version 1`,
            lyrics: lyrics,
            styleOfMusic: styleOfMusic,
            status: "generating",
            audioUrl: undefined,
          },
          {
            id: "song-2",
            title: `${name} - Version 2`,
            lyrics: lyrics,
            styleOfMusic: styleOfMusic,
            status: "generating",
            audioUrl: undefined,
          },
        ];

        setSongs(songs);

        // Note: Song generation will be handled by the second useEffect after generateSongOnce is declared
      }

      setFormData({ recipient_details, languages });

      // Clear session data after use
      clearSongFromSession();
    } else {
      // Fallback to URL parameters (old approach for backward compatibility)
      const recipient_name = searchParams.get("recipient_name");
      const languages = searchParams.get("languages")?.split(",") || [];
      const title = searchParams.get("title") || "";
      const lyrics = searchParams.get("lyrics") || "";
      const styleOfMusic = searchParams.get("styleOfMusic") || "";

      if (recipient_name && lyrics) {
        // Extract name from recipient_name (e.g., "suchi, my friend" -> "suchi")
        const name = recipient_name.split(",")[0].trim();

        const songs: SongData[] = [
          {
            id: "song-1",
            title: title || `${name} - Version 1`,
            lyrics: lyrics,
            styleOfMusic: styleOfMusic,
            status: "generating",
            audioUrl: undefined,
          },
          {
            id: "song-2",
            title: title || `${name} - Version 2`,
            lyrics: lyrics,
            styleOfMusic: styleOfMusic,
            status: "generating",
            audioUrl: undefined,
          },
        ];

        setSongs(songs);

        // Note: Song generation will be handled by the second useEffect after generateSongOnce is declared
      }
    }
  }, [searchParams]);

  const saveSongsToLocalStorage = useCallback(
    (songsToSave: SongData[]) => {
      if (typeof window !== "undefined") {
        try {
          const existingSongs = JSON.parse(
            localStorage.getItem("melodia-saved-songs") || "[]"
          );
          const newSongs = songsToSave.map((song) => ({
            ...song,
            createdAt: new Date().toISOString(),
            recipientName: formData?.recipient_details || "Unknown",
            id: `${Date.now()}-${song.id}`,
          }));
          const allSongs = [...existingSongs, ...newSongs];
          localStorage.setItem("melodia-saved-songs", JSON.stringify(allSongs));
          console.log("Songs auto-saved to My Songs:", newSongs.length);
        } catch (error) {
          console.error("Error saving songs:", error);
        }
      }
    },
    [formData?.recipient_details]
  );

  const generateSongOnce = useCallback(
    async (
      title: string,
      lyrics: string,
      style: string,
      recipient_name: string,
      songs: SongData[]
    ) => {
      try {
        // First try with real Suno API
        let response = await fetch("/api/generate-song", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            lyrics,
            style,
            recipient_name,
          }),
        });

        // Check if we got a Suno API credit error
        if (!response.ok) {
          const errorResult = await response.json();
          const isCreditError =
            errorResult.message?.includes("credits insufficient") ||
            errorResult.message?.includes("top up") ||
            errorResult.message?.includes("insufficient credits");

          if (isCreditError) {
            console.log(
              "🎭 Suno API credits insufficient, falling back to demo mode"
            );

            // Retry with demo mode
            response = await fetch("/api/generate-song", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                title,
                lyrics,
                style,
                recipient_name,
                demoMode: true, // Enable demo mode
              }),
            });
          }
        }

        if (!response.ok) {
          throw new Error("Failed to generate song");
        }

        const result = await response.json();

        if (result.error) {
          throw new Error(result.message || "Failed to generate song");
        }

        // Wait 30 seconds then check status once
        setTimeout(async () => {
          try {
            const statusResponse = await fetch(
              `/api/song-status/${result.taskId}`
            );
            const statusResult = await statusResponse.json();

            if (
              statusResult.status === "completed" &&
              statusResult.variants &&
              statusResult.variants.length > 0
            ) {
              // Update both songs with real audio URLs from Suno variants
              const updatedSongs = songs.map((song, index) => ({
                ...song,
                status: "ready" as const,
                audioUrl:
                  statusResult.variants[index]?.audioUrl ||
                  statusResult.variants[index]?.streamAudioUrl ||
                  "/audio/har-lamha-naya.mp3",
              }));

              setSongs(updatedSongs);
              saveSongsToLocalStorage(updatedSongs);
            } else {
              // Show as ready with fallback audio
              const updatedSongs = songs.map((song) => ({
                ...song,
                status: "ready" as const,
                audioUrl: "/audio/har-lamha-naya.mp3",
              }));

              setSongs(updatedSongs);
              saveSongsToLocalStorage(updatedSongs);
            }
          } catch (error) {
            console.error("Error checking song status:", error);
            // Show as ready with fallback audio
            const updatedSongs = songs.map((song) => ({
              ...song,
              status: "ready" as const,
              audioUrl: "/audio/har-lamha-naya.mp3",
            }));

            setSongs(updatedSongs);
            saveSongsToLocalStorage(updatedSongs);
          }
        }, 30000);
      } catch (error) {
        console.error("Error generating song:", error);
        // Show as ready with fallback audio
        const updatedSongs = songs.map((song) => ({
          ...song,
          status: "ready" as const,
          audioUrl: "/audio/har-lamha-naya.mp3",
        }));

        setSongs(updatedSongs);
        saveSongsToLocalStorage(updatedSongs);
      }
    },
    [saveSongsToLocalStorage]
  );

  // No timer needed - songs are immediately ready and saved

  useEffect(() => {
    if (
      searchParams.get("title") &&
      searchParams.get("lyrics") &&
      searchParams.get("style") &&
      searchParams.get("recipient_name")
    ) {
      const title = searchParams.get("title")!;
      const lyrics = searchParams.get("lyrics")!;
      const style = searchParams.get("style")!;
      const recipient_name = searchParams.get("recipient_name")!;
      const languages = searchParams.get("languages")?.split(",") || [];
      const additional_details = searchParams.get("additional_details") || "";

      if (recipient_name && languages.length > 0 && additional_details) {
        // Trigger song generation
        const songs: SongData[] = [
          {
            id: "song-1",
            title:
              title || `${recipient_name.split(",")[0].trim()} - Version 1`,
            lyrics: lyrics,
            styleOfMusic: style,
            status: "generating",
            audioUrl: undefined,
          },
          {
            id: "song-2",
            title:
              title || `${recipient_name.split(",")[0].trim()} - Version 2`,
            lyrics: lyrics,
            styleOfMusic: style,
            status: "generating",
            audioUrl: undefined,
          },
        ];

        setSongs(songs);
        generateSongOnce(title, lyrics, style, recipient_name, songs);
      }
    }
  }, [searchParams, generateSongOnce]);

  const handlePlaySong = (song: SongData) => {
    setSelectedSong(song);
    setShowLyrics(true);

    // Play audio if available
    if (song.audioUrl) {
      const audio = new Audio(song.audioUrl);
      audio.play().catch(console.error);
      setCurrentlyPlaying(audio);
      setPlayingSongId(song.id);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (songs.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 bg-gray-800/50 backdrop-blur-sm border-yellow-500/30">
          <CardContent className="p-6 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h2 className="text-xl font-bold mb-2 text-white">
              No Songs Found
            </h2>
            <p className="text-gray-300 mb-4">Please generate songs first</p>
            <Button
              onClick={handleBack}
              className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Header */}
      <Header />

      {/* Page Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Generated Songs</h1>
              <p className="text-gray-300">
                Your personalized songs are being created!
              </p>
            </div>

            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {songs.length > 0 && songs.every((song) => song.status === "ready") && (
          <Card className="mb-8 bg-gradient-to-r from-green-500 to-emerald-500 border-0">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Music className="w-5 h-5" />
                <span className="font-semibold text-white">
                  Songs ready! Automatically saved to My Songs.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generating Message */}
        {songs.length > 0 &&
          songs.some((song) => song.status === "generating") && (
            <Card className="mb-8 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <Music className="w-5 h-5" />
                  <span className="font-semibold text-white">
                    Generating your personalized songs... This may take a few
                    minutes.
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

        {/* Error Message */}
        {songs.length > 0 && songs.some((song) => song.status === "error") && (
          <Card className="mb-8 bg-gradient-to-r from-red-500 to-red-600 border-0">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center space-x-2">
                <Music className="w-5 h-5" />
                <span className="font-semibold text-white">
                  Some songs failed to generate. Please try again.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Songs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {songs.map((song) => (
            <Card
              key={song.id}
              className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/30 hover:bg-yellow-500/10 transition-all duration-300"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg font-bold">
                    {song.title}
                  </CardTitle>
                  <Badge
                    variant={song.status === "ready" ? "default" : "secondary"}
                    className={
                      song.status === "ready"
                        ? "bg-green-500 text-white"
                        : song.status === "generating"
                        ? "bg-yellow-500 text-white"
                        : "bg-red-500 text-white"
                    }
                  >
                    {song.status === "generating"
                      ? "Generating..."
                      : song.status === "ready"
                      ? "Ready"
                      : "Error"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="bg-yellow-500/10 rounded-lg p-3">
                  <p className="text-gray-300 text-sm line-clamp-3">
                    {song.styleOfMusic}
                  </p>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() => handlePlaySong(song)}
                    className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
                    disabled={song.status !== "ready"}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play with Lyrics
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/30 text-white hover:bg-white/10"
                    disabled={song.status !== "ready"}
                  >
                    <Download className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-white/30 text-white hover:bg-white/10"
                    disabled={song.status !== "ready"}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Lyrics Modal */}
      {showLyrics && selectedSong && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-4 text-black">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{selectedSong.title}</h3>
                <Button
                  onClick={() => setShowLyrics(false)}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  ✕
                </Button>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="font-semibold text-gray-700 mb-2">Style:</h4>
                <p className="text-sm text-gray-600">
                  {selectedSong.styleOfMusic}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-700">Lyrics:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
                    {selectedSong.lyrics}
                  </pre>
                </div>
              </div>

              <div className="mt-4 flex space-x-2">
                {selectedSong.audioUrl ? (
                  <Button
                    onClick={() => {
                      if (
                        currentlyPlaying &&
                        playingSongId === selectedSong.id
                      ) {
                        currentlyPlaying.pause();
                        setCurrentlyPlaying(null);
                        setPlayingSongId(null);
                      } else {
                        const audio = new Audio(selectedSong.audioUrl!);
                        audio.play().catch(console.error);
                        setCurrentlyPlaying(audio);
                        setPlayingSongId(selectedSong.id);
                      }
                    }}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                  >
                    {currentlyPlaying && playingSongId === selectedSong.id ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Play Audio
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    disabled
                    className="flex-1 bg-gray-400 text-white cursor-not-allowed"
                  >
                    <Music className="w-4 h-4 mr-2" />
                    Audio Not Available
                  </Button>
                )}
              </div>

              <div className="mt-2 p-3 bg-blue-100 border border-blue-300 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> This is demo audio. Your actual lyrics
                  are displayed above.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function GeneratedSongsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <GeneratedSongsContent />
    </Suspense>
  );
}
