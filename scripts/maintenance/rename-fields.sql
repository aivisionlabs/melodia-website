-- Migration script to rename fields and remove unused fields in song_requests table
-- Run this script to update existing databases

-- Rename emotions to mood
ALTER TABLE song_requests
RENAME COLUMN emotions TO mood;

-- Rename additional_details to song_story
ALTER TABLE song_requests
RENAME COLUMN additional_details TO song_story;

-- Remove unused fields
ALTER TABLE song_requests
DROP COLUMN IF EXISTS person_description,
DROP COLUMN IF EXISTS song_type,
DROP COLUMN IF EXISTS lyrics_locked_at;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'song_requests'
AND column_name IN ('mood', 'song_story', 'person_description', 'emotions', 'additional_details', 'song_type', 'lyrics_locked_at')
ORDER BY column_name;

-- Should show mood and song_story, but not the removed fields
