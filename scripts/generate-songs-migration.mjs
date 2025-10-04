import fs from "fs";
import path from "path";

// Read the songs data
const songsDataPath = path.join(
  process.cwd(),
  "existing-data-to-be-updated",
  "songs_rows.json"
);
const songsData = JSON.parse(fs.readFileSync(songsDataPath, "utf8"));

console.log(`Processing ${songsData.length} songs for migration...`);

// Generate SQL migration script
let sqlScript = `-- Migration script to import existing songs data into new schema for public library
-- This script maps old song data structure to new schema design
-- Total songs to migrate: ${songsData.length} songs from songs_rows.json

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

-- Step 2: Create song requests for all songs
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
) VALUES
`;

// Generate song request inserts
const songRequests = songsData
  .map((song, index) => {
    const moods = {
      Rap: `ARRAY['energetic', 'powerful']`,
      "Romantic Song": `ARRAY['romantic', 'melodic']`,
      Musical: `ARRAY['joyful', 'upbeat']`,
      "Birthday Song": `ARRAY['celebratory', 'happy']`,
      "Corporate Romance": `ARRAY['romantic', 'professional']`,
      Pop: `ARRAY['upbeat', 'melodic']`,
      Jazz: `ARRAY['smooth', 'sophisticated']`,
      Classical: `ARRAY['elegant', 'timeless']`,
      "Hip Hop": `ARRAY['rhythmic', 'urban']`,
      Country: `ARRAY['rustic', 'heartfelt']`,
      Electronic: `ARRAY['modern', 'energetic']`,
      Rock: `ARRAY['powerful', 'passionate']`,
      "R&B": `ARRAY['smooth', 'soulful']`,
      Reggae: `ARRAY['chill', 'positive']`,
      Latin: `ARRAY['rhythmic', 'passionate']`,
      Blues: `ARRAY['emotional', 'expressive']`,
      Folk: `ARRAY['authentic', 'nostalgic']`,
      Gospel: `ARRAY['spiritual', 'uplifting']`,
      Punk: `ARRAY['rebellious', 'energetic']`,
      Ambient: `ARRAY['peaceful', 'atmospheric']`,
      Metal: `ARRAY['intense', 'powerful']`,
      Funk: `ARRAY['groovy', 'danceable']`,
    };

    const moodArray = moods[song.music_style] || `ARRAY['melodic', 'pleasant']`;
    const created_at = song.created_at || "NOW()";

    return `(u.id, 'admin', 'Public Library Song: ${
      song.title
    }', 'Public Library', 'English', ${moodArray}, 'This is a ${
      song.music_style || "musical"
    } style song from the Melodia public library showcasing our musical diversity.', 'completed', '${created_at}', '${created_at}')`;
  })
  .join(",\n");

sqlScript += songRequests;
sqlScript += `\nFROM (SELECT id FROM users WHERE email = 'admin_db@melodia.com') u;`;

// Generate lyrics drafts inserts
sqlScript += `\n\n-- Step 3: Create lyrics drafts for all songs
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
    sr.id as song_request_id,
    1 as version,
    CASE
        WHEN ts.lyrics IS NOT NULL THEN ts.lyrics
        WHEN ts.timestamp_lyrics IS NOT NULL THEN
            'This song''s lyrics are synchronized with timestamps for enhanced listening experience.'
        ELSE
            CONCAT('This ', ts.music_style, ' composition showcases the artistry and emotional depth available in our library.')
    END as generated_text,
    ts.title as song_title,
    ts.music_style,
    'gpt-4-turbo' as llm_model_name,
    'approved' as status,
    u.id as created_by_user_id,
    ts.created_at,
    ts.created_at
FROM (
    VALUES
`;

// Create temporary VALUES for lyrics_drafts
const lyricsDraftsValues = songsData
  .map((song, index) => {
    const lyrics = song.lyrics ? song.lyrics.replace(/'/g, "''") : null;
    const musicStyleText = song.music_style || "melodic";
    const generated_text =
      lyrics ||
      (song.timestamp_lyrics
        ? `This song's lyrics are synchronized with timestamps for enhanced listening experience.`
        : `This ${musicStyleText} composition showcases the artistry and emotional depth available in our library.`);

    const cleanText = generated_text.replace(/'/g, "''");
    const title = song.title.replace(/'/g, "''");
    const music_style = (song.music_style || "Musical").replace(/'/g, "''");
    const created_at = song.created_at || new Date().toISOString();

    return `(${
      index + 1
    }, '${cleanText}', '${title}', '${music_style}', '${created_at}')`;
  })
  .join(",\n");

sqlScript += lyricsDraftsValues;
sqlScript += `\n) ts(id, generated_text, title, music_style, created_at)
JOIN song_requests sr ON sr.requester_name = 'admin'
    AND sr.recipient_details = CONCAT('Public Library Song: ', ts.title)
CROSS JOIN (SELECT id FROM users WHERE email = 'admin_db@melodia.com') u;`;

// Generate songs table inserts
sqlScript += `\n\n-- Step 4: Create songs table entries
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
    sr.id as song_request_id,
    ts.slug,
    ts.status,
    true as is_featured,
    COALESCE(ts.suno_variants::jsonb, '{}'::jsonb) as song_variants,
    COALESCE(ts.timestamped_lyrics_api_responses::jsonb, '{}'::jsonb) as variant_timestamp_lyrics_api_response,
    CASE
        WHEN ts.timestamp_lyrics IS NOT NULL THEN
            jsonb_build_object('main_variant', ts.timestamp_lyrics::jsonb)
        ELSE
            '{}'::jsonb
    END as variant_timestamp_lyrics_processed,
    jsonb_build_object(
        'original_id', ts.id,
        'original_sequence', ts.sequence,
        'duration', ts.duration,
        'song_url', ts.song_url,
        'timestamped_available', CASE WHEN ts.timestamp_lyrics IS NOT NULL THEN true ELSE false END
    ) as metadata,
    ld.id as approved_lyrics_id,
    ts.service_provider,
    COALESCE(ts.categories, ARRAY[ts.music_style]) as categories,
    COALESCE(ts.tags, ARRAY[]::text[]) as tags,
    COALESCE(ts.add_to_library, true) as add_to_library,
    COALESCE(ts.is_deleted, false) as is_deleted,
    ts.selected_variant,
    ts.created_at
FROM (
    VALUES`;

// Create temporary VALUES for songs
const songsValues = songsData
  .map((song, index) => {
    const title = song.title.replace(/'/g, "''");
    const slug =
      song.slug ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    const status = song.status || "completed";
    const music_style = (song.music_style || "Musical").replace(/'/g, "''");
    const service_provider = (song.service_provider || "Melodia").replace(
      /'/g,
      "''"
    );
    const timestamp_lyrics = song.timestamp_lyrics
      ? JSON.stringify(song.timestamp_lyrics).replace(/'/g, "''")
      : null;
    const suno_variants = song.suno_variants || "{}";
    const api_responses = song.timestamped_lyrics_api_responses || "{}";
    const duration = song.duration || "180.00";
    const song_url = song.song_url || `/audio/${slug}.mp3`;
    const created_at = song.created_at || new Date().toISOString();

    return `(${
      index + 1
    }, '${title}', '${slug}', '${status}', '${music_style}', '${service_provider}', '${
      timestamp_lyrics || ""
    }', '${suno_variants}', '${api_responses}', ${duration}, '${song_url}', ${
      song.sequence
    }, '${created_at}')`;
  })
  .join(",\n");

sqlScript += songsValues;
sqlScript += `\n) ts(id, title, slug, status, music_style, service_provider, timestamp_lyrics, suno_variants, api_responses, duration, song_url, sequence, created_at)
JOIN song_requests sr ON sr.requester_name = 'admin'
    AND sr.recipient_details = CONCAT('Public Library Song: ', ts.title)
JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    AND ld.song_title = ts.title;

-- Step 5: Verify the migration
SELECT
    'Migration Complete' as status,
    COUNT(*) as songs_migrated,
    COUNT(CASE WHEN add_to_library = true THEN 1 END) as library_songs,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_songs
FROM songs
WHERE song_request_id IN (
    SELECT id FROM song_requests WHERE requester_name = 'admin'
);

COMMIT;`;

// Write the SQL script to file
const outputPath = path.join(
  process.cwd(),
  "scripts",
  "migrate-songs-to-public-library.sql"
);
fs.writeFileSync(outputPath, sqlScript);

console.log(`✅ Generated migration script: ${outputPath}`);
console.log(
  `📊 Script contains ${songsData.length} songs with complete schema mapping`
);
console.log(
  `🎵 Sample song titles:`,
  songsData
    .slice(0, 5)
    .map((s) => s.title)
    .join(", ")
);
console.log(`\n🚀 Ready to run the migration script!`);
