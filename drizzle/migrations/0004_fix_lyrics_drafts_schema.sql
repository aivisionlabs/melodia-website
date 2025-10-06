-- =====================================================
-- FIX LYRICS_DRAFTS TABLE SCHEMA MIGRATION
-- =====================================================
-- This migration aligns the lyrics_drafts table with the current Drizzle schema
-- Date: 2025-01-04
-- =====================================================

-- Step 1: Add missing columns that the Drizzle schema expects
ALTER TABLE lyrics_drafts 
ADD COLUMN IF NOT EXISTS lyrics_edit_prompt text,
ADD COLUMN IF NOT EXISTS song_title text,
ADD COLUMN IF NOT EXISTS music_style text,
ADD COLUMN IF NOT EXISTS created_by_user_id integer,
ADD COLUMN IF NOT EXISTS created_by_anonymous_user_id uuid;

-- Step 2: Migrate existing data where possible
-- Map created_by to created_by_user_id
UPDATE lyrics_drafts 
SET created_by_user_id = created_by 
WHERE created_by IS NOT NULL AND created_by_user_id IS NULL;

-- Step 3: Drop columns that are not in the Drizzle schema
-- Note: This will remove data, but we're aligning with the expected schema
ALTER TABLE lyrics_drafts 
DROP COLUMN IF EXISTS language,
DROP COLUMN IF EXISTS tone,
DROP COLUMN IF EXISTS length_hint,
DROP COLUMN IF EXISTS structure,
DROP COLUMN IF EXISTS prompt_input,
DROP COLUMN IF EXISTS edited_text,
DROP COLUMN IF EXISTS is_approved,
DROP COLUMN IF EXISTS created_by;

-- Step 4: Add foreign key constraints for the new columns
ALTER TABLE lyrics_drafts 
ADD CONSTRAINT IF NOT EXISTS fk_lyrics_drafts_created_by_user_id
FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL;

ALTER TABLE lyrics_drafts 
ADD CONSTRAINT IF NOT EXISTS fk_lyrics_drafts_created_by_anonymous_user_id
FOREIGN KEY (created_by_anonymous_user_id) REFERENCES anonymous_users(id) ON DELETE SET NULL;

-- Step 5: Verify the final schema matches expectations
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'lyrics_drafts' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
