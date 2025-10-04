-- Fix songs table schema to match Drizzle schema
-- This script adds missing columns to the songs table

-- Add missing columns
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS title TEXT,
ADD COLUMN IF NOT EXISTS lyrics TEXT,
ADD COLUMN IF NOT EXISTS timestamp_lyrics JSONB,
ADD COLUMN IF NOT EXISTS timestamped_lyrics_variants JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS timestamped_lyrics_api_responses JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS music_style TEXT,
ADD COLUMN IF NOT EXISTS song_requester TEXT,
ADD COLUMN IF NOT EXISTS prompt TEXT,
ADD COLUMN IF NOT EXISTS song_url TEXT,
ADD COLUMN IF NOT EXISTS duration NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS user_id INTEGER,
ADD COLUMN IF NOT EXISTS sequence INTEGER,
ADD COLUMN IF NOT EXISTS negative_tags TEXT,
ADD COLUMN IF NOT EXISTS suno_variants JSONB,
ADD COLUMN IF NOT EXISTS suno_task_id TEXT;

-- Update existing records to have default values for required fields
UPDATE songs
SET title = 'Untitled Song',
    slug = 'song-' || id || '-' || extract(epoch from created_at)::text
WHERE title IS NULL OR slug IS NULL;

-- Make title and slug NOT NULL after setting defaults
ALTER TABLE songs
ALTER COLUMN title SET NOT NULL,
ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint on slug if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'songs_slug_key'
    ) THEN
        ALTER TABLE songs ADD CONSTRAINT songs_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_title ON songs(title);
CREATE INDEX IF NOT EXISTS idx_songs_music_style ON songs(music_style);
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_songs_sequence ON songs(sequence);
CREATE INDEX IF NOT EXISTS idx_songs_suno_task_id ON songs(suno_task_id);

-- Update add_to_library default to true
ALTER TABLE songs ALTER COLUMN add_to_library SET DEFAULT true;

-- Update is_deleted default to false
ALTER TABLE songs ALTER COLUMN is_deleted SET DEFAULT false;

-- Update status default to 'draft'
ALTER TABLE songs ALTER COLUMN status SET DEFAULT 'draft';

COMMIT;
