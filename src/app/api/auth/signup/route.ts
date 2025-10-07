import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable, songRequestsTable, paymentsTable, songsTable } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { validateRequest } from '@/lib/validation/middleware';
import { signupSchema } from '@/lib/validation/schemas';
import { signupRateLimit } from '@/lib/utils/rate-limit';
import { generateJWT, generateRequestId } from '@/lib/auth/jwt';
import { setAuthCookie } from '@/lib/auth/cookies';
import { createEmailService } from '@/lib/services/email-service';
import { createOTPService } from '@/lib/services/otp-service';
import type { SignupRequest } from '@/types';
import bcrypt from 'bcryptjs';

// Compose middleware functions
const handler = signupRateLimit(
  validateRequest(signupSchema)(
    async (request: NextRequest) => {
      const requestId = (request as any).requestId || generateRequestId();
      
      try {
        const validatedData = (request as any).validatedData as SignupRequest;
        const { name, email, dateOfBirth, phoneNumber, password, anonymous_user_id } = validatedData;        
        
        // Hash password
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Check if user already exists
        const existingUser = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.email, email))
          .limit(1);

        if (existingUser.length > 0) {
          const user = existingUser[0];
          
          // If user exists and is verified, return conflict
          if (user.email_verified) {
            return NextResponse.json(
              {
                success: false,
                error: {
                  message: 'An account with this email already exists',
                  code: 'EMAIL_ALREADY_EXISTS'
                },
                meta: {
                  timestamp: new Date().toISOString(),
                  requestId
                }
              },
              { status: 409 }
            );
          }
          
          // If user exists but not verified, update the record (allow re-signup)
          const updatedUser = await db
            .update(usersTable)
            .set({
              name,
              date_of_birth: dateOfBirth, // Keep as string (YYYY-MM-DD format)
              phone_number: phoneNumber || null,
              password_hash: passwordHash,
              updated_at: new Date()
            })
            .where(eq(usersTable.id, user.id))
            .returning();

          const userData = updatedUser[0];
          
          // Generate JWT token
          const token = generateJWT({
            userId: userData.id.toString(),
            email: userData.email,
            verified: false
          });

          // Set HTTP-only cookie
          await setAuthCookie(token);

          // Initialize email verification process
          const emailService = createEmailService();
          const otpService = createOTPService();
          
          const verificationCode = otpService.generateCode();
          await otpService.storeCode(userData.id.toString(), verificationCode);
          
          // Send verification email (don't fail signup if email fails)
          try {
            await emailService.sendVerificationEmail(userData.email, verificationCode, userData.name);
          } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue with signup success even if email fails
          }

          return NextResponse.json(
            {
              success: true,
              data: {
                userId: userData.id.toString(),
                email: userData.email,
                name: userData.name,
                email_verified: userData.email_verified
              },
              meta: {
                timestamp: new Date().toISOString(),
                requestId
              }
            },
            { status: 201 }
          );
        }

        // Create new user
        const newUser = await db
          .insert(usersTable)
          .values({
            name,
            email,
            date_of_birth: dateOfBirth, // Keep as string (YYYY-MM-DD format)
            phone_number: phoneNumber || null,
            password_hash: passwordHash,
            email_verified: false
          })
          .returning();

        const userData = newUser[0];

        // Handle anonymous user data merge
        if (anonymous_user_id) {
          try {
            // Update song requests
            const updateResult = await db
              .update(songRequestsTable)
              .set({
                user_id: userData.id,
                anonymous_user_id: null
              })
              .where(eq(songRequestsTable.anonymous_user_id, anonymous_user_id))
              .returning({ id: songRequestsTable.id });

            console.log(`Merged ${updateResult.length} anonymous requests for new user ${userData.id}`);

            // Update payments
            const paymentUpdateResult = await db
              .update(paymentsTable)
              .set({
                user_id: userData.id,
                anonymous_user_id: null
              })
              .where(eq(paymentsTable.anonymous_user_id, anonymous_user_id))
              .returning({ id: paymentsTable.id });

            console.log(`Merged ${paymentUpdateResult.length} anonymous payments for new user ${userData.id}`);

            // Update songs that belong to the merged song requests
            const mergedRequestIds = updateResult.map(r => r.id);
            
            if (mergedRequestIds.length > 0) {
              const songUpdateResult = await db
                .update(songsTable)
                .set({
                  user_id: userData.id
                })
                .where(inArray(songsTable.song_request_id, mergedRequestIds))
                .returning({ id: songsTable.id });

              console.log(`Merged ${songUpdateResult.length} anonymous songs for new user ${userData.id}`);
            }
          } catch (mergeError) {
            console.error('Failed to merge anonymous user data (signup):', mergeError);
            // Don't fail signup if merge fails, just log the error
          }
        }

        // Generate JWT token
        const token = generateJWT({
          userId: userData.id.toString(),
          email: userData.email,
          verified: false
        });

        // Set HTTP-only cookie
        await setAuthCookie(token);

        // Initialize email verification process
        const emailService = createEmailService();
        const otpService = createOTPService();
        
        const verificationCode = otpService.generateCode();
        await otpService.storeCode(userData.id.toString(), verificationCode);
        
        // Send verification email (don't fail signup if email fails)
        try {
          await emailService.sendVerificationEmail(userData.email, verificationCode, userData.name);
        } catch (emailError) {
          console.error('Failed to send verification email:', emailError);
          // Continue with signup success even if email fails
        }

        return NextResponse.json(
          {
            success: true,
            data: {
              userId: userData.id.toString(),
              email: userData.email,
              name: userData.name,
              email_verified: userData.email_verified
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { status: 201 }
        );

      } catch (error) {
        console.error('Signup error:', error);
        
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
