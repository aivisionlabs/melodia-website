import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentsTable, songRequestsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/user-actions'
import { sanitizeAnonymousUserId } from '@/lib/utils/validation'
import { getUserContextFromRequest } from '@/lib/middleware-utils'

export async function POST(request: NextRequest) {
  try {
    const { requestId, userId, anonymousUserId } = await request.json()

    if (!requestId) {
      return NextResponse.json(
        { error: true, message: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get user context from middleware
    const userContext = getUserContextFromRequest(request)

    // Get current user (optional for anonymous users)
    const currentUser = await getCurrentUser()

    // Sanitize anonymous user ID from request body or middleware
    const sanitizedAnonymousUserId = sanitizeAnonymousUserId(anonymousUserId || userContext.anonymousUserId)

    // Use current user if available, otherwise use provided user ID
    const finalUserId = userContext.userId || currentUser?.id || userId || null
    const finalAnonymousUserId = sanitizedAnonymousUserId

    console.log(currentUser, sanitizedAnonymousUserId, finalUserId, finalAnonymousUserId)
    // Verify the song request exists
    const songRequest = await db
      .select()
      .from(songRequestsTable)
      .where(eq(songRequestsTable.id, requestId))
      .limit(1)

    if (!songRequest[0]) {
      return NextResponse.json(
        { error: true, message: 'Song request not found' },
        { status: 404 }
      )
    }

    // Check ownership for both user types
    const isOwner = (finalUserId && songRequest[0].user_id === finalUserId) ||
      (finalAnonymousUserId && songRequest[0].anonymous_user_id === finalAnonymousUserId)

    if (!isOwner) {
      return NextResponse.json(
        { error: true, message: 'Unauthorized access' },
        { status: 403 }
      )
    }

    // Check if payment already exists for this request
    const existingPayment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.song_request_id, requestId))
      .limit(1)

    if (existingPayment[0]) {
      return NextResponse.json({
        success: true,
        paymentId: existingPayment[0].id,
        status: 'completed',
        redirectUrl: `/song-options/${requestId}`, // Will be updated to song ID after song creation
      })
    } else {
      // Create payment record
      const [payment] = await db
        .insert(paymentsTable)
        .values({
          song_request_id: requestId,
          user_id: finalUserId,
          anonymous_user_id: finalAnonymousUserId,
          amount: '299.00', // Rs. 299
          currency: 'INR',
          status: 'pending',
          payment_method: 'razorpay',
          metadata: {
            request_type: 'song_generation',
            created_at: new Date().toISOString()
          }
        })
        .returning()

      // For demo mode, simulate immediate payment success
      if (process.env.DEMO_MODE === 'true') {
        console.log('🎭 DEMO MODE: Simulating payment success')

        // Update payment status to completed
        await db
          .update(paymentsTable)
          .set({
            status: 'completed',
            razorpay_payment_id: `demo_payment_${payment.id}`,
            razorpay_order_id: `demo_order_${payment.id}`,
            updated_at: new Date()
          })
          .where(eq(paymentsTable.id, payment.id))

        // Update song request status
        await db
          .update(songRequestsTable)
          .set({
            status: 'processing'
          })
          .where(eq(songRequestsTable.id, requestId))

        return NextResponse.json({
          success: true,
          paymentId: payment.id,
          status: 'completed',
          redirectUrl: `/song-options/${requestId}`, // Will be updated to song ID after song creation
          demoMode: true
        })
      }

      // For production, integrate with Razorpay
      // This would typically involve:
      // 1. Creating a Razorpay order
      // 2. Returning payment details to frontend
      // 3. Handling webhook for payment confirmation

      // return NextResponse.json({
      //   success: true,
      //   paymentId: payment.id,
      //   status: 'pending',
      //   redirectUrl: `/payment/${payment.id}`,
      //   demoMode: false
      // })

      return NextResponse.json({
        success: true,
        paymentId: payment.id,
        status: 'completed',
        redirectUrl: `/song-options/${requestId}`, // Will be updated to song ID after song creation
      })
    }








  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to create payment' },
      { status: 500 }
    )
  }
}

