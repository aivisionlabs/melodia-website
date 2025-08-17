-- Migration script to add sequence field for controlling song display order
-- Run this script to add the sequence field to the songs table

BEGIN;

-- Add the sequence column if it doesn't exist
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS sequence INTEGER;

-- Update existing songs to have a sequence value based on their current order
-- This will set sequence = id for existing songs to maintain current order
UPDATE songs
SET sequence = id
WHERE sequence IS NULL;

-- Make the sequence column NOT NULL after setting default values
ALTER TABLE songs
ALTER COLUMN sequence SET NOT NULL;

-- Create an index on the sequence field for better performance
CREATE INDEX IF NOT EXISTS idx_songs_sequence
ON songs(sequence);

-- Add a comment for documentation
COMMENT ON COLUMN songs.sequence IS 'Controls the display order of songs in the library';

COMMIT;

-- Verify the migration
SELECT
    'Migration completed successfully' as status,
    COUNT(*) as total_songs,
    COUNT(CASE WHEN sequence IS NOT NULL THEN 1 END) as songs_with_sequence
FROM songs
WHERE is_deleted = false;
