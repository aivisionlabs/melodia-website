import { getAllSongs as getAllSongsQuery, getSongBySlug as getSongBySlugQuery, getSongByTaskId as getSongByTaskIdQuery } from './queries/select';
import { createSong as createSongQuery } from './queries/insert';
import { updateSongStatus as updateSongStatusQuery, updateSongWithVariants as updateSongWithVariantsQuery } from './queries/update';
import { Song } from '@/types';
import { generateBaseSlug } from '@/lib/utils/slug';

// Song Services
export async function getAllSongs(): Promise<Song[]> {
  try {
    const songs = await getAllSongsQuery();
    return songs.map(song => ({
      id: song.id,
      created_at: song.created_at.toISOString(),
      title: song.title,
      lyrics: song.lyrics,
      timestamp_lyrics: song.timestamp_lyrics as any,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as any,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as any,
      music_style: song.music_style,
      service_provider: song.service_provider,
      song_requester: song.song_requester,
      prompt: song.prompt,
      song_url: song.song_url,
      duration: song.duration,
      slug: song.slug,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      metadata: song.metadata ?? undefined,
    }));
  } catch (error) {
    console.error('Error fetching songs:', error);
    return [];
  }
}

export async function getSongBySlug(slug: string): Promise<Song | null> {
  try {
    const song = await getSongBySlugQuery(slug);
    if (!song) return null;

    return {
      id: song.id,
      created_at: song.created_at.toISOString(),
      title: song.title,
      lyrics: song.lyrics,
      timestamp_lyrics: song.timestamp_lyrics as any,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as any,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as any,
      music_style: song.music_style,
      service_provider: song.service_provider,
      song_requester: song.song_requester,
      prompt: song.prompt,
      song_url: song.song_url,
      duration: song.duration,
      slug: song.slug,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      negative_tags: song.negative_tags ?? undefined,
      suno_variants: song.suno_variants ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      metadata: song.metadata ?? undefined,
    };
  } catch (error) {
    console.error('Error fetching song:', error);
    return null;
  }
}

export async function getSongByTaskId(taskId: string): Promise<Song | null> {
  try {
    const song = await getSongByTaskIdQuery(taskId);
    if (!song) return null;

    return {
      id: song.id,
      created_at: song.created_at.toISOString(),
      title: song.title,
      lyrics: song.lyrics,
      timestamp_lyrics: song.timestamp_lyrics as any,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as any,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as any,
      music_style: song.music_style,
      service_provider: song.service_provider,
      song_requester: song.song_requester,
      prompt: song.prompt,
      song_url: song.song_url,
      duration: song.duration,
      slug: song.slug,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      negative_tags: song.negative_tags ?? undefined,
      suno_variants: song.suno_variants ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      metadata: song.metadata ?? undefined,
    };
  } catch (error) {
    console.error('Error fetching song by task ID:', error);
    return null;
  }
}

export async function getSongById(id: number): Promise<Song | null> {
  try {
    const { getSongByIdQuery } = await import('./queries/select');
    const song = await getSongByIdQuery(id);
    if (!song) return null;

    return {
      id: song.id,
      created_at: song.created_at.toISOString(),
      title: song.title,
      lyrics: song.lyrics,
      timestamp_lyrics: song.timestamp_lyrics as any,
      timestamped_lyrics_variants: song.timestamped_lyrics_variants as any,
      timestamped_lyrics_api_responses: song.timestamped_lyrics_api_responses as any,
      music_style: song.music_style,
      service_provider: song.service_provider,
      song_requester: song.song_requester,
      prompt: song.prompt,
      song_url: song.song_url,
      duration: song.duration,
      slug: song.slug,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      status: song.status ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      suno_task_id: song.suno_task_id ?? undefined,
      negative_tags: song.negative_tags ?? undefined,
      suno_variants: song.suno_variants ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      metadata: song.metadata ?? undefined,
    };
  } catch (error) {
    console.error('Error fetching song by ID:', error);
    return null;
  }
}


// Helper function to generate unique slug
async function generateUniqueSlug(baseSlug: string): Promise<string> {
  // If base slug is empty, use a default
  if (!baseSlug || baseSlug.trim() === '') {
    baseSlug = 'song';
  }

  let slug = baseSlug;
  let counter = 1;
  const maxAttempts = 1000;

  console.log(`Generating unique slug for base: "${baseSlug}"`);

  while (counter <= maxAttempts) {
    // Check if slug exists in database (including deleted songs)
    const { getSongBySlugAll } = await import('./queries/select');
    const existingSong = await getSongBySlugAll(slug);

    if (!existingSong) {
      console.log(`Generated unique slug: "${slug}" (attempt ${counter})`);
      return slug;
    }

    // Generate next slug with counter
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  // Fallback: use timestamp to ensure uniqueness
  const timestamp = Date.now();
  const fallbackSlug = `${baseSlug}-${timestamp}`;
  console.log(`Using fallback slug: "${fallbackSlug}" after ${maxAttempts} attempts`);
  return fallbackSlug;
}

export async function createSong(songData: {
  title: string;
  lyrics: string;
  music_style: string;
  categories?: string[];
  tags?: string[];
  negative_tags?: string;
  prompt?: string;
}): Promise<{ success: boolean; songId?: number; error?: string }> {
  try {
    // Validate title
    if (!songData.title || typeof songData.title !== 'string' || songData.title.trim().length === 0) {
      return { success: false, error: 'Title is required and cannot be empty' };
    }

    if (songData.title.length > 200) {
      return { success: false, error: 'Title is too long (maximum 200 characters)' };
    }

    // Generate base slug from title
    const baseSlug = generateBaseSlug(songData.title);

    // Generate unique slug
    const slug = await generateUniqueSlug(baseSlug);

    const newSong = {
      title: songData.title,
      lyrics: songData.lyrics,
      music_style: songData.music_style,
      categories: songData.categories || [],
      tags: songData.tags || [],
      negative_tags: songData.negative_tags,
      prompt: songData.prompt || songData.lyrics,
      slug,
      status: 'draft',
      add_to_library: false,
      is_deleted: false,
    };

    const song = await createSongQuery(newSong);
    return { success: true, songId: song.id };
  } catch (error) {
    console.error('Error creating song:', error);

    // Check for specific database errors
    if (error instanceof Error) {
      if (error.message.includes('duplicate key value violates unique constraint') && error.message.includes('songs_slug_key')) {
        return { success: false, error: 'A song with this title already exists (including deleted songs). Please choose a different title.' };
      }
      if (error.message.includes('violates not-null constraint')) {
        return { success: false, error: 'Missing required fields. Please fill in all required information.' };
      }
    }

    return { success: false, error: 'Failed to create song. Please try again.' };
  }
}

export async function updateSongStatus(
  songId: number,
  status: 'draft' | 'pending' | 'generating' | 'completed' | 'failed',
  songUrl?: string,
  sunoTaskId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSongStatusQuery(songId, status, songUrl, sunoTaskId);
    return { success: true };
  } catch (error) {
    console.error('Error updating song status:', error);
    return { success: false, error: 'Internal server error' };
  }
}

export async function updateSongWithSunoVariants(
  songId: number,
  sunoVariants: any[],
  selectedVariant?: number,
  addToLibrary?: boolean
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSongWithVariantsQuery(songId, sunoVariants, selectedVariant, addToLibrary);
    return { success: true };
  } catch (error) {
    console.error('Error updating song with variants:', error);
    return { success: false, error: 'Internal server error' };
  }
}

// Analytics Services - Removed for now
export async function incrementSongView(songId: number): Promise<void> {
  // TODO: Implement analytics tracking later
  console.log('Song view tracked:', songId);
}

export async function incrementSongPlay(songId: number): Promise<void> {
  // TODO: Implement analytics tracking later
  console.log('Song play tracked:', songId);
}

// Admin Services
export async function validateAdminCredentials(
  username: string,
  password: string
): Promise<{ success: boolean; error?: string }> {
  // Hardcoded admin credentials for now
  const validCredentials = [
    { username: 'admin1', password: 'melodia2024!' },
    { username: 'admin2', password: 'melodia2024!' },
    { username: 'admin3', password: 'melodia2024!' },
  ];

  const isValid = validCredentials.some(
    cred => cred.username === username && cred.password === password
  );

  return { success: isValid };
}

export async function softDeleteSong(songId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { updateSong } = await import('./queries/update');
    await updateSong(songId, { is_deleted: true });
    return { success: true };
  } catch (error) {
    console.error('Error soft deleting song:', error);
    return { success: false, error: 'Failed to delete song' };
  }
}

export async function restoreSong(songId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const { updateSong } = await import('./queries/update');
    await updateSong(songId, { is_deleted: false });
    return { success: true };
  } catch (error) {
    console.error('Error restoring song:', error);
    return { success: false, error: 'Failed to restore song' };
  }
}
