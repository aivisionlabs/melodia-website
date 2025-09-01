-- Phase 6: Lyrics-First Creation Flow Migration
-- This script adds the new lyrics_drafts table and updates song_requests table

-- Add new columns to song_requests table
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS lyrics_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS approved_lyrics_id INTEGER,
ADD COLUMN IF NOT EXISTS lyrics_locked_at TIMESTAMPTZ;

-- Create lyrics_drafts table
CREATE TABLE IF NOT EXISTS lyrics_drafts (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  language TEXT[],
  tone TEXT[],
  length_hint TEXT,
  structure JSONB,
  prompt_input JSONB,
  generated_text TEXT NOT NULL,
  edited_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_req ON lyrics_drafts(song_request_id);
CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_status ON lyrics_drafts(status);
CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_version ON lyrics_drafts(version DESC);

-- Add foreign key constraint for approved_lyrics_id
ALTER TABLE song_requests 
ADD CONSTRAINT fk_song_requests_approved_lyrics 
FOREIGN KEY (approved_lyrics_id) REFERENCES lyrics_drafts(id);

-- Update existing song requests to have pending lyrics status
UPDATE song_requests 
SET lyrics_status = 'pending' 
WHERE lyrics_status IS NULL;

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for lyrics_drafts table
CREATE TRIGGER update_lyrics_drafts_updated_at 
    BEFORE UPDATE ON lyrics_drafts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE lyrics_drafts IS 'Stores lyrics drafts for song requests in Phase 6 workflow';
COMMENT ON COLUMN lyrics_drafts.song_request_id IS 'Reference to the song request this draft belongs to';
COMMENT ON COLUMN lyrics_drafts.version IS 'Version number of this draft (increments with each generation)';
COMMENT ON COLUMN lyrics_drafts.language IS 'Array of languages used in the lyrics';
COMMENT ON COLUMN lyrics_drafts.tone IS 'Array of tones/moods for the lyrics';
COMMENT ON COLUMN lyrics_drafts.length_hint IS 'Target length: short, standard, or long';
COMMENT ON COLUMN lyrics_drafts.structure IS 'JSON structure defining song sections (verse, chorus, etc.)';
COMMENT ON COLUMN lyrics_drafts.prompt_input IS 'JSON snapshot of the generation request and parameters';
COMMENT ON COLUMN lyrics_drafts.generated_text IS 'The original AI-generated lyrics text';
COMMENT ON COLUMN lyrics_drafts.edited_text IS 'User-edited version of the lyrics';
COMMENT ON COLUMN lyrics_drafts.status IS 'Current status: draft, needs_review, approved, archived';

COMMENT ON COLUMN song_requests.lyrics_status IS 'Status of lyrics workflow: pending, generating, needs_review, approved';
COMMENT ON COLUMN song_requests.approved_lyrics_id IS 'Reference to the approved lyrics draft';
COMMENT ON COLUMN song_requests.lyrics_locked_at IS 'Timestamp when lyrics were locked for song generation';

-- Verify the migration
SELECT 'Migration completed successfully' as status;
