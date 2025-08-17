import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface LyricLine {
  index: number;
  text: string;
  start: number;
  end: number;
}

export interface AlignedWord {
  word: string;
  startS: number; // Changed from start_s to startS
  endS: number;   // Changed from end_s to endS
  success: boolean;
  palign: number; // API response uses 'palign' not 'p_align'
}

/**
 * Convert aligned words to line-by-line lyrics format using timing and content analysis
 * @param alignedWords - Array of word objects with timing information from Suno API
 * @returns Array of LyricLine objects
 */
export function convertAlignedWordsToLyricLines(alignedWords: AlignedWord[]): LyricLine[] {
  const lines: LyricLine[] = [];
  let currentLine: AlignedWord[] = [];
  let currentLineStart: number | null = null;
  let lineIndex = 0;

  // Helper function to check if we should break line
  function shouldBreakLine(currentWord: AlignedWord, nextWord: AlignedWord | undefined, currentLineWords: AlignedWord[]): boolean {
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
    const currentLineText = currentLineWords.map((w) => w.word).join(" ") + " " + nextWord.word;
    if (currentLineText.length > 80) {
      return true;
    }

    return false;
  }

  // Process each word
  for (let i = 0; i < alignedWords.length; i++) {
    const word = alignedWords[i];
    const nextWord = alignedWords[i + 1];

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
          start: Math.round(currentLineStart! * 1000), // Convert to milliseconds
          end: Math.round(word.endS * 1000), // Convert to milliseconds
        });
        lineIndex++;
      }

      // Reset for next line
      currentLine = [];
      currentLineStart = null;
    }
  }

  return cleanLyrics(lines);
}

/**
 * Clean and format the lyrics for better readability
 * @param lines - Array of LyricLine objects
 * @returns Cleaned LyricLine objects
 */
function cleanLyrics(lines: LyricLine[]): LyricLine[] {
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
    .filter((line): line is LyricLine => line !== null && line.text.length > 0);
}

/**
 * Post-process lines to improve structure
 * @param lines - Array of LyricLine objects
 * @returns Improved LyricLine objects
 */
function postProcessLines(lines: LyricLine[]): LyricLine[] {
  const processed: LyricLine[] = [];

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

// Format duration from seconds to MM:SS
export function formatDuration(seconds: number | string | null): string {
  if (seconds === null || seconds === undefined) return '0:00';

  // Convert string to number if needed
  const numSeconds = typeof seconds === 'string' ? parseFloat(seconds) : seconds;

  if (isNaN(numSeconds) || numSeconds <= 0) return '0:00';

  const minutes = Math.floor(numSeconds / 60);
  const remainingSeconds = Math.floor(numSeconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Sanitize text input
export function sanitizeText(text: string): string {
  return text.trim().slice(0, 1000) // Limit to 1000 characters
}

// Validate song ID
export function validateSongId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return /^\d+$/.test(id)
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Utility function to convert word-level timestamps to line-level timestamps
export function convertWordTimestampsToLines(alignedWords: Array<{
  word: string;
  startS: number;
  endS: number;
  success: boolean;
  palign: number;
}>) {
  const lines: Array<{
    index: number;
    text: string;
    start: number;
    end: number;
  }> = [];

  let currentLine = '';
  let lineStart = 0;
  let lineIndex = 0;
  let isFirstWord = true;

  for (const word of alignedWords) {
    // Skip section markers like "(Verse 1)", "(Chorus)", etc.
    if (word.word.match(/^\([^)]+\)\s*$/)) {
      continue;
    }

    // If this is the first word of a line, record the start time
    if (isFirstWord) {
      lineStart = word.startS * 1000; // Convert to milliseconds
      isFirstWord = false;
    }

    // Add word to current line
    currentLine += word.word;

    // Check if this word ends with punctuation that typically ends a line
    // or if the next word starts with a capital letter (indicating new sentence)
    const nextWord = alignedWords[alignedWords.indexOf(word) + 1];
    const isEndOfLine =
      word.word.match(/[.!?]\s*$/) || // Ends with sentence-ending punctuation
      (nextWord && nextWord.word.match(/^[A-Z]/) && !nextWord.word.match(/^\(/)) || // Next word starts with capital (but not section marker)
      word.word.includes('\n'); // Contains newline

    if (isEndOfLine || !nextWord) {
      // End of line reached, create line entry
      const lineEnd = word.endS * 1000; // Convert to milliseconds

      lines.push({
        index: lineIndex,
        text: currentLine.trim(),
        start: Math.round(lineStart),
        end: Math.round(lineEnd)
      });

      // Reset for next line
      currentLine = '';
      lineIndex++;
      isFirstWord = true;
    }
  }

  return lines;
}

// Alternative function for more precise line detection
export function convertWordTimestampsToLinesAdvanced(alignedWords: Array<{
  word: string;
  startS: number;
  endS: number;
  success: boolean;
  palign: number;
}>) {
  const lines: Array<{
    index: number;
    text: string;
    start: number;
    end: number;
  }> = [];

  let currentLine = '';
  let lineStart = 0;
  let lineIndex = 0;
  let isFirstWord = true;

  for (let i = 0; i < alignedWords.length; i++) {
    const word = alignedWords[i];
    const nextWord = alignedWords[i + 1];

    // Skip section markers
    if (word.word.match(/^\([^)]+\)\s*$/)) {
      continue;
    }

    // If this is the first word of a line, record the start time
    if (isFirstWord) {
      lineStart = word.startS * 1000;
      isFirstWord = false;
    }

    // Add word to current line
    currentLine += word.word;

    // Determine if this is the end of a line
    let isEndOfLine = false;

    // Check for natural line breaks
    if (word.word.match(/[.!?]\s*$/)) {
      isEndOfLine = true;
    }

    // Check for significant pauses (gap > 0.5 seconds)
    if (nextWord && (nextWord.startS - word.endS) > 0.5) {
      isEndOfLine = true;
    }

    // Check if next word is a section marker
    if (nextWord && nextWord.word.match(/^\([^)]+\)\s*$/)) {
      isEndOfLine = true;
    }

    // Check if this is the last word
    if (!nextWord) {
      isEndOfLine = true;
    }

    if (isEndOfLine) {
      const lineEnd = word.endS * 1000;

      // Only add non-empty lines
      if (currentLine.trim()) {
        lines.push({
          index: lineIndex,
          text: currentLine.trim(),
          start: Math.round(lineStart),
          end: Math.round(lineEnd)
        });
        lineIndex++;
      }

      // Reset for next line
      currentLine = '';
      isFirstWord = true;
    }
  }

  return lines;
}