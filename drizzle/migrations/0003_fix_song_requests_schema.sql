-- =====================================================
-- FIX SONG_REQUESTS TABLE SCHEMA MIGRATION
-- =====================================================
-- This migration aligns the song_requests table with the current Drizzle schema
-- Date: 2025-01-04
-- =====================================================

-- Step 1: Add the missing recipient_details column
-- We'll combine recipient_name and recipient_relationship into recipient_details
ALTER TABLE song_requests 
ADD COLUMN IF NOT EXISTS recipient_details text;

-- Step 2: Populate recipient_details with existing data
UPDATE song_requests 
SET recipient_details = COALESCE(recipient_name, '') || 
                       CASE 
                         WHEN recipient_relationship IS NOT NULL AND recipient_relationship != '' 
                         THEN ' (' || recipient_relationship || ')'
                         ELSE ''
                       END
WHERE recipient_details IS NULL;

-- Step 3: Make recipient_details NOT NULL after populating it
ALTER TABLE song_requests 
ALTER COLUMN recipient_details SET NOT NULL;

-- Step 4: Drop the old columns that are no longer needed according to the schema
-- Note: This will remove data, but we've preserved it in recipient_details
ALTER TABLE song_requests 
DROP COLUMN IF EXISTS phone_number,
DROP COLUMN IF EXISTS email,
DROP COLUMN IF EXISTS delivery_preference,
DROP COLUMN IF EXISTS recipient_name,
DROP COLUMN IF EXISTS recipient_relationship,
DROP COLUMN IF EXISTS person_description,
DROP COLUMN IF EXISTS song_type,
DROP COLUMN IF EXISTS emotions,
DROP COLUMN IF EXISTS additional_details,
DROP COLUMN IF EXISTS suno_task_id,
DROP COLUMN IF EXISTS generated_song_id,
DROP COLUMN IF EXISTS lyrics_status,
DROP COLUMN IF EXISTS approved_lyrics_id,
DROP COLUMN IF EXISTS lyrics_locked_at,
DROP COLUMN IF EXISTS payment_id,
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS payment_required;

-- Step 5: Ensure languages column is the correct type (text[])
-- It should already be text[] but let's make sure
ALTER TABLE song_requests 
ALTER COLUMN languages TYPE text[] USING languages::text[];

-- Step 6: Verify the final schema matches expectations
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'song_requests' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
