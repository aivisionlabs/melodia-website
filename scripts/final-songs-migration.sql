-- Complete Migration Script for Songs to Public Library
-- Generated from songs_rows.json with full data mapping
-- Total songs: 26
-- Timestamp: 2025-10-03T14:04:29.150Z

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

    -- Song 1: Ruchi My Queen
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
        'Public Library Song: Ruchi My Queen',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Rap style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 2: Kaleidoscope Heart
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
        'Public Library Song: Kaleidoscope Heart',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Romantic Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 3: Same Office, Different Hearts
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
        'Public Library Song: Same Office, Different Hearts',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Love Story style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 4: A kid's night musical
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
        'Public Library Song: A kid''s night musical',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Musical style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 5: Lipsa Birthday Song
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
        'Public Library Song: Lipsa Birthday Song',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Birthday Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 6: Nirvan's Birthday Song
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
        'Public Library Song: Nirvan''s Birthday Song',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Birthday Party style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 7: Ram and Akanksha's wedding anthem
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
        'Public Library Song: Ram and Akanksha''s wedding anthem',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Wedding Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 8: Unchained
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
        'Public Library Song: Unchained',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Motivational Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 9: Birthday Boy's Blue Party
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
        'Public Library Song: Birthday Boy''s Blue Party',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Kids Birthday Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 10: Sweet Dreams Tonight
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
        'Public Library Song: Sweet Dreams Tonight',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Lullaby style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 11: Akash's Birthday Bash Song
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
        'Public Library Song: Akash''s Birthday Bash Song',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Birthday Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 12: Yaara
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
        'Public Library Song: Yaara',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Romantic Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 13: Har Lamha Naya
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
        'Public Library Song: Har Lamha Naya',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Love Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 14: Jashn-e-Hemali
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
        'Public Library Song: Jashn-e-Hemali',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Birthday Party Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 15: Jassi-di-jaan
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
        'Public Library Song: Jassi-di-jaan',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Punjabi Love Song style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 16: A Dream Named Jivy
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
        'Public Library Song: A Dream Named Jivy',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Mother''s Love Lullaby style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    );

    -- Song 17: Resham Ki Dor
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
        'Public Library Song: Resham Ki Dor',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This This song would be best produced as a Soulful Indian Pop/Folk ballad. The arrangement should be minimalistic and heartfelt, led by an acoustic guitar or a soft piano melody. Gentle percussion like a tabla or a cajon can provide a subtle rhythm. A recurring flute or shehnai melody in the interludes would add a beautiful, traditional Indian touch, enhancing the festive and emotional feel. A string section (violins and cello) could swell softly in the chorus to elevate the emotion.

The ideal voice for this song would be a soft, melodic, and emotive female voice. The singer should have a clear, warm tone with the ability to convey deep affection and nostalgia. The delivery should be gentle and intimate, making it feel like a personal message from a sister to her brother. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-09 14:45:07.505469+00',
        '2025-08-09 14:45:07.505469+00'
    );

    -- Song 18: Starlight Lullaby
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
        'Public Library Song: Starlight Lullaby',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This A very soft and gentle acoustic lullaby. The music would be led by a simple, finger-picked acoustic guitar or a soft piano melody. The tempo should be slow and calming, like a heartbeat. Minimal background instrumentation, perhaps a light pad of strings to add warmth.
The vocals should be soft, breathy, and sung in a gentle, almost whispered tone. A tender, high-tenor male voice or a soft, airy female voice would be perfect to convey the intimacy and love of the moment. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-09 17:15:42.127556+00',
        '2025-08-09 17:15:42.127556+00'
    );

    -- Song 19: Meri Jannat
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
        'Public Library Song: Meri Jannat',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Soulful Acoustic Ballad
A gentle and melodic composition led by an acoustic guitar and piano. The rhythm is carried by a soft tabla or cajon beat that enters after the first verse. A string section (violins, cello) swells during the chorus to add emotional depth and warmth. The overall feel is intimate, reflective, and deeply emotional.

Recommended Voice: A soft, warm, and emotive female voice. The delivery should feel like a heartfelt whisper, full of love and tenderness, especially in the verses, building to a more expressive and soaring vocal in the chorus. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-10 11:52:43.460352+00',
        '2025-08-10 11:52:43.460352+00'
    );

    -- Song 20: Nacho Re Veer!
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
        'Public Library Song: Nacho Re Veer!',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This This song is designed as a Bollywood Dance Pop track. The tempo is upbeat and energetic (around 128 BPM), perfect for dancing. The instrumentation should feature a strong blend of traditional Indian instruments like the Dholak and Tabla to provide a driving, festive rhythm, combined with a modern groovy bassline, fun synth melodies, and celebratory brass stabs. The overall vibe is that of a grand family celebration or a kids'' party scene from a Bollywood movie.

Voice Recommendation: The lead vocal should be very cheerful, friendly, and expressive. A bright, smiling male or female voice would be ideal. It would be great to have backing vocals from a group of children shouting fun words like "Veer!", "Hooray!", and "Dance!" to enhance the party atmosphere. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-14 06:37:19.964908+00',
        '2025-08-14 06:37:19.964908+00'
    );

    -- Song 21: Aap Hi Jahaan
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
        'Public Library Song: Aap Hi Jahaan',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Soft Acoustic Ballad
This song is designed to be an intimate and heartfelt ballad. The primary instrument should be a warm-sounding acoustic guitar playing a gentle finger-picking pattern or soft chords. A simple, melodic piano line can enter during the chorus to add depth and emotional weight.

The rhythm should be subtle, perhaps with a soft shaker or a light cajon beat that maintains a slow, gentle tempo. During the bridge and the final chorus, a quiet string section (cello and violin) could swell softly in the background to elevate the feeling of love and gratitude.

Voice: The ideal vocal performance would be soft, warm, and sincere. It doesn''t require a powerful, belted voice, but rather a gentle baritone (male) or a warm mezzo-soprano (female) who can convey emotion through subtle expression and clarity. The delivery should feel like a personal message, almost a whisper at times, making the listener (your parents) feel like you are singing directly to them. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-16 15:52:11.915375+00',
        '2025-08-16 15:52:11.915375+00'
    );

    -- Song 22: Level Ten Rockstar
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
        'Public Library Song: Level Ten Rockstar',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This A vibrant and high-energy Indi-Pop/Pop-Rock track. The song should open with an upbeat drum intro and a catchy electric guitar riff. The verses would be driven by a strong bassline and rhythmic guitars, building up to a powerful, anthem-like chorus. Use fun synth melodies in the background, especially during the lines about video games, to add a modern, playful touch.

Suggested Vocal Style: A clear, youthful, and energetic male voice would be perfect. The delivery should be enthusiastic and full of joy, making it a track that gets everyone at the party on their feet and singing along. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-20 13:47:54.133617+00',
        '2025-08-20 13:47:54.133617+00'
    );

    -- Song 23: Gossip Guru Banne Chala CPO
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
        'Public Library Song: Gossip Guru Banne Chala CPO',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Desi Hip-Hop / Mumbai Gully Rap. A hard-hitting hip-hop beat with a prominent bassline and a classic boom-bap drum loop. We''ll infuse it with some Indian elements like a subtle, recurring sitar sample or tabla sounds in the background to give it that authentic ''gully'' vibe. The focus is purely on a powerful lyrical delivery over a compelling beat.
Vocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-22 10:42:05.762567+00',
        '2025-08-22 10:42:05.762567+00'
    );

    -- Song 24: Gossip Guru Banne Chala CPO
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
        'Public Library Song: Gossip Guru Banne Chala CPO',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This Desi Hip-Hop / Gully Rap. A raw, energetic hip-hop beat with a deep 808 bassline and a crisp, head-nodding drum loop. The track should have a minimalist vibe, perhaps with a recurring, gritty sitar or shehnai sample in the background to give it an authentic Indian street sound. The focus is purely on a powerful lyrical delivery over a compelling beat.
Vocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-22 10:51:27.255071+00',
        '2025-08-22 10:51:27.255071+00'
    );

    -- Song 25: Shehar Hila De
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
        'Public Library Song: Shehar Hila De',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This This is a High-Octane Punjabi Hip-Hop & EDM track. The song kicks off with a catchy electronic synth hook that quickly blends with a heavy, thumping dhol beat and a deep 808 bassline, creating an irresistible urge to dance. The tempo is fast and energetic (around 130 BPM). The verses have a cool, rhythmic flow, leading into a powerful, anthemic chorus with a massive beat drop, perfect for a club or a house party. The bridge switches to a slightly grittier hip-hop beat to spotlight the rap section.

Voice Recommendation: The ideal voice for this song is a powerful and energetic male vocalist with a bit of a rustic, swag-filled texture. Think of someone who can rap with attitude and sing the chorus with full power to hype up the crowd. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-30 11:59:57.964177+00',
        '2025-08-30 11:59:57.964177+00'
    );

    -- Song 26: Yaaron Waali Pool Party
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
        'Public Library Song: Yaaron Waali Pool Party',
        'Public Library',
        'English',
        ARRAY['melodic', 'pleasant'],
        'This This song is conceived as a high-energy Desi-Pop and EDM fusion track. It should feature a powerful four-on-the-floor drum beat, a deep, groovy bassline, and a catchy synth hook that repeats in the chorus. The verses can have a slightly more relaxed, rap-like vocal delivery, building up excitement in the pre-chorus and exploding with energy in the chorus. The bridge should have a build-up with drum rolls, leading to a massive beat drop for the final chorus.

Recommended Voice Style: A male vocalist with a confident, energetic, and slightly swaggering tone would be perfect. The delivery should be clear but playful, somewhere between singing and rhythmic talking, much like contemporary Indian pop artists. style song from the Melodia public library showcasing our musical diversity.',
        'COMPLETED',
        '2025-08-30 12:16:09.42412+00',
        '2025-08-30 12:16:09.42412+00'
    );

    -- Step 3: Create lyrics drafts for all songs

    -- Lyrics draft for: Ruchi My Queen
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
        '(Verse 1)
Yo, check the mic, one two, this ain''t no fake news,
Gotta drop some truth, dedicated to my muse.
From the land of kings, Rajasthan, that''s where we began,
Met a queen, named Ruchi, part of God''s perfect plan.
She''s more than just a wife, she''s the beat in my drum,
Through thick and thin, for real, she always overcome.
(Chorus)
Ruchi, meri jaan, tu hi mera sahara,
Every single step, you''re my guiding star, no cap.
From the desert sands to wherever we are,
My Marwari queen, shining brighter than any car.
This is for you, baby, straight from the heart,
You played your amazing part, right from the very start.
(Verse 2)
Remember those days, hustlin'' and grindin'' hard,
You held it down, played every single card.
No complaints, no drama, just pure dedication,
Built this empire with me, brick by brick,
foundation.
From the smallest dream to the biggest aspiration,
You believed in me, gave me the motivation.
Like a spicy daal baati, you add flavor to my life,
Cutting through the struggles, sharp as a chef''s knife.
(Chorus)
Ruchi, meri jaan, tu hi mera sahara,
Every single step, you''re my guiding star, no cap.
From the desert sands to wherever we are,
My Marwari queen, shining brighter than any car.
This is for you, baby, straight from the heart,
You played your amazing part, right from the very start.
(Bridge)
Some relationships fade, like colors in the sun,
But ours is a fortress, baby, second to none.
You''re my confidante, my best friend, my ride or die,
Look into your eyes, swear to God, I could fly.
They say love is blind, but with you,
I see clear,
Chasing away every doubt, every single fear.
(Chorus)
Ruchi, meri jaan, tu hi mera sahara,
Every single step, you''re my guiding star, no cap.
From the desert sands to wherever we are,
My Marwari queen, shining brighter than any car.
This is for you, baby, straight from the heart,
You played your amazing part, right from the very start.
(Outro)
Yeah, Ruchi, that''s the name, etch it in your brain,
The one who keeps me sane, through sunshine and through rain.
Rajasthan pride, forever by my side,
My beautiful wife, my everlasting guide.
Word up!
(Outro)
Yeah, Ruchi, that''s the name, etch it in your brain,
The one who keeps me sane, through sunshine and through rain.
Rajasthan pride, forever by my side,
My beautiful wife, my everlasting guide.
Word up!',
        'Ruchi My Queen',
        'Rap',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Ruchi My Queen'
    LIMIT 1;

    -- Lyrics draft for: Kaleidoscope Heart
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
        '(Verse 1)
One  minute  it''s  sunshine,  you''re  lighting  up  the  room
The  next,  there''s  a  raincloud,  chasing  out  the  bloom
You''ll  swear  that  it''s  blue,  then  you''ll  say  that  it''s  green
The  most  beautiful  puzzle  I  have  ever  seen
You  make  plans  for  the  evening,  then  change  them  by  noon
You''re  singing  a  sad  song,  then  humming  a  pop  tune
( Pre-Chorus)
And  some  people  might  get  lost  in  the  spin
But  for  me,  that’ s  where  the  best  parts  begin
( Chorus)
Oh,  you''ve  got  a  kaleidoscope  heart,  my  love
Changing  your  colors  with  a  push  and  a  shove
And  just  when  I  think  that  I''ve  figured  you  out
You  spin  me  around,  and  you  erase  any  doubt
That  my  favorite  feeling,  my  finest  work  of  art
Is  loving  every  piece  of  your  kaleidoscope  heart
( Verse 2)
You''ll  hate  a  movie,  then  watch  it  twice  more
You''ll  say  you  want  quiet,  then  dance  ''cross  the  floor
You''ll  want  to  be  lonely,  then  pull  me  in  tight
Your  ''maybe''  is  ''yes''  in  the  dim  evening  light
One  day  you''re  a  tempest,  a  storm  in  the  bay
The  next,  you''re  the  calm  that  just  chases  it  away
And  some  people  might  run  from  the  wind  and  the  tide
But  I  just  feel  lucky  to  be  by  your  side
( Chorus)
Oh,  you''ve  got  a  kaleidoscope  heart,  my  love
Changing  your  colors  with  a  push  and  a  shove
And  just  when  I  think  that  I''ve  figured  you  out
You  spin  me  around,  and  you  erase  any  doubt
That  my  favorite  feeling,  my  finest  work  of  art
Is  loving  every  piece  of  your  kaleidoscope  heart
( Bridge)
Let  the  world  have  its  straight  lines,  so  easy  to  trace
I''ll  take  the  wild  patterns  all  over  this  place
''Cause  in  every  version  of  you  that  I  find
Is  a  new,  magic  reason  you''re  perfectly  mine
It''s  a  joy,  not  a  challenge,  to  see  what  you''ll  do
Because  every  single  version  is  wonderfully  you
( Outro)
Your  kaleidoscope  heart...
Oh,  every  single  part...
My  love,  my  work  of  art...
Yeah,  your  kaleidoscope  heart.',
        'Kaleidoscope Heart',
        'Romantic Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Kaleidoscope Heart'
    LIMIT 1;

    -- Lyrics draft for: Same Office, Different Hearts
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
        '[Verse 1]
Coffee breaks turned into something more
तुम्हारी smile से शुरू हुई ये love story
Same desk, different dreams
Now we''re planning forever it seems
Twelve months of stolen glances
अब तक के सबसे beautiful chances
[Pre-Chorus]
From colleagues to lovers
हमने पाया है एक दूसरे को
Every day feels like discovery
यही तो है our love की victory
[Chorus]
Same office, different hearts
लेकिन beating as one
Every morning starts
With you, my सूरज sun
Same office, different hearts
But connected by love''s art
तुम हो मेरे हर beat में
Now forever, never apart
[Verse 2]
Meeting rooms witnessed our first hello
Conference calls where my heart would glow
Water cooler conversations
Led to these wedding celebrations
Ram and Akanksha, written in stars
दो hearts, one destination so far
[Pre-Chorus]
From colleagues to lovers
हमने पाया है एक दूसरे को
Every day feels like discovery
यही तो है our love की victory
[Chorus]
Same office, different hearts
लेकिन beating as one
Every morning starts
With you, my सूरज sun
Same office, different hearts
But connected by love''s art
तुम हो मेरे हर beat में
Now forever, never apart
[Bridge]
365 days of learning you
तुम्हारी हर ada, हर हंसी too
Email threads turned into love letters
अब हमारे पास है something better
Professional became personal
यार, this love is so eternal
[Final Chorus]
Same office, different hearts
लेकिन beating as one
Every morning starts
With you, my सूरज sun
Same office, different hearts
But connected by love''s art
तुम हो मेरे हर beat में
Now forever, never apart
[Outro]
Same building, same floor
लेकिन अब है कुछ और
Same office, different hearts
यहीं से शुरू हुई our love''s art',
        'Same Office, Different Hearts',
        'Love Story',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Same Office, Different Hearts'
    LIMIT 1;

    -- Lyrics draft for: A kid's night musical
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
        '[Verse 1]
Close your eyes, little Disha dear,
Stars above are shining near.
Moonlight dancing on your cheek,
Dreams will come, so soft, so sweet.
[Chorus]
Sleep, my angel, through the night,
Wrapped in love and silver light.
Hush now, baby, dont you cry,
Mamas here, and lullabies fly.
[Verse 2]
Teddy waits with open arms,
Keeping you safe from all harm.
Clouds are pillows in the sky,
Singing birds are flying by.
[Chorus]
Sleep, my angel, through the night,
Wrapped in love and silver light.
Hush now, baby, dont you cry,
Papas smile is standing by.
[Bridge]
You are magic, pure and bright,
Little star in morning light.
Every coo and every sigh,
Fills our hearts with love so high.
[Final Chorus]
Sleep, my Disha, dream away,
Night will melt to golden day.
You are loved, oh yes its true,
The whole wide world waits just for you.',
        'A kid''s night musical',
        'Musical',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: A kid''s night musical'
    LIMIT 1;

    -- Lyrics draft for: Lipsa Birthday Song
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
        '[Verse 1]
Lipsa, it''s your special day
Independent queen, you paved the way
Runway ready, camera flash
Confidence that makes heads turn fast
[Pre-Chorus]
Whiskey in your glass tonight
Dancing till the morning light
[Chorus]
Happy birthday to my girl
Party animal, rock this world
Sutta breaks and midnight calls
You''re the one who conquers all
Living life on your own terms
Happy birthday, watch it burn
[Verse 2]
Working hard but playing harder
Every goal just makes you smarter
Modelling dreams and city nights
You''re the star in neon lights
[Pre-Chorus]
Whiskey in your glass tonight
Dancing till the morning light
[Chorus]
Happy birthday to my girl
Party animal, rock this world
Sutta breaks and midnight calls
You''re the one who conquers all
Living life on your own terms
Happy birthday, watch it burn
[Bridge]
From sunrise shoots to evening calls
You handle business, handle it all
My partner in this crazy ride
Birthday queen, you''re my pride
[Chorus]
Happy birthday to my girl
Party animal, rock this world
Sutta breaks and midnight calls
You''re the one who conquers all
Living life on your own terms
Happy birthday, watch it burn
[Outro]
Lipsa, this one''s just for you
Another year of breaking through',
        'Lipsa Birthday Song',
        'Birthday Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Lipsa Birthday Song'
    LIMIT 1;

    -- Lyrics draft for: Nirvan's Birthday Song
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
        '[Verse 1]
Today''s your day
Blue is here
Lion roars
Birthday cheer
[Chorus]
Nirvan, Nirvan
*clap clap clap*
Blue lion dance
Happy birthday
*clap clap clap*
Mummy Papa sing
[Verse 2]
Two years old
Growing strong
Blue balloons
Birthday song
[Chorus]
Nirvan, Nirvan
*clap clap clap*
Blue lion dance
Happy birthday
*clap clap clap*
Mummy Papa sing
[Bridge]
Roar like lion
*ROAR!*
Jump so high
Blue sky flying
Birthday time
[Chorus]
Nirvan, Nirvan
*clap clap clap*
Blue lion dance
Happy birthday
*clap clap clap*
Mummy Papa sing
[Outro]
Happy birthday
Nirvan beta
*clap clap clap*
Blue lion king!',
        'Nirvan''s Birthday Song',
        'Birthday Party',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Nirvan''s Birthday Song'
    LIMIT 1;

    -- Lyrics draft for: Ram and Akanksha's wedding anthem
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
        '[Verse 1]
Same cubicle, different day
Tumhe dekha first time
Coffee spills, awkward waves
Didn''t know you''d be mine
[Pre-Chorus]
One year ago, who would''ve thought
Dil mein jo baat thi
From strangers to forever
Yeh kya baat hai
[Chorus]
Tum ho, tum ho
My heart beats for you
Tum ho, tum ho
Forever me and you
[Verse 2]
Lunch breaks turned to late night calls
Presentation stress, we shared it all
Office romance, they all knew
But I only saw you
[Pre-Chorus]
One year ago, who would''ve thought
Dil mein jo baat thi
From strangers to forever
Yeh kya baat hai
[Chorus]
Tum ho, tum ho
My heart beats for you
Tum ho, tum ho
Forever me and you
[Bridge]
Ram and Akanksha, this is our song
Kaam se pyaar tak, we came along
Same building, different floor
Ab tum mere saath, what could I want more?
[Final Chorus]
Tum ho, tum ho
My heart beats for you
Tum ho, tum ho
Forever me and you
(Forever me and you)
(Tum ho, tum ho)',
        'Ram and Akanksha''s wedding anthem',
        'Wedding Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Ram and Akanksha''s wedding anthem'
    LIMIT 1;

    -- Lyrics draft for: Unchained
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
        '(Verse 1)
Late-night  coffee,  books  piled  high
Underneath  a  sleepless  sky
They  saw  the  struggle,  they  saw  the  grind
The  mountain  of  doubt  you  had  to  climb
They  drew  a  box  and  tried  to  score
Everything  you  were,  and  so  much  more
But  they  couldn''t  measure  the  fire  in  your  chest
Putting  your  spirit  to  the  ultimate  test
( Pre-Chorus)
You  shut  out  the  noise,  you  shut  out  the  dread
Listened  to  the  voice  inside  your  head
It  whispered, " You''re  stronger  than  you  know"
It''s  your  time  to  rise,  your  time  to  glow!
Oh,  Kabir,  look  at  you  now,  standing  so  tall!
You  answered  the  challenge,  you  answered  the  call
That  SAT  score,  a  victory  cry
A  national  ranking  that  touches  the  sky!
You  unleashed  the  power  you  held  inside
With  absolutely  nothing  left  to  hide
The  numbers  all  spell  out  your  name
You  didn''t  just  play,  you  changed  the  game!
( Verse 2)
Remember  the  moment,  the  screen  so  bright
Chasing  away  the  long,  dark  night
You  held  your  breath,  then  a  joyful  shout
Erasing  every  single  doubt
It  wasn''t  just  numbers  flashing  on  the  screen
It  was  every  single  moment  in  between
The  hard  work,  the  hope,  the  strength  you  found
The  most  solid  and  hopeful  ground
( Pre-Chorus)
You  shut  out  the  noise,  you  shut  out  the  dread
Listened  to  the  voice  inside  your  head
It  whispered, " You''re  stronger  than  you  know"
It''s  your  time  to  rise,  your  time  to  glow!
( Chorus)
Oh,  Kabir,  look  at  you  now,  standing  so  tall!
You  answered  the  challenge,  you  answered  the  call
That  SAT  score,  a  victory  cry
A  national  ranking  that  touches  the  sky!
You  unleashed  the  power  you  held  inside
With  absolutely  nothing  left  to  hide
The  numbers  all  spell  out  your  name
You  didn''t  just  play,  you  changed  the  game!
( Bridge)
This  is  more  than  just  a  win,  it''s  a  sign
Your  future  is  a  blank  page,  yours  to  design
Let  this  feeling  be  your  endless  fuel
You  make  your  own  luck,  you  write  your  own  rule!
( Chorus -  Outro)
Oh,  Kabir,  look  at  you  now,  standing  so  tall!
( Standing  so  tall!)
You  answered  the  challenge,  you  answered  the  call!
That  SAT  score,  a  victory  cry
( A  victory  cry!)
A  national  ranking  that  touches  the  sky!
You  unleashed  the  power  you  held  inside
With  absolutely  nothing  left  to  hide
The  numbers  all  spell  out  your  name
You  didn''t  just  play,  you  changed  the  game!
Yeah,  you  changed  the  game!
Go  on,  Kabir,  change  the  game!',
        'Unchained',
        'Motivational Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Unchained'
    LIMIT 1;

    -- Lyrics draft for: Birthday Boy's Blue Party
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
        '[Verse 1]
Nirvan ka birthday hai today
Blue balloons flying high hooray
Mummy Papa singing loud
Our little prince makes us so proud
*clap clap clap*
Lion roar goes ROAR ROAR ROAR
Blue is your favorite color for sure
[Chorus]
Happy birthday Nirvan beta
You''re our shining blue star
Happy birthday Nirvan beta
Lion strong that''s what you are
*clap clap clap*
Blue and brave just like a king
Dance and laugh let''s celebrate
[Verse 2]
Cake is blue just like you like
Lion toy ready for a hike
Mummy''s love and Papa''s kiss
Birthday boy full of bliss
*clap clap clap*
ROAR ROAR ROAR like lions do
Everything today is about you
[Chorus]
Happy birthday Nirvan beta
You''re our shining blue star
Happy birthday Nirvan beta
Lion strong that''s what you are
*clap clap clap*
Blue and brave just like a king
Dance and laugh let''s celebrate
[Bridge]
One more year you''re growing tall
Lion heart conquers it all
Blue balloons touch the sky
Our Nirvan makes us fly so high
*clap clap clap*
[Final Chorus]
Happy birthday Nirvan beta
You''re our shining blue star
Happy birthday Nirvan beta
Lion strong that''s what you are
*clap clap clap*
Blue and brave just like a king
This is your special day
Let''s sing and play!',
        'Birthday Boy''s Blue Party',
        'Kids Birthday Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Birthday Boy''s Blue Party'
    LIMIT 1;

    -- Lyrics draft for: Sweet Dreams Tonight
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
        '[Intro]
Close your eyes, little Arth
Close, close, close
[Verse 1]
Arth, my darling Arth
Time to rest your heart
Stars are singing soft
Singing, singing soft
[Chorus]
Sleep now, Arth
Sleep, sleep, Arth
Dream deep, Arth
Sleep, sleep, sleep
[Verse 2]
Blankets warm around
Safe and soft, no sound
Arth, you''re precious, dear
Precious, precious, dear
[Chorus]
Sleep now, Arth
Sleep, sleep, Arth
Dream deep, Arth
Sleep, sleep, sleep
[Bridge]
Arth, Arth, Arth
Floating far
Peaceful heart
Rest, rest, rest
[Chorus]
Sleep now, Arth
Sleep, sleep, Arth
Dream deep, Arth
Sleep, sleep, sleep
[Outro]
Close your eyes, sweet Arth
Sleep... sleep... sleep...',
        'Sweet Dreams Tonight',
        'Lullaby',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Sweet Dreams Tonight'
    LIMIT 1;

    -- Lyrics draft for: Akash's Birthday Bash Song
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
        '[Verse 1]
Dekho  dekho  kaun  aaya?
Aakash  ka  birthday  aaya!
He’ s  not  one,  not  two,  not  four,
He''s  the  big  FIVE,  let''s  hit  the  floor!
[Chorus]
Happy  Birthday,  Aakash!  It''s  your  special  day!
Come  on  everybody,  dhoom  machao!
Apne  friend  ke  liye  taali  bajao!
Hip  Hip  Hurray  for  Aakash!  Let''s  all  shout  and  say...
HAPPY  BIRTHDAY!
[Verse 2]
Five  years  old,  so  strong  and  tall,
Like  a  superhero,  answering  the  call!
Kabhi  Spiderman,  kabhi  Superman,
You''re  our  hero,  sabse  mahaan!
Roar  like  a  dino,  zoom  like  a  car,
Aakash  you''re  our  shining  star!
[Chorus]
Happy  Birthday,  Aakash!  It''s  your  special  day!
Come  on  everybody,  dhoom  machao!
Apne  friend  ke  liye  taali  bajao!
Hip  Hip  Hurray  for  Aakash!  Let''s  all  shout  and  say...
HAPPY  BIRTHDAY!
[Bridge - Interactive Dance Break]
Everybody  make  a  circle,  big  and  round!
Now  jump  up  high  and  stomp  the  ground!
Aakash  in  the  middle,  show  us  your  move,
Aakash,  ghoom  ke  dikhao,  get  in  the  groove!
All  the  friends  say...  AAKASH! ( Everyone  shouts)
Let''s  get  louder...  AAKASH! ( Everyone  shouts  louder)
[Verse 3]
The  cake  is  here,  with  candles  bright,
Paanch  saal  ka,  what  a  lovely  sight!
Make  a  wish  and  blow  them  out,
That’ s  what  birthdays  are  all  about!
[Final Chorus]
Happy  Birthday,  Aakash!  It''s  your  special  day!
Come  on  everybody,  dhoom  machao!
Apne  friend  ke  liye  taali  bajao!
Hip  Hip  Hurray  for  Aakash!  Let''s  all  shout  and  say...
HAPPY  BIRTHDAY!
[Outro]
Baar  baar  din  yeh  aaye!
Happy  Birthday,  Aakash!
From  all  your  friends  today!
Hurray!',
        'Akash''s Birthday Bash Song',
        'Birthday Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Akash''s Birthday Bash Song'
    LIMIT 1;

    -- Lyrics draft for: Yaara
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
        'Yaad hai woh din, college ki सी ढ़ि याँ (seedhiyaan)?
Gappein hazaar, aur lakhon kahaniyaan Ek cup chai mein, dher saari
baatein Kaise guzarti thi woh lambi raatein Chhoti si pocket mein,
sapne the bade Ek doosre ke liye, hamesha the khade (Chorus) Oh
Yaara, sun le zaraa Tere jaisa koi nahi mila Hasi mein, aansu mein,
har ek pal mein Tu hi toh hai mera hausla Yeh dosti ka rang, hai
sabse gehra Saath tera, jaise khushiyon ka pehra (Verse 2) Zindagi
ki race mein, jab thak jaata hoon Teri awaaz sun ke, sukoon paata
hoon Kabhi tu daante, kabhi tu sambhaale Mere saare raaz, dil mein
tu paale Woh paagalpan aur, woh jhoothe bahane Yaad aate hain woh,
guzre zamaane (Chorus) Oh Yaara, sun le zaraa Tere jaisa koi nahi
mila Hasi mein, aansu mein, har ek pal mein Tu hi toh hai mera
hausla Yeh dosti ka rang, hai sabse gehra Saath tera, jaise
khushiyon ka pehra (Bridge) Waqt badla, sheher badle, badle hain
raaste Par apni yaari ka, wahi hai waasta Door hokar bhi, tu paas
hai dil ke Adhoore hain hum, bas tujhse mil ke (Guitar Solo -
Upbeat and Melodic) (
Chorus) Oh Yaara, sun le zaraa!
Tere jaisa koi nahi mila!
Hasi mein, aansu mein, har ek pal mein Tu hi toh hai mera hausla!
Yeh dosti ka rang, hai sabse gehra Saath tera, jaise khushiyon ka
pehra! ( Outro) Hmmm hmmm…
hmmm hmmm… Saath tera…
jaise khushiyon ka pehra… Oh Yaara… (
Music fades with gentle guitar strumming and humming)',
        'Yaara',
        'Romantic Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Yaara'
    LIMIT 1;

    -- Lyrics draft for: Har Lamha Naya
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
        'Pahadi ki uss choti se, shuru hua jo safar Dil ko laga tha tabhi
se, tu hi hai humsafar Thodi si bachkani baatein, woh masoom si
nazar Mere saamne tu बच् चा, par fikar meri din bhar (Pre-Chorus)
Coffee ke cup se, long drive ke pal tak Har baat mein teri, thi
khushiyon ki khanak Haan, bhool jaata hai tu cheezein, par khaane ka
shaukeen Teri har adaa pe dil ko, ho jaata hai yaqeen (Chorus) Yeh
pehla saal hai apna, par lage sadiyon jaisa Mera sukoon hai tujhse,
koi nahi tere jaisa Har lamha naya, har din hai khaas tere sang Tu
Golu mera, meri duniya ka har rang (Verse 2) Cricket ka shor ho,
ya theatre ka andhera Woh pehla kiss jo tera, hua dil bas tera
Chupke se aana ghar pe, woh shararat bhari Jab ''I love you'' kaha,
saans thi wahin pe thami (Pre-Chorus) Har birthday ka surprise, har
gossip waali raat Har ek jhagde ke baad, compensation waali baat Tu
chill hai, tu masti, tu hai sabse jooda Tere saath har ek kissa,
lagta hai poora (Chorus) Yeh pehla saal hai apna, par lage sadiyon
jaisa Mera sukoon hai tujhse, koi nahi tere jaisa Har lamha naya,
har din hai khaas tere sang Tu Golu mera, meri duniya ka har
rang (Bridge) Jab tooti thi main, exam ke stress mein Ya mood
swings mein khoyi, apne hi desh mein Har aansu se pehle, tu haazir
wahan tha Mere har zakhmon ka, tu hi toh nishaan tha Yaar pehle
din se, best friend ban gaya Yeh rishta rooh se, rooh tak jud
gaya (Chorus) Yeh pehla saal hai apna, par lage sadiyon jaisa Mera
sukoon hai tujhse, koi nahi tere jaisa Har lamha naya, har din hai
khaas tere sang Tu Golu mera, meri duniya ka har rang (Outro) Aage
aur bhi safar, naye kisse likhenge Har saal, har pal, bas tere sang
jeeyenge Mere Golu… Mera har lamha naya…
tere sang.',
        'Har Lamha Naya',
        'Love Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Har Lamha Naya'
    LIMIT 1;

    -- Lyrics draft for: Jashn-e-Hemali
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
        'Arey speaker ka volume badha do, Saare dance floor pe aa jao!
Jiski smile hai sabse pyaari, Apni dancing queen, Hemali!
Gaane ka, naachne ka, shauk puraana, Har mehfil ka tu dil, yeh sab
ne maana! (
Pre-Chorus) Toh aaj saare friends milke aaye, Dher saari wishes hain
laaye!
Shor macha do, naacho zor se! (
Chorus) Oye Jashn-e-Hemali, dhoom macha de, Fifty candles phoonk maar
ke bujha de! Dil se bolo, Happy Birthday!
Yeh party rukni nahi chahiye, Hey!
Hey! Hey! (
Verse 2) Yaaron ki tu hi toh hai yaari, Teri har ek adaa hai
niraali!
Jab tu gaaye, sab jhoom jaate, Saare gham pal mein bhool jaate! (
Pre-Chorus) Toh aaj saare friends milke aaye, Dher saari wishes hain
laaye!
Shor macha do, naacho zor se! (
Chorus) Oye Jashn-e-Hemali, dhoom macha de, Fifty candles phoonk maar
ke bujha de! Dil se bolo, Happy Birthday!
Yeh party rukni nahi chahiye, Hey!
Hey! Hey! (
Bridge) Fifty-shifty kya cheez hai, bolo?
Age is just a number, dil ko kholo!
Energy teri ab bhi hai full-on, You are forever, our number one! (
Chorus) Oye Jashn-e-Hemali, dhoom macha de, Fifty candles phoonk maar
ke bujha de! Dil se bolo, Happy Birthday!
Yeh party rukni nahi chahiye, Hey!
Hey! Hey!',
        'Jashn-e-Hemali',
        'Birthday Party Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Jashn-e-Hemali'
    LIMIT 1;

    -- Lyrics draft for: Jassi-di-jaan
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
        '[Verse] Tere nain sharaan wale Oh kamaal kar gaye Dil mera chori
karke Tu malmal kar gaye Husn tera chamakda Jaise chand di roshni
Tu hi meri duniya Tu hi meri zindagi [Chorus] O Jassi di jaan Main
tera shaan Dil nu khush kar gaye Tu mere armaan O Jassi di jaan
Tu meri pehchaan Husn tera jitt gaya Baaki sab haaran [Verse 2] Tera
nakhra ni lagda Jaise titli da rang Tere piche duniya saari Par tu
meri sang Jaddo hass ke vekheya Dil mera dhadakda Tera pyar oh sona
Jaise sone di chakdi [Chorus] O Jassi di jaan Main tera shaan Dil
nu khush kar gaye Tu mere armaan O Jassi di jaan Tu meri pehchaan
Husn tera jitt gaya Baaki sab haaran [Bridge] Tu meri kudi Main
tera munda Rabb da shukriya Saath sada jhunda Tere bina adhoora Main
ik kahani Jassi meri jaan Tu meri jawani [Chorus] O Jassi di jaan
Main tera shaan Dil nu khush kar gaye Tu mere armaan O Jassi di
jaan Tu meri pehchaan Husn tera jitt gaya Baaki sab haaran',
        'Jassi-di-jaan',
        'Punjabi Love Song',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Jassi-di-jaan'
    LIMIT 1;

    -- Lyrics draft for: A Dream Named Jivy
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
        'आँगन में आई बनके बहार तू मेरा छोटा सा सपना, मेरा प्यार तू
जब से देखा है चेहरा ये मासूम सा दिल में बस एक ही है एहसास
सा मेरी जीवी, तू है जिन्दगी तू ने आके मिटा दी हर कमी (Chorus)
ओ जीवी, मेरी जीवी, तू आँखों का नूर है तुझसे ही रौशन मेरा
जहान, मेरा सुरूर है सो जा मेरी गुड़िया, सपनों में खो जा मैं
माँ की बाहों में, महफूज़ हो जा मेरा दिल अब से घर है तेरा My
everything, अब तू ही सवेरा (Verse 2) नन्ही सी उँगली, छोटा सा पाँव
मेरे जीवन की अब तू ही है छाँव तेरी खिलखिलाहट जैसे कोई गीत
है मेरी हर दुआ में, तू ही मनमीत है देखूँ तुझको तो थम जाए
पल तू ही मेरा आज है, तू ही मेरा कल (Chorus) ओ जीवी, मेरी जी
वी, तू आँखों का नूर है तुझसे ही रौशन मेरा जहान, मेरा सुरूर
है सो जा मेरी गुड़िया, सपनों में खो जा मैं माँ की बाहों में, महफू
ज़ हो जा मेरा दिल अब से घर है तेरा My everything, अब तू ही सवेरा
(Bridge) चाहे कुछ भी हो life की राहों में Always पाओगी मु
झको इन बाहों में हर कदम पर मैं साथ बनूँगी तेरी खुशियों के
लिए ही जिऊँगी (Outro) मेरी प्यारी जीवी...
My little one... सो जा...
मेरी जान... जीवी...',
        'A Dream Named Jivy',
        'Mother''s Love Lullaby',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2024-01-01 00:00:00+00',
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: A Dream Named Jivy'
    LIMIT 1;

    -- Lyrics draft for: Resham Ki Dor
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
        '(Verse 1)
Yaad hai bachpan ka woh aangan
Teri hansi se goonjta har kshan
Thodi shararat, thoda jhagadna
Phir haath thaam ke saath mein chalna

(Pre-Chorus)
Waqt ne li hai karvat kaisi
Par preet humari hai waisi ki waisi
Aaj din aaya hai yeh khaas
Le aayi main mann mein vishwaas

(Chorus)
Resham ki yeh dor, bhaiya
Naata dil ka jode, bhaiya
Teri kalai pe sajaya hai
Rab se bas tujhko hi maanga hai

(Verse 2)
Tu dost bhi, tu hi sahara
Tujh bin har pal adhoora saara
Jab bhi main bhatki, raah dikhayi
Ban ke saaya, saath nibhaya

(Pre-Chorus)
Waqt ne li hai karvat kaisi
Par preet humari hai waisi ki waisi
Aaj din aaya hai yeh khaas
Le aayi main mann mein vishwaas

(Chorus)
Resham ki yeh dor, bhaiya
Naata dil ka jode, bhaiya
Teri kalai pe sajaya hai
Rab se bas tujhko hi maanga hai

(Bridge)
Khushiyon se daaman bhara rahe tera
Na ho kabhi gham ka andhera
Meri umar bhi tujhko lag jaaye
Muskaan tere hothon se na jaaye

(Chorus)
Resham ki yeh dor, bhaiya
Naata dil ka jode, bhaiya
Teri kalai pe sajaya hai
Rab se bas tujhko hi maanga hai

(Outro)
Mera bhaiya...
Tu hi mera jahaan...
Hamesha... hamesha...
(Music fades out with a soft flute melody)',
        'Resham Ki Dor',
        'This song would be best produced as a Soulful Indian Pop/Folk ballad. The arrangement should be minimalistic and heartfelt, led by an acoustic guitar or a soft piano melody. Gentle percussion like a tabla or a cajon can provide a subtle rhythm. A recurring flute or shehnai melody in the interludes would add a beautiful, traditional Indian touch, enhancing the festive and emotional feel. A string section (violins and cello) could swell softly in the chorus to elevate the emotion.

The ideal voice for this song would be a soft, melodic, and emotive female voice. The singer should have a clear, warm tone with the ability to convey deep affection and nostalgia. The delivery should be gentle and intimate, making it feel like a personal message from a sister to her brother.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-09 14:45:07.505469+00',
        '2025-08-09 14:45:07.505469+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Resham Ki Dor'
    LIMIT 1;

    -- Lyrics draft for: Starlight Lullaby
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
        '(Verse 1)
Ten little fingers, a soft, sleepy sigh,
A brand new star in a midnight sky.
The world outside just fades away,
As I watch you dream at the close of day.

(Chorus)
Oh, welcome to the world, my sweet, precious one,
My moon, my stars, my rising sun.
In my arms, you''re safe and sound,
The greatest love I''ve ever found.

(Outro)
Sleep now, my love... sleep now...',
        'Starlight Lullaby',
        'A very soft and gentle acoustic lullaby. The music would be led by a simple, finger-picked acoustic guitar or a soft piano melody. The tempo should be slow and calming, like a heartbeat. Minimal background instrumentation, perhaps a light pad of strings to add warmth.
The vocals should be soft, breathy, and sung in a gentle, almost whispered tone. A tender, high-tenor male voice or a soft, airy female voice would be perfect to convey the intimacy and love of the moment.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-09 17:15:42.127556+00',
        '2025-08-09 17:15:42.127556+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Starlight Lullaby'
    LIMIT 1;

    -- Lyrics draft for: Meri Jannat
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
        '(Verse 1)
Aankhon mein leke sapne, jab tu ghar mere aayi thi
Meri sookhi si duniya mein, tu banke ghata chhaayi thi
Teri nanhi si hasi mein, din mera nikal jaata
Tujhe dekh ke hi mera, har ek gham pighal jaata

(Chorus)
Tu hi meri zameen, aur tu hi mera aasmaan
Tujh mein hi toh basta hai, mera saara jahaan
Meri rooh ka sukoon, aur har duaa ka hai anjaam
Tu hi meri jannat hai, bas yahi hai mera imaan

(Verse 2)
Duniya ke liye hoon Babita, par tere liye bas ''Maa'' meri
Ab toh tere hi chehre mein, dikhti hai shakal meri
Teri khushiyon ki khaatir, main har hadd se guzar jaaun
Tujhe chot lage toh, main khud hi bikhar jaaun

(Chorus)
Tu hi meri zameen, aur tu hi mera aasmaan
Tujh mein hi toh basta hai, mera saara jahaan
Meri rooh ka sukoon, aur har duaa ka hai anjaam
Tu hi meri jannat hai, bas yahi hai mera imaan

(Bridge)
Yeh waqt ki nadiya behti rahe, tu khushiyon mein rehti rahe
Meri Bittoo, meri jaan hai tu, mera sachcha pyaar hai
Mera sachcha pyaar hai...

(Outro)
Meri jannat...
Meri dua...
Bas tu... hamesha tu...',
        'Meri Jannat',
        'Soulful Acoustic Ballad
A gentle and melodic composition led by an acoustic guitar and piano. The rhythm is carried by a soft tabla or cajon beat that enters after the first verse. A string section (violins, cello) swells during the chorus to add emotional depth and warmth. The overall feel is intimate, reflective, and deeply emotional.

Recommended Voice: A soft, warm, and emotive female voice. The delivery should feel like a heartfelt whisper, full of love and tenderness, especially in the verses, building to a more expressive and soaring vocal in the chorus.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-10 11:52:43.460352+00',
        '2025-08-10 11:52:43.460352+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Meri Jannat'
    LIMIT 1;

    -- Lyrics draft for: Nacho Re Veer!
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
        '(Music Intro with fun party sounds and a Dholak beat)

(Chorus)
Nacho Re Veer, Jhoomo Re Veer!
Beat pe aaja, hoja befikar!
Thumka lagake, gol gol ghoom!
Machi hai dekho, party ki dhoom!

(Verse 1)
Chhote chhote pao se, jab tu karta dance
Sabke chehre pe aa jaata, pyara sa romance
Kabhi idhar, kabhi udhar, karta hai kamaal
Teri shararat pe, sab hain khushaal!

(Chorus)
Nacho Re Veer, Jhoomo Re Veer!
Beat pe aaja, hoja befikar!
Thumka lagake, gol gol ghoom!
Machi hai dekho, party ki dhoom!

(Verse 2)
Mummy tujhko dekhe, Papa muskurayein
Tujhe dekh kar hi toh, woh dono khil jaayein
Unki duniya hai tu, unka hai tu star
Mummy Papa karte hain, tujhko itna pyaar!

(Bridge)
Chalo, clap your hands! Everybody!
(Sound of clapping)
Ab stomp your feet! Come on, Veer!
(Sound of stomping)
Aankhein meechi... peek-a-boo!
Sabse pyaara hai bas tu!

(Chorus)
Nacho Re Veer, Jhoomo Re Veer!
Beat pe aaja, hoja befikar!
Thumka lagake, gol gol ghoom!
Machi hai dekho, party ki dhoom!

(Outro)
Go Veer! Go Veer!
Everybody say... Yay Veer!
(Music fades with Dholak beats and kids cheering "Veer! Veer! Shabash!")',
        'Nacho Re Veer!',
        'This song is designed as a Bollywood Dance Pop track. The tempo is upbeat and energetic (around 128 BPM), perfect for dancing. The instrumentation should feature a strong blend of traditional Indian instruments like the Dholak and Tabla to provide a driving, festive rhythm, combined with a modern groovy bassline, fun synth melodies, and celebratory brass stabs. The overall vibe is that of a grand family celebration or a kids'' party scene from a Bollywood movie.

Voice Recommendation: The lead vocal should be very cheerful, friendly, and expressive. A bright, smiling male or female voice would be ideal. It would be great to have backing vocals from a group of children shouting fun words like "Veer!", "Hooray!", and "Dance!" to enhance the party atmosphere.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-14 06:37:19.964908+00',
        '2025-08-14 06:37:19.964908+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Nacho Re Veer!'
    LIMIT 1;

    -- Lyrics draft for: Aap Hi Jahaan
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
        '(Verse 1)
Aap hi zameen, aap hi aasmaan,
Aap se hi hai yeh mera jahaan.
Har dhoop mein jo ban gaye saaya,
Aapke jaisa pyaar kahaan paaya.

(Chorus)
Maa... Papa... suno na yeh dil kya kahe,
Aapke bina ik pal bhi na rahe.
Duniya ki daulat shohrat sab ek taraf,
Anmol hai aapka pyaar har taraf.

(Verse 2)
Yaad hai bachpan, woh ungli pakad kar chalna,
Har chot pe aapka woh aake sambhalna.
Andheron mein roshni bankar aaye,
Jeene ke saare saleeqe sikhaye.

(Chorus)
Maa... Papa... suno na yeh dil kya kahe,
Aapke bina ik pal bhi na rahe.
Duniya ki daulat shohrat sab ek taraf,
Anmol hai aapka pyaar har taraf.

(Bridge)
Ab farz hai mera, banu main aapka sahara,
Thak jaao jab tum, banu main hi kinara.
Aapki har ek khushi poori main karoon,
Aapke har gham ko ab door main karoon.

(Chorus)
Maa... Papa... suno na yeh dil kya kahe,
Aapke bina ik pal bhi na rahe.
Duniya ki daulat shohrat sab ek taraf,
Anmol hai aapka pyaar har taraf.

(Outro)
Bas itni si dua...
Saath ho aapka hamesha...
Maa...
Papa...',
        'Aap Hi Jahaan',
        'Soft Acoustic Ballad
This song is designed to be an intimate and heartfelt ballad. The primary instrument should be a warm-sounding acoustic guitar playing a gentle finger-picking pattern or soft chords. A simple, melodic piano line can enter during the chorus to add depth and emotional weight.

The rhythm should be subtle, perhaps with a soft shaker or a light cajon beat that maintains a slow, gentle tempo. During the bridge and the final chorus, a quiet string section (cello and violin) could swell softly in the background to elevate the feeling of love and gratitude.

Voice: The ideal vocal performance would be soft, warm, and sincere. It doesn''t require a powerful, belted voice, but rather a gentle baritone (male) or a warm mezzo-soprano (female) who can convey emotion through subtle expression and clarity. The delivery should feel like a personal message, almost a whisper at times, making the listener (your parents) feel like you are singing directly to them.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-16 15:52:11.915375+00',
        '2025-08-16 15:52:11.915375+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Aap Hi Jahaan'
    LIMIT 1;

    -- Lyrics draft for: Level Ten Rockstar
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
        '(Verse 1)
Suno suno, it''s a special day
Saare bolo, hip hip hooray!
Shor machao, clap your hands
Aaj party ka hai poora plan!
Cake bhi hai aur fun bhi hai
Kyunki Shlok aaj ho gaya ten!

(Chorus)
Happy Birthday to you, Shlok, O Rockstar!
Mummy Papa ka tu hi hai shining star!
Level Up hua hai, what a solid block!
Welcome to the awesome "Level Ten" rock!

(Verse 2)
Haath mein leke apni Nerf Gun
Jeetna hi bas hai tera fun
PS ka hero, game ka king
Har challenge ko karta hai swing!
Screen pe chalti hai teri command
Best player in the whole land!

(Chorus)
Happy Birthday to you, Shlok, O Rockstar!
Mummy Papa ka tu hi hai shining star!
Level Up hua hai, what a solid block!
Welcome to the awesome "Level Ten" rock!

(Bridge)
Mummy Papa ki aankhon ka taara
Tu unka dulaara, sabse pyaara
Aur chhota Snitik bhi peechhe aaye
Thodi masti, dher saara love laaye!
Kabhi jhagda, kabhi yaari
Aisi hai yeh rishtedaari!

(Chorus)
Happy Birthday to you, Shlok, O Rockstar!
Mummy Papa ka tu hi hai shining star!
Level Up hua hai, what a solid block!
Welcome to the awesome "Level Ten" rock!

(Outro)
Ten candles on your cake today
Make a wish and lead the way!
Jeeyo hazaaron saal, yeh hai dua
Happy Birthday, Shlok, woo-hoo!
You''re our hero, through and through!
Happy, happy, happy birthday to you!',
        'Level Ten Rockstar',
        'A vibrant and high-energy Indi-Pop/Pop-Rock track. The song should open with an upbeat drum intro and a catchy electric guitar riff. The verses would be driven by a strong bassline and rhythmic guitars, building up to a powerful, anthem-like chorus. Use fun synth melodies in the background, especially during the lines about video games, to add a modern, playful touch.

Suggested Vocal Style: A clear, youthful, and energetic male voice would be perfect. The delivery should be enthusiastic and full of joy, making it a track that gets everyone at the party on their feet and singing along.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-20 13:47:54.133617+00',
        '2025-08-20 13:47:54.133617+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Level Ten Rockstar'
    LIMIT 1;

    -- Lyrics draft for: Gossip Guru Banne Chala CPO
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
        '(Intro - Spoken with attitude)
Yo, yo, mic check...
Latest news flash, seedha office ke floor se!
Apna Product Manager, ab CPO banne ke zor mein!
Yeah... let''s talk about it.

(Verse one)
Suno iski story, yeh PM tha shaana,
Par iska ek hi sapna, CPO ban jaana!
Har meeting mein gyaan, ''The user is king!''
Asli user toh tu hai, of gossiping!
Kehta hai ''I connect with stakeholders well'',
Bhai, tu sabki personal life ki bajata hai bell!
''Empathy map'' banata tha on the screen,
Par asli research thi iski, ''who''s dating who'' in the canteen!

(Chorus - Fast and punchy)
Roadmap pe kam, logon pe dhyaan zyaada,
Har department se iska tha pakka waada!
"Main laaunga khabar, tum dena masala,"
Yeh PM nahi, office ka news-wala!
Chai pe charcha, coffee pe khulasa,
Yeh CPO nahi, banega ''Chief Gossip Officer'', saala!

(Verse two)
Finance mein kiska promotion hai pending?
Sales team mein kiska breakup hai trending?
Marketing waalon ki nayi party kidhar hai?
Apne PM ko sab khabar hai!
Iski ''networking'' ka style hi alag tha,
Har cabin mein iska ek chamcha sanak tha!
Yeh ''people skills'' ka karta tha poora use,
Har gossip ke piece ko banata tha breaking news!

(Chorus - Fast and punchy)
Roadmap pe kam, logon pe dhyaan zyaada,
Har department se iska tha pakka waada!
"Main laaunga khabar, tum dena masala,"
Yeh PM nahi, office ka news-wala!
Chai pe charcha, coffee pe khulasa,
Yeh CPO nahi, banega ''Chief Gossip Officer'', saala!

(Bridge - Slower, more intense flow)
Sach bolun, tere network ke aage,
Saare LinkedIn connections fail hain dhaage!
Tu CPO banega, humko hai vishwas,
Kyunki tere paas hai, har bande ka itihas!
Nayi company join karke, in your first week,
Tu wahan ke CEO ki nikaal dega love life ki leak!
That''s your real talent, your master plan,
The People''s PM, the gossip man!

(Outro - Spoken, fading out with the beat)
So go on, Mr. Future CPO, jaa lele apni seat.
Par yaad rakhna... humein dete rehna har ''internal'' tweet!
Peace out. B-Town representing.
Over and out.
(Mic drop sound)',
        'Gossip Guru Banne Chala CPO',
        'Desi Hip-Hop / Mumbai Gully Rap. A hard-hitting hip-hop beat with a prominent bassline and a classic boom-bap drum loop. We''ll infuse it with some Indian elements like a subtle, recurring sitar sample or tabla sounds in the background to give it that authentic ''gully'' vibe. The focus is purely on a powerful lyrical delivery over a compelling beat.
Vocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-22 10:42:05.762567+00',
        '2025-08-22 10:42:05.762567+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Gossip Guru Banne Chala CPO'
    LIMIT 1;

    -- Lyrics draft for: Gossip Guru Banne Chala CPO
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
        '(Intro - Spoken with attitude)
Yo, yo, mic check...
Latest news flash, seedha office ke floor se!
Apna Product Manager, ab CPO banne ke zor mein!
Yeah... let''s talk about it.

(Verse one)
Suno iski story, yeh PM tha shaana,
Par iska ek hi sapna, CPO ban jaana!
Har meeting mein gyaan, ''The user is king!''
Asli user toh tu hai, of gossiping!
Kehta hai ''I connect with stakeholders well'',
Bhai, tu sabke professional life ki bajata hai bell!
''Empathy map'' banata tha on the screen,
Asli research thi iski, ''kis team mein ban raha hai naya scene''!

(Chorus - Fast and punchy)
Roadmap pe kam, logon pe dhyaan zyaada,
Har department se iska tha pakka waada!
"Main laaunga khabar, tum dena masala,"
Yeh PM nahi, office ka news-wala!
Chai pe charcha, coffee pe khulasa,
Yeh CPO nahi, banega ''Chief Gossip Officer'', saala!

(Verse two)
Finance mein kiska promotion hai pending?
Sales team mein kiska target hai ending?
Marketing waalon ki nayi party kidhar hai?
Apne PM ko sab khabar hai!
Yeh meeting mein aata tha info lene,
Presentation pe nahi, logon ke chehre dekhne!
Yeh ''people skills'' ka karta tha poora use,
Har gossip ke piece ko banata tha breaking news!

(Chorus - Fast and punchy)
Roadmap pe kam, logon pe dhyaan zyaada,
Har department se iska tha pakka waada!
"Main laaunga khabar, tum dena masala,"
Yeh PM nahi, office ka news-wala!
Chai pe charcha, coffee pe khulasa,
Yeh CPO nahi, banega ''Chief Gossip Officer'', saala!

(Bridge - Slower, more intense flow)
Sach bolun, tere network ke aage,
Saare LinkedIn connections fail hain dhaage!
Tu CPO banega, humko hai vishwas,
Kyunki tere paas hai, har bande ka itihas!
Nayi company join karke, in your first week,
Tu wahan ke power politics ko kar dega leak!
That''s your real talent, your master plan,
The People''s PM, the gossip man!

(Outro - Beat softens slightly, flow becomes more conversational)
Chal jaa, Mr. Future CPO, jaa lele apni seat.
Yeh office ab soona lagega, the grapevine will miss a beat.
Seriously man, aakhri baar, kai bolto?
Jokes apart, you''ll be missed. Ab jaa, jeet lo!
Peace out.',
        'Gossip Guru Banne Chala CPO',
        'Desi Hip-Hop / Gully Rap. A raw, energetic hip-hop beat with a deep 808 bassline and a crisp, head-nodding drum loop. The track should have a minimalist vibe, perhaps with a recurring, gritty sitar or shehnai sample in the background to give it an authentic Indian street sound. The focus is purely on a powerful lyrical delivery over a compelling beat.
Vocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-22 10:51:27.255071+00',
        '2025-08-22 10:51:27.255071+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Gossip Guru Banne Chala CPO'
    LIMIT 1;

    -- Lyrics draft for: Shehar Hila De
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
        '(Intro)
(Music starts with a synth riser and a building dhol beat)
Yo! DJ, drop the beat!
Let''s go!

(Verse 1)
Raat abhi baaki hai, plans ho gaye set
Saari gaadiyan ready, no time for regret
Phone pe phone bajte, "Bhai, kidhar hai tu?"
Apna adda fix hai, milta wahi crew

(Pre-Chorus)
Ek ka call aaye, toh saare aate hain
Dushman jo dekhe, side ho jaate hain
Speaker ka volume full kar de, bhai
Entry aisi lenge, mach jaayegi tabaahi!

(Chorus)
Oye jab bhi hum aate hain, floor hila de!
Yaaron ki yaari se, shehar hila de!
Beat aisi bajti hai, dil yeh dila de!
Awaaz upar karke, sabko hila de!

(Post-Chorus Beat Drop)
(Heavy instrumental with vocal chops: "Hey! Ho! Hila De!")

(Verse 2)
Lightein hain dim, par apni vibe hai bright
Jahan kadam rakhte, spot ho jaati light
Koi tension nahi hai, na koi hai fikar
Bas masti on hai, aur yaaron ka zikar

(Pre-Chorus)
Ek ka call aaye, toh saare aate hain
Dushman jo dekhe, side ho jaate hain
Speaker ka volume full kar de, bhai
Entry aisi lenge, mach jaayegi tabaahi!

(Chorus)
Oye jab bhi hum aate hain, floor hila de!
Yaaron ki yaari se, shehar hila de!
Beat aisi bajti hai, dil yeh dila de!
Awaaz upar karke, sabko hila de!

(Rap Bridge)
(Beat switches to a trap/hip-hop rhythm)
Yeah! Mic check... Suno!
Baarah khiladi, game mein hain on fire
Apni yaari ka, alag hi empire
Start karein Gaurav, machata hai shor ab
Uske jaisa cool, hai apna Saurabh
Naam hi kaafi hai, entry maare Shiv
Dekh ke jisko sab kahen "What a look!", woh Aloke
Apna Rajan bhai, dilon pe karta raaj
Aur humesha jeetein, yeh Jiten ka andaaz
Energy ko push kare, hai apna Pratyush
Saath mein hai Shivam, toh hum hain khush
Sabki jeet pakki, jab khele Vineet
Har baazi apni, yeh hai Vijay ki reet
Naam mein hi Shankar, hai Jaishankar ki dahaad
Aur saath mein Biren, yaaron ka hai pahaad!
(Yeah! That''s the crew!)

(Chorus)
(Music explodes back with full energy)
Oye jab bhi hum aate hain, floor hila de!
Yaaron ki yaari se, shehar hila de!
Beat aisi bajti hai, dil yeh dila de!
Awaaz upar karke, sabko hila de!

(Outro)
Shehar Hila De!
(Yeah!)
Yaaron Ki Vibe Hai!
(Haha!)
(Music fades out with the main synth hook and a final, echoing dhol hit)',
        'Shehar Hila De',
        'This is a High-Octane Punjabi Hip-Hop & EDM track. The song kicks off with a catchy electronic synth hook that quickly blends with a heavy, thumping dhol beat and a deep 808 bassline, creating an irresistible urge to dance. The tempo is fast and energetic (around 130 BPM). The verses have a cool, rhythmic flow, leading into a powerful, anthemic chorus with a massive beat drop, perfect for a club or a house party. The bridge switches to a slightly grittier hip-hop beat to spotlight the rap section.

Voice Recommendation: The ideal voice for this song is a powerful and energetic male vocalist with a bit of a rustic, swag-filled texture. Think of someone who can rap with attitude and sing the chorus with full power to hype up the crowd.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-30 11:59:57.964177+00',
        '2025-08-30 11:59:57.964177+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Shehar Hila De'
    LIMIT 1;

    -- Lyrics draft for: Yaaron Waali Pool Party
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
        '(Intro)
(Sound of water splashing, followed by a synth melody kicking in)
Yeah! Weekend ka scene hai set!
Gaurav ne phone kiya, bola "No regret!"
Aaj sab kuch full-on hai, no stress!

(Verse 1)
Dhoop hai shining bright, mood hai dynamite
Saurabh le aaya speakers, set kar di poori night
Pratyush on the console, dropping beats so right
Aur Shivam ne maari entry, kya cool si sight!
Vineet bola, "Let''s go!", with all his might!

(Pre-Chorus)
Glasses mein ice, no advice!
Tension ko feko, everything is nice!
Paani mein ab aag lagegi, just roll the dice!

(Chorus)
Hey! Paani hai blue, blue, blue
Masti on loop, loop, loop
Apni yaaron waali pool party
Scene hai super-duper-hit, dude!

Hey! Sky hai blue, blue, blue
Saath mein apna crew, crew, crew
Apni yaaron waali pool party
Scene hai super-duper-hit, dude!

(Verse 2)
Vijay ne maara splash, ek dum cannonball
Jaishankar sabko pukaare, "Come on, have a ball!"
Biren kar raha chill, swimming past the wall
Aur Jiten khada side mein, looking cool and tall
Yaari ki apni picture, bigger than them all!

(Pre-Chorus)
Glasses mein ice, no advice!
Tension ko feko, everything is nice!
Paani mein ab aag lagegi, just roll the dice!

(Chorus)
Hey! Paani hai blue, blue, blue
Masti on loop, loop, loop
Apni yaaron waali pool party
Scene hai super-duper-hit, dude!

Hey! Sky hai blue, blue, blue
Saath mein apna crew, crew, crew
Apni yaaron waali pool party
Scene hai super-duper-hit, dude!

(Bridge)
(Music softens slightly with a rhythmic clap)
East or west, apne dost hain best
Life ke har exam mein, paas karte hain test!
From the first day to forever, no contest!
(Beat starts building up)
Gaurav, Shiv, Aloke, Rajan!
Jiten, Saurabh, Pratyush, Shivam!
Vineet, Vijay, Jaishankar, Biren!
Saare ke saare hain number one! C''mon!

(Guitar solo / Synth lead over a heavy beat drop)

(Chorus)
(Vocals with high energy and ad-libs)
Hey! Paani hai blue, blue, blue
Masti on loop, loop, loop
Apni yaaron waali pool party
Scene hai super-duper-hit, dude!

Hey! Sky hai blue, blue, blue
Saath mein apna crew, crew, crew
Apni yaaron waali pool party
Scene hai super-duper-hit, dude!

(Outro)
(Beat fades while voices and splash sounds continue)
Yeah! That''s my crew!
Hey Shiv! Hey Aloke!
Rajan, music badha de bro! (Bro, turn up the music!)
That''s right!
Scene hai super-duper-hit, dude!
(Final splash sound)',
        'Yaaron Waali Pool Party',
        'This song is conceived as a high-energy Desi-Pop and EDM fusion track. It should feature a powerful four-on-the-floor drum beat, a deep, groovy bassline, and a catchy synth hook that repeats in the chorus. The verses can have a slightly more relaxed, rap-like vocal delivery, building up excitement in the pre-chorus and exploding with energy in the chorus. The bridge should have a build-up with drum rolls, leading to a massive beat drop for the final chorus.

Recommended Voice Style: A male vocalist with a confident, energetic, and slightly swaggering tone would be perfect. The delivery should be clear but playful, somewhere between singing and rhythmic talking, much like contemporary Indian pop artists.',
        'gpt-4-turbo',
        'approved',
        v_admin_user_id,
        '2025-08-30 12:16:09.42412+00',
        '2025-08-30 12:16:09.42412+00'
    FROM song_requests sr
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Yaaron Waali Pool Party'
    LIMIT 1;

    -- Step 4: Create songs table entries with timestamped lyrics

    -- Song entry for: Ruchi My Queen
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
        'ruchi-my-queen',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":10592,"text":"(Verse 1)","index":0,"start":9894},{"end":13298,"text":"Yo, check the mic, one two, this ain''t no fake news,","index":1,"start":10612},{"end":15989,"text":"Gotta drop some truth, dedicated to my muse.","index":2,"start":13351},{"end":18710,"text":"From the land of kings, Rajasthan, that''s where we began,","index":3,"start":16021},{"end":21403,"text":"Met a queen, named Ruchi, part of God''s perfect plan.","index":4,"start":18750},{"end":24056,"text":"She''s more than just a wife, she''s the beat in my drum,","index":5,"start":21423},{"end":26649,"text":"Through thick and thin, for real, she always overcome.","index":6,"start":24096},{"end":27048,"text":"(Chorus)","index":7,"start":26702},{"end":30027,"text":"Ruchi, meri jaan, tu hi mera sahara,","index":8,"start":27128},{"end":32888,"text":"Every single step, you''re my guiding star, no cap.","index":9,"start":30053},{"end":35133,"text":"From the desert sands to wherever we are,","index":10,"start":32904},{"end":38186,"text":"My Marwari queen, shining brighter than any car.","index":11,"start":35160},{"end":40093,"text":"This is for you, baby, straight from the heart,","index":12,"start":38234},{"end":42975,"text":"You played your amazing part, right from the very start.","index":13,"start":40133},{"end":43412,"text":"(Verse 2)","index":14,"start":43045},{"end":46097,"text":"Remember those days, hustlin'' and grindin'' hard,","index":15,"start":43441},{"end":48378,"text":"You held it down, played every single card.","index":16,"start":46157},{"end":51024,"text":"No complaints, no drama, just pure dedication,","index":17,"start":48484},{"end":53125,"text":"Built this empire with me, brick by brick,","index":18,"start":51064},{"end":53809,"text":"foundation.","index":19,"start":53191},{"end":56489,"text":"From the smallest dream to the biggest aspiration,","index":20,"start":53840},{"end":58564,"text":"You believed in me, gave me the motivation.","index":21,"start":56569},{"end":62194,"text":"Like a spicy daal baati, you add flavor to my life,","index":22,"start":58644},{"end":64734,"text":"Cutting through the struggles, sharp as a chef''s knife.","index":23,"start":62234},{"end":64840,"text":"(Chorus)","index":24,"start":64743},{"end":67686,"text":"Ruchi, meri jaan, tu hi mera sahara,","index":25,"start":64894},{"end":70564,"text":"Every single step, you''re my guiding star, no cap.","index":26,"start":67713},{"end":72926,"text":"From the desert sands to wherever we are,","index":27,"start":70596},{"end":75910,"text":"My Marwari queen, shining brighter than any car.","index":28,"start":73005},{"end":77773,"text":"This is for you, baby, straight from the heart,","index":29,"start":75941},{"end":91277,"text":"You played your amazing part, right from the very start.","index":30,"start":77832},{"end":91500,"text":"(Bridge)","index":31,"start":91303},{"end":94348,"text":"Some relationships fade, like colors in the sun,","index":32,"start":91564},{"end":96802,"text":"But ours is a fortress, baby, second to none.","index":33,"start":94388},{"end":99957,"text":"You''re my confidante, my best friend, my ride or die,","index":34,"start":96822},{"end":102255,"text":"Look into your eyes, swear to God, I could fly.","index":35,"start":100021},{"end":104242,"text":"They say love is blind, but with you,","index":36,"start":102303},{"end":105379,"text":"I see clear,","index":37,"start":104362},{"end":107872,"text":"Chasing away every doubt, every single fear.","index":38,"start":105439},{"end":108085,"text":"(Chorus)","index":39,"start":107899},{"end":110851,"text":"Ruchi, meri jaan, tu hi mera sahara,","index":40,"start":108138},{"end":113729,"text":"Every single step, you''re my guiding star, no cap.","index":41,"start":110878},{"end":116144,"text":"From the desert sands to wherever we are,","index":42,"start":113761},{"end":118261,"text":"My Marwari queen, shining brighter than any car.","index":43,"start":116197},{"end":120938,"text":"This is for you, baby, straight from the heart,","index":44,"start":118277},{"end":123810,"text":"You played your amazing part, right from the very start.","index":45,"start":120997},{"end":123957,"text":"(Outro)","index":46,"start":123830},{"end":126742,"text":"Yeah, Ruchi, that''s the name, etch it in your brain,","index":47,"start":124005},{"end":129548,"text":"The one who keeps me sane, through sunshine and through rain.","index":48,"start":126782},{"end":132074,"text":"Rajasthan pride, forever by my side,","index":49,"start":129601},{"end":134649,"text":"My beautiful wife, my everlasting guide.","index":50,"start":132181},{"end":135269,"text":"Word up!","index":51,"start":134697},{"end":141399,"text":"(Outro)","index":52,"start":135359},{"end":145951,"text":"Yeah, Ruchi, that''s the name, etch it in your brain,","index":53,"start":141495},{"end":148032,"text":"The one who keeps me sane, through sunshine and through rain.","index":54,"start":145971},{"end":151383,"text":"Rajasthan pride, forever by my side,","index":55,"start":148138},{"end":153718,"text":"My beautiful wife, my everlasting guide.","index":56,"start":151489},{"end":154388,"text":"Word up!","index":57,"start":153766}]}'::jsonb,
        '{"original_id":1,"original_sequence":1,"duration":"179.00","song_url":"/audio/ruchi-my-queen.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Rap'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Ruchi My Queen'
    LIMIT 1;

    -- Song entry for: Kaleidoscope Heart
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
        'kaleidoscope-heart',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":9894,"text":"(Verse 1)","index":0,"start":9415},{"end":14681,"text":"One  minute  it''s  sunshine,  you''re  lighting  up  the  room","index":1,"start":9947},{"end":19548,"text":"The  next,  there''s  a  raincloud,  chasing  out  the  bloom","index":2,"start":14761},{"end":24495,"text":"You''ll  swear  that  it''s  blue,  then  you''ll  say  that  it''s  green","index":3,"start":19574},{"end":29441,"text":"The  most  beautiful  puzzle  I  have  ever  seen","index":4,"start":24548},{"end":34628,"text":"You  make  plans  for  the  evening,  then  change  them  by  noon","index":5,"start":29521},{"end":38059,"text":"You''re  singing  a  sad  song,  then  humming  a  pop  tune","index":6,"start":34654},{"end":40133,"text":"( Pre-Chorus)","index":7,"start":37839},{"end":45000,"text":"And  some  people  might  get  lost  in  the  spin","index":8,"start":40213},{"end":49209,"text":"But  for  me,  that’ s  where  the  best  parts  begin","index":9,"start":45106},{"end":49648,"text":"( Chorus)","index":10,"start":48128},{"end":54734,"text":"Oh,  you''ve  got  a  kaleidoscope  heart,  my  love","index":11,"start":49668},{"end":59761,"text":"Changing  your  colors  with  a  push  and  a  shove","index":12,"start":54794},{"end":64707,"text":"And  just  when  I  think  that  I''ve  figured  you  out","index":13,"start":59840},{"end":69495,"text":"You  spin  me  around,  and  you  erase  any  doubt","index":14,"start":64787},{"end":74202,"text":"That  my  favorite  feeling,  my  finest  work  of  art","index":15,"start":69574},{"end":78533,"text":"Is  loving  every  piece  of  your  kaleidoscope  heart","index":16,"start":74322},{"end":87168,"text":"( Verse 2)","index":17,"start":78160},{"end":92074,"text":"You''ll  hate  a  movie,  then  watch  it  twice  more","index":18,"start":87181},{"end":95426,"text":"You''ll  say  you  want  quiet,  then  dance  ''cross  the  floor","index":19,"start":92101},{"end":102128,"text":"You''ll  want  to  be  lonely,  then  pull  me  in  tight","index":20,"start":95452},{"end":107234,"text":"Your  ''maybe''  is  ''yes''  in  the  dim  evening  light","index":21,"start":102148},{"end":112181,"text":"One  day  you''re  a  tempest,  a  storm  in  the  bay","index":22,"start":107340},{"end":117447,"text":"The  next,  you''re  the  calm  that  just  chases  it  away","index":23,"start":112234},{"end":122793,"text":"And  some  people  might  run  from  the  wind  and  the  tide","index":24,"start":117553},{"end":126563,"text":"But  I  just  feel  lucky  to  be  by  your  side","index":25,"start":122872},{"end":127234,"text":"( Chorus)","index":26,"start":126323},{"end":132207,"text":"Oh,  you''ve  got  a  kaleidoscope  heart,  my  love","index":27,"start":127287},{"end":137234,"text":"Changing  your  colors  with  a  push  and  a  shove","index":28,"start":132277},{"end":142101,"text":"And  just  when  I  think  that  I''ve  figured  you  out","index":29,"start":137340},{"end":146968,"text":"You  spin  me  around,  and  you  erase  any  doubt","index":30,"start":142207},{"end":151596,"text":"That  my  favorite  feeling,  my  finest  work  of  art","index":31,"start":147048},{"end":155924,"text":"Is  loving  every  piece  of  your  kaleidoscope  heart","index":32,"start":151715},{"end":165239,"text":"( Bridge)","index":33,"start":155553},{"end":170665,"text":"Let  the  world  have  its  straight  lines,  so  easy  to  trace","index":34,"start":165319},{"end":175293,"text":"I''ll  take  the  wild  patterns  all  over  this  place","index":35,"start":170745},{"end":180080,"text":"''Cause  in  every  version  of  you  that  I  find","index":36,"start":175372},{"end":185027,"text":"Is  a  new,  magic  reason  you''re  perfectly  mine","index":37,"start":180199},{"end":190293,"text":"It''s  a  joy,  not  a  challenge,  to  see  what  you''ll  do","index":38,"start":185066},{"end":196340,"text":"Because  every  single  version  is  wonderfully  you","index":39,"start":190384},{"end":196532,"text":"( Outro)","index":40,"start":194229},{"end":201750,"text":"Your  kaleidoscope  heart...","index":41,"start":196548},{"end":206601,"text":"Oh,  every  single  part...","index":42,"start":201846},{"end":211014,"text":"My  love,  my  work  of  art...","index":43,"start":206665},{"end":213750,"text":"Yeah,  your  kaleidoscope  heart.","index":44,"start":211060}]}'::jsonb,
        '{"original_id":2,"original_sequence":2,"duration":"189.00","song_url":"/audio/kaleidoscope.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Romantic Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Kaleidoscope Heart'
    LIMIT 1;

    -- Song entry for: Same Office, Different Hearts
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
        'same-office-different-hearts',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":8916,"text":"[Verse 1]","index":0,"start":8916},{"end":12631,"text":"Coffee breaks turned into something more","index":1,"start":8916},{"end":17832,"text":"तुम्हारी smile से शुरू हुई ये love story","index":2,"start":13374},{"end":20805,"text":"Same desk, different dreams","index":3,"start":17832},{"end":23777,"text":"Now we''re planning forever it seems","index":4,"start":20805},{"end":25263,"text":"Twelve months of stolen glances","index":5,"start":23777},{"end":28235,"text":"अब तक के सबसे beautiful chances","index":6,"start":26006},{"end":28978,"text":"[Pre-Chorus]","index":8,"start":28235},{"end":31950,"text":"From colleagues to lovers","index":9,"start":28978},{"end":36408,"text":"हमने पाया है एक दूसरे को","index":10,"start":31950},{"end":40867,"text":"Every day feels like discovery","index":11,"start":37894},{"end":46068,"text":"यही तो है our love की victory","index":12,"start":42353},{"end":46811,"text":"[Chorus]","index":14,"start":46068},{"end":49040,"text":"Same office, different hearts","index":15,"start":46811},{"end":52012,"text":"लेकिन beating as one","index":16,"start":49783},{"end":54241,"text":"Every morning starts","index":17,"start":52012},{"end":56470,"text":"With you, my सूरज sun","index":18,"start":54241},{"end":58700,"text":"Same office, different hearts","index":19,"start":56470},{"end":60929,"text":"But connected by love''s art","index":20,"start":58700},{"end":63901,"text":"तुम हो मेरे हर beat में","index":21,"start":61672},{"end":66873,"text":"Now forever, never apart","index":22,"start":64644},{"end":75046,"text":"[Verse 2]","index":24,"start":66873},{"end":79505,"text":"Meeting rooms witnessed our first hello","index":25,"start":76532},{"end":86192,"text":"Conference calls where my heart would glow","index":26,"start":80991},{"end":88421,"text":"Water cooler conversations","index":27,"start":86192},{"end":90650,"text":"Led to these wedding celebrations","index":28,"start":88421},{"end":92879,"text":"Ram and Akanksha, written in stars","index":29,"start":90650},{"end":95851,"text":"दो hearts, one destination so far","index":30,"start":92879},{"end":97338,"text":"[Pre-Chorus]","index":32,"start":97338},{"end":98824,"text":"From colleagues to lovers","index":33,"start":97338},{"end":104025,"text":"हमने पाया है एक दूसरे को","index":34,"start":99567},{"end":108483,"text":"Every day feels like discovery","index":35,"start":104768},{"end":112941,"text":"यही तो है our love की victory","index":36,"start":109969},{"end":113684,"text":"[Chorus]","index":38,"start":113684},{"end":116657,"text":"Same office, different hearts","index":39,"start":114427},{"end":118886,"text":"लेकिन beating as one","index":40,"start":116657},{"end":121115,"text":"Every morning starts","index":41,"start":118886},{"end":123344,"text":"With you, my सूरज sun","index":42,"start":121115},{"end":125573,"text":"Same office, different hearts","index":43,"start":124087},{"end":128545,"text":"But connected by love''s art","index":44,"start":125573},{"end":131517,"text":"तुम हो मेरे हर beat में","index":45,"start":129288},{"end":133746,"text":"Now forever, never apart","index":46,"start":131517},{"end":133746,"text":"[Bridge]","index":48,"start":133746},{"end":136719,"text":"365 days of learning you","index":49,"start":133746},{"end":141177,"text":"तुम्हारी हर ada, हर हंसी too","index":50,"start":138205},{"end":145635,"text":"Email threads turned into love letters","index":51,"start":142663},{"end":147864,"text":"अब हमारे पास है something better","index":52,"start":145635},{"end":150093,"text":"Professional became personal","index":53,"start":148607},{"end":153808,"text":"यार, this love is so eternal","index":54,"start":150836},{"end":154552,"text":"[Final Chorus]","index":56,"start":154552},{"end":156781,"text":"Same office, different hearts","index":57,"start":155295},{"end":159010,"text":"लेकिन beating as one","index":58,"start":157524},{"end":162725,"text":"Every morning starts","index":59,"start":160496},{"end":164211,"text":"With you, my सूरज sun","index":60,"start":162725},{"end":167183,"text":"Same office, different hearts","index":61,"start":164954},{"end":169412,"text":"But connected by love''s art","index":62,"start":167183},{"end":172384,"text":"तुम हो मेरे हर beat में","index":63,"start":170155},{"end":174614,"text":"Now forever, never apart","index":64,"start":172384},{"end":175357,"text":"[Outro]","index":66,"start":175357},{"end":177586,"text":"Same building, same floor","index":67,"start":175357},{"end":181301,"text":"लेकिन अब है कुछ और","index":68,"start":179072},{"end":185759,"text":"Same office, different hearts","index":69,"start":183530},{"end":189474,"text":"यहीं से शुरू हुई our love''s art","index":70,"start":186502}]}'::jsonb,
        '{"original_id":3,"original_sequence":3,"duration":"195.00","song_url":"/audio/office-love.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Love Story'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Same Office, Different Hearts'
    LIMIT 1;

    -- Song entry for: A kid's night musical
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
        'kids-night-musical',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":743,"text":"[Verse 1]","index":0,"start":743},{"end":14117,"text":"Close your eyes, little Disha dear,","index":1,"start":743},{"end":17832,"text":"Stars above are shining near.","index":2,"start":14117},{"end":22291,"text":"Moonlight dancing on your cheek,","index":3,"start":18575},{"end":27492,"text":"Dreams will come, so soft, so sweet.","index":4,"start":22291},{"end":28235,"text":"[Chorus]","index":6,"start":27492},{"end":32693,"text":"Sleep, my angel, through the night,","index":7,"start":28235},{"end":37894,"text":"Wrapped in love and silver light.","index":8,"start":32693},{"end":40867,"text":"Hush now, baby, dont you cry,","index":9,"start":37894},{"end":47554,"text":"Mamas here, and lullabies fly.","index":10,"start":42353},{"end":50526,"text":"[Verse 2]","index":12,"start":48297},{"end":54984,"text":"Teddy waits with open arms,","index":13,"start":50526},{"end":60186,"text":"Keeping you safe from all harm.","index":14,"start":54984},{"end":61672,"text":"Clouds are pillows in the sky,","index":15,"start":60186},{"end":67616,"text":"Singing birds are flying by.","index":16,"start":64644},{"end":69102,"text":"[Chorus]","index":18,"start":67616},{"end":72817,"text":"Sleep, my angel, through the night,","index":19,"start":69102},{"end":78019,"text":"Wrapped in love and silver light.","index":20,"start":73560},{"end":81734,"text":"Hush now, baby, dont you cry,","index":21,"start":78019},{"end":86192,"text":"Papas smile is standing by.","index":22,"start":83220},{"end":87678,"text":"[Bridge]","index":24,"start":86935},{"end":92136,"text":"You are magic, pure and bright,","index":25,"start":87678},{"end":96595,"text":"Little star in morning light.","index":26,"start":92136},{"end":101053,"text":"Every coo and every sigh,","index":27,"start":98081},{"end":105511,"text":"Fills our hearts with love so high.","index":28,"start":101053},{"end":106997,"text":"[Final Chorus]","index":30,"start":105511},{"end":109969,"text":"Sleep, my Disha, dream away,","index":31,"start":106997},{"end":115914,"text":"Night will melt to golden day.","index":32,"start":109969},{"end":119629,"text":"You are loved, oh yes its true,","index":33,"start":115914},{"end":124830,"text":"The whole wide world waits just for you.","index":34,"start":119629}]}'::jsonb,
        '{"original_id":4,"original_sequence":4,"duration":"181.00","song_url":"/audio/kids-musical.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Musical'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: A kid''s night musical'
    LIMIT 1;

    -- Song entry for: Lipsa Birthday Song
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
        'lipsa-birthday-song',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":7430,"text":"[Verse 1]","index":0,"start":7430},{"end":9659,"text":"Lipsa, it''s your special day","index":1,"start":7430},{"end":12631,"text":"Independent queen, you paved the way","index":2,"start":9659},{"end":17832,"text":"Runway ready, camera flash","index":3,"start":14860},{"end":20805,"text":"Confidence that makes heads turn fast","index":4,"start":17832},{"end":22291,"text":"[Pre-Chorus]","index":6,"start":21548},{"end":24520,"text":"Whiskey in your glass tonight","index":7,"start":22291},{"end":28978,"text":"Dancing till the morning light","index":8,"start":26006},{"end":29721,"text":"[Chorus]","index":10,"start":28978},{"end":35665,"text":"Happy birthday to my girl","index":11,"start":29721},{"end":43839,"text":"Party animal, rock this world","index":12,"start":40867},{"end":47554,"text":"Sutta breaks and midnight calls","index":13,"start":43839},{"end":52012,"text":"You''re the one who conquers all","index":14,"start":47554},{"end":54984,"text":"Living life on your own terms","index":15,"start":52012},{"end":58700,"text":"Happy birthday, watch it burn","index":16,"start":55727},{"end":60186,"text":"[Verse 2]","index":18,"start":58700},{"end":62415,"text":"Working hard but playing harder","index":19,"start":60186},{"end":67616,"text":"Every goal just makes you smarter","index":20,"start":63158},{"end":69845,"text":"Modelling dreams and city nights","index":21,"start":67616},{"end":72817,"text":"You''re the star in neon lights","index":22,"start":69845},{"end":74303,"text":"[Pre-Chorus]","index":24,"start":73560},{"end":78762,"text":"Whiskey in your glass tonight","index":25,"start":75046},{"end":81734,"text":"Dancing till the morning light","index":26,"start":78762},{"end":82477,"text":"[Chorus]","index":28,"start":81734},{"end":91393,"text":"Happy birthday to my girl","index":29,"start":83963},{"end":95851,"text":"Party animal, rock this world","index":30,"start":91393},{"end":99567,"text":"Sutta breaks and midnight calls","index":31,"start":96595},{"end":103282,"text":"You''re the one who conquers all","index":32,"start":100310},{"end":107740,"text":"Living life on your own terms","index":33,"start":103282},{"end":110712,"text":"Happy birthday, watch it burn","index":34,"start":107740},{"end":119629,"text":"[Bridge]","index":36,"start":111455},{"end":122601,"text":"From sunrise shoots to evening calls","index":37,"start":119629},{"end":127059,"text":"You handle business, handle it all","index":38,"start":122601},{"end":129288,"text":"My partner in this crazy ride","index":39,"start":127059},{"end":134489,"text":"Birthday queen, you''re my pride","index":40,"start":130031},{"end":138205,"text":"[Chorus]","index":42,"start":134489},{"end":140434,"text":"Happy birthday to my girl","index":43,"start":138205},{"end":149350,"text":"Party animal, rock this world","index":44,"start":145635},{"end":152322,"text":"Sutta breaks and midnight calls","index":45,"start":149350},{"end":156781,"text":"You''re the one who conquers all","index":46,"start":152322},{"end":159753,"text":"Living life on your own terms","index":47,"start":156781},{"end":164211,"text":"Happy birthday, watch it burn","index":48,"start":160496},{"end":172384,"text":"[Outro]","index":50,"start":164211},{"end":175357,"text":"Lipsa, this one''s just for you","index":51,"start":172384},{"end":181301,"text":"Another year of breaking through","index":52,"start":175357}]}'::jsonb,
        '{"original_id":5,"original_sequence":5,"duration":"181.00","song_url":"/audio/birthday-queen.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Birthday Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Lipsa Birthday Song'
    LIMIT 1;

    -- Song entry for: Nirvan's Birthday Song
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
        'nirvan-birthday-song',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":11145,"text":"[Verse 1]","index":0,"start":11145},{"end":14117,"text":"Today''s your day","index":1,"start":11145},{"end":15603,"text":"Blue is here","index":2,"start":14117},{"end":20062,"text":"Lion roars","index":3,"start":17089},{"end":22291,"text":"Birthday cheer","index":4,"start":20062},{"end":23034,"text":"[Chorus]","index":6,"start":22291},{"end":24520,"text":"Nirvan, Nirvan","index":7,"start":23034},{"end":26006,"text":"*clap clap clap*","index":8,"start":24520},{"end":28235,"text":"Blue lion dance","index":9,"start":26006},{"end":31207,"text":"Happy birthday","index":10,"start":28235},{"end":31950,"text":"*clap clap clap*","index":11,"start":31207},{"end":35665,"text":"Mummy Papa sing","index":12,"start":31950},{"end":35665,"text":"[Verse 2]","index":14,"start":35665},{"end":37151,"text":"Two years old","index":15,"start":35665},{"end":40867,"text":"Growing strong","index":16,"start":37894},{"end":43839,"text":"Blue balloons","index":17,"start":40867},{"end":46068,"text":"Birthday song","index":18,"start":43839},{"end":46811,"text":"[Chorus]","index":20,"start":46811},{"end":49040,"text":"Nirvan, Nirvan","index":21,"start":46811},{"end":50526,"text":"*clap clap clap*","index":22,"start":49040},{"end":53498,"text":"Blue lion dance","index":23,"start":50526},{"end":54984,"text":"Happy birthday","index":24,"start":53498},{"end":56470,"text":"*clap clap clap*","index":25,"start":55727},{"end":58700,"text":"Mummy Papa sing","index":26,"start":56470},{"end":62415,"text":"[Bridge]","index":28,"start":58700},{"end":72817,"text":"Roar like lion","index":29,"start":65387},{"end":74303,"text":"*ROAR!*","index":30,"start":72817},{"end":75789,"text":"Jump so high","index":31,"start":74303},{"end":78762,"text":"Blue sky flying","index":32,"start":76532},{"end":81734,"text":"Birthday time","index":33,"start":79505},{"end":82477,"text":"[Chorus]","index":35,"start":81734},{"end":95851,"text":"Nirvan, Nirvan","index":36,"start":94365},{"end":97338,"text":"*clap clap clap*","index":37,"start":95851},{"end":99567,"text":"Blue lion dance","index":38,"start":97338},{"end":102539,"text":"Happy birthday","index":39,"start":100310},{"end":102539,"text":"*clap clap clap*","index":40,"start":102539},{"end":102539,"text":"Mummy Papa sing","index":41,"start":102539},{"end":102539,"text":"[Outro]","index":43,"start":102539},{"end":102539,"text":"Happy birthday","index":44,"start":102539},{"end":107740,"text":"Nirvan beta","index":45,"start":102539},{"end":113684,"text":"*clap clap clap*","index":46,"start":107740},{"end":113684,"text":"Blue lion king!","index":47,"start":240001}]}'::jsonb,
        '{"original_id":6,"original_sequence":6,"duration":"113.00","song_url":"/audio/nirvan-birthday.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Birthday Party'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Nirvan''s Birthday Song'
    LIMIT 1;

    -- Song entry for: Ram and Akanksha's wedding anthem
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
        'ram-akanksha-wedding-anthem',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":8916,"text":"[Verse 1]","index":0,"start":8916},{"end":14117,"text":"Same cubicle, different day","index":1,"start":8916},{"end":17089,"text":"Tumhe dekha first time","index":2,"start":14117},{"end":23777,"text":"Coffee spills, awkward waves","index":3,"start":17832},{"end":26749,"text":"Didn''t know you''d be mine","index":4,"start":23777},{"end":28978,"text":"[Pre-Chorus]","index":6,"start":27492},{"end":33436,"text":"One year ago, who would''ve thought","index":7,"start":28978},{"end":39381,"text":"Dil mein jo baat thi","index":8,"start":33436},{"end":41610,"text":"From strangers to forever","index":9,"start":39381},{"end":43839,"text":"Yeh kya baat hai","index":10,"start":42353},{"end":45325,"text":"[Chorus]","index":12,"start":44582},{"end":48297,"text":"Tum ho, tum ho","index":13,"start":45325},{"end":51269,"text":"My heart beats for you","index":14,"start":48297},{"end":56470,"text":"Tum ho, tum ho","index":15,"start":53498},{"end":60929,"text":"Forever me and you","index":16,"start":57957},{"end":72817,"text":"[Verse 2]","index":18,"start":62415},{"end":77276,"text":"Lunch breaks turned to late night calls","index":19,"start":72817},{"end":80248,"text":"Presentation stress, we shared it all","index":20,"start":77276},{"end":86935,"text":"Office romance, they all knew","index":21,"start":82477},{"end":87678,"text":"But I only saw you","index":22,"start":86935},{"end":92879,"text":"[Pre-Chorus]","index":24,"start":89164},{"end":98081,"text":"One year ago, who would''ve thought","index":25,"start":92879},{"end":101053,"text":"Dil mein jo baat thi","index":26,"start":98081},{"end":105511,"text":"From strangers to forever","index":27,"start":101053},{"end":108483,"text":"Yeh kya baat hai","index":28,"start":106254},{"end":109226,"text":"[Chorus]","index":30,"start":108483},{"end":110712,"text":"Tum ho, tum ho","index":31,"start":109226},{"end":115914,"text":"My heart beats for you","index":32,"start":110712},{"end":119629,"text":"Tum ho, tum ho","index":33,"start":115914},{"end":122601,"text":"Forever me and you","index":34,"start":121115},{"end":127059,"text":"[Bridge]","index":36,"start":123344},{"end":130774,"text":"Ram and Akanksha, this is our song","index":37,"start":127059},{"end":136719,"text":"Kaam se pyaar tak, we came along","index":38,"start":131517},{"end":140434,"text":"Same building, different floor","index":39,"start":136719},{"end":146378,"text":"Ab tum mere saath, what could I want more?","index":40,"start":141920},{"end":147121,"text":"[Final Chorus]","index":42,"start":147121},{"end":150093,"text":"Tum ho, tum ho","index":43,"start":147121},{"end":156781,"text":"My heart beats for you","index":44,"start":150093},{"end":159010,"text":"Tum ho, tum ho","index":45,"start":156781},{"end":161982,"text":"Forever me and you","index":46,"start":161239},{"end":167926,"text":"(Forever me and you)","index":47,"start":164211},{"end":179815,"text":"(Tum ho, tum ho)","index":48,"start":168669}]}'::jsonb,
        '{"original_id":7,"original_sequence":7,"duration":"180.00","song_url":"/audio/wedding-anthem.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Wedding Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Ram and Akanksha''s wedding anthem'
    LIMIT 1;

    -- Song entry for: Unchained
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
        'unchained',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":20465,"text":"(Verse 1)","index":0,"start":20266},{"end":24212,"text":"Late-night  coffee,  books  piled  high","index":1,"start":20495},{"end":26777,"text":"Underneath  a  sleepless  sky","index":2,"start":24248},{"end":29741,"text":"They  saw  the  struggle,  they  saw  the  grind","index":3,"start":26824},{"end":33399,"text":"The  mountain  of  doubt  you  had  to  climb","index":4,"start":29801},{"end":36956,"text":"They  drew  a  box  and  tried  to  score","index":5,"start":33447},{"end":39475,"text":"Everything  you  were,  and  so  much  more","index":6,"start":36971},{"end":43205,"text":"But  they  couldn''t  measure  the  fire  in  your  chest","index":7,"start":39535},{"end":45750,"text":"Putting  your  spirit  to  the  ultimate  test","index":8,"start":43245},{"end":46324,"text":"( Pre-Chorus)","index":9,"start":45439},{"end":49001,"text":"You  shut  out  the  noise,  you  shut  out  the  dread","index":10,"start":46388},{"end":52766,"text":"Listened  to  the  voice  inside  your  head","index":11,"start":49012},{"end":56130,"text":"It  whispered, \" You''re  stronger  than  you  know\"","index":12,"start":52872},{"end":61636,"text":"It''s  your  time  to  rise,  your  time  to  glow!","index":13,"start":56150},{"end":71138,"text":"Oh,  Kabir,  look  at  you  now,  standing  so  tall!","index":14,"start":61735},{"end":74218,"text":"You  answered  the  challenge,  you  answered  the  call","index":15,"start":71202},{"end":77912,"text":"That  SAT  score,  a  victory  cry","index":16,"start":74314},{"end":84383,"text":"A  national  ranking  that  touches  the  sky!","index":17,"start":78032},{"end":87782,"text":"You  unleashed  the  power  you  held  inside","index":18,"start":84447},{"end":94289,"text":"With  absolutely  nothing  left  to  hide","index":19,"start":87878},{"end":98378,"text":"The  numbers  all  spell  out  your  name","index":20,"start":94348},{"end":107483,"text":"You  didn''t  just  play,  you  changed  the  game!","index":21,"start":98457},{"end":107793,"text":"( Verse 2)","index":22,"start":100951},{"end":111144,"text":"Remember  the  moment,  the  screen  so  bright","index":23,"start":107832},{"end":114495,"text":"Chasing  away  the  long,  dark  night","index":24,"start":111223},{"end":117750,"text":"You  held  your  breath,  then  a  joyful  shout","index":25,"start":114574},{"end":120798,"text":"Erasing  every  single  doubt","index":26,"start":117814},{"end":123910,"text":"It  wasn''t  just  numbers  flashing  on  the  screen","index":27,"start":120878},{"end":127221,"text":"It  was  every  single  moment  in  between","index":28,"start":123989},{"end":130273,"text":"The  hard  work,  the  hope,  the  strength  you  found","index":29,"start":127261},{"end":132638,"text":"The  most  solid  and  hopeful  ground","index":30,"start":130332},{"end":134059,"text":"( Pre-Chorus)","index":31,"start":132314},{"end":137587,"text":"You  shut  out  the  noise,  you  shut  out  the  dread","index":32,"start":134106},{"end":139814,"text":"Listened  to  the  voice  inside  your  head","index":33,"start":137622},{"end":143896,"text":"It  whispered, \" You''re  stronger  than  you  know\"","index":34,"start":139920},{"end":149388,"text":"It''s  your  time  to  rise,  your  time  to  glow!","index":35,"start":143916},{"end":150379,"text":"( Chorus)","index":36,"start":146509},{"end":158824,"text":"Oh,  Kabir,  look  at  you  now,  standing  so  tall!","index":37,"start":150409},{"end":162048,"text":"You  answered  the  challenge,  you  answered  the  call","index":38,"start":158888},{"end":166356,"text":"That  SAT  score,  a  victory  cry","index":39,"start":162128},{"end":172149,"text":"A  national  ranking  that  touches  the  sky!","index":40,"start":166436},{"end":175468,"text":"You  unleashed  the  power  you  held  inside","index":41,"start":172213},{"end":182055,"text":"With  absolutely  nothing  left  to  hide","index":42,"start":175564},{"end":186124,"text":"The  numbers  all  spell  out  your  name","index":43,"start":182114},{"end":189202,"text":"You  didn''t  just  play,  you  changed  the  game!","index":44,"start":186184},{"end":194840,"text":"( Bridge)","index":45,"start":188697},{"end":201750,"text":"This  is  more  than  just  a  win,  it''s  a  sign","index":46,"start":194880},{"end":208145,"text":"Your  future  is  a  blank  page,  yours  to  design","index":47,"start":201798},{"end":211815,"text":"Let  this  feeling  be  your  endless  fuel","index":48,"start":208205},{"end":214973,"text":"You  make  your  own  luck,  you  write  your  own  rule!","index":49,"start":211875},{"end":222168,"text":"( Chorus -  Outro)","index":50,"start":214588},{"end":227176,"text":"Oh,  Kabir,  look  at  you  now,  standing  so  tall!","index":51,"start":222267},{"end":231822,"text":"( Standing  so  tall!)","index":52,"start":226536},{"end":234894,"text":"You  answered  the  challenge,  you  answered  the  call!","index":53,"start":231862},{"end":239149,"text":"That  SAT  score,  a  victory  cry","index":54,"start":234973},{"end":241775,"text":"( A  victory  cry!)","index":55,"start":238351},{"end":248872,"text":"A  national  ranking  that  touches  the  sky!","index":56,"start":241835},{"end":254856,"text":"You  unleashed  the  power  you  held  inside","index":57,"start":248920},{"end":261523,"text":"With  absolutely  nothing  left  to  hide","index":58,"start":254952},{"end":265592,"text":"The  numbers  all  spell  out  your  name","index":59,"start":261582},{"end":273324,"text":"You  didn''t  just  play,  you  changed  the  game!","index":60,"start":265652},{"end":279295,"text":"Yeah,  you  changed  the  game!","index":61,"start":273391},{"end":281968,"text":"Go  on,  Kabir,  change  the  game!","index":62,"start":279355}]}'::jsonb,
        '{"original_id":8,"original_sequence":8,"duration":"180.00","song_url":"/audio/unchained.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Motivational Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Unchained'
    LIMIT 1;

    -- Song entry for: Birthday Boy's Blue Party
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
        'birthday-blue-party',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":4458,"text":"[Verse 1]","index":0,"start":2972},{"end":5944,"text":"Nirvan ka birthday hai today","index":1,"start":4458},{"end":8173,"text":"Blue balloons flying high hooray","index":2,"start":5944},{"end":10402,"text":"Mummy Papa singing loud","index":3,"start":8916},{"end":13374,"text":"Our little prince makes us so proud","index":4,"start":11145},{"end":17832,"text":"*clap clap clap*","index":5,"start":14117},{"end":22291,"text":"Lion roar goes ROAR ROAR ROAR","index":6,"start":18575},{"end":25263,"text":"Blue is your favorite color for sure","index":7,"start":22291},{"end":26006,"text":"[Chorus]","index":9,"start":26006},{"end":28978,"text":"Happy birthday Nirvan beta","index":10,"start":26006},{"end":29721,"text":"You''re our shining blue star","index":11,"start":29721},{"end":31207,"text":"Happy birthday Nirvan beta","index":12,"start":29721},{"end":34922,"text":"Lion strong that''s what you are","index":13,"start":31950},{"end":37151,"text":"*clap clap clap*","index":14,"start":35665},{"end":41610,"text":"Blue and brave just like a king","index":15,"start":37151},{"end":43839,"text":"Dance and laugh let''s celebrate","index":16,"start":41610},{"end":46068,"text":"[Verse 2]","index":18,"start":43839},{"end":50526,"text":"Cake is blue just like you like","index":19,"start":48297},{"end":52755,"text":"Lion toy ready for a hike","index":20,"start":51269},{"end":54984,"text":"Mummy''s love and Papa''s kiss","index":21,"start":52755},{"end":57957,"text":"Birthday boy full of bliss","index":22,"start":55727},{"end":62415,"text":"*clap clap clap*","index":23,"start":57957},{"end":66130,"text":"ROAR ROAR ROAR like lions do","index":24,"start":62415},{"end":69102,"text":"Everything today is about you","index":25,"start":66873},{"end":69845,"text":"[Chorus]","index":27,"start":69845},{"end":71331,"text":"Happy birthday Nirvan beta","index":28,"start":70588},{"end":74303,"text":"You''re our shining blue star","index":29,"start":71331},{"end":76532,"text":"Happy birthday Nirvan beta","index":30,"start":75046},{"end":78762,"text":"Lion strong that''s what you are","index":31,"start":76532},{"end":80991,"text":"*clap clap clap*","index":32,"start":79505},{"end":83220,"text":"Blue and brave just like a king","index":33,"start":80991},{"end":85449,"text":"Dance and laugh let''s celebrate","index":34,"start":83963},{"end":86192,"text":"[Bridge]","index":36,"start":85449},{"end":87678,"text":"One more year you''re growing tall","index":37,"start":86192},{"end":89907,"text":"Lion heart conquers it all","index":38,"start":88421},{"end":92879,"text":"Blue balloons touch the sky","index":39,"start":90650},{"end":95851,"text":"Our Nirvan makes us fly so high","index":40,"start":92879},{"end":97338,"text":"*clap clap clap*","index":41,"start":97338},{"end":98081,"text":"[Final Chorus]","index":43,"start":98081},{"end":101796,"text":"Happy birthday Nirvan beta","index":44,"start":98081},{"end":104768,"text":"You''re our shining blue star","index":45,"start":102539},{"end":110712,"text":"Happy birthday Nirvan beta","index":46,"start":107740},{"end":114427,"text":"Lion strong that''s what you are","index":47,"start":110712},{"end":115170,"text":"*clap clap clap*","index":48,"start":115170},{"end":118143,"text":"Blue and brave just like a king","index":49,"start":115914},{"end":125573,"text":"This is your special day","index":50,"start":118886},{"end":133746,"text":"Let''s sing and play!","index":51,"start":125573}]}'::jsonb,
        '{"original_id":9,"original_sequence":9,"duration":"150.00","song_url":"/audio/blue-party.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Kids Birthday Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Birthday Boy''s Blue Party'
    LIMIT 1;

    -- Song entry for: Sweet Dreams Tonight
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
        'sweet-dreams-tonight',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":3715,"text":"[Intro]","index":0,"start":3715},{"end":8173,"text":"Close your eyes, little Arth","index":1,"start":4458},{"end":17832,"text":"Close, close, close","index":2,"start":11145},{"end":23777,"text":"[Verse 1]","index":4,"start":20062},{"end":28235,"text":"Arth, my darling Arth","index":5,"start":24520},{"end":31207,"text":"Time to rest your heart","index":6,"start":28235},{"end":35665,"text":"Stars are singing soft","index":7,"start":31207},{"end":40867,"text":"Singing, singing soft","index":8,"start":37894},{"end":42353,"text":"[Chorus]","index":10,"start":41610},{"end":45325,"text":"Sleep now, Arth","index":11,"start":42353},{"end":50526,"text":"Sleep, sleep, Arth","index":12,"start":47554},{"end":55727,"text":"Dream deep, Arth","index":13,"start":52012},{"end":59443,"text":"Sleep, sleep, sleep","index":14,"start":57213},{"end":70588,"text":"[Verse 2]","index":16,"start":60186},{"end":73560,"text":"Blankets warm around","index":17,"start":71331},{"end":78762,"text":"Safe and soft, no sound","index":18,"start":74303},{"end":82477,"text":"Arth, you''re precious, dear","index":19,"start":80991},{"end":88421,"text":"Precious, precious, dear","index":20,"start":85449},{"end":89164,"text":"[Chorus]","index":22,"start":88421},{"end":93622,"text":"Sleep now, Arth","index":23,"start":89907},{"end":99567,"text":"Sleep, sleep, Arth","index":24,"start":94365},{"end":103282,"text":"Dream deep, Arth","index":25,"start":99567},{"end":107740,"text":"Sleep, sleep, sleep","index":26,"start":104768},{"end":109226,"text":"[Bridge]","index":28,"start":108483},{"end":118143,"text":"Arth, Arth, Arth","index":29,"start":109226},{"end":120372,"text":"Floating far","index":30,"start":118143},{"end":125573,"text":"Peaceful heart","index":31,"start":121115},{"end":132260,"text":"Rest, rest, rest","index":32,"start":125573},{"end":153065,"text":"[Chorus]","index":34,"start":133746},{"end":157524,"text":"Sleep now, Arth","index":35,"start":153065},{"end":159753,"text":"Sleep, sleep, Arth","index":36,"start":157524},{"end":167183,"text":"Dream deep, Arth","index":37,"start":161982},{"end":170155,"text":"Sleep, sleep, sleep","index":38,"start":167183},{"end":173871,"text":"[Outro]","index":40,"start":170155},{"end":179072,"text":"Close your eyes, sweet Arth","index":41,"start":173871},{"end":189474,"text":"Sleep... sleep... sleep...","index":42,"start":179072}]}'::jsonb,
        '{"original_id":10,"original_sequence":10,"duration":"200.00","song_url":"/audio/sweet-dreams-tonight.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.158Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Lullaby'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Sweet Dreams Tonight'
    LIMIT 1;

    -- Song entry for: Akash's Birthday Bash Song
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
        'akash-birthday-bash',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":23138,"text":"[Verse 1]","index":0,"start":22660},{"end":24774,"text":"Dekho  dekho  kaun  aaya?","index":1,"start":22660},{"end":29867,"text":"Aakash  ka  birthday  aaya!","index":2,"start":24894},{"end":32979,"text":"He’ s  not  one,  not  two,  not  four,","index":3,"start":29894},{"end":37161,"text":"He''s  the  big  FIVE,  let''s  hit  the  floor!","index":4,"start":33005},{"end":37580,"text":"[Chorus]","index":5,"start":37191},{"end":41298,"text":"Happy  Birthday,  Aakash!  It''s  your  special  day!","index":6,"start":37191},{"end":44601,"text":"Come  on  everybody,  dhoom  machao!","index":7,"start":41346},{"end":49209,"text":"Apne  friend  ke  liye  taali  bajao!","index":8,"start":44681},{"end":55871,"text":"Hip  Hip  Hurray  for  Aakash!  Let''s  all  shout  and  say...","index":9,"start":49269},{"end":65864,"text":"HAPPY  BIRTHDAY!","index":10,"start":55931},{"end":66144,"text":"[Verse 2]","index":11,"start":65884},{"end":68824,"text":"Five  years  old,  so  strong  and  tall,","index":12,"start":65884},{"end":72553,"text":"Like  a  superhero,  answering  the  call!","index":13,"start":68872},{"end":76217,"text":"Kabhi  Spiderman,  kabhi  Superman,","index":14,"start":72580},{"end":80399,"text":"You''re  our  hero,  sabse  mahaan!","index":15,"start":76237},{"end":83976,"text":"Roar  like  a  dino,  zoom  like  a  car,","index":16,"start":80452},{"end":86210,"text":"Aakash  you''re  our  shining  star!","index":17,"start":84096},{"end":86489,"text":"[Chorus]","index":18,"start":86230},{"end":93479,"text":"Happy  Birthday,  Aakash!  It''s  your  special  day!","index":19,"start":86230},{"end":96676,"text":"Come  on  everybody,  dhoom  machao!","index":20,"start":93527},{"end":100951,"text":"Apne  friend  ke  liye  taali  bajao!","index":21,"start":96729},{"end":107972,"text":"Hip  Hip  Hurray  for  Aakash!  Let''s  all  shout  and  say...","index":22,"start":101051},{"end":110204,"text":"HAPPY  BIRTHDAY!","index":23,"start":108032},{"end":110585,"text":"[Bridge - Interactive Dance Break]","index":24,"start":110212},{"end":113617,"text":"Everybody  make  a  circle,  big  and  round!","index":25,"start":110212},{"end":116689,"text":"Now  jump  up  high  and  stomp  the  ground!","index":26,"start":113697},{"end":120080,"text":"Aakash  in  the  middle,  show  us  your  move,","index":27,"start":116809},{"end":126443,"text":"Aakash,  ghoom  ke  dikhao,  get  in  the  groove!","index":28,"start":120160},{"end":130153,"text":"All  the  friends  say...  AAKASH! ( Everyone  shouts)","index":29,"start":126503},{"end":140138,"text":"Let''s  get  louder...  AAKASH! ( Everyone  shouts  louder)","index":30,"start":130173},{"end":140346,"text":"[Verse 3]","index":31,"start":140154},{"end":143670,"text":"The  cake  is  here,  with  candles  bright,","index":32,"start":140154},{"end":147686,"text":"Paanch  saal  ka,  what  a  lovely  sight!","index":33,"start":143723},{"end":150128,"text":"Make  a  wish  and  blow  them  out,","index":34,"start":147766},{"end":163680,"text":"That’ s  what  birthdays  are  all  about!","index":35,"start":150176},{"end":164043,"text":"[Final Chorus]","index":36,"start":163698},{"end":167840,"text":"Happy  Birthday,  Aakash!  It''s  your  special  day!","index":37,"start":163698},{"end":171064,"text":"Come  on  everybody,  dhoom  machao!","index":38,"start":167888},{"end":175233,"text":"Apne  friend  ke  liye  taali  bajao!","index":39,"start":171144},{"end":179232,"text":"Hip  Hip  Hurray  for  Aakash!  Let''s  all  shout  and  say...","index":40,"start":175332},{"end":185532,"text":"HAPPY  BIRTHDAY!","index":41,"start":179322},{"end":185984,"text":"[Outro]","index":42,"start":185545},{"end":188923,"text":"Baar  baar  din  yeh  aaye!","index":43,"start":185545},{"end":192750,"text":"Happy  Birthday,  Aakash!","index":44,"start":188989},{"end":199488,"text":"From  all  your  friends  today!","index":45,"start":192814},{"end":212553,"text":"Hurray!","index":46,"start":199588}]}'::jsonb,
        '{"original_id":11,"original_sequence":11,"duration":"181.00","song_url":"/audio/akash-birthday.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Birthday Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Akash''s Birthday Bash Song'
    LIMIT 1;

    -- Song entry for: Yaara
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
        'yaara',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":16197,"text":"Yaad hai woh din, college ki सी ढ़ि याँ (seedhiyaan)?","index":0,"start":8834},{"end":26410,"text":"Gappein hazaar, aur lakhon kahaniyaan Ek cup chai mein, dher saari","index":1,"start":16277},{"end":33245,"text":"baatein Kaise guzarti thi woh lambi raatein Chhoti si pocket mein,","index":2,"start":26489},{"end":38697,"text":"sapne the bade Ek doosre ke liye, hamesha the khade (Chorus) Oh","index":3,"start":33298},{"end":48391,"text":"Yaara, sun le zaraa Tere jaisa koi nahi mila Hasi mein, aansu mein,","index":4,"start":38816},{"end":56011,"text":"har ek pal mein Tu hi toh hai mera hausla Yeh dosti ka rang, hai","index":5,"start":48511},{"end":70133,"text":"sabse gehra Saath tera, jaise khushiyon ka pehra (Verse 2) Zindagi","index":6,"start":56051},{"end":81303,"text":"ki race mein, jab thak jaata hoon Teri awaaz sun ke, sukoon paata","index":7,"start":70253},{"end":91277,"text":"hoon Kabhi tu daante, kabhi tu sambhaale Mere saare raaz, dil mein","index":8,"start":81423},{"end":98218,"text":"tu paale Woh paagalpan aur, woh jhoothe bahane Yaad aate hain woh,","index":9,"start":91396},{"end":106596,"text":"guzre zamaane (Chorus) Oh Yaara, sun le zaraa Tere jaisa koi nahi","index":10,"start":98298},{"end":113298,"text":"mila Hasi mein, aansu mein, har ek pal mein Tu hi toh hai mera","index":11,"start":106676},{"end":121277,"text":"hausla Yeh dosti ka rang, hai sabse gehra Saath tera, jaise","index":12,"start":113457},{"end":127021,"text":"khushiyon ka pehra (Bridge) Waqt badla, sheher badle, badle hain","index":13,"start":121356},{"end":141144,"text":"raaste Par apni yaari ka, wahi hai waasta Door hokar bhi, tu paas","index":14,"start":127141},{"end":146449,"text":"hai dil ke Adhoore hain hum, bas tujhse mil ke (Guitar Solo -","index":15,"start":141223},{"end":148750,"text":"Upbeat and Melodic) (","index":16,"start":146549},{"end":167414,"text":"Chorus) Oh Yaara, sun le zaraa!","index":17,"start":148839},{"end":170984,"text":"Tere jaisa koi nahi mila!","index":18,"start":167513},{"end":178763,"text":"Hasi mein, aansu mein, har ek pal mein Tu hi toh hai mera hausla!","index":19,"start":171064},{"end":185585,"text":"Yeh dosti ka rang, hai sabse gehra Saath tera, jaise khushiyon ka","index":20,"start":178803},{"end":188657,"text":"pehra! ( Outro) Hmmm hmmm…","index":21,"start":185665},{"end":191888,"text":"hmmm hmmm… Saath tera…","index":22,"start":188697},{"end":196733,"text":"jaise khushiyon ka pehra… Oh Yaara… (","index":23,"start":191968},{"end":209043,"text":"Music fades with gentle guitar strumming and humming)","index":24,"start":196801}]}'::jsonb,
        '{"original_id":12,"original_sequence":12,"duration":"197.00","song_url":"/audio/yaara.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Romantic Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Yaara'
    LIMIT 1;

    -- Song entry for: Har Lamha Naya
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
        'har-lamha-naya',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":19309,"text":"Pahadi ki uss choti se, shuru hua jo safar Dil ko laga tha tabhi","index":0,"start":11362},{"end":28005,"text":"se, tu hi hai humsafar Thodi si bachkani baatein, woh masoom si","index":1,"start":19428},{"end":36440,"text":"nazar Mere saamne tu बच् चा, par fikar meri din bhar (Pre-Chorus)","index":2,"start":28125},{"end":40691,"text":"Coffee ke cup se, long drive ke pal tak Har baat mein teri, thi","index":3,"start":36497},{"end":44521,"text":"khushiyon ki khanak Haan, bhool jaata hai tu cheezein, par khaane ka","index":4,"start":40771},{"end":53218,"text":"shaukeen Teri har adaa pe dil ko, ho jaata hai yaqeen (Chorus) Yeh","index":5,"start":44574},{"end":61356,"text":"pehla saal hai apna, par lage sadiyon jaisa Mera sukoon hai tujhse,","index":6,"start":53298},{"end":71649,"text":"koi nahi tere jaisa Har lamha naya, har din hai khaas tere sang Tu","index":7,"start":61436},{"end":92500,"text":"Golu mera, meri duniya ka har rang (Verse 2) Cricket ka shor ho,","index":8,"start":71729},{"end":101968,"text":"ya theatre ka andhera Woh pehla kiss jo tera, hua dil bas tera","index":9,"start":92606},{"end":110691,"text":"Chupke se aana ghar pe, woh shararat bhari Jab ''I love you'' kaha,","index":10,"start":102074},{"end":117527,"text":"saans thi wahin pe thami (Pre-Chorus) Har birthday ka surprise, har","index":11,"start":110798},{"end":126543,"text":"gossip waali raat Har ek jhagde ke baad, compensation waali baat Tu","index":12,"start":117606},{"end":135612,"text":"chill hai, tu masti, tu hai sabse jooda Tere saath har ek kissa,","index":13,"start":126622},{"end":142739,"text":"lagta hai poora (Chorus) Yeh pehla saal hai apna, par lage sadiyon","index":14,"start":135665},{"end":153152,"text":"jaisa Mera sukoon hai tujhse, koi nahi tere jaisa Har lamha naya,","index":15,"start":142859},{"end":161170,"text":"har din hai khaas tere sang Tu Golu mera, meri duniya ka har","index":16,"start":153271},{"end":170904,"text":"rang (Bridge) Jab tooti thi main, exam ke stress mein Ya mood","index":17,"start":161210},{"end":180000,"text":"swings mein khoyi, apne hi desh mein Har aansu se pehle, tu haazir","index":18,"start":170984},{"end":189734,"text":"wahan tha Mere har zakhmon ka, tu hi toh nishaan tha Yaar pehle","index":19,"start":180106},{"end":198351,"text":"din se, best friend ban gaya Yeh rishta rooh se, rooh tak jud","index":20,"start":189894},{"end":206888,"text":"gaya (Chorus) Yeh pehla saal hai apna, par lage sadiyon jaisa Mera","index":21,"start":198431},{"end":216064,"text":"sukoon hai tujhse, koi nahi tere jaisa Har lamha naya, har din hai","index":22,"start":207008},{"end":225798,"text":"khaas tere sang Tu Golu mera, meri duniya ka har rang (Outro) Aage","index":23,"start":216170},{"end":235452,"text":"aur bhi safar, naye kisse likhenge Har saal, har pal, bas tere sang","index":24,"start":225878},{"end":244803,"text":"jeeyenge Mere Golu… Mera har lamha naya…","index":25,"start":235612},{"end":246064,"text":"tere sang.","index":26,"start":244899}]}'::jsonb,
        '{"original_id":13,"original_sequence":13,"duration":"269.00","song_url":"/audio/har-lamha-naya.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Love Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Har Lamha Naya'
    LIMIT 1;

    -- Song entry for: Jashn-e-Hemali
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
        'jashn-e-hemali',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":15319,"text":"Arey speaker ka volume badha do, Saare dance floor pe aa jao!","index":0,"start":8138},{"end":23457,"text":"Jiski smile hai sabse pyaari, Apni dancing queen, Hemali!","index":1,"start":15399},{"end":29202,"text":"Gaane ka, naachne ka, shauk puraana, Har mehfil ka tu dil, yeh sab","index":2,"start":23537},{"end":30040,"text":"ne maana! (","index":3,"start":29322},{"end":33989,"text":"Pre-Chorus) Toh aaj saare friends milke aaye, Dher saari wishes hain","index":4,"start":30053},{"end":34388,"text":"laaye!","index":5,"start":34069},{"end":38165,"text":"Shor macha do, naacho zor se! (","index":6,"start":34468},{"end":46197,"text":"Chorus) Oye Jashn-e-Hemali, dhoom macha de, Fifty candles phoonk maar","index":7,"start":38254},{"end":51602,"text":"ke bujha de! Dil se bolo, Happy Birthday!","index":8,"start":46316},{"end":54255,"text":"Yeh party rukni nahi chahiye, Hey!","index":9,"start":51662},{"end":54844,"text":"Hey! Hey! (","index":10,"start":54335},{"end":70931,"text":"Verse 2) Yaaron ki tu hi toh hai yaari, Teri har ek adaa hai","index":11,"start":54934},{"end":72261,"text":"niraali!","index":12,"start":71090},{"end":81383,"text":"Jab tu gaaye, sab jhoom jaate, Saare gham pal mein bhool jaate! (","index":13,"start":72314},{"end":83856,"text":"Pre-Chorus) Toh aaj saare friends milke aaye, Dher saari wishes hain","index":14,"start":81436},{"end":84215,"text":"laaye!","index":15,"start":83896},{"end":88351,"text":"Shor macha do, naacho zor se! (","index":16,"start":84255},{"end":94229,"text":"Chorus) Oye Jashn-e-Hemali, dhoom macha de, Fifty candles phoonk maar","index":17,"start":88360},{"end":99574,"text":"ke bujha de! Dil se bolo, Happy Birthday!","index":18,"start":94348},{"end":103664,"text":"Yeh party rukni nahi chahiye, Hey!","index":19,"start":99654},{"end":106330,"text":"Hey! Hey! (","index":20,"start":103763},{"end":109328,"text":"Bridge) Fifty-shifty kya cheez hai, bolo?","index":21,"start":106348},{"end":112990,"text":"Age is just a number, dil ko kholo!","index":22,"start":109428},{"end":122261,"text":"Energy teri ab bhi hai full-on, You are forever, our number one! (","index":23,"start":113081},{"end":129335,"text":"Chorus) Oye Jashn-e-Hemali, dhoom macha de, Fifty candles phoonk maar","index":24,"start":122349},{"end":134681,"text":"ke bujha de! Dil se bolo, Happy Birthday!","index":25,"start":129455},{"end":153870,"text":"Yeh party rukni nahi chahiye, Hey!","index":26,"start":134761},{"end":161968,"text":"Hey! Hey!","index":27,"start":153989}]}'::jsonb,
        '{"original_id":14,"original_sequence":14,"duration":"174.00","song_url":"/audio/jashn-e-hemali.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Birthday Party Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Jashn-e-Hemali'
    LIMIT 1;

    -- Song entry for: Jassi-di-jaan
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
        'jassi-di-jaan',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":12686,"text":"[Verse] Tere nain sharaan wale Oh kamaal kar gaye Dil mera chori","index":0,"start":5665},{"end":21702,"text":"karke Tu malmal kar gaye Husn tera chamakda Jaise chand di roshni","index":1,"start":12793},{"end":28404,"text":"Tu hi meri duniya Tu hi meri zindagi [Chorus] O Jassi di jaan Main","index":2,"start":21822},{"end":35904,"text":"tera shaan Dil nu khush kar gaye Tu mere armaan O Jassi di jaan","index":3,"start":28457},{"end":44761,"text":"Tu meri pehchaan Husn tera jitt gaya Baaki sab haaran [Verse 2] Tera","index":4,"start":36024},{"end":53457,"text":"nakhra ni lagda Jaise titli da rang Tere piche duniya saari Par tu","index":5,"start":44814},{"end":63032,"text":"meri sang Jaddo hass ke vekheya Dil mera dhadakda Tera pyar oh sona","index":6,"start":53497},{"end":68537,"text":"Jaise sone di chakdi [Chorus] O Jassi di jaan Main tera shaan Dil","index":7,"start":63152},{"end":76197,"text":"nu khush kar gaye Tu mere armaan O Jassi di jaan Tu meri pehchaan","index":8,"start":68657},{"end":95984,"text":"Husn tera jitt gaya Baaki sab haaran [Bridge] Tu meri kudi Main","index":9,"start":76356},{"end":106516,"text":"tera munda Rabb da shukriya Saath sada jhunda Tere bina adhoora Main","index":10,"start":96090},{"end":115133,"text":"ik kahani Jassi meri jaan Tu meri jawani [Chorus] O Jassi di jaan","index":11,"start":106676},{"end":122394,"text":"Main tera shaan Dil nu khush kar gaye Tu mere armaan O Jassi di","index":12,"start":115193},{"end":129495,"text":"jaan Tu meri pehchaan Husn tera jitt gaya Baaki sab haaran","index":13,"start":122513}]}'::jsonb,
        '{"original_id":15,"original_sequence":15,"duration":"174.00","song_url":"/audio/jassi-di-jaan.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Punjabi Love Song'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Jassi-di-jaan'
    LIMIT 1;

    -- Song entry for: A Dream Named Jivy
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
        'a-dream-named-jivy',
        'COMPLETED',
        true,
        '{}'::jsonb,
        '{}'::jsonb,
        '{"0":[{"end":41729,"text":"आँगन में आई बनके बहार तू मेरा छोटा सा सपना, मेरा प्यार तू","index":0,"start":30559},{"end":52021,"text":"जब से देखा है चेहरा ये मासूम सा दिल में बस एक ही है एहसास","index":1,"start":41809},{"end":65625,"text":"सा मेरी जीवी, तू है जिन्दगी तू ने आके मिटा दी हर कमी (Chorus)","index":2,"start":52181},{"end":76396,"text":"ओ जीवी, मेरी जीवी, तू आँखों का नूर है तुझसे ही रौशन मेरा","index":3,"start":65745},{"end":90479,"text":"जहान, मेरा सुरूर है सो जा मेरी गुड़िया, सपनों में खो जा मैं","index":4,"start":76516},{"end":102287,"text":"माँ की बाहों में, महफूज़ हो जा मेरा दिल अब से घर है तेरा My","index":5,"start":90638},{"end":137513,"text":"everything, अब तू ही सवेरा (Verse 2) नन्ही सी उँगली, छोटा सा पाँव","index":6,"start":102375},{"end":148963,"text":"मेरे जीवन की अब तू ही है छाँव तेरी खिलखिलाहट जैसे कोई गीत","index":7,"start":137633},{"end":161170,"text":"है मेरी हर दुआ में, तू ही मनमीत है देखूँ तुझको तो थम जाए","index":8,"start":149122},{"end":169707,"text":"पल तू ही मेरा आज है, तू ही मेरा कल (Chorus) ओ जीवी, मेरी जी","index":9,"start":161330},{"end":180798,"text":"वी, तू आँखों का नूर है तुझसे ही रौशन मेरा जहान, मेरा सुरूर","index":10,"start":169867},{"end":195957,"text":"है सो जा मेरी गुड़िया, सपनों में खो जा मैं माँ की बाहों में, महफू","index":11,"start":180957},{"end":207686,"text":"ज़ हो जा मेरा दिल अब से घर है तेरा My everything, अब तू ही सवेरा","index":12,"start":196277},{"end":218298,"text":"(Bridge) चाहे कुछ भी हो life की राहों में Always पाओगी मु","index":13,"start":207846},{"end":229428,"text":"झको इन बाहों में हर कदम पर मैं साथ बनूँगी तेरी खुशियों के","index":14,"start":218457},{"end":237128,"text":"लिए ही जिऊँगी (Outro) मेरी प्यारी जीवी...","index":15,"start":229548},{"end":241372,"text":"My little one... सो जा...","index":16,"start":237168},{"end":243590,"text":"मेरी जान... जीवी...","index":17,"start":241436}]}'::jsonb,
        '{"original_id":16,"original_sequence":16,"duration":"274.00","song_url":"/audio/a-dream-named-jivy.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":null}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Parent''s Love'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2024-01-01 00:00:00+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: A Dream Named Jivy'
    LIMIT 1;

    -- Song entry for: Resham Ki Dor
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
        'resham-ki-dor',
        'COMPLETED',
        true,
        '"[{\"id\": \"4cde0ee2-d8b9-4ba2-832a-abb5aa366836\", \"tags\": \"Acoustic Soul / Indie Folk.\\n\\nThe song is built around the warm, intricate fingerpicking of an acoustic guitar, creating an intimate and heartfelt atmosphere. A soft piano melody floats in the background, adding layers of emotion, while a gentle cello line underscores the chorus and bridge for added depth. The rhythm is maintained by a subtle, soft beat from a cajon or light tabla, keeping it soulful without overpowering the vocals.\\n\\nVoice: A soft, emotive female voice with a clear, breathy texture would be perfect. The delivery should feel like a personal, sincere message, almost like a sung letter. Think of voices like who excel at conveying vulnerability and warmth.\", \"title\": \"Dhaaga Sneha Ka\", \"prompt\": \"(Verse 1)\\nYaad hai mujhko, bachpan waale din\\nLadna jhagadna, tumse saara din\\nChhoti si choton pe, tera woh darr jaana\\nPhir chocolate deke, mujhko manaana\\nWaqt ne dekho, kaisa mod liya hai\\nPar woh rishta, dil ne jod liya hai\\n\\n(Chorus)\\nYeh rakhi ka dhaaga, sirf dhaaga nahi\\nHai ismein duayein, aur yeh vaada sahi\\nMeri har khushi mein, teri muskaan ho\\nHamesha mehfooz, tu meri jaan ho\\nYeh रेशम ki dori, hai bandhan pyaar ka\\nMere bhai, tu hissa, mere sansaar ka\\n\\n(Verse 2)\\nDoor bhi ho toh, feel hota hai paas tu\\nMere liye sabse, sabse zyaada khaas tu\\nMy secret keeper, my forever friend\\nA bond like ours, will never ever end\\nTere hone se hi, himmat milti hai\\nAndheri raahon mein, roshni jalti hai\\n\\n(Chorus)\\nYeh rakhi ka dhaaga, sirf dhaaga nahi\\nHai ismein duayein, aur yeh vaada sahi\\nMeri har khushi mein, teri muskaan ho\\nHamesha mehfooz, tu meri jaan ho\\nYeh रेशम ki dori, hai bandhan pyaar ka\\nMere bhai, tu hissa, mere sansaar ka\\n\\n(Bridge)\\nKalaayi pe baandhoon yeh Sneha ka dhaaga\\nIsse zyaada main, aur kya maangoon Rab se?\\nRahe salaamat tu, bas yahi hai dua\\nDil se karti hoon main, Naman tujhe kab se\\nYeh rishta hai anmol...\\n\\n(Outro)\\nHmmm... Naman...\\nForever... Hmmm...\\nYeh bandhan pyaar ka...\\nAlways stay blessed, mere bhai... always...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NGNkZTBlZTItZDhiOS00YmEyLTgzMmEtYWJiNWFhMzY2ODM2.mp3\", \"duration\": 251.44, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NGNkZTBlZTItZDhiOS00YmEyLTgzMmEtYWJiNWFhMzY2ODM2.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1754753596174, \"sourceAudioUrl\": \"https://cdn1.suno.ai/4cde0ee2-d8b9-4ba2-832a-abb5aa366836.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_4cde0ee2-d8b9-4ba2-832a-abb5aa366836.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NGNkZTBlZTItZDhiOS00YmEyLTgzMmEtYWJiNWFhMzY2ODM2\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/4cde0ee2-d8b9-4ba2-832a-abb5aa366836.mp3\"}, {\"id\": \"f7f2a47b-01b7-40a1-a9f1-418987165ced\", \"tags\": \"Acoustic Soul / Indie Folk.\\n\\nThe song is built around the warm, intricate fingerpicking of an acoustic guitar, creating an intimate and heartfelt atmosphere. A soft piano melody floats in the background, adding layers of emotion, while a gentle cello line underscores the chorus and bridge for added depth. The rhythm is maintained by a subtle, soft beat from a cajon or light tabla, keeping it soulful without overpowering the vocals.\\n\\nVoice: A soft, emotive female voice with a clear, breathy texture would be perfect. The delivery should feel like a personal, sincere message, almost like a sung letter. Think of voices like who excel at conveying vulnerability and warmth.\", \"title\": \"Dhaaga Sneha Ka\", \"prompt\": \"(Verse 1)\\nYaad hai mujhko, bachpan waale din\\nLadna jhagadna, tumse saara din\\nChhoti si choton pe, tera woh darr jaana\\nPhir chocolate deke, mujhko manaana\\nWaqt ne dekho, kaisa mod liya hai\\nPar woh rishta, dil ne jod liya hai\\n\\n(Chorus)\\nYeh rakhi ka dhaaga, sirf dhaaga nahi\\nHai ismein duayein, aur yeh vaada sahi\\nMeri har khushi mein, teri muskaan ho\\nHamesha mehfooz, tu meri jaan ho\\nYeh रेशम ki dori, hai bandhan pyaar ka\\nMere bhai, tu hissa, mere sansaar ka\\n\\n(Verse 2)\\nDoor bhi ho toh, feel hota hai paas tu\\nMere liye sabse, sabse zyaada khaas tu\\nMy secret keeper, my forever friend\\nA bond like ours, will never ever end\\nTere hone se hi, himmat milti hai\\nAndheri raahon mein, roshni jalti hai\\n\\n(Chorus)\\nYeh rakhi ka dhaaga, sirf dhaaga nahi\\nHai ismein duayein, aur yeh vaada sahi\\nMeri har khushi mein, teri muskaan ho\\nHamesha mehfooz, tu meri jaan ho\\nYeh रेशम ki dori, hai bandhan pyaar ka\\nMere bhai, tu hissa, mere sansaar ka\\n\\n(Bridge)\\nKalaayi pe baandhoon yeh Sneha ka dhaaga\\nIsse zyaada main, aur kya maangoon Rab se?\\nRahe salaamat tu, bas yahi hai dua\\nDil se karti hoon main, Naman tujhe kab se\\nYeh rishta hai anmol...\\n\\n(Outro)\\nHmmm... Naman...\\nForever... Hmmm...\\nYeh bandhan pyaar ka...\\nAlways stay blessed, mere bhai... always...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/ZjdmMmE0N2ItMDFiNy00MGExLWE5ZjEtNDE4OTg3MTY1Y2Vk.mp3\", \"duration\": 250.24, \"imageUrl\": \"https://apiboxfiles.erweima.ai/ZjdmMmE0N2ItMDFiNy00MGExLWE5ZjEtNDE4OTg3MTY1Y2Vk.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1754753596174, \"sourceAudioUrl\": \"https://cdn1.suno.ai/f7f2a47b-01b7-40a1-a9f1-418987165ced.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_f7f2a47b-01b7-40a1-a9f1-418987165ced.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/ZjdmMmE0N2ItMDFiNy00MGExLWE5ZjEtNDE4OTg3MTY1Y2Vk\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/f7f2a47b-01b7-40a1-a9f1-418987165ced.mp3\"}]"'::jsonb,
        '{"1": [{"endS": 12.71809, "word": "(Verse 1)\n", "palign": 0, "startS": 10.29255, "success": true}, {"endS": 13.08511, "word": "Yaad ", "palign": 0, "startS": 12.78191, "success": true}, {"endS": 13.32447, "word": "hai ", "palign": 0, "startS": 13.16489, "success": true}, {"endS": 15.47872, "word": "mujhko, ", "palign": 0, "startS": 13.37766, "success": true}, {"endS": 16.19681, "word": "bachpan ", "palign": 0, "startS": 15.55851, "success": true}, {"endS": 16.67553, "word": "waale ", "palign": 0, "startS": 16.31649, "success": true}, {"endS": 18.27128, "word": "din\n", "palign": 0, "startS": 16.83511, "success": true}, {"endS": 18.98936, "word": "Ladna ", "palign": 0, "startS": 18.39096, "success": true}, {"endS": 21.19681, "word": "jhagadna, ", "palign": 0, "startS": 19.14894, "success": true}, {"endS": 21.94149, "word": "tumse ", "palign": 0, "startS": 21.25, "success": true}, {"endS": 22.5, "word": "saara ", "palign": 0, "startS": 22.06117, "success": true}, {"endS": 22.97872, "word": "din\n", "palign": 0, "startS": 22.65957, "success": true}, {"endS": 23.69681, "word": "Chhoti ", "palign": 0, "startS": 23.0984, "success": true}, {"endS": 24.09574, "word": "si ", "palign": 0, "startS": 23.81649, "success": true}, {"endS": 25.21277, "word": "choton ", "palign": 0, "startS": 24.21543, "success": true}, {"endS": 26.07048, "word": "pe, ", "palign": 0, "startS": 25.33245, "success": true}, {"endS": 26.64894, "word": "tera ", "palign": 0, "startS": 26.13032, "success": true}, {"endS": 26.96809, "word": "woh ", "palign": 0, "startS": 26.75532, "success": true}, {"endS": 27.76596, "word": "darr ", "palign": 0, "startS": 27.04787, "success": true}, {"endS": 29.44149, "word": "jaana\n", "palign": 0, "startS": 27.88564, "success": true}, {"endS": 29.92021, "word": "Phir ", "palign": 0, "startS": 29.56117, "success": true}, {"endS": 31.19681, "word": "chocolate ", "palign": 0, "startS": 30, "success": true}, {"endS": 32.77261, "word": "deke, ", "palign": 0, "startS": 31.31649, "success": true}, {"endS": 33.43085, "word": "mujhko ", "palign": 0, "startS": 32.83245, "success": true}, {"endS": 34.22872, "word": "manaana\n", "palign": 0, "startS": 33.49069, "success": true}, {"endS": 37.97872, "word": "Waqt ", "palign": 0, "startS": 34.3883, "success": true}, {"endS": 38.61702, "word": "ne ", "palign": 0, "startS": 38.0984, "success": true}, {"endS": 39.52128, "word": "dekho, ", "palign": 0, "startS": 38.67021, "success": true}, {"endS": 40.45213, "word": "kaisa ", "palign": 0, "startS": 39.62766, "success": true}, {"endS": 41.09043, "word": "mod ", "palign": 0, "startS": 40.57181, "success": true}, {"endS": 41.64894, "word": "liya ", "palign": 0, "startS": 41.21011, "success": true}, {"endS": 43.24468, "word": "hai\n", "palign": 0, "startS": 41.75532, "success": true}, {"endS": 43.80319, "word": "Par ", "palign": 0, "startS": 43.40426, "success": true}, {"endS": 44.3617, "word": "woh ", "palign": 0, "startS": 43.90957, "success": true}, {"endS": 45.31915, "word": "rishta, ", "palign": 0, "startS": 44.41489, "success": true}, {"endS": 45.6383, "word": "dil ", "palign": 0, "startS": 45.39894, "success": true}, {"endS": 46.19681, "word": "ne ", "palign": 0, "startS": 45.75798, "success": true}, {"endS": 46.91489, "word": "jod ", "palign": 0, "startS": 46.35638, "success": true}, {"endS": 47.55319, "word": "liya ", "palign": 0, "startS": 47.03457, "success": true}, {"endS": 51.32314, "word": "hai\n\n(", "palign": 0, "startS": 47.65957, "success": true}, {"endS": 51.44282, "word": "Chorus)\n", "palign": 0, "startS": 51.33311, "success": true}, {"endS": 51.62234, "word": "Yeh ", "palign": 0, "startS": 51.50266, "success": true}, {"endS": 52.34043, "word": "rakhi ", "palign": 0, "startS": 51.70213, "success": true}, {"endS": 52.65957, "word": "ka ", "palign": 0, "startS": 52.46011, "success": true}, {"endS": 54.13564, "word": "dhaaga, ", "palign": 0, "startS": 52.76596, "success": true}, {"endS": 54.375, "word": "sirf ", "palign": 0, "startS": 54.17553, "success": true}, {"endS": 55.69149, "word": "dhaaga ", "palign": 0, "startS": 54.49468, "success": true}, {"endS": 56.96809, "word": "nahi\n", "palign": 0, "startS": 55.77128, "success": true}, {"endS": 57.36702, "word": "Hai ", "palign": 0, "startS": 57.07447, "success": true}, {"endS": 58.08511, "word": "ismein ", "palign": 0, "startS": 57.5266, "success": true}, {"endS": 59.92021, "word": "duayein, ", "palign": 0, "startS": 58.20479, "success": true}, {"endS": 60.23936, "word": "aur ", "palign": 0, "startS": 60, "success": true}, {"endS": 60.55851, "word": "yeh ", "palign": 0, "startS": 60.23936, "success": true}, {"endS": 61.43617, "word": "vaada ", "palign": 0, "startS": 60.67819, "success": true}, {"endS": 62.79255, "word": "sahi\n", "palign": 0, "startS": 61.51596, "success": true}, {"endS": 63.43085, "word": "Meri ", "palign": 0, "startS": 62.89894, "success": true}, {"endS": 63.75, "word": "har ", "palign": 0, "startS": 63.59043, "success": true}, {"endS": 64.54787, "word": "khushi ", "palign": 0, "startS": 63.82979, "success": true}, {"endS": 65.78457, "word": "mein, ", "palign": 0, "startS": 64.64761, "success": true}, {"endS": 66.38298, "word": "teri ", "palign": 0, "startS": 65.82447, "success": true}, {"endS": 67.34043, "word": "muskaan ", "palign": 0, "startS": 66.46277, "success": true}, {"endS": 67.73936, "word": "ho\n", "palign": 0, "startS": 67.46011, "success": true}, {"endS": 69.57447, "word": "Hamesha ", "palign": 0, "startS": 67.85904, "success": true}, {"endS": 71.51596, "word": "mehfooz, ", "palign": 0, "startS": 69.69415, "success": true}, {"endS": 71.8883, "word": "tu ", "palign": 0, "startS": 71.62234, "success": true}, {"endS": 72.5266, "word": "meri ", "palign": 0, "startS": 71.99468, "success": true}, {"endS": 73.32447, "word": "jaan ", "palign": 0, "startS": 72.64628, "success": true}, {"endS": 74.3617, "word": "ho\n", "palign": 0, "startS": 73.44415, "success": true}, {"endS": 74.68085, "word": "Yeh ", "palign": 0, "startS": 74.46809, "success": true}, {"endS": 75.07979, "word": "रे", "palign": 0, "startS": 74.84043, "success": true}, {"endS": 75.79787, "word": "शम ", "palign": 0, "startS": 75.23936, "success": true}, {"endS": 76.19681, "word": "ki ", "palign": 0, "startS": 75.91755, "success": true}, {"endS": 77.45346, "word": "dori, ", "palign": 0, "startS": 76.35638, "success": true}, {"endS": 77.63298, "word": "hai ", "palign": 0, "startS": 77.5133, "success": true}, {"endS": 78.35106, "word": "bandhan ", "palign": 0, "startS": 77.71277, "success": true}, {"endS": 79.06915, "word": "pyaar ", "palign": 0, "startS": 78.51064, "success": true}, {"endS": 80.10638, "word": "ka\n", "palign": 0, "startS": 79.18883, "success": true}, {"endS": 80.50532, "word": "Mere ", "palign": 0, "startS": 80.26596, "success": true}, {"endS": 81.64894, "word": "bhai, ", "palign": 0, "startS": 80.66489, "success": true}, {"endS": 81.94149, "word": "tu ", "palign": 0, "startS": 81.75532, "success": true}, {"endS": 83.33777, "word": "hissa, ", "palign": 0, "startS": 82.10106, "success": true}, {"endS": 83.7766, "word": "mere ", "palign": 0, "startS": 83.45745, "success": true}, {"endS": 84.9734, "word": "sansaar ", "palign": 0, "startS": 83.88298, "success": true}, {"endS": 110.91565, "word": "ka\n\n(", "palign": 0, "startS": 85.09309, "success": true}, {"endS": 111.2462, "word": "Verse 2)\n", "palign": 0, "startS": 110.96125, "success": true}, {"endS": 111.38298, "word": "Door ", "palign": 0, "startS": 111.2804, "success": true}, {"endS": 111.62234, "word": "bhi ", "palign": 0, "startS": 111.46277, "success": true}, {"endS": 111.94149, "word": "ho ", "palign": 0, "startS": 111.74202, "success": true}, {"endS": 112.91489, "word": "toh, ", "palign": 0, "startS": 111.98138, "success": true}, {"endS": 113.37766, "word": "feel ", "palign": 0, "startS": 113.01064, "success": true}, {"endS": 114.01596, "word": "hota ", "palign": 0, "startS": 113.48404, "success": true}, {"endS": 114.33511, "word": "hai ", "palign": 0, "startS": 114.12234, "success": true}, {"endS": 115.21277, "word": "paas ", "palign": 0, "startS": 114.45479, "success": true}, {"endS": 116.32979, "word": "tu\n", "palign": 0, "startS": 115.33245, "success": true}, {"endS": 116.96809, "word": "Mere ", "palign": 0, "startS": 116.48936, "success": true}, {"endS": 117.36702, "word": "liye ", "palign": 0, "startS": 117.04787, "success": true}, {"endS": 118.69681, "word": "sabse, ", "palign": 0, "startS": 117.44681, "success": true}, {"endS": 119.52128, "word": "sabse ", "palign": 0, "startS": 118.75, "success": true}, {"endS": 120.15957, "word": "zyaada ", "palign": 0, "startS": 119.60106, "success": true}, {"endS": 120.95745, "word": "khaas ", "palign": 0, "startS": 120.26596, "success": true}, {"endS": 122.79255, "word": "tu\n", "palign": 0, "startS": 121.07713, "success": true}, {"endS": 123.1117, "word": "My ", "palign": 0, "startS": 122.91223, "success": true}, {"endS": 123.82979, "word": "secret ", "palign": 0, "startS": 123.20479, "success": true}, {"endS": 124.89362, "word": "keeper, ", "palign": 0, "startS": 123.90957, "success": true}, {"endS": 125.58511, "word": "my ", "palign": 0, "startS": 125, "success": true}, {"endS": 126.62234, "word": "forever ", "palign": 0, "startS": 125.67629, "success": true}, {"endS": 128.61702, "word": "friend\n", "palign": 0, "startS": 126.71543, "success": true}, {"endS": 128.7766, "word": "A ", "palign": 0, "startS": 128.7766, "success": true}, {"endS": 129.25532, "word": "bond ", "palign": 0, "startS": 128.87633, "success": true}, {"endS": 130.45213, "word": "like ", "palign": 0, "startS": 129.35505, "success": true}, {"endS": 130.85106, "word": "ours, ", "palign": 0, "startS": 130.53191, "success": true}, {"endS": 131.17021, "word": "will ", "palign": 0, "startS": 130.93085, "success": true}, {"endS": 131.56915, "word": "never ", "palign": 0, "startS": 131.25, "success": true}, {"endS": 132.5266, "word": "ever ", "palign": 0, "startS": 131.66888, "success": true}, {"endS": 134.3617, "word": "end\n", "palign": 0, "startS": 132.63298, "success": true}, {"endS": 135.07979, "word": "Tere ", "palign": 0, "startS": 134.52128, "success": true}, {"endS": 136.19681, "word": "hone ", "palign": 0, "startS": 135....'::jsonb,
        '{"0":[{"end":22979,"text":"Yaad hai mujhko, bachpan waale din Ladna jhagadna, tumse saara din","index":1,"start":12582},{"end":33431,"text":"Chhoti si choton pe, tera woh darr jaana Phir chocolate deke, mujhko","index":2,"start":22898},{"end":46197,"text":"manaana Waqt ne dekho, kaisa mod liya hai Par woh rishta, dil ne","index":3,"start":33291},{"end":57367,"text":"jod liya hai (Chorus) Yeh rakhi ka dhaaga, sirf dhaaga nahi Hai","index":4,"start":46156},{"end":66383,"text":"ismein duayein, aur yeh vaada sahi Meri har khushi mein, teri","index":5,"start":57327},{"end":77633,"text":"muskaan ho Hamesha mehfooz, tu meri jaan ho Yeh रे शम ki dori, hai","index":6,"start":66263},{"end":111246,"text":"bandhan pyaar ka Mere bhai, tu hissa, mere sansaar ka (Verse 2)","index":7,"start":77513},{"end":119521,"text":"Door bhi ho toh, feel hota hai paas tu Mere liye sabse, sabse","index":8,"start":111080},{"end":130851,"text":"zyaada khaas tu My secret keeper, my forever friend bond like ours,","index":9,"start":119401},{"end":141223,"text":"will never ever end Tere hone se hi, himmat milti hai Andheri","index":10,"start":130731},{"end":151277,"text":"raahon mein, roshni jalti hai (Chorus) Yeh rakhi ka dhaaga, sirf","index":11,"start":141103},{"end":161489,"text":"dhaaga nahi Hai ismein duayein, aur yeh vaada sahi Meri har khushi","index":12,"start":151156},{"end":173059,"text":"mein, teri muskaan ho Hamesha mehfooz, tu meri jaan ho Yeh रे शम ki","index":13,"start":161389},{"end":183710,"text":"dori, hai bandhan pyaar ka Mere bhai, tu hissa, mere sansaar ka (","index":14,"start":173018},{"end":191543,"text":"Bridge) Kalaayi pe baandhoon yeh Sneha ka dhaaga Isse zyaada main,","index":15,"start":183530},{"end":195319,"text":"aur kya maangoon Rab se?","index":16,"start":191396},{"end":203936,"text":"Rahe salaamat tu, bas yahi hai dua Dil se karti hoon main, Naman","index":17,"start":195199},{"end":211316,"text":"tujhe kab se Yeh rishta hai anmol... (","index":18,"start":203816},{"end":221519,"text":"Outro) Hmmm...","index":19,"start":211204},{"end":227577,"text":"Naman...","index":20,"start":221409},{"end":230625,"text":"Forever...","index":21,"start":227465},{"end":234335,"text":"Hmmm...","index":22,"start":230438},{"end":237553,"text":"Yeh bandhan pyaar ka...","index":23,"start":234188},{"end":240895,"text":"Always stay blessed, mere bhai...","index":24,"start":237389},{"end":241835,"text":"always...","index":25,"start":240780}]}'::jsonb,
        '{"original_id":20,"original_sequence":17,"duration":"250.24","song_url":"https://apiboxfiles.erweima.ai/ZjdmMmE0N2ItMDFiNy00MGExLWE5ZjEtNDE4OTg3MTY1Y2Vk.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"f1b68a11b68468d163ea25449ed28de8"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Rakshabandhan'],
        ARRAY[]::text[],
        true,
        false,
        1,
        '2025-08-09 14:45:07.505469+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Resham Ki Dor'
    LIMIT 1;

    -- Song entry for: Starlight Lullaby
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
        'starlight-lullaby',
        'COMPLETED',
        true,
        '"[{\"id\": \"8493894e-adc4-4587-9f4a-330132bfdf3b\", \"tags\": \"A very soft and gentle acoustic lullaby. The music would be led by a simple, finger-picked acoustic guitar or a soft piano melody. The tempo should be slow and calming, like a heartbeat. Minimal background instrumentation, perhaps a light pad of strings to add warmth.\\r\\nThe vocals should be soft, breathy, and sung in a gentle, almost whispered tone. A tender, high-tenor male voice or a soft, airy female voice would be perfect to convey the intimacy and love of the moment.\", \"title\": \"Starlight Lullaby\", \"prompt\": \"(Verse 1)\\r\\nTen little fingers, a soft, sleepy sigh,\\r\\nA brand new star in a midnight sky.\\r\\nThe world outside just fades away,\\r\\nAs I watch you dream at the close of day.\\r\\n\\r\\n(Chorus)\\r\\nOh, welcome to the world, my sweet, precious one,\\r\\nMy moon, my stars, my rising sun.\\r\\nIn my arms, you''re safe and sound,\\r\\nThe greatest love I''ve ever found.\\r\\n\\r\\n(Outro)\\r\\nSleep now, my love... sleep now...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/ODQ5Mzg5NGUtYWRjNC00NTg3LTlmNGEtMzMwMTMyYmZkZjNi.mp3\", \"duration\": 154.08, \"imageUrl\": \"https://apiboxfiles.erweima.ai/ODQ5Mzg5NGUtYWRjNC00NTg3LTlmNGEtMzMwMTMyYmZkZjNi.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1754760177122, \"sourceAudioUrl\": \"https://cdn1.suno.ai/8493894e-adc4-4587-9f4a-330132bfdf3b.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_8493894e-adc4-4587-9f4a-330132bfdf3b.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/ODQ5Mzg5NGUtYWRjNC00NTg3LTlmNGEtMzMwMTMyYmZkZjNi\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/8493894e-adc4-4587-9f4a-330132bfdf3b.mp3\"}, {\"id\": \"5fae57be-b82b-4e69-9160-6777e7befa00\", \"tags\": \"A very soft and gentle acoustic lullaby. The music would be led by a simple, finger-picked acoustic guitar or a soft piano melody. The tempo should be slow and calming, like a heartbeat. Minimal background instrumentation, perhaps a light pad of strings to add warmth.\\r\\nThe vocals should be soft, breathy, and sung in a gentle, almost whispered tone. A tender, high-tenor male voice or a soft, airy female voice would be perfect to convey the intimacy and love of the moment.\", \"title\": \"Starlight Lullaby\", \"prompt\": \"(Verse 1)\\r\\nTen little fingers, a soft, sleepy sigh,\\r\\nA brand new star in a midnight sky.\\r\\nThe world outside just fades away,\\r\\nAs I watch you dream at the close of day.\\r\\n\\r\\n(Chorus)\\r\\nOh, welcome to the world, my sweet, precious one,\\r\\nMy moon, my stars, my rising sun.\\r\\nIn my arms, you''re safe and sound,\\r\\nThe greatest love I''ve ever found.\\r\\n\\r\\n(Outro)\\r\\nSleep now, my love... sleep now...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NWZhZTU3YmUtYjgyYi00ZTY5LTkxNjAtNjc3N2U3YmVmYTAw.mp3\", \"duration\": 104.96, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NWZhZTU3YmUtYjgyYi00ZTY5LTkxNjAtNjc3N2U3YmVmYTAw.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1754760177122, \"sourceAudioUrl\": \"https://cdn1.suno.ai/5fae57be-b82b-4e69-9160-6777e7befa00.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_5fae57be-b82b-4e69-9160-6777e7befa00.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NWZhZTU3YmUtYjgyYi00ZTY5LTkxNjAtNjc3N2U3YmVmYTAw\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/5fae57be-b82b-4e69-9160-6777e7befa00.mp3\"}]"'::jsonb,
        '{"0": [{"endS": 11.72872, "word": "(Verse 1)\n\n", "palign": 0, "startS": 1.2766, "success": true}, {"endS": 11.96809, "word": "Ten ", "palign": 0, "startS": 11.80851, "success": true}, {"endS": 12.60638, "word": "little ", "palign": 0, "startS": 12.06117, "success": true}, {"endS": 17.27394, "word": "fingers, ", "palign": 0, "startS": 12.69757, "success": true}, {"endS": 17.4734, "word": "a ", "palign": 0, "startS": 17.39362, "success": true}, {"endS": 18.32447, "word": "soft, ", "palign": 0, "startS": 17.57314, "success": true}, {"endS": 18.98936, "word": "sleepy ", "palign": 0, "startS": 18.37766, "success": true}, {"endS": 23.90957, "word": "sigh,\n\n", "palign": 0, "startS": 19.06915, "success": true}, {"endS": 24.01596, "word": "A ", "palign": 0, "startS": 24.01596, "success": true}, {"endS": 24.89362, "word": "brand ", "palign": 0, "startS": 24.1117, "success": true}, {"endS": 25.53191, "word": "new ", "palign": 0, "startS": 25, "success": true}, {"endS": 27.76596, "word": "star ", "palign": 0, "startS": 25.63165, "success": true}, {"endS": 28.08511, "word": "in ", "palign": 0, "startS": 27.88564, "success": true}, {"endS": 28.48404, "word": "a ", "palign": 0, "startS": 28.24468, "success": true}, {"endS": 31.43617, "word": "midnight ", "palign": 0, "startS": 28.5738, "success": true}, {"endS": 36.59043, "word": "sky.\n\n", "palign": 0, "startS": 31.54255, "success": true}, {"endS": 36.78191, "word": "The ", "palign": 0, "startS": 36.65426, "success": true}, {"endS": 38.05851, "word": "world ", "palign": 0, "startS": 36.87766, "success": true}, {"endS": 42.5266, "word": "outside ", "palign": 0, "startS": 38.1497, "success": true}, {"endS": 43.40426, "word": "just ", "palign": 0, "startS": 42.62633, "success": true}, {"endS": 44.44149, "word": "fades ", "palign": 0, "startS": 43.5, "success": true}, {"endS": 49.22872, "word": "away,\n\n", "palign": 0, "startS": 44.54122, "success": true}, {"endS": 49.3883, "word": "As ", "palign": 0, "startS": 49.30851, "success": true}, {"endS": 49.78723, "word": "I ", "palign": 0, "startS": 49.54787, "success": true}, {"endS": 50.26596, "word": "watch ", "palign": 0, "startS": 49.88298, "success": true}, {"endS": 50.82447, "word": "you ", "palign": 0, "startS": 50.37234, "success": true}, {"endS": 53.29787, "word": "dream ", "palign": 0, "startS": 50.92021, "success": true}, {"endS": 53.93617, "word": "at ", "palign": 0, "startS": 53.41755, "success": true}, {"endS": 54.25532, "word": "the ", "palign": 0, "startS": 54.04255, "success": true}, {"endS": 56.48936, "word": "close ", "palign": 0, "startS": 54.35106, "success": true}, {"endS": 57.20745, "word": "of ", "palign": 0, "startS": 56.60904, "success": true}, {"endS": 64.17553, "word": "day.\n\n(", "palign": 0, "startS": 57.31383, "success": true}, {"endS": 64.26862, "word": "Chorus)\n\n", "palign": 0, "startS": 64.1844, "success": true}, {"endS": 64.39827, "word": "Oh, ", "palign": 0, "startS": 64.28856, "success": true}, {"endS": 65.42553, "word": "welcome ", "palign": 0, "startS": 64.48803, "success": true}, {"endS": 66.62234, "word": "to ", "palign": 0, "startS": 65.54521, "success": true}, {"endS": 67.02128, "word": "the ", "palign": 0, "startS": 66.72872, "success": true}, {"endS": 68.32447, "word": "world, ", "palign": 0, "startS": 67.11702, "success": true}, {"endS": 68.69681, "word": "my ", "palign": 0, "startS": 68.43085, "success": true}, {"endS": 69.42376, "word": "sweet, ", "palign": 0, "startS": 68.79255, "success": true}, {"endS": 70.13298, "word": "precious ", "palign": 0, "startS": 69.51241, "success": true}, {"endS": 71.60904, "word": "one,\n\n", "palign": 0, "startS": 70.23936, "success": true}, {"endS": 71.80851, "word": "My ", "palign": 0, "startS": 71.70878, "success": true}, {"endS": 73.03191, "word": "moon, ", "palign": 0, "startS": 71.90824, "success": true}, {"endS": 73.40426, "word": "my ", "palign": 0, "startS": 73.1383, "success": true}, {"endS": 74.70745, "word": "stars, ", "palign": 0, "startS": 73.5, "success": true}, {"endS": 75.31915, "word": "my ", "palign": 0, "startS": 74.81383, "success": true}, {"endS": 76.51596, "word": "rising ", "palign": 0, "startS": 75.41223, "success": true}, {"endS": 77.99202, "word": "sun.\n\n", "palign": 0, "startS": 76.62234, "success": true}, {"endS": 78.59043, "word": "In ", "palign": 0, "startS": 78.09176, "success": true}, {"endS": 79.30851, "word": "my ", "palign": 0, "startS": 78.71011, "success": true}, {"endS": 81.24335, "word": "arms, ", "palign": 0, "startS": 79.40824, "success": true}, {"endS": 81.78191, "word": "you''re ", "palign": 0, "startS": 81.2633, "success": true}, {"endS": 82.42021, "word": "safe ", "palign": 0, "startS": 81.88165, "success": true}, {"endS": 82.89894, "word": "and ", "palign": 0, "startS": 82.5266, "success": true}, {"endS": 84.59043, "word": "sound,\n\n", "palign": 0, "startS": 82.99468, "success": true}, {"endS": 84.73404, "word": "The ", "palign": 0, "startS": 84.6383, "success": true}, {"endS": 85.93085, "word": "greatest ", "palign": 0, "startS": 84.8238, "success": true}, {"endS": 87.20745, "word": "love ", "palign": 0, "startS": 86.03059, "success": true}, {"endS": 88.00532, "word": "I''ve ", "palign": 0, "startS": 87.36702, "success": true}, {"endS": 88.64362, "word": "ever ", "palign": 0, "startS": 88.10505, "success": true}, {"endS": 94.09907, "word": "found.\n\n(", "palign": 0, "startS": 88.73936, "success": true}, {"endS": 95.44833, "word": "Outro)\n\n", "palign": 0, "startS": 94.18883, "success": true}, {"endS": 96.46277, "word": "Sleep ", "palign": 0, "startS": 95.53951, "success": true}, {"endS": 97.68617, "word": "now, ", "palign": 0, "startS": 96.56915, "success": true}, {"endS": 99.57447, "word": "my ", "palign": 0, "startS": 97.79255, "success": true}, {"endS": 102.23737, "word": "love... ", "palign": 0, "startS": 99.6742, "success": true}, {"endS": 103.56383, "word": "sleep ", "palign": 0, "startS": 102.32713, "success": true}, {"endS": 104.28191, "word": "now...\n\n", "palign": 0, "startS": 103.65359, "success": true}]}'::jsonb,
        '{"0":[{"end":28484,"text":"Ten little fingers, a soft, sleepy sigh, brand new star in a","index":1,"start":11609},{"end":36590,"text":"midnight sky.","index":2,"start":28374},{"end":54255,"text":"The world outside just fades away, As I watch you dream at the","index":3,"start":36454},{"end":64176,"text":"close of day. (","index":4,"start":54151},{"end":73032,"text":"Chorus) Oh, welcome to the world, my sweet, precious one, My moon,","index":5,"start":63984},{"end":77992,"text":"my stars, my rising sun.","index":6,"start":72938},{"end":88644,"text":"In my arms, you''re safe and sound, The greatest love I''ve ever","index":7,"start":77892},{"end":94099,"text":"found. (","index":8,"start":88539},{"end":102237,"text":"Outro) Sleep now, my love...","index":9,"start":93989},{"end":104282,"text":"sleep now...","index":10,"start":102127}]}'::jsonb,
        '{"original_id":21,"original_sequence":18,"duration":"154.08","song_url":"https://apiboxfiles.erweima.ai/ODQ5Mzg5NGUtYWRjNC00NTg3LTlmNGEtMzMwMTMyYmZkZjNi.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"7978ee8e970d11c33398b5f951c0385d"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Lullaby'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2025-08-09 17:15:42.127556+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Starlight Lullaby'
    LIMIT 1;

    -- Song entry for: Meri Jannat
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
        'meri-jannat',
        'COMPLETED',
        true,
        '"[{\"id\": \"75b6aa3d-b4b9-434a-958f-bc3aa31f62f6\", \"tags\": \"Soulful Acoustic Ballad\\r\\nA gentle and melodic composition led by an acoustic guitar and piano. The rhythm is carried by a soft tabla or cajon beat that enters after the first verse. A string section (violins, cello) swells during the chorus to add emotional depth and warmth. The overall feel is intimate, reflective, and deeply emotional.\\r\\n\\r\\nRecommended Voice: A soft, warm, and emotive female voice. The delivery should feel like a heartfelt whisper, full of love and tenderness, especially in the verses, building to a more expressive and soaring vocal in the chorus.\", \"title\": \"Meri Jannat\", \"prompt\": \"(Verse 1)\\r\\nAankhon mein leke sapne, jab tu ghar mere aayi thi\\r\\nMeri sookhi si duniya mein, tu banke ghata chhaayi thi\\r\\nTeri nanhi si hasi mein, din mera nikal jaata\\r\\nTujhe dekh ke hi mera, har ek gham pighal jaata\\r\\n\\r\\n(Chorus)\\r\\nTu hi meri zameen, aur tu hi mera aasmaan\\r\\nTujh mein hi toh basta hai, mera saara jahaan\\r\\nMeri rooh ka sukoon, aur har duaa ka hai anjaam\\r\\nTu hi meri jannat hai, bas yahi hai mera imaan\\r\\n\\r\\n(Verse 2)\\r\\nDuniya ke liye hoon Babita, par tere liye bas ''Maa'' meri\\r\\nAb toh tere hi chehre mein, dikhti hai shakal meri\\r\\nTeri khushiyon ki khaatir, main har hadd se guzar jaaun\\r\\nTujhe chot lage toh, main khud hi bikhar jaaun\\r\\n\\r\\n(Chorus)\\r\\nTu hi meri zameen, aur tu hi mera aasmaan\\r\\nTujh mein hi toh basta hai, mera saara jahaan\\r\\nMeri rooh ka sukoon, aur har duaa ka hai anjaam\\r\\nTu hi meri jannat hai, bas yahi hai mera imaan\\r\\n\\r\\n(Bridge)\\r\\nYeh waqt ki nadiya behti rahe, tu khushiyon mein rehti rahe\\r\\nMeri Bittoo, meri jaan hai tu, mera sachcha pyaar hai\\r\\nMera sachcha pyaar hai...\\r\\n\\r\\n(Outro)\\r\\nMeri jannat...\\r\\nMeri dua...\\r\\nBas tu... hamesha tu...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NzViNmFhM2QtYjRiOS00MzRhLTk1OGYtYmMzYWEzMWY2MmY2.mp3\", \"duration\": 207.64, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NzViNmFhM2QtYjRiOS00MzRhLTk1OGYtYmMzYWEzMWY2MmY2.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1754826905903, \"sourceAudioUrl\": \"https://cdn1.suno.ai/75b6aa3d-b4b9-434a-958f-bc3aa31f62f6.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_75b6aa3d-b4b9-434a-958f-bc3aa31f62f6.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NzViNmFhM2QtYjRiOS00MzRhLTk1OGYtYmMzYWEzMWY2MmY2\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/75b6aa3d-b4b9-434a-958f-bc3aa31f62f6.mp3\"}, {\"id\": \"03e78c0d-bd5a-48fe-aa09-b43031d04b5c\", \"tags\": \"Soulful Acoustic Ballad\\r\\nA gentle and melodic composition led by an acoustic guitar and piano. The rhythm is carried by a soft tabla or cajon beat that enters after the first verse. A string section (violins, cello) swells during the chorus to add emotional depth and warmth. The overall feel is intimate, reflective, and deeply emotional.\\r\\n\\r\\nRecommended Voice: A soft, warm, and emotive female voice. The delivery should feel like a heartfelt whisper, full of love and tenderness, especially in the verses, building to a more expressive and soaring vocal in the chorus.\", \"title\": \"Meri Jannat\", \"prompt\": \"(Verse 1)\\r\\nAankhon mein leke sapne, jab tu ghar mere aayi thi\\r\\nMeri sookhi si duniya mein, tu banke ghata chhaayi thi\\r\\nTeri nanhi si hasi mein, din mera nikal jaata\\r\\nTujhe dekh ke hi mera, har ek gham pighal jaata\\r\\n\\r\\n(Chorus)\\r\\nTu hi meri zameen, aur tu hi mera aasmaan\\r\\nTujh mein hi toh basta hai, mera saara jahaan\\r\\nMeri rooh ka sukoon, aur har duaa ka hai anjaam\\r\\nTu hi meri jannat hai, bas yahi hai mera imaan\\r\\n\\r\\n(Verse 2)\\r\\nDuniya ke liye hoon Babita, par tere liye bas ''Maa'' meri\\r\\nAb toh tere hi chehre mein, dikhti hai shakal meri\\r\\nTeri khushiyon ki khaatir, main har hadd se guzar jaaun\\r\\nTujhe chot lage toh, main khud hi bikhar jaaun\\r\\n\\r\\n(Chorus)\\r\\nTu hi meri zameen, aur tu hi mera aasmaan\\r\\nTujh mein hi toh basta hai, mera saara jahaan\\r\\nMeri rooh ka sukoon, aur har duaa ka hai anjaam\\r\\nTu hi meri jannat hai, bas yahi hai mera imaan\\r\\n\\r\\n(Bridge)\\r\\nYeh waqt ki nadiya behti rahe, tu khushiyon mein rehti rahe\\r\\nMeri Bittoo, meri jaan hai tu, mera sachcha pyaar hai\\r\\nMera sachcha pyaar hai...\\r\\n\\r\\n(Outro)\\r\\nMeri jannat...\\r\\nMeri dua...\\r\\nBas tu... hamesha tu...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/MDNlNzhjMGQtYmQ1YS00OGZlLWFhMDktYjQzMDMxZDA0YjVj.mp3\", \"duration\": 229.2, \"imageUrl\": \"https://apiboxfiles.erweima.ai/MDNlNzhjMGQtYmQ1YS00OGZlLWFhMDktYjQzMDMxZDA0YjVj.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1754826905903, \"sourceAudioUrl\": \"https://cdn1.suno.ai/03e78c0d-bd5a-48fe-aa09-b43031d04b5c.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_03e78c0d-bd5a-48fe-aa09-b43031d04b5c.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/MDNlNzhjMGQtYmQ1YS00OGZlLWFhMDktYjQzMDMxZDA0YjVj\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/03e78c0d-bd5a-48fe-aa09-b43031d04b5c.mp3\"}]"'::jsonb,
        '{"0": [{"endS": 27.12766, "word": "(Verse 1)\n\n", "palign": 0, "startS": 26.8883, "success": true}, {"endS": 27.68617, "word": "Aankhon ", "palign": 0, "startS": 27.16755, "success": true}, {"endS": 27.76596, "word": "mein ", "palign": 0, "startS": 27.70612, "success": true}, {"endS": 28.16489, "word": "leke ", "palign": 0, "startS": 27.80585, "success": true}, {"endS": 29.17553, "word": "sapne, ", "palign": 0, "startS": 28.24468, "success": true}, {"endS": 29.44149, "word": "jab ", "palign": 0, "startS": 29.22872, "success": true}, {"endS": 29.76064, "word": "tu ", "palign": 0, "startS": 29.56117, "success": true}, {"endS": 30.23936, "word": "ghar ", "palign": 0, "startS": 29.92021, "success": true}, {"endS": 30.55851, "word": "mere ", "palign": 0, "startS": 30.31915, "success": true}, {"endS": 31.2766, "word": "aayi ", "palign": 0, "startS": 30.71809, "success": true}, {"endS": 32.53324, "word": "thi\n\n", "palign": 0, "startS": 31.35638, "success": true}, {"endS": 33.03191, "word": "Meri ", "palign": 0, "startS": 32.59309, "success": true}, {"endS": 33.75, "word": "sookhi ", "palign": 0, "startS": 33.1516, "success": true}, {"endS": 33.98936, "word": "si ", "palign": 0, "startS": 33.86968, "success": true}, {"endS": 35.0266, "word": "duniya ", "palign": 0, "startS": 34.06915, "success": true}, {"endS": 35.93085, "word": "mein, ", "palign": 0, "startS": 35.12633, "success": true}, {"endS": 36.2234, "word": "tu ", "palign": 0, "startS": 36.03723, "success": true}, {"endS": 37.26064, "word": "banke ", "palign": 0, "startS": 36.38298, "success": true}, {"endS": 37.97872, "word": "ghata ", "palign": 0, "startS": 37.36702, "success": true}, {"endS": 38.69681, "word": "chhaayi ", "palign": 0, "startS": 38.05851, "success": true}, {"endS": 39.59441, "word": "thi\n\n", "palign": 0, "startS": 38.7367, "success": true}, {"endS": 40.29255, "word": "Teri ", "palign": 0, "startS": 39.69415, "success": true}, {"endS": 40.93085, "word": "nanhi ", "palign": 0, "startS": 40.39894, "success": true}, {"endS": 41.17021, "word": "si ", "palign": 0, "startS": 41.05053, "success": true}, {"endS": 41.72872, "word": "hasi ", "palign": 0, "startS": 41.25, "success": true}, {"endS": 42.44681, "word": "mein, ", "palign": 0, "startS": 41.82846, "success": true}, {"endS": 42.84574, "word": "din ", "palign": 0, "startS": 42.5266, "success": true}, {"endS": 43.56383, "word": "mera ", "palign": 0, "startS": 43.00532, "success": true}, {"endS": 44.20213, "word": "nikal ", "palign": 0, "startS": 43.7234, "success": true}, {"endS": 45.6117, "word": "jaata\n\n", "palign": 0, "startS": 44.32181, "success": true}, {"endS": 46.03723, "word": "Tujhe ", "palign": 0, "startS": 45.66489, "success": true}, {"endS": 46.83511, "word": "dekh ", "palign": 0, "startS": 46.14362, "success": true}, {"endS": 47.31383, "word": "ke ", "palign": 0, "startS": 46.95479, "success": true}, {"endS": 47.63298, "word": "hi ", "palign": 0, "startS": 47.43351, "success": true}, {"endS": 48.90957, "word": "mera, ", "palign": 0, "startS": 47.79255, "success": true}, {"endS": 49.22872, "word": "har ", "palign": 0, "startS": 48.98936, "success": true}, {"endS": 49.70745, "word": "ek ", "palign": 0, "startS": 49.3484, "success": true}, {"endS": 50.0266, "word": "gham ", "palign": 0, "startS": 49.86702, "success": true}, {"endS": 50.74468, "word": "pighal ", "palign": 0, "startS": 50.14628, "success": true}, {"endS": 54.83378, "word": "jaata\n\n(", "palign": 0, "startS": 50.86436, "success": true}, {"endS": 55.0133, "word": "Chorus)\n\n", "palign": 0, "startS": 54.84375, "success": true}, {"endS": 55.13298, "word": "Tu ", "palign": 0, "startS": 55.07314, "success": true}, {"endS": 55.45213, "word": "hi ", "palign": 0, "startS": 55.25266, "success": true}, {"endS": 56.09043, "word": "meri ", "palign": 0, "startS": 55.55851, "success": true}, {"endS": 57.92553, "word": "zameen, ", "palign": 0, "startS": 56.25, "success": true}, {"endS": 58.24468, "word": "aur ", "palign": 0, "startS": 58.00532, "success": true}, {"endS": 58.48404, "word": "tu ", "palign": 0, "startS": 58.36436, "success": true}, {"endS": 58.7234, "word": "hi ", "palign": 0, "startS": 58.60372, "success": true}, {"endS": 59.20213, "word": "mera ", "palign": 0, "startS": 58.80319, "success": true}, {"endS": 61.96809, "word": "aasmaan\n\n", "palign": 0, "startS": 59.3617, "success": true}, {"endS": 62.39362, "word": "Tujh ", "palign": 0, "startS": 62.02128, "success": true}, {"endS": 62.79255, "word": "mein ", "palign": 0, "startS": 62.49335, "success": true}, {"endS": 63.1117, "word": "hi ", "palign": 0, "startS": 62.91223, "success": true}, {"endS": 63.43085, "word": "toh ", "palign": 0, "startS": 63.1516, "success": true}, {"endS": 63.98936, "word": "basta ", "palign": 0, "startS": 63.59043, "success": true}, {"endS": 65.10638, "word": "hai, ", "palign": 0, "startS": 64.09574, "success": true}, {"endS": 65.50532, "word": "mera ", "palign": 0, "startS": 65.18617, "success": true}, {"endS": 66.78191, "word": "saara ", "palign": 0, "startS": 65.66489, "success": true}, {"endS": 68.0984, "word": "jahaan\n\n", "palign": 0, "startS": 66.8883, "success": true}, {"endS": 68.45745, "word": "Meri ", "palign": 0, "startS": 68.1383, "success": true}, {"endS": 69.09574, "word": "rooh ", "palign": 0, "startS": 68.57713, "success": true}, {"endS": 69.41489, "word": "ka ", "palign": 0, "startS": 69.21543, "success": true}, {"endS": 71.07048, "word": "sukoon, ", "palign": 0, "startS": 69.53457, "success": true}, {"endS": 71.25, "word": "aur ", "palign": 0, "startS": 71.13032, "success": true}, {"endS": 71.56915, "word": "har ", "palign": 0, "startS": 71.40957, "success": true}, {"endS": 71.96809, "word": "duaa ", "palign": 0, "startS": 71.56915, "success": true}, {"endS": 72.12766, "word": "ka ", "palign": 0, "startS": 72.04787, "success": true}, {"endS": 72.5266, "word": "hai ", "palign": 0, "startS": 72.23404, "success": true}, {"endS": 75, "word": "anjaam\n\n", "palign": 0, "startS": 72.64628, "success": true}, {"endS": 75.15957, "word": "Tu ", "palign": 0, "startS": 75.07979, "success": true}, {"endS": 75.47872, "word": "hi ", "palign": 0, "startS": 75.27926, "success": true}, {"endS": 76.43617, "word": "meri ", "palign": 0, "startS": 75.58511, "success": true}, {"endS": 77.39362, "word": "jannat ", "palign": 0, "startS": 76.59574, "success": true}, {"endS": 78.1117, "word": "hai, ", "palign": 0, "startS": 77.5, "success": true}, {"endS": 78.43085, "word": "bas ", "palign": 0, "startS": 78.19149, "success": true}, {"endS": 79.06915, "word": "yahi ", "palign": 0, "startS": 78.51064, "success": true}, {"endS": 79.54787, "word": "hai ", "palign": 0, "startS": 79.17553, "success": true}, {"endS": 80.26596, "word": "mera ", "palign": 0, "startS": 79.70745, "success": true}, {"endS": 80.76748, "word": "imaan\n\n(", "palign": 0, "startS": 80.34574, "success": true}, {"endS": 98.7538, "word": "Verse 2)\n\n", "palign": 0, "startS": 80.85866, "success": true}, {"endS": 99.41489, "word": "Duniya ", "palign": 0, "startS": 98.78799, "success": true}, {"endS": 99.65426, "word": "ke ", "palign": 0, "startS": 99.53457, "success": true}, {"endS": 100.21277, "word": "liye ", "palign": 0, "startS": 99.77394, "success": true}, {"endS": 100.69149, "word": "hoon ", "palign": 0, "startS": 100.25266, "success": true}, {"endS": 101.92819, "word": "Babita, ", "palign": 0, "startS": 100.81117, "success": true}, {"endS": 102.28723, "word": "par ", "palign": 0, "startS": 102.04787, "success": true}, {"endS": 102.92553, "word": "tere ", "palign": 0, "startS": 102.28723, "success": true}, {"endS": 103.48404, "word": "liye ", "palign": 0, "startS": 103.00532, "success": true}, {"endS": 103.7234, "word": "bas ", "palign": 0, "startS": 103.56383, "success": true}, {"endS": 104.3617, "word": "''Maa'' ", "palign": 0, "startS": 103.88298, "success": true}, {"endS": 105.67819, "word": "meri\n\n", "palign": 0, "startS": 104.48138, "success": true}, {"endS": 105.95745, "word": "Ab ", "palign": 0, "startS": 105.79787, "success": true}, {"endS": 106.43617, "word": "toh ", "palign": 0, "startS": 105.99734, "success": true}, {"endS": 106.99468, "word": "tere ", "palign": 0, "startS": 106.59574, "success": true}, {"endS": 107.23404, "word": "hi ", "palign": 0, "startS": 107.11436, "success": true}, {"endS": 108.03191, "word": "chehre ", "palign": 0, "startS": 107.31383, "success": true}, {"endS": 109.28191, "word": "mein, ", "palign": 0, "startS": 108.13165, "success": true}, {"endS": 110.0266, "word": "dikhti ", "palign": 0, "startS": 109.33511, "success": true}, {"endS": 110.26596, "word": "hai ", "palign": 0, "startS": 110.10638, "success": true}, {"endS": 111.14362, "word": "shakal ", "palign": 0, "startS": 110.34574, "success": true}, {"endS": 118.30452, "word": "meri\n\n", "palign": 0, "startS": 111.2633, "success": true}, {"endS": 118.64362, "word": "Teri ", "palign": 0, "startS": 118.36436, "success": true}, {"endS": 119.52128, "word": "khushiyon ", "palign": 0, "startS": 118.68351, "success": true}, {"endS": 120.31915, "word": "ki ", "palign": 0, "startS": 119.64096, "success": true}, {"endS": 121.59574, "word": "khaatir, ", "palign": 0, "startS": 120.42553, "success": true}, {"endS": 121.91489, "word": "main ", "palign": 0, "startS": 121.67553, "success": true}, {"endS": 122.31383, "word": "har ", "palign": 0, "startS": 122.07447, "success": true}, {"endS": 122.79255, "word": "hadd ", "palign": 0, "startS": 122.39362, "success": true}, {"endS": 123.35106, "word": "se ", "palign": 0, "startS": 122.91223, "success": true}, {"endS": 123.98936, "word": "guzar ", "palign": 0, "startS": 123.47074, "success": true}, {"endS": 125.42553, "word": "jaaun\n\n", "palign": 0, "startS": 124.10904, "success": true}, {"endS": 126.06383, "word": "Tujhe ", "palign": 0, "startS": 125.50532, "success": true}, {"endS": 126.62234, "word": "chot ", "palign": 0, "startS": 126.14362, "success": true}, {"endS": 127.18085, "word": "lage ", "palign": 0, "startS": 126.74202, "success": true}, {"endS": 127.75532, "word": "toh, ", "palign": 0, "startS": 127.26064, "success": true}, {"endS": 128.7766, "word": "main ", "palign": 0, "startS": 127.85106, "success": true}, {"endS": 129.33511, "word": "khud ", "palign": 0, "startS":...'::jsonb,
        '{"0":[{"end":33989,"text":"Aankhon mein leke sapne, jab tu ghar mere aayi thi Meri sookhi si","index":1,"start":26968},{"end":42447,"text":"duniya mein, tu banke ghata chhaayi thi Teri nanhi si hasi mein,","index":2,"start":33869},{"end":50745,"text":"din mera nikal jaata Tujhe dekh ke hi mera, har ek gham pighal","index":3,"start":42327},{"end":62394,"text":"jaata (Chorus) Tu hi meri zameen, aur tu hi mera aasmaan Tujh","index":4,"start":50664},{"end":71250,"text":"mein hi toh basta hai, mera saara jahaan Meri rooh ka sukoon, aur","index":5,"start":62293},{"end":80266,"text":"har duaa ka hai anjaam Tu hi meri jannat hai, bas yahi hai mera","index":6,"start":71210},{"end":103723,"text":"imaan (Verse 2) Duniya ke liye hoon Babita, par tere liye bas","index":7,"start":80146},{"end":118305,"text":"''Maa'' meri Ab toh tere hi chehre mein, dikhti hai shakal meri","index":8,"start":103683},{"end":126622,"text":"Teri khushiyon ki khaatir, main har hadd se guzar jaaun Tujhe chot","index":9,"start":118164},{"end":139468,"text":"lage toh, main khud hi bikhar jaaun (Chorus) Tu hi meri zameen,","index":10,"start":126542},{"end":148404,"text":"aur tu hi mera aasmaan Tujh mein hi toh basta hai, mera saara","index":11,"start":139348},{"end":157101,"text":"jahaan Meri rooh ka sukoon, aur har duaa ka hai anjaam Tu hi","index":12,"start":148324},{"end":167553,"text":"meri jannat hai, bas yahi hai mera imaan (Bridge) Yeh waqt ki","index":13,"start":157007},{"end":174973,"text":"nadiya behti rahe, tu khushiyon mein rehti rahe Meri Bittoo, meri","index":14,"start":167473},{"end":182513,"text":"jaan hai tu, mera sachcha pyaar hai Mera sachcha pyaar hai... (","index":15,"start":174893},{"end":189375,"text":"Outro) Meri jannat...","index":16,"start":182401},{"end":193051,"text":"Meri dua...","index":17,"start":189265},{"end":194872,"text":"Bas tu...","index":18,"start":192942},{"end":196516,"text":"hamesha tu...","index":19,"start":194736}]}'::jsonb,
        '{"original_id":23,"original_sequence":19,"duration":"207.64","song_url":"https://apiboxfiles.erweima.ai/NzViNmFhM2QtYjRiOS00MzRhLTk1OGYtYmMzYWEzMWY2MmY2.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"cf5f2aeceeaad2967121a7ebefc9b18d"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Mother''s Love'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2025-08-10 11:52:43.460352+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Meri Jannat'
    LIMIT 1;

    -- Song entry for: Nacho Re Veer!
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
        'nacho-re-veer',
        'COMPLETED',
        true,
        '"[{\"id\": \"a0d314dd-be0d-4698-94ac-8185c316bafb\", \"tags\": \"This song is designed as a Bollywood Dance Pop track. The tempo is upbeat and energetic (around 128 BPM), perfect for dancing. The instrumentation should feature a strong blend of traditional Indian instruments like the Dholak and Tabla to provide a driving, festive rhythm, combined with a modern groovy bassline, fun synth melodies, and celebratory brass stabs. The overall vibe is that of a grand family celebration or a kids'' party scene from a Bollywood movie.\\r\\n\\r\\nVoice Recommendation: The lead vocal should be very cheerful, friendly, and expressive. A bright, smiling male or female voice would be ideal. It would be great to have backing vocals from a group of children shouting fun words like \\\"Veer!\\\", \\\"Hooray!\\\", and \\\"Dance!\\\" to enhance the party atmosphere.\", \"title\": \"Nacho Re Veer!\", \"prompt\": \"(Music Intro with fun party sounds and a Dholak beat)\\r\\n\\r\\n(Chorus)\\r\\nNacho Re Veer, Jhoomo Re Veer!\\r\\nBeat pe aaja, hoja befikar!\\r\\nThumka lagake, gol gol ghoom!\\r\\nMachi hai dekho, party ki dhoom!\\r\\n\\r\\n(Verse 1)\\r\\nChhote chhote pao se, jab tu karta dance\\r\\nSabke chehre pe aa jaata, pyara sa romance\\r\\nKabhi idhar, kabhi udhar, karta hai kamaal\\r\\nTeri shararat pe, sab hain khushaal!\\r\\n\\r\\n(Chorus)\\r\\nNacho Re Veer, Jhoomo Re Veer!\\r\\nBeat pe aaja, hoja befikar!\\r\\nThumka lagake, gol gol ghoom!\\r\\nMachi hai dekho, party ki dhoom!\\r\\n\\r\\n(Verse 2)\\r\\nMummy tujhko dekhe, Papa muskurayein\\r\\nTujhe dekh kar hi toh, woh dono khil jaayein\\r\\nUnki duniya hai tu, unka hai tu star\\r\\nMummy Papa karte hain, tujhko itna pyaar!\\r\\n\\r\\n(Bridge)\\r\\nChalo, clap your hands! Everybody!\\r\\n(Sound of clapping)\\r\\nAb stomp your feet! Come on, Veer!\\r\\n(Sound of stomping)\\r\\nAankhein meechi... peek-a-boo!\\r\\nSabse pyaara hai bas tu!\\r\\n\\r\\n(Chorus)\\r\\nNacho Re Veer, Jhoomo Re Veer!\\r\\nBeat pe aaja, hoja befikar!\\r\\nThumka lagake, gol gol ghoom!\\r\\nMachi hai dekho, party ki dhoom!\\r\\n\\r\\n(Outro)\\r\\nGo Veer! Go Veer!\\r\\nEverybody say... Yay Veer!\\r\\n(Music fades with Dholak beats and kids cheering \\\"Veer! Veer! Shabash!\\\")\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/YTBkMzE0ZGQtYmUwZC00Njk4LTk0YWMtODE4NWMzMTZiYWZi.mp3\", \"duration\": 142.96, \"imageUrl\": \"https://apiboxfiles.erweima.ai/YTBkMzE0ZGQtYmUwZC00Njk4LTk0YWMtODE4NWMzMTZiYWZi.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755153536135, \"sourceAudioUrl\": \"https://cdn1.suno.ai/a0d314dd-be0d-4698-94ac-8185c316bafb.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_a0d314dd-be0d-4698-94ac-8185c316bafb.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/YTBkMzE0ZGQtYmUwZC00Njk4LTk0YWMtODE4NWMzMTZiYWZi\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/a0d314dd-be0d-4698-94ac-8185c316bafb.mp3\"}, {\"id\": \"8325ab40-a457-4447-afaa-398dc477a367\", \"tags\": \"This song is designed as a Bollywood Dance Pop track. The tempo is upbeat and energetic (around 128 BPM), perfect for dancing. The instrumentation should feature a strong blend of traditional Indian instruments like the Dholak and Tabla to provide a driving, festive rhythm, combined with a modern groovy bassline, fun synth melodies, and celebratory brass stabs. The overall vibe is that of a grand family celebration or a kids'' party scene from a Bollywood movie.\\r\\n\\r\\nVoice Recommendation: The lead vocal should be very cheerful, friendly, and expressive. A bright, smiling male or female voice would be ideal. It would be great to have backing vocals from a group of children shouting fun words like \\\"Veer!\\\", \\\"Hooray!\\\", and \\\"Dance!\\\" to enhance the party atmosphere.\", \"title\": \"Nacho Re Veer!\", \"prompt\": \"(Music Intro with fun party sounds and a Dholak beat)\\r\\n\\r\\n(Chorus)\\r\\nNacho Re Veer, Jhoomo Re Veer!\\r\\nBeat pe aaja, hoja befikar!\\r\\nThumka lagake, gol gol ghoom!\\r\\nMachi hai dekho, party ki dhoom!\\r\\n\\r\\n(Verse 1)\\r\\nChhote chhote pao se, jab tu karta dance\\r\\nSabke chehre pe aa jaata, pyara sa romance\\r\\nKabhi idhar, kabhi udhar, karta hai kamaal\\r\\nTeri shararat pe, sab hain khushaal!\\r\\n\\r\\n(Chorus)\\r\\nNacho Re Veer, Jhoomo Re Veer!\\r\\nBeat pe aaja, hoja befikar!\\r\\nThumka lagake, gol gol ghoom!\\r\\nMachi hai dekho, party ki dhoom!\\r\\n\\r\\n(Verse 2)\\r\\nMummy tujhko dekhe, Papa muskurayein\\r\\nTujhe dekh kar hi toh, woh dono khil jaayein\\r\\nUnki duniya hai tu, unka hai tu star\\r\\nMummy Papa karte hain, tujhko itna pyaar!\\r\\n\\r\\n(Bridge)\\r\\nChalo, clap your hands! Everybody!\\r\\n(Sound of clapping)\\r\\nAb stomp your feet! Come on, Veer!\\r\\n(Sound of stomping)\\r\\nAankhein meechi... peek-a-boo!\\r\\nSabse pyaara hai bas tu!\\r\\n\\r\\n(Chorus)\\r\\nNacho Re Veer, Jhoomo Re Veer!\\r\\nBeat pe aaja, hoja befikar!\\r\\nThumka lagake, gol gol ghoom!\\r\\nMachi hai dekho, party ki dhoom!\\r\\n\\r\\n(Outro)\\r\\nGo Veer! Go Veer!\\r\\nEverybody say... Yay Veer!\\r\\n(Music fades with Dholak beats and kids cheering \\\"Veer! Veer! Shabash!\\\")\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/ODMyNWFiNDAtYTQ1Ny00NDQ3LWFmYWEtMzk4ZGM0NzdhMzY3.mp3\", \"duration\": 154.4, \"imageUrl\": \"https://apiboxfiles.erweima.ai/ODMyNWFiNDAtYTQ1Ny00NDQ3LWFmYWEtMzk4ZGM0NzdhMzY3.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755153536135, \"sourceAudioUrl\": \"https://cdn1.suno.ai/8325ab40-a457-4447-afaa-398dc477a367.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_8325ab40-a457-4447-afaa-398dc477a367.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/ODMyNWFiNDAtYTQ1Ny00NDQ3LWFmYWEtMzk4ZGM0NzdhMzY3\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/8325ab40-a457-4447-afaa-398dc477a367.mp3\"}]"'::jsonb,
        '{"1": [{"endS": 2.71277, "word": "Beat ", "palign": 0, "startS": 2.31383, "success": true}, {"endS": 4.54787, "word": "pe ", "palign": 0, "startS": 2.79255, "success": true}, {"endS": 5.0266, "word": "aaja, ", "palign": 0, "startS": 4.62766, "success": true}, {"endS": 5.42553, "word": "hoja ", "palign": 0, "startS": 5.10638, "success": true}, {"endS": 7.69947, "word": "befikar!\n\n", "palign": 0, "startS": 5.54521, "success": true}, {"endS": 8.05851, "word": "Thumka ", "palign": 0, "startS": 7.71941, "success": true}, {"endS": 9.57447, "word": "lagake, ", "palign": 0, "startS": 8.1383, "success": true}, {"endS": 9.81383, "word": "gol ", "palign": 0, "startS": 9.65426, "success": true}, {"endS": 10.13298, "word": "gol ", "palign": 0, "startS": 9.9734, "success": true}, {"endS": 11.40957, "word": "ghoom!\n\n", "palign": 0, "startS": 10.21277, "success": true}, {"endS": 11.72872, "word": "Machi ", "palign": 0, "startS": 11.44947, "success": true}, {"endS": 11.8883, "word": "hai ", "palign": 0, "startS": 11.78191, "success": true}, {"endS": 12.43085, "word": "dekho, ", "palign": 0, "startS": 11.96809, "success": true}, {"endS": 13.00532, "word": "party ", "palign": 0, "startS": 12.49468, "success": true}, {"endS": 13.24468, "word": "ki ", "palign": 0, "startS": 13.125, "success": true}, {"endS": 13.83311, "word": "dhoom!\n\n(", "palign": 0, "startS": 13.32447, "success": true}, {"endS": 21.99468, "word": "Verse 1)\n\n", "palign": 0, "startS": 13.92287, "success": true}, {"endS": 22.42021, "word": "Chhote ", "palign": 0, "startS": 22.00798, "success": true}, {"endS": 22.97872, "word": "chhote ", "palign": 0, "startS": 22.5, "success": true}, {"endS": 23.37766, "word": "pao ", "palign": 0, "startS": 23.05851, "success": true}, {"endS": 23.82979, "word": "se, ", "palign": 0, "startS": 23.49734, "success": true}, {"endS": 24.09574, "word": "jab ", "palign": 0, "startS": 23.88298, "success": true}, {"endS": 24.25532, "word": "tu ", "palign": 0, "startS": 24.17553, "success": true}, {"endS": 24.81383, "word": "karta ", "palign": 0, "startS": 24.3617, "success": true}, {"endS": 25.66489, "word": "dance\n\n", "palign": 0, "startS": 24.90957, "success": true}, {"endS": 26.09043, "word": "Sabke ", "palign": 0, "startS": 25.71809, "success": true}, {"endS": 26.64894, "word": "chehre ", "palign": 0, "startS": 26.14362, "success": true}, {"endS": 26.80851, "word": "pe ", "palign": 0, "startS": 26.72872, "success": true}, {"endS": 27.04787, "word": "aa ", "palign": 0, "startS": 26.92819, "success": true}, {"endS": 27.56649, "word": "jaata, ", "palign": 0, "startS": 27.16755, "success": true}, {"endS": 27.92553, "word": "pyara ", "palign": 0, "startS": 27.60638, "success": true}, {"endS": 28.40426, "word": "sa ", "palign": 0, "startS": 28.00532, "success": true}, {"endS": 29.3883, "word": "romance\n\n", "palign": 0, "startS": 28.49544, "success": true}, {"endS": 29.60106, "word": "Kabhi ", "palign": 0, "startS": 29.41489, "success": true}, {"endS": 30.34574, "word": "idhar, ", "palign": 0, "startS": 29.76064, "success": true}, {"endS": 30.55851, "word": "kabhi ", "palign": 0, "startS": 30.37234, "success": true}, {"endS": 31.31649, "word": "udhar, ", "palign": 0, "startS": 30.71809, "success": true}, {"endS": 31.67553, "word": "karta ", "palign": 0, "startS": 31.35638, "success": true}, {"endS": 31.91489, "word": "hai ", "palign": 0, "startS": 31.75532, "success": true}, {"endS": 33.61037, "word": "kamaal\n\n", "palign": 0, "startS": 31.95479, "success": true}, {"endS": 33.82979, "word": "Teri ", "palign": 0, "startS": 33.63032, "success": true}, {"endS": 34.54787, "word": "shararat ", "palign": 0, "startS": 33.85638, "success": true}, {"endS": 34.74734, "word": "pe, ", "palign": 0, "startS": 34.62766, "success": true}, {"endS": 34.86702, "word": "sab ", "palign": 0, "startS": 34.78723, "success": true}, {"endS": 35.18617, "word": "hain ", "palign": 0, "startS": 35.0266, "success": true}, {"endS": 37.12766, "word": "khushaal!\n\n(", "palign": 0, "startS": 35.30585, "success": true}, {"endS": 39.17553, "word": "Chorus)\n\n", "palign": 0, "startS": 37.21631, "success": true}, {"endS": 39.49468, "word": "Nacho ", "palign": 0, "startS": 39.21543, "success": true}, {"endS": 39.65426, "word": "Re ", "palign": 0, "startS": 39.57447, "success": true}, {"endS": 40.89096, "word": "Veer, ", "palign": 0, "startS": 39.77394, "success": true}, {"endS": 41.32979, "word": "Jhoomo ", "palign": 0, "startS": 40.93085, "success": true}, {"endS": 41.48936, "word": "Re ", "palign": 0, "startS": 41.40957, "success": true}, {"endS": 42.73936, "word": "Veer!\n\n", "palign": 0, "startS": 41.60904, "success": true}, {"endS": 42.84574, "word": "Beat ", "palign": 0, "startS": 42.76596, "success": true}, {"endS": 43.16489, "word": "pe ", "palign": 0, "startS": 42.92553, "success": true}, {"endS": 43.80319, "word": "aaja, ", "palign": 0, "startS": 43.32447, "success": true}, {"endS": 44.20213, "word": "hoja ", "palign": 0, "startS": 43.88298, "success": true}, {"endS": 46.51596, "word": "befikar!\n\n", "palign": 0, "startS": 44.32181, "success": true}, {"endS": 46.83511, "word": "Thumka ", "palign": 0, "startS": 46.55585, "success": true}, {"endS": 48.27128, "word": "lagake, ", "palign": 0, "startS": 46.91489, "success": true}, {"endS": 48.51064, "word": "gol ", "palign": 0, "startS": 48.35106, "success": true}, {"endS": 48.90957, "word": "gol ", "palign": 0, "startS": 48.67021, "success": true}, {"endS": 50.18617, "word": "ghoom!\n\n", "palign": 0, "startS": 49.02926, "success": true}, {"endS": 50.50532, "word": "Machi ", "palign": 0, "startS": 50.22606, "success": true}, {"endS": 50.66489, "word": "hai ", "palign": 0, "startS": 50.55851, "success": true}, {"endS": 51.12766, "word": "dekho, ", "palign": 0, "startS": 50.71809, "success": true}, {"endS": 51.70213, "word": "party ", "palign": 0, "startS": 51.19149, "success": true}, {"endS": 52.02128, "word": "ki ", "palign": 0, "startS": 51.82181, "success": true}, {"endS": 61.22673, "word": "dhoom!\n\n(", "palign": 0, "startS": 52.10106, "success": true}, {"endS": 61.32219, "word": "Verse 2)\n\n", "palign": 0, "startS": 61.2367, "success": true}, {"endS": 61.59574, "word": "Mummy ", "palign": 0, "startS": 61.33359, "success": true}, {"endS": 62.15426, "word": "tujhko ", "palign": 0, "startS": 61.67553, "success": true}, {"endS": 63.31915, "word": "dekhe, ", "palign": 0, "startS": 62.18085, "success": true}, {"endS": 63.51064, "word": "Papa ", "palign": 0, "startS": 63.36702, "success": true}, {"endS": 64.89362, "word": "muskurayein\n\n", "palign": 0, "startS": 63.56383, "success": true}, {"endS": 65.34574, "word": "Tujhe ", "palign": 0, "startS": 64.92021, "success": true}, {"endS": 65.66489, "word": "dekh ", "palign": 0, "startS": 65.42553, "success": true}, {"endS": 65.98404, "word": "kar ", "palign": 0, "startS": 65.77128, "success": true}, {"endS": 66.14362, "word": "hi ", "palign": 0, "startS": 66.06383, "success": true}, {"endS": 66.60239, "word": "toh, ", "palign": 0, "startS": 66.18351, "success": true}, {"endS": 66.78191, "word": "woh ", "palign": 0, "startS": 66.66223, "success": true}, {"endS": 67.26064, "word": "dono ", "palign": 0, "startS": 66.8617, "success": true}, {"endS": 67.73936, "word": "khil ", "palign": 0, "startS": 67.38032, "success": true}, {"endS": 68.82979, "word": "jaayein\n\n", "palign": 0, "startS": 67.85904, "success": true}, {"endS": 69.09574, "word": "Unki ", "palign": 0, "startS": 68.88298, "success": true}, {"endS": 69.81383, "word": "duniya ", "palign": 0, "startS": 69.17553, "success": true}, {"endS": 70.05319, "word": "hai ", "palign": 0, "startS": 69.89362, "success": true}, {"endS": 70.53191, "word": "tu, ", "palign": 0, "startS": 70.17287, "success": true}, {"endS": 71.01064, "word": "unka ", "palign": 0, "startS": 70.6117, "success": true}, {"endS": 71.17021, "word": "hai ", "palign": 0, "startS": 71.06383, "success": true}, {"endS": 71.40957, "word": "tu ", "palign": 0, "startS": 71.28989, "success": true}, {"endS": 72.36702, "word": "star\n\n", "palign": 0, "startS": 71.52926, "success": true}, {"endS": 72.84574, "word": "Mummy ", "palign": 0, "startS": 72.44681, "success": true}, {"endS": 73.16489, "word": "Papa ", "palign": 0, "startS": 72.92553, "success": true}, {"endS": 73.7234, "word": "karte ", "palign": 0, "startS": 73.32447, "success": true}, {"endS": 74.16223, "word": "hain, ", "palign": 0, "startS": 73.82979, "success": true}, {"endS": 74.68085, "word": "tujhko ", "palign": 0, "startS": 74.18218, "success": true}, {"endS": 75.15957, "word": "itna ", "palign": 0, "startS": 74.76064, "success": true}, {"endS": 75.66489, "word": "pyaar!\n\n(", "palign": 0, "startS": 75.23936, "success": true}, {"endS": 77.05851, "word": "Bridge)\n\n", "palign": 0, "startS": 75.75355, "success": true}, {"endS": 77.52128, "word": "Chalo, ", "palign": 0, "startS": 77.09043, "success": true}, {"endS": 77.71277, "word": "clap ", "palign": 0, "startS": 77.56915, "success": true}, {"endS": 77.87234, "word": "your ", "palign": 0, "startS": 77.75266, "success": true}, {"endS": 79.79521, "word": "hands! ", "palign": 0, "startS": 77.96809, "success": true}, {"endS": 80.90426, "word": "Everybody!\n\n", "palign": 0, "startS": 79.88298, "success": true}, {"endS": 81.06383, "word": "Ab ", "palign": 0, "startS": 80.98404, "success": true}, {"endS": 81.30319, "word": "stomp ", "palign": 0, "startS": 81.08378, "success": true}, {"endS": 81.54255, "word": "your ", "palign": 0, "startS": 81.36303, "success": true}, {"endS": 83.01064, "word": "feet! ", "palign": 0, "startS": 81.64229, "success": true}, {"endS": 83.1383, "word": "Come ", "palign": 0, "startS": 83.04255, "success": true}, {"endS": 83.55319, "word": "on, ", "palign": 0, "startS": 83.25798, "success": true}, {"endS": 84.86702, "word": "Veer!\n\n", "palign": 0, "startS": 83.64894, "success": true}, {"endS": 85.29255, "word": "Aankhein ", "palign": 0, "startS": 84.89362, "success": true}, {"endS": 86.61702, "word": "meechi... ", "palign": 0, "startS": 85.37234, "success": true}, {"endS": 88.52394, "word": "peek-a-boo!\n\n", "palign": 0, "startS": 86.63298, "success": true}, {"endS": 88.96277, "word": "Sabse ", "palign": 0, "startS": 88.54388, "success": true}, {"endS"...'::jsonb,
        '{"0":[{"end":7699,"text":"Beat pe aaja, hoja befikar!","index":0,"start":2314},{"end":11410,"text":"Thumka lagake, gol gol ghoom!","index":1,"start":7719},{"end":13833,"text":"Machi hai dekho, party ki dhoom! (","index":2,"start":11449},{"end":26809,"text":"Verse 1) Chhote chhote pao se, jab tu karta dance Sabke chehre pe","index":3,"start":13923},{"end":31915,"text":"aa jaata, pyara sa romance Kabhi idhar, kabhi udhar, karta hai","index":4,"start":26928},{"end":37128,"text":"kamaal Teri shararat pe, sab hain khushaal! (","index":5,"start":31955},{"end":42739,"text":"Chorus) Nacho Re Veer, Jhoomo Re Veer!","index":6,"start":37216},{"end":46516,"text":"Beat pe aaja, hoja befikar!","index":7,"start":42766},{"end":50186,"text":"Thumka lagake, gol gol ghoom!","index":8,"start":46556},{"end":61227,"text":"Machi hai dekho, party ki dhoom! (","index":9,"start":50226},{"end":66144,"text":"Verse 2) Mummy tujhko dekhe, Papa muskurayein Tujhe dekh kar hi","index":10,"start":61237},{"end":72367,"text":"toh, woh dono khil jaayein Unki duniya hai tu, unka hai tu star","index":11,"start":66184},{"end":75665,"text":"Mummy Papa karte hain, tujhko itna pyaar! (","index":12,"start":72447},{"end":79795,"text":"Bridge) Chalo, clap your hands!","index":13,"start":75754},{"end":80904,"text":"Everybody!","index":14,"start":79883},{"end":83011,"text":"Ab stomp your feet!","index":15,"start":80984},{"end":84867,"text":"Come on, Veer!","index":16,"start":83043},{"end":86617,"text":"Aankhein meechi...","index":17,"start":84894},{"end":88524,"text":"peek-a-boo!","index":18,"start":86633},{"end":91245,"text":"Sabse pyaara hai bas tu! (","index":19,"start":88544},{"end":100053,"text":"Chorus) Beat pe aaja, hoja befikar!","index":20,"start":91340},{"end":103723,"text":"Thumka lagake, gol gol ghoom!","index":21,"start":100093},{"end":109867,"text":"Machi hai dekho, party ki dhoom! (","index":22,"start":103763},{"end":116117,"text":"Outro) Go Veer!","index":23,"start":109947},{"end":117106,"text":"Go Veer!","index":24,"start":116223},{"end":121316,"text":"Everybody say...","index":25,"start":117135},{"end":123431,"text":"Yay Veer!","index":26,"start":121410}]}'::jsonb,
        '{"original_id":24,"original_sequence":20,"duration":"154.40","song_url":"https://apiboxfiles.erweima.ai/ODMyNWFiNDAtYTQ1Ny00NDQ3LWFmYWEtMzk4ZGM0NzdhMzY3.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"961574c339365b8fd793bce7ff58d15c"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Dance Musical'],
        ARRAY[]::text[],
        true,
        false,
        1,
        '2025-08-14 06:37:19.964908+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Nacho Re Veer!'
    LIMIT 1;

    -- Song entry for: Aap Hi Jahaan
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
        'aap-hi-jahaan',
        'COMPLETED',
        true,
        '"[{\"id\": \"37e276cb-7075-4d47-90b7-7370796e1c30\", \"tags\": \"Soft Acoustic Ballad\\r\\nThis song is designed to be an intimate and heartfelt ballad. The primary instrument should be a warm-sounding acoustic guitar playing a gentle finger-picking pattern or soft chords. A simple, melodic piano line can enter during the chorus to add depth and emotional weight.\\r\\n\\r\\nThe rhythm should be subtle, perhaps with a soft shaker or a light cajon beat that maintains a slow, gentle tempo. During the bridge and the final chorus, a quiet string section (cello and violin) could swell softly in the background to elevate the feeling of love and gratitude.\\r\\n\\r\\nVoice: The ideal vocal performance would be soft, warm, and sincere. It doesn''t require a powerful, belted voice, but rather a gentle baritone (male) or a warm mezzo-soprano (female) who can convey emotion through subtle expression and clarity. The delivery should feel like a personal message, almost a whisper at times, making the listener (your parents) feel like you are singing directly to them.\", \"title\": \"Aap Hi Jahaan\", \"prompt\": \"(Verse 1)\\r\\nAap hi zameen, aap hi aasmaan,\\r\\nAap se hi hai yeh mera jahaan.\\r\\nHar dhoop mein jo ban gaye saaya,\\r\\nAapke jaisa pyaar kahaan paaya.\\r\\n\\r\\n(Chorus)\\r\\nMaa... Papa... suno na yeh dil kya kahe,\\r\\nAapke bina ik pal bhi na rahe.\\r\\nDuniya ki daulat shohrat sab ek taraf,\\r\\nAnmol hai aapka pyaar har taraf.\\r\\n\\r\\n(Verse 2)\\r\\nYaad hai bachpan, woh ungli pakad kar chalna,\\r\\nHar chot pe aapka woh aake sambhalna.\\r\\nAndheron mein roshni bankar aaye,\\r\\nJeene ke saare saleeqe sikhaye.\\r\\n\\r\\n(Chorus)\\r\\nMaa... Papa... suno na yeh dil kya kahe,\\r\\nAapke bina ik pal bhi na rahe.\\r\\nDuniya ki daulat shohrat sab ek taraf,\\r\\nAnmol hai aapka pyaar har taraf.\\r\\n\\r\\n(Bridge)\\r\\nAb farz hai mera, banu main aapka sahara,\\r\\nThak jaao jab tum, banu main hi kinara.\\r\\nAapki har ek khushi poori main karoon,\\r\\nAapke har gham ko ab door main karoon.\\r\\n\\r\\n(Chorus)\\r\\nMaa... Papa... suno na yeh dil kya kahe,\\r\\nAapke bina ik pal bhi na rahe.\\r\\nDuniya ki daulat shohrat sab ek taraf,\\r\\nAnmol hai aapka pyaar har taraf.\\r\\n\\r\\n(Outro)\\r\\nBas itni si dua...\\r\\nSaath ho aapka hamesha...\\r\\nMaa...\\r\\nPapa...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/MzdlMjc2Y2ItNzA3NS00ZDQ3LTkwYjctNzM3MDc5NmUxYzMw.mp3\", \"duration\": 243.68, \"imageUrl\": \"https://apiboxfiles.erweima.ai/MzdlMjc2Y2ItNzA3NS00ZDQ3LTkwYjctNzM3MDc5NmUxYzMw.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755359678736, \"sourceAudioUrl\": \"https://cdn1.suno.ai/37e276cb-7075-4d47-90b7-7370796e1c30.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_37e276cb-7075-4d47-90b7-7370796e1c30.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/MzdlMjc2Y2ItNzA3NS00ZDQ3LTkwYjctNzM3MDc5NmUxYzMw\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/37e276cb-7075-4d47-90b7-7370796e1c30.mp3\"}, {\"id\": \"4ab207fe-537c-4cd3-b9c8-086f83691a7b\", \"tags\": \"Soft Acoustic Ballad\\r\\nThis song is designed to be an intimate and heartfelt ballad. The primary instrument should be a warm-sounding acoustic guitar playing a gentle finger-picking pattern or soft chords. A simple, melodic piano line can enter during the chorus to add depth and emotional weight.\\r\\n\\r\\nThe rhythm should be subtle, perhaps with a soft shaker or a light cajon beat that maintains a slow, gentle tempo. During the bridge and the final chorus, a quiet string section (cello and violin) could swell softly in the background to elevate the feeling of love and gratitude.\\r\\n\\r\\nVoice: The ideal vocal performance would be soft, warm, and sincere. It doesn''t require a powerful, belted voice, but rather a gentle baritone (male) or a warm mezzo-soprano (female) who can convey emotion through subtle expression and clarity. The delivery should feel like a personal message, almost a whisper at times, making the listener (your parents) feel like you are singing directly to them.\", \"title\": \"Aap Hi Jahaan\", \"prompt\": \"(Verse 1)\\r\\nAap hi zameen, aap hi aasmaan,\\r\\nAap se hi hai yeh mera jahaan.\\r\\nHar dhoop mein jo ban gaye saaya,\\r\\nAapke jaisa pyaar kahaan paaya.\\r\\n\\r\\n(Chorus)\\r\\nMaa... Papa... suno na yeh dil kya kahe,\\r\\nAapke bina ik pal bhi na rahe.\\r\\nDuniya ki daulat shohrat sab ek taraf,\\r\\nAnmol hai aapka pyaar har taraf.\\r\\n\\r\\n(Verse 2)\\r\\nYaad hai bachpan, woh ungli pakad kar chalna,\\r\\nHar chot pe aapka woh aake sambhalna.\\r\\nAndheron mein roshni bankar aaye,\\r\\nJeene ke saare saleeqe sikhaye.\\r\\n\\r\\n(Chorus)\\r\\nMaa... Papa... suno na yeh dil kya kahe,\\r\\nAapke bina ik pal bhi na rahe.\\r\\nDuniya ki daulat shohrat sab ek taraf,\\r\\nAnmol hai aapka pyaar har taraf.\\r\\n\\r\\n(Bridge)\\r\\nAb farz hai mera, banu main aapka sahara,\\r\\nThak jaao jab tum, banu main hi kinara.\\r\\nAapki har ek khushi poori main karoon,\\r\\nAapke har gham ko ab door main karoon.\\r\\n\\r\\n(Chorus)\\r\\nMaa... Papa... suno na yeh dil kya kahe,\\r\\nAapke bina ik pal bhi na rahe.\\r\\nDuniya ki daulat shohrat sab ek taraf,\\r\\nAnmol hai aapka pyaar har taraf.\\r\\n\\r\\n(Outro)\\r\\nBas itni si dua...\\r\\nSaath ho aapka hamesha...\\r\\nMaa...\\r\\nPapa...\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NGFiMjA3ZmUtNTM3Yy00Y2QzLWI5YzgtMDg2ZjgzNjkxYTdi.mp3\", \"duration\": 239.76, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NGFiMjA3ZmUtNTM3Yy00Y2QzLWI5YzgtMDg2ZjgzNjkxYTdi.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755359678736, \"sourceAudioUrl\": \"https://cdn1.suno.ai/4ab207fe-537c-4cd3-b9c8-086f83691a7b.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_4ab207fe-537c-4cd3-b9c8-086f83691a7b.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NGFiMjA3ZmUtNTM3Yy00Y2QzLWI5YzgtMDg2ZjgzNjkxYTdi\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/4ab207fe-537c-4cd3-b9c8-086f83691a7b.mp3\"}]"'::jsonb,
        '{"1": [{"endS": 14.89742, "word": "(Verse 1)\n\n", "palign": 0, "startS": 14.60106, "success": true}, {"endS": 15, "word": "Aap ", "palign": 0, "startS": 14.93161, "success": true}, {"endS": 15.31915, "word": "hi ", "palign": 0, "startS": 15.11968, "success": true}, {"endS": 18.1117, "word": "zameen, ", "palign": 0, "startS": 15.47872, "success": true}, {"endS": 18.51064, "word": "aap ", "palign": 0, "startS": 18.19149, "success": true}, {"endS": 18.98936, "word": "hi ", "palign": 0, "startS": 18.63032, "success": true}, {"endS": 21.75532, "word": "aasmaan,\n\n", "palign": 0, "startS": 19.14894, "success": true}, {"endS": 22.18085, "word": "Aap ", "palign": 0, "startS": 21.8617, "success": true}, {"endS": 22.42021, "word": "se ", "palign": 0, "startS": 22.30053, "success": true}, {"endS": 22.81915, "word": "hi ", "palign": 0, "startS": 22.53989, "success": true}, {"endS": 24.89362, "word": "hai ", "palign": 0, "startS": 22.92553, "success": true}, {"endS": 25.21277, "word": "yeh ", "palign": 0, "startS": 25, "success": true}, {"endS": 25.69149, "word": "mera ", "palign": 0, "startS": 25.37234, "success": true}, {"endS": 26.15426, "word": "jahaan.\n\n", "palign": 0, "startS": 25.77128, "success": true}, {"endS": 26.25, "word": "Har ", "palign": 0, "startS": 26.18617, "success": true}, {"endS": 30.17553, "word": "dhoop ", "palign": 0, "startS": 26.40957, "success": true}, {"endS": 30.55851, "word": "mein ", "palign": 0, "startS": 30.27128, "success": true}, {"endS": 31.75532, "word": "jo ", "palign": 0, "startS": 30.67819, "success": true}, {"endS": 32.23404, "word": "ban ", "palign": 0, "startS": 31.91489, "success": true}, {"endS": 32.87234, "word": "gaye ", "palign": 0, "startS": 32.23404, "success": true}, {"endS": 36.59574, "word": "saaya,\n\n", "palign": 0, "startS": 32.99202, "success": true}, {"endS": 37.42021, "word": "Aapke ", "palign": 0, "startS": 36.70213, "success": true}, {"endS": 38.1383, "word": "jaisa ", "palign": 0, "startS": 37.53989, "success": true}, {"endS": 38.93617, "word": "pyaar ", "palign": 0, "startS": 38.29787, "success": true}, {"endS": 39.73404, "word": "kahaan ", "palign": 0, "startS": 39.04255, "success": true}, {"endS": 40.31915, "word": "paaya.\n\n(", "palign": 0, "startS": 39.85372, "success": true}, {"endS": 43.43617, "word": "Chorus)\n\n", "palign": 0, "startS": 40.4078, "success": true}, {"endS": 44.68085, "word": "Maa... ", "palign": 0, "startS": 43.53191, "success": true}, {"endS": 45.75798, "word": "Papa... ", "palign": 0, "startS": 44.76064, "success": true}, {"endS": 46.35638, "word": "suno ", "palign": 0, "startS": 45.79787, "success": true}, {"endS": 46.67553, "word": "na ", "palign": 0, "startS": 46.47606, "success": true}, {"endS": 47.15426, "word": "yeh ", "palign": 0, "startS": 46.78191, "success": true}, {"endS": 47.79255, "word": "dil ", "palign": 0, "startS": 47.31383, "success": true}, {"endS": 48.27128, "word": "kya ", "palign": 0, "startS": 47.87234, "success": true}, {"endS": 49.60106, "word": "kahe,\n\n", "palign": 0, "startS": 48.39096, "success": true}, {"endS": 50.42553, "word": "Aapke ", "palign": 0, "startS": 49.70745, "success": true}, {"endS": 51.30319, "word": "bina ", "palign": 0, "startS": 50.58511, "success": true}, {"endS": 51.94149, "word": "ik ", "palign": 0, "startS": 51.42287, "success": true}, {"endS": 52.42021, "word": "pal ", "palign": 0, "startS": 52.10106, "success": true}, {"endS": 53.05851, "word": "bhi ", "palign": 0, "startS": 52.57979, "success": true}, {"endS": 53.45745, "word": "na ", "palign": 0, "startS": 53.05851, "success": true}, {"endS": 56.84043, "word": "rahe.\n\n", "palign": 0, "startS": 53.53723, "success": true}, {"endS": 57.5266, "word": "Duniya ", "palign": 0, "startS": 56.85638, "success": true}, {"endS": 58.24468, "word": "ki ", "palign": 0, "startS": 57.64628, "success": true}, {"endS": 59.68085, "word": "daulat ", "palign": 0, "startS": 58.36436, "success": true}, {"endS": 60.95745, "word": "shohrat ", "palign": 0, "startS": 59.76064, "success": true}, {"endS": 61.75532, "word": "sab ", "palign": 0, "startS": 61.07713, "success": true}, {"endS": 62.23404, "word": "ek ", "palign": 0, "startS": 61.875, "success": true}, {"endS": 63.43085, "word": "taraf,\n\n", "palign": 0, "startS": 62.39362, "success": true}, {"endS": 64.14894, "word": "Anmol ", "palign": 0, "startS": 63.51064, "success": true}, {"endS": 64.62766, "word": "hai ", "palign": 0, "startS": 64.25532, "success": true}, {"endS": 65.90426, "word": "aapka ", "palign": 0, "startS": 64.78723, "success": true}, {"endS": 66.94149, "word": "pyaar ", "palign": 0, "startS": 66.06383, "success": true}, {"endS": 67.42021, "word": "har ", "palign": 0, "startS": 67.06117, "success": true}, {"endS": 68.16822, "word": "taraf.\n\n(", "palign": 0, "startS": 67.57979, "success": true}, {"endS": 84.20213, "word": "Verse 2)\n\n", "palign": 0, "startS": 68.25798, "success": true}, {"endS": 84.57447, "word": "Yaad ", "palign": 0, "startS": 84.26862, "success": true}, {"endS": 85.05319, "word": "hai ", "palign": 0, "startS": 84.68085, "success": true}, {"endS": 87.5266, "word": "bachpan, ", "palign": 0, "startS": 85.17287, "success": true}, {"endS": 87.76596, "word": "woh ", "palign": 0, "startS": 87.60638, "success": true}, {"endS": 88.24468, "word": "ungli ", "palign": 0, "startS": 87.84574, "success": true}, {"endS": 88.88298, "word": "pakad ", "palign": 0, "startS": 88.40426, "success": true}, {"endS": 89.20213, "word": "kar ", "palign": 0, "startS": 88.98936, "success": true}, {"endS": 91.67553, "word": "chalna,\n\n", "palign": 0, "startS": 89.25532, "success": true}, {"endS": 91.99468, "word": "Har ", "palign": 0, "startS": 91.75532, "success": true}, {"endS": 92.63298, "word": "chot ", "palign": 0, "startS": 92.15426, "success": true}, {"endS": 92.95213, "word": "pe ", "palign": 0, "startS": 92.75266, "success": true}, {"endS": 94.22872, "word": "aapka ", "palign": 0, "startS": 93.1117, "success": true}, {"endS": 94.62766, "word": "woh ", "palign": 0, "startS": 94.33511, "success": true}, {"endS": 95.50532, "word": "aake ", "palign": 0, "startS": 94.74734, "success": true}, {"endS": 98.79255, "word": "sambhalna.\n\n", "palign": 0, "startS": 95.58511, "success": true}, {"endS": 99.65426, "word": "Andheron ", "palign": 0, "startS": 98.84043, "success": true}, {"endS": 100.05319, "word": "mein ", "palign": 0, "startS": 99.75399, "success": true}, {"endS": 101.72872, "word": "roshni ", "palign": 0, "startS": 100.15957, "success": true}, {"endS": 102.5266, "word": "bankar ", "palign": 0, "startS": 101.8883, "success": true}, {"endS": 105.79787, "word": "aaye,\n\n", "palign": 0, "startS": 102.60638, "success": true}, {"endS": 106.35638, "word": "Jeene ", "palign": 0, "startS": 105.87766, "success": true}, {"endS": 106.75532, "word": "ke ", "palign": 0, "startS": 106.47606, "success": true}, {"endS": 107.63298, "word": "saare ", "palign": 0, "startS": 106.875, "success": true}, {"endS": 108.67021, "word": "saleeqe ", "palign": 0, "startS": 107.79255, "success": true}, {"endS": 113.08511, "word": "sikhaye.\n\n(", "palign": 0, "startS": 108.78989, "success": true}, {"endS": 114.09574, "word": "Chorus)\n\n", "palign": 0, "startS": 113.17376, "success": true}, {"endS": 114.60866, "word": "Maa... ", "palign": 0, "startS": 114.17553, "success": true}, {"endS": 115.29255, "word": "Papa... ", "palign": 0, "startS": 114.69985, "success": true}, {"endS": 115.85106, "word": "suno ", "palign": 0, "startS": 115.34574, "success": true}, {"endS": 116.25, "word": "na ", "palign": 0, "startS": 115.97074, "success": true}, {"endS": 116.72872, "word": "yeh ", "palign": 0, "startS": 116.35638, "success": true}, {"endS": 117.28723, "word": "dil ", "palign": 0, "startS": 116.8883, "success": true}, {"endS": 117.68617, "word": "kya ", "palign": 0, "startS": 117.36702, "success": true}, {"endS": 118.19149, "word": "kahe,\n\n", "palign": 0, "startS": 117.76596, "success": true}, {"endS": 120.07979, "word": "Aapke ", "palign": 0, "startS": 118.24468, "success": true}, {"endS": 120.87766, "word": "bina ", "palign": 0, "startS": 120.23936, "success": true}, {"endS": 121.51596, "word": "ik ", "palign": 0, "startS": 120.99734, "success": true}, {"endS": 121.99468, "word": "pal ", "palign": 0, "startS": 121.67553, "success": true}, {"endS": 122.63298, "word": "bhi ", "palign": 0, "startS": 122.10106, "success": true}, {"endS": 123.03191, "word": "na ", "palign": 0, "startS": 122.75266, "success": true}, {"endS": 126.39894, "word": "rahe.\n\n", "palign": 0, "startS": 123.1516, "success": true}, {"endS": 127.18085, "word": "Duniya ", "palign": 0, "startS": 126.44681, "success": true}, {"endS": 127.89894, "word": "ki ", "palign": 0, "startS": 127.30053, "success": true}, {"endS": 129.09574, "word": "daulat ", "palign": 0, "startS": 128.01862, "success": true}, {"endS": 130.45213, "word": "shohrat ", "palign": 0, "startS": 129.20213, "success": true}, {"endS": 131.25, "word": "sab ", "palign": 0, "startS": 130.57181, "success": true}, {"endS": 131.72872, "word": "ek ", "palign": 0, "startS": 131.36968, "success": true}, {"endS": 132.92553, "word": "taraf,\n\n", "palign": 0, "startS": 131.8883, "success": true}, {"endS": 133.7234, "word": "Anmol ", "palign": 0, "startS": 133.00532, "success": true}, {"endS": 134.52128, "word": "hai ", "palign": 0, "startS": 133.82979, "success": true}, {"endS": 135.47872, "word": "aapka ", "palign": 0, "startS": 134.68085, "success": true}, {"endS": 136.51596, "word": "pyaar ", "palign": 0, "startS": 135.55851, "success": true}, {"endS": 136.99468, "word": "har ", "palign": 0, "startS": 136.67553, "success": true}, {"endS": 155.05319, "word": "taraf.\n\n(", "palign": 0, "startS": 136.99468, "success": true}, {"endS": 155.38564, "word": "Bridge)\n\n", "palign": 0, "startS": 155.08865, "success": true}, {"endS": 155.50532, "word": "Ab ", "palign": 0, "startS": 155.44548, "success": true}, {"endS": 156.14362, "word": "farz ", "palign": 0, "startS": 155.66489, "success": true}, {"endS": 156.62234, "word": "hai ", "palign": 0, "startS": 156.25, "success": true}, {"endS": 157.87899, "word": "mera, ", "palign": 0, "startS": 156.78191, "success": true}, {"endS": 158.53723, "word": "banu ", "palign": 0, "startS": 157.9...'::jsonb,
        '{"0":[{"end":26154,"text":"Aap hi zameen, aap hi aasmaan, Aap se hi hai yeh mera jahaan.","index":1,"start":14732},{"end":40319,"text":"Har dhoop mein jo ban gaye saaya, Aapke jaisa pyaar kahaan paaya. (","index":2,"start":25986},{"end":44681,"text":"Chorus) Maa...","index":3,"start":40208},{"end":45758,"text":"Papa...","index":4,"start":44561},{"end":56840,"text":"suno na yeh dil kya kahe, Aapke bina ik pal bhi na rahe.","index":5,"start":45598},{"end":67420,"text":"Duniya ki daulat shohrat sab ek taraf, Anmol hai aapka pyaar har","index":6,"start":56656},{"end":68168,"text":"taraf. (","index":7,"start":67380},{"end":92952,"text":"Verse 2) Yaad hai bachpan, woh ungli pakad kar chalna, Har chot pe","index":8,"start":68058},{"end":98793,"text":"aapka woh aake sambhalna.","index":9,"start":92912},{"end":113085,"text":"Andheron mein roshni bankar aaye, Jeene ke saare saleeqe sikhaye. (","index":10,"start":98640},{"end":114609,"text":"Chorus) Maa...","index":11,"start":112974},{"end":115293,"text":"Papa...","index":12,"start":114500},{"end":126399,"text":"suno na yeh dil kya kahe, Aapke bina ik pal bhi na rahe.","index":13,"start":115146},{"end":136995,"text":"Duniya ki daulat shohrat sab ek taraf, Anmol hai aapka pyaar har","index":14,"start":126247},{"end":155053,"text":"taraf. (","index":15,"start":136795},{"end":163484,"text":"Bridge) Ab farz hai mera, banu main aapka sahara, Thak jaao jab","index":16,"start":154889},{"end":168989,"text":"tum, banu main hi kinara.","index":17,"start":163364},{"end":179920,"text":"Aapki har ek khushi poori main karoon, Aapke har gham ko ab door","index":18,"start":168869},{"end":181543,"text":"main karoon. (","index":19,"start":179820},{"end":187261,"text":"Chorus) Maa...","index":20,"start":181431},{"end":188378,"text":"Papa...","index":21,"start":187140},{"end":199404,"text":"suno na yeh dil kya kahe, Aapke bina ik pal bhi na rahe.","index":22,"start":188231},{"end":210080,"text":"Duniya ki daulat shohrat sab ek taraf, Anmol hai aapka pyaar har","index":23,"start":199252},{"end":210748,"text":"taraf. (","index":24,"start":210039},{"end":216410,"text":"Outro) Bas itni si dua...","index":25,"start":210638},{"end":222739,"text":"Saath ho aapka hamesha...","index":26,"start":216276},{"end":239705,"text":"Maa...","index":27,"start":222632},{"end":240479,"text":"Papa...","index":28,"start":239591}]}'::jsonb,
        '{"original_id":25,"original_sequence":21,"duration":"239.76","song_url":"https://apiboxfiles.erweima.ai/NGFiMjA3ZmUtNTM3Yy00Y2QzLWI5YzgtMDg2ZjgzNjkxYTdi.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"cfb59a2717a0b1ad79f1b5766503f5f0"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Parents Love'],
        ARRAY['love'],
        true,
        false,
        1,
        '2025-08-16 15:52:11.915375+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Aap Hi Jahaan'
    LIMIT 1;

    -- Song entry for: Level Ten Rockstar
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
        'level-ten-rockstar',
        'COMPLETED',
        true,
        '"[{\"id\": \"714c76a4-5685-48fc-b4ed-11c4d8d64d26\", \"tags\": \"A vibrant and high-energy Indi-Pop/Pop-Rock track. The song should open with an upbeat drum intro and a catchy electric guitar riff. The verses would be driven by a strong bassline and rhythmic guitars, building up to a powerful, anthem-like chorus. Use fun synth melodies in the background, especially during the lines about video games, to add a modern, playful touch.\\r\\n\\r\\nSuggested Vocal Style: A clear, youthful, and energetic male voice would be perfect. The delivery should be enthusiastic and full of joy, making it a track that gets everyone at the party on their feet and singing along.\", \"title\": \"Level Ten Rockstar\", \"prompt\": \"(Verse 1)\\r\\nSuno suno, it''s a special day\\r\\nSaare bolo, hip hip hooray!\\r\\nShor machao, clap your hands\\r\\nAaj party ka hai poora plan!\\r\\nCake bhi hai aur fun bhi hai\\r\\nKyunki Shlok aaj ho gaya ten!\\r\\n\\r\\n(Chorus)\\r\\nHappy Birthday to you, Shlok, O Rockstar!\\r\\nMummy Papa ka tu hi hai shining star!\\r\\nLevel Up hua hai, what a solid block!\\r\\nWelcome to the awesome \\\"Level Ten\\\" rock!\\r\\n\\r\\n(Verse 2)\\r\\nHaath mein leke apni Nerf Gun\\r\\nJeetna hi bas hai tera fun\\r\\nPS ka hero, game ka king\\r\\nHar challenge ko karta hai swing!\\r\\nScreen pe chalti hai teri command\\r\\nBest player in the whole land!\\r\\n\\r\\n(Chorus)\\r\\nHappy Birthday to you, Shlok, O Rockstar!\\r\\nMummy Papa ka tu hi hai shining star!\\r\\nLevel Up hua hai, what a solid block!\\r\\nWelcome to the awesome \\\"Level Ten\\\" rock!\\r\\n\\r\\n(Bridge)\\r\\nMummy Papa ki aankhon ka taara\\r\\nTu unka dulaara, sabse pyaara\\r\\nAur chhota Snitik bhi peechhe aaye\\r\\nThodi masti, dher saara love laaye!\\r\\nKabhi jhagda, kabhi yaari\\r\\nAisi hai yeh rishtedaari!\\r\\n\\r\\n(Chorus)\\r\\nHappy Birthday to you, Shlok, O Rockstar!\\r\\nMummy Papa ka tu hi hai shining star!\\r\\nLevel Up hua hai, what a solid block!\\r\\nWelcome to the awesome \\\"Level Ten\\\" rock!\\r\\n\\r\\n(Outro)\\r\\nTen candles on your cake today\\r\\nMake a wish and lead the way!\\r\\nJeeyo hazaaron saal, yeh hai dua\\r\\nHappy Birthday, Shlok, woo-hoo!\\r\\nYou''re our hero, through and through!\\r\\nHappy, happy, happy birthday to you!\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NzE0Yzc2YTQtNTY4NS00OGZjLWI0ZWQtMTFjNGQ4ZDY0ZDI2.mp3\", \"duration\": 213.12, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NzE0Yzc2YTQtNTY4NS00OGZjLWI0ZWQtMTFjNGQ4ZDY0ZDI2.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755697811377, \"sourceAudioUrl\": \"https://cdn1.suno.ai/714c76a4-5685-48fc-b4ed-11c4d8d64d26.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_714c76a4-5685-48fc-b4ed-11c4d8d64d26.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NzE0Yzc2YTQtNTY4NS00OGZjLWI0ZWQtMTFjNGQ4ZDY0ZDI2\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/714c76a4-5685-48fc-b4ed-11c4d8d64d26.mp3\"}, {\"id\": \"e75a2a7d-3117-47db-833b-132d7c039822\", \"tags\": \"A vibrant and high-energy Indi-Pop/Pop-Rock track. The song should open with an upbeat drum intro and a catchy electric guitar riff. The verses would be driven by a strong bassline and rhythmic guitars, building up to a powerful, anthem-like chorus. Use fun synth melodies in the background, especially during the lines about video games, to add a modern, playful touch.\\r\\n\\r\\nSuggested Vocal Style: A clear, youthful, and energetic male voice would be perfect. The delivery should be enthusiastic and full of joy, making it a track that gets everyone at the party on their feet and singing along.\", \"title\": \"Level Ten Rockstar\", \"prompt\": \"(Verse 1)\\r\\nSuno suno, it''s a special day\\r\\nSaare bolo, hip hip hooray!\\r\\nShor machao, clap your hands\\r\\nAaj party ka hai poora plan!\\r\\nCake bhi hai aur fun bhi hai\\r\\nKyunki Shlok aaj ho gaya ten!\\r\\n\\r\\n(Chorus)\\r\\nHappy Birthday to you, Shlok, O Rockstar!\\r\\nMummy Papa ka tu hi hai shining star!\\r\\nLevel Up hua hai, what a solid block!\\r\\nWelcome to the awesome \\\"Level Ten\\\" rock!\\r\\n\\r\\n(Verse 2)\\r\\nHaath mein leke apni Nerf Gun\\r\\nJeetna hi bas hai tera fun\\r\\nPS ka hero, game ka king\\r\\nHar challenge ko karta hai swing!\\r\\nScreen pe chalti hai teri command\\r\\nBest player in the whole land!\\r\\n\\r\\n(Chorus)\\r\\nHappy Birthday to you, Shlok, O Rockstar!\\r\\nMummy Papa ka tu hi hai shining star!\\r\\nLevel Up hua hai, what a solid block!\\r\\nWelcome to the awesome \\\"Level Ten\\\" rock!\\r\\n\\r\\n(Bridge)\\r\\nMummy Papa ki aankhon ka taara\\r\\nTu unka dulaara, sabse pyaara\\r\\nAur chhota Snitik bhi peechhe aaye\\r\\nThodi masti, dher saara love laaye!\\r\\nKabhi jhagda, kabhi yaari\\r\\nAisi hai yeh rishtedaari!\\r\\n\\r\\n(Chorus)\\r\\nHappy Birthday to you, Shlok, O Rockstar!\\r\\nMummy Papa ka tu hi hai shining star!\\r\\nLevel Up hua hai, what a solid block!\\r\\nWelcome to the awesome \\\"Level Ten\\\" rock!\\r\\n\\r\\n(Outro)\\r\\nTen candles on your cake today\\r\\nMake a wish and lead the way!\\r\\nJeeyo hazaaron saal, yeh hai dua\\r\\nHappy Birthday, Shlok, woo-hoo!\\r\\nYou''re our hero, through and through!\\r\\nHappy, happy, happy birthday to you!\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/ZTc1YTJhN2QtMzExNy00N2RiLTgzM2ItMTMyZDdjMDM5ODIy.mp3\", \"duration\": 195, \"imageUrl\": \"https://apiboxfiles.erweima.ai/ZTc1YTJhN2QtMzExNy00N2RiLTgzM2ItMTMyZDdjMDM5ODIy.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755697811377, \"sourceAudioUrl\": \"https://cdn1.suno.ai/e75a2a7d-3117-47db-833b-132d7c039822.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_e75a2a7d-3117-47db-833b-132d7c039822.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/ZTc1YTJhN2QtMzExNy00N2RiLTgzM2ItMTMyZDdjMDM5ODIy\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/e75a2a7d-3117-47db-833b-132d7c039822.mp3\"}]"'::jsonb,
        '{"0": [{"endS": 13.54103, "word": "(Verse 1)\n\n", "palign": 0, "startS": 13.00532, "success": true}, {"endS": 13.96277, "word": "Suno ", "palign": 0, "startS": 13.57523, "success": true}, {"endS": 14.54787, "word": "suno, ", "palign": 0, "startS": 14.04255, "success": true}, {"endS": 14.76064, "word": "it''s ", "palign": 0, "startS": 14.57447, "success": true}, {"endS": 14.92021, "word": "a ", "palign": 0, "startS": 14.92021, "success": true}, {"endS": 15.47872, "word": "special ", "palign": 0, "startS": 15, "success": true}, {"endS": 16.48936, "word": "day\n\n", "palign": 0, "startS": 15.58511, "success": true}, {"endS": 16.83511, "word": "Saare ", "palign": 0, "startS": 16.54255, "success": true}, {"endS": 17.71277, "word": "bolo, ", "palign": 0, "startS": 16.99468, "success": true}, {"endS": 17.95213, "word": "hip ", "palign": 0, "startS": 17.79255, "success": true}, {"endS": 18.35106, "word": "hip ", "palign": 0, "startS": 18.05851, "success": true}, {"endS": 19.54787, "word": "hooray!\n\n", "palign": 0, "startS": 18.43085, "success": true}, {"endS": 19.86702, "word": "Shor ", "palign": 0, "startS": 19.58777, "success": true}, {"endS": 21.14362, "word": "machao, ", "palign": 0, "startS": 19.86702, "success": true}, {"endS": 21.46277, "word": "clap ", "palign": 0, "startS": 21.2234, "success": true}, {"endS": 21.70213, "word": "your ", "palign": 0, "startS": 21.52261, "success": true}, {"endS": 22.69947, "word": "hands\n\n", "palign": 0, "startS": 21.79787, "success": true}, {"endS": 23.05851, "word": "Aaj ", "palign": 0, "startS": 22.81915, "success": true}, {"endS": 23.69681, "word": "party ", "palign": 0, "startS": 23.16489, "success": true}, {"endS": 23.93617, "word": "ka ", "palign": 0, "startS": 23.81649, "success": true}, {"endS": 24.17553, "word": "hai ", "palign": 0, "startS": 24.01596, "success": true}, {"endS": 24.73404, "word": "poora ", "palign": 0, "startS": 24.29521, "success": true}, {"endS": 25.82447, "word": "plan!\n\n", "palign": 0, "startS": 24.83378, "success": true}, {"endS": 26.09043, "word": "Cake ", "palign": 0, "startS": 25.89096, "success": true}, {"endS": 26.32979, "word": "bhi ", "palign": 0, "startS": 26.17021, "success": true}, {"endS": 26.80851, "word": "hai ", "palign": 0, "startS": 26.44947, "success": true}, {"endS": 27.20745, "word": "aur ", "palign": 0, "startS": 26.91489, "success": true}, {"endS": 27.5266, "word": "fun ", "palign": 0, "startS": 27.36702, "success": true}, {"endS": 27.76596, "word": "bhi ", "palign": 0, "startS": 27.60638, "success": true}, {"endS": 28.27128, "word": "hai\n\n", "palign": 0, "startS": 27.87234, "success": true}, {"endS": 28.7234, "word": "Kyunki ", "palign": 0, "startS": 28.29787, "success": true}, {"endS": 29.12234, "word": "Shlok ", "palign": 0, "startS": 28.7633, "success": true}, {"endS": 29.60106, "word": "aaj ", "palign": 0, "startS": 29.28191, "success": true}, {"endS": 29.92021, "word": "ho ", "palign": 0, "startS": 29.72074, "success": true}, {"endS": 31.75532, "word": "gaya ", "palign": 0, "startS": 30.03989, "success": true}, {"endS": 33.40426, "word": "ten!\n\n(", "palign": 0, "startS": 31.8617, "success": true}, {"endS": 33.92097, "word": "Chorus)\n\n", "palign": 0, "startS": 33.47518, "success": true}, {"endS": 34.14894, "word": "Happy ", "palign": 0, "startS": 33.96657, "success": true}, {"endS": 34.54787, "word": "Birthday ", "palign": 0, "startS": 34.1988, "success": true}, {"endS": 34.78723, "word": "to ", "palign": 0, "startS": 34.66755, "success": true}, {"endS": 35.23936, "word": "you, ", "palign": 0, "startS": 34.89362, "success": true}, {"endS": 35.74468, "word": "Shlok, ", "palign": 0, "startS": 35.29255, "success": true}, {"endS": 35.90426, "word": "O ", "palign": 0, "startS": 35.82447, "success": true}, {"endS": 36.92553, "word": "Rockstar!\n\n", "palign": 0, "startS": 35.90426, "success": true}, {"endS": 37.26064, "word": "Mummy ", "palign": 0, "startS": 36.95745, "success": true}, {"endS": 37.65957, "word": "Papa ", "palign": 0, "startS": 37.36037, "success": true}, {"endS": 37.81915, "word": "ka ", "palign": 0, "startS": 37.73936, "success": true}, {"endS": 38.21809, "word": "tu ", "palign": 0, "startS": 37.93883, "success": true}, {"endS": 38.45745, "word": "hi ", "palign": 0, "startS": 38.33777, "success": true}, {"endS": 38.7766, "word": "hai ", "palign": 0, "startS": 38.56383, "success": true}, {"endS": 39.33511, "word": "shining ", "palign": 0, "startS": 38.85638, "success": true}, {"endS": 40.08739, "word": "star!\n\n", "palign": 0, "startS": 39.43484, "success": true}, {"endS": 40.37234, "word": "Level ", "palign": 0, "startS": 40.14438, "success": true}, {"endS": 40.69149, "word": "Up ", "palign": 0, "startS": 40.49202, "success": true}, {"endS": 41.25, "word": "hua ", "palign": 0, "startS": 40.81117, "success": true}, {"endS": 41.52128, "word": "hai, ", "palign": 0, "startS": 41.32979, "success": true}, {"endS": 41.64894, "word": "what ", "palign": 0, "startS": 41.55319, "success": true}, {"endS": 41.8883, "word": "a ", "palign": 0, "startS": 41.80851, "success": true}, {"endS": 42.44681, "word": "solid ", "palign": 0, "startS": 41.98404, "success": true}, {"endS": 43.14716, "word": "block!\n\n", "palign": 0, "startS": 42.54255, "success": true}, {"endS": 43.64362, "word": "Welcome ", "palign": 0, "startS": 43.21809, "success": true}, {"endS": 43.80319, "word": "to ", "palign": 0, "startS": 43.7234, "success": true}, {"endS": 44.04255, "word": "the ", "palign": 0, "startS": 43.88298, "success": true}, {"endS": 46.13032, "word": "awesome \"", "palign": 0, "startS": 44.16223, "success": true}, {"endS": 46.67553, "word": "Level ", "palign": 0, "startS": 46.2234, "success": true}, {"endS": 47.09043, "word": "Ten\" ", "palign": 0, "startS": 46.78191, "success": true}, {"endS": 53.27793, "word": "rock!\n\n(", "palign": 0, "startS": 47.18617, "success": true}, {"endS": 53.53723, "word": "Verse 2)\n\n", "palign": 0, "startS": 53.29787, "success": true}, {"endS": 53.93617, "word": "Haath ", "palign": 0, "startS": 53.57713, "success": true}, {"endS": 54.09574, "word": "mein ", "palign": 0, "startS": 53.97606, "success": true}, {"endS": 54.49468, "word": "leke ", "palign": 0, "startS": 54.21543, "success": true}, {"endS": 54.89362, "word": "apni ", "palign": 0, "startS": 54.65426, "success": true}, {"endS": 55.45213, "word": "Nerf ", "palign": 0, "startS": 54.9734, "success": true}, {"endS": 56.48936, "word": "Gun\n\n", "palign": 0, "startS": 55.55851, "success": true}, {"endS": 56.96809, "word": "Jeetna ", "palign": 0, "startS": 56.56915, "success": true}, {"endS": 57.20745, "word": "hi ", "palign": 0, "startS": 57.08777, "success": true}, {"endS": 57.60638, "word": "bas ", "palign": 0, "startS": 57.31383, "success": true}, {"endS": 57.92553, "word": "hai ", "palign": 0, "startS": 57.71277, "success": true}, {"endS": 58.48404, "word": "tera ", "palign": 0, "startS": 58.03191, "success": true}, {"endS": 59.30851, "word": "fun\n\n", "palign": 0, "startS": 58.59043, "success": true}, {"endS": 59.84043, "word": "PS ", "palign": 0, "startS": 59.41489, "success": true}, {"endS": 60.15957, "word": "ka ", "palign": 0, "startS": 59.96011, "success": true}, {"endS": 61.10106, "word": "hero, ", "palign": 0, "startS": 60.25931, "success": true}, {"endS": 61.35638, "word": "game ", "palign": 0, "startS": 61.16489, "success": true}, {"endS": 61.51596, "word": "ka ", "palign": 0, "startS": 61.43617, "success": true}, {"endS": 62.29388, "word": "king\n\n", "palign": 0, "startS": 61.61569, "success": true}, {"endS": 62.4734, "word": "Har ", "palign": 0, "startS": 62.35372, "success": true}, {"endS": 63.27128, "word": "challenge ", "palign": 0, "startS": 62.5, "success": true}, {"endS": 63.43085, "word": "ko ", "palign": 0, "startS": 63.32447, "success": true}, {"endS": 64.14894, "word": "karta ", "palign": 0, "startS": 63.43085, "success": true}, {"endS": 64.78723, "word": "hai ", "palign": 0, "startS": 64.25532, "success": true}, {"endS": 65.82447, "word": "swing!\n\n", "palign": 0, "startS": 64.88298, "success": true}, {"endS": 66.06383, "word": "Screen ", "palign": 0, "startS": 65.86436, "success": true}, {"endS": 66.30319, "word": "pe ", "palign": 0, "startS": 66.18351, "success": true}, {"endS": 67.02128, "word": "chalti ", "palign": 0, "startS": 66.38298, "success": true}, {"endS": 67.26064, "word": "hai ", "palign": 0, "startS": 67.10106, "success": true}, {"endS": 67.89894, "word": "teri ", "palign": 0, "startS": 67.34043, "success": true}, {"endS": 68.85638, "word": "command\n\n", "palign": 0, "startS": 67.99012, "success": true}, {"endS": 69.17553, "word": "Best ", "palign": 0, "startS": 68.93617, "success": true}, {"endS": 69.57447, "word": "player ", "palign": 0, "startS": 69.24202, "success": true}, {"endS": 69.73404, "word": "in ", "palign": 0, "startS": 69.65426, "success": true}, {"endS": 69.9734, "word": "the ", "palign": 0, "startS": 69.81383, "success": true}, {"endS": 71.80851, "word": "whole ", "palign": 0, "startS": 70.06915, "success": true}, {"endS": 72.31383, "word": "land!\n\n(", "palign": 0, "startS": 71.86835, "success": true}, {"endS": 73.83739, "word": "Chorus)\n\n", "palign": 0, "startS": 72.40248, "success": true}, {"endS": 74.12234, "word": "Happy ", "palign": 0, "startS": 73.89438, "success": true}, {"endS": 74.60106, "word": "Birthday ", "palign": 0, "startS": 74.18218, "success": true}, {"endS": 74.76064, "word": "to ", "palign": 0, "startS": 74.68085, "success": true}, {"endS": 75.30585, "word": "you, ", "palign": 0, "startS": 74.86702, "success": true}, {"endS": 75.74468, "word": "Shlok, ", "palign": 0, "startS": 75.37234, "success": true}, {"endS": 75.95745, "word": "O ", "palign": 0, "startS": 75.85106, "success": true}, {"endS": 76.89894, "word": "Rockstar!\n\n", "palign": 0, "startS": 75.95745, "success": true}, {"endS": 77.23404, "word": "Mummy ", "palign": 0, "startS": 76.93085, "success": true}, {"endS": 77.63298, "word": "Papa ", "palign": 0, "startS": 77.33378, "success": true}, {"endS": 77.79255, "word": "ka ", "palign": 0, "startS": 77.71277, "success": true}, {"endS": 78.19149, "word": "tu ", "palign": 0, "startS": 77.91223, "success": true}, {"endS": 78.35106, "word": "hi ", "palign": 0, "startS": 78.27128, "su...'::jsonb,
        '{"0":[{"end":19548,"text":"Suno suno, it''s special day Saare bolo, hip hip hooray!","index":1,"start":13375},{"end":25824,"text":"Shor machao, clap your hands Aaj party ka hai poora plan!","index":2,"start":19388},{"end":33404,"text":"Cake bhi hai aur fun bhi hai Kyunki Shlok aaj ho gaya ten! (","index":3,"start":25691},{"end":36926,"text":"Chorus) Happy Birthday to you, Shlok, O Rockstar!","index":4,"start":33275},{"end":40087,"text":"Mummy Papa ka tu hi hai shining star!","index":5,"start":36757},{"end":43147,"text":"Level Up hua hai, what a solid block!","index":6,"start":39944},{"end":53278,"text":"Welcome to the awesome \" Level Ten\" rock! (","index":7,"start":43018},{"end":58484,"text":"Verse 2) Haath mein leke apni Nerf Gun Jeetna hi bas hai tera","index":8,"start":53098},{"end":65824,"text":"fun PS ka hero, game ka king Har challenge ko karta hai swing!","index":9,"start":58390},{"end":72314,"text":"Screen pe chalti hai teri command Best player in the whole land! (","index":10,"start":65664},{"end":76899,"text":"Chorus) Happy Birthday to you, Shlok, O Rockstar!","index":11,"start":72202},{"end":80061,"text":"Mummy Papa ka tu hi hai shining star!","index":12,"start":76731},{"end":83121,"text":"Level Up hua hai, what a solid block!","index":13,"start":79918},{"end":87473,"text":"Welcome to the awesome \" Level Ten\" rock! (","index":14,"start":82991},{"end":108351,"text":"Bridge) Mummy Papa ki aankhon ka taara Tu unka dulaara, sabse","index":15,"start":87362},{"end":120239,"text":"pyaara Aur chhota Snitik bhi peechhe aaye Thodi masti, dher saara","index":16,"start":108231},{"end":123830,"text":"love laaye!","index":17,"start":120159},{"end":130644,"text":"Kabhi jhagda, kabhi yaari Aisi hai yeh rishtedaari! (","index":18,"start":123670},{"end":135383,"text":"Chorus) Happy Birthday to you, Shlok, O Rockstar!","index":19,"start":130531},{"end":138465,"text":"Mummy Papa ka tu hi hai shining star!","index":20,"start":135215},{"end":141587,"text":"Level Up hua hai, what a solid block!","index":21,"start":138322},{"end":151237,"text":"Welcome to the awesome \" Level Ten\" rock! (","index":22,"start":141449},{"end":167074,"text":"Outro) Ten candles on your cake today Make a wish and lead the","index":23,"start":151077},{"end":169029,"text":"way!","index":24,"start":166981},{"end":183303,"text":"Jeeyo hazaaron saal, yeh hai dua Happy Birthday, Shlok, woo-hoo!","index":25,"start":168849},{"end":189757,"text":"You''re our hero, through and through!","index":26,"start":183119},{"end":202739,"text":"Happy, happy, happy birthday to you!","index":27,"start":189648}]}'::jsonb,
        '{"original_id":26,"original_sequence":null,"duration":"213.12","song_url":"https://cdn1.suno.ai/714c76a4-5685-48fc-b4ed-11c4d8d64d26.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"fd53e16633dc0b36940737886d43b052"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Birthday Party'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2025-08-20 13:47:54.133617+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Level Ten Rockstar'
    LIMIT 1;

    -- Song entry for: Gossip Guru Banne Chala CPO
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
        'gossip-guru-banne-chala-cpo',
        'COMPLETED',
        true,
        '"[{\"id\": \"30a6ddca-b173-48eb-8dcf-5ede2c72729a\", \"tags\": \"Desi Hip-Hop / Mumbai Gully Rap. A hard-hitting hip-hop beat with a prominent bassline and a classic boom-bap drum loop. We''ll infuse it with some Indian elements like a subtle, recurring sitar sample or tabla sounds in the background to give it that authentic ''gully'' vibe. The focus is purely on a powerful lyrical delivery over a compelling beat.\\r\\nVocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful.\", \"title\": \"Gossip Guru Banne Chala CPO\", \"prompt\": \"(Intro - Spoken with attitude)\\r\\nYo, yo, mic check...\\r\\nLatest news flash, seedha office ke floor se!\\r\\nApna Product Manager, ab CPO banne ke zor mein!\\r\\nYeah... let''s talk about it.\\r\\n\\r\\n(Verse one)\\r\\nSuno iski story, yeh PM tha shaana,\\r\\nPar iska ek hi sapna, CPO ban jaana!\\r\\nHar meeting mein gyaan, ''The user is king!''\\r\\nAsli user toh tu hai, of gossiping!\\r\\nKehta hai ''I connect with stakeholders well'',\\r\\nBhai, tu sabki personal life ki bajata hai bell!\\r\\n''Empathy map'' banata tha on the screen,\\r\\nPar asli research thi iski, ''who''s dating who'' in the canteen!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Verse two)\\r\\nFinance mein kiska promotion hai pending?\\r\\nSales team mein kiska breakup hai trending?\\r\\nMarketing waalon ki nayi party kidhar hai?\\r\\nApne PM ko sab khabar hai!\\r\\nIski ''networking'' ka style hi alag tha,\\r\\nHar cabin mein iska ek chamcha sanak tha!\\r\\nYeh ''people skills'' ka karta tha poora use,\\r\\nHar gossip ke piece ko banata tha breaking news!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Bridge - Slower, more intense flow)\\r\\nSach bolun, tere network ke aage,\\r\\nSaare LinkedIn connections fail hain dhaage!\\r\\nTu CPO banega, humko hai vishwas,\\r\\nKyunki tere paas hai, har bande ka itihas!\\r\\nNayi company join karke, in your first week,\\r\\nTu wahan ke CEO ki nikaal dega love life ki leak!\\r\\nThat''s your real talent, your master plan,\\r\\nThe People''s PM, the gossip man!\\r\\n\\r\\n(Outro - Spoken, fading out with the beat)\\r\\nSo go on, Mr. Future CPO, jaa lele apni seat.\\r\\nPar yaad rakhna... humein dete rehna har ''internal'' tweet!\\r\\nPeace out. B-Town representing.\\r\\nOver and out.\\r\\n(Mic drop sound)\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/MzBhNmRkY2EtYjE3My00OGViLThkY2YtNWVkZTJjNzI3Mjlh.mp3\", \"duration\": 169.48, \"imageUrl\": \"https://apiboxfiles.erweima.ai/MzBhNmRkY2EtYjE3My00OGViLThkY2YtNWVkZTJjNzI3Mjlh.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755859432559, \"sourceAudioUrl\": \"https://cdn1.suno.ai/30a6ddca-b173-48eb-8dcf-5ede2c72729a.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_30a6ddca-b173-48eb-8dcf-5ede2c72729a.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/MzBhNmRkY2EtYjE3My00OGViLThkY2YtNWVkZTJjNzI3Mjlh\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/30a6ddca-b173-48eb-8dcf-5ede2c72729a.mp3\"}, {\"id\": \"8c02f736-a772-4e5a-9939-236356e7f886\", \"tags\": \"Desi Hip-Hop / Mumbai Gully Rap. A hard-hitting hip-hop beat with a prominent bassline and a classic boom-bap drum loop. We''ll infuse it with some Indian elements like a subtle, recurring sitar sample or tabla sounds in the background to give it that authentic ''gully'' vibe. The focus is purely on a powerful lyrical delivery over a compelling beat.\\r\\nVocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful.\", \"title\": \"Gossip Guru Banne Chala CPO\", \"prompt\": \"(Intro - Spoken with attitude)\\r\\nYo, yo, mic check...\\r\\nLatest news flash, seedha office ke floor se!\\r\\nApna Product Manager, ab CPO banne ke zor mein!\\r\\nYeah... let''s talk about it.\\r\\n\\r\\n(Verse one)\\r\\nSuno iski story, yeh PM tha shaana,\\r\\nPar iska ek hi sapna, CPO ban jaana!\\r\\nHar meeting mein gyaan, ''The user is king!''\\r\\nAsli user toh tu hai, of gossiping!\\r\\nKehta hai ''I connect with stakeholders well'',\\r\\nBhai, tu sabki personal life ki bajata hai bell!\\r\\n''Empathy map'' banata tha on the screen,\\r\\nPar asli research thi iski, ''who''s dating who'' in the canteen!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Verse two)\\r\\nFinance mein kiska promotion hai pending?\\r\\nSales team mein kiska breakup hai trending?\\r\\nMarketing waalon ki nayi party kidhar hai?\\r\\nApne PM ko sab khabar hai!\\r\\nIski ''networking'' ka style hi alag tha,\\r\\nHar cabin mein iska ek chamcha sanak tha!\\r\\nYeh ''people skills'' ka karta tha poora use,\\r\\nHar gossip ke piece ko banata tha breaking news!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Bridge - Slower, more intense flow)\\r\\nSach bolun, tere network ke aage,\\r\\nSaare LinkedIn connections fail hain dhaage!\\r\\nTu CPO banega, humko hai vishwas,\\r\\nKyunki tere paas hai, har bande ka itihas!\\r\\nNayi company join karke, in your first week,\\r\\nTu wahan ke CEO ki nikaal dega love life ki leak!\\r\\nThat''s your real talent, your master plan,\\r\\nThe People''s PM, the gossip man!\\r\\n\\r\\n(Outro - Spoken, fading out with the beat)\\r\\nSo go on, Mr. Future CPO, jaa lele apni seat.\\r\\nPar yaad rakhna... humein dete rehna har ''internal'' tweet!\\r\\nPeace out. B-Town representing.\\r\\nOver and out.\\r\\n(Mic drop sound)\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/OGMwMmY3MzYtYTc3Mi00ZTVhLTk5MzktMjM2MzU2ZTdmODg2.mp3\", \"duration\": 176.16, \"imageUrl\": \"https://apiboxfiles.erweima.ai/OGMwMmY3MzYtYTc3Mi00ZTVhLTk5MzktMjM2MzU2ZTdmODg2.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755859432559, \"sourceAudioUrl\": \"https://cdn1.suno.ai/8c02f736-a772-4e5a-9939-236356e7f886.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_8c02f736-a772-4e5a-9939-236356e7f886.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/OGMwMmY3MzYtYTc3Mi00ZTVhLTk5MzktMjM2MzU2ZTdmODg2\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/8c02f736-a772-4e5a-9939-236356e7f886.mp3\"}]"'::jsonb,
        '{"0": [{"endS": 1.94149, "word": "Yo, ", "palign": 0, "startS": 1.51596, "success": true}, {"endS": 4.32846, "word": "yo, ", "palign": 0, "startS": 2.04787, "success": true}, {"endS": 4.62766, "word": "mic ", "palign": 0, "startS": 4.42819, "success": true}, {"endS": 5.5965, "word": "check...\n\n", "palign": 0, "startS": 4.7234, "success": true}, {"endS": 5.90426, "word": "Latest ", "palign": 0, "startS": 5.6193, "success": true}, {"endS": 6.2234, "word": "news ", "palign": 0, "startS": 5.98404, "success": true}, {"endS": 7.46011, "word": "flash, ", "palign": 0, "startS": 6.2633, "success": true}, {"endS": 7.81915, "word": "seedha ", "palign": 0, "startS": 7.5, "success": true}, {"endS": 8.21809, "word": "office ", "palign": 0, "startS": 7.87234, "success": true}, {"endS": 8.45745, "word": "ke ", "palign": 0, "startS": 8.33777, "success": true}, {"endS": 8.85638, "word": "floor ", "palign": 0, "startS": 8.51064, "success": true}, {"endS": 10.69149, "word": "se!\n\n", "palign": 0, "startS": 8.85638, "success": true}, {"endS": 11.17021, "word": "Apna ", "palign": 0, "startS": 10.73138, "success": true}, {"endS": 11.56915, "word": "Product ", "palign": 0, "startS": 11.17021, "success": true}, {"endS": 13.19149, "word": "Manager, ", "palign": 0, "startS": 11.62234, "success": true}, {"endS": 13.40426, "word": "ab ", "palign": 0, "startS": 13.29787, "success": true}, {"endS": 13.88298, "word": "CPO ", "palign": 0, "startS": 13.56383, "success": true}, {"endS": 14.20213, "word": "banne ", "palign": 0, "startS": 13.93617, "success": true}, {"endS": 14.44149, "word": "ke ", "palign": 0, "startS": 14.32181, "success": true}, {"endS": 14.84043, "word": "zor ", "palign": 0, "startS": 14.54787, "success": true}, {"endS": 16.62234, "word": "mein!\n\n", "palign": 0, "startS": 14.94016, "success": true}, {"endS": 18.47074, "word": "Yeah... ", "palign": 0, "startS": 16.71543, "success": true}, {"endS": 18.67021, "word": "let''s ", "palign": 0, "startS": 18.48404, "success": true}, {"endS": 19.06915, "word": "talk ", "palign": 0, "startS": 18.76995, "success": true}, {"endS": 19.22872, "word": "about ", "palign": 0, "startS": 19.10106, "success": true}, {"endS": 19.58777, "word": "it.\n\n(", "palign": 0, "startS": 19.3484, "success": true}, {"endS": 19.78723, "word": "Verse ", "palign": 0, "startS": 19.62766, "success": true}, {"endS": 20.72872, "word": "one)\n\n", "palign": 0, "startS": 19.89362, "success": true}, {"endS": 20.98404, "word": "Suno ", "palign": 0, "startS": 20.76064, "success": true}, {"endS": 21.38298, "word": "iski ", "palign": 0, "startS": 21.06383, "success": true}, {"endS": 21.74202, "word": "story, ", "palign": 0, "startS": 21.44681, "success": true}, {"endS": 21.8617, "word": "yeh ", "palign": 0, "startS": 21.78191, "success": true}, {"endS": 22.26064, "word": "PM ", "palign": 0, "startS": 22.02128, "success": true}, {"endS": 22.5, "word": "tha ", "palign": 0, "startS": 22.34043, "success": true}, {"endS": 23.07447, "word": "shaana,\n\n", "palign": 0, "startS": 22.53989, "success": true}, {"endS": 23.21809, "word": "Par ", "palign": 0, "startS": 23.12234, "success": true}, {"endS": 23.53723, "word": "iska ", "palign": 0, "startS": 23.29787, "success": true}, {"endS": 23.69681, "word": "ek ", "palign": 0, "startS": 23.61702, "success": true}, {"endS": 23.85638, "word": "hi ", "palign": 0, "startS": 23.7766, "success": true}, {"endS": 24.33511, "word": "sapna, ", "palign": 0, "startS": 23.93617, "success": true}, {"endS": 24.81383, "word": "CPO ", "palign": 0, "startS": 24.41489, "success": true}, {"endS": 25.05319, "word": "ban ", "palign": 0, "startS": 24.89362, "success": true}, {"endS": 25.70745, "word": "jaana!\n\n", "palign": 0, "startS": 25.17287, "success": true}, {"endS": 25.85106, "word": "Har ", "palign": 0, "startS": 25.75532, "success": true}, {"endS": 26.17021, "word": "meeting ", "palign": 0, "startS": 25.89096, "success": true}, {"endS": 26.32979, "word": "mein ", "palign": 0, "startS": 26.21011, "success": true}, {"endS": 26.93617, "word": "gyaan, ", "palign": 0, "startS": 26.40957, "success": true}, {"endS": 27.12766, "word": "''The ", "palign": 0, "startS": 26.98404, "success": true}, {"endS": 27.44681, "word": "user ", "palign": 0, "startS": 27.20745, "success": true}, {"endS": 27.68617, "word": "is ", "palign": 0, "startS": 27.56649, "success": true}, {"endS": 28.08511, "word": "king!''\n\n", "palign": 0, "startS": 27.72606, "success": true}, {"endS": 28.40426, "word": "Asli ", "palign": 0, "startS": 28.16489, "success": true}, {"endS": 28.7234, "word": "user ", "palign": 0, "startS": 28.48404, "success": true}, {"endS": 28.96277, "word": "toh ", "palign": 0, "startS": 28.7633, "success": true}, {"endS": 29.20213, "word": "tu ", "palign": 0, "startS": 29.08245, "success": true}, {"endS": 29.54787, "word": "hai, ", "palign": 0, "startS": 29.28191, "success": true}, {"endS": 29.76064, "word": "of ", "palign": 0, "startS": 29.65426, "success": true}, {"endS": 30.6383, "word": "gossiping!\n\n", "palign": 0, "startS": 29.84043, "success": true}, {"endS": 30.95745, "word": "Kehta ", "palign": 0, "startS": 30.67819, "success": true}, {"endS": 31.2766, "word": "hai ", "palign": 0, "startS": 31.06383, "success": true}, {"endS": 31.67553, "word": "''I ", "palign": 0, "startS": 31.39628, "success": true}, {"endS": 31.91489, "word": "connect ", "palign": 0, "startS": 31.69149, "success": true}, {"endS": 32.23404, "word": "with ", "palign": 0, "startS": 31.99468, "success": true}, {"endS": 32.79255, "word": "stakeholders ", "palign": 0, "startS": 32.26064, "success": true}, {"endS": 33.08511, "word": "well'',\n\n", "palign": 0, "startS": 32.8125, "success": true}, {"endS": 33.24468, "word": "Bhai, ", "palign": 0, "startS": 33.1117, "success": true}, {"endS": 33.35106, "word": "tu ", "palign": 0, "startS": 33.29787, "success": true}, {"endS": 33.75, "word": "sabki ", "palign": 0, "startS": 33.40426, "success": true}, {"endS": 34.22872, "word": "personal ", "palign": 0, "startS": 33.80984, "success": true}, {"endS": 34.46809, "word": "life ", "palign": 0, "startS": 34.28856, "success": true}, {"endS": 34.62766, "word": "ki ", "palign": 0, "startS": 34.54787, "success": true}, {"endS": 35.18617, "word": "bajata ", "palign": 0, "startS": 34.70745, "success": true}, {"endS": 35.34574, "word": "hai ", "palign": 0, "startS": 35.23936, "success": true}, {"endS": 35.6383, "word": "bell!\n\n", "palign": 0, "startS": 35.40559, "success": true}, {"endS": 36.14362, "word": "''Empathy ", "palign": 0, "startS": 35.66489, "success": true}, {"endS": 36.46277, "word": "map'' ", "palign": 0, "startS": 36.17021, "success": true}, {"endS": 36.94149, "word": "banata ", "palign": 0, "startS": 36.56915, "success": true}, {"endS": 37.10106, "word": "tha ", "palign": 0, "startS": 36.99468, "success": true}, {"endS": 37.26064, "word": "on ", "palign": 0, "startS": 37.18085, "success": true}, {"endS": 37.42021, "word": "the ", "palign": 0, "startS": 37.31383, "success": true}, {"endS": 37.88298, "word": "screen,\n\n", "palign": 0, "startS": 37.4867, "success": true}, {"endS": 37.97872, "word": "Par ", "palign": 0, "startS": 37.91489, "success": true}, {"endS": 38.29787, "word": "asli ", "palign": 0, "startS": 38.0984, "success": true}, {"endS": 38.69681, "word": "research ", "palign": 0, "startS": 38.41755, "success": true}, {"endS": 38.85638, "word": "thi ", "palign": 0, "startS": 38.7367, "success": true}, {"endS": 39.1117, "word": "iski, ", "palign": 0, "startS": 38.93617, "success": true}, {"endS": 39.33511, "word": "''who''s ", "palign": 0, "startS": 39.12766, "success": true}, {"endS": 39.65426, "word": "dating ", "palign": 0, "startS": 39.3883, "success": true}, {"endS": 39.86702, "word": "who'' ", "palign": 0, "startS": 39.70745, "success": true}, {"endS": 39.9734, "word": "in ", "palign": 0, "startS": 39.92021, "success": true}, {"endS": 40.21277, "word": "the ", "palign": 0, "startS": 40.05319, "success": true}, {"endS": 41.35638, "word": "canteen!\n\n", "palign": 0, "startS": 40.29255, "success": true}, {"endS": 41.80851, "word": "Roadmap ", "palign": 0, "startS": 41.40957, "success": true}, {"endS": 41.96809, "word": "pe ", "palign": 0, "startS": 41.8883, "success": true}, {"endS": 42.26729, "word": "kam, ", "palign": 0, "startS": 42.04787, "success": true}, {"endS": 42.68617, "word": "logon ", "palign": 0, "startS": 42.32713, "success": true}, {"endS": 42.84574, "word": "pe ", "palign": 0, "startS": 42.76596, "success": true}, {"endS": 43.24468, "word": "dhyaan ", "palign": 0, "startS": 42.92553, "success": true}, {"endS": 43.86702, "word": "zyaada,\n\n", "palign": 0, "startS": 43.32447, "success": true}, {"endS": 43.96277, "word": "Har ", "palign": 0, "startS": 43.89894, "success": true}, {"endS": 44.52128, "word": "department ", "palign": 0, "startS": 44.01596, "success": true}, {"endS": 44.76064, "word": "se ", "palign": 0, "startS": 44.64096, "success": true}, {"endS": 45.15957, "word": "iska ", "palign": 0, "startS": 44.88032, "success": true}, {"endS": 45.39894, "word": "tha ", "palign": 0, "startS": 45.23936, "success": true}, {"endS": 45.71809, "word": "pakka ", "palign": 0, "startS": 45.45213, "success": true}, {"endS": 46.39058, "word": "waada!\n\n\"", "palign": 0, "startS": 45.79787, "success": true}, {"endS": 46.43617, "word": "Main ", "palign": 0, "startS": 46.40198, "success": true}, {"endS": 46.91489, "word": "laaunga ", "palign": 0, "startS": 46.47606, "success": true}, {"endS": 47.53324, "word": "khabar, ", "palign": 0, "startS": 46.96809, "success": true}, {"endS": 47.71277, "word": "tum ", "palign": 0, "startS": 47.59309, "success": true}, {"endS": 48.03191, "word": "dena ", "palign": 0, "startS": 47.79255, "success": true}, {"endS": 48.71011, "word": "masala,\"\n\n", "palign": 0, "startS": 48.1117, "success": true}, {"endS": 48.98936, "word": "Yeh ", "palign": 0, "startS": 48.80319, "success": true}, {"endS": 49.54787, "word": "PM ", "palign": 0, "startS": 49.14894, "success": true}, {"endS": 49.9867, "word": "nahi, ", "palign": 0, "startS": 49.64761, "success": true}, {"endS": 50.34574, "word": "office ", "palign": 0, "startS": 50.0266, "success": true}, {"endS": 50.58511, "word": "ka ", "palign": 0, "startS": 50.42553, "success": true}...'::jsonb,
        '{"0":[{"end":5597,"text":"Yo, yo, mic check...","index":0,"start":1316},{"end":10691,"text":"Latest news flash, seedha office ke floor se!","index":1,"start":5419},{"end":16622,"text":"Apna Product Manager, ab CPO banne ke zor mein!","index":2,"start":10531},{"end":18471,"text":"Yeah...","index":3,"start":16515},{"end":19588,"text":"let''s talk about it. (","index":4,"start":18284},{"end":23856,"text":"Verse one) Suno iski story, yeh PM tha shaana, Par iska ek hi","index":5,"start":19428},{"end":25707,"text":"sapna, CPO ban jaana!","index":6,"start":23736},{"end":28085,"text":"Har meeting mein gyaan, ''The user is king!''","index":7,"start":25555},{"end":30638,"text":"Asli user toh tu hai, of gossiping!","index":8,"start":27965},{"end":33750,"text":"Kehta hai ''I connect with stakeholders well'', Bhai, tu sabki","index":9,"start":30478},{"end":35638,"text":"personal life ki bajata hai bell!","index":10,"start":33610},{"end":39112,"text":"''Empathy map'' banata tha on the screen, Par asli research thi iski,","index":11,"start":35465},{"end":41356,"text":"''who''s dating who'' in the canteen!","index":12,"start":38928},{"end":45399,"text":"Roadmap pe kam, logon pe dhyaan zyaada, Har department se iska tha","index":13,"start":41210},{"end":46391,"text":"pakka waada! \"","index":14,"start":45252},{"end":50585,"text":"Main laaunga khabar, tum dena masala,\" Yeh PM nahi, office ka","index":15,"start":46202},{"end":51846,"text":"news-wala!","index":16,"start":50385},{"end":55532,"text":"Chai pe charcha, coffee pe khulasa, Yeh CPO nahi, banega ''Chief","index":17,"start":51678},{"end":56998,"text":"Gossip Officer'', saala! (","index":18,"start":55385},{"end":69798,"text":"Verse two) Finance mein kiska promotion hai pending?","index":19,"start":56888},{"end":72271,"text":"Sales team mein kiska breakup hai trending?","index":20,"start":69630},{"end":74561,"text":"Marketing waalon ki nayi party kidhar hai?","index":21,"start":72103},{"end":76077,"text":"Apne PM ko sab khabar hai!","index":22,"start":74381},{"end":81303,"text":"Iski ''networking'' ka style hi alag tha, Har cabin mein iska ek","index":23,"start":75977},{"end":82452,"text":"chamcha sanak tha!","index":24,"start":81163},{"end":85851,"text":"Yeh ''people skills'' ka karta tha poora use, Har gossip ke piece ko","index":25,"start":82268},{"end":87872,"text":"banata tha breaking news!","index":26,"start":85757},{"end":91915,"text":"Roadmap pe kam, logon pe dhyaan zyaada, Har department se iska tha","index":27,"start":87726},{"end":92781,"text":"pakka waada! \"","index":28,"start":91768},{"end":96941,"text":"Main laaunga khabar, tum dena masala,\" Yeh PM nahi, office ka","index":29,"start":92604},{"end":98282,"text":"news-wala!","index":30,"start":96841},{"end":101968,"text":"Chai pe charcha, coffee pe khulasa, Yeh CPO nahi, banega ''Chief","index":31,"start":98114},{"end":104362,"text":"Gossip Officer'', saala!","index":32,"start":101848},{"end":112261,"text":"Tu CPO banega, humko hai vishwas, Kyunki tere paas hai, har bande","index":33,"start":104241},{"end":113298,"text":"ka itihas!","index":34,"start":112140},{"end":116729,"text":"Nayi company join karke, in your first week, Tu wahan ke CEO ki","index":35,"start":113138},{"end":118378,"text":"nikaal dega love life ki leak!","index":36,"start":116582},{"end":122633,"text":"That''s your real talent, your master plan, The People''s PM, the","index":37,"start":118204},{"end":134043,"text":"gossip man!","index":38,"start":122513},{"end":135456,"text":"So go on, Mr.","index":39,"start":133922},{"end":137617,"text":"Future CPO, jaa lele apni seat.","index":40,"start":135313},{"end":140705,"text":"Par yaad rakhna...","index":41,"start":137449},{"end":147515,"text":"humein dete rehna har ''internal'' tweet!","index":42,"start":140545},{"end":149481,"text":"Peace out.","index":43,"start":147349},{"end":152660,"text":"B-Town representing.","index":44,"start":149401},{"end":154668,"text":"Over and out. (","index":45,"start":152553},{"end":166995,"text":"Mic drop sound)","index":46,"start":154561}]}'::jsonb,
        '{"original_id":27,"original_sequence":null,"duration":"169.48","song_url":"https://cdn1.suno.ai/30a6ddca-b173-48eb-8dcf-5ede2c72729a.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"741b7e046ce76cca584b1d564eacf297"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Office Farewell','Roast'],
        ARRAY[]::text[],
        true,
        false,
        NULL,
        '2025-08-22 10:42:05.762567+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Gossip Guru Banne Chala CPO'
    LIMIT 1;

    -- Song entry for: Gossip Guru Banne Chala CPO
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
        'gossip-guru-banne-chala-cpo-1',
        'COMPLETED',
        true,
        '"[{\"id\": \"1e7325ba-fb1c-4a8b-9226-aa07912c438a\", \"tags\": \"Desi Hip-Hop / Gully Rap. A raw, energetic hip-hop beat with a deep 808 bassline and a crisp, head-nodding drum loop. The track should have a minimalist vibe, perhaps with a recurring, gritty sitar or shehnai sample in the background to give it an authentic Indian street sound. The focus is purely on a powerful lyrical delivery over a compelling beat.\\r\\nVocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful.\", \"title\": \"Gossip Guru Banne Chala CPO\", \"prompt\": \"(Intro - Spoken with attitude)\\r\\nYo, yo, mic check...\\r\\nLatest news flash, seedha office ke floor se!\\r\\nApna Product Manager, ab CPO banne ke zor mein!\\r\\nYeah... let''s talk about it.\\r\\n\\r\\n(Verse one)\\r\\nSuno iski story, yeh PM tha shaana,\\r\\nPar iska ek hi sapna, CPO ban jaana!\\r\\nHar meeting mein gyaan, ''The user is king!''\\r\\nAsli user toh tu hai, of gossiping!\\r\\nKehta hai ''I connect with stakeholders well'',\\r\\nBhai, tu sabke professional life ki bajata hai bell!\\r\\n''Empathy map'' banata tha on the screen,\\r\\nAsli research thi iski, ''kis team mein ban raha hai naya scene''!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Verse two)\\r\\nFinance mein kiska promotion hai pending?\\r\\nSales team mein kiska target hai ending?\\r\\nMarketing waalon ki nayi party kidhar hai?\\r\\nApne PM ko sab khabar hai!\\r\\nYeh meeting mein aata tha info lene,\\r\\nPresentation pe nahi, logon ke chehre dekhne!\\r\\nYeh ''people skills'' ka karta tha poora use,\\r\\nHar gossip ke piece ko banata tha breaking news!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Bridge - Slower, more intense flow)\\r\\nSach bolun, tere network ke aage,\\r\\nSaare LinkedIn connections fail hain dhaage!\\r\\nTu CPO banega, humko hai vishwas,\\r\\nKyunki tere paas hai, har bande ka itihas!\\r\\nNayi company join karke, in your first week,\\r\\nTu wahan ke power politics ko kar dega leak!\\r\\nThat''s your real talent, your master plan,\\r\\nThe People''s PM, the gossip man!\\r\\n\\r\\n(Outro - Beat softens slightly, flow becomes more conversational)\\r\\nChal jaa, Mr. Future CPO, jaa lele apni seat.\\r\\nYeh office ab soona lagega, the grapevine will miss a beat.\\r\\nSeriously man, aakhri baar, kai bolto?\\r\\nJokes apart, you''ll be missed. Ab jaa, jeet lo!\\r\\nPeace out.\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/MWU3MzI1YmEtZmIxYy00YThiLTkyMjYtYWEwNzkxMmM0Mzhh.mp3\", \"duration\": 165, \"imageUrl\": \"https://apiboxfiles.erweima.ai/MWU3MzI1YmEtZmIxYy00YThiLTkyMjYtYWEwNzkxMmM0Mzhh.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755859982703, \"sourceAudioUrl\": \"https://cdn1.suno.ai/1e7325ba-fb1c-4a8b-9226-aa07912c438a.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_1e7325ba-fb1c-4a8b-9226-aa07912c438a.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/MWU3MzI1YmEtZmIxYy00YThiLTkyMjYtYWEwNzkxMmM0Mzhh\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/1e7325ba-fb1c-4a8b-9226-aa07912c438a.mp3\"}, {\"id\": \"bdf8f5e8-9c96-483a-ac01-0b64461a96e5\", \"tags\": \"Desi Hip-Hop / Gully Rap. A raw, energetic hip-hop beat with a deep 808 bassline and a crisp, head-nodding drum loop. The track should have a minimalist vibe, perhaps with a recurring, gritty sitar or shehnai sample in the background to give it an authentic Indian street sound. The focus is purely on a powerful lyrical delivery over a compelling beat.\\r\\nVocals: A confident, rhythmic rap delivery with a clear ''Mumbaikar'' accent and attitude. The flow should be dynamic, switching up speed and cadence between verses and the chorus to keep it engaging and impactful.\", \"title\": \"Gossip Guru Banne Chala CPO\", \"prompt\": \"(Intro - Spoken with attitude)\\r\\nYo, yo, mic check...\\r\\nLatest news flash, seedha office ke floor se!\\r\\nApna Product Manager, ab CPO banne ke zor mein!\\r\\nYeah... let''s talk about it.\\r\\n\\r\\n(Verse one)\\r\\nSuno iski story, yeh PM tha shaana,\\r\\nPar iska ek hi sapna, CPO ban jaana!\\r\\nHar meeting mein gyaan, ''The user is king!''\\r\\nAsli user toh tu hai, of gossiping!\\r\\nKehta hai ''I connect with stakeholders well'',\\r\\nBhai, tu sabke professional life ki bajata hai bell!\\r\\n''Empathy map'' banata tha on the screen,\\r\\nAsli research thi iski, ''kis team mein ban raha hai naya scene''!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Verse two)\\r\\nFinance mein kiska promotion hai pending?\\r\\nSales team mein kiska target hai ending?\\r\\nMarketing waalon ki nayi party kidhar hai?\\r\\nApne PM ko sab khabar hai!\\r\\nYeh meeting mein aata tha info lene,\\r\\nPresentation pe nahi, logon ke chehre dekhne!\\r\\nYeh ''people skills'' ka karta tha poora use,\\r\\nHar gossip ke piece ko banata tha breaking news!\\r\\n\\r\\n(Chorus - Fast and punchy)\\r\\nRoadmap pe kam, logon pe dhyaan zyaada,\\r\\nHar department se iska tha pakka waada!\\r\\n\\\"Main laaunga khabar, tum dena masala,\\\"\\r\\nYeh PM nahi, office ka news-wala!\\r\\nChai pe charcha, coffee pe khulasa,\\r\\nYeh CPO nahi, banega ''Chief Gossip Officer'', saala!\\r\\n\\r\\n(Bridge - Slower, more intense flow)\\r\\nSach bolun, tere network ke aage,\\r\\nSaare LinkedIn connections fail hain dhaage!\\r\\nTu CPO banega, humko hai vishwas,\\r\\nKyunki tere paas hai, har bande ka itihas!\\r\\nNayi company join karke, in your first week,\\r\\nTu wahan ke power politics ko kar dega leak!\\r\\nThat''s your real talent, your master plan,\\r\\nThe People''s PM, the gossip man!\\r\\n\\r\\n(Outro - Beat softens slightly, flow becomes more conversational)\\r\\nChal jaa, Mr. Future CPO, jaa lele apni seat.\\r\\nYeh office ab soona lagega, the grapevine will miss a beat.\\r\\nSeriously man, aakhri baar, kai bolto?\\r\\nJokes apart, you''ll be missed. Ab jaa, jeet lo!\\r\\nPeace out.\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/YmRmOGY1ZTgtOWM5Ni00ODNhLWFjMDEtMGI2NDQ2MWE5NmU1.mp3\", \"duration\": 152.44, \"imageUrl\": \"https://apiboxfiles.erweima.ai/YmRmOGY1ZTgtOWM5Ni00ODNhLWFjMDEtMGI2NDQ2MWE5NmU1.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1755859982703, \"sourceAudioUrl\": \"https://cdn1.suno.ai/bdf8f5e8-9c96-483a-ac01-0b64461a96e5.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_bdf8f5e8-9c96-483a-ac01-0b64461a96e5.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/YmRmOGY1ZTgtOWM5Ni00ODNhLWFjMDEtMGI2NDQ2MWE5NmU1\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/bdf8f5e8-9c96-483a-ac01-0b64461a96e5.mp3\"}]"'::jsonb,
        '{"1": [{"endS": 0.58511, "word": "Yo, ", "palign": 0, "startS": 0.15957, "success": true}, {"endS": 0.85771, "word": "yo, ", "palign": 0, "startS": 0.69149, "success": true}, {"endS": 1.03723, "word": "mic ", "palign": 0, "startS": 0.91755, "success": true}, {"endS": 10.58511, "word": "check...\n\n", "palign": 0, "startS": 1.13298, "success": true}, {"endS": 10.95745, "word": "Yo, ", "palign": 0, "startS": 10.67819, "success": true}, {"endS": 11.5492, "word": "yo, ", "palign": 0, "startS": 11.06383, "success": true}, {"endS": 11.72872, "word": "mic ", "palign": 0, "startS": 11.60904, "success": true}, {"endS": 12.13906, "word": "check...\n\n", "palign": 0, "startS": 11.79255, "success": true}, {"endS": 12.44681, "word": "Latest ", "palign": 0, "startS": 12.16185, "success": true}, {"endS": 12.76596, "word": "news ", "palign": 0, "startS": 12.5266, "success": true}, {"endS": 13.2766, "word": "flash, ", "palign": 0, "startS": 12.80585, "success": true}, {"endS": 13.64362, "word": "seedha ", "palign": 0, "startS": 13.30851, "success": true}, {"endS": 14.04255, "word": "office ", "palign": 0, "startS": 13.69681, "success": true}, {"endS": 14.28191, "word": "ke ", "palign": 0, "startS": 14.16223, "success": true}, {"endS": 14.52128, "word": "floor ", "palign": 0, "startS": 14.32979, "success": true}, {"endS": 15.75798, "word": "se!\n\n", "palign": 0, "startS": 14.64096, "success": true}, {"endS": 16.03723, "word": "Apna ", "palign": 0, "startS": 15.81782, "success": true}, {"endS": 16.51596, "word": "Product ", "palign": 0, "startS": 16.08511, "success": true}, {"endS": 17.15426, "word": "Manager, ", "palign": 0, "startS": 16.56915, "success": true}, {"endS": 17.31383, "word": "ab ", "palign": 0, "startS": 17.23404, "success": true}, {"endS": 17.87234, "word": "CPO ", "palign": 0, "startS": 17.4734, "success": true}, {"endS": 18.35106, "word": "banne ", "palign": 0, "startS": 17.95213, "success": true}, {"endS": 18.51064, "word": "ke ", "palign": 0, "startS": 18.43085, "success": true}, {"endS": 18.82979, "word": "zor ", "palign": 0, "startS": 18.67021, "success": true}, {"endS": 19.52128, "word": "mein!\n\n", "palign": 0, "startS": 18.92952, "success": true}, {"endS": 19.82713, "word": "Yeah... ", "palign": 0, "startS": 19.58777, "success": true}, {"endS": 20.0266, "word": "let''s ", "palign": 0, "startS": 19.84043, "success": true}, {"endS": 20.34574, "word": "talk ", "palign": 0, "startS": 20.10638, "success": true}, {"endS": 20.50532, "word": "about ", "palign": 0, "startS": 20.37766, "success": true}, {"endS": 20.64495, "word": "it.\n\n(", "palign": 0, "startS": 20.54521, "success": true}, {"endS": 20.74468, "word": "Verse ", "palign": 0, "startS": 20.66489, "success": true}, {"endS": 20.96809, "word": "one)\n\n", "palign": 0, "startS": 20.79787, "success": true}, {"endS": 21.2234, "word": "Suno ", "palign": 0, "startS": 21, "success": true}, {"endS": 21.54255, "word": "iski ", "palign": 0, "startS": 21.30319, "success": true}, {"endS": 21.8883, "word": "story, ", "palign": 0, "startS": 21.60638, "success": true}, {"endS": 22.18085, "word": "yeh ", "palign": 0, "startS": 21.91489, "success": true}, {"endS": 22.57979, "word": "PM ", "palign": 0, "startS": 22.34043, "success": true}, {"endS": 22.73936, "word": "tha ", "palign": 0, "startS": 22.63298, "success": true}, {"endS": 23.20213, "word": "shaana,\n\n", "palign": 0, "startS": 22.81915, "success": true}, {"endS": 23.29787, "word": "Par ", "palign": 0, "startS": 23.23404, "success": true}, {"endS": 23.61702, "word": "iska ", "palign": 0, "startS": 23.37766, "success": true}, {"endS": 23.69681, "word": "ek ", "palign": 0, "startS": 23.65691, "success": true}, {"endS": 23.93617, "word": "hi ", "palign": 0, "startS": 23.7766, "success": true}, {"endS": 24.41489, "word": "sapna, ", "palign": 0, "startS": 24.01596, "success": true}, {"endS": 24.89362, "word": "CPO ", "palign": 0, "startS": 24.49468, "success": true}, {"endS": 25.21277, "word": "ban ", "palign": 0, "startS": 25, "success": true}, {"endS": 25.70745, "word": "jaana!\n\n", "palign": 0, "startS": 25.29255, "success": true}, {"endS": 25.85106, "word": "Har ", "palign": 0, "startS": 25.75532, "success": true}, {"endS": 26.25, "word": "meeting ", "palign": 0, "startS": 25.89096, "success": true}, {"endS": 26.40957, "word": "mein ", "palign": 0, "startS": 26.28989, "success": true}, {"endS": 26.76862, "word": "gyaan, ", "palign": 0, "startS": 26.48936, "success": true}, {"endS": 27.04787, "word": "''The ", "palign": 0, "startS": 26.8883, "success": true}, {"endS": 27.44681, "word": "user ", "palign": 0, "startS": 27.12766, "success": true}, {"endS": 27.60638, "word": "is ", "palign": 0, "startS": 27.5266, "success": true}, {"endS": 27.97872, "word": "king!''\n\n", "palign": 0, "startS": 27.62633, "success": true}, {"endS": 28.24468, "word": "Asli ", "palign": 0, "startS": 28.03191, "success": true}, {"endS": 28.56383, "word": "user ", "palign": 0, "startS": 28.32447, "success": true}, {"endS": 28.7234, "word": "toh ", "palign": 0, "startS": 28.60372, "success": true}, {"endS": 28.88298, "word": "tu ", "palign": 0, "startS": 28.80319, "success": true}, {"endS": 29.33511, "word": "hai, ", "palign": 0, "startS": 28.98936, "success": true}, {"endS": 29.44149, "word": "of ", "palign": 0, "startS": 29.3883, "success": true}, {"endS": 32.89894, "word": "gossiping!\n\n", "palign": 0, "startS": 29.60106, "success": true}, {"endS": 33.08511, "word": "Bhai, ", "palign": 0, "startS": 32.95213, "success": true}, {"endS": 33.19149, "word": "tu ", "palign": 0, "startS": 33.1383, "success": true}, {"endS": 33.51064, "word": "sabke ", "palign": 0, "startS": 33.24468, "success": true}, {"endS": 34.14894, "word": "professional ", "palign": 0, "startS": 33.55053, "success": true}, {"endS": 34.30851, "word": "life ", "palign": 0, "startS": 34.18883, "success": true}, {"endS": 34.46809, "word": "ki ", "palign": 0, "startS": 34.3883, "success": true}, {"endS": 34.86702, "word": "bajata ", "palign": 0, "startS": 34.54787, "success": true}, {"endS": 34.94681, "word": "hai ", "palign": 0, "startS": 34.89362, "success": true}, {"endS": 35.15957, "word": "bell!\n\n", "palign": 0, "startS": 34.9867, "success": true}, {"endS": 35.74468, "word": "''Empathy ", "palign": 0, "startS": 35.18617, "success": true}, {"endS": 36.06383, "word": "map'' ", "palign": 0, "startS": 35.82447, "success": true}, {"endS": 36.62234, "word": "banata ", "palign": 0, "startS": 36.17021, "success": true}, {"endS": 36.8617, "word": "tha ", "palign": 0, "startS": 36.70213, "success": true}, {"endS": 37.02128, "word": "on ", "palign": 0, "startS": 36.94149, "success": true}, {"endS": 37.18085, "word": "the ", "palign": 0, "startS": 37.07447, "success": true}, {"endS": 37.53989, "word": "screen,\n\n", "palign": 0, "startS": 37.22074, "success": true}, {"endS": 37.81915, "word": "Asli ", "palign": 0, "startS": 37.59973, "success": true}, {"endS": 38.1383, "word": "research ", "palign": 0, "startS": 37.89894, "success": true}, {"endS": 38.29787, "word": "thi ", "palign": 0, "startS": 38.17819, "success": true}, {"endS": 38.56383, "word": "iski, ", "palign": 0, "startS": 38.33777, "success": true}, {"endS": 38.69681, "word": "''kis ", "palign": 0, "startS": 38.59043, "success": true}, {"endS": 38.85638, "word": "team ", "palign": 0, "startS": 38.69681, "success": true}, {"endS": 39.01596, "word": "mein ", "palign": 0, "startS": 38.89628, "success": true}, {"endS": 39.17553, "word": "ban ", "palign": 0, "startS": 39.06915, "success": true}, {"endS": 39.49468, "word": "raha ", "palign": 0, "startS": 39.25532, "success": true}, {"endS": 39.65426, "word": "hai ", "palign": 0, "startS": 39.54787, "success": true}, {"endS": 39.9734, "word": "naya ", "palign": 0, "startS": 39.73404, "success": true}, {"endS": 40.37234, "word": "scene''!\n\n", "palign": 0, "startS": 39.9734, "success": true}, {"endS": 40.77128, "word": "Roadmap ", "palign": 0, "startS": 40.41223, "success": true}, {"endS": 40.93085, "word": "pe ", "palign": 0, "startS": 40.85106, "success": true}, {"endS": 41.28989, "word": "kam, ", "palign": 0, "startS": 41.03723, "success": true}, {"endS": 41.56915, "word": "logon ", "palign": 0, "startS": 41.32979, "success": true}, {"endS": 41.72872, "word": "pe ", "palign": 0, "startS": 41.64894, "success": true}, {"endS": 42.12766, "word": "dhyaan ", "palign": 0, "startS": 41.80851, "success": true}, {"endS": 42.70213, "word": "zyaada,\n\n", "palign": 0, "startS": 42.20745, "success": true}, {"endS": 42.84574, "word": "Har ", "palign": 0, "startS": 42.75, "success": true}, {"endS": 43.48404, "word": "department ", "palign": 0, "startS": 42.89894, "success": true}, {"endS": 43.64362, "word": "se ", "palign": 0, "startS": 43.56383, "success": true}, {"endS": 44.04255, "word": "iska ", "palign": 0, "startS": 43.7633, "success": true}, {"endS": 44.20213, "word": "tha ", "palign": 0, "startS": 44.09574, "success": true}, {"endS": 44.52128, "word": "pakka ", "palign": 0, "startS": 44.25532, "success": true}, {"endS": 45.26216, "word": "waada!\n\n\"", "palign": 0, "startS": 44.60106, "success": true}, {"endS": 45.39894, "word": "Main ", "palign": 0, "startS": 45.29635, "success": true}, {"endS": 45.87766, "word": "laaunga ", "palign": 0, "startS": 45.43883, "success": true}, {"endS": 46.33644, "word": "khabar, ", "palign": 0, "startS": 45.93085, "success": true}, {"endS": 46.51596, "word": "tum ", "palign": 0, "startS": 46.39628, "success": true}, {"endS": 46.83511, "word": "dena ", "palign": 0, "startS": 46.59574, "success": true}, {"endS": 47.75266, "word": "masala,\"\n\n", "palign": 0, "startS": 46.91489, "success": true}, {"endS": 47.87234, "word": "Yeh ", "palign": 0, "startS": 47.79255, "success": true}, {"endS": 48.27128, "word": "PM ", "palign": 0, "startS": 48.03191, "success": true}, {"endS": 48.55053, "word": "nahi, ", "palign": 0, "startS": 48.33112, "success": true}, {"endS": 48.90957, "word": "office ", "palign": 0, "startS": 48.59043, "success": true}, {"endS": 49.06915, "word": "ka ", "palign": 0, "startS": 48.98936, "success": true}, {"endS": 50.48936, "word": "news-wala!\n\n", "palign": 0, "startS": 49.16888, "success": true}, {"endS": 50.74468, "word": "Chai ", "palign": 0, "startS": 50.52128, "s...'::jsonb,
        '{"0":[{"end":10585,"text":"Yo, yo, mic check...","index":0,"start":-40},{"end":12139,"text":"Yo, yo, mic check...","index":1,"start":10478},{"end":15758,"text":"Latest news flash, seedha office ke floor se!","index":2,"start":11962},{"end":19521,"text":"Apna Product Manager, ab CPO banne ke zor mein!","index":3,"start":15618},{"end":19827,"text":"Yeah...","index":4,"start":19388},{"end":20645,"text":"let''s talk about it. (","index":5,"start":19640},{"end":23936,"text":"Verse one) Suno iski story, yeh PM tha shaana, Par iska ek hi","index":6,"start":20465},{"end":25707,"text":"sapna, CPO ban jaana!","index":7,"start":23816},{"end":27979,"text":"Har meeting mein gyaan, ''The user is king!''","index":8,"start":25555},{"end":32899,"text":"Asli user toh tu hai, of gossiping!","index":9,"start":27832},{"end":35160,"text":"Bhai, tu sabke professional life ki bajata hai bell!","index":10,"start":32752},{"end":38564,"text":"''Empathy map'' banata tha on the screen, Asli research thi iski,","index":11,"start":34986},{"end":40372,"text":"''kis team mein ban raha hai naya scene''!","index":12,"start":38390},{"end":44202,"text":"Roadmap pe kam, logon pe dhyaan zyaada, Har department se iska tha","index":13,"start":40212},{"end":45262,"text":"pakka waada! \"","index":14,"start":44055},{"end":49069,"text":"Main laaunga khabar, tum dena masala,\" Yeh PM nahi, office ka","index":15,"start":45096},{"end":50489,"text":"news-wala!","index":16,"start":48969},{"end":53936,"text":"Chai pe charcha, coffee pe khulasa, Yeh CPO nahi, banega ''Chief","index":17,"start":50321},{"end":57399,"text":"Gossip Officer'', saala!","index":18,"start":53816},{"end":64747,"text":"Marketing waalon ki nayi party kidhar hai?","index":19,"start":57295},{"end":66766,"text":"Apne PM ko sab khabar hai!","index":20,"start":64607},{"end":70851,"text":"Yeh meeting mein aata tha info lene, Presentation pe nahi, logon ke","index":21,"start":66598},{"end":71633,"text":"chehre dekhne!","index":22,"start":70678},{"end":75319,"text":"Yeh ''people skills'' ka karta tha poora use, Har gossip ke piece ko","index":23,"start":71465},{"end":77021,"text":"banata tha breaking news!","index":24,"start":75226},{"end":80904,"text":"Roadmap pe kam, logon pe dhyaan zyaada, Har department se iska tha","index":25,"start":76874},{"end":82010,"text":"pakka waada! \"","index":26,"start":80757},{"end":85851,"text":"Main laaunga khabar, tum dena masala,\" Yeh PM nahi, office ka","index":27,"start":81833},{"end":87223,"text":"news-wala!","index":28,"start":85731},{"end":90718,"text":"Chai pe charcha, coffee pe khulasa, Yeh CPO nahi, banega ''Chief","index":29,"start":87071},{"end":101529,"text":"Gossip Officer'', saala!","index":30,"start":90598},{"end":105718,"text":"Sach bolun, tere network ke aage, Saare LinkedIn connections fail","index":31,"start":101349},{"end":106516,"text":"hain dhaage!","index":32,"start":105558},{"end":110106,"text":"Tu CPO banega, humko hai vishwas, Kyunki tere paas hai, har bande","index":33,"start":106356},{"end":111287,"text":"ka itihas!","index":34,"start":109986},{"end":114734,"text":"Nayi company join karke, in your first week, Tu wahan ke power","index":35,"start":111119},{"end":116117,"text":"politics ko kar dega leak!","index":36,"start":114582},{"end":120080,"text":"That''s your real talent, your master plan, The People''s PM, the","index":37,"start":115930},{"end":120750,"text":"gossip man!","index":38,"start":119960},{"end":122713,"text":"Chal jaa, Mr.","index":39,"start":120566},{"end":126144,"text":"Future CPO, jaa lele apni seat.","index":40,"start":122593},{"end":130638,"text":"Yeh office ab soona lagega, the grapevine will miss a beat.","index":41,"start":125984},{"end":133069,"text":"Seriously man, aakhri baar, kai bolto?","index":42,"start":130491},{"end":134628,"text":"Jokes apart, you''ll be missed.","index":43,"start":132901},{"end":138237,"text":"Ab jaa, jeet lo!","index":44,"start":134534},{"end":138910,"text":"Peace out.","index":45,"start":138060}]}'::jsonb,
        '{"original_id":28,"original_sequence":null,"duration":"152.44","song_url":"https://cdn1.suno.ai/bdf8f5e8-9c96-483a-ac01-0b64461a96e5.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"ddc0f02bc7b1d7d1b1fa89398d80898c"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Farewell Speech','Office farewell','Friend Roasting'],
        ARRAY[]::text[],
        true,
        false,
        1,
        '2025-08-22 10:51:27.255071+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Gossip Guru Banne Chala CPO'
    LIMIT 1;

    -- Song entry for: Shehar Hila De
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
        'shehar-hila-de-2',
        'COMPLETED',
        true,
        '"[{\"id\": \"78df5b9b-6168-4524-81c0-969adee3073a\", \"tags\": \"This is a High-Octane Punjabi Hip-Hop & EDM track. The song kicks off with a catchy electronic synth hook that quickly blends with a heavy, thumping dhol beat and a deep 808 bassline, creating an irresistible urge to dance. The tempo is fast and energetic (around 130 BPM). The verses have a cool, rhythmic flow, leading into a powerful, anthemic chorus with a massive beat drop, perfect for a club or a house party. The bridge switches to a slightly grittier hip-hop beat to spotlight the rap section.\\r\\n\\r\\nVoice Recommendation: The ideal voice for this song is a powerful and energetic male vocalist with a bit of a rustic, swag-filled texture. Think of someone who can rap with attitude and sing the chorus with full power to hype up the crowd.\", \"title\": \"Shehar Hila De\", \"prompt\": \"(Intro)\\r\\n(Music starts with a synth riser and a building dhol beat)\\r\\nYo! DJ, drop the beat!\\r\\nLet''s go!\\r\\n\\r\\n(Verse 1)\\r\\nRaat abhi baaki hai, plans ho gaye set\\r\\nSaari gaadiyan ready, no time for regret\\r\\nPhone pe phone bajte, \\\"Bhai, kidhar hai tu?\\\"\\r\\nApna adda fix hai, milta wahi crew\\r\\n\\r\\n(Pre-Chorus)\\r\\nEk ka call aaye, toh saare aate hain\\r\\nDushman jo dekhe, side ho jaate hain\\r\\nSpeaker ka volume full kar de, bhai\\r\\nEntry aisi lenge, mach jaayegi tabaahi!\\r\\n\\r\\n(Chorus)\\r\\nOye jab bhi hum aate hain, floor hila de!\\r\\nYaaron ki yaari se, shehar hila de!\\r\\nBeat aisi bajti hai, dil yeh dila de!\\r\\nAwaaz upar karke, sabko hila de!\\r\\n\\r\\n(Post-Chorus Beat Drop)\\r\\n(Heavy instrumental with vocal chops: \\\"Hey! Ho! Hila De!\\\")\\r\\n\\r\\n(Verse 2)\\r\\nLightein hain dim, par apni vibe hai bright\\r\\nJahan kadam rakhte, spot ho jaati light\\r\\nKoi tension nahi hai, na koi hai fikar\\r\\nBas masti on hai, aur yaaron ka zikar\\r\\n\\r\\n(Pre-Chorus)\\r\\nEk ka call aaye, toh saare aate hain\\r\\nDushman jo dekhe, side ho jaate hain\\r\\nSpeaker ka volume full kar de, bhai\\r\\nEntry aisi lenge, mach jaayegi tabaahi!\\r\\n\\r\\n(Chorus)\\r\\nOye jab bhi hum aate hain, floor hila de!\\r\\nYaaron ki yaari se, shehar hila de!\\r\\nBeat aisi bajti hai, dil yeh dila de!\\r\\nAwaaz upar karke, sabko hila de!\\r\\n\\r\\n(Rap Bridge)\\r\\n(Beat switches to a trap/hip-hop rhythm)\\r\\nYeah! Mic check... Suno!\\r\\nBaarah khiladi, game mein hain on fire\\r\\nApni yaari ka, alag hi empire\\r\\nStart karein Gaurav, machata hai shor ab\\r\\nUske jaisa cool, hai apna Saurabh\\r\\nNaam hi kaafi hai, entry maare Shiv\\r\\nDekh ke jisko sab kahen \\\"What a look!\\\", woh Aloke\\r\\nApna Rajan bhai, dilon pe karta raaj\\r\\nAur humesha jeetein, yeh Jiten ka andaaz\\r\\nEnergy ko push kare, hai apna Pratyush\\r\\nSaath mein hai Shivam, toh hum hain khush\\r\\nSabki jeet pakki, jab khele Vineet\\r\\nHar baazi apni, yeh hai Vijay ki reet\\r\\nNaam mein hi Shankar, hai Jaishankar ki dahaad\\r\\nAur saath mein Biren, yaaron ka hai pahaad!\\r\\n(Yeah! That''s the crew!)\\r\\n\\r\\n(Chorus)\\r\\n(Music explodes back with full energy)\\r\\nOye jab bhi hum aate hain, floor hila de!\\r\\nYaaron ki yaari se, shehar hila de!\\r\\nBeat aisi bajti hai, dil yeh dila de!\\r\\nAwaaz upar karke, sabko hila de!\\r\\n\\r\\n(Outro)\\r\\nShehar Hila De!\\r\\n(Yeah!)\\r\\nYaaron Ki Vibe Hai!\\r\\n(Haha!)\\r\\n(Music fades out with the main synth hook and a final, echoing dhol hit)\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.mp3\", \"duration\": 181.88, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1756555316725, \"sourceAudioUrl\": \"https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_78df5b9b-6168-4524-81c0-969adee3073a.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NzhkZjViOWItNjE2OC00NTI0LTgxYzAtOTY5YWRlZTMwNzNh\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3\"}, {\"id\": \"980396fc-b213-4112-a903-419a3d1a9dc3\", \"tags\": \"This is a High-Octane Punjabi Hip-Hop & EDM track. The song kicks off with a catchy electronic synth hook that quickly blends with a heavy, thumping dhol beat and a deep 808 bassline, creating an irresistible urge to dance. The tempo is fast and energetic (around 130 BPM). The verses have a cool, rhythmic flow, leading into a powerful, anthemic chorus with a massive beat drop, perfect for a club or a house party. The bridge switches to a slightly grittier hip-hop beat to spotlight the rap section.\\r\\n\\r\\nVoice Recommendation: The ideal voice for this song is a powerful and energetic male vocalist with a bit of a rustic, swag-filled texture. Think of someone who can rap with attitude and sing the chorus with full power to hype up the crowd.\", \"title\": \"Shehar Hila De\", \"prompt\": \"(Intro)\\r\\n(Music starts with a synth riser and a building dhol beat)\\r\\nYo! DJ, drop the beat!\\r\\nLet''s go!\\r\\n\\r\\n(Verse 1)\\r\\nRaat abhi baaki hai, plans ho gaye set\\r\\nSaari gaadiyan ready, no time for regret\\r\\nPhone pe phone bajte, \\\"Bhai, kidhar hai tu?\\\"\\r\\nApna adda fix hai, milta wahi crew\\r\\n\\r\\n(Pre-Chorus)\\r\\nEk ka call aaye, toh saare aate hain\\r\\nDushman jo dekhe, side ho jaate hain\\r\\nSpeaker ka volume full kar de, bhai\\r\\nEntry aisi lenge, mach jaayegi tabaahi!\\r\\n\\r\\n(Chorus)\\r\\nOye jab bhi hum aate hain, floor hila de!\\r\\nYaaron ki yaari se, shehar hila de!\\r\\nBeat aisi bajti hai, dil yeh dila de!\\r\\nAwaaz upar karke, sabko hila de!\\r\\n\\r\\n(Post-Chorus Beat Drop)\\r\\n(Heavy instrumental with vocal chops: \\\"Hey! Ho! Hila De!\\\")\\r\\n\\r\\n(Verse 2)\\r\\nLightein hain dim, par apni vibe hai bright\\r\\nJahan kadam rakhte, spot ho jaati light\\r\\nKoi tension nahi hai, na koi hai fikar\\r\\nBas masti on hai, aur yaaron ka zikar\\r\\n\\r\\n(Pre-Chorus)\\r\\nEk ka call aaye, toh saare aate hain\\r\\nDushman jo dekhe, side ho jaate hain\\r\\nSpeaker ka volume full kar de, bhai\\r\\nEntry aisi lenge, mach jaayegi tabaahi!\\r\\n\\r\\n(Chorus)\\r\\nOye jab bhi hum aate hain, floor hila de!\\r\\nYaaron ki yaari se, shehar hila de!\\r\\nBeat aisi bajti hai, dil yeh dila de!\\r\\nAwaaz upar karke, sabko hila de!\\r\\n\\r\\n(Rap Bridge)\\r\\n(Beat switches to a trap/hip-hop rhythm)\\r\\nYeah! Mic check... Suno!\\r\\nBaarah khiladi, game mein hain on fire\\r\\nApni yaari ka, alag hi empire\\r\\nStart karein Gaurav, machata hai shor ab\\r\\nUske jaisa cool, hai apna Saurabh\\r\\nNaam hi kaafi hai, entry maare Shiv\\r\\nDekh ke jisko sab kahen \\\"What a look!\\\", woh Aloke\\r\\nApna Rajan bhai, dilon pe karta raaj\\r\\nAur humesha jeetein, yeh Jiten ka andaaz\\r\\nEnergy ko push kare, hai apna Pratyush\\r\\nSaath mein hai Shivam, toh hum hain khush\\r\\nSabki jeet pakki, jab khele Vineet\\r\\nHar baazi apni, yeh hai Vijay ki reet\\r\\nNaam mein hi Shankar, hai Jaishankar ki dahaad\\r\\nAur saath mein Biren, yaaron ka hai pahaad!\\r\\n(Yeah! That''s the crew!)\\r\\n\\r\\n(Chorus)\\r\\n(Music explodes back with full energy)\\r\\nOye jab bhi hum aate hain, floor hila de!\\r\\nYaaron ki yaari se, shehar hila de!\\r\\nBeat aisi bajti hai, dil yeh dila de!\\r\\nAwaaz upar karke, sabko hila de!\\r\\n\\r\\n(Outro)\\r\\nShehar Hila De!\\r\\n(Yeah!)\\r\\nYaaron Ki Vibe Hai!\\r\\n(Haha!)\\r\\n(Music fades out with the main synth hook and a final, echoing dhol hit)\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.mp3\", \"duration\": 196.48, \"imageUrl\": \"https://apiboxfiles.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1756555316725, \"sourceAudioUrl\": \"https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_980396fc-b213-4112-a903-419a3d1a9dc3.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/OTgwMzk2ZmMtYjIxMy00MTEyLWE5MDMtNDE5YTNkMWE5ZGMz\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/980396fc-b213-4112-a903-419a3d1a9dc3.mp3\"}]"'::jsonb,
        '{"0": [{"endS": 2.34043, "word": "Yo! ", "palign": 0, "startS": 1.19681, "success": true}, {"endS": 3.01596, "word": "DJ, ", "palign": 0, "startS": 2.44681, "success": true}, {"endS": 3.27128, "word": "drop ", "palign": 0, "startS": 3.07979, "success": true}, {"endS": 3.51064, "word": "the ", "palign": 0, "startS": 3.35106, "success": true}, {"endS": 10.48404, "word": "beat!\n\n", "palign": 0, "startS": 3.61037, "success": true}, {"endS": 10.77128, "word": "Let''s ", "palign": 0, "startS": 10.5, "success": true}, {"endS": 11.07048, "word": "go!\n\n(", "palign": 0, "startS": 10.89096, "success": true}, {"endS": 11.2234, "word": "Verse 1)\n\n", "palign": 0, "startS": 11.09043, "success": true}, {"endS": 11.32979, "word": "Raat ", "palign": 0, "startS": 11.2367, "success": true}, {"endS": 11.64894, "word": "abhi ", "palign": 0, "startS": 11.40957, "success": true}, {"endS": 11.96809, "word": "baaki ", "palign": 0, "startS": 11.72872, "success": true}, {"endS": 12.15426, "word": "hai, ", "palign": 0, "startS": 12.02128, "success": true}, {"endS": 12.28723, "word": "plans ", "palign": 0, "startS": 12.18085, "success": true}, {"endS": 12.44681, "word": "ho ", "palign": 0, "startS": 12.36702, "success": true}, {"endS": 12.60638, "word": "gaye ", "palign": 0, "startS": 12.5266, "success": true}, {"endS": 12.89894, "word": "set\n\n", "palign": 0, "startS": 12.68617, "success": true}, {"endS": 13.08511, "word": "Saari ", "palign": 0, "startS": 12.95213, "success": true}, {"endS": 13.56383, "word": "gaadiyan ", "palign": 0, "startS": 13.16489, "success": true}, {"endS": 13.85638, "word": "ready, ", "palign": 0, "startS": 13.6117, "success": true}, {"endS": 13.96277, "word": "no ", "palign": 0, "startS": 13.90957, "success": true}, {"endS": 14.20213, "word": "time ", "palign": 0, "startS": 14.02261, "success": true}, {"endS": 14.44149, "word": "for ", "palign": 0, "startS": 14.28191, "success": true}, {"endS": 14.92021, "word": "regret\n\n", "palign": 0, "startS": 14.50798, "success": true}, {"endS": 15.15957, "word": "Phone ", "palign": 0, "startS": 15, "success": true}, {"endS": 15.31915, "word": "pe ", "palign": 0, "startS": 15.23936, "success": true}, {"endS": 15.55851, "word": "phone ", "palign": 0, "startS": 15.36702, "success": true}, {"endS": 15.93085, "word": "bajte, \"", "palign": 0, "startS": 15.5984, "success": true}, {"endS": 16.15691, "word": "Bhai, ", "palign": 0, "startS": 15.95745, "success": true}, {"endS": 16.35638, "word": "kidhar ", "palign": 0, "startS": 16.19681, "success": true}, {"endS": 16.51596, "word": "hai ", "palign": 0, "startS": 16.40957, "success": true}, {"endS": 16.7234, "word": "tu?\"\n\n", "palign": 0, "startS": 16.59574, "success": true}, {"endS": 16.83511, "word": "Apna ", "palign": 0, "startS": 16.73936, "success": true}, {"endS": 17.15426, "word": "adda ", "palign": 0, "startS": 16.91489, "success": true}, {"endS": 17.39362, "word": "fix ", "palign": 0, "startS": 17.23404, "success": true}, {"endS": 17.67287, "word": "hai, ", "palign": 0, "startS": 17.4734, "success": true}, {"endS": 17.95213, "word": "milta ", "palign": 0, "startS": 17.71277, "success": true}, {"endS": 18.19149, "word": "wahi ", "palign": 0, "startS": 17.99202, "success": true}, {"endS": 18.36702, "word": "crew\n\n(", "palign": 0, "startS": 18.21144, "success": true}, {"endS": 18.71011, "word": "Pre-Chorus)\n\n", "palign": 0, "startS": 18.41489, "success": true}, {"endS": 18.82979, "word": "Ek ", "palign": 0, "startS": 18.76995, "success": true}, {"endS": 19.06915, "word": "ka ", "palign": 0, "startS": 18.94947, "success": true}, {"endS": 19.22872, "word": "call ", "palign": 0, "startS": 19.10904, "success": true}, {"endS": 19.73404, "word": "aaye, ", "palign": 0, "startS": 19.3883, "success": true}, {"endS": 19.94681, "word": "toh ", "palign": 0, "startS": 19.76064, "success": true}, {"endS": 20.42553, "word": "saare ", "palign": 0, "startS": 20.06649, "success": true}, {"endS": 21.06383, "word": "aate ", "palign": 0, "startS": 20.58511, "success": true}, {"endS": 22.36702, "word": "hain\n\n", "palign": 0, "startS": 21.17021, "success": true}, {"endS": 22.89894, "word": "Dushman ", "palign": 0, "startS": 22.42021, "success": true}, {"endS": 23.1383, "word": "jo ", "palign": 0, "startS": 23.01862, "success": true}, {"endS": 23.66489, "word": "dekhe, ", "palign": 0, "startS": 23.19149, "success": true}, {"endS": 23.85638, "word": "side ", "palign": 0, "startS": 23.71277, "success": true}, {"endS": 24.17553, "word": "ho ", "palign": 0, "startS": 23.97606, "success": true}, {"endS": 24.73404, "word": "jaate ", "palign": 0, "startS": 24.29521, "success": true}, {"endS": 26.07903, "word": "hain\n\n", "palign": 0, "startS": 24.84043, "success": true}, {"endS": 26.56915, "word": "Speaker ", "palign": 0, "startS": 26.11322, "success": true}, {"endS": 26.8883, "word": "ka ", "palign": 0, "startS": 26.68883, "success": true}, {"endS": 27.28723, "word": "volume ", "palign": 0, "startS": 26.94149, "success": true}, {"endS": 27.36702, "word": "full ", "palign": 0, "startS": 27.30718, "success": true}, {"endS": 28.00532, "word": "kar ", "palign": 0, "startS": 27.5266, "success": true}, {"endS": 28.28457, "word": "de, ", "palign": 0, "startS": 28.08511, "success": true}, {"endS": 34.06915, "word": "bhai\n\n", "palign": 0, "startS": 28.40426, "success": true}, {"endS": 34.30851, "word": "Oye ", "palign": 0, "startS": 34.14894, "success": true}, {"endS": 34.54787, "word": "jab ", "palign": 0, "startS": 34.3484, "success": true}, {"endS": 34.78723, "word": "bhi ", "palign": 0, "startS": 34.62766, "success": true}, {"endS": 35.26596, "word": "hum ", "palign": 0, "startS": 34.89362, "success": true}, {"endS": 35.82447, "word": "aate ", "palign": 0, "startS": 35.42553, "success": true}, {"endS": 36.27128, "word": "hain, ", "palign": 0, "startS": 35.93085, "success": true}, {"endS": 36.62234, "word": "floor ", "palign": 0, "startS": 36.33511, "success": true}, {"endS": 37.10106, "word": "hila ", "palign": 0, "startS": 36.70213, "success": true}, {"endS": 38.0984, "word": "de!\n\n", "palign": 0, "startS": 37.22074, "success": true}, {"endS": 38.45745, "word": "Yaaron ", "palign": 0, "startS": 38.15824, "success": true}, {"endS": 38.93617, "word": "ki ", "palign": 0, "startS": 38.57713, "success": true}, {"endS": 39.57447, "word": "yaari ", "palign": 0, "startS": 39.05585, "success": true}, {"endS": 39.87367, "word": "se, ", "palign": 0, "startS": 39.69415, "success": true}, {"endS": 40.37234, "word": "shehar ", "palign": 0, "startS": 39.93351, "success": true}, {"endS": 40.77128, "word": "hila ", "palign": 0, "startS": 40.42553, "success": true}, {"endS": 41.76862, "word": "de!\n\n", "palign": 0, "startS": 40.89096, "success": true}, {"endS": 42.12766, "word": "Beat ", "palign": 0, "startS": 41.82846, "success": true}, {"endS": 42.60638, "word": "aisi ", "palign": 0, "startS": 42.28723, "success": true}, {"endS": 43.24468, "word": "bajti ", "palign": 0, "startS": 42.68617, "success": true}, {"endS": 43.56383, "word": "hai, ", "palign": 0, "startS": 43.32447, "success": true}, {"endS": 43.7234, "word": "dil ", "palign": 0, "startS": 43.64362, "success": true}, {"endS": 43.96277, "word": "yeh ", "palign": 0, "startS": 43.80319, "success": true}, {"endS": 44.44149, "word": "dila ", "palign": 0, "startS": 44.04255, "success": true}, {"endS": 45.23936, "word": "de!\n\n", "palign": 0, "startS": 44.56117, "success": true}, {"endS": 45.95745, "word": "Awaaz ", "palign": 0, "startS": 45.31915, "success": true}, {"endS": 46.2766, "word": "upar ", "palign": 0, "startS": 46.03723, "success": true}, {"endS": 46.99468, "word": "karke, ", "palign": 0, "startS": 46.38298, "success": true}, {"endS": 47.55319, "word": "sabko ", "palign": 0, "startS": 47.07447, "success": true}, {"endS": 48.1117, "word": "hila ", "palign": 0, "startS": 47.63298, "success": true}, {"endS": 60.82779, "word": "de!\n\n(", "palign": 0, "startS": 48.23138, "success": true}, {"endS": 61.06915, "word": "Outro)\n\n", "palign": 0, "startS": 60.83777, "success": true}, {"endS": 64.14894, "word": "Shehar ", "palign": 0, "startS": 61.16489, "success": true}, {"endS": 64.46809, "word": "Hila ", "palign": 0, "startS": 64.30851, "success": true}, {"endS": 64.81003, "word": "De!\n\n", "palign": 0, "startS": 64.58777, "success": true}, {"endS": 65.10638, "word": "Lightein ", "palign": 0, "startS": 64.82143, "success": true}, {"endS": 65.34574, "word": "hain ", "palign": 0, "startS": 65.14628, "success": true}, {"endS": 65.54521, "word": "dim, ", "palign": 0, "startS": 65.39894, "success": true}, {"endS": 65.66489, "word": "par ", "palign": 0, "startS": 65.58511, "success": true}, {"endS": 65.90426, "word": "apni ", "palign": 0, "startS": 65.70479, "success": true}, {"endS": 66.06383, "word": "vibe ", "palign": 0, "startS": 65.94415, "success": true}, {"endS": 66.2234, "word": "hai ", "palign": 0, "startS": 66.11702, "success": true}, {"endS": 66.5625, "word": "bright\n\n", "palign": 0, "startS": 66.34309, "success": true}, {"endS": 66.78191, "word": "Jahan ", "palign": 0, "startS": 66.58245, "success": true}, {"endS": 67.10106, "word": "kadam ", "palign": 0, "startS": 66.94149, "success": true}, {"endS": 67.46011, "word": "rakhte, ", "palign": 0, "startS": 67.14096, "success": true}, {"endS": 67.65957, "word": "spot ", "palign": 0, "startS": 67.5, "success": true}, {"endS": 67.81915, "word": "ho ", "palign": 0, "startS": 67.73936, "success": true}, {"endS": 68.05851, "word": "jaati ", "palign": 0, "startS": 67.85904, "success": true}, {"endS": 68.25798, "word": "light\n\n", "palign": 0, "startS": 68.09043, "success": true}, {"endS": 68.53723, "word": "Koi ", "palign": 0, "startS": 68.29787, "success": true}, {"endS": 68.85638, "word": "tension ", "palign": 0, "startS": 68.55718, "success": true}, {"endS": 69.09574, "word": "nahi ", "palign": 0, "startS": 68.90957, "success": true}, {"endS": 69.28191, "word": "hai, ", "palign": 0, "startS": 69.14894, "success": true}, {"endS": 69.33511, "word": "na ", "palign": 0, "startS": 69.30851, "success": true}, {"endS": 69.57447, "word": "koi ", "palign": 0, "startS": 69.41489, "success": true}, {"endS": 69.73404, "word": "hai ", "palign": 0, "startS": 69.62766, "success": true}, {"end...'::jsonb,
        '{"0":[{"end":2340,"text":"Yo!","index":0,"start":997},{"end":10484,"text":"DJ, drop the beat!","index":1,"start":2247},{"end":11070,"text":"Let''s go! (","index":2,"start":10300},{"end":13564,"text":"Verse 1) Raat abhi baaki hai, plans ho gaye set Saari gaadiyan","index":3,"start":10890},{"end":16516,"text":"ready, no time for regret Phone pe phone bajte, \" Bhai, kidhar hai","index":4,"start":13412},{"end":16723,"text":"tu?\"","index":5,"start":16396},{"end":19734,"text":"Apna adda fix hai, milta wahi crew (Pre-Chorus) Ek ka call aaye,","index":6,"start":16539},{"end":26569,"text":"toh saare aate hain Dushman jo dekhe, side ho jaate hain Speaker","index":7,"start":19561},{"end":37101,"text":"ka volume full kar de, bhai Oye jab bhi hum aate hain, floor hila","index":8,"start":26489},{"end":38098,"text":"de!","index":9,"start":37021},{"end":41769,"text":"Yaaron ki yaari se, shehar hila de!","index":10,"start":37958},{"end":45239,"text":"Beat aisi bajti hai, dil yeh dila de!","index":11,"start":41628},{"end":60828,"text":"Awaaz upar karke, sabko hila de! (","index":12,"start":45119},{"end":64810,"text":"Outro) Shehar Hila De!","index":13,"start":60638},{"end":67460,"text":"Lightein hain dim, par apni vibe hai bright Jahan kadam rakhte,","index":14,"start":64621},{"end":70293,"text":"spot ho jaati light Koi tension nahi hai, na koi hai fikar Bas","index":15,"start":67300},{"end":73271,"text":"masti on hai, aur yaaron ka zikar (Pre-Chorus) Ek ka call aaye,","index":16,"start":70252},{"end":80106,"text":"toh saare aate hain Dushman jo dekhe, side ho jaate hain Speaker","index":17,"start":73098},{"end":85691,"text":"ka volume full kar de, bhai Entry aisi lenge, mach jaayegi","index":18,"start":80026},{"end":86436,"text":"tabaahi! (","index":19,"start":85571},{"end":90798,"text":"Chorus) Oye jab bhi hum aate hain, floor hila de!","index":20,"start":86325},{"end":95319,"text":"Yaaron ki yaari se, shehar hila de!","index":21,"start":90638},{"end":98856,"text":"Beat aisi bajti hai, dil yeh dila de!","index":22,"start":95186},{"end":103138,"text":"Awaaz upar karke, sabko hila de!","index":23,"start":98736},{"end":103484,"text":"Yeah!","index":24,"start":103005},{"end":104082,"text":"Mic check...","index":25,"start":103364},{"end":104441,"text":"Suno!","index":26,"start":103922},{"end":107553,"text":"Baarah khiladi, game mein hain on fire Apni yaari ka, alag hi","index":27,"start":104281},{"end":110665,"text":"empire Start karein Gaurav, machata hai shor ab Uske jaisa cool,","index":28,"start":107406},{"end":119601,"text":"hai apna Saurabh Energy ko push kare, hai apna Pratyush Saath mein","index":29,"start":110545},{"end":124628,"text":"hai Shivam, toh hum hain khush Sabki jeet pakki, jab khele Vineet","index":30,"start":119481},{"end":128537,"text":"Har baazi apni, yeh hai Vijay ki reet Naam mein hi Shankar, hai","index":31,"start":124454},{"end":136795,"text":"Jaishankar ki dahaad Oye jab bhi hum aate hain, floor hila de!","index":32,"start":128497},{"end":140532,"text":"Yaaron ki yaari se, shehar hila de!","index":33,"start":136655},{"end":144043,"text":"Beat aisi bajti hai, dil yeh dila de!","index":34,"start":140385},{"end":147237,"text":"Awaaz upar karke, sabko hila de! (","index":35,"start":143896},{"end":152188,"text":"Outro) Shehar Hila De! (","index":36,"start":147127},{"end":157356,"text":"Yeah!)","index":37,"start":152080},{"end":161537,"text":"Yaaron Ki Vibe Hai! (","index":38,"start":157188},{"end":162287,"text":"Haha!)","index":39,"start":161433}]}'::jsonb,
        '{"original_id":31,"original_sequence":null,"duration":"181.88","song_url":"https://cdn1.suno.ai/78df5b9b-6168-4524-81c0-969adee3073a.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"325472ae8dd1c9a05df09c6d4dae45e9"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Party','Friendship'],
        ARRAY['Energy','Dhol'],
        true,
        false,
        NULL,
        '2025-08-30 11:59:57.964177+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Shehar Hila De'
    LIMIT 1;

    -- Song entry for: Yaaron Waali Pool Party
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
        'yaaron-waali-pool-party-1',
        'COMPLETED',
        true,
        '"[{\"id\": \"7640609c-d9ea-4ca2-aab9-8dfe9cd314a9\", \"tags\": \"This song is conceived as a high-energy Desi-Pop and EDM fusion track. It should feature a powerful four-on-the-floor drum beat, a deep, groovy bassline, and a catchy synth hook that repeats in the chorus. The verses can have a slightly more relaxed, rap-like vocal delivery, building up excitement in the pre-chorus and exploding with energy in the chorus. The bridge should have a build-up with drum rolls, leading to a massive beat drop for the final chorus.\\r\\n\\r\\nRecommended Voice Style: A male vocalist with a confident, energetic, and slightly swaggering tone would be perfect. The delivery should be clear but playful, somewhere between singing and rhythmic talking, much like contemporary Indian pop artists.\", \"title\": \"Yaaron Waali Pool Party\", \"prompt\": \"(Intro)\\r\\n(Sound of water splashing, followed by a synth melody kicking in)\\r\\nYeah! Weekend ka scene hai set!\\r\\nGaurav ne phone kiya, bola \\\"No regret!\\\"\\r\\nAaj sab kuch full-on hai, no stress!\\r\\n\\r\\n(Verse 1)\\r\\nDhoop hai shining bright, mood hai dynamite\\r\\nSaurabh le aaya speakers, set kar di poori night\\r\\nPratyush on the console, dropping beats so right\\r\\nAur Shivam ne maari entry, kya cool si sight!\\r\\nVineet bola, \\\"Let''s go!\\\", with all his might!\\r\\n\\r\\n(Pre-Chorus)\\r\\nGlasses mein ice, no advice!\\r\\nTension ko feko, everything is nice!\\r\\nPaani mein ab aag lagegi, just roll the dice!\\r\\n\\r\\n(Chorus)\\r\\nHey! Paani hai blue, blue, blue\\r\\nMasti on loop, loop, loop\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\nHey! Sky hai blue, blue, blue\\r\\nSaath mein apna crew, crew, crew\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\n(Verse 2)\\r\\nVijay ne maara splash, ek dum cannonball\\r\\nJaishankar sabko pukaare, \\\"Come on, have a ball!\\\"\\r\\nBiren kar raha chill, swimming past the wall\\r\\nAur Jiten khada side mein, looking cool and tall\\r\\nYaari ki apni picture, bigger than them all!\\r\\n\\r\\n(Pre-Chorus)\\r\\nGlasses mein ice, no advice!\\r\\nTension ko feko, everything is nice!\\r\\nPaani mein ab aag lagegi, just roll the dice!\\r\\n\\r\\n(Chorus)\\r\\nHey! Paani hai blue, blue, blue\\r\\nMasti on loop, loop, loop\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\nHey! Sky hai blue, blue, blue\\r\\nSaath mein apna crew, crew, crew\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\n(Bridge)\\r\\n(Music softens slightly with a rhythmic clap)\\r\\nEast or west, apne dost hain best\\r\\nLife ke har exam mein, paas karte hain test!\\r\\nFrom the first day to forever, no contest!\\r\\n(Beat starts building up)\\r\\nGaurav, Shiv, Aloke, Rajan!\\r\\nJiten, Saurabh, Pratyush, Shivam!\\r\\nVineet, Vijay, Jaishankar, Biren!\\r\\nSaare ke saare hain number one! C''mon!\\r\\n\\r\\n(Guitar solo / Synth lead over a heavy beat drop)\\r\\n\\r\\n(Chorus)\\r\\n(Vocals with high energy and ad-libs)\\r\\nHey! Paani hai blue, blue, blue\\r\\nMasti on loop, loop, loop\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\nHey! Sky hai blue, blue, blue\\r\\nSaath mein apna crew, crew, crew\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\n(Outro)\\r\\n(Beat fades while voices and splash sounds continue)\\r\\nYeah! That''s my crew!\\r\\nHey Shiv! Hey Aloke!\\r\\nRajan, music badha de bro! (Bro, turn up the music!)\\r\\nThat''s right!\\r\\nScene hai super-duper-hit, dude!\\r\\n(Final splash sound)\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/NzY0MDYwOWMtZDllYS00Y2EyLWFhYjktOGRmZTljZDMxNGE5.mp3\", \"duration\": 185.16, \"imageUrl\": \"https://apiboxfiles.erweima.ai/NzY0MDYwOWMtZDllYS00Y2EyLWFhYjktOGRmZTljZDMxNGE5.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1756556298049, \"sourceAudioUrl\": \"https://cdn1.suno.ai/7640609c-d9ea-4ca2-aab9-8dfe9cd314a9.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_7640609c-d9ea-4ca2-aab9-8dfe9cd314a9.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/NzY0MDYwOWMtZDllYS00Y2EyLWFhYjktOGRmZTljZDMxNGE5\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/7640609c-d9ea-4ca2-aab9-8dfe9cd314a9.mp3\"}, {\"id\": \"155c3905-81eb-40ab-ba21-a60f608df8a3\", \"tags\": \"This song is conceived as a high-energy Desi-Pop and EDM fusion track. It should feature a powerful four-on-the-floor drum beat, a deep, groovy bassline, and a catchy synth hook that repeats in the chorus. The verses can have a slightly more relaxed, rap-like vocal delivery, building up excitement in the pre-chorus and exploding with energy in the chorus. The bridge should have a build-up with drum rolls, leading to a massive beat drop for the final chorus.\\r\\n\\r\\nRecommended Voice Style: A male vocalist with a confident, energetic, and slightly swaggering tone would be perfect. The delivery should be clear but playful, somewhere between singing and rhythmic talking, much like contemporary Indian pop artists.\", \"title\": \"Yaaron Waali Pool Party\", \"prompt\": \"(Intro)\\r\\n(Sound of water splashing, followed by a synth melody kicking in)\\r\\nYeah! Weekend ka scene hai set!\\r\\nGaurav ne phone kiya, bola \\\"No regret!\\\"\\r\\nAaj sab kuch full-on hai, no stress!\\r\\n\\r\\n(Verse 1)\\r\\nDhoop hai shining bright, mood hai dynamite\\r\\nSaurabh le aaya speakers, set kar di poori night\\r\\nPratyush on the console, dropping beats so right\\r\\nAur Shivam ne maari entry, kya cool si sight!\\r\\nVineet bola, \\\"Let''s go!\\\", with all his might!\\r\\n\\r\\n(Pre-Chorus)\\r\\nGlasses mein ice, no advice!\\r\\nTension ko feko, everything is nice!\\r\\nPaani mein ab aag lagegi, just roll the dice!\\r\\n\\r\\n(Chorus)\\r\\nHey! Paani hai blue, blue, blue\\r\\nMasti on loop, loop, loop\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\nHey! Sky hai blue, blue, blue\\r\\nSaath mein apna crew, crew, crew\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\n(Verse 2)\\r\\nVijay ne maara splash, ek dum cannonball\\r\\nJaishankar sabko pukaare, \\\"Come on, have a ball!\\\"\\r\\nBiren kar raha chill, swimming past the wall\\r\\nAur Jiten khada side mein, looking cool and tall\\r\\nYaari ki apni picture, bigger than them all!\\r\\n\\r\\n(Pre-Chorus)\\r\\nGlasses mein ice, no advice!\\r\\nTension ko feko, everything is nice!\\r\\nPaani mein ab aag lagegi, just roll the dice!\\r\\n\\r\\n(Chorus)\\r\\nHey! Paani hai blue, blue, blue\\r\\nMasti on loop, loop, loop\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\nHey! Sky hai blue, blue, blue\\r\\nSaath mein apna crew, crew, crew\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\n(Bridge)\\r\\n(Music softens slightly with a rhythmic clap)\\r\\nEast or west, apne dost hain best\\r\\nLife ke har exam mein, paas karte hain test!\\r\\nFrom the first day to forever, no contest!\\r\\n(Beat starts building up)\\r\\nGaurav, Shiv, Aloke, Rajan!\\r\\nJiten, Saurabh, Pratyush, Shivam!\\r\\nVineet, Vijay, Jaishankar, Biren!\\r\\nSaare ke saare hain number one! C''mon!\\r\\n\\r\\n(Guitar solo / Synth lead over a heavy beat drop)\\r\\n\\r\\n(Chorus)\\r\\n(Vocals with high energy and ad-libs)\\r\\nHey! Paani hai blue, blue, blue\\r\\nMasti on loop, loop, loop\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\nHey! Sky hai blue, blue, blue\\r\\nSaath mein apna crew, crew, crew\\r\\nApni yaaron waali pool party\\r\\nScene hai super-duper-hit, dude!\\r\\n\\r\\n(Outro)\\r\\n(Beat fades while voices and splash sounds continue)\\r\\nYeah! That''s my crew!\\r\\nHey Shiv! Hey Aloke!\\r\\nRajan, music badha de bro! (Bro, turn up the music!)\\r\\nThat''s right!\\r\\nScene hai super-duper-hit, dude!\\r\\n(Final splash sound)\", \"audioUrl\": \"https://apiboxfiles.erweima.ai/MTU1YzM5MDUtODFlYi00MGFiLWJhMjEtYTYwZjYwOGRmOGEz.mp3\", \"duration\": 199.72, \"imageUrl\": \"https://apiboxfiles.erweima.ai/MTU1YzM5MDUtODFlYi00MGFiLWJhMjEtYTYwZjYwOGRmOGEz.jpeg\", \"modelName\": \"chirp-bluejay\", \"createTime\": 1756556298049, \"sourceAudioUrl\": \"https://cdn1.suno.ai/155c3905-81eb-40ab-ba21-a60f608df8a3.mp3\", \"sourceImageUrl\": \"https://cdn2.suno.ai/image_155c3905-81eb-40ab-ba21-a60f608df8a3.jpeg\", \"streamAudioUrl\": \"https://mfile.erweima.ai/MTU1YzM5MDUtODFlYi00MGFiLWJhMjEtYTYwZjYwOGRmOGEz\", \"sourceStreamAudioUrl\": \"https://cdn1.suno.ai/155c3905-81eb-40ab-ba21-a60f608df8a3.mp3\"}]"'::jsonb,
        '{"0": [{"endS": 8.76662, "word": "Yeah! ", "palign": 0, "startS": 7.97872, "success": true}, {"endS": 9.25532, "word": "Weekend ", "palign": 0, "startS": 8.83644, "success": true}, {"endS": 9.41489, "word": "ka ", "palign": 0, "startS": 9.33511, "success": true}, {"endS": 9.65426, "word": "scene ", "palign": 0, "startS": 9.46277, "success": true}, {"endS": 9.81383, "word": "hai ", "palign": 0, "startS": 9.70745, "success": true}, {"endS": 10.45213, "word": "set!\n\n", "palign": 0, "startS": 9.92021, "success": true}, {"endS": 10.77128, "word": "Gaurav ", "palign": 0, "startS": 10.53191, "success": true}, {"endS": 10.85106, "word": "ne ", "palign": 0, "startS": 10.81117, "success": true}, {"endS": 11.09043, "word": "phone ", "palign": 0, "startS": 10.89894, "success": true}, {"endS": 11.39362, "word": "kiya, ", "palign": 0, "startS": 11.17021, "success": true}, {"endS": 11.72872, "word": "bola \"", "palign": 0, "startS": 11.45745, "success": true}, {"endS": 11.8883, "word": "No ", "palign": 0, "startS": 11.80851, "success": true}, {"endS": 12.40691, "word": "regret!\"\n\n", "palign": 0, "startS": 11.95479, "success": true}, {"endS": 12.5266, "word": "Aaj ", "palign": 0, "startS": 12.44681, "success": true}, {"endS": 12.76596, "word": "sab ", "palign": 0, "startS": 12.56649, "success": true}, {"endS": 13.08511, "word": "kuch ", "palign": 0, "startS": 12.84574, "success": true}, {"endS": 13.56383, "word": "full-on ", "palign": 0, "startS": 13.14495, "success": true}, {"endS": 14.52128, "word": "hai, ", "palign": 0, "startS": 13.67021, "success": true}, {"endS": 14.68085, "word": "no ", "palign": 0, "startS": 14.60106, "success": true}, {"endS": 16.65559, "word": "stress!\n\n(", "palign": 0, "startS": 14.77394, "success": true}, {"endS": 16.80091, "word": "Verse 1)\n\n", "palign": 0, "startS": 16.67553, "success": true}, {"endS": 16.91489, "word": "Dhoop ", "palign": 0, "startS": 16.81231, "success": true}, {"endS": 17.07447, "word": "hai ", "palign": 0, "startS": 16.96809, "success": true}, {"endS": 17.55319, "word": "shining ", "palign": 0, "startS": 17.14286, "success": true}, {"endS": 17.76064, "word": "bright, ", "palign": 0, "startS": 17.57979, "success": true}, {"endS": 17.95213, "word": "mood ", "palign": 0, "startS": 17.80851, "success": true}, {"endS": 18.1117, "word": "hai ", "palign": 0, "startS": 18.00532, "success": true}, {"endS": 18.7234, "word": "dynamite\n\n", "palign": 0, "startS": 18.19149, "success": true}, {"endS": 19.09574, "word": "Saurabh ", "palign": 0, "startS": 18.7766, "success": true}, {"endS": 19.14894, "word": "le ", "palign": 0, "startS": 19.12234, "success": true}, {"endS": 19.3883, "word": "aaya ", "palign": 0, "startS": 19.22872, "success": true}, {"endS": 19.74734, "word": "speakers, ", "palign": 0, "startS": 19.42021, "success": true}, {"endS": 19.86702, "word": "set ", "palign": 0, "startS": 19.78723, "success": true}, {"endS": 20.07979, "word": "kar ", "palign": 0, "startS": 20.0266, "success": true}, {"endS": 20.18617, "word": "di ", "palign": 0, "startS": 20.10638, "success": true}, {"endS": 20.42553, "word": "poori ", "palign": 0, "startS": 20.26596, "success": true}, {"endS": 20.70479, "word": "night\n\n", "palign": 0, "startS": 20.4734, "success": true}, {"endS": 21.06383, "word": "Pratyush ", "palign": 0, "startS": 20.74468, "success": true}, {"endS": 21.2234, "word": "on ", "palign": 0, "startS": 21.14362, "success": true}, {"endS": 21.38298, "word": "the ", "palign": 0, "startS": 21.2766, "success": true}, {"endS": 21.81738, "word": "console, ", "palign": 0, "startS": 21.43617, "success": true}, {"endS": 22.10106, "word": "dropping ", "palign": 0, "startS": 21.85284, "success": true}, {"endS": 22.18085, "word": "beats ", "palign": 0, "startS": 22.11702, "success": true}, {"endS": 22.34043, "word": "so ", "palign": 0, "startS": 22.26064, "success": true}, {"endS": 22.55984, "word": "right\n\n", "palign": 0, "startS": 22.37234, "success": true}, {"endS": 22.73936, "word": "Aur ", "palign": 0, "startS": 22.61968, "success": true}, {"endS": 23.05851, "word": "Shivam ", "palign": 0, "startS": 22.77926, "success": true}, {"endS": 23.21809, "word": "ne ", "palign": 0, "startS": 23.1383, "success": true}, {"endS": 23.45745, "word": "maari ", "palign": 0, "startS": 23.29787, "success": true}, {"endS": 23.7367, "word": "entry, ", "palign": 0, "startS": 23.51064, "success": true}, {"endS": 23.93617, "word": "kya ", "palign": 0, "startS": 23.7766, "success": true}, {"endS": 24.09574, "word": "cool ", "palign": 0, "startS": 23.97606, "success": true}, {"endS": 24.25532, "word": "si ", "palign": 0, "startS": 24.17553, "success": true}, {"endS": 24.62766, "word": "sight!\n\n", "palign": 0, "startS": 24.31915, "success": true}, {"endS": 24.89362, "word": "Vineet ", "palign": 0, "startS": 24.65426, "success": true}, {"endS": 25.24468, "word": "bola, \"", "palign": 0, "startS": 24.9734, "success": true}, {"endS": 25.45213, "word": "Let''s ", "palign": 0, "startS": 25.26064, "success": true}, {"endS": 25.68009, "word": "go!\", ", "palign": 0, "startS": 25.53191, "success": true}, {"endS": 25.77128, "word": "with ", "palign": 0, "startS": 25.70289, "success": true}, {"endS": 25.93085, "word": "all ", "palign": 0, "startS": 25.82447, "success": true}, {"endS": 26.17021, "word": "his ", "palign": 0, "startS": 26.01064, "success": true}, {"endS": 26.68883, "word": "might!\n\n(", "palign": 0, "startS": 26.21809, "success": true}, {"endS": 27.5152, "word": "Pre-Chorus)\n\n", "palign": 0, "startS": 26.78191, "success": true}, {"endS": 27.92553, "word": "Glasses ", "palign": 0, "startS": 27.54939, "success": true}, {"endS": 28.08511, "word": "mein ", "palign": 0, "startS": 27.96543, "success": true}, {"endS": 28.67021, "word": "ice, ", "palign": 0, "startS": 28.19149, "success": true}, {"endS": 28.96277, "word": "no ", "palign": 0, "startS": 28.7766, "success": true}, {"endS": 29.44149, "word": "advice!\n\n", "palign": 0, "startS": 29.02926, "success": true}, {"endS": 29.76064, "word": "Tension ", "palign": 0, "startS": 29.48138, "success": true}, {"endS": 29.92021, "word": "ko ", "palign": 0, "startS": 29.84043, "success": true}, {"endS": 30.57302, "word": "feko, ", "palign": 0, "startS": 30.03989, "success": true}, {"endS": 30.71809, "word": "everything ", "palign": 0, "startS": 30.58752, "success": true}, {"endS": 30.95745, "word": "is ", "palign": 0, "startS": 30.83777, "success": true}, {"endS": 31.35638, "word": "nice!\n\n", "palign": 0, "startS": 31.03723, "success": true}, {"endS": 31.51596, "word": "Paani ", "palign": 0, "startS": 31.39628, "success": true}, {"endS": 31.67553, "word": "mein ", "palign": 0, "startS": 31.55585, "success": true}, {"endS": 31.91489, "word": "ab ", "palign": 0, "startS": 31.83511, "success": true}, {"endS": 32.15426, "word": "aag ", "palign": 0, "startS": 31.91489, "success": true}, {"endS": 33.01596, "word": "lagegi, ", "palign": 0, "startS": 32.23404, "success": true}, {"endS": 33.27128, "word": "just ", "palign": 0, "startS": 33.07979, "success": true}, {"endS": 33.51064, "word": "roll ", "palign": 0, "startS": 33.33112, "success": true}, {"endS": 33.67021, "word": "the ", "palign": 0, "startS": 33.56383, "success": true}, {"endS": 36.32979, "word": "dice!\n\n(", "palign": 0, "startS": 33.76995, "success": true}, {"endS": 36.51064, "word": "Chorus)\n\n", "palign": 0, "startS": 36.33865, "success": true}, {"endS": 36.75532, "word": "Hey! ", "palign": 0, "startS": 36.57447, "success": true}, {"endS": 37.02128, "word": "Paani ", "palign": 0, "startS": 36.80851, "success": true}, {"endS": 37.18085, "word": "hai ", "palign": 0, "startS": 37.07447, "success": true}, {"endS": 37.65957, "word": "blue, ", "palign": 0, "startS": 37.28059, "success": true}, {"endS": 38.05851, "word": "blue, ", "palign": 0, "startS": 37.73936, "success": true}, {"endS": 38.45745, "word": "blue\n\n", "palign": 0, "startS": 38.1383, "success": true}, {"endS": 38.85638, "word": "Masti ", "palign": 0, "startS": 38.53723, "success": true}, {"endS": 39.01596, "word": "on ", "palign": 0, "startS": 38.93617, "success": true}, {"endS": 39.57447, "word": "loop, ", "palign": 0, "startS": 39.11569, "success": true}, {"endS": 39.9734, "word": "loop, ", "palign": 0, "startS": 39.65426, "success": true}, {"endS": 40.39894, "word": "loop\n\n", "palign": 0, "startS": 40.05319, "success": true}, {"endS": 40.93085, "word": "Apni ", "palign": 0, "startS": 40.50532, "success": true}, {"endS": 41.32979, "word": "yaaron ", "palign": 0, "startS": 41.01064, "success": true}, {"endS": 41.80851, "word": "waali ", "palign": 0, "startS": 41.44947, "success": true}, {"endS": 42.20745, "word": "pool ", "palign": 0, "startS": 41.90824, "success": true}, {"endS": 42.80585, "word": "party\n\n", "palign": 0, "startS": 42.30319, "success": true}, {"endS": 43.00532, "word": "Scene ", "palign": 0, "startS": 42.84574, "success": true}, {"endS": 43.16489, "word": "hai ", "palign": 0, "startS": 43.05851, "success": true}, {"endS": 44.12234, "word": "super-duper-hit, ", "palign": 0, "startS": 43.22872, "success": true}, {"endS": 44.63298, "word": "dude!\n\n", "palign": 0, "startS": 44.20213, "success": true}, {"endS": 45.21941, "word": "Hey! ", "palign": 0, "startS": 44.72872, "success": true}, {"endS": 45.39894, "word": "Sky ", "palign": 0, "startS": 45.27926, "success": true}, {"endS": 45.6383, "word": "hai ", "palign": 0, "startS": 45.47872, "success": true}, {"endS": 45.92553, "word": "blue, ", "palign": 0, "startS": 45.69814, "success": true}, {"endS": 46.21277, "word": "blue, ", "palign": 0, "startS": 45.9734, "success": true}, {"endS": 46.64894, "word": "blue\n\n", "palign": 0, "startS": 46.30851, "success": true}, {"endS": 46.91489, "word": "Saath ", "palign": 0, "startS": 46.70213, "success": true}, {"endS": 47.07447, "word": "mein ", "palign": 0, "startS": 46.95479, "success": true}, {"endS": 47.4734, "word": "apna ", "palign": 0, "startS": 47.19415, "success": true}, {"endS": 47.82447, "word": "crew, ", "palign": 0, "startS": 47.55319, "success": true}, {"endS": 48, "word": "crew, ", "palign": 0, "startS": 47.85638, "success": true}, {"endS": 48.27128, "word": "crew\n\n", "palign": 0, "startS": 48.04787, "success": true}, {"endS": 48.51064, "word"...'::jsonb,
        '{"0":[{"end":8767,"text":"Yeah!","index":0,"start":7779},{"end":10452,"text":"Weekend ka scene hai set!","index":1,"start":8636},{"end":12407,"text":"Gaurav ne phone kiya, bola \" No regret!\"","index":2,"start":10332},{"end":16656,"text":"Aaj sab kuch full-on hai, no stress! (","index":3,"start":12247},{"end":19149,"text":"Verse 1) Dhoop hai shining bright, mood hai dynamite Saurabh le","index":4,"start":16476},{"end":21817,"text":"aaya speakers, set kar di poori night Pratyush on the console,","index":5,"start":19029},{"end":24255,"text":"dropping beats so right Aur Shivam ne maari entry, kya cool si","index":6,"start":21653},{"end":24628,"text":"sight!","index":7,"start":24119},{"end":25680,"text":"Vineet bola, \" Let''s go!\",","index":8,"start":24454},{"end":26689,"text":"with all his might! (","index":9,"start":25503},{"end":29441,"text":"Pre-Chorus) Glasses mein ice, no advice!","index":10,"start":26582},{"end":31356,"text":"Tension ko feko, everything is nice!","index":11,"start":29281},{"end":36330,"text":"Paani mein ab aag lagegi, just roll the dice! (","index":12,"start":31196},{"end":36755,"text":"Chorus) Hey!","index":13,"start":36139},{"end":41330,"text":"Paani hai blue, blue, blue Masti on loop, loop, loop Apni yaaron","index":14,"start":36609},{"end":44633,"text":"waali pool party Scene hai super-duper-hit, dude!","index":15,"start":41249},{"end":45219,"text":"Hey!","index":16,"start":44529},{"end":48511,"text":"Sky hai blue, blue, blue Saath mein apna crew, crew, crew Apni","index":17,"start":45079},{"end":65455,"text":"yaaron waali pool party Scene hai super-duper-hit, dude! (","index":18,"start":48430},{"end":72207,"text":"Verse 2) Vijay ne maara splash, ek dum cannonball Jaishankar sabko","index":19,"start":65345},{"end":75096,"text":"pukaare, \" Come on, have a ball!\"","index":20,"start":72087},{"end":79707,"text":"Biren kar raha chill, swimming past the wall Aur Jiten khada side","index":21,"start":74928},{"end":83298,"text":"mein, looking cool and tall Yaari ki apni picture, bigger than them","index":22,"start":79547},{"end":83816,"text":"all! (","index":23,"start":83178},{"end":87527,"text":"Pre-Chorus) Glasses mein ice, no advice!","index":24,"start":83710},{"end":89441,"text":"Tension ko feko, everything is nice!","index":25,"start":87366},{"end":92766,"text":"Paani mein ab aag lagegi, just roll the dice! (","index":26,"start":89281},{"end":94734,"text":"Chorus) Hey!","index":27,"start":92584},{"end":99495,"text":"Paani hai blue, blue, blue Masti on loop, loop, loop Apni yaaron","index":28,"start":94561},{"end":103053,"text":"waali pool party Scene hai super-duper-hit, dude!","index":29,"start":99374},{"end":103305,"text":"Hey!","index":30,"start":102917},{"end":106676,"text":"Sky hai blue, blue, blue Saath mein apna crew, crew, crew Apni","index":31,"start":103164},{"end":110505,"text":"yaaron waali pool party Scene hai super-duper-hit, dude!","index":32,"start":106555},{"end":114495,"text":"East or west, apne dost hain best Life ke har exam mein, paas","index":33,"start":110345},{"end":115691,"text":"karte hain test!","index":34,"start":114454},{"end":125785,"text":"From the first day to forever, no contest!","index":35,"start":115531},{"end":127660,"text":"Gaurav, Shiv, Aloke, Rajan!","index":36,"start":125644},{"end":129521,"text":"Jiten, Saurabh, Pratyush, Shivam!","index":37,"start":127539},{"end":131449,"text":"Vineet, Vijay, Jaishankar, Biren!","index":38,"start":129374},{"end":133205,"text":"Saare ke saare hain number one!","index":39,"start":131309},{"end":155537,"text":"C''mon!","index":40,"start":133045},{"end":157713,"text":"Hey!","index":41,"start":155433},{"end":162287,"text":"Paani hai blue, blue, blue Masti on loop, loop, loop Apni yaaron","index":42,"start":157566},{"end":165926,"text":"waali pool party Scene hai super-duper-hit, dude!","index":43,"start":162207},{"end":166177,"text":"Hey!","index":44,"start":165789},{"end":169468,"text":"Sky hai blue, blue, blue Saath mein apna crew, crew, crew Apni","index":45,"start":166037},{"end":172793,"text":"yaaron waali pool party Scene hai super-duper-hit, dude!","index":46,"start":169388},{"end":172915,"text":"Yeah!","index":47,"start":172619},{"end":173984,"text":"That''s my crew!","index":48,"start":172731},{"end":174993,"text":"Hey Shiv!","index":49,"start":173848},{"end":176011,"text":"Hey Aloke!","index":50,"start":174893},{"end":178037,"text":"Rajan, music badha de bro! (","index":51,"start":175890},{"end":178758,"text":"Bro, turn up the music!)","index":52,"start":177853},{"end":180824,"text":"That''s right!","index":53,"start":178569},{"end":182872,"text":"Scene hai super-duper-hit, dude!","index":54,"start":180638}]}'::jsonb,
        '{"original_id":34,"original_sequence":null,"duration":"185.16","song_url":"https://cdn1.suno.ai/7640609c-d9ea-4ca2-aab9-8dfe9cd314a9.mp3","has_timestamped_lyrics":true,"migration_date":"2025-10-03T14:04:29.159Z","suno_task_id":"3433e364182372bbad962effa42f0fd9"}'::jsonb,
        ld.id,
        'Melodia',
        ARRAY['Party','Friendship'],
        ARRAY['Energy','Dhol','Punjabi'],
        true,
        false,
        NULL,
        '2025-08-30 12:16:09.42412+00'
    FROM song_requests sr
    JOIN lyrics_drafts ld ON ld.song_request_id = sr.id
    WHERE sr.requester_name = 'admin' 
      AND sr.recipient_details = 'Public Library Song: Yaaron Waali Pool Party'
    LIMIT 1;

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
