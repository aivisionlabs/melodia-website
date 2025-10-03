import { NextRequest, NextResponse } from 'next/server'
import { registerUser } from '@/lib/user-actions'
import { db } from '@/lib/db'
import { songRequestsTable, paymentsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, anonymous_user_id } = body

    if (!email || !password || !name) {
      return NextResponse.json(
        { success: false, error: 'Email, password, and name are required' },
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

      // Create response with user data
      const response = NextResponse.json({
        success: true,
        user: result.user
      })

      // Set cookie in the response
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
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error in register API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
