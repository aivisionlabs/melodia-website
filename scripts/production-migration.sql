-- Production Migration Script for Melodia Website
-- This script adds support for synchronized lyrics features
-- Run this script in production after thorough testing in staging

-- Start transaction to ensure atomicity
BEGIN;

-- 1. Add new columns for timestamped lyrics (if not exists)
-- These columns will store synchronized lyrics for both variants and raw API responses

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS timestamped_lyrics_variants JSONB DEFAULT '{}'::jsonb;

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS timestamped_lyrics_api_responses JSONB DEFAULT '{}'::jsonb;

-- 2. Add comments for documentation
COMMENT ON COLUMN songs.timestamped_lyrics_variants IS 'Stores synchronized lyrics for both variants as JSON object with variant index as key';
COMMENT ON COLUMN songs.timestamped_lyrics_api_responses IS 'Stores raw Suno API responses for timestamped lyrics as JSON object with variant index as key';

-- 3. Update existing records to have default values
-- This ensures all existing songs have the new columns populated
UPDATE songs
SET timestamped_lyrics_variants = '{}'::jsonb
WHERE timestamped_lyrics_variants IS NULL;

UPDATE songs
SET timestamped_lyrics_api_responses = '{}'::jsonb
WHERE timestamped_lyrics_api_responses IS NULL;

-- 4. Make columns NOT NULL (only after ensuring all records have values)
-- This ensures data integrity going forward
ALTER TABLE songs
ALTER COLUMN timestamped_lyrics_variants SET NOT NULL;

ALTER TABLE songs
ALTER COLUMN timestamped_lyrics_api_responses SET NOT NULL;

-- 5. Create indexes for better performance (if they don't exist)
-- These indexes will help with query performance for the new columns
CREATE INDEX IF NOT EXISTS idx_songs_timestamped_lyrics_variants
ON songs USING GIN (timestamped_lyrics_variants);

CREATE INDEX IF NOT EXISTS idx_songs_timestamped_lyrics_api_responses
ON songs USING GIN (timestamped_lyrics_api_responses);

-- 6. Verify migration
-- This will show us the current state after migration
DO $$
DECLARE
    total_songs INTEGER;
    songs_with_variants INTEGER;
    songs_with_responses INTEGER;
BEGIN
    -- Count total songs
    SELECT COUNT(*) INTO total_songs FROM songs WHERE is_deleted = false;

    -- Count songs with timestamped lyrics variants
    SELECT COUNT(*) INTO songs_with_variants
    FROM songs
    WHERE timestamped_lyrics_variants IS NOT NULL
    AND timestamped_lyrics_variants != '{}'::jsonb;

    -- Count songs with API responses
    SELECT COUNT(*) INTO songs_with_responses
    FROM songs
    WHERE timestamped_lyrics_api_responses IS NOT NULL
    AND timestamped_lyrics_api_responses != '{}'::jsonb;

    -- Log the results
    RAISE NOTICE 'Migration completed successfully:';
    RAISE NOTICE 'Total songs: %', total_songs;
    RAISE NOTICE 'Songs with timestamped lyrics variants: %', songs_with_variants;
    RAISE NOTICE 'Songs with API responses: %', songs_with_responses;
END $$;

-- Commit the transaction
COMMIT;

-- Final verification query
-- Run this to verify the migration was successful
SELECT
    'Migration Status' as status,
    COUNT(*) as total_songs,
    COUNT(CASE WHEN timestamped_lyrics_variants IS NOT NULL THEN 1 END) as songs_with_variants,
    COUNT(CASE WHEN timestamped_lyrics_api_responses IS NOT NULL THEN 1 END) as songs_with_responses
FROM songs
WHERE is_deleted = false;