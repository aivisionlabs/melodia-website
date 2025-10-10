import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentsTable, songRequestsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

import { getUserContextFromRequest } from '@/lib/middleware-utils'

export async function POST(request: NextRequest) {
  try {
    const { requestId } = await request.json()

    if (!requestId) {
      return NextResponse.json(
        { error: true, message: 'Request ID is required' },
        { status: 400 }
      )
    }

    // Get user context from middleware - this is the ONLY source of truth
    const userContext = getUserContextFromRequest(request)

    // Validate that we have proper user context
    if (!userContext.userId && !userContext.anonymousUserId) {
      return NextResponse.json(
        { error: true, message: 'Authentication required. Please log in or ensure you have an active session.' },
        { status: 401 }
      )
    }

    const userId = userContext.userId
    const anonymousUserId = userContext.anonymousUserId
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
    const isOwner = (userId && songRequest[0].user_id === userId) ||
      (anonymousUserId && songRequest[0].anonymous_user_id === anonymousUserId)

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
          user_id: userId,
          anonymous_user_id: anonymousUserId,
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

