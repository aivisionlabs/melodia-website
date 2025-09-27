'use server'

import { SongRequestFormData, SongRequest } from '@/types'
import { db } from '@/lib/db'
import { songRequestsTable, songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkRateLimit, RATE_LIMITS } from './utils/rate-limiting'
import { sanitizeInput } from './security'
// import { shouldRequirePayment } from './payment-config'

// Input validation functions
function validateSongRequestForm(formData: SongRequestFormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Required fields validation
  if (!formData.requester_name?.trim()) {
    errors.requester_name = 'Your name is required'
  } else if (formData.requester_name.length < 2) {
    errors.requester_name = 'Name must be at least 2 characters'
  }

  if (!formData.recipient_details?.trim()) {
    errors.recipient_details = 'Recipient details are required'
  } else if (formData.recipient_details.length < 3) {
    errors.recipient_details = 'Recipient details must be at least 3 characters'
  }


  if (!formData.languages || formData.languages.trim().length === 0) {
    errors.languages = 'Please specify at least one language'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Create a new song request
 */
export async function createSongRequest(
  formData: SongRequestFormData,
  userId?: number,
  ip: string = 'unknown',
  anonymousUserId?: string
): Promise<{
  success: boolean
  requestId?: number
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.SONG_CREATION)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    const validation = validateSongRequestForm(formData)
    if (!validation.isValid) {
      return {
        success: false,
        error: 'Please fix the validation errors and try again.'
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      requester_name: sanitizeInput(formData.requester_name),
      recipient_details: sanitizeInput(formData.recipient_details),
      occasion: formData.occasion ? sanitizeInput(formData.occasion) : null,
      languages: sanitizeInput(formData.languages),
      mood: formData.mood || null,
      song_story: formData.song_story ? sanitizeInput(formData.song_story) : null
    }

    // Insert song request - minimal fields only
    const insertData: any = {
      user_id: userId || null,
      anonymous_user_id: anonymousUserId || null,
      requester_name: sanitizedData.requester_name,
      recipient_details: sanitizedData.recipient_details,
      occasion: sanitizedData.occasion || null,
      languages: sanitizedData.languages,
      mood: sanitizedData.mood || null,
      song_story: sanitizedData.song_story,
      status: 'pending'
    };

    const [newRequest] = await db
      .insert(songRequestsTable)
      .values(insertData)
      .returning({
        id: songRequestsTable.id
      })

    if (!newRequest) {
      return {
        success: false,
        error: 'Failed to create song request. Please try again.'
      }
    }

    // TODO: Trigger song generation process
    // This would typically involve:
    // 1. Calling Suno AI API with the form data
    // 2. Updating the request status to 'processing'
    // 3. Storing the Suno task ID

    return {
      success: true,
      requestId: newRequest.id
    }
  } catch (error) {
    console.error('Error in createSongRequest:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}

/**
 * Get user's song requests
 */
export async function getUserSongRequests(
  userId: number,
  ip: string = 'unknown'
): Promise<{
  success: boolean
  requests?: SongRequest[]
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.SONG_CREATION)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Get user's song requests
    const requests = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.user_id, userId))
      .orderBy(songRequestsTable.created_at)

    // Convert Date objects to ISO strings for SongRequest type
    const requestsForResponse: SongRequest[] = requests.map(request => ({
      id: request.id,
      user_id: request.user_id,
      requester_name: request.requester_name,
      recipient_details: request.recipient_details,
      occasion: request.occasion || undefined,
      languages: request.languages,
      mood: request.mood,
      song_story: request.song_story,
      status: request.status as 'pending' | 'processing' | 'completed' | 'failed',
      generated_song_id: request.generated_song_id,
      created_at: request.created_at.toISOString(),
      updated_at: request.updated_at.toISOString()
    }))

    return {
      success: true,
      requests: requestsForResponse
    }
  } catch (error) {
    console.error('Error in getUserSongRequests:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}

/**
 * Get user's songs (completed requests)
 */
export async function getUserSongs(
  userId: number,
  ip: string = 'unknown'
): Promise<{
  success: boolean
  songs?: any[]
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.SONG_CREATION)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Get songs created by the user
    const songs = await db
      .select({
        id: songsTable.id,
        title: songsTable.title,
        music_style: songsTable.music_style,
        slug: songsTable.slug,
        created_at: songsTable.created_at,
        status: songsTable.status
      })
      .from(songsTable)
      .where(eq(songsTable.user_id, userId))
      .orderBy(songsTable.created_at)

    // Convert Date objects to ISO strings
    const songsForResponse = songs.map(song => ({
      ...song,
      created_at: song.created_at.toISOString()
    }))

    return {
      success: true,
      songs: songsForResponse
    }
  } catch (error) {
    console.error('Error in getUserSongs:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}

/**
 * Update song request status
 */
export async function updateSongRequestStatus(
  requestId: number,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  sunoTaskId?: string,
  generatedSongId?: number,
  ip: string = 'unknown'
): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.SONG_CREATION)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Update song request
    const updateData: any = {
      status,
      updated_at: new Date()
    }

    // suno_task_id moved to songs table - no longer update here

    if (generatedSongId) {
      updateData.generated_song_id = generatedSongId
    }

    const [updatedRequest] = await db
      .update(songRequestsTable)
      .set(updateData)
      .where(eq(songRequestsTable.id, requestId))
      .returning({
        id: songRequestsTable.id
      })

    if (!updatedRequest) {
      return {
        success: false,
        error: 'Failed to update song request status.'
      }
    }

    return {
      success: true
    }
  } catch (error) {
    console.error('Error in updateSongRequestStatus:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}
