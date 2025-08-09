-- Migration script to rename is_active to add_to_library and add is_deleted field

-- Step 1: Add the new is_deleted column
ALTER TABLE songs ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;

-- Step 2: Rename is_active to add_to_library
ALTER TABLE songs RENAME COLUMN is_active TO add_to_library;

-- Step 3: Update any existing data if needed
-- Set is_deleted to false for all existing records
UPDATE songs SET is_deleted = FALSE WHERE is_deleted IS NULL;

-- Step 4: Add a comment to document the change
COMMENT ON COLUMN songs.add_to_library IS 'Whether the song should be visible in the public library';
COMMENT ON COLUMN songs.is_deleted IS 'Soft delete flag - when true, song is considered deleted';