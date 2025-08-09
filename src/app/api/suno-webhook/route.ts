import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Console log the webhook data for now
    console.log('Suno Webhook received:', JSON.stringify(body, null, 2));

    // TODO: Process the webhook data and update song status
    // This will be implemented when we switch to real API

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Suno webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}