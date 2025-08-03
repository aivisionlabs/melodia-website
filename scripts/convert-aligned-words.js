import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the aligned words data
const alignedWordsPath = path.join(__dirname, "..", "align-words.js");
const alignedWordsContent = fs.readFileSync(alignedWordsPath, "utf8");

// Extract the alignedWords array using eval (since it's a JS file)
const alignedWords = eval(alignedWordsContent);

/**
 * Convert aligned words to line-by-line lyrics format
 * @param {Array} words - Array of word objects with timing information
 * @returns {Array} Array of LyricLine objects
 */
function convertToLyricLines(words) {
  const lines = [];
  let currentLine = [];
  let currentLineStart = null;
  let lineIndex = 0;

  // Helper function to check if a word should start a new line
  function shouldStartNewLine(word) {
    // Check for section markers that should be on their own line
    if (word.word.includes("(") && word.word.includes(")")) {
      return true;
    }

    // Check for punctuation that typically ends a line
    const endPunctuation = [".", "!", "?", "…"];
    return endPunctuation.some((punct) => word.word.includes(punct));
  }

  // Helper function to check if we should break line based on timing
  function shouldBreakByTiming(currentWord, nextWord) {
    if (!nextWord) return false;

    // If there's a significant gap (> 1 second), break the line
    const gap = nextWord.startS - currentWord.endS;
    return gap > 1.0;
  }

  // Process each word
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const nextWord = words[i + 1];

    // Initialize line start time if this is the first word of a line
    if (currentLine.length === 0) {
      currentLineStart = word.startS;
    }

    // Add word to current line
    currentLine.push(word.word);

    // Check if we should end the current line
    const shouldEndLine =
      shouldStartNewLine(word) ||
      shouldBreakByTiming(word, nextWord) ||
      i === words.length - 1; // Last word

    if (shouldEndLine) {
      // Create the line text
      const lineText = currentLine.join("").trim();

      // Only add non-empty lines
      if (lineText && lineText.length > 0) {
        lines.push({
          index: lineIndex,
          text: lineText,
          start: Math.round(currentLineStart * 1000), // Convert to milliseconds
          end: Math.round(word.endS * 1000), // Convert to milliseconds
        });
        lineIndex++;
      }

      // Reset for next line
      currentLine = [];
      currentLineStart = null;
    }
  }

  return lines;
}

/**
 * Clean and format the lyrics for better readability
 * @param {Array} lines - Array of LyricLine objects
 * @returns {Array} Cleaned LyricLine objects
 */
function cleanLyrics(lines) {
  return lines
    .map((line) => {
      let cleanedText = line.text;

      // Remove extra spaces
      cleanedText = cleanedText.replace(/\s+/g, " ");

      // Clean up section markers
      cleanedText = cleanedText.replace(/\(\s*/g, "(").replace(/\s*\)/g, ")");

      // Remove standalone section markers that don't have content
      if (cleanedText.match(/^\([^)]+\)$/)) {
        return null;
      }

      return {
        ...line,
        text: cleanedText.trim(),
      };
    })
    .filter((line) => line !== null && line.text.length > 0);
}

/**
 * Merge consecutive lines that are too close in timing
 * @param {Array} lines - Array of LyricLine objects
 * @returns {Array} Merged LyricLine objects
 */
function mergeCloseLines(lines) {
  const merged = [];
  let currentLine = null;

  for (const line of lines) {
    if (!currentLine) {
      currentLine = { ...line };
      continue;
    }

    // If lines are very close (< 500ms gap), merge them
    const gap = line.start - currentLine.end;
    if (gap < 500) {
      currentLine.text += " " + line.text;
      currentLine.end = line.end;
    } else {
      merged.push(currentLine);
      currentLine = { ...line };
    }
  }

  // Add the last line
  if (currentLine) {
    merged.push(currentLine);
  }

  return merged;
}

// Convert the aligned words to lyric lines
console.log("Converting aligned words to lyric lines...");
const lyricLines = convertToLyricLines(alignedWords);

// Clean the lyrics
console.log("Cleaning lyrics...");
const cleanedLyrics = cleanLyrics(lyricLines);

// Merge very close lines
console.log("Merging close lines...");
const finalLyrics = mergeCloseLines(cleanedLyrics);

// Update indices
finalLyrics.forEach((line, index) => {
  line.index = index;
});

// Create the output
const output = {
  songId: "yaara", // You can change this to match your song ID
  title: "Yaara",
  artist: "Unknown Artist", // Update with actual artist
  timestamp_lyrics: finalLyrics,
};

// Write to file
const outputPath = path.join(
  __dirname,
  "..",
  "public",
  "lyrics",
  "yaara-converted.json"
);
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✅ Conversion complete!`);
console.log(`📁 Output saved to: ${outputPath}`);
console.log(`📊 Total lines: ${finalLyrics.length}`);
console.log(
  `⏱️  Duration: ${Math.round(
    finalLyrics[finalLyrics.length - 1]?.end / 1000
  )}s`
);

// Display first few lines as preview
console.log("\n📝 Preview of converted lyrics:");
finalLyrics.slice(0, 10).forEach((line) => {
  const startTime = (line.start / 1000).toFixed(2);
  const endTime = (line.end / 1000).toFixed(2);
  console.log(`[${startTime}s - ${endTime}s] ${line.text}`);
});

if (finalLyrics.length > 10) {
  console.log(`... and ${finalLyrics.length - 10} more lines`);
}
