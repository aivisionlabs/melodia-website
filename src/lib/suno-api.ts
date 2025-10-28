/**
 * Suno API Integration
 * Handles music generation via Suno API
 */

const SUNO_API_URL = process.env.SUNO_API_URL || 'https://api.suno.ai';
const SUNO_API_KEY = process.env.SUNO_API_KEY || '';
const DEMO_MODE = process.env.DEMO_MODE === 'true';

export interface SunoGenerateRequest {
  title: string;
  lyrics: string;
  style: string;
  callbackUrl?: string;
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
  request: SunoGenerateRequest
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

  try {
    const response = await fetch(`${SUNO_API_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
      body: JSON.stringify({
        title: request.title,
        lyrics: request.lyrics,
        style: request.style,
        callback_url: request.callbackUrl,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Suno API error: ${error}`);
    }

    const data = await response.json();
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
    const response = await fetch(`${SUNO_API_URL}/status/${taskId}`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Suno API error: ${error}`);
    }

    const data = await response.json();
    return {
      taskId: data.task_id || data.taskId,
      status: data.status,
      songs: data.songs?.map((song: any) => ({
        id: song.id,
        audioUrl: song.audio_url || song.audioUrl,
        imageUrl: song.image_url || song.imageUrl,
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
 * Cancel a song generation task
 */
export async function cancelSongGeneration(taskId: string): Promise<boolean> {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Suno API - Cancel task:', taskId);
    return true;
  }

  try {
    const response = await fetch(`${SUNO_API_URL}/cancel/${taskId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Suno API cancel error:', error);
    return false;
  }
}

/**
 * Get timestamped lyrics for a song
 */
export async function getTimestampedLyrics(songId: string) {
  if (DEMO_MODE) {
    console.log('[DEMO MODE] Suno API - Get timestamped lyrics:', songId);
    return {
      success: true,
      lyrics: [],
    };
  }

  try {
    const response = await fetch(`${SUNO_API_URL}/lyrics/${songId}`, {
      headers: {
        'Authorization': `Bearer ${SUNO_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch timestamped lyrics');
    }

    const data = await response.json();
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
