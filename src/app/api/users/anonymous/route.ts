import { NextRequest, NextResponse } from 'next/server'

function generateAnonymousId(): string {
  // Simple UUID v4 generator fallback (no external dep)
  // Not cryptographically secure; sufficient for anonymous id
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export async function POST(_request: NextRequest) {
  try {
    const anonymousId = generateAnonymousId()

    return NextResponse.json({ success: true, anonymous_user_id: anonymousId })
  } catch (error) {
    console.error('Error creating anonymous user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create anonymous user' },
      { status: 500 }
    )
  }
}







