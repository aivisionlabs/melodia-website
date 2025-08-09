import { eq, desc, and } from 'drizzle-orm';
import { db } from '../index';
import { SelectSong, songsTable } from '../schema';

export async function getAllSongs(): Promise<SelectSong[]> {
  return db
    .select()
    .from(songsTable)
    .where(and(eq(songsTable.add_to_library, true), eq(songsTable.is_deleted, false)))
    .orderBy(desc(songsTable.created_at));
}

export async function getSongBySlug(slug: string): Promise<SelectSong | undefined> {
  const result = await db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.slug, slug),
      eq(songsTable.is_deleted, false),
      eq(songsTable.add_to_library, true)
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