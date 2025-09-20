import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { anonymousUsersTable } from '@/lib/db/schema'

export async function POST(_request: NextRequest) {
  try {
    // Create anonymous user in database (UUID will be auto-generated)
    const [anonymousUser] = await db
      .insert(anonymousUsersTable)
      .values({})
      .returning({ id: anonymousUsersTable.id })

    if (!anonymousUser) {
      return NextResponse.json(
        { success: false, error: 'Failed to create anonymous user' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      anonymous_user_id: anonymousUser.id
    })
  } catch (error) {
    console.error('Error creating anonymous user:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create anonymous user' },
      { status: 500 }
    )
  }
}







