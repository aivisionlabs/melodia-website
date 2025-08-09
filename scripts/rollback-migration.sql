-- Rollback Migration Script for Melodia Website
-- This script reverts the synchronized lyrics features
-- ONLY USE IN EMERGENCY SITUATIONS

-- Start transaction to ensure atomicity
BEGIN;

-- 1. Drop indexes (if they exist)
DROP INDEX IF EXISTS idx_songs_timestamped_lyrics_variants;
DROP INDEX IF EXISTS idx_songs_timestamped_lyrics_api_responses;

-- 2. Remove NOT NULL constraints
ALTER TABLE songs
ALTER COLUMN timestamped_lyrics_variants DROP NOT NULL;

ALTER TABLE songs
ALTER COLUMN timestamped_lyrics_api_responses DROP NOT NULL;

-- 3. Drop the columns
-- WARNING: This will permanently delete all synchronized lyrics data
ALTER TABLE songs
DROP COLUMN IF EXISTS timestamped_lyrics_variants;

ALTER TABLE songs
DROP COLUMN IF EXISTS timestamped_lyrics_api_responses;

-- 4. Verify rollback
DO $$
DECLARE
    total_songs INTEGER;
BEGIN
    -- Count total songs
    SELECT COUNT(*) INTO total_songs FROM songs WHERE is_deleted = false;

    -- Log the results
    RAISE NOTICE 'Rollback completed successfully:';
    RAISE NOTICE 'Total songs remaining: %', total_songs;
    RAISE NOTICE 'Synchronized lyrics features have been removed';
END $$;

-- Commit the transaction
COMMIT;

-- Final verification query
-- Run this to verify the rollback was successful
SELECT
    'Rollback Status' as status,
    COUNT(*) as total_songs
FROM songs
WHERE is_deleted = false;