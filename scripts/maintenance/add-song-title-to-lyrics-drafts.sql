-- Migration script to add song_title column to lyrics_drafts table
-- This script adds the song_title column for storing LLM-determined song titles

-- Step 1: Add the song_title column
ALTER TABLE lyrics_drafts ADD COLUMN song_title TEXT;

-- Step 2: Add column comment
COMMENT ON COLUMN lyrics_drafts.song_title IS 'Song title determined by LLM during lyrics generation';

-- Step 3: Verify the migration
SELECT
  COUNT(*) as total_records,
  COUNT(song_title) as records_with_song_title,
  COUNT(*) - COUNT(song_title) as records_without_song_title
FROM lyrics_drafts;

-- Show sample of data
SELECT
  id,
  version,
  song_title,
  music_style,
  LENGTH(generated_text) as lyrics_length
FROM lyrics_drafts
WHERE song_title IS NOT NULL
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
AND column_name = 'song_title';
