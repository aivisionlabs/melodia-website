-- =====================================================
-- ADD PAYMENT COLUMNS TO SONG_REQUESTS TABLE
-- =====================================================
-- This script adds the missing payment-related columns to the song_requests table
-- Run this to fix the database schema mismatch
-- =====================================================

-- Step 1: Create payments table first (if it doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  song_request_id INTEGER REFERENCES song_requests(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT UNIQUE,
  razorpay_order_id TEXT,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Step 2: Create pricing_plans table (if it doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS pricing_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create payment_webhooks table (if it doesn't exist)
-- =====================================================
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id SERIAL PRIMARY KEY,
  razorpay_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payment_id INTEGER REFERENCES payments(id) ON DELETE CASCADE,
  webhook_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Step 4: Add missing columns to song_requests table
-- =====================================================

-- Add payment_id column
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL;

-- Add payment_status column
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';

-- Add payment_required column
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS payment_required BOOLEAN DEFAULT true;

-- Step 5: Add missing columns to songs table
-- =====================================================

-- Add payment_id column to songs table
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS payment_id INTEGER REFERENCES payments(id) ON DELETE SET NULL;

-- Step 6: Create indexes for better performance
-- =====================================================

-- Payments table indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_song_request_id ON payments(song_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- Pricing plans table indexes
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);

-- Payment webhooks table indexes
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_payment_id ON payment_webhooks(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_type ON payment_webhooks(event_type);

-- Song requests payment columns indexes
CREATE INDEX IF NOT EXISTS idx_song_requests_payment_id ON song_requests(payment_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_payment_status ON song_requests(payment_status);

-- Songs payment column indexes
CREATE INDEX IF NOT EXISTS idx_songs_payment_id ON songs(payment_id);

-- Step 7: Add column comments for documentation
-- =====================================================

-- Payments table comments
COMMENT ON TABLE payments IS 'Payment records for song generation requests';
COMMENT ON COLUMN payments.razorpay_payment_id IS 'Razorpay payment ID from payment gateway';
COMMENT ON COLUMN payments.razorpay_order_id IS 'Razorpay order ID from payment gateway';
COMMENT ON COLUMN payments.amount IS 'Payment amount in the specified currency';
COMMENT ON COLUMN payments.status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN payments.payment_method IS 'Payment method used: card, netbanking, upi, etc.';
COMMENT ON COLUMN payments.metadata IS 'Additional payment metadata and gateway responses';

-- Pricing plans table comments
COMMENT ON TABLE pricing_plans IS 'Available pricing plans for song generation';
COMMENT ON COLUMN pricing_plans.features IS 'JSON array of features included in this plan';

-- Payment webhooks table comments
COMMENT ON TABLE payment_webhooks IS 'Webhook events from payment gateway';
COMMENT ON COLUMN payment_webhooks.webhook_data IS 'Raw webhook payload from payment gateway';
COMMENT ON COLUMN payment_webhooks.processed IS 'Whether the webhook has been processed';

-- Song requests payment columns comments
COMMENT ON COLUMN song_requests.payment_id IS 'Reference to the payment record for this request';
COMMENT ON COLUMN song_requests.payment_status IS 'Payment status: pending, completed, failed, refunded';
COMMENT ON COLUMN song_requests.payment_required IS 'Whether payment is required for this request';

-- Songs payment column comments
COMMENT ON COLUMN songs.payment_id IS 'Reference to the payment record for this song';

-- Step 8: Verification
-- =====================================================

-- Verify the columns were added successfully
SELECT 
    'Payment columns added successfully' as status,
    (SELECT COUNT(*) FROM payments) as total_payments,
    (SELECT COUNT(*) FROM pricing_plans) as total_pricing_plans,
    (SELECT COUNT(*) FROM payment_webhooks) as total_webhooks;

-- Show the updated song_requests table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'song_requests'
AND column_name IN ('payment_id', 'payment_status', 'payment_required')
ORDER BY column_name;

-- Show the updated songs table structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'songs'
AND column_name = 'payment_id';
