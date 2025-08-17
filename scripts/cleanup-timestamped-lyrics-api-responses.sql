-- Migration to clean up timestamped_lyrics_api_responses column
-- This script extracts only the alignedWords data from existing full API responses
-- and updates the column to store only the necessary data

-- First, let's see what we're working with
-- This will show songs that have full API responses stored
SELECT
    id,
    title,
    jsonb_typeof(timestamped_lyrics_api_responses) as response_type,
    CASE
        WHEN jsonb_typeof(timestamped_lyrics_api_responses) = 'object'
        THEN jsonb_object_keys(timestamped_lyrics_api_responses)
        ELSE 'N/A'
    END as variant_keys
FROM songs
WHERE timestamped_lyrics_api_responses IS NOT NULL
  AND timestamped_lyrics_api_responses != '{}'::jsonb
  AND jsonb_typeof(timestamped_lyrics_api_responses) = 'object';

-- Update songs that have full API responses to store only alignedWords
-- This handles the case where the entire API response was stored
UPDATE songs
SET timestamped_lyrics_api_responses = (
    SELECT jsonb_object_agg(
        key,
        CASE
            WHEN value->'data'->'alignedWords' IS NOT NULL
            THEN value->'data'->'alignedWords'
            ELSE value
        END
    )
    FROM jsonb_each(timestamped_lyrics_api_responses)
)
WHERE timestamped_lyrics_api_responses IS NOT NULL
  AND timestamped_lyrics_api_responses != '{}'::jsonb
  AND EXISTS (
    SELECT 1
    FROM jsonb_each(timestamped_lyrics_api_responses)
    WHERE value->'data'->'alignedWords' IS NOT NULL
  );

-- Update the column comment to reflect the new purpose
COMMENT ON COLUMN songs.timestamped_lyrics_api_responses IS 'Stores only alignedWords data from Suno API responses, not the full API response';

-- Verify the cleanup worked
SELECT
    id,
    title,
    jsonb_typeof(timestamped_lyrics_api_responses) as response_type,
    CASE
        WHEN jsonb_typeof(timestamped_lyrics_api_responses) = 'object'
        THEN jsonb_object_keys(timestamped_lyrics_api_responses)
        ELSE 'N/A'
    END as variant_keys
FROM songs
WHERE timestamped_lyrics_api_responses IS NOT NULL
  AND timestamped_lyrics_api_responses != '{}'::jsonb
LIMIT 10;
