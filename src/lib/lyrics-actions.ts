'use server'

import { DBSongRequest } from '@/types/song-request'
import { desc, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { db } from './db'
import { lyricsDraftsTable, songRequestsTable } from './db/schema'
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
    // Call Vertex AI for refinement
    const refinedText = await refineLyrics({
      currentLyrics: latestDraft.generated_text,
      refineText,
      songRequest: songRequest[0] as unknown as DBSongRequest
    });

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
