-- Migration script to change duration field from integer to numeric
-- This allows storing duration values with decimal precision (e.g., 180.5 seconds)

-- Change the duration column type from integer to numeric with 2 decimal places
ALTER TABLE songs
ALTER COLUMN duration TYPE NUMERIC(10,2) USING duration::NUMERIC(10,2);

-- Add a comment to document the change
COMMENT ON COLUMN songs.duration IS 'Duration in seconds with 2 decimal places precision';

-- Verify the change
SELECT column_name, data_type, numeric_precision, numeric_scale
FROM information_schema.columns
WHERE table_name = 'songs' AND column_name = 'duration';

-- Show a few example records to verify the data
SELECT id, title, duration, pg_typeof(duration) as duration_type
FROM songs
WHERE duration IS NOT NULL
LIMIT 5;
