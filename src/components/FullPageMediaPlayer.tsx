// "use client";

// import { useState, useRef, useEffect, useCallback } from "react";
// import { Button } from "@/components/ui/button";
// import { Slider } from "@/components/ui/slider";
// import {
//   Play,
//   Pause,
//   Rewind,
//   FastForward,
//   AlertCircle,
//   Music,
//   ArrowRight,
// } from "lucide-react";
// import Link from "next/link";
// import { ShareButton } from "@/components/ShareButton";
// import { HeaderLogo } from "@/components/OptimizedLogo";
// import {
//   trackPlayerEvent,
//   trackEngagementEvent,
//   trackNavigationEvent,
// } from "@/lib/analytics";

// // iOS Audio Context type declaration
// declare global {
//   interface Window {
//     webkitAudioContext: typeof AudioContext;
//   }
// }

// interface LyricLine {
//   index: number;
//   text: string;
//   start: number;
//   end: number;
// }

// interface Song {
//   id: string;
//   metadata?: {
//     title?: string;
//     lyrics?: string;
//   };
//   song_variants?: any[];
//   variant_timestamp_lyrics_processed?: { [variantIndex: number]: LyricLine[] };
//   selected_variant?: number;
//   slug?: string;
// }

// interface FullPageMediaPlayerProps {
//   song: Song;
// }

// export const FullPageMediaPlayer = ({ song }: FullPageMediaPlayerProps) => {
//   const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTime, setCurrentTime] = useState(0);
//   const [duration, setDuration] = useState(0);
//   const [audioError, setAudioError] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isPlayLoading, setIsPlayLoading] = useState(false);
//   const [timestampedLyrics, setTimestampedLyrics] = useState<LyricLine[]>([]);
//   const [isGeneratingLyrics, setIsGeneratingLyrics] = useState(false);
//   const [lyricsGenerationAttempted, setLyricsGenerationAttempted] =
//     useState(false);
//   const [lyricsGenerationError, setLyricsGenerationError] = useState<
//     string | null
//   >(null);
//   const [timingOffset, setTimingOffset] = useState(0); // Manual timing adjustment
//   const [lastActiveIndex, setLastActiveIndex] = useState(-1);

//   const [iosAudioUnlocked, setIosAudioUnlocked] = useState(false);

//   const audioRef = useRef<HTMLAudioElement>(null);
//   const lyricsContainerRef = useRef<HTMLDivElement>(null);
//   const lyricRefs = useRef<(HTMLDivElement | null)[]>([]);
//   const demoIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const audioContextRef = useRef<AudioContext | null>(null);

//   // Check if we're on iOS
//   const isIOS =
//     typeof navigator !== "undefined" &&
//     /iPad|iPhone|iPod/.test(navigator.userAgent);

//   // Convert current time to milliseconds for timestamp comparison
//   const currentTimeMs = currentTime * 1000;

//   // Helper function to get the correct audio URL
//   const getAudioUrl = useCallback(() => {
//     // Priority: song_url (new field) > audioUrl (legacy field)
//     return song.song_url || song.audioUrl;
//   }, [song.song_url, song.audioUrl]);

//   // Function to generate timestamped lyrics
//   const generateTimestampedLyrics = useCallback(async () => {
//     if (isGeneratingLyrics || lyricsGenerationAttempted) return;

//     setIsGeneratingLyrics(true);
//     setLyricsGenerationError(null);
//     setLyricsGenerationAttempted(true);

//     try {
//       console.log(
//         "Attempting to generate timestamped lyrics for song:",
//         song.id
//       );

//       const response = await fetch("/api/song/generate-timestamped-lyrics", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           songId: song.id,
//           variantIndex: song.selected_variant || 0,
//         }),
//       });

//       const data = await response.json();

//       if (data.success && data.lyrics) {
//         setTimestampedLyrics(data.lyrics);
//         console.log("Timestamped lyrics generated successfully:", data.lyrics);
//       } else {
//         const errorMsg = data.error || "Failed to generate timestamped lyrics";
//         console.error("Failed to generate timestamped lyrics:", errorMsg);
//         setLyricsGenerationError(errorMsg);
//       }
//     } catch (error) {
//       const errorMsg = "Network error while generating timestamped lyrics";
//       console.error("Error generating timestamped lyrics:", error);
//       setLyricsGenerationError(errorMsg);
//     } finally {
//       setIsGeneratingLyrics(false);
//     }
//   }, [
//     song.id,
//     song.selected_variant,
//     isGeneratingLyrics,
//     lyricsGenerationAttempted,
//   ]);

//   // Handle audio loading and errors
//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     // Reset loading state when audio URL changes
//     setIsLoading(false);
//     setAudioError(false);

//     const handleCanPlay = () => {
//       setIsLoading(false);
//       setAudioError(false);
//     };

//     const handleError = () => {
//       console.warn(
//         "Audio file not available or failed to load. This is expected for demo purposes."
//       );
//       setIsLoading(false);
//       setAudioError(true);
//     };

//     const handleLoadStart = () => {
//       if (getAudioUrl()) {
//         setIsLoading(true);
//         setAudioError(false);
//       }
//     };

//     const handleLoadedMetadata = () => {
//       setIsLoading(false);
//       setAudioError(false);
//     };

//     const handleCanPlayThrough = () => {
//       setIsLoading(false);
//       setAudioError(false);
//     };

//     // iOS-specific: Handle when audio is ready
//     const handleLoadedData = () => {
//       setIsLoading(false);
//       setAudioError(false);
//     };

//     // Set a timeout to prevent infinite loading
//     const loadingTimeout = setTimeout(
//       () => {
//         if (isLoading) {
//           setIsLoading(false);
//           setAudioError(true);
//         }
//       },
//       isIOS ? 5000 : 10000
//     ); // 5 second timeout on iOS, 10 seconds on other platforms

//     audio.addEventListener("canplay", handleCanPlay);
//     audio.addEventListener("error", handleError);
//     audio.addEventListener("loadstart", handleLoadStart);
//     audio.addEventListener("loadedmetadata", handleLoadedMetadata);
//     audio.addEventListener("canplaythrough", handleCanPlayThrough);
//     audio.addEventListener("loadeddata", handleLoadedData);

//     return () => {
//       clearTimeout(loadingTimeout);
//       audio.removeEventListener("canplay", handleCanPlay);
//       audio.removeEventListener("error", handleError);
//       audio.removeEventListener("loadstart", handleLoadStart);
//       audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
//       audio.removeEventListener("canplaythrough", handleCanPlayThrough);
//       audio.removeEventListener("loadeddata", handleLoadedData);
//     };
//   }, [getAudioUrl, isLoading, isIOS]);

//   // Auto-generate timestamped lyrics when component mounts if not available
//   useEffect(() => {
//     const hasTimestampedLyrics =
//       (song.variant_timestamp_lyrics_processed &&
//         song.variant_timestamp_lyrics_processed[song.selected_variant || 0]) ||
//       timestampedLyrics.length > 0;

//     // Check if song has variants before attempting generation
//     const hasVariants =
//       song.song_variants &&
//       Array.isArray(song.song_variants) &&
//       song.song_variants.length > 0;

//     if (
//       !hasTimestampedLyrics &&
//       !isGeneratingLyrics &&
//       !lyricsGenerationAttempted &&
//       hasVariants
//     ) {
//       console.log("No timestamped lyrics found, generating...");
//       generateTimestampedLyrics();
//     } else if (!hasVariants && !hasTimestampedLyrics) {
//       console.log("Song has no variants, will use static lyrics fallback");
//       console.log("Song lyrics data:", {
//         hasLyrics: !!song.metadata?.lyrics,
//         lyricsLength: song.metadata?.lyrics?.length || 0,
//         lyricsPreview: song.metadata?.lyrics?.substring(0, 100) || "No lyrics",
//       });
//       setLyricsGenerationError(
//         "This song was not generated through Suno API, so synchronized lyrics are not available. Showing static lyrics instead."
//       );
//     }
//   }, [
//     song,
//     generateTimestampedLyrics,
//     isGeneratingLyrics,
//     lyricsGenerationAttempted,
//     timestampedLyrics.length,
//   ]);

//   const getLyricsAtTime = (timeMs: number) => {
//     let allLyrics: any[] = [];

//     // Priority 1: Use generated timestamped lyrics if available
//     if (timestampedLyrics && timestampedLyrics.length > 0) {
//       allLyrics = timestampedLyrics.map((line) => ({
//         ...line,
//         isActive: timeMs >= line.start && timeMs < line.end,
//         isPast: timeMs >= line.end,
//       }));
//     }
//     // Priority 2: Use timestamp_lyrics (final variation) if available
//     else if (song.timestamp_lyrics && song.timestamp_lyrics.length > 0) {
//       allLyrics = song.timestamp_lyrics.map((line) => ({
//         ...line,
//         isActive: timeMs >= line.start && timeMs < line.end,
//         isPast: timeMs >= line.end,
//       }));
//     }
//     // Priority 3: Use timestamped lyrics variants if available
//     else if (
//       song.timestamped_lyrics_variants &&
//       song.selected_variant !== undefined
//     ) {
//       const selectedVariantLyrics =
//         song.timestamped_lyrics_variants[song.selected_variant];
//       if (selectedVariantLyrics && selectedVariantLyrics.length > 0) {
//         allLyrics = selectedVariantLyrics.map((line) => ({
//           ...line,
//           isActive: timeMs >= line.start && timeMs < line.end,
//           isPast: timeMs >= line.end,
//         }));
//       }
//     }
//     // Priority 4: Fallback to static lyrics if available
//     else if (song.metadata?.lyrics) {
//       const lines = song.metadata.lyrics
//         .split("\n")
//         .filter((line) => line.trim().length > 0);

//       // Use a much more aggressive timing approach
//       // Use shorter line durations for more responsive highlighting
//       const songDurationMs =
//         duration > 0 ? duration * 1000 : lines.length * 3000; // 3 seconds per line as default

//       // Use shorter line duration for more responsive highlighting
//       const lineDuration = songDurationMs / lines.length;

//       // Apply timing offset for manual adjustment
//       const adjustedTimeMs = timeMs + timingOffset;

//       allLyrics = lines.map((line, index) => {
//         const start = index * lineDuration;
//         const end = (index + 1) * lineDuration;

//         return {
//           index,
//           text: line.trim(),
//           start,
//           end,
//           // More aggressive timing - smaller buffer
//           isActive: adjustedTimeMs >= start && adjustedTimeMs < end,
//           isPast: adjustedTimeMs >= end,
//         };
//       });
//     }

//     // If no lyrics available, return empty array
//     if (allLyrics.length === 0) {
//       return [];
//     }

//     // Find the currently active line
//     const activeIndex = allLyrics.findIndex((line) => line.isActive);

//     // Debug logging (reduced frequency)
//     if (timeMs % 10000 < 200) {
//       // Log every 10 seconds
//       console.log("Lyrics timing debug:", {
//         timeMs,
//         currentTime: currentTime,
//         activeIndex,
//         totalLines: allLyrics.length,
//         activeLine: activeIndex >= 0 ? allLyrics[activeIndex]?.text : "None",
//         songDuration: duration,
//         lineDuration:
//           allLyrics.length > 0 ? allLyrics[0]?.end - allLyrics[0]?.start : 0,
//       });
//     }

//     // If no active line, show first few lines
//     if (activeIndex === -1) {
//       return allLyrics.slice(0, 5); // Show first 5 lines
//     }

//     // Check if current line is a chorus/section header
//     const currentLine = allLyrics[activeIndex];
//     const isChorusOrSection =
//       currentLine?.text &&
//       (currentLine.text.includes("(अंतरा / Chorus)") ||
//         currentLine.text.includes("(मुखड़ा / Verse)") ||
//         currentLine.text.includes("(Chorus)") ||
//         currentLine.text.includes("(Verse)") ||
//         currentLine.text.includes("(अंतरा)") ||
//         currentLine.text.includes("(मुखड़ा)") ||
//         currentLine.text.includes("**(")); // Any section header with **

//     let contextStart, contextEnd;

//     if (isChorusOrSection) {
//       // For chorus/section headers, show them at the top with more context below
//       contextStart = Math.max(0, activeIndex - 1); // 1 line before
//       contextEnd = Math.min(allLyrics.length, activeIndex + 6); // 5 lines after
//     } else {
//       // Normal context: 2 lines before + active + 3 lines after
//       contextStart = Math.max(0, activeIndex - 2);
//       contextEnd = Math.min(allLyrics.length, activeIndex + 4);
//     }

//     const contextLyrics = allLyrics.slice(contextStart, contextEnd);

//     return contextLyrics;
//   };

//   useEffect(() => {
//     const audio = audioRef.current;
//     if (!audio) return;

//     const updateTime = () => setCurrentTime(audio.currentTime);
//     const updateDuration = () => setDuration(audio.duration);

//     audio.addEventListener("timeupdate", updateTime);
//     audio.addEventListener("loadedmetadata", updateDuration);

//     return () => {
//       audio.removeEventListener("timeupdate", updateTime);
//       audio.removeEventListener("loadedmetadata", updateDuration);
//     };
//   }, []);

//   // Additional manual update for more responsive highlighting
//   useEffect(() => {
//     if (!isPlaying) return;

//     const interval = setInterval(() => {
//       const audio = audioRef.current;
//       if (audio) {
//         setCurrentTime(audio.currentTime);
//       }
//     }, 50); // Update every 50ms for even more responsive highlighting

//     return () => clearInterval(interval);
//   }, [isPlaying]);

//   // Auto-adjust timing offset based on audio progress
//   useEffect(() => {
//     if (!isPlaying || !song.metadata?.lyrics) return;

//     const lines = song.metadata.lyrics
//       .split("\n")
//       .filter((line) => line.trim().length > 0);
//     const songDurationMs = duration > 0 ? duration * 1000 : lines.length * 3000;
//     const lineDuration = songDurationMs / lines.length;

//     // Calculate expected current line based on time
//     const expectedLine = Math.floor((currentTime * 1000) / lineDuration);

//     // If we're consistently ahead or behind, adjust the offset
//     if (
//       expectedLine !== lastActiveIndex &&
//       expectedLine >= 0 &&
//       expectedLine < lines.length
//     ) {
//       const expectedTime = expectedLine * lineDuration;
//       const actualTime = currentTime * 1000;
//       const difference = actualTime - expectedTime;

//       // If difference is significant (> 500ms), adjust offset
//       if (Math.abs(difference) > 500) {
//         setTimingOffset((prev) => prev - difference * 0.5); // Gradual adjustment
//       }

//       setLastActiveIndex(expectedLine);
//     }
//   }, [currentTime, isPlaying, song.lyrics, duration, lastActiveIndex]);

//   const togglePlay = async () => {
//     const audio = audioRef.current;

//     // iOS-specific: Unlock audio on first interaction
//     if (isIOS && !iosAudioUnlocked) {
//       await unlockIOSAudio();
//     }

//     if (isPlaying) {
//       if (audio) {
//         audio.pause();
//       }
//       // Clear demo interval if running
//       if (demoIntervalRef.current) {
//         clearInterval(demoIntervalRef.current);
//         demoIntervalRef.current = null;
//       }
//       setIsPlaying(false);

//       // Track pause event
//       trackPlayerEvent.pause(song.title, song.id, currentTime);
//     } else {
//       // If no audio URL or audio error, simulate playing for demo
//       if (!getAudioUrl() || audioError) {
//         setIsPlaying(true);
//         // Track demo play event
//         trackPlayerEvent.play(song.title, song.id, true);

//         // Simulate time progression for demo
//         demoIntervalRef.current = setInterval(() => {
//           setCurrentTime((prev) => {
//             const newTime = prev + 0.1;
//             if (newTime >= 40) {
//               // Reset after 40 seconds
//               if (demoIntervalRef.current) {
//                 clearInterval(demoIntervalRef.current);
//                 demoIntervalRef.current = null;
//               }
//               setIsPlaying(false);
//               setCurrentTime(0);
//               // Track demo end event
//               trackPlayerEvent.audioEnd(song.title, song.id, 40);
//               return 0;
//             }
//             return newTime;
//           });
//         }, 100);
//       } else {
//         // Show loading state when trying to play actual audio
//         setIsPlayLoading(true);

//         // Try to play actual audio with simplified iOS handling
//         if (audio) {
//           try {
//             // Set volume before playing (iOS requirement)
//             audio.volume = 1; // Always play at full volume

//             // Simple play attempt
//             const playPromise = audio.play();

//             if (playPromise !== undefined) {
//               await playPromise;
//               setIsPlaying(true);
//               setAudioError(false);
//               setIsPlayLoading(false);
//               // Track play event
//               trackPlayerEvent.play(song.title, song.id, false);
//             }
//           } catch (error) {
//             console.warn("Error playing audio:", error);
//             setAudioError(true);
//             setIsPlayLoading(false);
//             // Track audio error
//             trackPlayerEvent.audioError(song.title, song.id, "play_error");
//           }
//         }
//       }
//     }
//   };

//   const formatTime = (time: number) => {
//     const minutes = Math.floor(time / 60);
//     const seconds = Math.floor(time % 60);
//     return `${minutes}:${seconds.toString().padStart(2, "0")}`;
//   };

//   const skipTime = (seconds: number) => {
//     if (audioRef.current && !audioError) {
//       const newTime = Math.max(
//         0,
//         Math.min(audioRef.current.currentTime + seconds, duration || Infinity)
//       );
//       audioRef.current.currentTime = newTime;
//       setCurrentTime(newTime);

//       // Track skip event
//       if (seconds > 0) {
//         trackPlayerEvent.skipForward(song.title, song.id, seconds);
//       } else {
//         trackPlayerEvent.skipBackward(song.title, song.id, Math.abs(seconds));
//       }
//     } else if (!getAudioUrl() || audioError) {
//       // Handle demo mode
//       const newTime = Math.max(0, Math.min(currentTime + seconds, 40));
//       setCurrentTime(newTime);

//       // Track skip event in demo mode
//       if (seconds > 0) {
//         trackPlayerEvent.skipForward(song.title, song.id, seconds);
//       } else {
//         trackPlayerEvent.skipBackward(song.title, song.id, Math.abs(seconds));
//       }
//     }
//   };

//   // iOS Audio unlock mechanism
//   const unlockIOSAudio = useCallback(async () => {
//     if (!isIOS || iosAudioUnlocked) return;

//     try {
//       // Method 1: Create a simple audio context and resume it
//       try {
//         const AudioContextClass =
//           window.AudioContext || window.webkitAudioContext;
//         const audioContext = new AudioContextClass();
//         audioContextRef.current = audioContext;

//         if (audioContext.state === "suspended") {
//           await audioContext.resume();
//         }
//       } catch (contextError) {
//         console.warn(`Audio context error: ${contextError}`);
//       }

//       // Method 2: Try to play the actual audio element with volume 0
//       if (audioRef.current) {
//         try {
//           const audio = audioRef.current;
//           audio.volume = 0;
//           audio.currentTime = 0;

//           const playPromise = audio.play();

//           if (playPromise !== undefined) {
//             await playPromise;

//             // Immediately pause it
//             audio.pause();
//             audio.volume = 1; // Always play at full volume

//             setIosAudioUnlocked(true);
//             return;
//           }
//         } catch (audioError) {
//           console.warn(`Volume 0 play error: ${audioError}`);
//         }
//       }

//       // Method 3: Create a minimal audio element
//       try {
//         const testAudio = document.createElement("audio");
//         testAudio.src =
//           "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT";
//         testAudio.volume = 0;
//         testAudio.preload = "none";

//         await testAudio.play();
//         testAudio.pause();

//         setIosAudioUnlocked(true);
//       } catch (minimalError) {
//         console.warn(`Minimal audio error: ${minimalError}`);

//         // Last resort: just mark as unlocked and hope for the best
//         setIosAudioUnlocked(true);
//       }
//     } catch (error) {
//       console.warn(`iOS audio unlock failed: ${error}`);
//       // Even if unlock fails, mark as unlocked to prevent repeated attempts
//       setIosAudioUnlocked(true);
//     }
//   }, [isIOS, iosAudioUnlocked]);

//   // Calculate lyrics
//   const lyrics = getLyricsAtTime(currentTimeMs);

//   // Auto-scroll to active lyric (Spotify-style) - Always active for better UX
//   useEffect(() => {
//     if (!lyricsContainerRef.current) return;

//     const activeIndex = lyrics.findIndex((line) => line.isActive);
//     if (activeIndex === -1) return;

//     const activeElement = lyricRefs.current[activeIndex];
//     if (!activeElement) return;

//     const container = lyricsContainerRef.current;

//     // Use requestAnimationFrame for better performance and timing
//     requestAnimationFrame(() => {
//       // Get the element's position within the scrollable container
//       const containerHeight = container.clientHeight;
//       const elementOffsetTop = activeElement.offsetTop;
//       const elementHeight = activeElement.clientHeight;

//       // Calculate the position to center the element in the container
//       const elementCenter = elementOffsetTop + elementHeight / 2;
//       const containerCenter = containerHeight / 2;
//       const targetScrollTop = elementCenter - containerCenter;

//       // Only scroll if the element is not already well-positioned
//       const currentScrollTop = container.scrollTop;
//       const scrollThreshold = 150; // Only scroll if the element is more than 150px away from center

//       if (Math.abs(targetScrollTop - currentScrollTop) > scrollThreshold) {
//         container.scrollTo({
//           top: Math.max(0, targetScrollTop),
//           behavior: "smooth",
//         });
//       }
//     });
//   }, [currentTime, lyrics]);

//   // Reset lyrics position only when audio actually ends (not paused or error)
//   useEffect(() => {
//     // Only reset when audio naturally ends (currentTime is 0 and not playing)
//     if (!isPlaying && currentTime === 0) {
//       // Reset scroll position to top when song completely ends
//       if (lyricsContainerRef.current) {
//         lyricsContainerRef.current.scrollTo({
//           top: 0,
//           behavior: "smooth",
//         });
//       }
//     }
//   }, [isPlaying, currentTime]); // Removed audioError to allow scrolling in demo mode

//   // Cleanup demo interval on unmount
//   useEffect(() => {
//     return () => {
//       if (demoIntervalRef.current) {
//         clearInterval(demoIntervalRef.current);
//       }
//     };
//   }, []);

//   // iOS Audio Context initialization
//   useEffect(() => {
//     const initializeAudioContext = async () => {
//       if (isIOS) {
//         try {
//           // Create a simple audio context
//           const AudioContextClass =
//             window.AudioContext || window.webkitAudioContext;
//           const audioContext = new AudioContextClass();
//           audioContextRef.current = audioContext;

//           // Resume audio context on user interaction
//           const resumeAudioContext = async () => {
//             if (audioContext.state === "suspended") {
//               await audioContext.resume();
//             }

//             // Try to unlock iOS audio on any interaction
//             if (!iosAudioUnlocked) {
//               await unlockIOSAudio();
//             }

//             // Remove event listeners after first interaction
//             document.removeEventListener("touchstart", resumeAudioContext);
//             document.removeEventListener("touchend", resumeAudioContext);
//             document.removeEventListener("click", resumeAudioContext);
//           };

//           document.addEventListener("touchstart", resumeAudioContext);
//           document.addEventListener("touchend", resumeAudioContext);
//           document.addEventListener("click", resumeAudioContext);
//         } catch (error) {
//           console.warn(`Failed to initialize iOS Audio Context: ${error}`);
//         }
//       }
//     };

//     initializeAudioContext();
//   }, [isIOS, iosAudioUnlocked, unlockIOSAudio]);

//   // iOS-specific: Immediately set error state if no audio URL on iOS
//   useEffect(() => {
//     if (isIOS && !getAudioUrl()) {
//       setAudioError(true);
//       setIsLoading(false);
//     }
//   }, [isIOS, getAudioUrl]);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
//       {/* Single Refined Header with Branding and Song Info */}
//       <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-2 text-white">
//         <div className="flex items-center justify-between mb-1">
//           {/* Melodia Branding */}
//           <Link
//             href="/"
//             className="flex items-center gap-2 hover:opacity-80 transition-opacity"
//           >
//             <HeaderLogo alt="Melodia Logo" />
//             <span className="text-xl font-bold sm:inline">Melodia</span>
//           </Link>

//           {/* Share Button */}
//           <div className="flex items-center">
//             <ShareButton
//               slug={song.slug}
//               title={`Listen to ${song.title} with synchronized lyrics`}
//               onShare={() =>
//                 trackEngagementEvent.share(song.title, song.id, "native_share")
//               }
//               onCopyLink={() =>
//                 trackEngagementEvent.copyLink(song.title, song.id)
//               }
//             />
//           </div>
//         </div>

//         {/* Status Messages */}
//         {audioError && (
//           <div className="flex items-center gap-2 text-yellow-100 text-xs md:text-sm justify-center">
//             <AlertCircle className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
//             <span>
//               {isIOS
//                 ? "iOS Demo mode: Use controls below to experience synchronized lyrics"
//                 : "Demo mode: Use controls below to experience synchronized lyrics"}
//             </span>
//           </div>
//         )}
//         {isLoading && !audioError && (
//           <div className="flex items-center gap-2 text-yellow-100 text-xs md:text-sm justify-center">
//             <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-b-2 border-yellow-100"></div>
//             <span>Loading audio...</span>
//           </div>
//         )}
//       </div>

//       {/* Main Lyrics Section - Fixed height for proper scrolling */}
//       <div className="flex-1 bg-gradient-to-b from-gray-50 to-white">
//         <div
//           ref={lyricsContainerRef}
//           className="h-[calc(100vh-200px)] overflow-y-auto px-6 md:px-12 scroll-smooth [&::-webkit-scrollbar]:hidden"
//           style={{
//             scrollbarWidth: "none",
//             msOverflowStyle: "none",
//           }}
//         >
//           {/* Top padding to allow first lyric to be centered */}
//           <div className="h-[calc(40vh-80px)]"></div>

//           <div className="max-w-4xl mx-auto">
//             {/* Loading indicator for timestamped lyrics generation */}
//             {isGeneratingLyrics && (
//               <div className="text-center py-12">
//                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
//                 <p className="text-gray-600">
//                   Generating synchronized lyrics...
//                 </p>
//               </div>
//             )}

//             {/* Error display for lyrics generation */}
//             {lyricsGenerationError && (
//               <div className="text-center py-12">
//                 {lyricsGenerationError.includes(
//                   "not generated through Suno API"
//                 ) ? (
//                   <div className="text-yellow-600 mb-4">
//                     <Music className="h-8 w-8 mx-auto mb-2" />
//                     <p className="text-sm">Static lyrics will be shown</p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {lyricsGenerationError}
//                     </p>

//                     {/* Manual timing adjustment controls */}
//                     <div className="mt-4 space-y-2">
//                       <p className="text-xs text-gray-500">
//                         Timing adjustment:
//                       </p>
//                       <div className="flex items-center justify-center space-x-2">
//                         <button
//                           onClick={() => setTimingOffset((prev) => prev - 500)}
//                           className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
//                         >
//                           -0.5s
//                         </button>
//                         <button
//                           onClick={() => setTimingOffset((prev) => prev - 100)}
//                           className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
//                         >
//                           -0.1s
//                         </button>
//                         <span className="text-xs text-gray-500 min-w-[60px] text-center">
//                           {timingOffset > 0 ? "+" : ""}
//                           {(timingOffset / 1000).toFixed(1)}s
//                         </span>
//                         <button
//                           onClick={() => setTimingOffset((prev) => prev + 100)}
//                           className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
//                         >
//                           +0.1s
//                         </button>
//                         <button
//                           onClick={() => setTimingOffset((prev) => prev + 500)}
//                           className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300"
//                         >
//                           +0.5s
//                         </button>
//                         <button
//                           onClick={() => setTimingOffset(0)}
//                           className="px-3 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600"
//                         >
//                           Reset
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 ) : (
//                   <div className="text-red-500 mb-4">
//                     <AlertCircle className="h-8 w-8 mx-auto mb-2" />
//                     <p className="text-sm">
//                       Could not generate synchronized lyrics
//                     </p>
//                     <p className="text-xs text-gray-500 mt-1">
//                       {lyricsGenerationError}
//                     </p>
//                     <button
//                       onClick={() => {
//                         setLyricsGenerationAttempted(false);
//                         setLyricsGenerationError(null);
//                         generateTimestampedLyrics();
//                       }}
//                       className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors mt-2"
//                     >
//                       Try Again
//                     </button>
//                   </div>
//                 )}
//               </div>
//             )}

//             <div className="space-y-6 md:space-y-8">
//               {lyrics.map((line, index) => (
//                 <div
//                   key={index}
//                   ref={(el) => {
//                     lyricRefs.current[index] = el;
//                   }}
//                   className={`text-center transition-all duration-700 ease-out min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center relative ${
//                     line.isActive
//                       ? line.text &&
//                         (line.text.includes("(अंतरा / Chorus)") ||
//                           line.text.includes("(मुखड़ा / Verse)") ||
//                           line.text.includes("(Chorus)") ||
//                           line.text.includes("(Verse)") ||
//                           line.text.includes("(अंतरा)") ||
//                           line.text.includes("(मुखड़ा)") ||
//                           line.text.includes("**("))
//                         ? "text-lg md:text-xl font-bold text-yellow-500 transform scale-105 bg-yellow-50 px-4 py-2 rounded-lg border border-yellow-200"
//                         : "text-xl md:text-2xl lg:text-3xl font-bold text-yellow-600 transform scale-110"
//                       : line.isPast
//                       ? "text-base md:text-lg text-gray-400 opacity-60"
//                       : "text-base md:text-lg text-gray-500 opacity-80"
//                   }`}
//                   style={{
//                     transform: line.isActive
//                       ? line.text &&
//                         (line.text.includes("(अंतरा / Chorus)") ||
//                           line.text.includes("(मुखड़ा / Verse)") ||
//                           line.text.includes("(Chorus)") ||
//                           line.text.includes("(Verse)") ||
//                           line.text.includes("(अंतरा)") ||
//                           line.text.includes("(मुखड़ा)") ||
//                           line.text.includes("**("))
//                         ? "scale(1.05)"
//                         : "scale(1.1)"
//                       : "scale(1)",
//                     transition:
//                       "all 0.7s cubic-bezier(0.4, 0, 0.2, 1), font-size 0.5s cubic-bezier(0.4, 0, 0.2, 1), line-height 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
//                   }}
//                 >
//                   {/* Active lyric indicator */}
//                   {line.isActive && (
//                     <div className="absolute -left-5 md:-left-6 top-1/2 transform -translate-y-1/2 w-3 h-3 md:w-4 md:h-4 bg-yellow-500 rounded-full animate-pulse shadow-lg"></div>
//                   )}

//                   {/* Progress indicator for active lyric */}
//                   {line.isActive && (
//                     <div className="absolute -left-6 md:-left-8 top-1/2 transform -translate-y-1/2 w-1 h-8 md:h-10 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-full"></div>
//                   )}

//                   <span
//                     className="px-6 md:px-8 py-3 md:py-4 rounded-lg leading-relaxed max-w-full break-words transition-all duration-500 ease-out"
//                     style={{
//                       transition:
//                         "all 0.5s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s ease-out",
//                     }}
//                   >
//                     {line.text || "\u00A0"}
//                   </span>

//                   {/* Subtle glow effect for active lyric */}
//                   {line.isActive && (
//                     <div className="absolute inset-0 bg-yellow-100 rounded-lg opacity-20 blur-sm"></div>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* Bottom padding to allow last lyric to be centered */}
//           <div className="h-[calc(40vh-80px)]"></div>
//         </div>
//       </div>

//       {/* Fixed Bottom Player Controls */}
//       <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 md:p-6 shadow-lg z-50">
//         <audio
//           ref={audioRef}
//           src={getAudioUrl() || undefined}
//           preload="none"
//           playsInline
//           webkit-playsinline="true"
//           onLoadStart={() => {
//             if (getAudioUrl()) {
//               setIsLoading(true);
//               setAudioError(false);
//             }
//           }}
//           onCanPlay={() => {
//             setIsLoading(false);
//             setAudioError(false);
//           }}
//           onError={() => {
//             setAudioError(true);
//             setIsLoading(false);
//           }}
//           onLoadedMetadata={() => {
//             setIsLoading(false);
//             setAudioError(false);
//           }}
//         />

//         {/* Song Info and Logo */}
//         <div className="flex items-center justify-between mb-4">
//           {/* Song Information */}
//           <div className="flex items-center gap-3 flex-1 min-w-0">
//             <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center flex-shrink-0">
//               <HeaderLogo alt="Melodia" className="w-6 h-6 md:w-7 md:h-7" />
//             </div>
//             <div className="min-w-0 flex-1">
//               <h3 className="text-sm md:text-base font-semibold text-gray-900 truncate">
//                 {song.title}
//               </h3>
//               <p className="text-xs md:text-sm text-gray-600 truncate">
//                 {song.artist}
//               </p>
//             </div>
//           </div>

//           {/* All Library CTA */}
//           <div className="flex items-center">
//             <Link href="/library">
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() =>
//                   trackNavigationEvent.click(
//                     "all_library_cta",
//                     window.location.href,
//                     "button"
//                   )
//                 }
//                 className="flex items-center gap-1 md:gap-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 transition-colors"
//               >
//                 <Music className="h-3 w-3 md:h-4 md:w-4" />
//                 <span className="text-xs md:text-sm font-medium">
//                   All Library
//                 </span>
//                 <ArrowRight className="h-2 w-2 md:h-3 md:w-3" />
//               </Button>
//             </Link>
//           </div>
//         </div>

//         {/* Controls */}
//         <div className="flex items-center gap-3 md:gap-4 mb-4 justify-center">
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => skipTime(-10)}
//             disabled={isLoading}
//             className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-100 shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <Rewind className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
//           </Button>

//           <Button
//             variant="ghost"
//             size="lg"
//             onClick={togglePlay}
//             disabled={isLoading || isPlayLoading}
//             className="h-14 w-14 md:h-16 md:w-16 rounded-full bg-yellow-400 hover:bg-yellow-500 text-white shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isPlayLoading ? (
//               <div className="flex flex-col items-center justify-center gap-1 text-center">
//                 <div className="animate-spin rounded-full h-3 w-3 md:h-4 md:w-4 border-2 border-white border-t-transparent flex-shrink-0"></div>
//                 <span className="text-[10px] md:text-xs font-medium leading-none">
//                   Loading...
//                 </span>
//               </div>
//             ) : isPlaying ? (
//               <Pause className="h-6 w-6 md:h-8 md:w-8" />
//             ) : (
//               <Play className="h-6 w-6 md:h-8 md:w-8 ml-0.5 md:ml-1" />
//             )}
//           </Button>

//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => skipTime(10)}
//             disabled={isLoading}
//             className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gray-100 shadow-sm hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             <FastForward className="h-4 w-4 md:h-5 md:w-5 text-gray-600" />
//           </Button>
//         </div>

//         {/* Progress Bar */}
//         <div className="space-y-2">
//           <Slider
//             value={[currentTime]}
//             max={duration || 40}
//             step={0.1}
//             className="w-full"
//             disabled={isLoading}
//             onValueChange={(value) => {
//               const newTime = value[0];
//               const previousTime = currentTime;
//               setCurrentTime(newTime);

//               // Track seek event
//               trackPlayerEvent.seek(song.title, song.id, previousTime, newTime);

//               // Update audio position if available and not in error state
//               if (audioRef.current && !audioError && getAudioUrl()) {
//                 audioRef.current.currentTime = newTime;
//               }
//               // In demo mode or error state, just update the time state
//               // The lyrics will automatically update based on currentTime
//             }}
//           />
//           <div className="flex justify-between text-xs md:text-sm text-gray-600">
//             <span>{formatTime(currentTime)}</span>
//             <span>{formatTime(duration || 40)}</span>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
