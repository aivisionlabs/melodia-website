import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/user-actions'
import { db } from '@/lib/db'
import { songRequestsTable, paymentsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { generateJWT } from '@/lib/auth/jwt'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, anonymous_user_id } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Email, password, and name are required',
            code: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      )
    }

    // Validate anonymous_user_id format if provided
    if (anonymous_user_id && typeof anonymous_user_id !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Invalid anonymous user ID format',
            code: 'VALIDATION_ERROR'
          }
        },
        { status: 400 }
      )
    }

    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown'

    // Call the server action
    const result = await registerUser(email, password, name, ip)

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

          console.log(`Merged ${updateResult.length} anonymous requests for new user ${result.user.id}`)

          // Update payments
          const paymentUpdateResult = await db
            .update(paymentsTable)
            .set({
              user_id: result.user.id,
              anonymous_user_id: null
            })
            .where(eq(paymentsTable.anonymous_user_id, anonymous_user_id))
            .returning({ id: paymentsTable.id })

          console.log(`Merged ${paymentUpdateResult.length} anonymous payments for new user ${result.user.id}`)
        } catch (mergeError) {
          console.error('Failed to merge anonymous user data (register):', mergeError)
          // Don't fail registration if merge fails, just log the error
        }
      }

      // Generate JWT token for authentication
      const jwtToken = generateJWT({
        userId: result.user.id.toString(),
        email: result.user.email,
        name: result.user.name,
        verified: result.user.email_verified || false,
        phoneNumber: result.user.phone_number,
        profilePicture: result.user.profile_picture
      })

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        user: result.user
      })

      // Set JWT token cookie for authentication
      response.cookies.set('auth-token', jwtToken, {
        httpOnly: true, // Secure: prevent XSS attacks
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7 // 7 days
      })

      return response
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: result.error || 'Registration failed',
            code: 'REGISTRATION_FAILED'
          }
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in register API:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: { 
          message: 'Internal server error',
          code: 'SERVER_ERROR'
        }
      },
      { status: 500 }
    )
  }
}
