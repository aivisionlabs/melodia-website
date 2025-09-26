-- Add missing user fields to song_requests table
-- This script adds user_id and anonymous_user_id columns if they don't exist

-- Step 1: Add user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'song_requests' AND column_name = 'user_id'
    ) THEN
        ALTER TABLE song_requests ADD COLUMN user_id INTEGER;
        RAISE NOTICE 'Added user_id column to song_requests table';
    ELSE
        RAISE NOTICE 'user_id column already exists in song_requests table';
    END IF;
END $$;

-- Step 2: Add anonymous_user_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'song_requests' AND column_name = 'anonymous_user_id'
    ) THEN
        ALTER TABLE song_requests ADD COLUMN anonymous_user_id UUID;
        RAISE NOTICE 'Added anonymous_user_id column to song_requests table';
    ELSE
        RAISE NOTICE 'anonymous_user_id column already exists in song_requests table';
    END IF;
END $$;

-- Step 3: Verify the changes
SELECT
    'song_requests table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'song_requests'
  AND column_name IN ('user_id', 'anonymous_user_id')
ORDER BY ordinal_position;

-- Step 4: Show complete table structure
SELECT 'Complete song_requests table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'song_requests'
ORDER BY ordinal_position;
