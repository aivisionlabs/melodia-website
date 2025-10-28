/**
 * Rate Limiting Configuration
 * Defines rate limits for different endpoints and tiers
 */

export interface RateLimitConfig {
  requests: number;
  windowSeconds: number;
  tier: 'low' | 'medium' | 'high' | 'critical';
}

export const rateLimits: Record<string, RateLimitConfig> = {
  // Authentication endpoints
  'auth.register': {
    requests: 5,
    windowSeconds: 3600, // 1 hour
    tier: 'medium',
  },
  'auth.login': {
    requests: 10,
    windowSeconds: 900, // 15 minutes
    tier: 'medium',
  },
  'auth.verify': {
    requests: 10,
    windowSeconds: 900, // 15 minutes
    tier: 'medium',
  },

  // Song generation endpoints
  'song.create_request': {
    requests: 5,
    windowSeconds: 3600, // 1 hour
    tier: 'high',
  },
  'song.generate_lyrics': {
    requests: 10,
    windowSeconds: 3600, // 1 hour
    tier: 'high',
  },
  'song.generate': {
    requests: 3,
    windowSeconds: 3600, // 1 hour
    tier: 'critical',
  },

  // Payment endpoints
  'payment.create_order': {
    requests: 20,
    windowSeconds: 3600, // 1 hour
    tier: 'medium',
  },

  // Anonymous users (stricter limits)
  'anonymous.request': {
    requests: 3,
    windowSeconds: 3600, // 1 hour
    tier: 'high',
  },

  // Default fallback
  'default': {
    requests: 100,
    windowSeconds: 3600, // 1 hour
    tier: 'low',
  },
};

/**
 * Get rate limit config for an endpoint
 */
export function getRateLimitConfig(endpoint: string): RateLimitConfig {
  return rateLimits[endpoint] || rateLimits['default'];
}

/**
 * Violation thresholds for blocking
 */
export const violationThresholds = {
  temporary_block: 5, // Block for 24 hours after 5 violations
  permanent_block: 10, // Permanent block after 10 violations
};

