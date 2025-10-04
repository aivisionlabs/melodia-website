'use server'

import { db } from '@/lib/db'
import { songRequestsTable, anonymousUsersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { sanitizeInput } from './security'
import { SongRequestPayload } from '@/types/song-request'
// import { shouldRequirePayment } from './payment-config'

/**
 * Validate and ensure anonymous user exists
 */
async function validateAnonymousUser(anonymousUserId: string | null): Promise<string | null> {
  if (!anonymousUserId) {
    return null
  }

  try {
    // Check if anonymous user exists
    const existingUser = await db
      .select({ id: anonymousUsersTable.id })
      .from(anonymousUsersTable)
      .where(eq(anonymousUsersTable.id, anonymousUserId))
      .limit(1)

    if (existingUser.length > 0) {
      return anonymousUserId
    }

    // If user doesn't exist, create a new one
    const [newUser] = await db
      .insert(anonymousUsersTable)
      .values({})
      .returning({ id: anonymousUsersTable.id })

    return newUser?.id || null
  } catch (error) {
    console.error('Error validating anonymous user:', error)
    return null
  }
}

// Input validation functions
function validateSongRequestForm(formData: SongRequestPayload): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  // Required fields validation
  if (!formData.requesterName?.trim()) {
    errors.requesterName = 'Your name is required'
  } else if (formData.requesterName.length < 2) {
    errors.requesterName = 'Name must be at least 2 characters'
  }

  if (!formData.recipientDetails?.trim()) {
    errors.recipientDetails = 'Recipient details are required'
  } else if (formData.recipientDetails.length < 3) {
    errors.recipientDetails = 'Recipient details must be at least 3 characters'
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
  formData: SongRequestPayload,
  userId: number | string | null,
  anonymousUserId: string | null
): Promise<{
  success: boolean
  requestId?: number
  error?: string
}> {
  try {
    // Input validation
    const validation = validateSongRequestForm(formData)
    if (!validation.isValid) {
      console.error("Errors while creating request",
        JSON.stringify({ errors: validation.errors }),
      );
      return {
        success: false,
        error: `Please fix the validation errors and try again.`
      }
    }

    // Sanitize inputs
    const sanitizedData = {
      requesterName: sanitizeInput(formData.requesterName),
      recipientDetails: sanitizeInput(formData.recipientDetails),
      occasion: formData.occasion ? sanitizeInput(formData.occasion) : null,
      languages: Array.isArray(formData.languages) ? formData.languages.map(lang => sanitizeInput(lang)) : [sanitizeInput(formData.languages)],
      mood: formData.mood || null,
      story: formData.story ? sanitizeInput(formData.story) : null
    }

    // Validate and ensure anonymous user exists if provided
    const validAnonymousUserId = await validateAnonymousUser(anonymousUserId)

    // Insert song request - minimal fields only
    const insertData: any = {
      user_id: userId || null,
      anonymous_user_id: validAnonymousUserId || null,
      requester_name: sanitizedData.requesterName,
      recipient_details: sanitizedData.recipientDetails,
      occasion: sanitizedData.occasion || null,
      languages: sanitizedData.languages,
      mood: sanitizedData.mood || null,
      song_story: sanitizedData.story,
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

