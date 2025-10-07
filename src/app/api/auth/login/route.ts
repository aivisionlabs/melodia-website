import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/user-actions'
import { db } from '@/lib/db'
import { songRequestsTable, paymentsTable, songsTable } from '@/lib/db/schema'
import { eq, inArray } from 'drizzle-orm'
import { generateJWT } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, anonymous_user_id } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Validate anonymous_user_id format if provided
    if (anonymous_user_id && typeof anonymous_user_id !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Invalid anonymous user ID format' },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Call the server action
    const result = await loginUser(email, password, ip)

    if (result.success && result.user) {
      // Handle anonymous user data merge
      if (anonymous_user_id) {
        try {
          // Update song requests
          const updateResult = await db
            .update(songRequestsTable)
            .set({
              user_id: result.user.id,
              anonymous_user_id: null
            })
            .where(eq(songRequestsTable.anonymous_user_id, anonymous_user_id))
            .returning({ id: songRequestsTable.id })

          console.log(`Merged ${updateResult.length} anonymous requests for user ${result.user.id}`)

          // Update payments
          const paymentUpdateResult = await db
            .update(paymentsTable)
            .set({
              user_id: result.user.id,
              anonymous_user_id: null
            })
            .where(eq(paymentsTable.anonymous_user_id, anonymous_user_id))
            .returning({ id: paymentsTable.id })

          console.log(`Merged ${paymentUpdateResult.length} anonymous payments for user ${result.user.id}`)

          // Update songs that belong to the merged song requests
          // Get the song request IDs that were just merged
          const mergedRequestIds = updateResult.map(r => r.id);
          
          if (mergedRequestIds.length > 0) {
            const songUpdateResult = await db
              .update(songsTable)
              .set({
                user_id: result.user.id
              })
              .where(inArray(songsTable.song_request_id, mergedRequestIds))
              .returning({ id: songsTable.id });

            console.log(`Merged ${songUpdateResult.length} anonymous songs for user ${result.user.id}`)
          }
        } catch (mergeError) {
          console.error('Failed to merge anonymous user data:', mergeError)
          // Don't fail login if merge fails, just log the error
        }
      }

      // Generate JWT token for authentication
      const jwtToken = generateJWT({
        userId: result.user.id.toString(),
        email: result.user.email,
        verified: result.user.email_verified || false
      })

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        data: {
          user: result.user
        }
      })

      // Set JWT token cookie for authentication
      response.cookies.set('auth-token', jwtToken, {
        httpOnly: true, // Secure: prevent XSS attacks
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      // Also set user-session cookie for client-side access (legacy support)
      response.cookies.set('user-session', JSON.stringify(result.user), {
        httpOnly: false, // Allow client-side access for localStorage sync
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      )
    }
  } catch (error) {
    console.error('Error in login API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
