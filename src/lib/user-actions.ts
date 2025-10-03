'use server'

import { User } from '@/types'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { checkRateLimit, RATE_LIMITS } from './utils/rate-limiting'
import { validateEmail, validatePassword, validateName, sanitizeInput } from './security'


/**
 * Register a new user
 */
export async function registerUser(
  email: string,
  password: string,
  name: string,
  ip: string = 'unknown'
): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.AUTH_ENDPOINTS)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    if (!validateEmail(email)) {
      return {
        success: false,
        error: 'Please provide a valid email address.'
      }
    }

    if (!validatePassword(password)) {
      return {
        success: false,
        error: 'Password must be at least 8 characters long and contain both letters and numbers.'
      }
    }

    if (!validateName(name)) {
      return {
        success: false,
        error: 'Name must be 2-50 characters long and contain only letters, spaces, and hyphens.'
      }
    }

    // Sanitize inputs
    const sanitizedEmail = email.toLowerCase().trim()
    const sanitizedName = sanitizeInput(name)

    // Check if user already exists
    const existingUser = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, sanitizedEmail))
      .limit(1)

    if (existingUser.length > 0) {
      return {
        success: false,
        error: 'An account with this email already exists.'
      }
    }

    // Hash password
    const saltRounds = 12
    const passwordHash = await bcrypt.hash(password, saltRounds)

    // Create user
    const [newUser] = await db
      .insert(usersTable)
      .values({
        email: sanitizedEmail,
        password_hash: passwordHash,
        name: sanitizedName
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at
      })

    if (!newUser) {
      return {
        success: false,
        error: 'Failed to create account. Please try again.'
      }
    }

    // Convert Date objects to ISO strings for User type
    const userForResponse: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      created_at: newUser.created_at.toISOString(),
      updated_at: newUser.updated_at.toISOString()
    }

    return {
      success: true,
      user: userForResponse
    }
  } catch (error) {
    console.error('Error in registerUser:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}

/**
 * Login user
 */
export async function loginUser(
  email: string,
  password: string,
  ip: string = 'unknown'
): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.AUTH_ENDPOINTS)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    if (!validateEmail(email)) {
      return {
        success: false,
        error: 'Please provide a valid email address.'
      }
    }

    if (!password || password.length < 1) {
      return {
        success: false,
        error: 'Password is required.'
      }
    }

    // Sanitize email
    const sanitizedEmail = email.toLowerCase().trim()

    // Get user with password hash
    const user = await db
      .select({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        password_hash: usersTable.password_hash,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at
      })
      .from(usersTable)
      .where(eq(usersTable.email, sanitizedEmail))
      .limit(1)

    if (user.length === 0) {
      return {
        success: false,
        error: 'Invalid email or password.'
      }
    }

    const userData = user[0]

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, userData.password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password.'
      }
    }

    // Remove password hash from response and convert dates to strings
    const { ...userWithoutPassword } = userData
    const userForResponse: User = {
      ...userWithoutPassword,
      created_at: userData.created_at.toISOString(),
      updated_at: userData.updated_at.toISOString()
    }

    return {
      success: true,
      user: userForResponse
    }
  } catch (error) {
    console.error('Error in loginUser:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('user-session')?.value

    if (!session) {
      return null
    }

    try {
      const parsed = JSON.parse(session)
      // Minimal shape validation
      if (parsed && typeof parsed.id === 'number' && typeof parsed.email === 'string') {
        return parsed as User
      }
    } catch {
      return null
    }

    return null
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Logout user
 */
export async function logoutUser(): Promise<{
  success: boolean
  error?: string
}> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete('user-session')

    return {
      success: true
    }
  } catch (error) {
    console.error('Error in logoutUser:', error)
    return {
      success: false,
      error: 'Failed to logout.'
    }
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: number,
  updates: {
    name?: string
    email?: string
  },
  ip: string = 'unknown'
): Promise<{
  success: boolean
  user?: User
  error?: string
}> {
  try {
    // Rate limiting
    if (!checkRateLimit(ip, RATE_LIMITS.AUTH_ENDPOINTS)) {
      return {
        success: false,
        error: 'Too many requests. Please try again later.'
      }
    }

    // Input validation
    if (updates.email && !validateEmail(updates.email)) {
      return {
        success: false,
        error: 'Please provide a valid email address.'
      }
    }

    if (updates.name && !validateName(updates.name)) {
      return {
        success: false,
        error: 'Name must be 2-50 characters long and contain only letters, spaces, and hyphens.'
      }
    }

    // Sanitize inputs
    const sanitizedUpdates: any = {}
    if (updates.email) {
      sanitizedUpdates.email = updates.email.toLowerCase().trim()
    }
    if (updates.name) {
      sanitizedUpdates.name = sanitizeInput(updates.name)
    }

    // Update user
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        ...sanitizedUpdates,
        updated_at: new Date()
      })
      .where(eq(usersTable.id, userId))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        created_at: usersTable.created_at,
        updated_at: usersTable.updated_at
      })

    if (!updatedUser) {
      return {
        success: false,
        error: 'Failed to update profile.'
      }
    }

    // Convert Date objects to ISO strings for User type
    const userForResponse: User = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      created_at: updatedUser.created_at.toISOString(),
      updated_at: updatedUser.updated_at.toISOString()
    }

    return {
      success: true,
      user: userForResponse
    }
  } catch (error) {
    console.error('Error in updateUserProfile:', error)
    return {
      success: false,
      error: 'Internal server error.'
    }
  }
}
