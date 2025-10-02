import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { usersTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { withOptionalAuth } from '@/lib/auth/middleware';
import { generateRequestId } from '@/lib/auth/jwt';
import type { ApiResponse, User } from '@/types';

// Helper functions for safe date formatting
const formatDateForResponse = (date: any): string => {
  if (!date) return '';
  
  try {
    // If it's already a Date object
    if (date instanceof Date && !isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
    
    // If it's a string, try to parse it
    if (typeof date === 'string') {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }
      
      // Try to parse as date
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    // Fallback: return empty string for invalid dates
    console.warn('Invalid date value:', date, 'Type:', typeof date);
    return '';
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', date);
    return '';
  }
};

const formatDateTimeForResponse = (dateTime: any): string => {
  if (!dateTime) return new Date().toISOString();
  
  try {
    // If it's already a Date object
    if (dateTime instanceof Date && !isNaN(dateTime.getTime())) {
      return dateTime.toISOString();
    }
    
    // If it's a string, try to parse it
    if (typeof dateTime === 'string') {
      const parsedDate = new Date(dateTime);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate.toISOString();
      }
    }
    
    // Fallback: return current timestamp for invalid dates
    console.warn('Invalid datetime value:', dateTime, 'Type:', typeof dateTime);
    return new Date().toISOString();
  } catch (error) {
    console.error('Error formatting datetime:', error, 'Input:', dateTime);
    return new Date().toISOString();
  }
};

// Get current user endpoint
const handler = withOptionalAuth(
  async (request: NextRequest) => {
    const requestId = (request as any).requestId || generateRequestId();
    const user = (request as any).user;
    
    try {
      // If no user in JWT, return unauthenticated
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Not authenticated',
              code: 'NOT_AUTHENTICATED'
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { status: 401 }
        );
      }

      // Get fresh user data from database
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

      // Format user data for response
      const userResponse: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        date_of_birth: formatDateForResponse(userData.date_of_birth), // YYYY-MM-DD format
        phone_number: userData.phone_number,
        email_verified: userData.email_verified,
        created_at: formatDateTimeForResponse(userData.created_at),
        updated_at: formatDateTimeForResponse(userData.updated_at)
      };

      return NextResponse.json(
        {
          success: true,
          data: {
            user: userResponse
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId
          }
        },
        { status: 200 }
      );

    } catch (error) {
      console.error('Get user error:', error);
      
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
);

export { handler as GET };
