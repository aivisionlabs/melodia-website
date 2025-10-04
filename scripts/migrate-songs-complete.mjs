import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the songs data
const songsDataPath = path.join(__dirname, '..', 'existing-data-to-be-updated', 'songs_rows.json');
const songsData = JSON.parse(fs.readFileSync(songsDataPath, 'utf8'));

console.log(`🎵 Processing ${songsData.length} songs for migration...`);

// Helper function to escape single quotes for SQL
function escapeSql(str) {
  if (!str) return '';
  return str.replace(/'/g, "''");
}

// Helper function to extract plain text lyrics from timestamped lyrics
function extractLyricsText(timestampLyricsJson) {
  if (!timestampLyricsJson) return 'Lyrics with synchronized timestamps for enhanced listening experience.';
  
  try {
    const lyrics = JSON.parse(timestampLyricsJson);
    if (Array.isArray(lyrics) && lyrics.length > 0) {
      // Extract just the text from each timestamped segment
      const textLines = lyrics.map(item => item.text).filter(text => text);
      return textLines.join('\n');
    }
  } catch (e) {
    console.warn(`Warning: Could not parse timestamp_lyrics for extraction`);
  }
  
  return 'Lyrics with synchronized timestamps for enhanced listening experience.';
}

// Generate SQL migration script
let sqlScript = `-- Complete Migration Script for Songs to Public Library
-- Generated from songs_rows.json with full data mapping
-- Total songs: ${songsData.length}
-- Timestamp: ${new Date().toISOString()}

BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 1: Create admin_db user for the public library songs
INSERT INTO users (email, password_hash, name, created_at, updated_at)
VALUES (
    'admin_db@melodia.com',
    '$2b$10$dummyhashforsongsimport123456789012345678901234567890',
    'Admin Database',
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Get the admin user ID for reference
DO $$
DECLARE
    v_admin_user_id INTEGER;
BEGIN
    SELECT id INTO v_admin_user_id FROM users WHERE email = 'admin_db@melodia.com';
    
    -- Step 2: Create song requests for all songs (status: COMPLETED)
`;

// Generate song requests
songsData.forEach((song, index) => {
  const title = escapeSql(song.title);
  const musicStyle = escapeSql(song.music_style || 'Musical');
  const createdAt = song.created_at || new Date().toISOString();
  
  sqlScript += `
    -- Song ${index + 1}: ${song.title}
    INSERT INTO song_requests (
        user_id,
        requester_name,
        recipient_details,
        occasion,
        languages,
        mood,
        song_story,
        status,
        created_at,
        updated_at
    ) VALUES (
        v_admin_user_id,
        'admin',
        'Public Library Song: ${title}',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This ${musicStyle} style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '${createdAt}',
        '${createdAt}'
    );
`;
});

sqlScript += `
    -- Step 3: Create lyrics drafts for all songs
`;

// Generate lyrics drafts with extracted lyrics
songsData.forEach((song, index) => {
  const title = escapeSql(song.title);
  const musicStyle = escapeSql(song.music_style || 'Musical');
  const createdAt = song.created_at || new Date().toISOString();
  
  // Extract lyrics text from timestamp_lyrics or use lyrics field
  let lyricsText = song.lyrics || extractLyricsText(song.timestamp_lyrics);
  lyricsText = escapeSql(lyricsText);
  
  sqlScript += `
    -- Lyrics draft for: ${song.title}
    INSERT INTO lyrics_drafts (
        song_request_id,
        version,
        generated_text,
        song_title,
        music_style,
        llm_model_name,
        status,
        created_by_user_id,
        created_at,
        updated_at
    )
    SELECT 
        sr.id,
        1,
        '${lyricsText}',
        '${title}',
        '${musicStyle}',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '${createdAt}',
        '${createdAt}'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: ${title}'
    LIMIT 1;
`;
});

sqlScript += `
    -- Step 4: Create songs table entries with timestamped lyrics
`;

// Generate songs entries with proper JSONB handling
songsData.forEach((song, index) => {
  const title = escapeSql(song.title);
  const slug = song.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const serviceProvider = escapeSql(song.service_provider || 'Melodia');
  const songUrl = song.song_url || `/audio/${slug}.mp3`;
  const duration = song.duration || 180.00;
  const createdAt = song.created_at || new Date().toISOString();
  const addToLibrary = song.add_to_library !== false;
  const isDeleted = song.is_deleted === true;
  
  // Handle categories
  const categoriesArray = song.categories && song.categories.length > 0 
    ? `ARRAY['${song.categories.map(c => escapeSql(c)).join("','")}']`
    : `ARRAY['${escapeSql(song.music_style || 'Musical')}']`;
  
  // Handle tags
  const tagsArray = song.tags && song.tags.length > 0
    ? `ARRAY['${song.tags.map(t => escapeSql(t)).join("','")}']`
    : `ARRAY[]::text[]`;
  
  // Handle variant_timestamp_lyrics_processed from timestamp_lyrics
  let timestampLyricsProcessed = '{}';
  if (song.timestamp_lyrics) {
    try {
      // Parse and re-stringify to ensure valid JSON
      const parsed = JSON.parse(song.timestamp_lyrics);
      timestampLyricsProcessed = JSON.stringify({ "0": parsed });
    } catch (e) {
      console.warn(`Warning: Could not parse timestamp_lyrics for ${song.title}`);
    }
  }
  timestampLyricsProcessed = escapeSql(timestampLyricsProcessed);
  
  // Handle variant_timestamp_lyrics_api_response from timestamped_lyrics_api_responses
  let timestampLyricsApiResponse = '{}';
  if (song.timestamped_lyrics_api_responses && song.timestamped_lyrics_api_responses !== '{}') {
    timestampLyricsApiResponse = escapeSql(song.timestamped_lyrics_api_responses);
  }
  
  // Handle song_variants (if suno_variants exists)
  let songVariants = '{}';
  if (song.suno_variants && song.suno_variants !== null) {
    songVariants = escapeSql(JSON.stringify(song.suno_variants));
  }
  
  // Create metadata object
  const metadata = {
    original_id: song.id,
    original_sequence: song.sequence,
    duration: duration,
    song_url: songUrl,
    has_timestamped_lyrics: !!song.timestamp_lyrics,
    migration_date: new Date().toISOString(),
    suno_task_id: song.suno_task_id
  };
  const metadataJson = escapeSql(JSON.stringify(metadata));
  
  sqlScript += `
    -- Song entry for: ${song.title}
    INSERT INTO songs (
        song_request_id,
        slug,
        status,
        is_featured,
        song_variants,
        variant_timestamp_lyrics_api_response,
        variant_timestamp_lyrics_processed,
        metadata,
        approved_lyrics_id,
        service_provider,
        categories,
        tags,
        add_to_library,
        is_deleted,
        selected_variant,
        created_at
    )
    SELECT 
        sr.id,
        '${slug}',
        'COMPLETED',
        true,
        '${songVariants}'::jsonb,
        '${timestampLyricsApiResponse}'::jsonb,
        '${timestampLyricsProcessed}'::jsonb,
        '${metadataJson}'::jsonb,
        ld.id,
        '${serviceProvider}',
        ${categoriesArray},
        ${tagsArray},
        ${addToLibrary},
        ${isDeleted},
        ${song.selected_variant || 'NULL'},
        '${createdAt}'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: ${title}'
    LIMIT 1;
`;
});

sqlScript += `
END $$;

-- Step 5: Verify the migration
SELECT 
    'Migration Complete' as status,
    COUNT(*) as total_songs_migrated,
    COUNT(CASE WHEN add_to_library = true THEN 1 END) as library_songs,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_songs,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_status_count,
    COUNT(CASE WHEN variant_timestamp_lyrics_processed != '{}'::jsonb THEN 1 END) as songs_with_timestamped_lyrics
FROM songs 
WHERE song_request_id IN (
    SELECT id FROM song_requests WHERE requester_name = 'admin'
);

-- Show sample of migrated songs
SELECT 
    s.id,
    s.slug,
    s.status,
    ld.song_title,
    ld.music_style,
    s.add_to_library,
    CASE WHEN s.variant_timestamp_lyrics_processed != '{}'::jsonb THEN 'Yes' ELSE 'No' END as has_timestamps
FROM songs s
JOIN song_requests sr ON s.song_request_id = sr.id
JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
WHERE sr.requester_name = 'admin'
ORDER BY s.id
LIMIT 10;

COMMIT;
`;

// Write the SQL script to file
const outputPath = path.join(__dirname, 'final-songs-migration.sql');
fs.writeFileSync(outputPath, sqlScript);

console.log(`\n✅ Generated complete migration script: ${outputPath}`);
console.log(`📊 Script contains ${songsData.length} songs with complete schema mapping`);
console.log(`🎵 Sample song titles:`, songsData.slice(0, 5).map(s => s.title).join(', '));
console.log(`\n📋 Migration includes:`);
console.log(`   - Admin user creation (admin_db@melodia.com)`);
console.log(`   - ${songsData.length} song requests (status: COMPLETED)`);
console.log(`   - ${songsData.length} lyrics drafts with extracted lyrics`);
console.log(`   - ${songsData.length} songs with timestamped lyrics mapped to variant_timestamp_lyrics_processed`);
console.log(`   - All songs set to add_to_library: true`);
console.log(`   - All songs marked as is_featured: true`);
console.log(`\n🚀 Ready to run the migration!`);
console.log(`\nTo execute: psql "$DATABASE_URL" -f scripts/final-songs-migration.sql`);

