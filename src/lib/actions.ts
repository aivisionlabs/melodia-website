'use server'

import { incrementSongPlay, incrementSongView, validateAdminCredentials } from './db/services';

export async function selectSongVariantAction(
  songId: number,
  taskId: string,
  variantIndex: number,
) {
  try {
    const { updateSong } = await import("@/lib/db/queries/update");
    console.log("Updating song with selected variant:", variantIndex);
    await updateSong(songId, { selected_variant: variantIndex });
    console.log("Updated song with selected variant:", variantIndex);

    const lyricsResult =
      await generateTimestampedLyricsAction(taskId, variantIndex);

    if (!lyricsResult.success) {
      return {
        success: false,
        error:
          lyricsResult.error ||
          "Failed to generate timestamped lyrics after selecting variant.",
      };
    }

    return {
      success: true,
      songId,
    };
  } catch (error) {
    console.error("Error in selectSongVariantAction:", error);
    return { success: false, error: "Failed to select song variant." };
  }
}

// Analytics tracking actions
export async function trackSongView(songId: number) {
  try {
    await incrementSongView(songId);
  } catch (error) {
    console.error('Error tracking song view:', error);
  }
}

export async function trackSongPlay(songId: number) {
  try {
    await incrementSongPlay(songId);
  } catch (error) {
    console.error('Error tracking song play:', error);
  }
}

// Admin authentication action
export async function authenticateAdmin(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;

    if (!username || !password) {
      return { success: false, error: 'Username and password are required' };
    }

    const result = await validateAdminCredentials(username, password);
    return result;
  } catch (error) {
    console.error('Error in authenticateAdmin:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function getSongByTaskIdAction(taskId: string) {
  try {
    const { getSongByTaskId } = await import('@/lib/db/services');
    const song = await getSongByTaskId(taskId);
    return { success: true, song };
  } catch (error) {
    console.error('Error in getSongByTaskIdAction:', error);
    return { success: false, error: 'Failed to get song by task ID' };
  }
}

// Suno helpers for client: server-backed status to avoid exposing tokens
export async function getSunoModeAction(): Promise<{ useMock: boolean }> {
  try {
    const { shouldUseMockAPI } = await import('@/lib/config')
    return { useMock: shouldUseMockAPI() }
  } catch (error) {
    console.error('Error in getSunoModeAction:', error)
    // Default safe: assume real API in case of failure
    return { useMock: false }
  }
}

export async function getSunoRecordInfoAction(taskId: string) {
  try {
    const { SunoAPIFactory } = await import('@/lib/suno-api')
    const api = SunoAPIFactory.getAPI()
    const response = await api.getRecordInfo(taskId)
    return response
  } catch (error) {
    console.error('Error in getSunoRecordInfoAction:', error)
    return {
      code: 500,
      msg: 'Failed to fetch record info',
      data: {
        taskId,
        parentMusicId: '',
        param: '',
        response: { taskId, sunoData: [] },
        status: 'PENDING',
        type: 'generate',
        errorCode: 'INTERNAL_ERROR',
        errorMessage: 'Failed to fetch record info',
      }
    }
  }
}

export async function updateSongWithVariantsAction(
  songId: number,
  variants: any[],
  selectedVariant: number,
  addToLibrary?: boolean
) {
  try {
    const { updateSongWithSunoVariants } = await import('@/lib/db/services');
    const result = await updateSongWithSunoVariants(songId, variants, selectedVariant, addToLibrary);

    if (result.success) {
      // After successfully updating the song with variants, generate timestamped lyrics
      try {
        // Get the song to access suno_task_id
        const { getSongById } = await import('@/lib/db/services');
        const song = await getSongById(songId);

        if (song && song.metadata?.suno_task_id) {
          console.log(`Generating timestamped lyrics for selected variant ${selectedVariant}`);

          // Generate timestamped lyrics for the selected variant
          const lyricsResult = await generateTimestampedLyricsAction(
            song.metadata.suno_task_id,
            selectedVariant
          );

          if (lyricsResult.success) {
            console.log(`Successfully generated timestamped lyrics for variant ${selectedVariant}`);

            // Update the song with the new timestamped lyrics data
            const { updateSong } = await import('@/lib/db/queries/update');
            await updateSong(songId, {
              // Store in the new schema field for compatibility
              variant_timestamp_lyrics_processed: {
                ...song.variant_timestamp_lyrics_processed,
                [selectedVariant]: lyricsResult.lyricLines
              }
            });

            return {
              ...result,
              timestampedLyricsGenerated: true,
              lyricLines: lyricsResult.lyricLines
            };
          } else {
            console.warn(`Failed to generate timestamped lyrics: ${lyricsResult.error}`);
            // Continue with the result even if lyrics generation fails
            return {
              ...result,
              timestampedLyricsGenerated: false,
              lyricsError: lyricsResult.error
            };
          }
        }
      } catch (lyricsError) {
        console.error('Error generating timestamped lyrics:', lyricsError);
        // Continue with the result even if lyrics generation fails
        return {
          ...result,
          timestampedLyricsGenerated: false,
          lyricsError: 'Failed to generate timestamped lyrics'
        };
      }
    }

    return result;
  } catch (error) {
    console.error('Error in updateSongWithVariantsAction:', error);
    return { success: false, error: 'Failed to update song with variants' };
  }
}

export async function softDeleteSongAction(songId: number) {
  try {
    const { softDeleteSong } = await import('@/lib/db/services');
    const result = await softDeleteSong(songId);
    return result;
  } catch (error) {
    console.error('Error in softDeleteSongAction:', error);
    return { success: false, error: 'Failed to delete song' };
  }
}

// // Action to generate timestamped lyrics for a variant
export async function generateTimestampedLyricsAction(
  taskId: string,
  variantIndex: number
) {
  try {
    // Get song by task ID
    const songResult = await getSongByTaskIdAction(taskId);

    if (!songResult.success || !songResult.song) {
      return {
        success: false,
        error: 'Song not found'
      };
    }

    // Check if lyrics already exist for this variant
    if (songResult.song.variant_timestamp_lyrics_processed &&
      songResult.song.variant_timestamp_lyrics_processed[variantIndex]) {
      return {
        success: true,
        lyricLines: songResult.song.variant_timestamp_lyrics_processed[variantIndex],
        apiResponse: songResult.song.variant_timestamp_lyrics_api_response?.[variantIndex] || null,
        variant: songResult.song.song_variants?.[variantIndex],
        fromCache: true
      };
    }

    // Get variants from the song
    const variants = songResult.song.song_variants;
    if (!variants || !variants[variantIndex]) {
      return {
        success: false,
        error: 'Variant not found'
      };
    }

    const variant = variants[variantIndex];

    // Call Suno API to get timestamped lyrics
    const { SunoAPIFactory } = await import('@/lib/suno-api');
    const sunoAPI = SunoAPIFactory.getAPI();

    const timestampedLyricsRequest = {
      taskId: taskId,
      musicIndex: variantIndex
    };

    let response;
    try {
      response = await sunoAPI.getTimestampedLyrics(timestampedLyricsRequest);
    } catch (error) {
      console.error('Error calling Suno API:', error);
      throw error;
    }

    if (response.code !== 200) {
      return {
        success: false,
        error: `Failed to get timestamped lyrics: ${response.msg}`
      };
    }

    // Check if we have aligned words data

    if (!response.data || !response.data.alignedWords || !Array.isArray(response.data.alignedWords)) {
      console.error('Invalid response format:', response);
      return {
        success: false,
        error: 'Invalid response format: missing alignedWords data'
      };
    }

    // Check if timing data exists
    const hasTimingData = response.data.alignedWords.every(word =>
      typeof word.startS === 'number' && typeof word.endS === 'number'
    );

    if (!hasTimingData) {
      console.error('Missing timing data in API response');
    }

    // Transform the aligned words to match the expected format

    const transformedAlignedWords = response.data.alignedWords.map((word: any) => {
      const transformed = {
        word: word.word,
        startS: word.startS, // Use startS from API response
        endS: word.endS,     // Use endS from API response
        success: word.success,
        palign: word.palign || 0 // API response uses 'palign'
      };

      return transformed;
    });

    // Validate that we have timing data

    const transformedHasTimingData = transformedAlignedWords.every(word =>
      typeof word.startS === 'number' && typeof word.endS === 'number'
    );

    if (!transformedHasTimingData) {
      console.error('Missing timing data in transformed words');
      return {
        success: false,
        error: 'Missing timing data in aligned words'
      };
    }

    // Convert aligned words to lyric lines using the conversion logic

    // Validate that we have valid timing data before conversion
    const validWords = transformedAlignedWords.filter(word =>
      typeof word.startS === 'number' && typeof word.endS === 'number' &&
      !isNaN(word.startS) && !isNaN(word.endS) &&
      word.startS >= 0 && word.endS > word.startS
    );

    if (validWords.length === 0) {
      console.error('No valid words with timing data found!');
      return {
        success: false,
        error: 'No valid words with timing data found'
      };
    }

    const lyricLines = convertToLyricLines(validWords);

    if (lyricLines.length > 0) {
      console.log("First converted line:", lyricLines[0]);
      console.log(
        "Last converted line:",
        lyricLines[lyricLines.length - 1],
      );
    }

    // Store the timestamped lyrics and only the alignedWords for this variant
    const { updateTimestampedLyricsForVariant } = await import(
      "@/lib/db/queries/update"
    );

    // Validate that we have valid timing data before storage
    const linesWithNullValues = lyricLines.filter(
      line =>
        line.start === null || line.end === null ||
        typeof line.start === 'undefined' || typeof line.end === 'undefined'
    );

    if (linesWithNullValues.length > 0) {
      console.error("Cannot store lyrics with null timing values");
      return {
        success: false,
        error: "Cannot store lyrics with null timing values",
      };
    }

    await updateTimestampedLyricsForVariant(
      songResult.song.id,
      variantIndex,
      lyricLines,
      response.data.alignedWords, // Store only the alignedWords, not the entire response
    );

    return {
      success: true,
      lyricLines,
      apiResponse: response,
      variant,
      fromCache: false
    };
  } catch (error) {
    console.error('Error generating timestamped lyrics:', error);
    return {
      success: false,
      error: 'Failed to generate timestamped lyrics'
    };
  }
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

