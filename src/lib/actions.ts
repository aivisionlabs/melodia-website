'use server'

import { convertAlignWordsFormatForLyricsProcessing, convertToLyricLines } from '../../scripts/utilities/lyrics-processing-util';

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

    const transformedAlignedWords = convertAlignWordsFormatForLyricsProcessing(response.data.alignedWords);

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

