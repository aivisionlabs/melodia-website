-- Migration script to clean up lyrics_drafts table schema
-- This script removes unused fields and renames prompt_input to lyrics_edit_prompt

-- Step 1: Rename prompt_input column to lyrics_edit_prompt
ALTER TABLE lyrics_drafts RENAME COLUMN prompt_input TO lyrics_edit_prompt;

-- Step 2: Remove unused columns
ALTER TABLE lyrics_drafts DROP COLUMN IF EXISTS structure;
ALTER TABLE lyrics_drafts DROP COLUMN IF EXISTS length_hint;
ALTER TABLE lyrics_drafts DROP COLUMN IF EXISTS is_approved;
ALTER TABLE lyrics_drafts DROP COLUMN IF EXISTS edited_text;
ALTER TABLE lyrics_drafts DROP COLUMN IF EXISTS tone;
ALTER TABLE lyrics_drafts DROP COLUMN IF EXISTS language;

-- Step 3: Update comments
COMMENT ON TABLE lyrics_drafts IS 'Stores lyrics drafts for song requests in Phase 6 workflow';
COMMENT ON COLUMN lyrics_drafts.song_request_id IS 'Reference to the song request this draft belongs to';
COMMENT ON COLUMN lyrics_drafts.version IS 'Version number of this draft (increments with each generation)';
COMMENT ON COLUMN lyrics_drafts.lyrics_edit_prompt IS 'User edit prompt for lyrics refinement';
COMMENT ON COLUMN lyrics_drafts.generated_text IS 'The original AI-generated lyrics text';
COMMENT ON COLUMN lyrics_drafts.status IS 'Current status: draft, needs_review, approved, archived';

-- Verify the changes
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'lyrics_drafts'
ORDER BY ordinal_position;
