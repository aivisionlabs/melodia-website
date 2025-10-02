import { NextRequest, NextResponse } from 'next/server';
import { generateRequestId } from '@/lib/auth/jwt';

// In-memory rate limiting (for development)
// In production, this should use Redis or a database
const requests = new Map<string, { count: number; resetTime: number }>();

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
}

// Rate limiting middleware
export const rateLimit = (config: RateLimitConfig) => {
  return (handler: Function) => {
    return async (request: NextRequest, context: any) => {
      const requestId = (request as any).requestId || generateRequestId();
      
      // Generate rate limit key
      const key = config.keyGenerator 
        ? config.keyGenerator(request)
        : getClientIP(request) || 'anonymous';
      
      const now = Date.now();
      const windowStart = now - config.windowMs;
      
      // Clean up expired entries
      for (const [k, v] of requests.entries()) {
        if (v.resetTime < windowStart) {
          requests.delete(k);
        }
      }
      
      // Get or create current request data
      const current = requests.get(key) || { 
        count: 0, 
        resetTime: now + config.windowMs 
      };
      
      // Check if rate limit exceeded
      if (current.count >= config.maxRequests) {
        const retryAfter = Math.ceil((current.resetTime - now) / 1000);
        
        return NextResponse.json(
          {
            success: false,
            error: {
              message: 'Too many requests. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
              details: {
                retryAfter
              }
            },
            meta: {
              timestamp: new Date().toISOString(),
              requestId
            }
          },
          { 
            status: 429,
            headers: {
              'Retry-After': retryAfter.toString(),
              'X-RateLimit-Limit': config.maxRequests.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': Math.ceil(current.resetTime / 1000).toString()
            }
          }
        );
      }
      
      // Increment request count
      current.count++;
      requests.set(key, current);
      
      // Add rate limit headers to response
      const response = await handler(request, context);
      
      if (response instanceof NextResponse) {
        response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
        response.headers.set('X-RateLimit-Remaining', (config.maxRequests - current.count).toString());
        response.headers.set('X-RateLimit-Reset', Math.ceil(current.resetTime / 1000).toString());
      }
      
      return response;
    };
  };
};

// Get client IP address
const getClientIP = (request: NextRequest): string | null => {
  // Check various headers for client IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  // Fallback - in Next.js Edge Runtime, IP may not be directly available
  // This would typically be handled by deployment platform (Vercel, etc.)
  return null;
};

// Pre-configured rate limiters
export const signupRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3, // 3 signup attempts per hour per IP
});

export const verificationRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 5, // 5 verification requests per hour per user
  keyGenerator: (request) => {
    const user = (request as any).user;
    return user ? `verify_${user.userId}` : getClientIP(request) || 'anonymous';
  }
});

export const otpAttemptRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  maxRequests: 5, // 5 OTP attempts per 10 minutes per user
  keyGenerator: (request) => {
    const user = (request as any).user;
    return user ? `otp_${user.userId}` : getClientIP(request) || 'anonymous';
  }
});
