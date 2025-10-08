import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { db } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { User } from "@/types";

export const authOptions: NextAuthOptions = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        if (account?.provider === "google" && profile?.email) {
          // Check if user already exists
          const existingUser = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, profile.email))
            .limit(1);

          if (existingUser.length === 0) {
            // Create new user with Google data
            await db.insert(usersTable).values({
              email: profile.email,
              name: profile.name || profile.email.split('@')[0],
              email_verified: true, // Google emails are pre-verified
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          } else {
            // Update existing user to mark as verified
            await db
              .update(usersTable)
              .set({
                email_verified: true,
                updated_at: new Date().toISOString(),
              })
              .where(eq(usersTable.email, profile.email));
          }
        }
        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token;
        token.provider = account.provider;
      }
      
      if (user) {
        token.userId = user.id;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token && session.user) {
        session.user.id = token.userId as string;
        session.accessToken = token.accessToken as string;
        session.provider = token.provider as string;
      }
      
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Redirect to profile page after successful authentication
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return `${baseUrl}/profile/logged-in`;
    }
  },
  pages: {
    signIn: '/profile/login',
    error: '/profile/login',
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
