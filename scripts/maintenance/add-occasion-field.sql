-- Migration script to add occasion field to song_requests table
-- Run this script to update existing databases

-- Add occasion column to song_requests table
ALTER TABLE song_requests
ADD COLUMN IF NOT EXISTS occasion TEXT;

-- Add comment to document the field
COMMENT ON COLUMN song_requests.occasion IS 'The occasion for which the song is being created (e.g., Birthday, Anniversary, etc.)';

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'song_requests'
AND column_name = 'occasion';
