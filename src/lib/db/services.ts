import { getAllSongs as getAllSongsQuery, getSongBySlug as getSongBySlugQuery, getSongByTaskId as getSongByTaskIdQuery } from './queries/select';
import { createSong as createSongQuery } from './queries/insert';
import { updateSongStatus as updateSongStatusQuery, updateSongWithVariants as updateSongWithVariantsQuery } from './queries/update';
import { Song } from '@/types';
import { generateBaseSlug, generateUniqueSlug } from '@/lib/utils/slug';

// Song Services
export async function getAllSongs(): Promise<Song[]> {
  try {
    const songs = await getAllSongsQuery();
    return songs.map(song => ({
      id: song.id,
      created_at: song.created_at.toISOString(),
      song_request_id: song.song_request_id,
      slug: song.slug,
      status: song.status ?? undefined,
      is_featured: song.is_featured ?? undefined,

      // New JSONB fields for variants and timestamped lyrics
      song_variants: song.song_variants as any,
      variant_timestamp_lyrics_api_response: song.variant_timestamp_lyrics_api_response as any,
      variant_timestamp_lyrics_processed: song.variant_timestamp_lyrics_processed as any,

      metadata: song.metadata ?? undefined,
      approved_lyrics_id: song.approved_lyrics_id ?? undefined,
      service_provider: song.service_provider ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      payment_id: song.payment_id ?? undefined,

      // Fields that may be in metadata (for backward compatibility)
      title: (song.metadata as any)?.title ?? undefined,
      lyrics: (song.metadata as any)?.lyrics ?? undefined,
      timestamp_lyrics: (song.metadata as any)?.timestamp_lyrics ?? undefined,
      music_style: (song.metadata as any)?.music_style ?? undefined,
      song_url: (song.metadata as any)?.song_url ?? undefined,
      suno_task_id: (song.metadata as any)?.suno_task_id ?? undefined,
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
      song_request_id: song.song_request_id,
      slug: song.slug,
      status: song.status ?? undefined,
      is_featured: song.is_featured ?? undefined,

      // New JSONB fields for variants and timestamped lyrics
      song_variants: song.song_variants as any,
      variant_timestamp_lyrics_api_response: song.variant_timestamp_lyrics_api_response as any,
      variant_timestamp_lyrics_processed: song.variant_timestamp_lyrics_processed as any,

      metadata: song.metadata ?? undefined,
      approved_lyrics_id: song.approved_lyrics_id ?? undefined,
      service_provider: song.service_provider ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      payment_id: song.payment_id ?? undefined,

      // Fields that may be in metadata (for backward compatibility)
      title: (song.metadata as any)?.title ?? undefined,
      lyrics: (song.metadata as any)?.lyrics ?? undefined,
      timestamp_lyrics: (song.metadata as any)?.timestamp_lyrics ?? undefined,
      music_style: (song.metadata as any)?.music_style ?? undefined,
      song_url: (song.metadata as any)?.song_url ?? undefined,
      suno_task_id: (song.metadata as any)?.suno_task_id ?? undefined,
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
      song_request_id: song.song_request_id,
      slug: song.slug,
      status: song.status ?? undefined,
      is_featured: song.is_featured ?? undefined,

      // New JSONB fields for variants and timestamped lyrics
      song_variants: song.song_variants as any,
      variant_timestamp_lyrics_api_response: song.variant_timestamp_lyrics_api_response as any,
      variant_timestamp_lyrics_processed: song.variant_timestamp_lyrics_processed as any,

      metadata: song.metadata ?? undefined,
      approved_lyrics_id: song.approved_lyrics_id ?? undefined,
      service_provider: song.service_provider ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      payment_id: song.payment_id ?? undefined,

      // Fields that may be in metadata (for backward compatibility)
      title: (song.metadata as any)?.title ?? undefined,
      lyrics: (song.metadata as any)?.lyrics ?? undefined,
      timestamp_lyrics: (song.metadata as any)?.timestamp_lyrics ?? undefined,
      music_style: (song.metadata as any)?.music_style ?? undefined,
      song_url: (song.metadata as any)?.song_url ?? undefined,
      suno_task_id: (song.metadata as any)?.suno_task_id ?? undefined,
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
      song_request_id: song.song_request_id,
      slug: song.slug,
      status: song.status ?? undefined,
      is_featured: song.is_featured ?? undefined,

      // New JSONB fields for variants and timestamped lyrics
      song_variants: song.song_variants as any,
      variant_timestamp_lyrics_api_response: song.variant_timestamp_lyrics_api_response as any,
      variant_timestamp_lyrics_processed: song.variant_timestamp_lyrics_processed as any,

      metadata: song.metadata ?? undefined,
      approved_lyrics_id: song.approved_lyrics_id ?? undefined,
      service_provider: song.service_provider ?? undefined,
      categories: song.categories ?? undefined,
      tags: song.tags ?? undefined,
      add_to_library: song.add_to_library ?? undefined,
      is_deleted: song.is_deleted ?? undefined,
      selected_variant: song.selected_variant ?? undefined,
      payment_id: song.payment_id ?? undefined,

      // Fields that may be in metadata (for backward compatibility)
      title: (song.metadata as any)?.title ?? undefined,
      lyrics: (song.metadata as any)?.lyrics ?? undefined,
      timestamp_lyrics: (song.metadata as any)?.timestamp_lyrics ?? undefined,
      music_style: (song.metadata as any)?.music_style ?? undefined,
      song_url: (song.metadata as any)?.song_url ?? undefined,
      suno_task_id: (song.metadata as any)?.suno_task_id ?? undefined,
    };
  } catch (error) {
    console.error('Error fetching song by ID:', error);
    return null;
  }
}


export async function createSong(songData: {
  title: string;
  lyrics: string;
  music_style: string;
  categories?: string[];
  tags?: string[];
  negative_tags?: string;
  prompt?: string;
  song_request_id: number;
  user_id: number;
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
      song_request_id: songData.song_request_id,
      slug,
      status: 'draft',
      is_featured: false,

      // Store legacy fields in metadata for backward compatibility
      metadata: {
        title: songData.title,
        lyrics: songData.lyrics,
        music_style: songData.music_style,
        prompt: songData.prompt || songData.lyrics,
      },

      // Initialize new JSONB fields
      song_variants: {},
      variant_timestamp_lyrics_api_response: {},
      variant_timestamp_lyrics_processed: {},

      categories: songData.categories || [],
      tags: songData.tags || [],
      service_provider: 'SU',
      add_to_library: false,
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
  songVariants?: any[],
  sunoTaskId?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await updateSongStatusQuery(songId, status, songVariants, sunoTaskId);
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
