-- Migration script to remove recipient_relationship column from song_requests table
-- This script removes the recipient_relationship column if it exists

-- Step 1: Check if the column exists and drop it if it does
DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'song_requests'
        AND column_name = 'recipient_relationship'
    ) THEN
        ALTER TABLE song_requests DROP COLUMN recipient_relationship;
        RAISE NOTICE 'Column recipient_relationship has been dropped';
    ELSE
        RAISE NOTICE 'Column recipient_relationship does not exist, skipping';
    END IF;
END $$;

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'song_requests'
AND column_name IN ('recipient_details', 'languages', 'recipient_relationship')
ORDER BY column_name;