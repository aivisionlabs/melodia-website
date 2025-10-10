import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/middleware';
import { validateRequest } from '@/lib/validation/middleware';
import { verifyEmailSchema } from '@/lib/validation/schemas';
import { otpAttemptRateLimit } from '@/lib/utils/rate-limit';
import { generateJWT, generateRequestId } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { createOTPService } from '@/lib/services/otp-service';
import type { VerifyEmailRequest } from '@/types';

// Compose middleware functions
const handler = withAuth(
  otpAttemptRateLimit(
    validateRequest(verifyEmailSchema)(
      async (request: NextRequest) => {
        const requestId = (request as any).requestId || generateRequestId();
        const user = (request as any).user;
        const validatedData = (request as any).validatedData as VerifyEmailRequest;

        try {
          const { code } = validatedData;

          // Get user from database
          const dbUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, parseInt(user.userId)))
            .limit(1);

          if (dbUser.length === 0) {
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

          const userData = dbUser[0];

          // Check if already verified
          if (userData.email_verified) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  message: 'Email is already verified',
                  code: 'ALREADY_VERIFIED'
                },
                meta: {
                  timestamp: new Date().toISOString(),
                  requestId
                }
              },
              { status: 409 }
            );
          }

          // Verify OTP code
          const otpService = createOTPService();
          const verificationResult = await otpService.verifyCode(userData.id.toString(), code);

          if (!verificationResult.valid) {
            // Increment attempts
            const attemptsRemaining = await otpService.incrementAttempts(userData.id.toString());

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

          // Code is valid - update user as verified
          const updatedUser = await db
            .update(usersTable)
            .set({
              email_verified: true,
              updated_at: new Date()
            })
            .where(eq(usersTable.id, userData.id))
            .returning();

          const verifiedUser = updatedUser[0];

          // Clear OTP code
          await otpService.clearCode(userData.id.toString());

          // Generate new JWT with verified status
          const newToken = generateJWT({
            userId: verifiedUser.id.toString(),
            email: verifiedUser.email,
            name: verifiedUser.name,
            verified: true,
            phoneNumber: verifiedUser.phone_number,
            profilePicture: verifiedUser.profile_picture
          });

          // Update auth cookie
          await setAuthCookie(newToken);

          return NextResponse.json(
            {
              success: true,
              data: {
                message: 'Email verified successfully',
                user: {
                  id: verifiedUser.id.toString(),
                  email: verifiedUser.email,
                  name: verifiedUser.name,
                  email_verified: verifiedUser.email_verified
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
          console.error('Verify email error:', error);

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
    )
  )
);

export { handler as POST };
