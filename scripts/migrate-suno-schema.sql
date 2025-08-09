-- Migration script to add Suno API integration columns
-- Run this in your Supabase SQL editor

-- Add new columns to songs table
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS negative_tags TEXT,
ADD COLUMN IF NOT EXISTS suno_variants JSONB,
ADD COLUMN IF NOT EXISTS selected_variant INTEGER;

-- Add index for better performance on suno_task_id queries
CREATE INDEX IF NOT EXISTS idx_songs_suno_task_id ON songs(suno_task_id);

-- Update existing songs to have proper status
UPDATE songs
SET status = 'completed'
WHERE status IS NULL AND song_url IS NOT NULL;

-- Set default status for songs without URLs
UPDATE songs
SET status = 'draft'
WHERE status IS NULL;