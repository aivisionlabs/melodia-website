function convertAlignWordsFormatForLyricsProcessing(alignedWords: any[]) {
  return alignedWords.map((word: any) => {
    const transformed = {
      word: word.word,
      startS: word.startS, // Use startS from API response
      endS: word.endS,     // Use endS from API response
      success: word.success,
      palign: word.palign || 0 // API response uses 'palign'
    };

    return transformed;
  });
}

/**
 * Clean and format the lyrics for better readability
 * @param lines - Array of LyricLine objects
 * @returns {Array} Cleaned LyricLine objects
 */
function cleanLyrics(lines: any[]) {
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
 * Convert aligned words to line-by-line lyrics format using timing and content analysis
 * This function is rewritten from scratch based on the working version from scripts/convert-aligned-words.mjs
 * @param words - Array of word objects with timing information
 * @returns {Array} Array of LyricLine objects
 */
function convertToLyricLines(words: any[]) {
  const lines: any[] = [];
  let currentLine: any[] = [];
  let currentLineStart: number | null = null;
  let lineIndex = 0;

  // Helper function to check if we should break line
  function shouldBreakLine(currentWord: any, nextWord: any, currentLineWords: any[]) {
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
        // Calculate timing values - subtract a small offset to show lyrics slightly before audio
        const startMs = Math.round((currentLineStart! - 0.2) * 1000); // 200ms early
        const endMs = Math.round(word.endS * 1000);

        const line = {
          index: lineIndex,
          text: lineText,
          start: startMs,
          end: endMs,
        };

        lines.push(line);
        lineIndex++;
      }

      // Reset for next line
      currentLine = [];
      currentLineStart = null;
    }
  }

  // Handle the last line if it wasn't processed in the loop
  if (currentLine.length > 0) {
    const lineText = currentLine
      .map((w) => w.word.trim())
      .join(" ")
      .trim();

    if (lineText && lineText.length > 0) {
      const startMs = Math.round((currentLineStart! - 0.2) * 1000); // 200ms early
      const endMs = Math.round(currentLine[currentLine.length - 1].endS * 1000);

      const line = {
        index: lineIndex,
        text: lineText,
        start: startMs,
        end: endMs,
      };

      lines.push(line);
    }
  }

  const cleanedLines = cleanLyrics(lines);
  return cleanedLines;
}

export {
  convertAlignWordsFormatForLyricsProcessing,
  cleanLyrics,
  convertToLyricLines,
}