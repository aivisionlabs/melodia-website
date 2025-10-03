-- Simple Migration Script for Songs to Public Library
-- This script uses a safer approach with minimal JSON data to avoid SQL parsing issues

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

-- Step 2: Create song requests
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
)
SELECT
    u.id as user_id,
    'admin' as requester_name,
    CONCAT('Public Library Song: ', s.title) as recipient_details,
    'Public Library' as occasion,
    'English' as languages,
    ARRAY['melodic', 'pleasant'] as mood,
    CONCAT('This ', COALESCE(s.music_style, 'musical'), ' style song from the Melodia public library showcasing our musical diversity.') as song_story,
    'completed' as status,
    s.created_at,
    s.created_at
FROM (VALUES
    ('Ruchi My Queen', 'Rap', 'ruchi-my-queen', 'completed', '/audio/ruchi-my-queen.mp3', 179.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Kaleidoscope Heart', 'Romantic Song', 'kaleidoscope-heart', 'completed', '/audio/kaleidoscope.mp3', 189.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Same Office, Different Hearts', 'Corporate Romance', 'same-office-hearts', 'completed', '/audio/same-office-hearts.mp3', 195.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A kid''s night musical', 'Musical', 'kids-night-musical', 'completed', '/audio/kids-musical.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Lipsa Birthday Song', 'Birthday Song', 'lipsa-birthday-song', 'completed', '/audio/lipsa-birthday.mp3', 142.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Nirvan''s Birthday Song', 'Birthday Party', 'nirvan-birthday-song', 'completed', '/audio/nirvan-birthday.mp3', 113.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ram and Akanksha''s wedding anthem', 'Wedding Song', 'ram-akanksha-wedding-anthem', 'completed', '/audio/wedding-anthem.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Unchained', 'Motivational Song', 'unchained', 'completed', '/audio/unchained.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Birthday Boy''s Blue Party', 'Kids Birthday Song', 'birthday-blue-party', 'completed', '/audio/blue-party.mp3', 150.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Sweet Dreams Tonight', 'Lullaby', 'sweet-dreams-tonight', 'completed', '/audio/sweet-dreams-tonight.mp3', 200.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Akash''s Birthday Bash Song', 'Birthday Song', 'akash-birthday-bash', 'completed', '/audio/akash-birthday.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaara', 'Romantic Song', 'yaara', 'completed', '/audio/yaara.mp3', 197.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Har Lamha Naya', 'Love Song', 'har-lamha-naya', 'completed', '/audio/har-lamha-naya.mp3', 269.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jashn-e-Hemali', 'Birthday Party Song', 'jashn-e-hemali', 'completed', '/audio/jashn-e-hemali.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jassi-di-jaan', 'Punjabi Love Song', 'jassi-di-jaan', 'completed', '/audio/jassi-di-jaan.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A Dream Named Jivy', 'Mother''s Love Lullaby', 'a-dream-named-jivy', 'completed', '/audio/a-dream-named-jivy.mp3', 274.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Resham Ki Dor', 'Soulful Indian Pop/Folk', 'resham-ki-dor', 'completed', '/audio/resham-ki-dor.mp3', 251.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Starlight Lullaby', 'Acoustic Lullaby', 'starlight-lullaby', 'completed', '/audio/starlight-lullaby.mp3', 154.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Meri Jannat', 'Soulful Acoustic Ballad', 'meri-jannat', 'completed', '/audio/meri-jannat.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaaron Waali Pool Party', 'Party Song', 'yaaron-waali-pool-party', 'completed', '/audio/yaaron-pool-party.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Aaj Tumhara Din Hai', 'Birthday Celebration', 'aaj-tumhara-din-hai', 'completed', '/audio/birthday-celebration.mp3', 165.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Musical Memories', 'Instrumental', 'musical-memories', 'completed', '/audio/musical-memories.mp3', 185.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Mere Dil Ki Kahani', 'Sentimental Song', 'mere-dil-ki-kahani', 'completed', '/audio/heart-story.mp3', 172.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Dosti Ke Geet', 'Friendship Song', 'dosti-ke-geet', 'completed', '/audio/friendship-song.mp3', 158.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ek Saath Hum Kal Tak', 'Together Forever Song', 'ek-saath-hum-kal-tak', 'completed', '/audio/together-forever.mp3', 175.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Chai Aur Pyaar', 'Reflection Song', 'chai-aur-pyaar', 'completed', '/audio/tea-and-love.mp3', 168.00, '2024-01-01 00:00:00+00'::timestamp)
) s(title, music_style, slug, status, song_url, duration, created_at)
CROSS JOIN (SELECT id FROM users WHERE email = 'admin_db@melodia.com') u;

-- Step 3: Create lyrics drafts
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
    CONCAT('This ', sd.music_style, ' composition showcases the artistry and emotional depth available in our library. The lyrics offer an authentic musical experience for listeners.') as generated_text,
    sd.title as song_title,
    sd.music_style,
    'gpt-4-turbo' as llm_model_name,
    'approved' as status,
    u.id as created_by_user_id,
    sd.created_at,
    sd.created_at
FROM (VALUES
    ('Ruchi My Queen', 'Rap', '2024-01-01 00:00:00+00'::timestamp),
    ('Kaleidoscope Heart', 'Romantic Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Same Office, Different Hearts', 'Corporate Romance', '2024-01-01 00:00:00+00'::timestamp),
    ('A kid''s night musical', 'Musical', '2024-01-01 00:00:00+00'::timestamp),
    ('Lipsa Birthday Song', 'Birthday Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Nirvan''s Birthday Song', 'Birthday Party', '2024-01-01 00:00:00+00'::timestamp),
    ('Ram and Akanksha''s wedding anthem', 'Wedding Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Unchained', 'Motivational Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Birthday Boy''s Blue Party', 'Kids Birthday Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Sweet Dreams Tonight', 'Lullaby', '2024-01-01 00:00:00+00'::timestamp),
    ('Akash''s Birthday Bash Song', 'Birthday Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Yaara', 'Romantic Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Har Lamha Naya', 'Love Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Jashn-e-Hemali', 'Birthday Party Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Jassi-di-jaan', 'Punjabi Love Song', '2024-01-01 00:00:00+00'::timestamp),
    ('A Dream Named Jivy', 'Mother''s Love Lullaby', '2024-01-01 00:00:00+00'::timestamp),
    ('Resham Ki Dor', 'Soulful Indian Pop/Folk', '2024-01-01 00:00:00+00'::timestamp),
    ('Starlight Lullaby', 'Acoustic Lullaby', '2024-01-01 00:00:00+00'::timestamp),
    ('Meri Jannat', 'Soulful Acoustic Ballad', '2024-01-01 00:00:00+00'::timestamp),
    ('Yaaron Waali Pool Party', 'Party Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Aaj Tumhara Din Hai', 'Birthday Celebration', '2024-01-01 00:00:00+00'::timestamp),
    ('Musical Memories', 'Instrumental', '2024-01-01 00:00:00+00'::timestamp),
    ('Mere Dil Ki Kahani', 'Sentimental Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Dosti Ke Geet', 'Friendship Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Ek Saath Hum Kal Tak', 'Together Forever Song', '2024-01-01 00:00:00+00'::timestamp),
    ('Chai Aur Pyaar', 'Reflection Song', '2024-01-01 00:00:00+00'::timestamp)
) sd(title, music_style, created_at)
JOIN song_requests sr ON sr.requester_name = 'admin'
    AND sr.recipient_details = CONCAT('Public Library Song: ', sd.title)
CROSS JOIN (SELECT id FROM users WHERE email = 'admin_db@melodia.com') u;

-- Step 4: Create songs table entries
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
    created_at
)
SELECT
    sr.id as song_request_id,
    ss.slug,
    ss.status,
    true as is_featured,
    '{}'::jsonb as song_variants,
    '{}'::jsonb as variant_timestamp_lyrics_api_response,
    '{}'::jsonb as variant_timestamp_lyrics_processed,
    jsonb_build_object(
        'duration', ss.duration,
        'song_url', ss.song_url,
        'original_migration', true,
        'migration_date', NOW()
    ) as metadata,
    ld.id as approved_lyrics_id,
    'Melodia' as service_provider,
    ARRAY[ss.music_style] as categories,
    ARRAY[]::text[] as tags,
    true as add_to_library,
    false as is_deleted,
    ss.created_at
FROM (VALUES
    ('Ruchi My Queen', 'Rap', 'ruchi-my-queen', 'completed', '/audio/ruchi-my-queen.mp3', 179.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Kaleidoscope Heart', 'Romantic Song', 'kaleidoscope-heart', 'completed', '/audio/kaleidoscope.mp3', 189.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Same Office, Different Hearts', 'Corporate Romance', 'same-office-hearts', 'completed', '/audio/same-office-hearts.mp3', 195.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A kid''s night musical', 'Musical', 'kids-night-musical', 'completed', '/audio/kids-musical.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Lipsa Birthday Song', 'Birthday Song', 'lipsa-birthday-song', 'completed', '/audio/lipsa-birthday.mp3', 142.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Nirvan''s Birthday Song', 'Birthday Party', 'nirvan-birthday-song', 'completed', '/audio/nirvan-birthday.mp3', 113.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ram and Akanksha''s wedding anthem', 'Wedding Song', 'ram-akanksha-wedding-anthem', 'completed', '/audio/wedding-anthem.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Unchained', 'Motivational Song', 'unchained', 'completed', '/audio/unchained.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Birthday Boy''s Blue Party', 'Kids Birthday Song', 'birthday-blue-party', 'completed', '/audio/blue-party.mp3', 150.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Sweet Dreams Tonight', 'Lullaby', 'sweet-dreams-tonight', 'completed', '/audio/sweet-dreams-tonight.mp3', 200.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Akash''s Birthday Bash Song', 'Birthday Song', 'akash-birthday-bash', 'completed', '/audio/akash-birthday.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaara', 'Romantic Song', 'yaara', 'completed', '/audio/yaara.mp3', 197.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Har Lamha Naya', 'Love Song', 'har-lamha-naya', 'completed', '/audio/har-lamha-naya.mp3', 269.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jashn-e-Hemali', 'Birthday Party Song', 'jashn-e-hemali', 'completed', '/audio/jashn-e-hemali.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jassi-di-jaan', 'Punjabi Love Song', 'jassi-di-jaan', 'completed', '/audio/jassi-di-jaan.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A Dream Named Jivy', 'Mother''s Love Lullaby', 'a-dream-named-jivy', 'completed', '/audio/a-dream-named-jivy.mp3', 274.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Resham Ki Dor', 'Soulful Indian Pop/Folk', 'resham-ki-dor', 'completed', '/audio/resham-ki-dor.mp3', 251.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Starlight Lullaby', 'Acoustic Lullaby', 'starlight-lullaby', 'completed', '/audio/starlight-lullaby.mp3', 154.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Meri Jannat', 'Soulful Acoustic Ballad', 'meri-jannat', 'completed', '/audio/meri-jannat.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaaron Waali Pool Party', 'Party Song', 'yaaron-waali-pool-party', 'completed', '/audio/yaaron-pool-party.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Aaj Tumhara Din Hai', 'Birthday Celebration', 'aaj-tumhara-din-hai', 'completed', '/audio/birthday-celebration.mp3', 165.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Musical Memories', 'Instrumental', 'musical-memories', 'completed', '/audio/musical-memories.mp3', 185.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Mere Dil Ki Kahani', 'Sentimental Song', 'mere-dil-ki-kahani', 'completed', '/audio/heart-story.mp3', 172.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Dosti Ke Geet', 'Friendship Song', 'dosti-ke-geet', 'completed', '/audio/friendship-song.mp3', 158.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ek Saath Hum Kal Tak', 'Together Forever Song', 'ek-saath-hum-kal-tak', 'completed', '/audio/together-forever.mp3', 175.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Chai Aur Pyaar', 'Reflection Song', 'chai-aur-pyaar', 'completed', '/audio/tea-and-love.mp3', 168.00, '2024-01-01 00:00:00+00'::timestamp)
) ss(title, music_style, slug, status, song_url, duration, created_at)
JOIN song_requests sr ON sr.requester_name = 'admin'
    AND sr.recipient_details = CONCAT('Public Library Song: ', ss.title)
JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    AND ld.song_title = ss.title;

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

COMMIT;
