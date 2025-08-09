-- Migration to add timestamped_lyrics_api_responses column to songs table
-- This column will store raw Suno API responses for timestamped lyrics

-- Add the new column
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS timestamped_lyrics_api_responses JSONB;

-- Add a comment to document the column
COMMENT ON COLUMN songs.timestamped_lyrics_api_responses IS 'Stores raw Suno API responses for timestamped lyrics as JSON object with variant index as key';

-- Update existing songs to have an empty object for the new column
UPDATE songs
SET timestamped_lyrics_api_responses = '{}'::jsonb
WHERE timestamped_lyrics_api_responses IS NULL;

-- Make the column NOT NULL with default empty object
ALTER TABLE songs
ALTER COLUMN timestamped_lyrics_api_responses SET NOT NULL,
ALTER COLUMN timestamped_lyrics_api_responses SET DEFAULT '{}'::jsonb;