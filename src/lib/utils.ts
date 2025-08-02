import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format duration from seconds to MM:SS
export function formatDuration(seconds: number | null): string {
  if (!seconds) return '0:00'

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
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