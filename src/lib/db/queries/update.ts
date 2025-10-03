import { AlignedWord } from '@/types';
import { eq } from 'drizzle-orm';
import { db } from '../index';
import { songsTable, songRequestsTable } from '../schema';

export async function updateSong(
  songId: number,
  updateData: Partial<{
    add_to_library: boolean;
    is_deleted: boolean;
    status: string;
    categories: string[];
    tags: string[];
    metadata: any;
    song_variants: any;
    variant_timestamp_lyrics_api_response: any;
    variant_timestamp_lyrics_processed: any;
    selected_variant: number;
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
  songVariants?: any[],
  sunoTaskId?: string
) {
  const updateData: any = { status };

  if (songVariants) {
    updateData.song_variants = songVariants;
    updateData.add_to_library = true;
    // Set primary URL from first variant
    if (songVariants[0]) {
      updateData.selected_variant = 0;
    }
  }

  if (sunoTaskId) {
    updateData.metadata = { suno_task_id: sunoTaskId };
  }

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, id));
}

export async function updateSongWithVariants(
  id: number,
  songVariants: any[],
  selectedVariant?: number,
  addToLibrary?: boolean
) {
  const updateData: any = {
    song_variants: songVariants,
    status: 'completed',
    add_to_library: addToLibrary !== undefined ? addToLibrary : true
  };

  if (selectedVariant !== undefined) {
    updateData.selected_variant = selectedVariant;
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
        variant_timestamp_lyrics_processed: songsTable.variant_timestamp_lyrics_processed,
        variant_timestamp_lyrics_api_response: songsTable.variant_timestamp_lyrics_api_response
      })
      .from(songsTable)
      .where(eq(songsTable.id, songId))
      .limit(1);

    const currentProcessed: { [key: number]: any[] } = (currentSong[0]?.variant_timestamp_lyrics_processed as { [key: number]: any[] }) || {};
    const currentApiResponses: { [key: number]: any } = (currentSong[0]?.variant_timestamp_lyrics_api_response as { [key: number]: any }) || {};

    // Update the specific variant
    currentProcessed[variantIndex] = lyricLines;

    // Update the alignedWords data if provided (store only the alignedWords, not the full API response)
    if (alignedWords) {
      currentApiResponses[variantIndex] = alignedWords;
    }

    // Update the database
    await db
      .update(songsTable)
      .set({
        variant_timestamp_lyrics_processed: currentProcessed,
        variant_timestamp_lyrics_api_response: currentApiResponses
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
  songVariants?: any[],
  sunoTaskId?: string
) {
  const updateData: any = {
    status,
    metadata: {
      status_checked_at: new Date(),
      last_status_check: new Date()
    }
  };

  if (songVariants) {
    updateData.song_variants = songVariants;
    updateData.add_to_library = true;
  }

  if (sunoTaskId) {
    updateData.metadata = {
      ...updateData.metadata,
      suno_task_id: sunoTaskId
    };
  }

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, songId));
}

export async function updateSongUrl(
  songId: number,
  songVariants: any[]
) {
  const updateData: any = {
    song_variants: songVariants,
    status: 'completed',
    add_to_library: true,
    metadata: {
      status_checked_at: new Date(),
      last_status_check: new Date()
    }
  };

  await db.update(songsTable).set(updateData).where(eq(songsTable.id, songId));
}

export async function incrementStatusCheckCount(songId: number) {
  // First get the current count
  const currentSong = await db
    .select({ metadata: songsTable.metadata })
    .from(songsTable)
    .where(eq(songsTable.id, songId))
    .limit(1);

  const currentMetadata = currentSong[0]?.metadata || {};
  const currentCount = (currentMetadata as any).status_check_count || 0;

  await db
    .update(songsTable)
    .set({
      metadata: {
        ...currentMetadata,
        status_check_count: currentCount + 1,
        last_status_check: new Date()
      }
    })
    .where(eq(songsTable.id, songId));
}