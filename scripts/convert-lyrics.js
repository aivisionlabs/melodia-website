#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Convert word-level timestamps to line-level timestamps for better readability
 * Usage: node scripts/convert-lyrics.js <input-file> <output-file>
 */

function convertWordTimestampsToLinesAdvanced(alignedWords) {
  const lines = [];

  let currentLine = "";
  let lineStart = 0;
  let lineIndex = 0;
  let isFirstWord = true;
  let wordCount = 0;
  let maxWordsPerLine = 8; // Limit words per line for better readability

  for (let i = 0; i < alignedWords.length; i++) {
    const word = alignedWords[i];
    const nextWord = alignedWords[i + 1];

    // Check if this word is part of a section marker
    const isSectionMarkerStart = word.word.match(/^.*\(\s*$/); // Ends with opening parenthesis
    const isSectionMarkerEnd = word.word.match(/^[^)]*\)\s*$/); // Ends with closing parenthesis
    const isCompleteSectionMarker = word.word.match(/^\([^)]+\)\s*$/); // Complete section marker

    // Handle section markers
    if (isCompleteSectionMarker || isSectionMarkerStart || isSectionMarkerEnd) {
      // If we have accumulated words, create a line first
      if (currentLine.trim()) {
        lines.push({
          index: lineIndex++,
          text: currentLine.trim(),
          start: lineStart,
          end: word.startS * 1000,
        });
        currentLine = "";
        isFirstWord = true;
        wordCount = 0;
      }

      // If this is a complete section marker, add it directly
      if (isCompleteSectionMarker) {
        lines.push({
          index: lineIndex++,
          text: word.word.trim(),
          start: word.startS * 1000,
          end: word.endS * 1000,
        });
      } else if (isSectionMarkerStart) {
        // Handle split section markers - look for the end part
        let sectionText = word.word;
        let sectionStart = word.startS;
        let sectionEnd = word.endS;

        // Look ahead to find the end of the section marker
        let j = i + 1;
        while (j < alignedWords.length) {
          const nextSectionWord = alignedWords[j];
          sectionText += nextSectionWord.word;
          sectionEnd = nextSectionWord.endS;

          if (nextSectionWord.word.match(/\)\s*$/)) {
            // Found the end of the section marker
            lines.push({
              index: lineIndex++,
              text: sectionText.trim(),
              start: sectionStart * 1000,
              end: sectionEnd * 1000,
            });
            i = j; // Skip the words we've already processed
            break;
          }
          j++;
        }
      } else if (isSectionMarkerEnd) {
        // This is the end part of a section marker, skip it
        continue;
      }
      continue;
    }

    // If this is the first word of a line, record the start time
    if (isFirstWord) {
      lineStart = word.startS * 1000;
      isFirstWord = false;
    }

    // Add word to current line
    currentLine += word.word;
    wordCount++;

    // Check if we should end the line
    let shouldEndLine = false;

    // End line if we've reached max words
    if (wordCount >= maxWordsPerLine) {
      shouldEndLine = true;
    }

    // End line if there's a significant pause (more than 1 second gap)
    if (nextWord && nextWord.startS - word.endS > 1.0) {
      shouldEndLine = true;
    }

    // End line if we encounter punctuation that suggests a natural break
    if (word.word.match(/[.!?]\s*$/)) {
      shouldEndLine = true;
    }

    // End line if next word starts with capital letter (new sentence)
    if (
      nextWord &&
      nextWord.word.match(/^[A-Z]/) &&
      word.word.match(/[.!?]\s*$/)
    ) {
      shouldEndLine = true;
    }

    // End line if we're at the end
    if (i === alignedWords.length - 1) {
      shouldEndLine = true;
    }

    if (shouldEndLine && currentLine.trim()) {
      lines.push({
        index: lineIndex++,
        text: currentLine.trim(),
        start: lineStart,
        end: word.endS * 1000,
      });

      // Reset for next line
      currentLine = "";
      isFirstWord = true;
      wordCount = 0;
    }
  }

  return lines;
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.length < 1) {
    console.error(
      "Usage: node scripts/convert-lyrics.js <input-file> [output-file]"
    );
    process.exit(1);
  }

  const inputFile = args[0];
  const outputFile = args[1] || generateOutputFileName(inputFile);

  try {
    // Read the input file
    const inputContent = fs.readFileSync(inputFile, "utf8");

    // Extract the alignedWords array using regex
    const alignedWordsMatch = inputContent.match(
      /const alignedWords = (\[[\s\S]*?\]);/
    );
    if (!alignedWordsMatch) {
      console.error("Could not find alignedWords array in the input file");
      process.exit(1);
    }

    // Parse the alignedWords array
    const alignedWordsString = alignedWordsMatch[1];
    const alignedWords = eval(alignedWordsString);

    console.log(`Converting ${alignedWords.length} words to lines...`);

    // Convert to line-level timestamps
    const lines = convertWordTimestampsToLinesAdvanced(alignedWords);

    console.log(`Created ${lines.length} lines`);

    // Write the output - only the lyrics array
    fs.writeFileSync(outputFile, JSON.stringify(lines, null, 2));

    console.log(`✅ Conversion complete! Output saved to ${outputFile}`);
    console.log(`📊 Summary:`);
    console.log(`   - Input words: ${alignedWords.length}`);
    console.log(`   - Output lines: ${lines.length}`);
    console.log(
      `   - Duration: ${(
        Math.max(...lines.map((line) => line.end)) / 1000
      ).toFixed(2)} seconds`
    );

    // Show first few lines as preview
    console.log(`\n📝 Preview of first 5 lines:`);
    lines.slice(0, 5).forEach((line, index) => {
      console.log(
        `   ${index + 1}. "${line.text}" (${(line.start / 1000).toFixed(
          2
        )}s - ${(line.end / 1000).toFixed(2)}s)`
      );
    });
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

// Function to generate output filename based on input
function generateOutputFileName(inputFile) {
  // Extract the base name without extension
  const baseName = path.basename(inputFile, path.extname(inputFile));

  // Remove any existing "-timestamp-lyrics" suffix if present
  const cleanBaseName = baseName.replace(/-timestamp-lyrics$/, "");

  // Output to public/lyrics directory
  return `public/lyrics/${cleanBaseName}.json`;
}

module.exports = { convertWordTimestampsToLinesAdvanced };
