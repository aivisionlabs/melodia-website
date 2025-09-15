import { NextRequest, NextResponse } from 'next/server'
import { loginUser } from '@/lib/user-actions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email and password are required' },
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
