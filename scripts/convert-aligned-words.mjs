import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the aligned words data directly
import { alignedWords } from "../align-words.mjs";

/**
 * Convert aligned words to line-by-line lyrics format using timing and content analysis
 * @param {Array} words - Array of word objects with timing information
 * @returns {Array} Array of LyricLine objects
 */
function convertToLyricLines(words) {
  const lines = [];
  let currentLine = [];
  let currentLineStart = null;
  let lineIndex = 0;

  // Helper function to check if we should break line
  function shouldBreakLine(currentWord, nextWord, currentLineWords) {
    if (!nextWord) return true; // End of words

    // Break after section markers
    if (currentWord.word.includes("(") && currentWord.word.includes(")")) {
      return true;
    }

    // Break before section markers
    if (nextWord.word.includes("(") && nextWord.word.includes(")")) {
      return true;
    }

    // Break after significant punctuation
    const endPunctuation = [".", "!", "?", "…"];
    if (endPunctuation.some((punct) => currentWord.word.includes(punct))) {
      return true;
    }

    // Break if there's a significant timing gap (> 1.5 seconds)
    const gap = nextWord.startS - currentWord.endS;
    if (gap > 1.5) {
      return true;
    }

    // Break if current line is getting too long (> 80 characters)
    const currentLineText =
      currentLineWords.map((w) => w.word).join(" ") + " " + nextWord.word;
    if (currentLineText.length > 80) {
      return true;
    }

    return false;
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
    currentLine.push(word);

    // Check if we should end the current line
    if (shouldBreakLine(word, nextWord, currentLine)) {
      // Create the line text
      const lineText = currentLine
        .map((w) => w.word.trim())
        .join(" ")
        .trim();

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
 * Post-process lines to improve structure
 * @param {Array} lines - Array of LyricLine objects
 * @returns {Array} Improved LyricLine objects
 */
function postProcessLines(lines) {
  const processed = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];

    // Skip standalone section markers
    if (line.text.match(/^\([^)]+\)$/)) {
      continue;
    }

    // If current line is very short and next line is also short, consider merging
    if (line.text.length < 30 && nextLine && nextLine.text.length < 30) {
      const gap = nextLine.start - line.end;
      if (gap < 1000) {
        // Less than 1 second gap
        // Merge the lines
        processed.push({
          index: processed.length,
          text: line.text + " " + nextLine.text,
          start: line.start,
          end: nextLine.end,
        });
        i++; // Skip the next line since we merged it
        continue;
      }
    }

    processed.push({
      ...line,
      index: processed.length,
    });
  }

  return processed;
}

// Convert the aligned words to lyric lines
console.log("Converting aligned words to lyric lines...");
const lyricLines = convertToLyricLines(alignedWords);

// Clean the lyrics
console.log("Cleaning lyrics...");
const cleanedLyrics = cleanLyrics(lyricLines);

// Post-process for better structure
console.log("Post-processing lines...");
const finalLyrics = postProcessLines(cleanedLyrics);

// Create the output
const output = finalLyrics;
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
finalLyrics.slice(0, 15).forEach((line) => {
  const startTime = (line.start / 1000).toFixed(2);
  const endTime = (line.end / 1000).toFixed(2);
  console.log(`[${startTime}s - ${endTime}s] ${line.text}`);
});

if (finalLyrics.length > 15) {
  console.log(`... and ${finalLyrics.length - 15} more lines`);
}
