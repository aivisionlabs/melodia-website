import { OAuth2Client } from 'google-auth-library';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { User } from '@/types';
import { generateJWT } from '@/lib/auth/jwt';

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  email_verified: boolean;
}

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
    );
  }

  /**
   * Generate Google OAuth URL for authentication
   */
  getAuthUrl(anonymousUserId?: string | null): string {
    const scopes = [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ];

    const authUrlOptions: any = {
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    };

    // Include anonymous_user_id in state if provided
    if (anonymousUserId) {
      authUrlOptions.state = JSON.stringify({ anonymous_user_id: anonymousUserId });
    }

    return this.oauth2Client.generateAuthUrl(authUrlOptions);
  }

  /**
   * Exchange authorization code for tokens and get user info
   */
  async handleCallback(code: string, anonymousUserId?: string | null): Promise<{
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
  }> {
    try {
      console.log('Starting Google OAuth callback process...');
      
      // Exchange code for tokens
      console.log('Exchanging code for tokens...');
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);
      console.log('Tokens received successfully');

      // Get user info from Google
      console.log('Fetching user info from Google...');
      const userInfo = await this.getUserInfo(tokens.access_token!);
      
      if (!userInfo) {
        console.error('Failed to get user information from Google');
        return { success: false, error: 'Failed to get user information from Google' };
      }
      console.log('User info received:', { email: userInfo.email, name: userInfo.name });

      // Create or update user in database
      console.log('Creating or updating user in database...');
      const user = await this.createOrUpdateUser(userInfo);
      
      if (!user) {
        console.error('Failed to create or update user in database');
        return { success: false, error: 'Failed to create or update user in database' };
      }
      console.log('User successfully processed:', { id: user.id, email: user.email });

      // Handle anonymous user data merge if anonymousUserId is provided
      if (anonymousUserId) {
        try {
          console.log('Merging anonymous user data for user:', user.id, 'anonymous_user_id:', anonymousUserId);
          
          // Import required modules for database operations
          const { db } = await import('@/lib/db');
          const { songRequestsTable, paymentsTable, anonymousUsersTable } = await import('@/lib/db/schema');
          const { eq } = await import('drizzle-orm');

          // Update song requests
          const updateResult = await db
            .update(songRequestsTable)
            .set({
              user_id: user.id,
              anonymous_user_id: null
            })
            .where(eq(songRequestsTable.anonymous_user_id, anonymousUserId))
            .returning({ id: songRequestsTable.id });

          console.log(`Merged ${updateResult.length} anonymous requests for user ${user.id}`);

          // Update payments
          const paymentUpdateResult = await db
            .update(paymentsTable)
            .set({
              user_id: user.id,
              anonymous_user_id: null
            })
            .where(eq(paymentsTable.anonymous_user_id, anonymousUserId))
            .returning({ id: paymentsTable.id });

          console.log(`Merged ${paymentUpdateResult.length} anonymous payments for user ${user.id}`);

          // Delete anonymous user record after successful merge
          try {
            await db.delete(anonymousUsersTable).where(eq(anonymousUsersTable.id, anonymousUserId));
            console.log(`Deleted anonymous user ${anonymousUserId} after merge (Google OAuth)`);
          } catch (delErr) {
            console.warn('Failed to delete anonymous user after merge (Google OAuth):', delErr);
          }
        } catch (mergeError) {
          console.error('Failed to merge anonymous user data (Google OAuth):', mergeError);
          // Don't fail authentication if merge fails, just log the error
        }
      }

      // Generate JWT token
      console.log('Generating JWT token...');
      const jwtToken = generateJWT({
        userId: user.id.toString(),
        email: user.email,
        name: user.name,
        verified: user.email_verified || false
      });
      console.log('JWT token generated successfully');

      return {
        success: true,
        user,
        token: jwtToken
      };
    } catch (error) {
      console.error('Google OAuth callback error:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        error: `Authentication failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Get user information from Google using access token
   */
  private async getUserInfo(accessToken: string): Promise<GoogleUserInfo | null> {
    try {
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch user info from Google');
      }

      const userInfo = await response.json();
      
      return {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        email_verified: userInfo.verified_email || false
      };
    } catch (error) {
      console.error('Error fetching Google user info:', error);
      return null;
    }
  }

  /**
   * Create or update user in database
   */
  private async createOrUpdateUser(googleUser: GoogleUserInfo): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUsers = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, googleUser.email))
        .limit(1);

      const now = new Date(); // Use Date object, not ISO string

      if (existingUsers.length > 0) {
        // Update existing user - keep existing data but ensure email is verified
        console.log(`Updating existing user: ${googleUser.email}`);
        const updatedUsers = await db
          .update(usersTable)
          .set({
            name: googleUser.name, // Update name from Google
            email_verified: true, // Google emails are verified
            updated_at: now,
          })
          .where(eq(usersTable.email, googleUser.email))
          .returning();

        const user = updatedUsers[0];
        console.log(`User updated successfully:`, { id: user?.id, email: user?.email, name: user?.name });
        return user ? {
          ...user,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString()
        } : null;
      } else {
        // Create new user
        console.log(`Creating new user: ${googleUser.email}`);
        const newUsers = await db
          .insert(usersTable)
          .values({
            email: googleUser.email,
            name: googleUser.name,
            date_of_birth: '1990-01-01', // Default date for Google users
            email_verified: true, // Google emails are verified
            created_at: now,
            updated_at: now,
          })
          .returning();

        const user = newUsers[0];
        console.log(`New user created successfully:`, { id: user?.id, email: user?.email, name: user?.name });
        return user ? {
          ...user,
          created_at: user.created_at.toISOString(),
          updated_at: user.updated_at.toISOString()
        } : null;
      }
    } catch (error) {
      console.error('Error creating/updating user:', error);
      console.error('Google user data:', googleUser);
      return null;
    }
  }

  /**
   * Verify Google ID token (alternative method)
   */
  async verifyIdToken(idToken: string): Promise<GoogleUserInfo | null> {
    try {
      const ticket = await this.oauth2Client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      
      if (!payload) {
        return null;
      }

      return {
        id: payload.sub,
        email: payload.email!,
        name: payload.name!,
        picture: payload.picture,
        email_verified: payload.email_verified || false
      };
    } catch (error) {
      console.error('Error verifying Google ID token:', error);
      return null;
    }
  }
}
