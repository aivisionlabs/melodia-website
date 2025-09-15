// Client-side types and functions for lyrics display
export interface LyricsDisplayData {
  songRequest: {
    id: number;
    recipient_name: string;
    languages: string[];
    additional_details: string;
    requester_name: string;
    created_at: string;
  };
  lyricsDraft: {
    id: number;
    generated_text: string;
    edited_text: string | null;
    status: string;
    version: number;
    created_at: string;
  };
}

export async function fetchLyricsDisplayData(requestId: number): Promise<LyricsDisplayData | null> {
  try {
    const response = await fetch(`/api/lyrics-display?requestId=${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch lyrics display data');
    }

    const result = await response.json();
    return result.data || null;
  } catch (error) {
    console.error('Error fetching lyrics display data:', error);
    return null;
  }
}
