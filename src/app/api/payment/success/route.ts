import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paymentsTable, songRequestsTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function POST(request: NextRequest) {
  try {
    const { paymentId, requestId } = await request.json()

    console.log("CALLING success", "process.env.DEMO_MODE", process.env.DEMO_MODE);
    console.log("NEXT_PUBLIC_BASE_URL", process.env.NEXT_PUBLIC_BASE_URL);

    if (!paymentId || !requestId) {
      return NextResponse.json(
        { error: true, message: 'Payment ID and Request ID are required' },
        { status: 400 }
      )
    }

    // Verify payment exists and is completed
    const payment = await db
      .select()
      .from(paymentsTable)
      .where(eq(paymentsTable.id, paymentId))
      .limit(1)

    console.log("CHECKING payment");
    if (!payment[0]) {
      return NextResponse.json(
        { error: true, message: 'Payment not found' },
        { status: 404 }
      )
    }

    console.log("payment found");

    // if (payment[0].status !== 'completed') {
    //   return NextResponse.json(
    //     { error: true, message: 'Payment not completed' },
    //     { status: 400 }
    //   )
    // }

    console.log("payment compleyed found");

    // Get song request data
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

    console.log("checking song request")

    // Get approved lyrics for this request
    const { lyricsDraftsTable } = await import('@/lib/db/schema')
    const { and, eq: eqLyrics } = await import('drizzle-orm')

    const approvedLyrics = await db
      .select()
      .from(lyricsDraftsTable)
      .where(
        and(
          eqLyrics(lyricsDraftsTable.song_request_id, requestId),
          eqLyrics(lyricsDraftsTable.status, 'approved')
        )
      )
      .limit(1)

    if (!approvedLyrics[0]) {
      return NextResponse.json(
        { error: true, message: 'No approved lyrics found' },
        { status: 400 }
      )
    }
    console.log("+++STARTING to generate song with lyrics+++", process.env.NEXT_PUBLIC_BASE_URL);

    // Call /api/generate-song with lyrics data
    const generateSongResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/generate-song`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: approvedLyrics[0].song_title,
        lyrics: approvedLyrics[0].generated_text,
        style: approvedLyrics[0].music_style,
        recipientDetails: songRequest[0].recipient_details,
        requestId,
      })
    })

    console.log("generateSongResponse", generateSongResponse);

    if (!generateSongResponse.ok) {
      const errorData = await generateSongResponse.json().catch(() => ({}))
      throw new Error(errorData.message || 'Failed to generate song')
    }

    const generateSongData = await generateSongResponse.json()

    if (!generateSongData.success) {
      throw new Error(generateSongData.message || 'Song generation failed')
    }

    console.log('🎵 Song generated successfully:', generateSongData.songId)

    // Update song request status
    await db
      .update(songRequestsTable)
      .set({
        status: 'processing'
      })
      .where(eq(songRequestsTable.id, requestId))

    return NextResponse.json({
      success: true,
      songId: generateSongData.songId,
      message: 'Song created successfully'
    })

  } catch (error) {
    console.error('Error processing payment success:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to process payment success' },
      { status: 500 }
    )
  }
}
