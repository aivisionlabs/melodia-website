-- Add likes_count column to songs table
-- This migration adds a likes_count column to track the number of likes for each song

ALTER TABLE songs
ADD COLUMN IF NOT EXISTS likes_count integer DEFAULT 0;

-- Add index for better performance when sorting by likes
CREATE INDEX IF NOT EXISTS idx_songs_likes_count ON songs(likes_count DESC);

-- Update existing songs to have 0 likes (they already default to 0, but being explicit)
UPDATE songs SET likes_count = 0 WHERE likes_count IS NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN songs.likes_count IS 'Number of likes received for this song';
