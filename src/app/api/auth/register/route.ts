/**
 * User Registration API
 * POST /api/auth/register
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable, emailVerificationCodesTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  dateOfBirth: z.string(), // YYYY-MM-DD format
  phoneNumber: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email))
      .limit(1);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const newUsers = await db
      .insert(usersTable)
      .values({
        name: validatedData.name,
        email: validatedData.email,
        password_hash: passwordHash,
        date_of_birth: new Date(validatedData.dateOfBirth),
        phone_number: validatedData.phoneNumber,
        email_verified: false,
      })
      .returning();

    const newUser = newUsers[0];

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await db.insert(emailVerificationCodesTable).values({
      user_id: newUser.id,
      code: verificationCode,
      expires_at: expiresAt,
    });

    // TODO: Send verification email (will be implemented in Phase 4)
    console.log(`Verification code for ${newUser.email}: ${verificationCode}`);

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      email: newUser.email,
      message: 'User registered successfully. Please check your email for verification code.',
    });
  } catch (error) {
    console.error('Registration error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

