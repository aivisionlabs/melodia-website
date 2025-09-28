-- Migration script to add music_style column to lyrics_drafts table
-- This script adds the music_style column for storing LLM-determined music style

-- Step 1: Add the music_style column
ALTER TABLE lyrics_drafts ADD COLUMN music_style TEXT;

-- Step 2: Add column comment
COMMENT ON COLUMN lyrics_drafts.music_style IS 'Music style determined by LLM during lyrics generation';

-- Step 3: Verify the migration
SELECT
  COUNT(*) as total_records,
  COUNT(music_style) as records_with_music_style,
  COUNT(*) - COUNT(music_style) as records_without_music_style
FROM lyrics_drafts;

-- Show sample of data
SELECT
  id,
  version,
  music_style,
  LENGTH(generated_text) as lyrics_length
FROM lyrics_drafts
WHERE music_style IS NOT NULL
LIMIT 5;

-- Show table structure verification
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'lyrics_drafts'
AND column_name = 'music_style';
