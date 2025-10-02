import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, JWTPayload } from './jwt';
import { generateRequestId } from './jwt';

// Extend NextRequest to include user data
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      requestId?: string;
    }
  }
}

// Auth middleware wrapper
export const withAuth = (handler: Function) => {
  return async (request: NextRequest, context: any) => {
    try {
      const requestId = generateRequestId();
      
      // Get token from cookie
      const token = request.cookies.get('auth-token')?.value;
      
      if (!token) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              message: 'Authentication required', 
              code: 'AUTH_REQUIRED' 
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { status: 401 }
        );
      }

      // Verify JWT token
      const payload = verifyJWT(token);
      if (!payload) {
        return NextResponse.json(
          { 
            success: false, 
            error: { 
              message: 'Invalid or expired token', 
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

      // Add user and requestId to request context
      (request as any).user = payload;
      (request as any).requestId = requestId;
      
      return handler(request, context);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return NextResponse.json(
        { 
          success: false, 
          error: { 
            message: 'Authentication failed', 
            code: 'AUTH_FAILED' 
          },
          meta: {
            timestamp: new Date().toISOString(),
            requestId: generateRequestId()
          }
        },
        { status: 401 }
      );
    }
  };
};

// Optional auth middleware (doesn't fail if no token)
export const withOptionalAuth = (handler: Function) => {
  return async (request: NextRequest, context: any) => {
    const requestId = generateRequestId();
    const token = request.cookies.get('auth-token')?.value;
    
    if (token) {
      const payload = verifyJWT(token);
      if (payload) {
        (request as any).user = payload;
      }
    }
    
    (request as any).requestId = requestId;
    return handler(request, context);
  };
};
