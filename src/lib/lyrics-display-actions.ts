import { db } from '@/lib/db';
import { songRequestsTable, lyricsDraftsTable } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export interface LyricsDisplayData {
  songRequest: {
    id: number;
    recipientDetails: string;
    languages: string;
    requesterName: string;
    createdAt: string;
  };
  lyricsDraft: {
    id: number;
    generatedText: string;
    status: string;
    version: number;
    createdAt: string;
    musicStyle: string;
    title: string;
    language: string;
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
        recipientDetails: songRequest[0].recipient_details,
        languages: songRequest[0].languages || '',
        requesterName: songRequest[0].requester_name,
        createdAt: songRequest[0].created_at.toISOString()
      },
      lyricsDraft: {
        id: lyricsDraft[0].id,
        generatedText: lyricsDraft[0].generated_text,
        status: lyricsDraft[0].status,
        version: lyricsDraft[0].version,
        createdAt: lyricsDraft[0].created_at.toISOString(),
        musicStyle: lyricsDraft[0].music_style || '',
        title: lyricsDraft[0].song_title || '',
        language: lyricsDraft[0].language || 'English'
      }
    };
  } catch (error) {
    console.error('Error fetching lyrics display data:', error);
    return null;
  }
}
