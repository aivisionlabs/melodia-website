-- Migration script to remove unused fields from song_requests table
-- Run this script to update existing databases

-- Remove unused contact fields
ALTER TABLE song_requests
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS delivery_preference;

-- Verify the columns were removed
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'song_requests'
AND column_name IN ('phone_number', 'email', 'delivery_preference');

-- Should return no rows if successful
