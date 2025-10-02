-- Migration: Add signup flow schema
-- Date: 2024-10-02
-- Description: Add fields to users table and create email verification codes table

-- Update users table for signup flow
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS phone_number TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Update existing users with default values for new required fields
UPDATE users 
SET name = 'User ' || id::text 
WHERE name IS NULL;

UPDATE users 
SET date_of_birth = '1990-01-01' 
WHERE date_of_birth IS NULL;

-- Now make the columns NOT NULL (after setting default values)
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
ALTER TABLE users ALTER COLUMN date_of_birth SET NOT NULL;

-- Make password_hash optional (for signup flow without password)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Create email verification codes table
CREATE TABLE IF NOT EXISTS email_verification_codes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT verification_code_format CHECK (code ~ '^[0-9]{6}$'),
  CONSTRAINT max_attempts CHECK (attempts <= 5)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_verification_codes_user_id ON email_verification_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON email_verification_codes(expires_at);

-- Add constraints (using DO block for compatibility)
DO $$
BEGIN
    -- Add email format constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_email_format'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_email_format 
        CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');
    END IF;

    -- Add age constraint (13-120 years old)
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_age_check'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_age_check 
        CHECK (date_of_birth <= CURRENT_DATE - INTERVAL '13 years');
    END IF;

    -- Add name length constraint
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'users_name_length'
    ) THEN
        ALTER TABLE users 
        ADD CONSTRAINT users_name_length 
        CHECK (LENGTH(name) >= 2 AND LENGTH(name) <= 100);
    END IF;
END $$;
