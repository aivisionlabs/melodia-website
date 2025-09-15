import { db } from '@/lib/db';
import { songRequestsTable, lyricsDraftsTable, songsTable } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export interface UserContentItem {
  id: string;
  type: 'lyrics_draft' | 'song_request' | 'song';
  title: string;
  recipient_name: string;
  status: string;
  created_at: string;
  lyrics?: string;
  audio_url?: string;
  request_id?: number;
  song_id?: number;
  lyrics_draft_id?: number;
  suno_task_id?: string;
  variants?: Array<{
    id: string;
    audioUrl: string;
    streamAudioUrl: string;
    imageUrl: string;
    prompt: string;
    modelName: string;
    title: string;
    tags: string;
    createTime: string;
    duration: number;
  }>;
  selected_variant?: number;
}

export async function getUserContent(userId: number): Promise<UserContentItem[]> {
  try {
    const content: UserContentItem[] = [];

    // Get song requests with their latest lyrics drafts
    const songRequests = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.user_id, userId))
      .orderBy(desc(songRequestsTable.created_at));

    for (const request of songRequests) {
      // If there's a generated song, show only the song (not lyrics draft)
      if (request.generated_song_id) {
        const song = await db
          .select({
            id: songsTable.id,
            title: songsTable.title,
            status: songsTable.status,
            created_at: songsTable.created_at,
            lyrics: songsTable.lyrics,
            song_url: songsTable.song_url,
            suno_task_id: songsTable.suno_task_id,
            suno_variants: songsTable.suno_variants,
            selected_variant: songsTable.selected_variant
          })
          .from(songsTable)
          .where(eq(songsTable.id, request.generated_song_id))
          .limit(1);

        if (song[0]) {
          content.push({
            id: `song-${song[0].id}`,
            type: 'song',
            title: song[0].title,
            recipient_name: request.recipient_name,
            status: song[0].status || 'draft',
            created_at: song[0].created_at.toISOString(),
            lyrics: song[0].lyrics || undefined,
            audio_url: song[0].song_url || undefined,
            request_id: request.id,
            song_id: song[0].id,
            suno_task_id: song[0].suno_task_id || undefined,
            variants: Array.isArray(song[0].suno_variants) ? song[0].suno_variants : undefined,
            selected_variant: song[0].selected_variant || 0
          });
        }
      } else {
        // No generated song yet, show lyrics draft or song request
        const latestDraft = await db
          .select()
          .from(lyricsDraftsTable)
          .where(eq(lyricsDraftsTable.song_request_id, request.id))
          .orderBy(desc(lyricsDraftsTable.version))
          .limit(1);

        if (latestDraft[0]) {
          // Add lyrics draft
          content.push({
            id: `lyrics-${latestDraft[0].id}`,
            type: 'lyrics_draft',
            title: `Lyrics for ${request.recipient_name}`,
            recipient_name: request.recipient_name,
            status: latestDraft[0].status,
            created_at: latestDraft[0].created_at.toISOString(),
            lyrics: latestDraft[0].edited_text || latestDraft[0].generated_text || undefined,
            request_id: request.id,
            lyrics_draft_id: latestDraft[0].id
          });
        } else {
          // Add song request without lyrics
          content.push({
            id: `request-${request.id}`,
            type: 'song_request',
            title: `Song Request for ${request.recipient_name}`,
            recipient_name: request.recipient_name,
            status: request.status || 'pending',
            created_at: request.created_at.toISOString(),
            request_id: request.id
          });
        }
      }
    }

    // Sort by creation date (newest first)
    return content.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  } catch (error) {
    console.error('Error fetching user content:', error);
    return [];
  }
}

export function getButtonForContent(item: UserContentItem) {
  switch (item.type) {
    case 'lyrics_draft':
      switch (item.status) {
        case 'draft':
          return { text: 'Generate Song', action: 'generate', variant: 'default' as const };
        case 'needs_review':
          return { text: 'Review Lyrics', action: 'review', variant: 'secondary' as const };
        case 'approved':
          return { text: 'Generate Song', action: 'generate', variant: 'default' as const };
        default:
          return { text: 'View Lyrics', action: 'view', variant: 'outline' as const };
      }
    
    case 'song_request':
      switch (item.status) {
        case 'pending':
          return { text: 'Create Lyrics', action: 'create_lyrics', variant: 'default' as const };
        case 'processing':
          return { text: 'View Progress', action: 'progress', variant: 'secondary' as const };
        default:
          return { text: 'View Details', action: 'view', variant: 'outline' as const };
      }
    
    case 'song':
      switch (item.status) {
        case 'ready':
        case 'completed':
          return { text: 'Listen', action: 'listen', variant: 'default' as const };
        case 'generating':
        case 'processing':
          return { text: 'View Progress', action: 'progress', variant: 'secondary' as const };
        case 'failed':
          return { text: 'Retry', action: 'retry', variant: 'destructive' as const };
        default:
          return { text: 'View Song', action: 'view', variant: 'outline' as const };
      }
    
    default:
      return { text: 'View', action: 'view', variant: 'outline' as const };
  }
}
