-- Database Cleanup Script: Remove Extra Columns from Songs Table
-- This script removes columns that are not in the current schema.ts
-- Generated: ${new Date().toISOString()}

BEGIN;

-- Remove extra columns that are not in the current schema
-- These columns should be handled by the proper normalized structure

-- Drop columns that are duplicated or moved to other tables
ALTER TABLE songs DROP COLUMN IF EXISTS title;
ALTER TABLE songs DROP COLUMN IF EXISTS lyrics;
ALTER TABLE songs DROP COLUMN IF EXISTS timestamp_lyrics;
ALTER TABLE songs DROP COLUMN IF EXISTS timestamped_lyrics_variants;
ALTER TABLE songs DROP COLUMN IF EXISTS timestamped_lyrics_api_responses;
ALTER TABLE songs DROP COLUMN IF EXISTS music_style;
ALTER TABLE songs DROP COLUMN IF EXISTS song_requester;
ALTER TABLE songs DROP COLUMN IF EXISTS prompt;
ALTER TABLE songs DROP COLUMN IF EXISTS song_url;
ALTER TABLE songs DROP COLUMN IF EXISTS duration;
ALTER TABLE songs DROP COLUMN IF EXISTS user_id;
ALTER TABLE songs DROP COLUMN IF EXISTS sequence;
ALTER TABLE songs DROP COLUMN IF EXISTS negative_tags;
ALTER TABLE songs DROP COLUMN IF EXISTS suno_variants;
ALTER TABLE songs DROP COLUMN IF EXISTS suno_task_id;

-- Verify the cleanup
SELECT
    'Cleanup Complete' as status,
    COUNT(*) as remaining_columns
FROM information_schema.columns
WHERE table_name = 'songs'
AND table_schema = 'public';

-- Show the cleaned schema
\d songs;

COMMIT;
