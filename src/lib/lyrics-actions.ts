'use server'

import { eq } from 'drizzle-orm'
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
      const promptInfo = draft.lyrics_edit_prompt ? `Refinement: "${draft.lyrics_edit_prompt}"` : 'Initial generation';
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
export async function refineLyricsAction(refineText: string, requestId: number, userId?: number, anonymousUserId?: string) {
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
