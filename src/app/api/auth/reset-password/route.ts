import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyJWT, generateRequestId } from '@/lib/auth/jwt';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

// Validation schema for password reset
const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z.string()
    .min(6, 'Password must be at least 6 characters')
    .transform(str => str.trim())
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = resetPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: validationResult.error.issues[0]?.message || 'Invalid request data',
            code: 'VALIDATION_ERROR'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 400 }
      );
    }

    const { resetToken, newPassword } = validationResult.data;

    // Verify reset token
    const tokenPayload = verifyJWT(resetToken);
    if (!tokenPayload) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid or expired reset token',
            code: 'INVALID_TOKEN'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 401 }
      );
    }

    // Check if token is for password reset
    if ((tokenPayload as any).purpose !== 'password_reset') {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid reset token',
            code: 'INVALID_TOKEN_PURPOSE'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 401 }
      );
    }

    // Get user from database
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, parseInt(tokenPayload.userId)))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'User not found',
            code: 'USER_NOT_FOUND'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 404 }
      );
    }

    const user = existingUser[0];

    // Hash new password
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in database
    const updatedUser = await db
      .update(usersTable)
      .set({
        password_hash: passwordHash,
        updated_at: new Date()
      })
      .where(eq(usersTable.id, user.id))
      .returning({
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name
      });

    if (updatedUser.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to update password',
            code: 'UPDATE_FAILED'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Password updated successfully',
          user: {
            id: updatedUser[0].id,
            email: updatedUser[0].email,
            name: updatedUser[0].name
          }
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR'
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: 500 }
    );
  }
}
