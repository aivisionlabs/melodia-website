import { and, eq, sql, gte } from 'drizzle-orm';
import { db } from '../index';
import { SelectSong, SelectCategory, categoriesTable, songsTable, songCategoriesTable } from '../schema';

export async function getAllSongs(): Promise<SelectSong[]> {
  return db
    .select()
    .from(songsTable)
    .where(and(eq(songsTable.add_to_library, true), eq(songsTable.is_deleted, false)))
    .orderBy(songsTable.sequence, songsTable.created_at);
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

// Get songs filtered by category slug (server-side filtering)
export async function getSongsByCategorySlug(categorySlug: string | null): Promise<SelectSong[]> {
  if (!categorySlug || categorySlug === 'all') {
    return getAllSongs();
  }

  const result = await db
    .select({ song: songsTable })
    .from(songsTable)
    .innerJoin(songCategoriesTable, eq(songCategoriesTable.song_id, songsTable.id))
    .innerJoin(categoriesTable, eq(categoriesTable.id, songCategoriesTable.category_id))
    .where(and(
      eq(categoriesTable.slug, categorySlug),
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .orderBy(songsTable.sequence, songsTable.created_at);

  // result is array of { song: SelectSong }
  return result.map(r => r.song);
}

// Get categories with counts of active, non-deleted songs (only categories with 1+ songs)
export async function getCategoriesWithCounts(): Promise<Array<{ id: number; name: string; slug: string; sequence: number | null; count: number }>> {
  const rows = await db
    .select({
      id: categoriesTable.id,
      name: categoriesTable.name,
      slug: categoriesTable.slug,
      sequence: categoriesTable.sequence,
      count: sql<number>`count(${songsTable.id})`,
    })
    .from(categoriesTable)
    .leftJoin(songCategoriesTable, eq(songCategoriesTable.category_id, categoriesTable.id))
    .leftJoin(songsTable, and(
      eq(songCategoriesTable.song_id, songsTable.id),
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug, categoriesTable.sequence)
    .having(gte(sql`count(${songsTable.id})`, 1))
    .orderBy(categoriesTable.sequence, categoriesTable.name);

  return rows.map(r => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    sequence: r.sequence ?? 0,
    count: Number(r.count ?? 0),
  }));
}

export async function getCategoryBySlug(slug: string): Promise<SelectCategory | undefined> {
  const result = await db
    .select()
    .from(categoriesTable)
    .where(eq(categoriesTable.slug, slug))
    .limit(1);
  return result[0];
}

export async function listAllCategories(): Promise<SelectCategory[]> {
  return db
    .select()
    .from(categoriesTable)
    .orderBy(categoriesTable.sequence, categoriesTable.name);
}