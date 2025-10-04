import { db } from '@/lib/db';
import { songRequestsTable, lyricsDraftsTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface LyricsDisplayData {
  songRequest: {
    id: number;
    recipient_details: string;
    languages: string;
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

export async function getLyricsDisplayData(requestId: number): Promise<LyricsDisplayData | null> {
  try {
    // Get song request data
    const songRequest = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1);

    if (!songRequest[0]) {
      return null;
    }

    // Get the latest lyrics draft
    const lyricsDraft = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, requestId))
      .orderBy(desc(lyricsDraftsTable.version))
      .limit(1);

    if (!lyricsDraft[0]) {
      return null;
    }

    return {
      songRequest: {
        id: songRequest[0].id,
        recipient_details: songRequest[0].recipient_details,
        languages: Array.isArray(songRequest[0].languages) 
          ? songRequest[0].languages.join(',') 
          : songRequest[0].languages || '',
        requester_name: songRequest[0].requester_name,
        created_at: songRequest[0].created_at.toISOString()
      },
      lyricsDraft: {
        id: lyricsDraft[0].id,
        generated_text: lyricsDraft[0].generated_text,
        status: lyricsDraft[0].status,
        version: lyricsDraft[0].version,
        created_at: lyricsDraft[0].created_at.toISOString()
      }
    };
  } catch (error) {
    console.error('Error fetching lyrics display data:', error);
    return null;
  }
}
