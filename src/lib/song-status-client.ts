import {
  SongStatus,
  VariantStatus
} from "@/lib/services/song-status-calculation-service";
import { SunoSongStatusAPIResponse } from "@/types";

// Client-side functions for song status polling

export interface SongVariant {
  id: string;
  title: string;
  audioUrl: string;
  sourceAudioUrl?: string;
  streamAudioUrl?: string;
  sourceStreamAudioUrl?: string;
  imageUrl: string;
  sourceImageUrl?: string;
  duration: number;
  variantStatus: VariantStatus;
  isLoading?: boolean;
  prompt?: string;
  modelName?: string;
  tags?: string;
  createTime?: string;
}

export interface SongStatusResponse {
  success: boolean;
  status: SongStatus;
  variants?: SongVariant[];
  message?: string;
}


export async function checkSongStatus(songId: string): Promise<SunoSongStatusAPIResponse | { success: boolean, status: 'failed' | 'processing' | 'completed', message: string }> {
  console.log(`🌐 [CLIENT] checkSongStatus called for songId: ${songId}`)

  try {
    const response = await fetch(`/api/song-status/${songId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`❌ [CLIENT] API request failed with status: ${response.status}`)

      // Try to get the error message from the response
      try {
        const errorResult = await response.json();
        if (errorResult.message) {
          return {
            success: false,
            status: 'failed',
            message: errorResult.message
          };
        }
      } catch {
        // If we can't parse the JSON, fall back to generic message
      }

      // For 404 specifically, return "Song not found"
      if (response.status === 404) {
        return {
          success: false,
          status: 'failed',
          message: 'Song not found'
        };
      }

      throw new Error('Failed to check song status');
    }

    const result = await response.json();

    return result;

  } catch (error) {
    console.error('❌ [CLIENT] Error checking song status:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Failed to check song status'
    };
  }
}
