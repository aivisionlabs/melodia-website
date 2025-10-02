import {
  SongStatus,
  VariantStatus
} from "@/lib/services/song-status-calculation-service";
import { FetchSongStatusApiResponse } from "@/lib/services/song-status-api-utils";

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


// Simplified error response type
type ErrorResponse = {
  success: false;
  status: 'failed';
  message: string;
};

export async function checkSongStatus(songId: string): Promise<FetchSongStatusApiResponse | ErrorResponse> {
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

      // Handle 404 specifically
      if (response.status === 404) {
        return {
          success: false,
          status: 'failed',
          message: 'Song not found'
        };
      }

      // Try to get error message from response body
      let errorMessage = 'Failed to check song status';
      try {
        const errorResult = await response.json();
        if (errorResult.message) {
          errorMessage = errorResult.message;
        }
      } catch {
        // Use default message if JSON parsing fails
      }

      return {
        success: false,
        status: 'failed',
        message: errorMessage
      };
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
