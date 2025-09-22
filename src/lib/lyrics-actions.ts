'use server'

import { revalidatePath } from 'next/cache'
import { db } from './db'
import { lyricsDraftsTable, songsTable, songRequestsTable } from './db/schema'
import { eq, desc } from 'drizzle-orm'
import { GenerateLyricsParams, LyricsDraft } from '@/types'
import { config } from './config'

// Helper function to build lyrics generation prompt
function buildLyricsPrompt(params: GenerateLyricsParams, songRequest: any): string {
  const { language, structure, refineText } = params

  const prompt = `Create ${language.join(' and ')} lyrics for a personalized song with the following details:

Recipient: ${songRequest.recipient_name}
Relationship: ${songRequest.recipient_relationship}
Person Description: ${songRequest.person_description || 'Not specified'}
Song Type: ${songRequest.song_type || 'Personal'}
Emotions: ${songRequest.emotions?.join(', ') || 'Not specified'}
Additional Details: ${songRequest.additional_details || 'None'}

Requirements:
- Language(s): ${language.join(', ')}
${structure ? `- Structure: ${JSON.stringify(structure)}` : ''}

${refineText ? `Refinement Request: ${refineText}` : ''}

Please create heartfelt, personalized lyrics that capture the essence of the relationship and the person being celebrated. Make it emotional, meaningful, and suitable for the specified tone and language.`

  return prompt
}

// Helper function to build refinement prompt

// Helper function to build refinement prompt with version history context
function buildRefinementPromptWithHistory(currentLyrics: string, refineText: string, songRequest: any, allDrafts: any[]): string {
  let versionHistory = '';
  
  // Build version history context
  if (allDrafts.length > 1) {
    versionHistory = '\n\nVersion History Context:\n';
    allDrafts.forEach((draft) => {
      const versionInfo = `Version ${draft.version}:`;
      const promptInfo = draft.prompt_input?.refineText ? `Refinement: "${draft.prompt_input.refineText}"` : 'Initial generation';
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
Recipient: ${songRequest.recipient_name}
Relationship: ${songRequest.recipient_relationship}
Person Description: ${songRequest.person_description || 'Not specified'}
Song Type: ${songRequest.song_type || 'Personal'}
Emotions: ${songRequest.emotions?.join(', ') || 'Not specified'}
Additional Details: ${songRequest.additional_details || 'None'}
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

// Generate lyrics using Gemini API
export async function generateLyricsAction(params: GenerateLyricsParams, requestId: number) {
  try {
    // Get song request data
    const songRequest = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1)

    if (!songRequest[0]) {
      throw new Error('Song request not found')
    }

    const prompt = buildLyricsPrompt(params, songRequest[0])
    console.log(`${config.GEMINI_API_URL}?key=${config.GEMINI_API_TOKEN}`);
    console.log(JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: config.LYRICS_GENERATION
    }));

    // Call Gemini API
    console.log('Calling Gemini API...');
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
    console.log('Gemini API Response:', JSON.stringify(data, null, 2))
    
    // Check if the response was truncated due to token limit
    if (data.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
      console.log('Response was truncated due to token limit. Increasing maxOutputTokens...');
      // You might want to retry with higher token limit or handle this case
    }
    
    // Try different possible response structures
    let generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text
    
    // If the above doesn't work, try alternative structures
    if (!generatedText) {
      generatedText = data.candidates?.[0]?.content?.text
    }
    
    if (!generatedText) {
      generatedText = data.text
    }
    
    if (!generatedText) {
      generatedText = data.response?.text
    }
    
    // If still no text, try to get any text from the response
    if (!generatedText) {
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
      generatedText = findTextInObject(data)
    }

    if (!generatedText) {
      console.error('Could not extract text from API response:', data)
      throw new Error('No lyrics generated from API')
    }

    // Get the latest version number for this request
    const latestDraft = await db
      .select({ version: lyricsDraftsTable.version })
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, requestId))
      .orderBy(desc(lyricsDraftsTable.version))
      .limit(1)

    const newVersion = latestDraft[0] ? latestDraft[0].version + 1 : 1

    // Save lyrics draft
    const [draft] = await db
      .insert(lyricsDraftsTable)
      .values({
        song_request_id: requestId,
        version: newVersion,
        language: params.language,
        structure: params.structure || null,
        prompt_input: { ...params, refineText: params.refineText },
        generated_text: generatedText,
        status: 'draft'
      })
      .returning()

    // Update song request status
    await db
      .update(songRequestsTable)
      .set({ lyrics_status: 'needs_review' })
      .where(eq(songRequestsTable.id, requestId))

    revalidatePath(`/create-lyrics/${requestId}`)
    return { success: true, draft }
  } catch (error) {
    console.error('Error generating lyrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to generate lyrics' }
  }
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
        language: latestDraft.language,
        tone: latestDraft.tone,
        length_hint: latestDraft.length_hint,
        structure: latestDraft.structure,
        prompt_input: { refineText },
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

// Save lyrics draft
export async function saveLyricsDraftAction(draftId: number, editedText: string) {
  try {
    await db
      .update(lyricsDraftsTable)
      .set({ edited_text: editedText })
      .where(eq(lyricsDraftsTable.id, draftId))

    revalidatePath('/create-lyrics/[requestId]')
    return { success: true }
  } catch (error) {
    console.error('Error saving lyrics draft:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save draft' }
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

    // Update song request
    await db
      .update(songRequestsTable)
      .set({
        lyrics_status: 'approved',
        approved_lyrics_id: draftId,
        lyrics_locked_at: new Date()
      })
      .where(eq(songRequestsTable.id, requestId))

    revalidatePath(`/create-lyrics/${requestId}`)
    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error approving lyrics:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Failed to approve lyrics' }
  }
}

// Get lyrics drafts for a request
export async function getLyricsDraftsAction(requestId: number): Promise<LyricsDraft[]> {
  try {
    const drafts = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.song_request_id, requestId))
      .orderBy(desc(lyricsDraftsTable.version))

    return drafts.map(draft => ({
      ...draft,
      language: draft.language || [],
      tone: draft.tone || [],
      length_hint: (draft.length_hint as 'short' | 'standard' | 'long') || 'standard',
      edited_text: draft.edited_text || undefined,
      status: draft.status as 'draft' | 'needs_review' | 'approved' | 'archived',
      created_at: draft.created_at.toISOString(),
      updated_at: draft.updated_at.toISOString()
    })) as LyricsDraft[]
  } catch (error) {
    console.error('Error fetching lyrics drafts:', error)
    return []
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

    if (!request[0] || !request[0].approved_lyrics_id) {
      throw new Error('No approved lyrics found')
    }

    const approvedLyrics = await db
      .select()
      .from(lyricsDraftsTable)
      .where(eq(lyricsDraftsTable.id, request[0].approved_lyrics_id))
      .limit(1)

    if (!approvedLyrics[0]) {
      throw new Error('Approved lyrics not found')
    }

    // Generate slug
    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).substring(2, 8)
    const slug = `${request[0].recipient_name.toLowerCase().replace(/\s+/g, '-')}-${timestamp}-${randomSuffix}`

    // Create song record
    const [song] = await db
      .insert(songsTable)
      .values({
        title: `Song for ${request[0].recipient_name}`,
        lyrics: approvedLyrics[0].edited_text || approvedLyrics[0].generated_text,
        music_style: request[0].song_type || 'Personal',
        service_provider: 'Suno',
        song_requester: request[0].requester_name,
        prompt: `Personalized song for ${request[0].recipient_name} - ${request[0].recipient_relationship}`,
        slug,
        status: 'processing',
        metadata: {
          original_request_id: requestId,
          approved_lyrics_id: approvedLyrics[0].id
        }
      })
      .returning()

    // Start Suno job
    console.log('🎵 Starting Suno job for song creation...');
    const { SunoAPIFactory } = await import('./suno-api')
    const sunoAPI = SunoAPIFactory.getAPI()
    console.log('🎵 SunoAPI instance:', sunoAPI.constructor.name);

    const sunoResponse = await sunoAPI.generateSong({
      prompt: approvedLyrics[0].edited_text || approvedLyrics[0].generated_text,
      style: request[0].song_type || 'Personal',
      title: `Song for ${request[0].recipient_name}`,
      customMode: true,
      instrumental: false,
      model: 'V4_5',
      callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/suno-webhook`
    })

    if (sunoResponse.code !== 0 && sunoResponse.code !== 200) {
      if (sunoResponse.code === 429) {
        throw new Error(`Suno API credits insufficient: ${sunoResponse.msg}. Please add credits to your Suno API account.`)
      }
      throw new Error(`Suno API error: ${sunoResponse.msg}`)
    }

    const taskId = sunoResponse.data.taskId

    // Update song with task ID
    await db
      .update(songsTable)
      .set({ suno_task_id: taskId })
      .where(eq(songsTable.id, song.id))

    // Update song request
    await db
      .update(songRequestsTable)
      .set({
        status: 'processing',
        suno_task_id: taskId,
        generated_song_id: song.id
      })
      .where(eq(songRequestsTable.id, requestId))

    revalidatePath('/')
    return { success: true, taskId }
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
    const { SunoAPIFactory } = await import('./suno-api');
    const { getSongByTaskId, getSongRequestByTaskId } = await import('./db/queries/select');
    const { updateSong, updateSongRequest } = await import('./db/queries/update');

    const sunoAPI = SunoAPIFactory.getAPI();

    const song = await getSongByTaskId(taskId);
    let songRequest = null;

    if (!song) {
      songRequest = await getSongRequestByTaskId(taskId);
    }

    if (!song && !songRequest) {
      return { success: false, error: 'Song not found for task ID' };
    }

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
