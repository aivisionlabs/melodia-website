-- =====================================================
-- SONGS TABLE SCHEMA REFACTORING MIGRATION
-- =====================================================
-- This migration removes 18 fields and adds 3 new JSONB fields to the songs table
-- Date: 2025-01-27
-- NOTE: This will DROP existing data - no backward compatibility
-- =====================================================

-- Step 1: Add new JSONB fields
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS song_variants JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS variant_timestamp_lyrics_api_response JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS variant_timestamp_lyrics_processed JSONB NOT NULL DEFAULT '{}';

-- Step 2: Drop the old fields (data will be lost)
ALTER TABLE songs
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS lyrics,
DROP COLUMN IF EXISTS suno_variants,
DROP COLUMN IF EXISTS song_requester,
DROP COLUMN IF EXISTS prompt,
DROP COLUMN IF EXISTS suno_task_id,
DROP COLUMN IF EXISTS is_active,
DROP COLUMN IF EXISTS music_style,
DROP COLUMN IF EXISTS song_url,
DROP COLUMN IF EXISTS negative_tags,
DROP COLUMN IF EXISTS status_checked_at,
DROP COLUMN IF EXISTS last_status_check,
DROP COLUMN IF EXISTS status_check_count,
DROP COLUMN IF EXISTS timestamp_lyrics,
DROP COLUMN IF EXISTS timestamped_lyrics_variants,
DROP COLUMN IF EXISTS timestamped_lyrics_api_responses,
DROP COLUMN IF EXISTS song_url_variant_1,
DROP COLUMN IF EXISTS song_url_variant_2;

-- Step 3: Create indexes for better performance on new JSONB fields
CREATE INDEX IF NOT EXISTS idx_songs_song_variants ON songs USING GIN (song_variants);
CREATE INDEX IF NOT EXISTS idx_songs_variant_timestamp_lyrics_api_response ON songs USING GIN (variant_timestamp_lyrics_api_response);
CREATE INDEX IF NOT EXISTS idx_songs_variant_timestamp_lyrics_processed ON songs USING GIN (variant_timestamp_lyrics_processed);

-- Step 4: Add comments for documentation
COMMENT ON COLUMN songs.song_variants IS 'JSONB field storing all song variants with their metadata (audio URLs, images, etc.)';
COMMENT ON COLUMN songs.variant_timestamp_lyrics_api_response IS 'JSONB field storing index-based timestamp lyrics API responses (e.g., {0: [{}], 1: [{}]})';
COMMENT ON COLUMN songs.variant_timestamp_lyrics_processed IS 'JSONB field storing processed timestamp lyrics for user display (e.g., {0: [{}], 1: [{}]})';

-- Verification query to check the migration
SELECT
    COUNT(*) as total_songs,
    COUNT(CASE WHEN song_variants != '{}' THEN 1 END) as songs_with_variants,
    COUNT(CASE WHEN variant_timestamp_lyrics_api_response != '{}' THEN 1 END) as songs_with_api_responses,
    COUNT(CASE WHEN variant_timestamp_lyrics_processed != '{}' THEN 1 END) as songs_with_processed_lyrics
FROM songs;
