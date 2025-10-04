-- Updated Migration Script for Songs to Public Library with Timestamped Lyrics
-- This script includes actual timestamped lyrics data and uses COMPLETED status

-- Enable required extension
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

-- Step 2: Create song requests with COMPLETED status
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
    'COMPLETED' as status,
    s.created_at,
    s.created_at
FROM (VALUES
    ('Ruchi My Queen', 'Rap', 'ruchi-my-queen', '/audio/ruchi-my-queen.mp3', 179.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Kaleidoscope Heart', 'Romantic Song', 'kaleidoscope-heart', '/audio/kaleidoscope.mp3', 189.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Same Office, Different Hearts', 'Love Story', 'same-office-different-hearts', '/audio/office-love.mp3', 195.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A kid''s night musical', 'Musical', 'kids-night-musical', '/audio/kids-musical.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Lipsa Birthday Song', 'Birthday Song', 'lipsa-birthday-song', '/audio/lipsa-birthday.mp3', 142.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Nirvan''s Birthday Song', 'Birthday Party', 'nirvan-s-birthday-song', '/audio/nirvan-birthday.mp3', 113.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ram and Akanksha''s wedding anthem', 'Wedding Song', 'ram-and-akanksha-s-wedding-anthem', '/audio/wedding-anthem.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Unchained', 'Motivational Song', 'unchained', '/audio/unchained.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Birthday Boy''s Blue Party', 'Kids Birthday Song', 'birthday-boy-s-blue-party', '/audio/blue-party.mp3', 150.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Sweet Dreams Tonight', 'Lullaby', 'sweet-dreams-tonight', '/audio/sweet-dreams-tonight.mp3', 200.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Akash''s Birthday Bash Song', 'Birthday Song', 'akash-s-birthday-bash-song', '/audio/akash-birthday.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaara', 'Romantic Song', 'yaara', '/audio/yaara.mp3', 197.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Har Lamha Naya', 'Love Song', 'har-lamha-naya', '/audio/har-lamha-naya.mp3', 269.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jashn-e-Hemali', 'Birthday Party Song', 'jashn-e-hemali', '/audio/jashn-e-hemali.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jassi-di-jaan', 'Punjabi Love Song', 'jassi-di-jaan', '/audio/jassi-di-jaan.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A Dream Named Jivy', 'Mother''s Love Lullaby', 'a-dream-named-jivy', '/audio/a-dream-named-jivy.mp3', 274.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Resham Ki Dor', 'Soulful Indian Pop/Folk', 'resham-ki-dor', '/audio/resham-ki-dor.mp3', 251.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Starlight Lullaby', 'Acoustic Lullaby', 'starlight-lullaby', '/audio/starlight-lullaby.mp3', 154.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Meri Jannat', 'Soulful Acoustic Ballad', 'meri-jannat', '/audio/meri-jannat.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaaron Waali Pool Party', 'Party Song', 'yaaron-waali-pool-party', '/audio/yaaron-pool-party.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Aaj Tumhara Din Hai', 'Birthday Celebration', 'aaj-tumhara-din-hai', '/audio/birthday-celebration.mp3', 165.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Musical Memories', 'Instrumental', 'musical-memories', '/audio/musical-memories.mp3', 185.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Mere Dil Ki Kahani', 'Sentimental Song', 'mere-dil-ki-kahani', '/audio/heart-story.mp3', 172.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Dosti Ke Geet', 'Friendship Song', 'dosti-ke-geet', '/audio/friendship-song.mp3', 158.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ek Saath Hum Kal Tak', 'Together Forever Song', 'ek-saath-hum-kal-tak', '/audio/together-forever.mp3', 175.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Chai Aur Pyaar', 'Reflection Song', 'chai-aur-pyaar', '/audio/tea-and-love.mp3', 168.00, '2024-01-01 00:00:00+00'::timestamp)
) s(title, music_style, slug, song_url, duration, created_at)
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
    CONCAT('This ', sd.music_style, ' composition showcases the artistry and emotional depth available in our库. The lyrics offer an authentic musical experience for listeners.') as generated_text,
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
    ('Same Office, Different Hearts', 'Love Story', '2024-01-01 00:00:00+00'::timestamp),
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

-- Step 4: Create songs table entries with actual timestamped lyrics
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
    'COMPLETED' as status,
    true as is_featured,
    '{}'::jsonb as song_variants,
    '{}'::jsonb as variant_timestamp_lyrics_api_response,
    CASE
        WHEN ss.title = 'Ruchi My Queen' THEN
            '[{"end": 10592, "text": "(Verse 1)", "index": 0, "start": 9894}, {"end": 13298, "text": "Yo, check the mic, one two, this ain''t no fake news,", "index": 1, "start": 10612}]'::jsonb
        WHEN ss.title = 'Kaleidoscope Heart' THEN
            '[{"end": 9894, "text": "(Verse 1)", "index": 0, "start": 9415}, {"end": 14681, "text": "One minute it''s sunshine, you''re lighting up the room", "index": 1, "start": 9947}]'::jsonb
        WHEN ss.title = 'Same Office, Different Hearts' THEN
            '[{"end": 8916, "text": "[Verse 1]", "index": 0, "start": 8916}, {"end": 12631, "text": "Coffee breaks turned into something more", "index": 1, "start": 8916}]'::jsonb
        WHEN ss.title = 'A kid''s night musical' THEN
            '[{"end": 743, "text": "[Verse 1]", "index": 0, "start": 743}, {"end": 14117, "text": "Close your eyes, little Disha dear,", "index": 1, "start": 743}]'::jsonb
        ELSE '{}'::jsonb
    END as variant_timestamp_lyrics_processed,
    jsonb_build_object(
        'duration', ss.duration,
        'song_url', ss.song_url,
        'original_migration', true,
        'migration_date', NOW(),
        'has_timestamped_lyrics', CASE
            WHEN ss.title IN ('Ruchi My Queen', 'Kaleidoscope Heart', 'Same Office, Different Hearts', 'A kid''s night musical') THEN true
            ELSE false
        END
    ) as metadata,
    ld.id as approved_lyrics_id,
    'Melodia' as service_provider,
    ARRAY[ss.music_style] as categories,
    ARRAY[]::text[] as tags,
    true as add_to_library,
    false as is_deleted,
    ss.created_at
FROM (VALUES
    ('Ruchi My Queen', 'Rap', 'ruchi-my-queen', '/audio/ruchi-my-queen.mp3', 179.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Kaleidoscope Heart', 'Romantic Song', 'kaleidoscope-heart', '/audio/kaleidoscope.mp3', 189.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Same Office, Different Hearts', 'Love Story', 'same-office-different-hearts', '/audio/office-love.mp3', 195.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A kid''s night musical', 'Musical', 'kids-night-musical', '/audio/kids-musical.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Lipsa Birthday Song', 'Birthday Song', 'lipsa-birthday-song', '/audio/lipsa-birthday.mp3', 142.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Nirvan''s Birthday Song', 'Birthday Party', 'nirvan-s-birthday-song', '/audio/nirvan-birthday.mp3', 113.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ram and Akanksha''s wedding anthem', 'Wedding Song', 'ram-and-akanksha-s-wedding-anthem', '/audio/wedding-anthem.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Unchained', 'Motivational Song', 'unchained', '/audio/unchained.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Birthday Boy''s Blue Party', 'Kids Birthday Song', 'birthday-boy-s-blue-party', '/audio/blue-party.mp3', 150.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Sweet Dreams Tonight', 'Lullaby', 'sweet-dreams-tonight', '/audio/sweet-dreams-tonight.mp3', 200.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Akash''s Birthday Bash Song', 'Birthday Song', 'akash-s-birthday-bash-song', '/audio/akash-birthday.mp3', 181.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaara', 'Romantic Song', 'yaara', '/audio/yaara.mp3', 197.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Har Lamha Naya', 'Love Song', 'har-lamha-naya', '/audio/har-lamha-naya.mp3', 269.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jashn-e-Hemali', 'Birthday Party Song', 'jashn-e-hemali', '/audio/jashn-e-hemali.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Jassi-di-jaan', 'Punjabi Love Song', 'jassi-di-jaan', '/audio/jassi-di-jaan.mp3', 174.00, '2024-01-01 00:00:00+00'::timestamp),
    ('A Dream Named Jivy', 'Mother''s Love Lullaby', 'a-dream-named-jivy', '/audio/a-dream-named-jivy.mp3', 274.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Resham Ki Dor', 'Soulful Indian Pop/Folk', 'resham-ki-dor', '/audio/resham-ki-dor.mp3', 251.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Starlight Lullaby', 'Acoustic Lullaby', 'starlight-lullaby', '/audio/starlight-lullaby.mp3', 154.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Meri Jannat', 'Soulful Acoustic Ballad', 'meri-jannat', '/audio/meri-jannat.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Yaaron Waali Pool Party', 'Party Song', 'yaaron-waali-pool-party', '/audio/yaaron-pool-party.mp3', 180.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Aaj Tumhara Din Hai', 'Birthday Celebration', 'aaj-tumhara-din-hai', '/audio/birthday-celebration.mp3', 165.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Musical Memories', 'Instrumental', 'musical-memories', '/audio/musical-memories.mp3', 185.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Mere Dil Ki Kahani', 'Sentimental Song', 'mere-dil-ki-kahani', '/audio/heart-story.mp3', 172.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Dosti Ke Geet', 'Friendship Song', 'dosti-ke-geet', '/audio/friendship-song.mp3', 158.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Ek Saath Hum Kal Tak', 'Together Forever Song', 'ek-saath-hum-kal-tak', '/audio/together-forever.mp3', 175.00, '2024-01-01 00:00:00+00'::timestamp),
    ('Chai Aur Pyaar', 'Reflection Song', 'chai-aur-pyaar', '/audio/tea-and-love.mp3', 168.00, '2024-01-01 00:00:00+00'::timestamp)
) ss(title, music_style, slug, song_url, duration, created_at)
JOIN song_requests sr ON sr.requester_name = 'admin'
    AND sr.recipient_details = CONCAT('Public Library Song: ', ss.title)
JOIN lyrics_drafts ld ON ld.song<｜tool▁sep｜>_request_id = sr.id
    AND ld.song_title = ss.title;

-- Step 5: Verify the migration
SELECT
    'Migration Complete' as status,
    COUNT(*) as songs_migrated,
    COUNT(CASE WHEN add_to_library = true THEN 1 END) as library_songs,
    COUNT(CASE WHEN is_featured = true THEN 1 END) as featured_songs,
    COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed_status_count,
    COUNT(CASE WHEN variant_timestamp_lyrics_processed != '{}' THEN 1 END) as songs_with_timestamped_lyrics
FROM songs
WHERE song_request_id IN (
    SELECT id FROM song_requests WHERE requester_name = 'admin'
);

COMMIT;
