'use server'

import { eq, desc } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from './db'
import { lyricsDraftsTable, songRequestsTable, songsTable } from './db/schema'
import { DBSongRequest } from '@/types/song-request'
import { refineLyrics } from './services/llm/llm-lyrics-opearation'

// Refine lyrics using Vertex AI
export async function refineLyricsAction(refineText: string, requestId: number, userId?: number, anonymousUserId?: string) {
  try {
    // Fetch only the latest version of the lyrics draft for this request
    const latestLyricsDraft = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, requestId))
      .orderBy(desc(lyricsDraftsTable.version))
      .limit(1);


    const latestDraft = latestLyricsDraft[0];

    if (!latestDraft) {
      throw new Error('No lyrics draft found for this request');
    }

    // Get song request data
    const songRequest = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1)

    if (!songRequest[0]) {
      throw new Error('Song request not found')
    }

    // Demo mode - use mock refined lyrics instead of real API
    if (process.env.DEMO_MODE) {
      console.log('🎭 DEMO MODE: Using mock refined lyrics instead of Gemini API')

      const mockRefinedText = `Demo Refined Lyrics (Version ${latestDraft.version + 1}):\n\nBased on your refinement request: "${refineText}"\n\nVerse 1:\nThis is a refined demo song\nCreated just for you\nWith love and care\nAnd friendship true\n\nChorus:\nHappy birthday to you\nMay all your dreams come true\nThis special day is yours\nThrough and through\n\nVerse 2:\nMemories we've shared\nWill always remain\nIn our hearts forever\nThrough joy and pain\n\nChorus:\nHappy birthday to you\nMay all your dreams come true\nThis special day is yours\nThrough and through\n\nOutro:\nSo here's to you, ${songRequest[0].recipient_details}\nOn this wonderful day\nMay happiness and joy\nAlways come your way\n\n[Refined based on: ${refineText}]`

      // Create new version with mock refined lyrics
      const [newDraft] = await db
        .insert(lyricsDraftsTable)
        .values({
          song_request_id: requestId,
          version: latestDraft.version + 1,
          lyrics_edit_prompt: refineText,
          generated_text: mockRefinedText,
          song_title: latestDraft.song_title,
          music_style: latestDraft.music_style,
          status: 'draft',
          created_by_user_id: userId || null,
          created_by_anonymous_user_id: anonymousUserId || null
        })
        .returning()

      revalidatePath(`/create-lyrics/${requestId}`)
      return { success: true, draft: newDraft, demoMode: true }
    }

    // Log the refinement request
    console.log('=== REFINE LYRICS REQUEST ===');
    console.log('Request ID:', requestId);
    console.log('Current Version:', latestDraft.version);
    console.log('Refinement Text:', refineText);
    console.log('==============================');

    // Call Vertex AI for refinement
    const refinedText = await refineLyrics({
      currentLyrics: latestDraft.generated_text,
      refineText,
      songRequest: songRequest[0] as unknown as DBSongRequest
    });

    console.log('=== REFINE LYRICS RESPONSE ===');
    console.log('Refined Text:', refinedText);
    console.log('==============================');

    // Create new version with refined lyrics
    const [newDraft] = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: requestId,
        version: latestDraft.version + 1,
        lyrics_edit_prompt: refineText,
        generated_text: refinedText,
        song_title: latestDraft.song_title,
        music_style: latestDraft.music_style,
        status: 'draft',
        created_by_user_id: userId || null,
        created_by_anonymous_user_id: anonymousUserId || null
      })
      .returning()

    revalidatePath(`/create-lyrics/${requestId}`)
    return { success: true, draft: newDraft }
  } catch (error) {
    console.error('Error refining lyrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to refine lyrics' }
  }
}



// Approve lyrics and redirect to payment
export async function approveLyricsAction(draftId: number, requestId: number) {
  try {
    // Update draft status
    await db
      .update(lyricsDraftsTable)
      .set({ status: 'approved' })
      .where(eq(lyricsDraftsTable.id, draftId))

    revalidatePath(`/create-lyrics/${requestId}`)
    revalidatePath('/')
    return { success: true, redirectTo: `/payment?requestId=${requestId}` }
  } catch (error) {
    console.error('Error approving lyrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve lyrics' }
  }
}



// Get song request data
export async function getSongRequestDataAction(requestId: number) {
  try {
    const request = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1)

    return request[0] || null
  } catch (error) {
    console.error('Error fetching song request:', error)
    return null
  }
}

// Get song slug from ID
export async function getSongSlugFromIdAction(songId: number): Promise<string | null> {
  try {
    const song = await db
      .select({ slug: songsTable.slug })
      .from(songsTable)
      .where(eq(songsTable.id, songId))
      .limit(1)

    return song[0]?.slug || null
  } catch (error) {
    console.error('Error fetching song slug:', error)
    return null
  }
}

// Check Suno job status
export async function checkSunoJobStatusAction(taskId: string) {
  try {
    const { getSongByTaskId, getSongRequestByTaskId } = await import('./db/queries/select');
    const { updateSong, updateSongRequest } = await import('./db/queries/update');

    const song = await getSongByTaskId(taskId);
    let songRequest = null;

    if (!song) {
      songRequest = await getSongRequestByTaskId(taskId);
    }

    if (!song && !songRequest) {
      return { success: false, error: 'Song not found for task ID' };
    }

    // Check for demo mode or demo task ID
    const isDemoMode = process.env.DEMO_MODE === 'true';
    const isDemoTask = taskId.startsWith('demo-task-');

    if (isDemoMode || isDemoTask) {
      console.log('🎭 DEMO MODE: Using mock status response for task:', taskId);

      // Simulate processing time - return completed after 2 minutes
      const taskTimestamp = parseInt(taskId.split('-')[2]);
      const elapsedTime = Date.now() - taskTimestamp;
      const isCompleted = elapsedTime > 120000; // 2 minutes

      if (isCompleted) {
        const demoAudioUrl = 'https://dl.espressif.com/dl/audio/ff-16b-2c-44100hz.mp3';

        if (song) {
          await updateSong(song.id, {
            status: 'completed',
            song_variants: {
              0: {
                audio_url: demoAudioUrl,
                image_url: null,
                duration: 180
              }
            },
            selected_variant: 0
          });

          if (song.metadata && typeof song.metadata === 'object' && 'original_request_id' in song.metadata) {
            const originalRequestId = song.metadata.original_request_id;
            if (originalRequestId) {
              await updateSongRequest(parseInt(originalRequestId.toString()), {
                status: 'completed'
              });
            }
          }
        } else if (songRequest) {
          await updateSongRequest(songRequest.id, {
            status: 'completed'
          });
        }

        return {
          success: true,
          status: 'completed',
          audioUrl: demoAudioUrl,
          duration: 180,
          message: 'Demo song generation completed successfully',
          demoMode: true
        };
      } else {
        return {
          success: true,
          status: 'processing',
          message: 'Demo song is still being generated',
          demoMode: true
        };
      }
    }

    // Real Suno API call
    const { SunoAPIFactory } = await import('./suno-api');
    const sunoAPI = SunoAPIFactory.getAPI();

    const statusResponse = await sunoAPI.getRecordInfo(taskId);

    if (statusResponse.code !== 200) {
      throw new Error(`Suno API error: ${statusResponse.msg}`);
    }

    const jobStatus = statusResponse.data.status;

    const isCompleted = jobStatus === 'completed' || jobStatus === 'COMPLETE' || jobStatus === 'success';
    const isFailed = jobStatus === 'failed' || jobStatus === 'FAILED' || jobStatus === 'error';

    if (isCompleted) {
      const variants = statusResponse.data.response?.sunoData || [];
      if (variants.length > 0) {
        const firstVariant = variants[0];
        const audioUrl = firstVariant.audioUrl;
        const duration = firstVariant.duration || null;

        if (song) {
          await updateSong(song.id, {
            status: 'completed',
            song_variants: {
              0: {
                audio_url: audioUrl,
                image_url: firstVariant.imageUrl || null,
                duration: duration ? Math.round(duration) : undefined
              }
            },
            selected_variant: 0
          });

          if (song.metadata && typeof song.metadata === 'object' && 'original_request_id' in song.metadata) {
            const originalRequestId = song.metadata.original_request_id;
            if (originalRequestId) {
              await updateSongRequest(parseInt(originalRequestId.toString()), {
                status: 'completed'
              });
            }
          }
        } else if (songRequest) {
          await updateSongRequest(songRequest.id, {
            status: 'completed'
          });
        }

        return {
          success: true,
          status: 'completed',
          audioUrl,
          duration,
          message: 'Song generation completed successfully'
        };
      } else {
        return { success: false, error: 'No audio variants found in completed job' };
      }
    } else if (isFailed) {
      if (song) {
        await updateSong(song.id, {
          status: 'failed'
        });

        if (song.metadata && typeof song.metadata === 'object' && 'original_request_id' in song.metadata) {
          const originalRequestId = song.metadata.original_request_id;
          if (originalRequestId) {
            await updateSongRequest(parseInt(originalRequestId.toString()), {
              status: 'failed'
            });
          }
        }
      } else if (songRequest) {
        await updateSongRequest(songRequest.id, {
          status: 'failed'
        });
      }

      return {
        success: false,
        status: 'failed',
        error: 'Song generation failed'
      };
    } else {
      return {
        success: true,
        status: jobStatus,
        message: 'Song generation in progress'
      };
    }
  } catch (error) {
    console.error('Error checking Suno job status:', error);
    return { success: false, error: 'Failed to check job status' };
  }
}
