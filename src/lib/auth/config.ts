/**
 * NextAuth.js Configuration
 * Handles user authentication with Email/Password and Google OAuth
 */

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db) as any,

  providers: [
    // Email/Password Authentication
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          // Find user by email
          const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, credentials.email))
            .limit(1);

          const user = users[0];

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Verify email is verified
          if (!user.email_verified) {
            throw new Error('Please verify your email before logging in');
          }

          // Verify password
          if (!user.password_hash) {
            throw new Error('Invalid login method. Please use social login.');
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );

          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }

          // Return user object (password_hash excluded)
          return {
            id: user.id.toString(),
            email: user.email,
            name: user.name,
            image: user.profile_picture,
            emailVerified: user.email_verified,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      }
    }),

    // Google OAuth Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  pages: {
    signIn: '/profile/login',
    signOut: '/profile/logout',
    error: '/profile/login',
    verifyRequest: '/profile/signup/verify',
  },

  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.emailVerified = user.emailVerified;
      }

      // Google OAuth - auto-verify email
      if (account?.provider === 'google') {
        token.emailVerified = true;

        // Update user's email_verified status in database
        if (token.email) {
          await db
            .update(usersTable)
            .set({ email_verified: true })
            .where(eq(usersTable.email, token.email));
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.image = token.picture as string;
        (session.user as any).emailVerified = token.emailVerified as boolean;
      }

      return session;
    },

    async signIn({ user, account, profile }) {
      // Google OAuth sign in
      if (account?.provider === 'google' && profile?.email) {
        try {
          // Check if user exists
          const existingUsers = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, profile.email))
            .limit(1);

          if (existingUsers.length === 0) {
            // Create new user for Google OAuth
            await db.insert(usersTable).values({
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              email_verified: true,
              profile_picture: (profile as any).picture,
              date_of_birth: new Date('1990-01-01'), // Default, can be updated later
            });
          } else {
            // Update existing user's email verification
            await db
              .update(usersTable)
              .set({
                email_verified: true,
                profile_picture: (profile as any).picture || existingUsers[0].profile_picture,
              })
              .where(eq(usersTable.email, profile.email));
          }
        } catch (error) {
          console.error('Error handling Google sign in:', error);
          return false;
        }
      }

      return true;
    },
  },

  events: {
    async signIn({ user, account, isNewUser }) {
      console.log(`User signed in: ${user.email} via ${account?.provider}`);
      if (isNewUser) {
        console.log(`New user created: ${user.email}`);
      }
    },
    async signOut({ token }) {
      console.log(`User signed out: ${token.email}`);
    },
  },

  debug: process.env.NODE_ENV === 'development',
};

