// Client-side types and functions for lyrics display
export interface LyricsDisplayData {
  songRequest: {
    id: number;
    recipient_details: string;
    languages: string;
    additional_details: string;
    requester_name: string;
    created_at: string;
  };
  lyricsDraft: {
    id: number;
    generated_text: string;
    status: string;
    version: number;
    created_at: string;
  };
}

