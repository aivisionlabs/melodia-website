import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/user-actions'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export async function GET() {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ success: true, user })
}

export async function PATCH(request: NextRequest) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { name } = body

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ success: false, error: 'Invalid name' }, { status: 400 })
    }

    const [updated] = await db
      .update(usersTable)
      .set({ name: name.trim() })
      .where(eq(usersTable.id, user.id))
      .returning({ id: usersTable.id, email: usersTable.email, name: usersTable.name, created_at: usersTable.created_at, updated_at: usersTable.updated_at })

    return NextResponse.json({ success: true, user: { ...updated, created_at: updated.created_at.toISOString(), updated_at: updated.updated_at.toISOString() } })
  } catch (error) {
    console.error('Update profile failed:', error)
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
  }
}







