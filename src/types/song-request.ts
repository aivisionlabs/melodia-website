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

export type SongRequestStatus = "pending" | "processing" | "completed" | "failed";