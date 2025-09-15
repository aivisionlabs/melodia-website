-- =====================================================
-- COMPLETE MELODIA DATABASE SETUP SCRIPT
-- =====================================================
-- This script sets up the complete database schema for Melodia
-- Run this after creating the database and connecting to it
-- =====================================================

-- Step 1: Create base tables
-- =====================================================

-- Create songs table (base structure)
CREATE TABLE IF NOT EXISTS songs (
  id SERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  title TEXT NOT NULL,
  lyrics TEXT,
  timestamp_lyrics JSONB,
  music_style TEXT,
  service_provider TEXT DEFAULT 'SU',
  song_requester TEXT,
  prompt TEXT,
  song_url TEXT,
  duration NUMERIC(10,2),
  slug TEXT UNIQUE NOT NULL,
  add_to_library BOOLEAN DEFAULT true,
  is_deleted BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'draft',
  categories TEXT[],
  tags TEXT[],
  suno_task_id TEXT,
  metadata JSONB,
  user_id INTEGER,
  sequence INTEGER,
  negative_tags TEXT,
  suno_variants JSONB,
  selected_variant INTEGER,
  timestamped_lyrics_api_responses JSONB DEFAULT '{}'::jsonb,
  timestamped_lyrics_variants JSONB DEFAULT '{}'::jsonb,
  status_checked_at TIMESTAMP,
  last_status_check TIMESTAMP,
  status_check_count INTEGER DEFAULT 0
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

-- Create song_requests table for form submissions
CREATE TABLE IF NOT EXISTS song_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  requester_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  delivery_preference TEXT CHECK (delivery_preference IN ('email', 'whatsapp', 'both')),
  recipient_name TEXT NOT NULL,
  recipient_relationship TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  person_description TEXT,
  song_type TEXT,
  emotions TEXT[],
  additional_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  suno_task_id TEXT,
  generated_song_id INTEGER REFERENCES songs(id),
  lyrics_status TEXT DEFAULT 'pending',
  approved_lyrics_id INTEGER,
  lyrics_locked_at TIMESTAMPTZ,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lyrics_drafts table for Phase 6 workflow
CREATE TABLE IF NOT EXISTS lyrics_drafts (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  language TEXT[],
  tone TEXT[],
  length_hint TEXT,
  structure JSONB,
  prompt_input JSONB,
  generated_text TEXT NOT NULL,
  edited_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes for better performance
-- =====================================================

-- Songs table indexes
CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_add_to_library ON songs(add_to_library);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_sequence ON songs(sequence);
CREATE INDEX IF NOT EXISTS idx_songs_suno_task_id ON songs(suno_task_id);
CREATE INDEX IF NOT EXISTS idx_songs_last_status_check ON songs(last_status_check);

-- Users table indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Song requests table indexes
CREATE INDEX IF NOT EXISTS idx_song_requests_user_id ON song_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_created_at ON song_requests(created_at);

-- Lyrics drafts table indexes
CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_req ON lyrics_drafts(song_request_id);
CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_status ON lyrics_drafts(status);
CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_version ON lyrics_drafts(version DESC);

-- Step 3: Add foreign key constraints
-- =====================================================

-- Add foreign key for songs.user_id
ALTER TABLE songs 
ADD CONSTRAINT IF NOT EXISTS fk_songs_user_id 
FOREIGN KEY (user_id) REFERENCES users(id);

-- Add foreign key for song_requests.approved_lyrics_id
ALTER TABLE song_requests 
ADD CONSTRAINT IF NOT EXISTS fk_song_requests_approved_lyrics 
FOREIGN KEY (approved_lyrics_id) REFERENCES lyrics_drafts(id);

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

-- Create trigger for lyrics_drafts table
DROP TRIGGER IF EXISTS update_lyrics_drafts_updated_at ON lyrics_drafts;
CREATE TRIGGER update_lyrics_drafts_updated_at 
    BEFORE UPDATE ON lyrics_drafts 
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

-- Step 6: Update existing data and set defaults
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

-- Update existing song requests to have pending lyrics status
UPDATE song_requests 
SET lyrics_status = 'pending' 
WHERE lyrics_status IS NULL;

-- Step 7: Add column comments for documentation
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

-- Users table comments
COMMENT ON TABLE users IS 'Regular user accounts for authentication';

-- Song requests table comments
COMMENT ON TABLE song_requests IS 'Song creation requests from users';
COMMENT ON COLUMN song_requests.lyrics_status IS 'Status of lyrics workflow: pending, generating, needs_review, approved';
COMMENT ON COLUMN song_requests.approved_lyrics_id IS 'Reference to the approved lyrics draft';
COMMENT ON COLUMN song_requests.lyrics_locked_at IS 'Timestamp when lyrics were locked for song generation';

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

-- Step 8: Verification
-- =====================================================

-- Verify the setup
SELECT 
    'Database setup completed successfully' as status,
    (SELECT COUNT(*) FROM songs) as total_songs,
    (SELECT COUNT(*) FROM admin_users) as total_admin_users,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM song_requests) as total_song_requests,
    (SELECT COUNT(*) FROM lyrics_drafts) as total_lyrics_drafts;

-- Show table structure
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('songs', 'admin_users', 'users', 'song_requests', 'lyrics_drafts')
ORDER BY table_name, ordinal_position;
