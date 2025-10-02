export interface SongRequestPayload {
  requesterName: string;
  recipientDetails: string;
  occasion: string;
  languages: string;
  story: string;
  mood: string[];
  userId: number | string | null;
  anonymousUserId: string | null;
}

export interface DBSongRequest {
  id: number;
  requester_name: string;
  recipient_details: string;
  languages: string;
  song_story: string | null;
  occasion: string | null;
  mood: string[] | null;
  status: string | null;
  created_at: string;
  updated_at: string;
  user_id: number | null;
  anonymous_user_id: string | null;
}


export type SongRequestStatus = "pending" | "processing" | "completed" | "failed";