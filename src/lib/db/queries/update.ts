import { AlignedWord } from '@/types';
import { eq } from 'drizzle-orm';
import { db } from '../index';
import { songsTable, songRequestsTable } from '../schema';

export async function updateSong(
  songId: number,
  updateData: Partial<{
    title: string;
    lyrics: string;
    timestamp_lyrics: any;
    music_style: string;
    service_provider: string;
    song_requester: string;
    prompt: string;
    song_url: string;
    duration: number; // Changed back to number to match database schema
    add_to_library: boolean;
    is_deleted: boolean;
    status: string;
    categories: string[];
    tags: string[];
    negative_tags: string;
    metadata: any;
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
  addToLibrary?: boolean
) {
  const updateData: any = {
    suno_variants: sunoVariants,
    status: 'completed',
    add_to_library: addToLibrary !== undefined ? addToLibrary : true
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

export async function updateSongRequest(
  requestId: number,
  updateData: Partial<{
    status: string;
    lyrics_status: string;
    approved_lyrics_id: number;
    lyrics_locked_at: Date;
    suno_task_id: string;
    generated_song_id: number;
  }>
) {
  try {
    await db
      .update(songRequestsTable)
      .set(updateData)
      .where(eq(songRequestsTable.id, requestId));

    console.log(`Updated song request ${requestId} with data:`, updateData);
  } catch (error) {
    console.error('Error updating song request:', error);
    throw error;
  }
}

// Status tracking functions for song status checking
export async function updateSongStatusWithTracking(
  songId: number,
  status: 'draft' | 'pending' | 'generating' | 'completed' | 'failed',
  songUrl?: string,
  sunoTaskId?: string
) {
  const updateData: any = { 
    status,
    status_checked_at: new Date(),
    last_status_check: new Date()
  };

  if (songUrl) {
    updateData.song_url = songUrl;
    updateData.add_to_library = true;
  }

  if (sunoTaskId) {
    updateData.suno_task_id = sunoTaskId;
  }

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, songId));
}

export async function updateSongUrl(
  songId: number,
  songUrl: string,
  duration?: string
) {
  const updateData: any = {
    song_url: songUrl,
    status: 'completed',
    add_to_library: true,
    status_checked_at: new Date(),
    last_status_check: new Date()
  };

  if (duration) {
    // Convert string duration to number for database
    const durationNumber = parseInt(duration, 10);
    if (!isNaN(durationNumber)) {
      updateData.duration = durationNumber;
    }
  }

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, songId));
}

export async function incrementStatusCheckCount(songId: number) {
  // First get the current count
  const currentSong = await db
    .select({ status_check_count: songsTable.status_check_count })
    .from(songsTable)
    .where(eq(songsTable.id, songId))
    .limit(1);

  const currentCount = currentSong[0]?.status_check_count || 0;

  await db
    .update(songsTable)
    .set({
      status_check_count: currentCount + 1,
      last_status_check: new Date()
    })
    .where(eq(songsTable.id, songId));
}