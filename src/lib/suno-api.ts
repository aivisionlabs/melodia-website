/**
 * Suno API Integration
 * Handles music generation via Suno API
 */

const SUNO_API_URL = process.env.SUNO_API_URL || 'https://api.sunoapi.org/api/v1';
const SUNO_API_KEY = process.env.SUNO_API_KEY || '';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export interface SunoGenerateRequest {
  prompt: string;
  style: string;
  title: string;
  customMode: boolean;
  instrumental: boolean;
  model: string;
  negativeTags?: string;
  callBackUrl?: string;
}

export interface SunoGenerateResponse {
  taskId: string;
  status: 'queued' | 'processing';
  estimatedTime?: number;
}

export interface SunoStatusResponse {
  taskId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  songs?: Array<{
    id: string;
    audioUrl: string;
    imageUrl?: string;
    duration?: number;
    timestampedLyrics?: any;
  }>;
  error?: string;
}

/**
 * Generate a song with Suno API
 */
export async function generateSong(
  request: {
    prompt: string;
    style: string;
    title: string;
    negativeTags?: string;
    callBackUrl: string;
  }
): Promise<SunoGenerateResponse> {
  // Demo mode - return mock data
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Suno API - Generate song:', request.title);
    return {
      taskId: `demo-task-${Date.now()}`,
      status: 'queued',
      estimatedTime: 120, // 2 minutes
    };
  }

  console.log("REQUEST:", {
    title: request.title,
    prompt: request.prompt,
    style: request.style,
    customMode: true,
    instrumental: false,
    model: "V5",
    negativeTags: request.negativeTags,
    callback_url: request.callBackUrl,
  });

  console.log("+++++++++++++ SUNO_API_KEY +++++++++++++", SUNO_API_KEY)

  try {
    const response = await fetch(`${SUNO_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
      body: JSON.stringify({
        title: request.title,
        prompt: request.prompt,
        style: request.style,
        customMode: true,
        instrumental: false,
        model: "V5",
        negativeTags: request.negativeTags,
        callback_url: request.callBackUrl,
      }),
    });

    console.log("RESPONSE FROM SUNO API:", response);

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Suno API error: ${error}`);
    }

    const { data } = await response.json();
    console.log('Suno API generate response:', data);
    console.log('Suno API taskId:', data.taskId);
    return {
      taskId: data.task_id || data.taskId,
      status: data.status,
      estimatedTime: data.estimated_time,
    };
  } catch (error) {
    console.error('Suno API generate error:', error);
    throw error;
  }
}

/**
 * Get song generation status
 */
export async function getSongStatus(
  taskId: string
): Promise<SunoStatusResponse> {
  // Demo mode - simulate completion after 2 minutes
  if (DEMO_MODE && taskId.startsWith('demo-task-')) {
    const taskTime = parseInt(taskId.split('-')[2]);
    const elapsedSeconds = (Date.now() - taskTime) / 1000;

    console.log(`[DEMO MODE] Suno API - Status check for ${taskId}`);

    if (elapsedSeconds < 120) {
      // Still processing
      return {
        taskId,
        status: 'processing',
      };
    }

    // Completed - return mock song data
    return {
      taskId,
      status: 'completed',
      songs: [
        {
          id: `demo-song-${taskTime}`,
          audioUrl: '/audio/generated-song-demo.mp3',
          imageUrl: '/images/song-thumbnail-image/birthday-song.png',
          duration: 180,
          timestampedLyrics: {
            alignedWords: [],
          },
        },
      ],
    };
  }

  try {
    const response = await fetch(`${SUNO_API_URL}/generate/record-info?taskId=${taskId}`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Suno API error: ${error}`);
    }

    const { data } = await response.json();
    return {
      taskId: data.taskId,
      status: data.status,
      songs: data.response.sunoData?.map((song: any) => ({
        id: song.id,
        streamAudioUrl: song.sourceStreamAudioUrl,
        audioUrl: song.sourceAudioUrl,
        imageUrl: song.sourceImageUrl,
        duration: song.duration,
        timestampedLyrics: song.timestamped_lyrics || song.timestampedLyrics,
      })),
      error: data.error,
    };
  } catch (error) {
    console.error('Suno API status error:', error);
    throw error;
  }
}

/**
 * Get timestamped lyrics for a song
 */
export async function getTimestampedLyrics(
  request: { taskId: string; musicIndex: number }
) {
  if (DEMO_MODE) {
    return {
      success: true,
      lyrics: [],
    };
  }

  try {
    const response = await fetch(`${SUNO_API_URL}/generate/get-timestamped-lyrics`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        taskId: request.taskId,
        musicIndex: request.musicIndex,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch timestamped lyrics');
    }

    const { data } = await response.json();
    return {
      success: true,
      lyrics: data.lyrics || data.alignedWords || [],
    };
  } catch (error) {
    console.error('Suno API lyrics error:', error);
    return {
      success: false,
      error,
    };
  }
}

/**
 * Factory class for Suno API
 * Provides a unified interface for API operations
 */
export class SunoAPIFactory {
  /**
   * Get API instance
   */
  static getAPI(): SunoAPIWrapper {
    return new SunoAPIWrapper();
  }
}

/**
 * Wrapper class that adapts function-based API to object-based interface
 */
class SunoAPIWrapper {
  /**
   * Generate a song
   * @param request Request object with prompt, style, title, etc.
   * @returns Response with code and data.taskId
   */
  async generateSong(request: {
    prompt?: string;
    style: string;
    title: string;
    customMode?: boolean;
    instrumental?: boolean;
    model?: string;
    negativeTags?: string;
    callBackUrl?: string;
  }): Promise<{ code: number; msg?: string; data: { taskId: string } }> {
    try {

      const response = await generateSong({
        prompt: request.prompt || '',
        style: request.style,
        title: request.title,
        negativeTags: request.negativeTags || '',
        callBackUrl: request.callBackUrl || '',
      });

      return {
        code: 200,
        data: {
          taskId: response.taskId,
        },
      };
    } catch (error: any) {
      console.error('Error in generateSong:', error);
      return {
        code: 500,
        msg: error.message || 'Failed to generate song',
        data: {
          taskId: '',
        },
      };
    }
  }

  /**
   * Get record info for a task
   * @param taskId Task ID
   * @returns Response with task information
   */
  async getRecordInfo(taskId: string): Promise<{
    code: number;
    msg?: string;
    data: {
      taskId: string;
      parentMusicId: string;
      param: string;
      response: {
        taskId: string;
        sunoData: any[];
      };
      status: string;
      type: string;
      errorCode?: string;
      errorMessage?: string;
    };
  }> {
    try {
      const statusResponse = await getSongStatus(taskId);

      return {
        code: 200,
        data: {
          taskId: statusResponse.taskId,
          parentMusicId: '',
          param: '',
          response: {
            taskId: statusResponse.taskId,
            sunoData: statusResponse.songs || [],
          },
          status: statusResponse.status,
          type: 'generate',
          ...(statusResponse.error && {
            errorCode: 'API_ERROR',
            errorMessage: statusResponse.error,
          }),
        },
      };
    } catch (error: any) {
      console.error('Error in getRecordInfo:', error);
      return {
        code: 500,
        msg: error.message || 'Failed to fetch record info',
        data: {
          taskId,
          parentMusicId: '',
          param: '',
          response: { taskId, sunoData: [] },
          status: 'PENDING',
          type: 'generate',
          errorCode: 'INTERNAL_ERROR',
          errorMessage: error.message || 'Failed to fetch record info',
        },
      };
    }
  }

  /**
   * Get timestamped lyrics
   * @param request Request with taskId and musicIndex
   * @returns Response with code and data.alignedWords
   */
  async getTimestampedLyrics(request: {
    taskId: string;
    musicIndex: number;
  }): Promise<{
    code: number;
    msg?: string;
    data?: {
      alignedWords: any[];
    };
  }> {
    try {
      const result = await getTimestampedLyrics({
        taskId: request.taskId,
        musicIndex: request.musicIndex,
      });

      if (!result.success) {
        return {
          code: 500,
          msg: 'Failed to get timestamped lyrics',
          data: {
            alignedWords: [],
          },
        };
      }

      return {
        code: 200,
        data: {
          alignedWords: result.lyrics || [],
        },
      };
    } catch (error: any) {
      console.error('Error in getTimestampedLyrics:', error);
      return {
        code: 500,
        msg: error.message || 'Failed to get timestamped lyrics',
        data: {
          alignedWords: [],
        },
      };
    }
  }
}
