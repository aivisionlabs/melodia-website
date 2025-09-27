-- Cleanup song_requests table fields
-- Remove redundant fields that belong in other tables

-- Step 1: Add approved_lyrics_id to songs table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'songs' AND column_name = 'approved_lyrics_id'
    ) THEN
        ALTER TABLE songs ADD COLUMN approved_lyrics_id integer;
        RAISE NOTICE 'Added approved_lyrics_id column to songs table';
    ELSE
        RAISE NOTICE 'approved_lyrics_id column already exists in songs table';
    END IF;
END $$;

-- Step 2: Migrate approved_lyrics_id data from song_requests to songs
-- This will only work if there's a 1:1 relationship between song_requests and songs
UPDATE songs
SET approved_lyrics_id = sr.approved_lyrics_id
FROM song_requests sr
WHERE songs.song_request_id = sr.id
  AND sr.approved_lyrics_id IS NOT NULL
  AND songs.approved_lyrics_id IS NULL;

-- Step 3: Remove redundant fields from song_requests table
DO $$
BEGIN
    -- Remove suno_task_id (already exists in songs table)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'song_requests' AND column_name = 'suno_task_id'
    ) THEN
        ALTER TABLE song_requests DROP COLUMN suno_task_id;
        RAISE NOTICE 'Removed suno_task_id column from song_requests table';
    ELSE
        RAISE NOTICE 'suno_task_id column does not exist in song_requests table';
    END IF;

    -- Remove lyrics_status (use lyrics_drafts.status instead)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'song_requests' AND column_name = 'lyrics_status'
    ) THEN
        ALTER TABLE song_requests DROP COLUMN lyrics_status;
        RAISE NOTICE 'Removed lyrics_status column from song_requests table';
    ELSE
        RAISE NOTICE 'lyrics_status column does not exist in song_requests table';
    END IF;

    -- Remove approved_lyrics_id (moved to songs table)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'song_requests' AND column_name = 'approved_lyrics_id'
    ) THEN
        ALTER TABLE song_requests DROP COLUMN approved_lyrics_id;
        RAISE NOTICE 'Removed approved_lyrics_id column from song_requests table';
    ELSE
        RAISE NOTICE 'approved_lyrics_id column does not exist in song_requests table';
    END IF;
END $$;

-- Step 4: Verify the changes
SELECT
    'song_requests' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'song_requests'
  AND column_name IN ('suno_task_id', 'lyrics_status', 'approved_lyrics_id')
UNION ALL
SELECT
    'songs' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'songs'
  AND column_name = 'approved_lyrics_id';

-- Step 5: Show final table structures
SELECT 'song_requests table structure:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'song_requests'
ORDER BY ordinal_position;

SELECT 'songs table structure (relevant fields):' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'songs'
  AND column_name IN ('song_request_id', 'approved_lyrics_id', 'suno_task_id')
ORDER BY ordinal_position;
