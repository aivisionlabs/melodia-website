const fs = require("fs");
const path = require("path");

// Helper: convert seconds to ms
const sToMs = (s) => Math.round(s * 1000);

// Function to detect if input is already in the target format
function isAlreadyConverted(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === "object" &&
    "text" in data[0] &&
    "start" in data[0] &&
    "end" in data[0]
  );
}

// Function to detect if input is in word-by-word format
function isWordByWordFormat(data) {
  return (
    Array.isArray(data) &&
    data.length > 0 &&
    typeof data[0] === "object" &&
    "word" in data[0] &&
    "startS" in data[0] &&
    "endS" in data[0]
  );
}

// Function to read and parse the align-words.js file
function readAlignedWords() {
  try {
    const filePath = path.join(__dirname, "align-words.js");
    const content = fs.readFileSync(filePath, "utf8");

    // Extract the array content from the export statement
    const match = content.match(/export const alignedWords = (\[[\s\S]*\]);/);
    if (!match) {
      throw new Error("Could not find alignedWords export in align-words.js");
    }

    // Evaluate the array content (safe since it's our own file)
    const alignedWords = eval(match[1]);
    return alignedWords;
  } catch (error) {
    console.error("Error reading align-words.js:", error.message);
    return null;
  }
}

// Function to read JSON file if it exists
function readJsonFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    }
  } catch (error) {
    console.error(`Error reading ${filePath}:`, error.message);
  }
  return null;
}

// Calculate timing offset to fix lyrics lag
function calculateTimingOffset(alignedWords) {
  // Find the first non-section marker word
  const firstWord = alignedWords.find((word) => !/\(.*\)/.test(word.word));
  if (!firstWord) return 0;

  const firstStartTime = firstWord.startS;
  console.log(`🎵 First word starts at: ${firstStartTime}s`);

  // If first word starts after 5 seconds, there's likely an offset
  if (firstStartTime > 5) {
    console.log(`⚠️  Detected timing offset: ${firstStartTime}s`);
    console.log(`🔄 Adjusting timestamps to start from 0...`);
    return firstStartTime;
  }

  return 0;
}

// Group words into lines/segments with improved logic for both formats
function groupWords(alignedWords, timingOffset = 0) {
  const segments = [];
  let current = [];
  let currentStart = null;
  let currentEnd = null;
  let wordCount = 0;
  let pendingSectionMarker = null;

  alignedWords.forEach((wordObj, i) => {
    const word = wordObj.word;

    // Check if this word contains a section marker (Verse, Chorus, Bridge, etc.)
    // Handle both formats:
    // 1. Old format: split markers like "(" and "Chorus)"
    // 2. New format: complete markers like "(Verse 1)\n", "(Chorus)\n"
    const isSectionMarker =
      /\(.*\)/.test(word) ||
      /^[\(\)]/.test(word) ||
      /^(Verse|Chorus|Bridge|Final|Intro|Outro)/i.test(word);
    const isOpeningBracket = word.trim() === "(";
    const isClosingBracket = word.trim().endsWith(")");
    const isSectionName = /^(Verse|Chorus|Bridge|Final|Intro|Outro)/i.test(
      word
    );
    const isCompleteSectionMarker =
      /^\(.*\)/.test(word) &&
      (word.includes("\n") ||
        word.includes("Verse") ||
        word.includes("Chorus") ||
        word.includes("Bridge") ||
        word.includes("Outro"));

    // Handle section markers
    if (
      isSectionMarker ||
      isOpeningBracket ||
      isSectionName ||
      isCompleteSectionMarker
    ) {
      // If we have current content, end the segment first
      if (current.length > 0) {
        const startTime = Math.max(0, sToMs(currentStart - timingOffset));
        const endTime = Math.max(0, sToMs(currentEnd - timingOffset));

        segments.push({
          text: current.join(" ").trim(),
          start: startTime,
          end: endTime,
        });
        current = [];
        currentStart = null;
        currentEnd = null;
        wordCount = 0;
      }

      // Handle complete section markers (new format)
      if (isCompleteSectionMarker) {
        const markerStartTime = Math.max(
          0,
          sToMs(wordObj.startS - timingOffset)
        );
        const markerEndTime = Math.max(0, sToMs(wordObj.endS - timingOffset));

        segments.push({
          text: word.trim(),
          start: markerStartTime,
          end: markerEndTime,
        });
        return;
      }

      // Handle split section markers (old format)
      if (isOpeningBracket) {
        pendingSectionMarker = word;
        return;
      } else if (isSectionName && pendingSectionMarker) {
        // Combine with pending bracket
        const fullMarker = pendingSectionMarker + word;
        const markerStartTime = Math.max(
          0,
          sToMs(alignedWords[i - 1]?.startS || wordObj.startS - timingOffset)
        );
        const markerEndTime = Math.max(0, sToMs(wordObj.endS - timingOffset));

        segments.push({
          text: fullMarker.trim(),
          start: markerStartTime,
          end: markerEndTime,
        });
        pendingSectionMarker = null;
        return;
      } else if (isSectionMarker) {
        // Complete section marker
        const markerStartTime = Math.max(
          0,
          sToMs(wordObj.startS - timingOffset)
        );
        const markerEndTime = Math.max(0, sToMs(wordObj.endS - timingOffset));

        segments.push({
          text: word.trim(),
          start: markerStartTime,
          end: markerEndTime,
        });
        return;
      }
    }

    // Add the word to current segment
    if (current.length === 0) {
      currentStart = wordObj.startS;
    }
    current.push(word);
    currentEnd = wordObj.endS;
    wordCount++;

    // Create a new segment if:
    // 1. The word ends with a period, exclamation mark, or question mark (end of sentence)
    // 2. The word contains a newline
    // 3. We're at the end of the array
    // 4. We have a reasonable number of words (8-12 words per line for better readability)
    // 5. The word is a comma and we have enough words
    const isEndOfSentence = /[.!?]\s*$/.test(word);
    const hasNewline = word.includes("\n");
    const isLastWord = i === alignedWords.length - 1;
    const isComma = word.trim().endsWith(",");
    const hasEnoughWords = wordCount >= 8 && (isComma || wordCount >= 12);

    if (
      (isEndOfSentence || hasNewline || isLastWord || hasEnoughWords) &&
      current.length > 0
    ) {
      const startTime = Math.max(0, sToMs(currentStart - timingOffset));
      const endTime = Math.max(0, sToMs(currentEnd - timingOffset));

      segments.push({
        text: current.join(" ").trim(),
        start: startTime,
        end: endTime,
      });
      current = [];
      currentStart = null;
      currentEnd = null;
      wordCount = 0;
    }
  });

  return segments;
}

// Main conversion function
function convertLyrics(input, timingOffset = 0) {
  // If input is already in the target format, return as is
  if (isAlreadyConverted(input)) {
    console.log("Input is already in the target format, returning as is.");
    return input;
  }

  // If input is an array of word objects, convert them
  if (isWordByWordFormat(input)) {
    console.log("Converting word-by-word format to segment format...");
    return groupWords(input, timingOffset);
  }

  throw new Error(
    "Unsupported input format. Expected array of word objects or already converted segments."
  );
}

// Process aligned words and convert to segments
function processAlignedWords(alignedWords) {
  console.log(`📊 Processing ${alignedWords.length} items...`);

  // Calculate timing offset if it's word-by-word format
  let timingOffset = 0;
  if (isWordByWordFormat(alignedWords)) {
    timingOffset = calculateTimingOffset(alignedWords);
  }

  // Convert the lyrics
  const segments = convertLyrics(alignedWords, timingOffset);

  // Add index field and clean up text
  const result = segments.map((seg, idx) => ({
    index: idx,
    text: seg.text.replace(/\s+/g, " ").trim(), // Remove extra spaces
    start: seg.start,
    end: seg.end,
  }));

  // Filter out empty segments and section markers
  const filteredResult = result.filter((seg) => {
    const text = seg.text.trim();
    return text.length > 0; // Keep all non-empty segments including section markers
  });

  // Output as JSON
  console.log(JSON.stringify(filteredResult, null, 2));

  // Write to a file
  const outputPath = path.join(__dirname, "converted-lyrics.json");
  fs.writeFileSync(outputPath, JSON.stringify(filteredResult, null, 2));

  console.log(`\n✅ Conversion complete!`);
  console.log(
    `📊 Processed ${alignedWords.length} items into ${filteredResult.length} segments`
  );
  if (timingOffset > 0) {
    console.log(`⏰ Applied timing offset: -${timingOffset.toFixed(2)}s`);
  }
  console.log(`💾 Output written to: ${outputPath}`);
}

// Main execution
function main() {
  const inputFile = process.argv[2] || "align-words.js";

  console.log(`🎵 Converting lyrics from: ${inputFile}`);
  console.log("⏱️  Processing timing data...\n");

  try {
    // Read and parse the input file
    const fileContent = fs.readFileSync(inputFile, "utf8");

    // Extract the alignedWords array
    const alignedWordsMatch = fileContent.match(
      /const alignedWords = (\[[\s\S]*?\]);/
    );

    if (!alignedWordsMatch) {
      // Try to parse as direct JSON array
      try {
        const alignedWords = JSON.parse(fileContent);
        processAlignedWords(alignedWords);
        return;
      } catch (parseError) {
        console.error("❌ Could not find alignedWords array or parse as JSON");
        console.error("   Make sure the file contains either:");
        console.error(
          '   1. A JavaScript file with "const alignedWords = [...]"'
        );
        console.error("   2. A JSON file with an array of word objects");
        process.exit(1);
      }
    }

    // Extract and evaluate the alignedWords array
    const alignedWordsCode = alignedWordsMatch[1];
    const alignedWords = eval(alignedWordsCode);

    processAlignedWords(alignedWords);
  } catch (error) {
    console.error("❌ Error processing file:", error.message);
    process.exit(1);
  }
}

// Run the conversion
main();
