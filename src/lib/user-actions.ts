'use server'

import { User } from '@/types'
import { db } from '@/lib/db'
import { usersTable } from '@/lib/db/schema'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { eq } from 'drizzle-orm'
import { checkRateLimit, RATE_LIMITS } from './utils/rate-limiting'
import { validateEmail, validatePassword, validateName, sanitizeInput } from './security'
import { verifyJWT } from './auth/jwt'


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
        name: sanitizedName,
        date_of_birth: '1990-01-01', // Default date, should be provided by caller
        email_verified: false
      })
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        date_of_birth: usersTable.date_of_birth,
        phone_number: usersTable.phone_number,
        profile_picture: usersTable.profile_picture,
        email_verified: usersTable.email_verified,
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
      date_of_birth: newUser.date_of_birth, // Already in YYYY-MM-DD format
      phone_number: newUser.phone_number,
      profile_picture: newUser.profile_picture,
      email_verified: newUser.email_verified,
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
        date_of_birth: usersTable.date_of_birth,
        phone_number: usersTable.phone_number,
        profile_picture: usersTable.profile_picture,
        email_verified: usersTable.email_verified,
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
    if (!userData.password_hash) {
      return {
        success: false,
        error: 'Invalid email or password.'
      }
    }

    const isPasswordValid = await bcrypt.compare(password, userData.password_hash)

    if (!isPasswordValid) {
      return {
        success: false,
        error: 'Invalid email or password.'
      }
    }


    // Remove password hash from response and convert dates to strings
    const { password_hash: _password_hash, ...userWithoutPassword } = userData;
    const userForResponse: User = {
      ...userWithoutPassword,
      date_of_birth: userData.date_of_birth, // Already in YYYY-MM-DD format
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
 * Get current user from JWT token (optimized - no DB query)
 * Returns user info directly from JWT token for maximum performance
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value

    if (!authToken) {
      return null
    }

    // Verify JWT token
    const payload = verifyJWT(authToken)
    if (!payload || !payload.userId) {
      return null
    }

    // Return user data directly from JWT token (no DB query needed)
    // This covers 95% of use cases and is much faster
    return {
      id: parseInt(payload.userId, 10),
      email: payload.email,
      name: payload.name,
      date_of_birth: '', // Not stored in JWT - only used for profile pages
      phone_number: payload.phoneNumber || null,
      profile_picture: payload.profilePicture || null,
      email_verified: payload.verified,
      created_at: '', // Not stored in JWT - rarely used
      updated_at: '' // Not stored in JWT - rarely used
    }
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Get full user data from database (use only when complete user data is needed)
 * This should be used sparingly for profile pages, user settings, etc.
 */
export async function getFullUserData(): Promise<User | null> {
  try {
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')?.value

    if (!authToken) {
      return null
    }

    // Verify JWT token
    const payload = verifyJWT(authToken)
    if (!payload || !payload.userId) {
      return null
    }

    // Get full user from database using the userId from JWT
    const user = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parseInt(payload.userId, 10)))
      .limit(1)

    if (user.length === 0) {
      return null
    }

    const dbUser = user[0]
    // Convert Date objects to strings to match User interface
    return {
      ...dbUser,
      created_at: dbUser.created_at.toISOString(),
      updated_at: dbUser.updated_at.toISOString()
    }
  } catch (error) {
    console.error('Error getting full user data:', error)
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
    cookieStore.delete('auth-token')

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
        date_of_birth: usersTable.date_of_birth,
        phone_number: usersTable.phone_number,
        profile_picture: usersTable.profile_picture,
        email_verified: usersTable.email_verified,
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
      date_of_birth: updatedUser.date_of_birth, // Already in YYYY-MM-DD format
      phone_number: updatedUser.phone_number,
      profile_picture: updatedUser.profile_picture,
      email_verified: updatedUser.email_verified,
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
