import jwt from 'jsonwebtoken';

// JWT payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  verified: boolean;
  purpose?: string; // Optional purpose field for different token types
  iat: number;
  exp: number;
}

// Generate JWT token
export const generateJWT = (payload: Omit<JWTPayload, 'iat' | 'exp'>): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '100d',
    issuer: 'melodia-app'
  });
};

// Verify JWT token
export const verifyJWT = (token: string): JWTPayload | null => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }

    return jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

// Generate request ID for tracking
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
