'use server'

import { SongRequestFormData, SongRequest } from '@/types'
import { db } from '@/lib/db'
import { songRequestsTable, songsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkRateLimit, RATE_LIMITS } from './utils/rate-limiting'
import { sanitizeInput } from './security'
import { shouldRequirePayment } from './payment-config'

// Input validation functions
function validateSongRequestForm(formData: SongRequestFormData): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Required fields validation
  if (!formData.requester_name?.trim()) {
    errors.requester_name = 'Your name is required'
  } else if (formData.requester_name.length < 2) {
    errors.requester_name = 'Name must be at least 2 characters'
  }

  if (!formData.recipient_name?.trim()) {
    errors.recipient_name = 'Recipient name is required'
  } else if (formData.recipient_name.length < 3) {
    errors.recipient_name = 'Recipient name must be at least 3 characters'
  }

  if (!formData.recipient_relationship?.trim()) {
    errors.recipient_relationship = 'Relationship is required'
  }

  if (!formData.languages || formData.languages.length === 0) {
    errors.languages = 'Please select at least one language'
  }

  // // Contact validation
  // if (!formData.phone_number && !formData.email) {
  //   errors.contact = 'Please provide either phone number or email'
  // }

  // if (formData.phone_number && !isValidPhone(formData.phone_number)) {
  //   errors.phone_number = 'Please enter a valid phone number'
  // }

  // if (formData.email && !isValidEmail(formData.email)) {
  //   errors.email = 'Please enter a valid email address'
  // }

  // Delivery preference validation
  // if ((formData.phone_number || formData.email) && !formData.delivery_preference) {
  //   errors.delivery_preference = 'Please select delivery preference'
  // }

  // Optional fields length validation
  // if (formData.person_description && formData.person_description.length > 500) {
  //   errors.person_description = 'Person description must be 500 characters or less'
  // }

  if (formData.song_type && formData.song_type.length > 300) {
    errors.song_type = 'Song type must be 300 characters or less'
  }

  // if (formData.additional_details && formData.additional_details.length > 1000) {
  //   errors.additional_details = 'Additional details must be 1000 characters or less'
  // }

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
      phone_number: formData.phone_number ? sanitizeInput(formData.phone_number) : null,
      email: formData.email ? sanitizeInput(formData.email) : null,
      delivery_preference: formData.delivery_preference,
      recipient_name: sanitizeInput(formData.recipient_name),
      recipient_relationship: sanitizeInput(formData.recipient_relationship),
      languages: formData.languages,
      person_description: formData.person_description ? sanitizeInput(formData.person_description) : null,
      song_type: formData.song_type ? sanitizeInput(formData.song_type) : null,
      emotions: formData.emotions || null,
      additional_details: formData.additional_details ? sanitizeInput(formData.additional_details) : null
    }

    // Insert song request - minimal fields only
    const insertData: any = {
      user_id: userId || null,
      anonymous_user_id: anonymousUserId || null,
      requester_name: sanitizedData.requester_name,
      phone_number: sanitizedData.phone_number || null,
      email: sanitizedData.email || null,
      delivery_preference: sanitizedData.delivery_preference || null,
      recipient_name: sanitizedData.recipient_name,
      recipient_relationship: sanitizedData.recipient_relationship,
      languages: sanitizedData.languages,
      person_description: sanitizedData.person_description || null,
      song_type: sanitizedData.song_type || null,
      emotions: sanitizedData.emotions || null,
      additional_details: sanitizedData.additional_details,
      status: 'pending',
      lyrics_status: 'pending',
      payment_required: false
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
      phone_number: request.phone_number,
      email: request.email,
      delivery_preference: request.delivery_preference as 'email' | 'whatsapp' | 'both' | null,
      recipient_name: request.recipient_name,
      recipient_relationship: request.recipient_relationship,
      languages: request.languages,
      person_description: request.person_description,
      song_type: request.song_type,
      emotions: request.emotions,
      additional_details: request.additional_details,
      status: request.status as 'pending' | 'processing' | 'completed' | 'failed',
      suno_task_id: request.suno_task_id,
      generated_song_id: request.generated_song_id,
      created_at: request.created_at.toISOString(),
      updated_at: request.updated_at.toISOString(),
      // Phase 6: Lyrics workflow fields
      lyrics_status: request.lyrics_status as 'pending' | 'generating' | 'needs_review' | 'approved',
      approved_lyrics_id: request.approved_lyrics_id,
      lyrics_locked_at: request.lyrics_locked_at?.toISOString() || null,
      // Payment integration fields
      payment_id: request.payment_id,
      payment_status: request.payment_status as 'pending' | 'paid' | 'failed' | 'refunded',
      payment_required: request.payment_required || false
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

    if (sunoTaskId) {
      updateData.suno_task_id = sunoTaskId
    }

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
