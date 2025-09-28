-- Migration script to change lyrics_edit_prompt from JSONB to TEXT
-- This script converts the column type without preserving existing data

-- Step 1: Drop the existing JSONB column
ALTER TABLE lyrics_drafts DROP COLUMN lyrics_edit_prompt;

-- Step 2: Add the new TEXT column
ALTER TABLE lyrics_drafts ADD COLUMN lyrics_edit_prompt TEXT;

-- Step 3: Update the column comment
COMMENT ON COLUMN lyrics_drafts.lyrics_edit_prompt IS 'User edit prompt for lyrics refinement';

-- Step 4: Verify the migration
SELECT
  COUNT(*) as total_records,
  COUNT(lyrics_edit_prompt) as records_with_prompt,
  COUNT(*) - COUNT(lyrics_edit_prompt) as records_without_prompt
FROM lyrics_drafts;

-- Show sample of data
SELECT
  id,
  version,
  lyrics_edit_prompt,
  LENGTH(lyrics_edit_prompt) as prompt_length
FROM lyrics_drafts
WHERE lyrics_edit_prompt IS NOT NULL
LIMIT 5;
