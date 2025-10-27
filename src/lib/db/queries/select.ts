import { and, eq, sql, ilike, or } from 'drizzle-orm';
import { db } from '../index';
import { SelectSong, SelectCategory, categoriesTable, songsTable, songCategoriesTable } from '../schema';

// Lightweight row shape for library listings (avoids heavy JSON columns)
type LibrarySongRow = {
  id: number;
  created_at: Date;
  title: string;
  song_description: string | null;
  music_style: string | null;
  service_provider: string | null;
  song_url: string | null;
  duration: string | null;
  slug: string;
  add_to_library: boolean | null;
  is_deleted: boolean | null;
  status: string | null;
  categories: string[] | null;
  tags: string[] | null;
  suno_variants: unknown;
  selected_variant: number | null;
  sequence: number | null;
  show_lyrics: boolean | null;
  likes_count: number | null;
};

export async function getAllSongsPaginated(limit: number = 20, offset: number = 0): Promise<{ songs: LibrarySongRow[]; total: number }> {
  // Optimized query - exclude heavy JSONB columns for library view
  const songs = await db
    .select({
      id: songsTable.id,
      created_at: songsTable.created_at,
      title: songsTable.title,
      song_description: songsTable.song_description,
      music_style: songsTable.music_style,
      service_provider: songsTable.service_provider,
      song_url: songsTable.song_url,
      duration: songsTable.duration,
      slug: songsTable.slug,
      add_to_library: songsTable.add_to_library,
      is_deleted: songsTable.is_deleted,
      status: songsTable.status,
      categories: songsTable.categories,
      tags: songsTable.tags,
      // Extract only essential variant info for library performance
      suno_variants: sql<any>`CASE
        WHEN ${songsTable.suno_variants} IS NOT NULL AND jsonb_array_length(${songsTable.suno_variants}) > 0
        THEN jsonb_build_object(
          'sourceImageUrl', ${songsTable.suno_variants}->0->>'sourceImageUrl'
        )
        ELSE NULL
      END`,
      selected_variant: songsTable.selected_variant,
      sequence: songsTable.sequence,
      show_lyrics: songsTable.show_lyrics,
      likes_count: songsTable.likes_count,
    })
    .from(songsTable)
    .where(and(eq(songsTable.add_to_library, true), eq(songsTable.is_deleted, false)))
    .orderBy(songsTable.sequence, songsTable.created_at)
    .limit(limit)
    .offset(offset) as unknown as LibrarySongRow[];

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(songsTable)
    .where(and(eq(songsTable.add_to_library, true), eq(songsTable.is_deleted, false)));

  return {
    songs,
    total: Number(totalResult[0]?.count || 0)
  };
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

// Lightweight song data for faster navigation - excludes heavy JSON fields
export async function getSongBySlugLightweight(slug: string): Promise<{
  id: number;
  title: string;
  artist: string;
  song_url: string | null;
  duration: string | null;
  slug: string;
  show_lyrics: boolean | null;
  likes_count: number | null;
  suno_variants: unknown;
  selected_variant: number | null;
} | undefined> {
  const result = await db
    .select({
      id: songsTable.id,
      title: songsTable.title,
      service_provider: songsTable.service_provider,
      song_url: songsTable.song_url,
      duration: songsTable.duration,
      slug: songsTable.slug,
      show_lyrics: songsTable.show_lyrics,
      likes_count: songsTable.likes_count,
      suno_variants: songsTable.suno_variants,
      selected_variant: songsTable.selected_variant,
    })
    .from(songsTable)
    .where(and(
      eq(songsTable.slug, slug),
      eq(songsTable.is_deleted, false),
      eq(songsTable.add_to_library, true)
    ))
    .limit(1);

  const song = result[0];
  if (!song) return undefined;

  return {
    id: song.id,
    title: song.title,
    artist: song.service_provider || "Melodia",
    song_url: song.song_url,
    duration: song.duration,
    slug: song.slug,
    show_lyrics: song.show_lyrics,
    likes_count: song.likes_count,
    suno_variants: song.suno_variants,
    selected_variant: song.selected_variant,
  };
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

// Get songs filtered by category slug with pagination (server-side filtering)
export async function getSongsByCategorySlugPaginated(categorySlug: string | null, limit: number = 20, offset: number = 0): Promise<{ songs: LibrarySongRow[]; total: number }> {
  if (!categorySlug || categorySlug === 'all') {
    return getAllSongsPaginated(limit, offset);
  }

  const songs = await db
    .select({
      id: songsTable.id,
      created_at: songsTable.created_at,
      title: songsTable.title,
      song_description: songsTable.song_description,
      music_style: songsTable.music_style,
      service_provider: songsTable.service_provider,
      song_url: songsTable.song_url,
      duration: songsTable.duration,
      slug: songsTable.slug,
      add_to_library: songsTable.add_to_library,
      is_deleted: songsTable.is_deleted,
      status: songsTable.status,
      categories: songsTable.categories,
      tags: songsTable.tags,
      // Extract only essential variant info for library performance
      suno_variants: sql<any>`CASE
        WHEN ${songsTable.suno_variants} IS NOT NULL AND jsonb_array_length(${songsTable.suno_variants}) > 0
        THEN jsonb_build_object(
          'sourceImageUrl', ${songsTable.suno_variants}->0->>'sourceImageUrl'
        )
        ELSE NULL
      END`,
      selected_variant: songsTable.selected_variant,
      sequence: songsTable.sequence,
      show_lyrics: songsTable.show_lyrics,
      likes_count: songsTable.likes_count,
    })
    .from(songsTable)
    .innerJoin(songCategoriesTable, eq(songCategoriesTable.song_id, songsTable.id))
    .innerJoin(categoriesTable, eq(categoriesTable.id, songCategoriesTable.category_id))
    .where(and(
      eq(categoriesTable.slug, categorySlug),
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .orderBy(songsTable.sequence, songsTable.created_at)
    .limit(limit)
    .offset(offset) as unknown as LibrarySongRow[];

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(songsTable)
    .innerJoin(songCategoriesTable, eq(songCategoriesTable.song_id, songsTable.id))
    .innerJoin(categoriesTable, eq(categoriesTable.id, songCategoriesTable.category_id))
    .where(and(
      eq(categoriesTable.slug, categorySlug),
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ));

  return {
    songs,
    total: Number(totalResult[0]?.count || 0)
  };
}

// Get categories with counts of active, non-deleted songs (only categories with 1+ songs)
// Optimized version with better query performance
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
    .innerJoin(songCategoriesTable, eq(songCategoriesTable.category_id, categoriesTable.id))
    .innerJoin(songsTable, and(
      eq(songCategoriesTable.song_id, songsTable.id),
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .groupBy(categoriesTable.id, categoriesTable.name, categoriesTable.slug, categoriesTable.sequence)
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

// Search songs by title and description with pagination
export async function searchSongsPaginated(query: string, limit: number = 20, offset: number = 0): Promise<{ songs: LibrarySongRow[]; total: number }> {
  if (!query || query.trim().length === 0) {
    return getAllSongsPaginated(limit, offset);
  }

  const searchTerm = `%${query.trim()}%`;

  const songs = await db
    .select({
      id: songsTable.id,
      created_at: songsTable.created_at,
      title: songsTable.title,
      song_description: songsTable.song_description,
      music_style: songsTable.music_style,
      service_provider: songsTable.service_provider,
      song_url: songsTable.song_url,
      duration: songsTable.duration,
      slug: songsTable.slug,
      add_to_library: songsTable.add_to_library,
      is_deleted: songsTable.is_deleted,
      status: songsTable.status,
      categories: songsTable.categories,
      tags: songsTable.tags,
      // Extract only essential variant info for library performance
      suno_variants: sql<any>`CASE
        WHEN ${songsTable.suno_variants} IS NOT NULL AND jsonb_array_length(${songsTable.suno_variants}) > 0
        THEN jsonb_build_object(
          'sourceImageUrl', ${songsTable.suno_variants}->0->>'sourceImageUrl'
        )
        ELSE NULL
      END`,
      selected_variant: songsTable.selected_variant,
      sequence: songsTable.sequence,
      show_lyrics: songsTable.show_lyrics,
      likes_count: songsTable.likes_count,
    })
    .from(songsTable)
    .where(and(
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false),
      or(
        ilike(songsTable.title, searchTerm),
        ilike(songsTable.song_description, searchTerm)
      )
    ))
    .orderBy(songsTable.sequence, songsTable.created_at)
    .limit(limit)
    .offset(offset) as unknown as LibrarySongRow[];

  // Get total count for pagination
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(songsTable)
    .where(and(
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false),
      or(
        ilike(songsTable.title, searchTerm),
        ilike(songsTable.song_description, searchTerm)
      )
    ));

  return {
    songs,
    total: Number(totalResult[0]?.count || 0)
  };
}

// Backward-compatible wrappers (non-paginated)
export async function getAllSongs(): Promise<SelectSong[]> {
  return db
    .select()
    .from(songsTable)
    .where(eq(songsTable.is_deleted, false))
    .orderBy(sql`${songsTable.created_at} DESC`);
}

export async function getSongsByCategorySlug(categorySlug: string): Promise<SelectSong[]> {
  if (!categorySlug || categorySlug === 'all') {
    return getAllSongs();
  }

  const rows = await db
    .select()
    .from(songsTable)
    .innerJoin(songCategoriesTable, eq(songCategoriesTable.song_id, songsTable.id))
    .innerJoin(categoriesTable, eq(categoriesTable.id, songCategoriesTable.category_id))
    .where(and(
      eq(categoriesTable.slug, categorySlug),
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .orderBy(songsTable.sequence, songsTable.created_at);

  // rows will be array of tuples due to joins; map to songsTable shape
  return rows.map((r: any) => r.songs);
}

export async function searchSongs(query: string): Promise<SelectSong[]> {
  if (!query || query.trim().length === 0) {
    return getAllSongs();
  }
  const searchTerm = `%${query.trim()}%`;
  return db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false),
      or(
        ilike(songsTable.title, searchTerm),
        ilike(songsTable.song_description, searchTerm)
      )
    ))
    .orderBy(songsTable.sequence, songsTable.created_at);
}

// Get all songs for fuzzy search (returns all songs without filtering)
export async function getAllSongsForFuzzySearch(): Promise<SelectSong[]> {
  return db
    .select()
    .from(songsTable)
    .where(and(
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .orderBy(songsTable.sequence, songsTable.created_at);
}

// Get all songs with category names for enhanced fuzzy search
export async function getAllSongsWithCategoriesForFuzzySearch(): Promise<Array<SelectSong & { categoryNames: string[] }>> {
  const result = await db
    .select({
      song: songsTable,
      categoryName: categoriesTable.name,
      categorySlug: categoriesTable.slug
    })
    .from(songsTable)
    .leftJoin(songCategoriesTable, eq(songCategoriesTable.song_id, songsTable.id))
    .leftJoin(categoriesTable, eq(categoriesTable.id, songCategoriesTable.category_id))
    .where(and(
      eq(songsTable.add_to_library, true),
      eq(songsTable.is_deleted, false)
    ))
    .orderBy(songsTable.sequence, songsTable.created_at);

  // Group by song and collect category names
  const songMap = new Map<number, SelectSong & { categoryNames: string[] }>();

  result.forEach(row => {
    const songId = row.song.id;

    if (!songMap.has(songId)) {
      songMap.set(songId, {
        ...row.song,
        categoryNames: []
      });
    }

    // Add category name if it exists and isn't already added
    if (row.categoryName && !songMap.get(songId)!.categoryNames.includes(row.categoryName)) {
      songMap.get(songId)!.categoryNames.push(row.categoryName);
    }
  });

  return Array.from(songMap.values());
}

export async function getActiveSongsCount(): Promise<number> {
  const totalResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(songsTable)
    .where(and(eq(songsTable.add_to_library, true), eq(songsTable.is_deleted, false)));
  return Number(totalResult[0]?.count || 0);
}