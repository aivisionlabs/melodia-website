-- Migration to add timestamped_lyrics_variants column to songs table
-- This column will store synchronized lyrics for both variants

-- Add the new column
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS timestamped_lyrics_variants JSONB;

-- Add a comment to document the column
COMMENT ON COLUMN songs.timestamped_lyrics_variants IS 'Stores synchronized lyrics for both variants as JSON object with variant index as key';

-- Update existing songs to have an empty object for the new column
UPDATE songs
SET timestamped_lyrics_variants = '{}'::jsonb
WHERE timestamped_lyrics_variants IS NULL;

-- Make the column NOT NULL with default empty object
ALTER TABLE songs
ALTER COLUMN timestamped_lyrics_variants SET NOT NULL,
ALTER COLUMN timestamped_lyrics_variants SET DEFAULT '{}'::jsonb;