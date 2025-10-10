import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createOTPService } from '@/lib/services/otp-service';
import { generateRequestId, generateJWT } from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schema for OTP verification
const verifyOTPSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(str => str.trim()),
  code: z.string()
    .length(6, 'Verification code must be 6 digits')
    .regex(/^\d{6}$/, 'Verification code must contain only numbers')
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const body = await request.json();

    // Validate request data
    const validationResult = verifyOTPSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid verification code format',
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

    const { email, code } = validationResult.data;

    // Get user from database
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email))
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

    // Verify OTP code
    const otpService = createOTPService();
    const verificationResult = await otpService.verifyCode(user.id.toString(), code);

    if (!verificationResult.valid) {
      // Increment attempts
      const attemptsRemaining = await otpService.incrementAttempts(user.id.toString());

      if (attemptsRemaining === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Too many failed attempts. Please request a new verification code.',
              code: 'TOO_MANY_ATTEMPTS'
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { status: 423 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid verification code',
            code: 'INVALID_CODE',
            details: {
              attemptsRemaining
            }
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 400 }
      );
    }

    // Code is valid - generate password reset token
    const resetToken = generateJWT({
      userId: user.id.toString(),
      email: user.email,
      name: user.name,
      verified: true,
      purpose: 'password_reset' // Special purpose for password reset
    });

    // Clear OTP code
    await otpService.clearCode(user.id.toString());

    return NextResponse.json(
      {
        success: true,
        data: {
          message: 'Verification successful',
          resetToken
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Verify forgot password OTP error:', error);

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
