-- Migration script for user authentication and song requests
-- Run this script to add user management and song request functionality

-- Add users table for regular user accounts
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add user_id to songs table (nullable for existing songs)
ALTER TABLE songs ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- Create song_requests table for form submissions
CREATE TABLE IF NOT EXISTS song_requests (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  requester_name TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  delivery_preference TEXT CHECK (delivery_preference IN ('email', 'whatsapp', 'both')),
  recipient_name TEXT NOT NULL,
  recipient_relationship TEXT NOT NULL,
  languages TEXT[] NOT NULL,
  person_description TEXT,
  song_type TEXT,
  emotions TEXT[],
  additional_details TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  suno_task_id TEXT,
  generated_song_id INTEGER REFERENCES songs(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_songs_user_id ON songs(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_song_requests_user_id ON song_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_song_requests_status ON song_requests(status);
CREATE INDEX IF NOT EXISTS idx_song_requests_created_at ON song_requests(created_at);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Regular user accounts for authentication';
COMMENT ON TABLE song_requests IS 'Song creation requests from users';
COMMENT ON COLUMN songs.user_id IS 'Reference to user who created this song (nullable for admin-created songs)';
COMMENT ON COLUMN song_requests.user_id IS 'Reference to user who made this request (nullable for guest requests)';
COMMENT ON COLUMN song_requests.status IS 'Current status of the song request: pending, processing, completed, failed';
COMMENT ON COLUMN song_requests.generated_song_id IS 'Reference to the generated song in songs table when completed';
