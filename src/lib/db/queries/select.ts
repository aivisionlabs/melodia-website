import { eq, desc, and } from 'drizzle-orm';
import { db } from '../index';
import { SelectSong, songsTable, songRequestsTable } from '../schema';

export async function getAllSongs(): Promise<SelectSong[]> {
  return db
    .select()
    .from(songsTable)
    .where(eq(songsTable.is_active, true))
    .orderBy(desc(songsTable.created_at));
}

export async function getSongBySlug(slug: string): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.slug, slug),
      eq(songsTable.is_active, true)
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
    .where(eq(songsTable.suno_task_id, taskId))
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
    .where(eq(songsTable.suno_task_id, taskId))
    .limit(1);

  return result[0]?.song_requests;
}