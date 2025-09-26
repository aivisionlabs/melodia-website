-- =====================================================
-- COMPLETE MELODIA DATABASE SETUP SCRIPT
-- =====================================================
-- This script sets up the complete database schema for Melodia
-- Run this after creating the database and connecting to it
-- =====================================================

-- Step 0: Drop existing tables if they exist to ensure a clean slate
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

-- Step 1: Create base tables
-- =====================================================

-- Create songs table (base structure)
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL UNIQUE, -- Each request generates one song record
  user_id INTEGER NOT NULL, -- Which user ultimately owns this song
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  lyrics TEXT NOT NULL,
  duration INTEGER,
  slug TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'processing', -- e.g., 'processing', 'complete', 'failed'
  is_featured BOOLEAN DEFAULT FALSE, -- For the "Best Songs" gallery

  -- Store the two generated audio files
  song_url_variant_1 TEXT,
  song_url_variant_2 TEXT,
  metadata JSONB, -- For storing provider-specific data like suno_task_id, etc.
  approved_lyrics_id INTEGER, -- Reference to the approved lyrics draft

  -- Legacy fields for backward compatibility (to be removed in future migration)
  timestamp_lyrics JSONB,
  timestamped_lyrics_variants JSONB NOT NULL DEFAULT '{}',
  timestamped_lyrics_api_responses JSONB NOT NULL DEFAULT '{}',
  service_provider TEXT DEFAULT 'SU',
  song_requester TEXT,
  prompt TEXT,
  song_url TEXT,
  music_style TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  categories TEXT[],
  tags TEXT[],
  suno_task_id TEXT,
  add_to_library BOOLEAN,
  is_deleted BOOLEAN,
  negative_tags TEXT,
  suno_variants JSONB,
  selected_variant INTEGER,
  status_checked_at TIMESTAMP,
  last_status_check TIMESTAMP,
  status_check_count INTEGER DEFAULT 0,
  payment_id INTEGER -- Will be properly referenced later
);

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for regular user accounts
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create anonymous users table to track anonymous sessions
CREATE TABLE IF NOT EXISTS anonymous_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Use UUID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create song_requests table for form submissions
CREATE TABLE IF NOT EXISTS song_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER,
  anonymous_user_id UUID,
  requester_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  recipient_relationship TEXT NOT NULL,
  occasion TEXT,
  languages TEXT[] NOT NULL,
  mood TEXT[],
  song_story TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  generated_song_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lyrics_drafts table for Phase 6 workflow
CREATE TABLE IF NOT EXISTS lyrics_drafts (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  language TEXT[],
  tone TEXT[],
  length_hint TEXT,
  structure JSONB,
  prompt_input JSONB,
  generated_text TEXT NOT NULL,
  edited_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  is_approved BOOLEAN DEFAULT FALSE, -- A clear flag for the final version
  created_by INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table - supports both registered and anonymous users
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,

  -- The song_request is the primary link
  song_request_id INTEGER,

  -- --- Ownership fields ---
  user_id INTEGER, -- Nullable for anonymous payments
  anonymous_user_id UUID, -- For anonymous users

  -- Payment provider fields
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

-- Pricing plans table
CREATE TABLE IF NOT EXISTS pricing_plans (
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

-- Payment webhooks table
CREATE TABLE IF NOT EXISTS payment_webhooks (
  id SERIAL PRIMARY KEY,
  razorpay_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payment_id INTEGER,
  webhook_data JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Step 2: Create functions and triggers (keeping these as they are not FKs or indexes)
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for lyrics_drafts table
DROP TRIGGER IF EXISTS update_lyrics_drafts_updated_at ON lyrics_drafts;
CREATE TRIGGER update_lyrics_drafts_updated_at
    BEFORE UPDATE ON lyrics_drafts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Insert initial data
-- =====================================================

-- Insert sample admin users
INSERT INTO admin_users (username, password_hash) VALUES
  ('admin1', 'melodia2024!'),
  ('admin2', 'melodia2024!'),
  ('admin3', 'melodia2024!')
ON CONFLICT (username) DO NOTHING;

-- Step 4: Update existing data and set defaults
-- =====================================================

-- Set sequence values for existing songs
UPDATE songs
SET sequence = id
WHERE sequence IS NULL;

-- Set default values for new fields
UPDATE songs
SET status_check_count = 0
WHERE status_check_count IS NULL;

UPDATE songs
SET timestamped_lyrics_api_responses = '{}'::jsonb
WHERE timestamped_lyrics_api_responses IS NULL;

UPDATE songs
SET timestamped_lyrics_variants = '{}'::jsonb
WHERE timestamped_lyrics_variants IS NULL;

-- No longer needed - lyrics_status moved to lyrics_drafts table

-- Step 5: Add column comments for documentation
-- =====================================================

-- Songs table comments
COMMENT ON TABLE songs IS 'Main songs table storing all generated and uploaded songs';
COMMENT ON COLUMN songs.add_to_library IS 'Whether the song should be visible in the public library';
COMMENT ON COLUMN songs.is_deleted IS 'Soft delete flag - when true, song is considered deleted';
COMMENT ON COLUMN songs.sequence IS 'Controls the display order of songs in the library';
COMMENT ON COLUMN songs.duration IS 'Duration in seconds with 2 decimal places precision';
COMMENT ON COLUMN songs.negative_tags IS 'Tags to avoid during song generation';
COMMENT ON COLUMN songs.suno_variants IS 'JSON array of Suno API generated variants';
COMMENT ON COLUMN songs.selected_variant IS 'Index of the selected variant from suno_variants';
COMMENT ON COLUMN songs.timestamped_lyrics_api_responses IS 'Stores raw Suno API responses for timestamped lyrics';
COMMENT ON COLUMN songs.timestamped_lyrics_variants IS 'Stores synchronized lyrics for both variants';
COMMENT ON COLUMN songs.status_checked_at IS 'Timestamp when the song status was last checked';
COMMENT ON COLUMN songs.last_status_check IS 'Timestamp of the most recent status check';
COMMENT ON COLUMN songs.status_check_count IS 'Number of times the song status has been checked';
COMMENT ON COLUMN songs.approved_lyrics_id IS 'Reference to the approved lyrics draft used for this song';

-- Users table comments
COMMENT ON TABLE users IS 'Regular user accounts for authentication';

-- Anonymous users table comments
COMMENT ON TABLE anonymous_users IS 'Anonymous users table to track anonymous sessions';

-- Song requests table comments
COMMENT ON TABLE song_requests IS 'Song creation requests from users';
COMMENT ON COLUMN song_requests.generated_song_id IS 'Reference to the generated song (if any)';

-- Lyrics drafts table comments
COMMENT ON TABLE lyrics_drafts IS 'Stores lyrics drafts for song requests in Phase 6 workflow';
COMMENT ON COLUMN lyrics_drafts.song_request_id IS 'Reference to the song request this draft belongs to';
COMMENT ON COLUMN lyrics_drafts.version IS 'Version number of this draft (increments with each generation)';
COMMENT ON COLUMN lyrics_drafts.language IS 'Array of languages used in the lyrics';
COMMENT ON COLUMN lyrics_drafts.tone IS 'Array of tones/moods for the lyrics';
COMMENT ON COLUMN lyrics_drafts.length_hint IS 'Target length: short, standard, or long';
COMMENT ON COLUMN lyrics_drafts.structure IS 'JSON structure defining song sections (verse, chorus, etc.)';
COMMENT ON COLUMN lyrics_drafts.prompt_input IS 'JSON snapshot of the generation request and parameters';
COMMENT ON COLUMN lyrics_drafts.generated_text IS 'The original AI-generated lyrics text';
COMMENT ON COLUMN lyrics_drafts.edited_text IS 'User-edited version of the lyrics';
COMMENT ON COLUMN lyrics_drafts.status IS 'Current status: draft, needs_review, approved, archived';
COMMENT ON COLUMN lyrics_drafts.is_approved IS 'A clear flag for the final version';

-- Payments table comments
COMMENT ON TABLE payments IS 'Payments table - supports both registered and anonymous users';
COMMENT ON COLUMN payments.song_request_id IS 'The song_request is the primary link';
COMMENT ON COLUMN payments.user_id IS 'For registered users (nullable for anonymous payments)';
COMMENT ON COLUMN payments.anonymous_user_id IS 'For anonymous users';

-- Pricing plans table comments
COMMENT ON TABLE pricing_plans IS 'Pricing plans for different song generation tiers';

-- Payment webhooks table comments
COMMENT ON TABLE payment_webhooks IS 'Stores payment webhook events for processing';

-- Step 6: Verification
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
