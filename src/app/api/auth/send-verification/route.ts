import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withAuth } from '@/lib/auth/middleware';
import { verificationRateLimit } from '@/lib/utils/rate-limit';
import { generateRequestId } from '@/lib/auth/jwt';
import { createEmailService } from '@/lib/services/email-service';
import { createOTPService } from '@/lib/services/otp-service';

// Compose middleware functions
const handler = withAuth(
  verificationRateLimit(
    async (request: NextRequest) => {
      const requestId = (request as any).requestId || generateRequestId();
      const user = (request as any).user;
      
      try {
        // Get user from database to check current verification status
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

        // Check if email is already verified
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

        // Generate and store new verification code
        const emailService = createEmailService();
        const otpService = createOTPService();
        
        const verificationCode = otpService.generateCode();
        await otpService.storeCode(userData.id.toString(), verificationCode);

        // Send verification email
        try {
          const emailSent = await emailService.sendVerificationEmail(
            userData.email, 
            verificationCode, 
            userData.name
          );
          console.log('Email sent:', emailSent);
          
          if (!emailSent) {
            throw new Error('Email service failed');
          }

          // Calculate when next resend is allowed (1 minute from now)
          const canResendAt = new Date(Date.now() + 60 * 1000).toISOString();

          return NextResponse.json(
            {
              success: true,
              data: {
                message: 'Verification code sent to your email',
                canResendAt
              },
              meta: {
                timestamp: new Date().toISOString(),
                requestId
              }
            },
            { status: 200 }
          );

        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          
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
        console.error('Send verification error:', error);
        
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
);

export { handler as POST };
