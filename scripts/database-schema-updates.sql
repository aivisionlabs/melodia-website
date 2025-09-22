-- =====================================================
-- Melodia Database Schema Updates
-- This script adds missing columns and tables
-- Run with: podman exec -i melodia-postgres psql -U postgres -d melodia < scripts/database-schema-updates.sql
-- =====================================================

-- 1. Add missing columns to existing tables
-- =====================================================

-- Add anonymous_user_id to song_requests table
ALTER TABLE song_requests ADD COLUMN IF NOT EXISTS anonymous_user_id UUID;

-- Add is_approved to lyrics_drafts table  
ALTER TABLE lyrics_drafts ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT false;

-- Add missing columns to songs table
ALTER TABLE songs ADD COLUMN IF NOT EXISTS song_request_id INTEGER UNIQUE;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS song_url_variant_1 TEXT;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS song_url_variant_2 TEXT;

-- 2. Create missing tables
-- =====================================================

-- Create anonymous_users table
CREATE TABLE IF NOT EXISTS anonymous_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    song_request_id INTEGER,
    user_id INTEGER,
    anonymous_user_id UUID,
    razorpay_payment_id TEXT UNIQUE,
    razorpay_order_id TEXT,
    amount NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB
);

-- Create pricing_plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create payment_webhooks table
CREATE TABLE IF NOT EXISTS payment_webhooks (
    id SERIAL PRIMARY KEY,
    razorpay_event_id TEXT UNIQUE,
    event_type TEXT NOT NULL,
    payment_id INTEGER,
    webhook_data JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT NOW(),
    processed_at TIMESTAMP
);

-- 3. Add foreign key constraints
-- =====================================================

-- Add foreign key for songs.song_request_id
ALTER TABLE songs ADD CONSTRAINT IF NOT EXISTS songs_song_request_id_fkey 
    FOREIGN KEY (song_request_id) REFERENCES song_requests(id);

-- Add foreign keys for payments table
ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS payments_song_request_id_fkey 
    FOREIGN KEY (song_request_id) REFERENCES song_requests(id);

ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS payments_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id);

ALTER TABLE payments ADD CONSTRAINT IF NOT EXISTS payments_anonymous_user_id_fkey 
    FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id);

-- Add foreign key for payment_webhooks table
ALTER TABLE payment_webhooks ADD CONSTRAINT IF NOT EXISTS payment_webhooks_payment_id_fkey 
    FOREIGN KEY (payment_id) REFERENCES payments(id);

-- 4. Add indexes for better performance
-- =====================================================

-- Indexes for song_requests table
CREATE INDEX IF NOT EXISTS idx_song_requests_anonymous_user_id ON song_requests(anonymous_user_id);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_song_request_id ON payments(song_request_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_anonymous_user_id ON payments(anonymous_user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Indexes for pricing_plans table
CREATE INDEX IF NOT EXISTS idx_pricing_plans_is_active ON pricing_plans(is_active);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_currency ON pricing_plans(currency);

-- Indexes for payment_webhooks table
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_processed ON payment_webhooks(processed);
CREATE INDEX IF NOT EXISTS idx_payment_webhooks_event_type ON payment_webhooks(event_type);

-- 5. Insert sample pricing plans
-- =====================================================

INSERT INTO pricing_plans (name, description, price, currency, features, is_active) VALUES
('Basic Plan', '1 Song Generation', 100.00, 'INR', '{"songs": 1, "lyrics_generation": true, "music_generation": true, "download": true}', true),
('Premium Plan', '5 Songs Generation', 450.00, 'INR', '{"songs": 5, "lyrics_generation": true, "music_generation": true, "download": true, "priority_processing": true}', true),
('Pro Plan', 'Unlimited Songs', 999.00, 'INR', '{"songs": -1, "lyrics_generation": true, "music_generation": true, "download": true, "priority_processing": true, "custom_styles": true}', true)
ON CONFLICT (id) DO NOTHING;

-- 6. Verify schema updates
-- =====================================================

-- Check if all columns exist
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('song_requests', 'lyrics_drafts', 'songs', 'anonymous_users', 'payments', 'pricing_plans', 'payment_webhooks')
ORDER BY table_name, ordinal_position;

-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('song_requests', 'lyrics_drafts', 'songs', 'anonymous_users', 'payments', 'pricing_plans', 'payment_webhooks')
ORDER BY table_name;

-- Check foreign key constraints
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('songs', 'payments', 'payment_webhooks')
ORDER BY tc.table_name, kcu.column_name;

-- Success message
SELECT 'Database schema updates completed successfully!' as status;
