// OTP Service Interface - Exchangeable contract for Redis/Database implementations
export interface OTPService {
  generateCode(): string;
  storeCode(userId: string, code: string): Promise<void>;
  verifyCode(userId: string, code: string): Promise<{ valid: boolean; attemptsRemaining: number }>;
  incrementAttempts(userId: string): Promise<number>;
  clearCode(userId: string): Promise<void>;
}

// Database implementation of OTP service
import { db } from '@/lib/db';
import { emailVerificationCodesTable } from '@/lib/db/schema';
import { eq, and, gt } from 'drizzle-orm';

export class DatabaseOTPService implements OTPService {
  generateCode(): string {
    // Use fixed code for development environment
    if (process.env.NODE_ENV === 'development') {
      return '123456';
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeCode(userId: string, code: string): Promise<void> {
    const userIdNum = parseInt(userId);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Delete existing codes for user
    await db
      .delete(emailVerificationCodesTable)
      .where(eq(emailVerificationCodesTable.user_id, userIdNum));

    // Insert new code
    await db
      .insert(emailVerificationCodesTable)
      .values({
        user_id: userIdNum,
        code,
        expires_at: expiresAt,
        attempts: 0,
      });
  }

  async verifyCode(userId: string, code: string): Promise<{ valid: boolean; attemptsRemaining: number }> {
    const userIdNum = parseInt(userId);
    const now = new Date();

    const result = await db
      .select()
      .from(emailVerificationCodesTable)
      .where(
        and(
          eq(emailVerificationCodesTable.user_id, userIdNum),
          eq(emailVerificationCodesTable.code, code),
          gt(emailVerificationCodesTable.expires_at, now)
        )
      )
      .limit(1);

    if (result.length === 0) {
      return { valid: false, attemptsRemaining: 0 };
    }

    const record = result[0];
    const attemptsRemaining = Math.max(0, 5 - record.attempts - 1);
    return { valid: true, attemptsRemaining };
  }

  async incrementAttempts(userId: string): Promise<number> {
    const userIdNum = parseInt(userId);
    const now = new Date();

    // Get current record
    const result = await db
      .select()
      .from(emailVerificationCodesTable)
      .where(
        and(
          eq(emailVerificationCodesTable.user_id, userIdNum),
          gt(emailVerificationCodesTable.expires_at, now)
        )
      )
      .limit(1);

    if (result.length === 0) return 0;

    const record = result[0];
    const newAttempts = record.attempts + 1;

    if (newAttempts >= 5) {
      // Delete record if max attempts reached
      await db
        .delete(emailVerificationCodesTable)
        .where(eq(emailVerificationCodesTable.id, record.id));
      return 0;
    }

    // Update attempts
    await db
      .update(emailVerificationCodesTable)
      .set({ attempts: newAttempts })
      .where(eq(emailVerificationCodesTable.id, record.id));

    return Math.max(0, 5 - newAttempts);
  }

  async clearCode(userId: string): Promise<void> {
    const userIdNum = parseInt(userId);
    await db
      .delete(emailVerificationCodesTable)
      .where(eq(emailVerificationCodesTable.user_id, userIdNum));
  }
}

// Redis implementation (for future use)
export class RedisOTPService implements OTPService {
  constructor(private redis: any) {} // Redis client type

  generateCode(): string {
    // Use fixed code for development environment
    if (process.env.DEMO_MODE === 'true') {
      return '123456';
    }
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeCode(userId: string, code: string): Promise<void> {
    const otpData = {
      userId,
      code,
      attempts: 0,
      createdAt: Date.now()
    };
    
    await this.redis.setex(`otp:${userId}`, 600, JSON.stringify(otpData)); // 10 minutes TTL
  }

  async verifyCode(userId: string, code: string): Promise<{ valid: boolean; attemptsRemaining: number }> {
    const data = await this.redis.get(`otp:${userId}`);
    if (!data) {
      return { valid: false, attemptsRemaining: 0 };
    }

    const otpData = JSON.parse(data);
    const isValid = otpData.code === code;
    const attemptsRemaining = Math.max(0, 5 - otpData.attempts - 1);

    return { valid: isValid, attemptsRemaining };
  }

  async incrementAttempts(userId: string): Promise<number> {
    const data = await this.redis.get(`otp:${userId}`);
    if (!data) return 0;

    const otpData = JSON.parse(data);
    otpData.attempts += 1;

    if (otpData.attempts >= 5) {
      await this.redis.del(`otp:${userId}`);
      return 0;
    }

    const ttl = await this.redis.ttl(`otp:${userId}`);
    await this.redis.setex(`otp:${userId}`, ttl, JSON.stringify(otpData));
    
    return Math.max(0, 5 - otpData.attempts);
  }

  async clearCode(userId: string): Promise<void> {
    await this.redis.del(`otp:${userId}`);
  }
}

// Factory function to create OTP service
export const createOTPService = (): OTPService => {
  // For now, always use database implementation
  // Later, can switch based on environment variable
  return new DatabaseOTPService();
  
  // Future Redis implementation:
  // if (process.env.REDIS_URL) {
  //   const redis = new Redis(process.env.REDIS_URL);
  //   return new RedisOTPService(redis);
  // }
  // return new DatabaseOTPService();
};
