/**
 * Song Status API Response Utilities
 *
 * This service handles API response creation and utility functions
 * for the song status endpoint.
 */

import {
  SongStatus,
  SONG_STATUS_MAP,
} from "@/lib/services/song-status-calculation-service";

export interface FetchSongStatusApiResponse {
  code: number;
  msg: string;
  data: {
    response: {
      songVariantData: any[];
    };
    status: SongStatus;
    errorCode: string | null;
    errorMessage: string | null;
    songId?: number;
    taskId?: string;
    slug?: string;
    selectedVariantIndex?: number | null;
    variantTimestampLyricsProcessed?: any;
  };
}

/**
 * Create standardized API response for both demo and production modes
 */
export function createApiResponse(
  status: SongStatus,
  sunoData: any[],
  song?: any,
): FetchSongStatusApiResponse {
  const response = {
    code: 200,
    msg: "success",
    data: {
      response: {
        songVariantData: sunoData,
      },
      status: status,
      errorCode:
        status === SONG_STATUS_MAP.FAILED ? "GENERATION_FAILED" : null,
      errorMessage:
        status === SONG_STATUS_MAP.FAILED ? "Song generation failed" : null,
      songId: song?.id,
      taskId: song?.metadata?.suno_task_id,
      slug: song?.slug,
      selectedVariantIndex: song?.selected_variant_index,
      variantTimestampLyricsProcessed: song?.variant_timestamp_lyrics_processed,
    },
  };

  return response;
}

/**
 * Convert Suno API variant data to VariantData format
 */
export function convertSunoVariantsToVariantData(sunoData: any[]): any[] {
  return sunoData.map((variant: any) => ({
    id: variant.id || '',
    audioUrl: variant.audioUrl || null,
    sourceAudioUrl: variant.sourceAudioUrl || null,
    streamAudioUrl: variant.streamAudioUrl || null,
    sourceStreamAudioUrl: variant.sourceStreamAudioUrl || null,
    imageUrl: variant.imageUrl || variant.sourceImageUrl || null,
    sourceImageUrl: variant.sourceImageUrl || null,
    title: variant.title || '',
    duration: variant.duration || 0,
    prompt: variant.prompt || '',
    modelName: variant.modelName || '',
    tags: variant.tags || '',
    createTime: variant.createTime || ''
  }))
}

/**
 * Check if task ID is a demo task
 */
export function isDemoTask(taskId: string): boolean {
  return taskId.startsWith('demo-')
}

/**
 * Extract task ID from song metadata
 */
export function extractTaskId(song: any): string | null {
  const metadata = song.metadata as any
  return metadata?.suno_task_id || null
}
