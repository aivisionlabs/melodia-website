-- Add anonymous_user_id column to song_requests table
-- This is needed for the create-song-v2 flow

ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS anonymous_user_id TEXT;

-- Add comment for documentation
COMMENT ON COLUMN song_requests.anonymous_user_id IS 'For onboarding anonymous flow - stores anonymous user ID from localStorage';

-- Verify the column was added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'song_requests' 
AND column_name = 'anonymous_user_id';
