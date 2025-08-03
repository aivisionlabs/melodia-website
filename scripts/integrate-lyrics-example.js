// Example: How to integrate converted lyrics with your song data
import yaaraLyrics from "../public/lyrics/yaara-converted.json";

// Example song data structure
const songWithLyrics = {
  id: "yaara",
  title: "Yaara",
  artist: "Unknown Artist", // Update with actual artist name
  audioUrl: "/audio/song-library/yaara.mp3", // Update with actual audio path
  duration: 209, // Duration in seconds
  timestamp_lyrics: yaaraLyrics.timestamp_lyrics,
};

// Example usage in a songs array
const songs = [
  songWithLyrics,
  // ... other songs
];

// Example: How to use in your FullPageMediaPlayer component
console.log("Song with synchronized lyrics:");
console.log(JSON.stringify(songWithLyrics, null, 2));

// Example: How to access specific lyric lines
console.log("\nFirst few lyric lines:");
songWithLyrics.timestamp_lyrics.slice(0, 3).forEach((line, index) => {
  const startTime = (line.start / 1000).toFixed(2);
  const endTime = (line.end / 1000).toFixed(2);
  console.log(`${index + 1}. [${startTime}s - ${endTime}s] ${line.text}`);
});

// Example: How to find the current lyric line based on time
function getCurrentLyricLine(currentTimeMs, lyrics) {
  return lyrics.find(
    (line) => currentTimeMs >= line.start && currentTimeMs < line.end
  );
}

// Example usage
const currentTimeMs = 10000; // 10 seconds in milliseconds
const currentLine = getCurrentLyricLine(
  currentTimeMs,
  songWithLyrics.timestamp_lyrics
);
console.log(`\nAt ${currentTimeMs / 1000}s:`, currentLine?.text || "No lyrics");
