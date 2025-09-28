import { db } from '@/lib/db';
import { songRequestsTable, lyricsDraftsTable, songsTable } from '@/lib/db/schema';
import { eq, desc, inArray } from 'drizzle-orm';

export interface UserContentItem {
  id: string;
  type: 'lyrics_draft' | 'song_request' | 'song';
  title: string;
  recipient_details: string;
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
  timestamped_lyrics_variants?: { [variantIndex: number]: any[] };
  timestamp_lyrics?: any[];
}

export async function getUserContent(
  userId?: number | null,
  anonymousUserId?: string | null
): Promise<UserContentItem[]> {
  try {
    const content: UserContentItem[] = [];

    // Validate that either userId or anonymousUserId is provided
    if (!userId && !anonymousUserId) {
      throw new Error('Either userId or anonymousUserId must be provided');
    }

    // Get all song requests for the user
    const songRequests = await db
      .select()
      .from(songRequestsTable)
      .where(
        userId
          ? eq(songRequestsTable.user_id, userId)
          : anonymousUserId ? eq(songRequestsTable.anonymous_user_id, anonymousUserId) : undefined
      )
      .orderBy(desc(songRequestsTable.created_at));

    // Get all songs for these requests in one query
    const requestIds = songRequests.map(req => req.id);
    const songs = requestIds.length > 0 ? await db
      .select({
        id: songsTable.id,
        title: songsTable.title,
        status: songsTable.status,
        created_at: songsTable.created_at,
        lyrics: songsTable.lyrics,
        song_url: songsTable.song_url,
        suno_task_id: songsTable.suno_task_id,
        suno_variants: songsTable.suno_variants,
        selected_variant: songsTable.selected_variant,
        timestamped_lyrics_variants: songsTable.timestamped_lyrics_variants,
        timestamp_lyrics: songsTable.timestamp_lyrics,
        song_request_id: songsTable.song_request_id
      })
      .from(songsTable)
      .where(inArray(songsTable.song_request_id, requestIds)) : [];

    // Get all lyrics drafts for these requests in one query
    const lyricsDrafts = requestIds.length > 0 ? await db
      .select()
      .from(lyricsDraftsTable)
      .where(inArray(lyricsDraftsTable.song_request_id, requestIds))
      .orderBy(desc(lyricsDraftsTable.version)) : [];

    // Create maps for easy lookup
    const songsByRequestId = new Map(songs.map(song => [song.song_request_id, song]));
    const lyricsDraftsByRequestId = new Map<number, any[]>();

    // Group lyrics drafts by request ID and get the latest version for each
    lyricsDrafts.forEach(draft => {
      if (!lyricsDraftsByRequestId.has(draft.song_request_id)) {
        lyricsDraftsByRequestId.set(draft.song_request_id, []);
      }
      lyricsDraftsByRequestId.get(draft.song_request_id)!.push(draft);
    });

    // Process each song request
    for (const request of songRequests) {
      const song = songsByRequestId.get(request.id);

      if (song) {
        // If there's a generated song, show only the song (not lyrics draft)
        content.push({
          id: `song-${song.id}`,
          type: 'song',
          title: song.title,
          recipient_details: request.recipient_details,
          status: song.status || 'draft',
          created_at: song.created_at.toISOString(),
          lyrics: song.lyrics || undefined,
          audio_url: song.song_url || undefined,
          request_id: request.id,
          song_id: song.id,
          suno_task_id: song.suno_task_id || undefined,
          variants: Array.isArray(song.suno_variants) ? song.suno_variants : undefined,
          selected_variant: song.selected_variant || 0,
          timestamped_lyrics_variants: song.timestamped_lyrics_variants as { [variantIndex: number]: any[] } | undefined,
          timestamp_lyrics: song.timestamp_lyrics as any[] | undefined
        });
      } else {
        // No generated song yet, show lyrics draft or song request
        const requestDrafts = lyricsDraftsByRequestId.get(request.id);

        if (requestDrafts && requestDrafts.length > 0) {
          // Get the latest draft (first in the array since we ordered by version desc)
          const latestDraft = requestDrafts[0];

          content.push({
            id: `lyrics-${latestDraft.id}`,
            type: 'lyrics_draft',
            title: `Lyrics for ${request.recipient_details}`,
            recipient_details: request.recipient_details,
            status: latestDraft.status,
            created_at: latestDraft.created_at.toISOString(),
            lyrics: latestDraft.generated_text || undefined,
            request_id: request.id,
            lyrics_draft_id: latestDraft.id
          });
        } else {
          // Add song request without lyrics
          content.push({
            id: `request-${request.id}`,
            type: 'song_request',
            title: `Song Request for ${request.recipient_details}`,
            recipient_details: request.recipient_details,
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
