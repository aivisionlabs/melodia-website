-- Fix database schema for backward compatibility
-- Add missing fields to songs table

-- Add legacy fields for backward compatibility
ALTER TABLE songs 
ADD COLUMN IF NOT EXISTS add_to_library BOOLEAN,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN,
ADD COLUMN IF NOT EXISTS negative_tags TEXT,
ADD COLUMN IF NOT EXISTS suno_variants JSONB,
ADD COLUMN IF NOT EXISTS selected_variant INTEGER;

-- Update existing records to have proper defaults
UPDATE songs 
SET 
  add_to_library = COALESCE(add_to_library, true),
  is_deleted = COALESCE(is_deleted, false)
WHERE add_to_library IS NULL OR is_deleted IS NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_is_active ON songs(is_active);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);

-- Verify the migration
SELECT 'Database schema fix completed successfully' as status;
