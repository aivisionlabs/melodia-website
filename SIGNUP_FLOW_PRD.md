# Melodia Signup Flow - Product Requirements Document (PRD)

## 📋 Overview

This document outlines the complete signup flow for Melodia, including user registration, email verification, and account creation success states with comprehensive backend API implementation.

## 🔍 Plan Analysis & Missing Pieces Identified

### ✅ **Strengths of Current Plan**
- Clear separation of concerns (validation → API → redirect)
- Proper JWT authentication with HTTP-only cookies
- Dual email service implementation (SendGrid + Mock)
- REST API conventions
- OTP storage with user FK relationship

### ⚠️ **Missing Pieces & Recommendations**

#### 1. **OTP Storage Solution**
**Recommendation**: Use Redis for OTP storage instead of database table
```typescript
// Better approach: Redis with TTL
interface OTPData {
  userId: string;
  code: string;
  attempts: number;
  createdAt: number;
}

// Key: `otp:${userId}`, TTL: 10 minutes
```
**Why**: Automatic expiration, better performance, no cleanup needed

#### 2. **Rate Limiting Strategy**
**Missing**: Rate limiting for signup and OTP requests
- Signup: 3 attempts per IP per hour
- Send OTP: 5 requests per email per hour
- Verify OTP: 5 attempts per email per 10 minutes

#### 3. **Email Verification State Management**
**Missing**: Handle edge cases:
- User tries to signup with already registered but unverified email
- User requests new OTP before previous expires
- User verifies email but JWT expires

#### 4. **Security Considerations**
**Missing**:
- CSRF protection for state-changing operations
- Input sanitization beyond validation
- Audit logging for security events
- Account lockout after multiple failed attempts

#### 5. **Error Recovery Flows**
**Missing**:
- What if email service fails during signup?
- How to handle partial user creation?
- Database transaction rollback strategy

## 🎯 User Journey

### Phase 1: Initial Signup Form
**Current State**: ✅ Implemented (`/profile/signup`)
- User fills out registration form (name, DOB, email, phone)
- Form validation ensures all required fields are completed
- User clicks "Continue" button

### Phase 2: Database Entry & Email Trigger
**Status**: 🔄 To Be Implemented
- API creates user entry in database
- API returns 200 success response
- Email verification code is generated and sent
- User is redirected to OTP verification page

### Phase 3: Email Verification (OTP)
**Status**: 🔄 To Be Implemented
- User lands on OTP verification page (`/profile/signup/verify`)
- Page automatically sends verification email on load
- User enters 6-digit verification code
- Resend functionality with 60-second cooldown
- Verify button validates the code

### Phase 4: Account Creation Success
**Status**: 🔄 To Be Implemented
- Success page confirms account creation (`/profile/signup/success`)
- 5-second countdown timer with automatic redirect
- Redirect to home page after countdown

## 🔧 Technical Requirements

### 1. Database Schema

#### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  date_of_birth DATE NOT NULL,
  phone_number VARCHAR(20),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT users_age_check CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '13 years'),
  CONSTRAINT users_name_length CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100)
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verified ON users(email_verified);
```

#### OTP Storage (Alternative Approaches)

**Option A: Redis (Recommended)**
```typescript
// Redis Key-Value Storage
interface OTPData {
  userId: string;
  code: string;
  attempts: number;
  createdAt: number;
}

// Key pattern: `otp:${userId}`
// TTL: 600 seconds (10 minutes)
```

**Option B: Database Table (If Redis not available)**
```sql
CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code VARCHAR(6) NOT NULL,
  attempts INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT verification_code_format CHECK (code ~ '^[0-9]{6}$'),
  CONSTRAINT max_attempts CHECK (attempts <= 5)
);

-- Indexes
CREATE INDEX idx_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX idx_verification_codes_expires_at ON email_verification_codes(expires_at);

-- Auto-cleanup expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM email_verification_codes WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Schedule cleanup every 5 minutes
SELECT cron.schedule('cleanup-expired-codes', '*/5 * * * *', 'SELECT cleanup_expired_codes();');
```

### 2. API Endpoints

#### POST `/api/auth/signup`
**Purpose**: Create user account and initiate verification process
**Auth Required**: ❌ No
**Rate Limit**: 3 requests per IP per hour

```typescript
// Request Body
interface SignupRequest {
  name: string;           // 2-100 chars, letters and spaces only
  email: string;          // Valid email format, lowercase
  dateOfBirth: string;    // YYYY-MM-DD, age 13-120
  phoneNumber?: string;   // Optional, valid phone format
}

// Success Response (201 Created)
{
  success: true,
  data: {
    userId: string,
    email: string,
    token: string // JWT set in HTTP-only cookie
  },
  meta: {
    timestamp: string,
    requestId: string
  }
}

// Error Responses
// 400 Bad Request - Validation errors
{
  success: false,
  error: {
    message: "Validation failed",
    code: "VALIDATION_ERROR",
    details: {
      "email": "Please enter a valid email address",
      "name": "Name must be at least 2 characters"
    }
  }
}

// 409 Conflict - Email already exists
{
  success: false,
  error: {
    message: "An account with this email already exists",
    code: "EMAIL_ALREADY_EXISTS"
  }
}

// 429 Too Many Requests - Rate limit exceeded
{
  success: false,
  error: {
    message: "Too many signup attempts. Please try again later.",
    code: "RATE_LIMIT_EXCEEDED"
  }
}
```

**Business Logic**:
1. Validate all input fields (server-side)
2. Check if email already exists
3. If email exists but not verified → allow re-signup (update existing record)
4. If email exists and verified → return 409 error
5. Create/update user record with `email_verified: false`
6. Generate JWT token and set HTTP-only cookie
7. Trigger email verification process
8. Return success response

#### POST `/api/auth/send-verification`
**Purpose**: Send/resend verification email
**Auth Required**: ✅ Yes (JWT from signup)
**Rate Limit**: 5 requests per user per hour

```typescript
// Request Body
interface SendVerificationRequest {
  // No body needed - user identified from JWT
}

// Success Response (200 OK)
{
  success: true,
  data: {
    message: "Verification code sent to your email",
    canResendAt: string // ISO timestamp when next resend allowed
  }
}

// Error Responses
// 401 Unauthorized - Invalid/missing JWT
{
  success: false,
  error: {
    message: "Authentication required",
    code: "AUTH_REQUIRED"
  }
}

// 409 Conflict - Already verified
{
  success: false,
  error: {
    message: "Email already verified",
    code: "ALREADY_VERIFIED"
  }
}

// 429 Too Many Requests
{
  success: false,
  error: {
    message: "Please wait before requesting another code",
    code: "RATE_LIMIT_EXCEEDED",
    details: {
      retryAfter: number // seconds to wait
    }
  }
}
```

**Business Logic**:
1. Verify JWT token from cookie
2. Check if user email already verified
3. Check rate limiting (5 requests per hour per user)
4. Generate 6-digit OTP code
5. Store OTP in Redis/database with 10-minute expiration
6. Send email via configured service (SendGrid/Mock)
7. Return success response

#### POST `/api/auth/verify-email`
**Purpose**: Verify email with OTP code
**Auth Required**: ✅ Yes (JWT from signup)
**Rate Limit**: 5 attempts per user per 10 minutes

```typescript
// Request Body
interface VerifyEmailRequest {
  code: string; // 6-digit numeric code
}

// Success Response (200 OK)
{
  success: true,
  data: {
    message: "Email verified successfully",
    user: {
      id: string,
      email: string,
      name: string,
      emailVerified: true
    }
  }
}

// Error Responses
// 400 Bad Request - Invalid code format
{
  success: false,
  error: {
    message: "Invalid verification code format",
    code: "INVALID_CODE_FORMAT"
  }
}

// 400 Bad Request - Wrong code
{
  success: false,
  error: {
    message: "Invalid verification code",
    code: "INVALID_CODE",
    details: {
      attemptsRemaining: number
    }
  }
}

// 410 Gone - Expired code
{
  success: false,
  error: {
    message: "Verification code has expired",
    code: "CODE_EXPIRED"
  }
}

// 423 Locked - Too many attempts
{
  success: false,
  error: {
    message: "Too many failed attempts. Please request a new code.",
    code: "TOO_MANY_ATTEMPTS"
  }
}
```

**Business Logic**:
1. Verify JWT token from cookie
2. Validate code format (6 digits)
3. Check rate limiting (5 attempts per 10 minutes)
4. Retrieve OTP from Redis/database
5. Compare provided code with stored code
6. If valid:
   - Update user record: `email_verified: true`
   - Clear OTP from storage
   - Update JWT token with verified status
   - Return success response
7. If invalid:
   - Increment attempt counter
   - Return appropriate error

### 3. Pages & Components

#### 3.1 OTP Verification Page (`/profile/signup/verify`)
**Design Reference**: `sign_up:email_verification_input/code.html`

**Features**:
- 6 individual input fields for OTP code
- Auto-focus next field on input
- Auto-focus previous field on backspace
- Paste support for full 6-digit code
- "Didn't receive code?" section
- "Resend Code" button with 60-second cooldown
- Loading states during API calls

**Components Needed**:
- `OTPInput` - 6-digit code input component
- `ResendButton` - Button with countdown timer
- `LoadingSpinner` - Common loading component

#### 3.2 Success Page (`/profile/signup/success`)
**Design Reference**: `sign_up:account-created-success/code.html`

**Features**:
- Success checkmark icon
- "Account Created!" heading
- Descriptive success message
- 5-second countdown timer with circular progress
- Automatic redirect to home page

**Components Needed**:
- `SuccessIcon` - Checkmark SVG component
- `CountdownTimer` - Circular progress timer
- Auto-redirect functionality

### 4. Service Layer Architecture

#### Email Service Implementation
```typescript
// Service interface
export interface EmailService {
  sendVerificationEmail(email: string, code: string, name: string): Promise<boolean>;
}

// SendGrid implementation
export class SendGridEmailService implements EmailService {
  constructor(private apiKey: string, private fromEmail: string) {}

  async sendVerificationEmail(email: string, code: string, name: string): Promise<boolean> {
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(this.apiKey);

    const msg = {
      to: email,
      from: this.fromEmail,
      subject: 'Verify your Melodia account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #073B4C;">Welcome to Melodia, ${name}!</h1>
          <p>Please verify your email address by entering this code:</p>
          <div style="background: #FFD166; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #073B4C; border-radius: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    try {
      await sgMail.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }
}

// Mock implementation for development
export class MockEmailService implements EmailService {
  async sendVerificationEmail(email: string, code: string, name: string): Promise<boolean> {
    console.log(`
      📧 Mock Email Service
      To: ${email}
      Subject: Verify your Melodia account
      
      Hi ${name},
      Your verification code is: ${code}
      
      This code expires in 10 minutes.
    `);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return true;
  }
}

// Factory for service selection
export const createEmailService = (): EmailService => {
  if (process.env.NODE_ENV === 'production' && process.env.SENDGRID_API_KEY) {
    return new SendGridEmailService(
      process.env.SENDGRID_API_KEY,
      process.env.FROM_EMAIL || 'noreply@melodia.com'
    );
  }
  return new MockEmailService();
};
```

#### OTP Service Implementation
```typescript
// OTP service interface
export interface OTPService {
  generateCode(): string;
  storeCode(userId: string, code: string): Promise<void>;
  verifyCode(userId: string, code: string): Promise<{ valid: boolean; attemptsRemaining: number }>;
  incrementAttempts(userId: string): Promise<number>;
  clearCode(userId: string): Promise<void>;
}

// Redis implementation (recommended)
export class RedisOTPService implements OTPService {
  constructor(private redis: Redis) {}

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeCode(userId: string, code: string): Promise<void> {
    const otpData: OTPData = {
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

    const otpData: OTPData = JSON.parse(data);
    const isValid = otpData.code === code;
    const attemptsRemaining = Math.max(0, 5 - otpData.attempts - 1);

    return { valid: isValid, attemptsRemaining };
  }

  async incrementAttempts(userId: string): Promise<number> {
    const data = await this.redis.get(`otp:${userId}`);
    if (!data) return 0;

    const otpData: OTPData = JSON.parse(data);
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

// Database fallback implementation
export class DatabaseOTPService implements OTPService {
  constructor(private db: Database) {}

  generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async storeCode(userId: string, code: string): Promise<void> {
    // Delete existing codes for user
    await this.db
      .from('email_verification_codes')
      .delete()
      .eq('user_id', userId);

    // Insert new code
    await this.db
      .from('email_verification_codes')
      .insert({
        user_id: userId,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });
  }

  async verifyCode(userId: string, code: string): Promise<{ valid: boolean; attemptsRemaining: number }> {
    const { data } = await this.db
      .from('email_verification_codes')
      .select('*')
      .eq('user_id', userId)
      .eq('code', code)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!data) {
      return { valid: false, attemptsRemaining: 0 };
    }

    const attemptsRemaining = Math.max(0, 5 - data.attempts - 1);
    return { valid: true, attemptsRemaining };
  }

  async incrementAttempts(userId: string): Promise<number> {
    const { data } = await this.db
      .from('email_verification_codes')
      .select('attempts')
      .eq('user_id', userId)
      .single();

    if (!data) return 0;

    const newAttempts = data.attempts + 1;
    
    if (newAttempts >= 5) {
      await this.db
        .from('email_verification_codes')
        .delete()
        .eq('user_id', userId);
      return 0;
    }

    await this.db
      .from('email_verification_codes')
      .update({ attempts: newAttempts })
      .eq('user_id', userId);

    return Math.max(0, 5 - newAttempts);
  }

  async clearCode(userId: string): Promise<void> {
    await this.db
      .from('email_verification_codes')
      .delete()
      .eq('user_id', userId);
  }
}
```

### 5. Common Loading Pattern

**Requirement**: Consistent loading states across all API calls

**Design Requirements**:
- Spinner/loading indicator during API requests
- Disabled form elements during loading
- Loading text feedback ("Sending...", "Verifying...", etc.)
- Error handling with user-friendly messages

**Component**: `LoadingSpinner`
```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
}

// Usage patterns
<LoadingSpinner size="md" text="Creating account..." />
<LoadingSpinner size="sm" text="Sending code..." />
<LoadingSpinner size="lg" text="Verifying..." />
```

## 🎨 Design System Requirements

### Color Palette (from design reference)
```css
:root {
  --primary: #FFD166;     /* Yellow - buttons, focus states */
  --secondary: #FDFDFD;   /* Off-white - backgrounds */
  --accent: #EF476F;      /* Coral - links, resend button */
  --text: #073B4C;        /* Dark blue - main text */
}
```

### Typography
- **Display Font**: Poppins (headings, buttons)
- **Body Font**: Montserrat (body text, inputs)

### Component Styling

#### OTP Input Fields
```css
.code-input {
  width: 2.75rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: 1px solid theme('colors.text/20');
  background-color: white;
  caret-color: theme('colors.accent');
}

.code-input:focus {
  outline: none;
  border-color: theme('colors.primary');
  box-shadow: 0 0 0 2px theme('colors.primary');
}
```

#### Buttons
```css
/* Primary Button (Verify, Continue) */
.btn-primary {
  width: 100%;
  height: 3.5rem;
  background: var(--primary);
  color: var(--text);
  font-family: 'Poppins', sans-serif;
  font-weight: 700;
  font-size: 1.125rem;
  border-radius: 9999px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #FFE066; /* Lighter yellow */
}
```

## 🔄 State Management

### Signup Flow State
```typescript
interface SignupFlowState {
  currentStep: 'form' | 'verify' | 'success';
  userEmail: string;
  isLoading: boolean;
  error: string | null;
  resendCooldown: number; // seconds remaining
  verificationAttempts: number;
}
```

### Form State (OTP Verification)
```typescript
interface OTPFormState {
  code: string[]; // Array of 6 digits
  isSubmitting: boolean;
  error: string | null;
  canResend: boolean;
  resendCountdown: number;
}
```

## 📱 User Experience Flow

### Happy Path
1. **Signup Form** → User fills form → Clicks "Continue"
2. **Loading State** → "Creating account..." spinner
3. **API Success** → Redirect to `/profile/signup/verify`
4. **Verify Page Load** → Auto-send verification email
5. **Email Sent** → Show "Check your email" message
6. **User Enters Code** → Click "Verify"
7. **Verification Success** → Redirect to `/profile/signup/success`
8. **Success Page** → 5-second countdown → Redirect to home

### Error Scenarios
1. **Email Already Exists** → Show error on signup form
2. **Invalid OTP Code** → Show error below OTP inputs
3. **Expired OTP Code** → Show error with resend option
4. **Network Error** → Show retry option
5. **Too Many Attempts** → Show cooldown message

## 🚀 Implementation Phases

### Phase 1: Backend Infrastructure (Week 1)
- [ ] **Database Setup**
  - [ ] Create users table with constraints
  - [ ] Set up Redis for OTP storage (or database fallback)
  - [ ] Create database indexes for performance
- [ ] **Service Layer**
  - [ ] Implement EmailService interface (SendGrid + Mock)
  - [ ] Implement OTPService interface (Redis + Database)
  - [ ] Create JWT utilities and auth middleware
- [ ] **API Endpoints**
  - [ ] POST `/api/auth/signup` with validation and rate limiting
  - [ ] POST `/api/auth/send-verification` with auth guard
  - [ ] POST `/api/auth/verify-email` with attempt tracking

### Phase 2: Frontend Components (Week 2)
- [ ] **OTP Verification Page** (`/profile/signup/verify`)
  - [ ] Create OTPInput component with auto-focus
  - [ ] Implement ResendButton with 60-second countdown
  - [ ] Add loading states and error handling
  - [ ] Auto-send verification email on page load
- [ ] **Success Page** (`/profile/signup/success`)
  - [ ] Create CountdownTimer component with circular progress
  - [ ] Implement auto-redirect after 5 seconds
  - [ ] Add success animations and messaging

### Phase 3: Integration & Flow (Week 3)
- [ ] **Complete Flow Integration**
  - [ ] Connect signup form to API
  - [ ] Implement proper navigation between pages
  - [ ] Add consistent loading patterns
  - [ ] Handle all error scenarios
- [ ] **Security & Performance**
  - [ ] Add CSRF protection
  - [ ] Implement proper input sanitization
  - [ ] Add audit logging for security events
  - [ ] Optimize API response times

### Phase 4: Testing & Refinement (Week 4)
- [ ] **Comprehensive Testing**
  - [ ] Unit tests for all API endpoints
  - [ ] Integration tests for complete flow
  - [ ] E2E tests for user journey
  - [ ] Load testing for rate limits
- [ ] **Edge Case Handling**
  - [ ] Network failure recovery
  - [ ] Partial state recovery
  - [ ] Cross-browser compatibility
  - [ ] Mobile responsiveness

## 🔄 Edge Cases & Error Scenarios

### 1. **Duplicate Email Scenarios**
```typescript
// Scenario A: Email exists and verified
if (existingUser && existingUser.email_verified) {
  return 409; // "Account already exists"
}

// Scenario B: Email exists but not verified
if (existingUser && !existingUser.email_verified) {
  // Update existing record, allow re-signup
  await updateUser(existingUser.id, newUserData);
  // Continue with normal flow
}
```

### 2. **Email Service Failure**
```typescript
// Graceful degradation
try {
  await emailService.sendVerificationEmail(email, code, name);
} catch (error) {
  // Log error but don't fail signup
  logger.error('Email service failed', error, { userId, email });
  
  // Store code anyway for manual verification
  await otpService.storeCode(userId, code);
  
  // Return success with warning
  return {
    success: true,
    data: { userId, email },
    warning: "Account created but verification email may be delayed"
  };
}
```

### 3. **JWT Expiration During Verification**
```typescript
// Handle expired JWT gracefully
if (jwtExpired) {
  return {
    success: false,
    error: {
      code: "SESSION_EXPIRED",
      message: "Your session has expired. Please sign up again.",
      action: "REDIRECT_TO_SIGNUP"
    }
  };
}
```

### 4. **Network Interruption Recovery**
```typescript
// Frontend: Retry mechanism
const retryVerification = async (code: string, retries = 3) => {
  try {
    return await verifyEmail(code);
  } catch (error) {
    if (retries > 0 && error.code === 'NETWORK_ERROR') {
      await delay(1000); // Wait 1 second
      return retryVerification(code, retries - 1);
    }
    throw error;
  }
};
```

### 5. **Database Transaction Rollback**
```typescript
// Ensure atomicity in signup process
const signupWithTransaction = async (userData: SignupData) => {
  const transaction = await db.transaction();
  
  try {
    // Create user
    const user = await transaction.from('users').insert(userData).select().single();
    
    // Generate and store OTP
    const code = otpService.generateCode();
    await otpService.storeCode(user.id, code);
    
    // Send email
    const emailSent = await emailService.sendVerificationEmail(
      user.email, 
      code, 
      user.name
    );
    
    if (!emailSent) {
      throw new Error('Failed to send verification email');
    }
    
    await transaction.commit();
    return user;
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
```

### 6. **Rate Limiting Edge Cases**
```typescript
// Handle rate limit edge cases
const checkRateLimit = async (key: string, limit: number, window: number) => {
  const current = await redis.get(key);
  
  if (!current) {
    await redis.setex(key, window, '1');
    return { allowed: true, remaining: limit - 1 };
  }
  
  const count = parseInt(current);
  if (count >= limit) {
    const ttl = await redis.ttl(key);
    return { 
      allowed: false, 
      remaining: 0, 
      retryAfter: ttl 
    };
  }
  
  await redis.incr(key);
  return { 
    allowed: true, 
    remaining: limit - count - 1 
  };
};
```

## 🔐 Security Implementation Details

### 1. **Input Sanitization**
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeUserInput = (data: SignupRequest): SignupRequest => ({
  name: DOMPurify.sanitize(data.name.trim()),
  email: data.email.toLowerCase().trim(),
  dateOfBirth: data.dateOfBirth.trim(),
  phoneNumber: data.phoneNumber ? DOMPurify.sanitize(data.phoneNumber.trim()) : undefined
});
```

### 2. **CSRF Protection**
```typescript
// Generate CSRF token for forms
export const generateCSRFToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

// Validate CSRF token
export const validateCSRFToken = (token: string, sessionToken: string): boolean => {
  return crypto.timingSafeEqual(
    Buffer.from(token, 'hex'),
    Buffer.from(sessionToken, 'hex')
  );
};
```

### 3. **Audit Logging**
```typescript
interface AuditEvent {
  userId?: string;
  action: string;
  ip: string;
  userAgent: string;
  timestamp: string;
  success: boolean;
  details?: Record<string, any>;
}

const logAuditEvent = async (event: AuditEvent) => {
  await db.from('audit_logs').insert({
    user_id: event.userId,
    action: event.action,
    ip_address: event.ip,
    user_agent: event.userAgent,
    success: event.success,
    details: event.details,
    created_at: new Date().toISOString()
  });
};

// Usage in API endpoints
await logAuditEvent({
  userId: user.id,
  action: 'EMAIL_VERIFICATION_ATTEMPT',
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  success: verificationResult.valid,
  details: { attemptsRemaining: verificationResult.attemptsRemaining }
});
```

## 🔐 Security Considerations

### OTP Security
- 6-digit numeric codes
- 10-minute expiration time
- Maximum 5 verification attempts
- Rate limiting on resend requests (60-second cooldown)

### Data Validation
- Server-side validation for all inputs
- Email format validation
- Phone number format validation (if provided)
- SQL injection prevention

### Error Handling
- Generic error messages to prevent information leakage
- Proper logging for debugging
- Graceful degradation for network issues

## 📊 Success Metrics

### Conversion Metrics
- Signup form completion rate
- Email verification completion rate
- Overall signup flow completion rate
- Time to complete signup process

### Technical Metrics
- API response times
- Email delivery success rate
- Error rates by step
- User drop-off points

---

## 📝 Next Steps

1. **Review and Refine**: Discuss additional requirements and edge cases
2. **Technical Architecture**: Define detailed implementation approach
3. **Component Design**: Create reusable component specifications
4. **API Integration**: Plan email service and database integration
5. **Testing Strategy**: Define unit, integration, and E2E test plans

---

*This PRD will be updated as requirements are refined and implementation details are finalized.*
