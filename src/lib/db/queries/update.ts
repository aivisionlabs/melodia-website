import { AlignedWord } from '@/types';
import { eq, sql } from 'drizzle-orm';
import { db } from '../index';
import { songsTable, songRequestsTable } from '../schema';

export async function updateSong(
  songId: number,
  updateData: Partial<{
    title: string;
    lyrics: string;
    song_description: string;
    timestamp_lyrics: any;
    music_style: string;
    service_provider: string;
    song_requester: string;
    prompt: string;
    song_url: string;
    duration: string; // Changed from number to string to match database schema
    add_to_library: boolean;
    is_deleted: boolean;
    status: string;
    categories: string[];
    tags: string[];
    negative_tags: string;
    metadata: any;
    show_lyrics: boolean;
  }>
) {
  try {
    await db
      .update(songsTable)
      .set(updateData)
      .where(eq(songsTable.id, songId));

    console.log(`Updated song ${songId} with data:`, updateData);
  } catch (error) {
    console.error('Error updating song:', error);
    throw error;
  }
}

export async function updateSongStatus(
  id: number,
  status: 'draft' | 'pending' | 'generating' | 'completed' | 'failed',
  songUrl?: string,
  sunoTaskId?: string
) {
  const updateData: any = { status };

  if (songUrl) {
    updateData.song_url = songUrl;
    updateData.add_to_library = true;
  }

  if (sunoTaskId) {
    updateData.suno_task_id = sunoTaskId;
  }

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, id));
}

export async function updateSongWithVariants(
  id: number,
  sunoVariants: any[],
  selectedVariant?: number,
  addToLibrary?: boolean,
  showLyrics?: boolean
) {
  const updateData: any = {
    suno_variants: sunoVariants,
    status: 'completed',
    add_to_library: addToLibrary !== undefined ? addToLibrary : true,
    show_lyrics: showLyrics !== undefined ? showLyrics : true
  };

  if (selectedVariant !== undefined) {
    updateData.selected_variant = selectedVariant;
    // Set the song_url and duration to the selected variant's values
    if (sunoVariants[selectedVariant]) {
      const selectedVariantData = sunoVariants[selectedVariant];
      updateData.song_url = selectedVariantData.sourceAudioUrl;
      updateData.duration = selectedVariantData.duration?.toString(); // Convert to string for numeric field
    }
  }

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, id));
}

export async function updateTimestampedLyricsForVariant(
  songId: number,
  variantIndex: number,
  lyricLines: any[],
  alignedWords?: AlignedWord[] // Store only the alignedWords data, not the full API response
) {
  try {
    // Get current timestamped lyrics variants and API responses
    const currentSong = await db
      .select({
        timestamped_lyrics_variants: songsTable.timestamped_lyrics_variants,
        timestamped_lyrics_api_responses: songsTable.timestamped_lyrics_api_responses
      })
      .from(songsTable)
      .where(eq(songsTable.id, songId))
      .limit(1);

    const currentVariants: { [key: number]: any[] } = (currentSong[0]?.timestamped_lyrics_variants as { [key: number]: any[] }) || {};
    const currentApiResponses: { [key: number]: any } = (currentSong[0]?.timestamped_lyrics_api_responses as { [key: number]: any }) || {};

    // Update the specific variant
    currentVariants[variantIndex] = lyricLines;

    // Update the alignedWords data if provided (store only the alignedWords, not the full API response)
    if (alignedWords) {
      currentApiResponses[variantIndex] = alignedWords;
    }

    // Update the database
    await db
      .update(songsTable)
      .set({
        timestamped_lyrics_variants: currentVariants,
        timestamped_lyrics_api_responses: currentApiResponses
      })
      .where(eq(songsTable.id, songId));

    console.log(`Updated timestamped lyrics for variant ${variantIndex} of song ${songId}`);
  } catch (error) {
    console.error('Error updating timestamped lyrics for variant:', error);
    throw error;
  }
}

export async function incrementSongLikeBySlug(slug: string) {
  try {
    await db
      .update(songsTable)
      .set({ likes_count: sql`${songsTable.likes_count} + 1` })
      .where(eq(songsTable.slug, slug));
  } catch (error) {
    console.error('Error incrementing like count:', error);
    throw error;
  }
}

export async function decrementSongLikeBySlug(slug: string) {
  try {
    await db
      .update(songsTable)
      .set({ likes_count: sql`GREATEST(${songsTable.likes_count} - 1, 0)` })
      .where(eq(songsTable.slug, slug));
  } catch (error) {
    console.error('Error decrementing like count:', error);
    throw error;
  }
}

// Update song request status
export async function updateSongRequestStatus(
  requestId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed'
) {
  try {
    await db
      .update(songRequestsTable)
      .set({
        status,
        updated_at: sql`NOW()`,
      })
      .where(eq(songRequestsTable.id, requestId));
    console.log(`Updated song request ${requestId} status to ${status}`);
  } catch (error) {
    console.error('Error updating song request status:', error);
    throw error;
  }
}