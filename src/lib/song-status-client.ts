// Client-side functions for song status polling
export interface SongStatusResponse {
  success: boolean;
  status: 'processing' | 'completed' | 'failed';
  audioUrl?: string;
  variants?: Array<{
    audioUrl: string;
    streamAudioUrl: string;
    duration: number;
  }>;
  message?: string;
  demoMode?: boolean;
}

export async function checkSongStatus(taskId: string): Promise<SongStatusResponse> {
  try {
    const response = await fetch(`/api/song-status/${taskId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check song status');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error checking song status:', error);
    return {
      success: false,
      status: 'failed',
      message: 'Failed to check song status'
    };
  }
}

export function pollSongStatusOnce(
  taskId: string,
  onUpdate: (status: SongStatusResponse) => void,
  onError?: (error: Error) => void
): void {
  checkSongStatus(taskId)
    .then(onUpdate)
    .catch((error) => {
      console.error('Song status polling error:', error);
      onError?.(error);
    });
}

export function pollSongStatus(
  taskId: string,
  onUpdate: (status: SongStatusResponse) => void,
  onError?: (error: Error) => void,
  intervalMs: number = 10000 // 10 seconds
): () => void {
  const interval = setInterval(() => {
    checkSongStatus(taskId)
      .then((status) => {
        onUpdate(status);
        
        // Stop polling if song is completed or failed
        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
        }
      })
      .catch((error) => {
        console.error('Song status polling error:', error);
        onError?.(error);
        clearInterval(interval);
      });
  }, intervalMs);

  // Return cleanup function
  return () => clearInterval(interval);
}
