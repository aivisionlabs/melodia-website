/**
 * Email Verification API
 * POST /api/auth/verify-email
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable, emailVerificationCodesTable } from '@/lib/db/schema';
import { eq, and, gt, sql } from 'drizzle-orm';
import { z } from 'zod';

const verifySchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, 'Code must be 6 digits'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedData = verifySchema.parse(body);

    // Find user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, validatedData.email))
      .limit(1);

    if (users.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const user = users[0];

    // Check if already verified
    if (user.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
      });
    }

    // Find verification code
    const codes = await db
      .select()
      .from(emailVerificationCodesTable)
      .where(
        and(
          eq(emailVerificationCodesTable.user_id, user.id),
          eq(emailVerificationCodesTable.code, validatedData.code),
          gt(emailVerificationCodesTable.expires_at, new Date())
        )
      )
      .limit(1);

    if (codes.length === 0) {
      // Increment attempts
      await db
        .update(emailVerificationCodesTable)
        .set({ attempts: sql`${emailVerificationCodesTable.attempts} + 1` })
        .where(eq(emailVerificationCodesTable.user_id, user.id));

      return NextResponse.json(
        { error: 'Invalid or expired verification code' },
        { status: 400 }
      );
    }

    // Verify email
    await db
      .update(usersTable)
      .set({ email_verified: true })
      .where(eq(usersTable.id, user.id));

    // Delete used verification code
    await db
      .delete(emailVerificationCodesTable)
      .where(eq(emailVerificationCodesTable.user_id, user.id));

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}

