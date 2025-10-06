import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { createEmailService } from '@/lib/services/email-service';
import { createOTPService } from '@/lib/services/otp-service';
import { generateRequestId } from '@/lib/auth/jwt';
import { z } from 'zod';

// Validation schema for forgot password request
const forgotPasswordSchema = z.object({
  email: z.string()
    .email('Please enter a valid email address')
    .toLowerCase()
    .transform(str => str.trim())
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  
  try {
    const body = await request.json();
    
    // Validate request data
    const validationResult = forgotPasswordSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Please enter a valid email address',
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

    const { email } = validationResult.data;

    // Check if user exists in database
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
            message: 'No account found with this email address. Please check your email or sign up for a new account.',
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

    // Check if email is verified
    if (!user.email_verified) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Your email address is not verified. Please verify your email first before resetting your password.',
            code: 'EMAIL_NOT_VERIFIED'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 403 }
      );
    }

    // Generate and store OTP
    const otpService = createOTPService();
    const verificationCode = otpService.generateCode();
    await otpService.storeCode(user.id.toString(), verificationCode);

    // Send OTP via email
    try {
      const emailService = createEmailService();
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        verificationCode,
        user.name
      );

      if (!emailSent) {
        throw new Error('Email service failed');
      }

      return NextResponse.json(
        {
          success: true,
          data: {
            message: 'Verification code sent to your email address',
            email: user.email
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 200 }
      );

    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
      
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Failed to send verification email. Please try again.',
            code: 'EMAIL_SEND_FAILED'
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    
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
