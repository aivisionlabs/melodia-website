-- Migration: Remove redundant user_id from songs table and generated_song_id from song_requests table
-- This migration implements the normalized schema where:
-- 1. Songs table only references song_requests via song_request_id
-- 2. User ownership is tracked only in song_requests table
-- 3. Eliminates bidirectional relationship and data redundancy

-- Step 1: Remove generated_song_id column from song_requests table
-- This column is redundant since songs.song_request_id already provides the link
ALTER TABLE song_requests DROP COLUMN IF EXISTS generated_song_id;

-- Step 2: Remove user_id column from songs table
-- User ownership is tracked in song_requests table, not songs table
ALTER TABLE songs DROP COLUMN IF EXISTS user_id;

-- Step 3: Add indexes for better query performance
-- Since we'll be joining song_requests to songs frequently, ensure good performance
CREATE INDEX IF NOT EXISTS idx_songs_song_request_id ON songs(song_request_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_user_id ON song_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_song_requests_anonymous_user_id ON song_requests(anonymous_user_id) WHERE anonymous_user_id IS NOT NULL;

-- Step 4: Add comments to clarify the new relationship
COMMENT ON COLUMN songs.song_request_id IS 'References the song request that generated this song. One-to-one relationship.';
COMMENT ON COLUMN song_requests.user_id IS 'User who created this song request (nullable for anonymous users)';
COMMENT ON COLUMN song_requests.anonymous_user_id IS 'Anonymous user who created this song request (nullable for registered users)';

-- Verification queries (commented out - uncomment to test)
-- SELECT 'Migration completed successfully' as status;
-- SELECT COUNT(*) as total_songs FROM songs;
-- SELECT COUNT(*) as total_song_requests FROM song_requests;
