'use server'

import { GenerateLyricsParams } from '@/types'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { config } from './config'
import { db } from './db'
import { lyricsDraftsTable, songRequestsTable, songsTable } from './db/schema'

// Helper function to build refinement prompt

// Helper function to build refinement prompt with version history context
function buildRefinementPromptWithHistory(currentLyrics: string, refineText: string, songRequest: any, allDrafts: any[]): string {
  let versionHistory = '';

  // Build version history context
  if (allDrafts.length > 1) {
    versionHistory = '\n\nVersion History Context:\n';
    allDrafts.forEach((draft) => {
      const versionInfo = `Version ${draft.version}:`;
      const promptInfo = draft.lyrics_edit_prompt?.refineText ? `Refinement: "${draft.lyrics_edit_prompt.refineText}"` : 'Initial generation';
      versionHistory += `${versionInfo} ${promptInfo}\n`;
    });
    versionHistory += '\nThis shows the evolution of the lyrics. Please maintain the context and improvements from all previous versions.';
  }

  return `Please improve and refine the following lyrics based on the user's feedback.

IMPORTANT: This is version ${allDrafts.length + 1} of the lyrics. You have access to the full version history to understand the context and evolution of the lyrics.

Current Lyrics (Version ${allDrafts[allDrafts.length - 1].version}):
${currentLyrics}

User's Refinement Request:
${refineText}

Song Context:
Recipient: ${songRequest.recipient_details}
Song Style: Personal
Mood: ${songRequest.mood?.join(', ') || 'Not specified'}
Song Story: ${songRequest.song_story || 'None'}
${versionHistory}

Instructions:
- Maintain all the context and personal details from the original song request
- Keep the emotional connection and personal touch from all previous versions
- Only make the specific changes requested by the user
- If the user asks to "make it short" or "make it longer", adjust length while keeping all important details
- If the user asks to change names or details, update only those specific elements
- Preserve the overall theme and message from the song request

Please provide the refined lyrics that address the user's feedback while maintaining the complete context and personal connection.`
}


// Refine lyrics using Gemini API
export async function refineLyricsAction(refineText: string, requestId: number) {
  try {
    // Get ALL lyrics drafts for this request to maintain context
    const allDrafts = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, requestId))
      .orderBy(lyricsDraftsTable.version)

    if (allDrafts.length === 0) {
      throw new Error('No lyrics draft found to refine')
    }

    const latestDraft = allDrafts[allDrafts.length - 1]

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
          lyrics_edit_prompt: { refineText },
          generated_text: mockRefinedText,
          status: 'draft'
        })
        .returning()

      revalidatePath(`/create-lyrics/${requestId}`)
      return { success: true, draft: newDraft, demoMode: true }
    }

    const prompt = buildRefinementPromptWithHistory(latestDraft.generated_text, refineText, songRequest[0], allDrafts)

    // Log the refinement request
    console.log('=== REFINE LYRICS REQUEST ===');
    console.log('Request ID:', requestId);
    console.log('Current Version:', latestDraft.version);
    console.log('Refinement Text:', refineText);
    console.log('API URL:', `${config.GEMINI_API_URL}?key=${config.GEMINI_API_TOKEN}`);
    console.log('Refinement Prompt:', prompt);
    console.log('Generation Config:', config.LYRICS_GENERATION);
    console.log('==============================');

    // Call Gemini API
    const response = await fetch(`${config.GEMINI_API_URL}?key=${config.GEMINI_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: config.LYRICS_GENERATION
      })
    })

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`)
    }

    const data = await response.json()
    console.log('=== REFINE LYRICS RESPONSE ===');
    console.log('Gemini API Response:', JSON.stringify(data, null, 2));

    // Try different possible response structures
    let refinedText = data.candidates?.[0]?.content?.parts?.[0]?.text

    // If the above doesn't work, try alternative structures
    if (!refinedText) {
      refinedText = data.candidates?.[0]?.content?.text
    }

    if (!refinedText) {
      refinedText = data.text
    }

    if (!refinedText) {
      refinedText = data.response?.text
    }

    // If still no text, try to get any text from the response
    if (!refinedText) {
      console.log('Trying to extract text from response structure:', data)
      // Look for any text field in the response
      const findTextInObject = (obj: any): string | null => {
        if (typeof obj === 'string') return obj
        if (typeof obj === 'object' && obj !== null) {
          for (const key in obj) {
            if (key.toLowerCase().includes('text') && typeof obj[key] === 'string') {
              return obj[key]
            }
            const found = findTextInObject(obj[key])
            if (found) return found
          }
        }
        return null
      }
      refinedText = findTextInObject(data)
    }

    if (!refinedText) {
      console.error('Could not extract text from API response:', data)
      throw new Error('No refined lyrics generated from API')
    }

    console.log('Extracted Refined Text:', refinedText);
    console.log('==============================');

    // Create new version with refined lyrics
    const [newDraft] = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: requestId,
        version: latestDraft.version + 1,
        lyrics_edit_prompt: { refineText },
        generated_text: refinedText,
        status: 'draft'
      })
      .returning()

    revalidatePath(`/create-lyrics/${requestId}`)
    return { success: true, draft: newDraft }
  } catch (error) {
    console.error('Error refining lyrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to refine lyrics' }
  }
}



// Approve lyrics
export async function approveLyricsAction(draftId: number, requestId: number) {
  try {
    // Update draft status
    await db
      .update(lyricsDraftsTable)
      .set({ status: 'approved' })
      .where(eq(lyricsDraftsTable.id, draftId))

    // No need to update song_requests table - lyrics_status and approved_lyrics_id moved to other tables
    // The lyrics draft status is already updated above

    revalidatePath(`/create-lyrics/${requestId}`)
    revalidatePath('/')
    return { success: true }
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

// Create song from approved lyrics
export async function createSongFromLyricsAction(requestId: number) {
  try {
    // Get the approved lyrics
    const request = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1)

    // Find approved lyrics draft for this request
    const approvedLyrics = await db
      .select()
      .from(lyricsDraftsTable)
      .where(
        and(
          eq(lyricsDraftsTable.song_request_id, requestId),
          eq(lyricsDraftsTable.status, 'approved')
        )
      )
      .limit(1)

    if (!approvedLyrics[0]) {
      throw new Error('No approved lyrics found')
    }

    // Check if song already exists for this request
    const existingSongs = await db
      .select()
      .from(songsTable)
      .where(eq(songsTable.song_request_id, requestId))
      .limit(1)

    let song
    if (existingSongs.length > 0) {
      // Update existing song
      song = existingSongs[0]
      console.log('🎵 Updating existing song:', song.id)

      await db
        .update(songsTable)
        .set({
          lyrics: approvedLyrics[0].generated_text,
          music_style: 'Personal',
          service_provider: 'Suno',
          song_requester: request[0].requester_name,
          prompt: `Personalized song for ${request[0].recipient_details}`,
          status: 'processing',
          approved_lyrics_id: approvedLyrics[0].id,
          metadata: {
            original_request_id: requestId
          }
        })
        .where(eq(songsTable.id, song.id))
    } else {
      // Create new song record
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const slug = `${request[0].recipient_details.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`

      const [newSong] = await db
        .insert(songsTable)
        .values({
          song_request_id: requestId,
          user_id: request[0].user_id || 1, // Use request user_id or default to 1
          title: `Song for ${request[0].recipient_details}`,
          lyrics: approvedLyrics[0].generated_text,
          music_style: 'Personal',
          service_provider: 'Suno',
          song_requester: request[0].requester_name,
          prompt: `Personalized song for ${request[0].recipient_details}`,
          slug,
          status: 'processing',
          approved_lyrics_id: approvedLyrics[0].id,
          metadata: {
            original_request_id: requestId
          }
        })
        .returning()

      song = newSong
      console.log('🎵 Created new song:', song.id)
    }

    // Check for demo mode
    const isDemoMode = process.env.DEMO_MODE === 'true';

    if (isDemoMode) {
      console.log('🎭 DEMO MODE: Using mock Suno responses instead of real API calls');

      // Generate mock task IDs for demo mode
      const mockTaskIds = [
        `demo-task-${Date.now()}-1`,
        `demo-task-${Date.now()}-2`
      ];

      const variants = [
        { style: 'Personal', title: `${request[0].recipient_details}'s Song - Version 1` },
        { style: 'Pop', title: `${request[0].recipient_details}'s Song - Version 2` }
      ];

      const variantsData = mockTaskIds.map((taskId, index) => ({
        id: `variant-${index}`,
        taskId,
        title: variants[index].title,
        style: variants[index].style,
        status: 'processing'
      }));

      // Update song with mock task IDs and variants data
      await db
        .update(songsTable)
        .set({
          suno_task_id: mockTaskIds[0],
          suno_variants: variantsData,
          metadata: {
            ...(song.metadata || {}),
            demo_mode: true
          }
        })
        .where(eq(songsTable.id, song.id))

      // Update song request
      await db
        .update(songRequestsTable)
        .set({
          status: 'processing',
          generated_song_id: song.id
        })
        .where(eq(songRequestsTable.id, requestId))

      revalidatePath('/')
      return { success: true, taskId: mockTaskIds[0], taskIds: mockTaskIds, demoMode: true }
    }

    // Start Suno job - Generate 2 variants
    console.log('🎵 Starting Suno job for song creation with 2 variants...');
    const { SunoAPIFactory } = await import('./suno-api')
    const sunoAPI = SunoAPIFactory.getAPI()
    console.log('🎵 SunoAPI instance:', sunoAPI.constructor.name);

    // Generate 2 variants with different styles
    const variants = [
      { style: 'Personal', title: `${request[0].recipient_details}'s Song - Version 1` },
      { style: 'Pop', title: `${request[0].recipient_details}'s Song - Version 2` }
    ];

    const sunoResponses = [];
    const taskIds = [];

    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i];
      console.log(`🎵 Generating variant ${i + 1}: ${variant.style}`);

      try {
        const sunoResponse = await sunoAPI.generateSong({
          prompt: approvedLyrics[0].generated_text,
          style: variant.style,
          title: variant.title,
          customMode: true,
          instrumental: false,
          model: 'V4_5',
          callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/suno-webhook`
        });

        if (sunoResponse.code !== 0 && sunoResponse.code !== 200) {
          if (sunoResponse.code === 429) {
            throw new Error(`Suno API credits insufficient: ${sunoResponse.msg}. Please add credits to your Suno API account.`)
          }
          throw new Error(`Suno API error: ${sunoResponse.msg}`)
        }

        sunoResponses.push(sunoResponse);
        taskIds.push(sunoResponse.data.taskId);
      } catch (apiError) {
        // Check if this is a credit error and fallback to demo mode
        const errorMessage = apiError instanceof Error ? apiError.message : String(apiError);
        const isCreditError = errorMessage.includes("credits insufficient") ||
          errorMessage.includes("top up") ||
          errorMessage.includes("insufficient credits");

        if (isCreditError) {
          console.log('🎭 Suno API credits insufficient, falling back to demo mode');

          // Fallback to demo mode
          const mockTaskIds = [
            `demo-task-${Date.now()}-1`,
            `demo-task-${Date.now()}-2`
          ];

          const variantsData = mockTaskIds.map((taskId, index) => ({
            id: `variant-${index}`,
            taskId,
            title: variants[index].title,
            style: variants[index].style,
            status: 'processing'
          }));

          // Update song with mock task IDs and variants data
          await db
            .update(songsTable)
            .set({
              suno_task_id: mockTaskIds[0],
              suno_variants: variantsData,
              metadata: {
                ...(song.metadata || {}),
                demo_mode: true,
                fallback_reason: 'api_credits_insufficient'
              }
            })
            .where(eq(songsTable.id, song.id))

          // Update song request
          await db
            .update(songRequestsTable)
            .set({
              status: 'processing',
              generated_song_id: song.id
            })
            .where(eq(songRequestsTable.id, requestId))

          revalidatePath('/')
          return { success: true, taskId: mockTaskIds[0], taskIds: mockTaskIds, demoMode: true, fallback: true }
        }

        // Re-throw non-credit errors
        throw apiError;
      }
    }

    // Store multiple task IDs and variants info
    const primaryTaskId = taskIds[0];
    const variantsData = taskIds.map((taskId, index) => ({
      id: `variant-${index}`,
      taskId,
      title: variants[index].title,
      style: variants[index].style,
      status: 'processing'
    }));

    // Update song with primary task ID and variants data
    await db
      .update(songsTable)
      .set({
        suno_task_id: primaryTaskId,
        suno_variants: variantsData
      })
      .where(eq(songsTable.id, song.id))

    // Update song request (suno_task_id moved to songs table)
    await db
      .update(songRequestsTable)
      .set({
        status: 'processing',
        generated_song_id: song.id
      })
      .where(eq(songRequestsTable.id, requestId))

    revalidatePath('/')
    return { success: true, taskId: primaryTaskId, taskIds }
  } catch (error) {
    console.error('Error creating song from lyrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create song' }
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
            song_url: demoAudioUrl,
            duration: 180
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

    const isCompleted = jobStatus === 'completed' || jobStatus === 'SUCCESS' || jobStatus === 'success';
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
            song_url: audioUrl,
            duration: duration ? Math.round(duration) : undefined
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
