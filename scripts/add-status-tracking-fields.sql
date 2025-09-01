-- Add status tracking fields to songs table
-- Run this migration to add the new fields for song status checking

-- Add status tracking fields
ALTER TABLE songs ADD COLUMN IF NOT EXISTS status_checked_at TIMESTAMP;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS last_status_check TIMESTAMP;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS status_check_count INTEGER DEFAULT 0;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_suno_task_id ON songs(suno_task_id);
CREATE INDEX IF NOT EXISTS idx_songs_last_status_check ON songs(last_status_check);

-- Update existing songs to have default values
UPDATE songs 
SET status_check_count = 0 
WHERE status_check_count IS NULL;

-- Add comments for documentation
COMMENT ON COLUMN songs.status_checked_at IS 'Timestamp when the song status was last checked';
COMMENT ON COLUMN songs.last_status_check IS 'Timestamp of the most recent status check';
COMMENT ON COLUMN songs.status_check_count IS 'Number of times the song status has been checked';
