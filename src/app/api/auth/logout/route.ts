import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({
      success: true
    })

    // Clear authentication cookie
    response.cookies.delete('auth-token')

    return response
  } catch (error) {
    console.error('Error in logout API:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
