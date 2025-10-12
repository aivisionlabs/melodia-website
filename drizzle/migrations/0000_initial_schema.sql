-- =====================================================
-- MELODIA DATABASE SETUP SCRIPT (DEVELOPMENT MODE)
-- =====================================================
-- This script sets up the complete database schema for Melodia
-- DEVELOPMENT MODE: Drops all existing data and starts fresh
-- Run this script to completely reset the database
-- =====================================================

-- Step 0: Drop ALL existing tables and data (DEVELOPMENT MODE)
-- =====================================================
DROP TABLE IF EXISTS payment_webhooks CASCADE;
DROP TABLE IF EXISTS pricing_plans CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS lyrics_drafts CASCADE;
DROP TABLE IF EXISTS song_requests CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS anonymous_users CASCADE;

-- Drop any existing functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Step 1: Create base tables with NEW SCHEMA
-- =====================================================

-- Create users table for regular user accounts
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  date_of_birth DATE NOT NULL,
  phone_number TEXT,
  profile_picture TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  password_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create anonymous users table to track anonymous sessions
CREATE TABLE anonymous_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create song_requests table for form submissions
CREATE TABLE song_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  anonymous_user_id UUID,
  requester_name TEXT NOT NULL,
  recipient_details TEXT NOT NULL,
  occasion TEXT,
  languages TEXT NOT NULL,
  mood TEXT[],
  song_story TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lyrics_drafts table for lyrics workflow
CREATE TABLE lyrics_drafts (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  lyrics_edit_prompt TEXT,
  generated_text TEXT NOT NULL,
  song_title TEXT,
  music_style TEXT,
  language TEXT NOT NULL DEFAULT 'English',
  llm_model_name TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create songs table with NEW REFACTORED SCHEMA
CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  slug TEXT NOT NULL UNIQUE,
  status TEXT DEFAULT 'processing',
  is_featured BOOLEAN DEFAULT FALSE,

  -- NEW JSONB fields for variants and timestamped lyrics
  song_variants JSONB NOT NULL DEFAULT '{}',
  variant_timestamp_lyrics_api_response JSONB NOT NULL DEFAULT '{}',
  variant_timestamp_lyrics_processed JSONB NOT NULL DEFAULT '{}',

  metadata JSONB,
  approved_lyrics_id INTEGER,
  service_provider TEXT DEFAULT 'SU',
  categories TEXT[],
  tags TEXT[],
  add_to_library BOOLEAN DEFAULT FALSE,
  is_deleted BOOLEAN,
  selected_variant INTEGER,
  payment_id INTEGER
);

-- Create admin_users table
CREATE TABLE admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table - supports both registered and anonymous users
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER,
  user_id INTEGER,
  anonymous_user_id UUID,
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

-- Create pricing plans table
CREATE TABLE pricing_plans (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'INR',
  features JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payment webhooks table
CREATE TABLE payment_webhooks (
  id SERIAL PRIMARY KEY,
  razorpay_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payment_id INTEGER,
  webhook_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Add foreign key constraints
-- =====================================================

-- Songs table foreign keys
ALTER TABLE songs
ADD CONSTRAINT fk_songs_song_request_id
FOREIGN KEY (song_request_id) REFERENCES song_requests(id) ON DELETE CASCADE;

ALTER TABLE songs
ADD CONSTRAINT fk_songs_approved_lyrics_id
FOREIGN KEY (approved_lyrics_id) REFERENCES lyrics_drafts(id) ON DELETE SET NULL;

ALTER TABLE songs
ADD CONSTRAINT fk_songs_payment_id
FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Song requests table foreign keys
ALTER TABLE song_requests
ADD CONSTRAINT fk_song_requests_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE song_requests
ADD CONSTRAINT fk_song_requests_anonymous_user_id
FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE SET NULL;

-- Lyrics drafts table foreign keys
ALTER TABLE lyrics_drafts
ADD CONSTRAINT fk_lyrics_drafts_song_request_id
FOREIGN KEY (song_request_id) REFERENCES song_requests(id) ON DELETE CASCADE;


-- Payments table foreign keys
ALTER TABLE payments
ADD CONSTRAINT fk_payments_song_request_id
FOREIGN KEY (song_request_id) REFERENCES song_requests(id) ON DELETE SET NULL;

ALTER TABLE payments
ADD CONSTRAINT fk_payments_user_id
FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE payments
ADD CONSTRAINT fk_payments_anonymous_user_id
FOREIGN KEY (anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE SET NULL;

-- Payment webhooks table foreign keys
ALTER TABLE payment_webhooks
ADD CONSTRAINT fk_payment_webhooks_payment_id
FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL;

-- Step 3: Create indexes for better performance
-- =====================================================

-- Songs table indexes
CREATE INDEX idx_songs_slug ON songs(slug);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_is_deleted ON songs(is_deleted);
CREATE INDEX idx_songs_created_at ON songs(created_at);
CREATE INDEX idx_songs_song_request_id ON songs(song_request_id);
CREATE INDEX idx_songs_approved_lyrics_id ON songs(approved_lyrics_id);
CREATE INDEX idx_songs_payment_id ON songs(payment_id);

-- JSONB indexes for new fields
CREATE INDEX idx_songs_song_variants ON songs USING GIN (song_variants);
CREATE INDEX idx_songs_variant_timestamp_lyrics_api_response ON songs USING GIN (variant_timestamp_lyrics_api_response);
CREATE INDEX idx_songs_variant_timestamp_lyrics_processed ON songs USING GIN (variant_timestamp_lyrics_processed);

-- Song requests table indexes
CREATE INDEX idx_song_requests_user_id ON song_requests(user_id);
CREATE INDEX idx_song_requests_anonymous_user_id ON song_requests(anonymous_user_id);
CREATE INDEX idx_song_requests_status ON song_requests(status);
CREATE INDEX idx_song_requests_created_at ON song_requests(created_at);

-- Lyrics drafts table indexes
CREATE INDEX idx_lyrics_drafts_song_request_id ON lyrics_drafts(song_request_id);
CREATE INDEX idx_lyrics_drafts_status ON lyrics_drafts(status);
CREATE INDEX idx_lyrics_drafts_created_at ON lyrics_drafts(created_at);

-- Users table indexes
CREATE INDEX idx_users_email ON users(email);

-- Payments table indexes
CREATE INDEX idx_payments_song_request_id ON payments(song_request_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_anonymous_user_id ON payments(anonymous_user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_razorpay_payment_id ON payments(razorpay_payment_id);

-- Payment webhooks table indexes
CREATE INDEX idx_payment_webhooks_payment_id ON payment_webhooks(payment_id);
CREATE INDEX idx_payment_webhooks_event_type ON payment_webhooks(event_type);
CREATE INDEX idx_payment_webhooks_processed ON payment_webhooks(processed);

-- Step 4: Create functions and triggers
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for tables with updated_at columns
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_song_requests_updated_at
    BEFORE UPDATE ON song_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lyrics_drafts_updated_at
    BEFORE UPDATE ON lyrics_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Insert initial data
-- =====================================================

-- Insert sample admin users
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin1', 'melodia2024!'),
  ('admin2', 'melodia2024!'),
  ('admin3', 'melodia2024!')
ON CONFLICT (username) DO NOTHING;

-- Insert sample pricing plans
INSERT INTO pricing_plans (name, description, price, currency, features, is_active) VALUES
  ('Basic', 'Single song generation', 99.00, 'INR', '{"songs": 1, "variants": 2}', true),
  ('Premium', 'Multiple songs with variants', 299.00, 'INR', '{"songs": 5, "variants": 4}', true),
  ('Pro', 'Unlimited songs and features', 599.00, 'INR', '{"songs": -1, "variants": 6}', true)
ON CONFLICT DO NOTHING;

-- Step 6: Add column comments for documentation
-- =====================================================

-- Songs table comments
COMMENT ON TABLE songs IS 'Main songs table storing all generated songs with new refactored schema';
COMMENT ON COLUMN songs.song_variants IS 'JSONB field storing all song variants with their metadata (audio URLs, images, etc.)';
COMMENT ON COLUMN songs.variant_timestamp_lyrics_api_response IS 'JSONB field storing index-based timestamp lyrics API responses (e.g., {0: [{}], 1: [{}]})';
COMMENT ON COLUMN songs.variant_timestamp_lyrics_processed IS 'JSONB field storing processed timestamp lyrics for user display (e.g., {0: [{}], 1: [{}]})';
COMMENT ON COLUMN songs.metadata IS 'JSONB field storing additional metadata like suno_task_id, title, lyrics, etc.';
COMMENT ON COLUMN songs.approved_lyrics_id IS 'Reference to the approved lyrics draft used for this song';
COMMENT ON COLUMN songs.selected_variant IS 'Index of the selected variant from song_variants';
COMMENT ON COLUMN songs.add_to_library IS 'Whether the song should be visible in the public library';
COMMENT ON COLUMN songs.is_deleted IS 'Soft delete flag - when true, song is considered deleted';

-- Users table comments
COMMENT ON TABLE users IS 'Regular user accounts for authentication';

-- Anonymous users table comments
COMMENT ON TABLE anonymous_users IS 'Anonymous users table to track anonymous sessions';

-- Song requests table comments
COMMENT ON TABLE song_requests IS 'Song creation requests from users';

-- Lyrics drafts table comments
COMMENT ON TABLE lyrics_drafts IS 'Stores lyrics drafts for song requests in lyrics workflow';
COMMENT ON COLUMN lyrics_drafts.song_request_id IS 'Reference to the song request this draft belongs to';
COMMENT ON COLUMN lyrics_drafts.version IS 'Version number of this draft (increments with each generation)';
COMMENT ON COLUMN lyrics_drafts.lyrics_edit_prompt IS 'User edit prompt for lyrics refinement';
COMMENT ON COLUMN lyrics_drafts.generated_text IS 'The original AI-generated lyrics text';
COMMENT ON COLUMN lyrics_drafts.song_title IS 'Song title determined by LLM during lyrics generation';
COMMENT ON COLUMN lyrics_drafts.music_style IS 'Music style determined by LLM during lyrics generation';
COMMENT ON COLUMN lyrics_drafts.status IS 'Current status: draft, needs_review, approved, archived';

-- Payments table comments
COMMENT ON TABLE payments IS 'Payments table - supports both registered and anonymous users';
COMMENT ON COLUMN payments.song_request_id IS 'The song_request is the primary link';
COMMENT ON COLUMN payments.user_id IS 'For registered users (nullable for anonymous payments)';
COMMENT ON COLUMN payments.anonymous_user_id IS 'For anonymous users';

-- Pricing plans table comments
COMMENT ON TABLE pricing_plans IS 'Pricing plans for different song generation tiers';

-- Payment webhooks table comments
COMMENT ON TABLE payment_webhooks IS 'Stores payment webhook events for processing';

-- Step 7: Verification
-- =====================================================

-- Verify the setup
SELECT
    'Database setup completed successfully' as status,
    (SELECT COUNT(*) FROM songs) as total_songs,
    (SELECT COUNT(*) FROM admin_users) as total_admin_users,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM anonymous_users) as total_anonymous_users,
    (SELECT COUNT(*) FROM song_requests) as total_song_requests,
    (SELECT COUNT(*) FROM lyrics_drafts) as total_lyrics_drafts,
    (SELECT COUNT(*) FROM payments) as total_payments,
    (SELECT COUNT(*) FROM pricing_plans) as total_pricing_plans,
    (SELECT COUNT(*) FROM payment_webhooks) as total_payment_webhooks;

-- Show table structure
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('songs', 'admin_users', 'users', 'anonymous_users', 'song_requests', 'lyrics_drafts', 'payments', 'pricing_plans', 'payment_webhooks')
ORDER BY table_name, ordinal_position;

-- Show indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('songs', 'admin_users', 'users', 'anonymous_users', 'song_requests', 'lyrics_drafts', 'payments', 'pricing_plans', 'payment_webhooks')
ORDER BY tablename, indexname;
