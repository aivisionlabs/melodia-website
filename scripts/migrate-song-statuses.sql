-- Migration script to update song statuses from old system to new two-level system
-- Run this script to update existing database records

-- Update song_variants to include new URL fields and variant status
-- This will add the new fields if they don't exist and calculate variant status

-- First, let's see what we're working with
SELECT
  id,
  status,
  song_variants,
  created_at
FROM songs
WHERE song_variants IS NOT NULL
LIMIT 5;

-- Update songs table to ensure we have the new structure
-- Add variant status calculation based on existing data

-- For songs that are currently 'processing' or 'completed',
-- we need to calculate the new status based on variant data

-- Update songs with 'processing' status
UPDATE songs
SET
  status = CASE
    WHEN song_variants IS NULL OR jsonb_array_length(song_variants) = 0 THEN 'processing'
    WHEN EXISTS (
      SELECT 1 FROM jsonb_array_elements(song_variants) AS variant
      WHERE (variant->>'audioUrl' IS NOT NULL AND variant->>'audioUrl' != '')
         OR (variant->>'sourceAudioUrl' IS NOT NULL AND variant->>'sourceAudioUrl' != '')
    ) THEN 'completed'
    WHEN EXISTS (
      SELECT 1 FROM jsonb_array_elements(song_variants) AS variant
      WHERE (variant->>'streamAudioUrl' IS NOT NULL AND variant->>'streamAudioUrl' != '')
         OR (variant->>'sourceStreamAudioUrl' IS NOT NULL AND variant->>'sourceStreamAudioUrl' != '')
    ) THEN 'processing' -- This would be STREAM_AVAILABLE in new system
    ELSE 'processing'
  END
WHERE status = 'processing';

-- Update songs with 'completed' status to ensure they have proper variant data
UPDATE songs
SET status = 'completed'
WHERE status = 'completed'
  AND song_variants IS NOT NULL
  AND jsonb_array_length(song_variants) > 0;

-- Update song_variants to include new fields and calculate variant status
UPDATE songs
SET song_variants = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', variant->>'id',
      'audioUrl', variant->>'audioUrl',
      'sourceAudioUrl', variant->>'sourceAudioUrl',
      'streamAudioUrl', variant->>'streamAudioUrl',
      'sourceStreamAudioUrl', variant->>'sourceStreamAudioUrl',
      'imageUrl', variant->>'imageUrl',
      'sourceImageUrl', variant->>'sourceImageUrl',
      'prompt', variant->>'prompt',
      'modelName', variant->>'modelName',
      'title', variant->>'title',
      'tags', variant->>'tags',
      'createTime', variant->>'createTime',
      'duration', variant->>'duration',
      'variantStatus', CASE
        WHEN variant->>'sourceStreamAudioUrl' IS NOT NULL AND variant->>'sourceStreamAudioUrl' != '' THEN
          CASE
            WHEN (variant->>'audioUrl' IS NOT NULL AND variant->>'audioUrl' != '')
              OR (variant->>'sourceAudioUrl' IS NOT NULL AND variant->>'sourceAudioUrl' != '')
            THEN 'DOWNLOAD_READY'
            ELSE 'STREAM_READY'
          END
        ELSE 'PENDING'
      END,
      -- Legacy fields for backward compatibility
      'downloadStatus', CASE
        WHEN (variant->>'audioUrl' IS NOT NULL AND variant->>'audioUrl' != '')
          OR (variant->>'sourceAudioUrl' IS NOT NULL AND variant->>'sourceAudioUrl' != '')
        THEN 'ready'
        ELSE 'pending'
      END,
      'isLoading', CASE
        WHEN variant->>'sourceStreamAudioUrl' IS NOT NULL AND variant->>'sourceStreamAudioUrl' != '' THEN false
        ELSE true
      END
    )
  )
  FROM jsonb_array_elements(song_variants) AS variant
)
WHERE song_variants IS NOT NULL
  AND jsonb_array_length(song_variants) > 0;

-- Update song requests status to match songs
UPDATE song_requests
SET status = 'completed'
WHERE id IN (
  SELECT song_request_id
  FROM songs
  WHERE status = 'completed'
);

UPDATE song_requests
SET status = 'processing'
WHERE id IN (
  SELECT song_request_id
  FROM songs
  WHERE status = 'processing'
);

UPDATE song_requests
SET status = 'failed'
WHERE id IN (
  SELECT song_request_id
  FROM songs
  WHERE status = 'failed'
);

-- Verify the migration
SELECT
  'Migration Summary' as summary,
  COUNT(*) as total_songs,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_songs,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_songs,
  COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_songs
FROM songs;

-- Show sample of updated data
SELECT
  id,
  status,
  jsonb_pretty(song_variants) as variants_sample
FROM songs
WHERE song_variants IS NOT NULL
LIMIT 3;

-- Show variant status distribution
SELECT
  variant_status,
  COUNT(*) as count
FROM (
  SELECT
    jsonb_array_elements(song_variants)->>'variantStatus' as variant_status
  FROM songs
  WHERE song_variants IS NOT NULL
) as variant_statuses
GROUP BY variant_status
ORDER BY count DESC;
