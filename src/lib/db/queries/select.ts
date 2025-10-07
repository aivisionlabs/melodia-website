import { eq, desc, and } from 'drizzle-orm';
import { db } from '../index';
import { SelectSong, songsTable, songRequestsTable, lyricsDraftsTable } from '../schema';

export async function getAllSongs(): Promise<SelectSong[]> {
  return db
    .select()
    .from(songsTable)
    .where(eq(songsTable.is_deleted, false))
    .orderBy(desc(songsTable.created_at));
}

export async function getSongBySlug(slug: string): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.slug, slug),
      eq(songsTable.is_deleted, false)
    ))
    .limit(1);

  return result[0];
}

export async function getSongBySlugAll(slug: string): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.slug, slug))
    .limit(1);

  return result[0];
}

export async function getSongById(id: number): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, id))
    .limit(1);

  return result[0];
}

export async function getSongByTaskId(taskId: string): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.metadata, { suno_task_id: taskId }))
    .limit(1);

  return result[0];
}

export async function getSongByIdQuery(id: number): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(eq(songsTable.id, id))
    .limit(1);

  return result[0];
}

export async function getSongRequestById(id: number): Promise<any | undefined> {
  const result = await db
    .select()
    .from(songRequestsTable)
    .where(eq(songRequestsTable.id, id))
    .limit(1);

  return result[0];
}

export async function getSongRequestByTaskId(taskId: string): Promise<any | undefined> {
  const result = await db
    .select()
    .from(songRequestsTable)
    .innerJoin(songsTable, eq(songRequestsTable.id, songsTable.song_request_id))
    .where(eq(songsTable.metadata, { suno_task_id: taskId }))
    .limit(1);

  return result[0]?.song_requests;
}

export async function getSongWithLyricsDraft(id: number): Promise<(SelectSong & { lyrics_draft_title?: string | null }) | undefined> {
  const result = await db
    .select({
      // Song fields
      id: songsTable.id,
      created_at: songsTable.created_at,
      song_request_id: songsTable.song_request_id,
      user_id: songsTable.user_id,
      slug: songsTable.slug,
      status: songsTable.status,
      is_featured: songsTable.is_featured,
      song_variants: songsTable.song_variants,
      variant_timestamp_lyrics_api_response: songsTable.variant_timestamp_lyrics_api_response,
      variant_timestamp_lyrics_processed: songsTable.variant_timestamp_lyrics_processed,
      metadata: songsTable.metadata,
      approved_lyrics_id: songsTable.approved_lyrics_id,
      service_provider: songsTable.service_provider,
      categories: songsTable.categories,
      tags: songsTable.tags,
      add_to_library: songsTable.add_to_library,
      is_deleted: songsTable.is_deleted,
      selected_variant: songsTable.selected_variant,
      payment_id: songsTable.payment_id,
      // Lyrics draft fields
      lyrics_draft_title: lyricsDraftsTable.song_title,
    })
    .from(songsTable)
    .leftJoin(lyricsDraftsTable, eq(songsTable.approved_lyrics_id, lyricsDraftsTable.id))
    .where(eq(songsTable.id, id))
    .limit(1);

  return result[0];
}