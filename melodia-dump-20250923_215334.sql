-- Melodia Database Dump
-- Generated on: 2025-09-23T16:23:34.351Z
-- Total Tables: 8

-- Disable foreign key checks
SET session_replication_role = replica;

-- Table: song_requests (26 records)

      CREATE TABLE IF NOT EXISTS song_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        requester_name TEXT NOT NULL,
        phone_number TEXT,
        email TEXT,
        delivery_preference TEXT,
        recipient_name TEXT NOT NULL,
        recipient_relationship TEXT NOT NULL,
        languages TEXT[] NOT NULL,
        person_description TEXT,
        song_type TEXT,
        emotions TEXT[],
        additional_details TEXT,
        status TEXT DEFAULT 'pending',
        suno_task_id TEXT,
        generated_song_id INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        lyrics_status TEXT DEFAULT 'pending',
        approved_lyrics_id INTEGER,
        lyrics_locked_at TIMESTAMP WITH TIME ZONE,
        payment_id INTEGER,
        payment_status TEXT DEFAULT 'pending',
        payment_required BOOLEAN DEFAULT true,
        anonymous_user_id UUID
      );

-- Data for song_requests
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (51, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T22:32:14.615Z"', '"2025-09-20T22:32:14.615Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (58, NULL, NULL, 'Varsha Chavda', NULL, NULL, 'email', 'best friend', 'Birthday', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-23T16:17:14.713Z"', '"2025-09-23T16:17:14.713Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (34, NULL, NULL, 'Anonymous', NULL, NULL, NULL, 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T20:28:56.839Z"', '"2025-09-20T20:28:56.839Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (35, NULL, NULL, 'Anonymous', NULL, NULL, NULL, 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T20:29:37.903Z"', '"2025-09-20T20:29:37.903Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (33, NULL, NULL, 'Test User', NULL, NULL, NULL, 'Test Friend', 'friend', '["English"]', NULL, NULL, NULL, 'Test song', 'pending', NULL, NULL, '"2025-09-20T20:28:27.826Z"', '"2025-09-20T20:28:27.826Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (36, NULL, NULL, 'Anonymous', NULL, NULL, NULL, 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T20:38:53.200Z"', '"2025-09-20T20:38:53.200Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (37, NULL, NULL, 'Anonymous', NULL, NULL, NULL, 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T20:41:00.486Z"', '"2025-09-20T20:41:00.486Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (38, NULL, NULL, 'Anonymous', NULL, NULL, NULL, 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T20:41:01.279Z"', '"2025-09-20T20:41:01.279Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (39, NULL, NULL, 'Test User', NULL, NULL, NULL, 'Best Friend', 'friend', '["English"]', NULL, NULL, NULL, 'Test details', 'pending', NULL, NULL, '"2025-09-20T20:42:14.707Z"', '"2025-09-20T20:42:14.707Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (40, 1, NULL, 'Anonymous', NULL, NULL, 'email', 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:00:53.267Z"', '"2025-09-20T21:00:53.267Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (41, 1, NULL, 'Test User', NULL, 'test@example.com', 'email', 'Best Friend', 'friend', '["English"]', NULL, NULL, NULL, 'Test details', 'pending', NULL, NULL, '"2025-09-20T21:12:56.692Z"', '"2025-09-20T21:12:56.692Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (42, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:22:37.233Z"', '"2025-09-20T21:22:37.233Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (43, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:22:53.913Z"', '"2025-09-20T21:22:53.913Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (44, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:24:47.470Z"', '"2025-09-20T21:24:47.470Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (45, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["Hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:25:47.434Z"', '"2025-09-20T21:25:47.434Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (46, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:38:04.214Z"', '"2025-09-20T21:38:04.214Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (47, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T21:38:30.920Z"', '"2025-09-20T21:38:30.920Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (48, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T22:19:47.118Z"', '"2025-09-20T22:19:47.118Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (49, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T22:20:13.859Z"', '"2025-09-20T22:20:13.859Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (50, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["hindi"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-20T22:20:21.842Z"', '"2025-09-20T22:20:21.842Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (52, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'suchi,my bestie', 'friend', '["hindi"]', NULL, NULL, NULL, 'a bestfriend', 'pending', NULL, NULL, '"2025-09-21T08:12:48.649Z"', '"2025-09-21T08:13:01.854Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (53, 1, NULL, 'Varsha Chavda', NULL, 'chavdavarsha860@gmail.com', 'email', 'best friend', 'Birthday', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-21T08:20:47.607Z"', '"2025-09-21T08:20:47.607Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (54, NULL, NULL, 'Varsha', NULL, NULL, 'email', 'suchi,bestie', 'Wedding', '["Hindi"]', NULL, NULL, NULL, 'Romantic style song.', 'pending', NULL, NULL, '"2025-09-22T17:35:02.985Z"', '"2025-09-22T17:35:02.985Z"', 'approved', 66, '"2025-09-22T17:36:13.370Z"', NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (55, NULL, NULL, 'Varsha', NULL, NULL, 'email', 'suchi,bestie', 'Wedding', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'pending', NULL, NULL, '"2025-09-23T09:36:03.739Z"', '"2025-09-23T09:36:03.739Z"', 'pending', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (56, NULL, NULL, 'Test Requester', NULL, NULL, NULL, 'Test User', 'friend', '["English"]', NULL, NULL, NULL, 'Test details', 'processing', 'demo-task-1758620565540', 49, '"2025-09-23T09:41:19.552Z"', '"2025-09-23T09:41:19.552Z"', 'needs_review', NULL, NULL, NULL, 'pending', true);
INSERT INTO song_requests (id, user_id, anonymous_user_id, requester_name, phone_number, email, delivery_preference, recipient_name, recipient_relationship, languages, person_description, song_type, emotions, additional_details, status, suno_task_id, generated_song_id, created_at, updated_at, lyrics_status, approved_lyrics_id, lyrics_locked_at, payment_id, payment_status, payment_required) VALUES (57, NULL, NULL, 'Varsha', NULL, NULL, 'email', 'suchi,bestie', 'Wedding', '["English"]', NULL, NULL, NULL, 'Sentimental style song.', 'processing', 'demo-task-1758620927643', 50, '"2025-09-23T09:48:41.888Z"', '"2025-09-23T09:48:41.888Z"', 'approved', 69, '"2025-09-23T09:48:47.616Z"', NULL, 'pending', true);

-- Table: songs (4 records)

      CREATE TABLE IF NOT EXISTS songs (
        id SERIAL PRIMARY KEY,
        song_request_id INTEGER,
        user_id INTEGER,
        title TEXT NOT NULL,
        lyrics TEXT NOT NULL,
        music_style TEXT,
        service_provider TEXT,
        song_requester TEXT,
        prompt TEXT,
        slug TEXT UNIQUE,
        status TEXT DEFAULT 'pending',
        suno_task_id TEXT,
        duration INTEGER,
        audio_url TEXT,
        image_url TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Data for songs
INSERT INTO songs (id, song_request_id, user_id, created_at, title, lyrics, duration, slug, status, is_featured, song_url_variant_1, song_url_variant_2, metadata, timestamp_lyrics, timestamped_lyrics_variants, timestamped_lyrics_api_responses, service_provider, song_requester, prompt, song_url, music_style, is_active, categories, tags, suno_task_id, add_to_library, is_deleted, negative_tags, suno_variants, selected_variant, status_checked_at, last_status_check, status_check_count, payment_id) VALUES (47, NULL, NULL, '"2025-09-15T09:46:19.590Z"', 'Song for suchi,my bestie', 'Intro:
एक धुन है प्यारी, एक गीत है नया
मेरी suchi के लिए, जो है मेरी बेस्टी

Verse 1:
जब से मिली हो, suchi तुम
खुशियों का मौसम आया
हर दिन हर पल संग तुम्हारे
जीवन में रंग छाया

Chorus:
ओ मेरी suchi, तुम हो मेरी बेस्टी
प्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती
खुशियों भरी ये राहें, संग चलें हम सदा
तेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा

Verse 2:
तेरी हँसी में मेरी खुशी
तेरी बातों में सुकून है
हर पल तेरा साथ पाकर
मेरा दिल ये मगन है

Chorus:
ओ मेरी suchi, तुम हो मेरी बेस्टी
प्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती
खुशियों भरी ये राहें, संग चलें हम सदा
तेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा

Verse 3:
सुख दुख में तुम संग रही
हर पल दिया सहारा
तेरी दोस्ती की कसम
तू है मेरा सितारा

Chorus:
ओ मेरी suchi, तुम हो मेरी बेस्टी
प्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती
खुशियों भरी ये राहें, संग चलें हम सदा
तेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा

Bridge:
समय की धुन पर हम दोनों
सदा ऐसे ही गाएँगे
ये दोस्ती का रिश्ता अपना
हमेशा निभाएँगे

Final Chorus:
ओ मेरी suchi, तुम हो मेरी बेस्टी
प्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती
खुशियों भरी ये राहें, संग चलें हम सदा
तेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा

Outro:
मेरी suchi...
मेरी बेस्टी...
खुशियाँ हैं तेरी...
सदा मेरी...', 240, 'suchi,my-bestie-1757929579589-jfmrmq', 'ready', false, NULL, NULL, '{"original_request_id":30}', NULL, '{}', '{}', 'Suno', 'suchi,my bestie', 'Personalized song for suchi,my bestie', 'https://apiboxfiles.erweima.ai/YmY4MDQzYmUtNTQ3Ny00YjlmLWI4OGMtZmMyNGI5ZWFiZDli.mp3', 'Personal', true, NULL, NULL, 'a9ee977a42d72a905131a5dea85599c2', true, false, NULL, '[{"id":"bf8043be-5477-4b9f-b88c-fc24b9eabd9b","tags":"Personal","title":"Song for suchi,my bestie","prompt":"Title: Song for suchi,my bestie\n\nLyrics:\nIntro:\nएक धुन है प्यारी, एक गीत है नया\nमेरी suchi के लिए, जो है मेरी बेस्टी\n\nVerse 1:\nजब से मिली हो, suchi तुम\nखुशियों का मौसम आया\nहर दिन हर पल संग तुम्हारे\nजीवन में रंग छाया\n\nChorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nVerse 2:\nतेरी हँसी में मेरी खुशी\nतेरी बातों में सुकून है\nहर पल तेरा साथ पाकर\nमेरा दिल ये मगन है\n\nChorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nVerse 3:\nसुख दुख में तुम संग रही\nहर पल दिया सहारा\nतेरी दोस्ती की कसम\nतू है मेरा सितारा\n\nChorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nBridge:\nसमय की धुन पर हम दोनों\nसदा ऐसे ही गाएँगे\nये दोस्ती का रिश्ता अपना\nहमेशा निभाएँगे\n\nFinal Chorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nOutro:\nमेरी suchi...\nमेरी बेस्टी...\nखुशियाँ हैं तेरी...\nसदा मेरी...\n\nStyle: Personal","audioUrl":"https://apiboxfiles.erweima.ai/YmY4MDQzYmUtNTQ3Ny00YjlmLWI4OGMtZmMyNGI5ZWFiZDli.mp3","duration":240,"imageUrl":"https://apiboxfiles.erweima.ai/YmY4MDQzYmUtNTQ3Ny00YjlmLWI4OGMtZmMyNGI5ZWFiZDli.jpeg","modelName":"chirp-v4","createTime":1757929754155,"streamAudioUrl":"https://mfile.erweima.ai/YmY4MDQzYmUtNTQ3Ny00YjlmLWI4OGMtZmMyNGI5ZWFiZDli"},{"id":"2f7cf9e7-becb-41a0-9279-9a995bfa2dba","tags":"Personal","title":"Song for suchi,my bestie","prompt":"Title: Song for suchi,my bestie\n\nLyrics:\nIntro:\nएक धुन है प्यारी, एक गीत है नया\nमेरी suchi के लिए, जो है मेरी बेस्टी\n\nVerse 1:\nजब से मिली हो, suchi तुम\nखुशियों का मौसम आया\nहर दिन हर पल संग तुम्हारे\nजीवन में रंग छाया\n\nChorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nVerse 2:\nतेरी हँसी में मेरी खुशी\nतेरी बातों में सुकून है\nहर पल तेरा साथ पाकर\nमेरा दिल ये मगन है\n\nChorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nVerse 3:\nसुख दुख में तुम संग रही\nहर पल दिया सहारा\nतेरी दोस्ती की कसम\nतू है मेरा सितारा\n\nChorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nBridge:\nसमय की धुन पर हम दोनों\nसदा ऐसे ही गाएँगे\nये दोस्ती का रिश्ता अपना\nहमेशा निभाएँगे\n\nFinal Chorus:\nओ मेरी suchi, तुम हो मेरी बेस्टी\nप्यारी दोस्ती ये अपनी, सबसे हसीन हस्ती\nखुशियों भरी ये राहें, संग चलें हम सदा\nतेरा साथ है तो सब कुछ है, ऐसा है मेरा वादा\n\nOutro:\nमेरी suchi...\nमेरी बेस्टी...\nखुशियाँ हैं तेरी...\nसदा मेरी...\n\nStyle: Personal","audioUrl":"https://apiboxfiles.erweima.ai/MmY3Y2Y5ZTctYmVjYi00MWEwLTkyNzktOWE5OTViZmEyZGJh.mp3","duration":240,"imageUrl":"https://apiboxfiles.erweima.ai/MmY3Y2Y5ZTctYmVjYi00MWEwLTkyNzktOWE5OTViZmEyZGJh.jpeg","modelName":"chirp-v4","createTime":1757929754155,"streamAudioUrl":"https://mfile.erweima.ai/MmY3Y2Y5ZTctYmVjYi00MWEwLTkyNzktOWE5OTViZmEyZGJh"}]', 0, NULL, NULL, 0, NULL);
INSERT INTO songs (id, song_request_id, user_id, created_at, title, lyrics, duration, slug, status, is_featured, song_url_variant_1, song_url_variant_2, metadata, timestamp_lyrics, timestamped_lyrics_variants, timestamped_lyrics_api_responses, service_provider, song_requester, prompt, song_url, music_style, is_active, categories, tags, suno_task_id, add_to_library, is_deleted, negative_tags, suno_variants, selected_variant, status_checked_at, last_status_check, status_check_count, payment_id) VALUES (48, NULL, NULL, '"2025-09-22T17:36:13.487Z"', 'Song for suchi,bestie', 'Intro:
आज ये पल आया है
दिल में खुशी लाया है

Verse 1:
कितने दिन कितने साल
साथ चले हम
हर धूप हर छाँव में
साथ तेरा मिला

Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Verse 2:
हँसते रोते साथ रहे
कोई ना थी दूरी
हर बात हर काम में
तूने दी पूरी

Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Verse 3:
आज मेरी शादी है
तू मेरे पास खड़ी
तेरी आँखों में देखी मैंने
एक अपनी खुशी

Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Bridge:
ये बंधन हमारा
समय से भी ऊपर
तेरी दोस्ती ही तो है
जीवन का सफर

Final Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Outro:
ये दोस्ती रहे सदा
मेरी suchi, मेरी दुआ', NULL, 'suchi,bestie-1758562573486-hexyuy', 'processing', false, NULL, NULL, '{"approved_lyrics_id":66,"original_request_id":54}', NULL, '{}', '{}', 'Suno', 'Varsha', 'Personalized song for suchi,bestie - Wedding', NULL, 'Personal', true, NULL, NULL, NULL, true, false, NULL, '{}', NULL, NULL, NULL, 0, NULL);
INSERT INTO songs (id, song_request_id, user_id, created_at, title, lyrics, duration, slug, status, is_featured, song_url_variant_1, song_url_variant_2, metadata, timestamp_lyrics, timestamped_lyrics_variants, timestamped_lyrics_api_responses, service_provider, song_requester, prompt, song_url, music_style, is_active, categories, tags, suno_task_id, add_to_library, is_deleted, negative_tags, suno_variants, selected_variant, status_checked_at, last_status_check, status_check_count, payment_id) VALUES (49, 56, 1, '"2025-09-23T09:42:45.542Z"', 'Demo Song for Test User', 'Demo lyrics for Test User', NULL, 'test-user-1758620565540-ev93tr', 'processing', false, NULL, NULL, '{"demo_mode":true,"original_request_id":56}', NULL, '{}', '{}', 'Suno', 'Test User', 'Personalized song for Test User', NULL, 'Personal', true, NULL, NULL, 'demo-task-1758620565540', true, false, NULL, '{}', NULL, NULL, NULL, 0, NULL);
INSERT INTO songs (id, song_request_id, user_id, created_at, title, lyrics, duration, slug, status, is_featured, song_url_variant_1, song_url_variant_2, metadata, timestamp_lyrics, timestamped_lyrics_variants, timestamped_lyrics_api_responses, service_provider, song_requester, prompt, song_url, music_style, is_active, categories, tags, suno_task_id, add_to_library, is_deleted, negative_tags, suno_variants, selected_variant, status_checked_at, last_status_check, status_check_count, payment_id) VALUES (50, 57, 1, '"2025-09-23T09:48:47.642Z"', 'Demo Song for suchi,bestie, my wedding', 'Demo lyrics for suchi,bestie, my wedding:

Verse 1:
This is a demo song
Created just for you
With love and care
And friendship true

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Verse 2:
Memories we''ve shared
Will always remain
In our hearts forever
Through joy and pain

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Outro:
So here''s to you, suchi,bestie, my wedding
On this wonderful day
May happiness and joy
Always come your way', NULL, 'suchi,bestie-1758620927643-0nnzmn', 'processing', false, NULL, NULL, '{"demo_mode":true,"original_request_id":57}', NULL, '{}', '{}', 'Suno', 'suchi,bestie', 'Personalized song for suchi,bestie', NULL, 'Personal', true, NULL, NULL, 'demo-task-1758620927643', true, false, NULL, '{}', NULL, NULL, NULL, 0, NULL);

-- Table: lyrics_drafts (21 records)

      CREATE TABLE IF NOT EXISTS lyrics_drafts (
        id SERIAL PRIMARY KEY,
        song_request_id INTEGER NOT NULL,
        version INTEGER NOT NULL,
        language TEXT[],
        structure JSONB,
        prompt_input JSONB,
        generated_text TEXT,
        edited_text TEXT,
        status TEXT DEFAULT 'draft',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Data for lyrics_drafts
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (49, 33, 1, '["English"]', NULL, NULL, NULL, NULL, 'Intro:
A quiet note starts
For you, Test Friend

Verse 1:
Days pass, moments fly
You are always nearby
Test Friend, I see you
My friend, strong and true

Chorus:
Test Friend, my friend
On you, I can depend
You are there, for me
A simple friendship, free

Verse 2:
When things are hard or bright
You bring a steady light
I know you are here
To help ease any fear

Chorus:
Test Friend, my friend
On you, I can depend
You are there, for me
A simple friendship, free

Verse 3:
We share our time, just so
Our connection, it does grow
Test Friend, a constant presence
Your friendship, my essence

Chorus:
Test Friend, my friend
On you, I can depend
You are there, for me
A simple friendship, free

Bridge:
Years go by, but you remain
Through joy, and through any pain
A bond that stays strong
Where we both belong

Final Chorus:
Test Friend, my friend
On you, I can depend
You are there, for me
A simple friendship, free

Outro:
Test Friend, my friend
Until the end.', NULL, 'draft', false, NULL, '"2025-09-20T20:38:00.591Z"', '"2025-09-20T20:38:00.591Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (50, 33, 2, '["English"]', NULL, NULL, NULL, '{"refineText":"Make it more romantic"}', 'Here are the refined lyrics, made more romantic as per your request:

Intro:
A quiet note starts
For you, my Test Friend

Verse 1:
Days pass, moments fly
You are always on my mind
Test Friend, I long for you
My darling, deep and true

Chorus:
Test Friend, my love
On you, my heart depends
You are there, for me
Our love, meant to be

Verse 2:
When things are hard or bright
You are my guiding light
I know you are here
To soothe my every fear

Chorus:
Test Friend, my love
On you, my heart depends
You are there, for me
Our love, meant to be

Verse 3:
We cherish every moment
Our deep connection grows
Test Friend, my constant dream
Your love, my very essence

Chorus:
Test Friend, my love
On you, my heart depends
You are there, for me
Our love, meant to be

Bridge:
Years go by, but you remain
Through joy, and through any pain
A love that keeps us strong
Where our hearts belong

Final Chorus:
Test Friend, my love
On you, my heart depends
You are there, for me
Our love, meant to be

Outro:
Test Friend, my love
Forever with you, until the end.', NULL, 'draft', false, NULL, '"2025-09-20T20:39:53.027Z"', '"2025-09-20T20:39:53.027Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (51, 39, 1, '["English"]', NULL, NULL, NULL, NULL, 'Intro:
A simple thought takes hold
A story to unfold

Verse 1:
Through days both short and long
I find where I belong
With you always near
My Best Friend, you are here.

Chorus:
Oh, Best Friend, yes, it''s true
My gratitude for you
A steadfast, loyal heart
Right from the very start.

Verse 2:
We''ve walked through sun and shade
No bond could ever fade
With every passing time
Your presence is sublime.

Chorus:
Oh, Best Friend, yes, it''s true
My gratitude for you
A steadfast, loyal heart
Right from the very start.

Verse 3:
Whatever life may bring
New songs for us to sing
I know you''ll stand by me
For all eternity.

Chorus:
Oh, Best Friend, yes, it''s true
My gratitude for you
A steadfast, loyal heart
Right from the very start.

Bridge:
A special place you keep
While others are asleep
A bond that''s strong and deep
Secrets we always keep.

Final Chorus:
Oh, Best Friend, yes, it''s true
My gratitude for you
A steadfast, loyal heart
Right from the very start.

Outro:
My Best Friend, you see
Always for me.', NULL, 'draft', false, NULL, '"2025-09-20T20:42:24.863Z"', '"2025-09-20T20:42:24.863Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (52, 39, 2, '["English"]', NULL, NULL, NULL, '{"refineText":"Make it more romantic"}', 'Here are the refined lyrics, made more romantic as requested:

**Intro:**
A whisper in my soul,
Makes my whole world whole.

**Verse 1:**
Through days both long and brief,
You offer sweet relief.
In your embrace, I''m home,
No longer left to roam.

**Chorus:**
Oh, Best Friend, yes, it''s true,
My loving heart for you.
A bond beyond compare,
A future we can share.

**Verse 2:**
We''ve walked through sun and rain,
You ease my every pain.
This bond, a gentle flame,
I whisper your sweet name.

**Chorus:**
Oh, Best Friend, yes, it''s true,
My loving heart for you.
A bond beyond compare,
A future we can share.

**Verse 3:**
Whatever paths we roam,
With you, I''m truly home.
I know you''ll walk with me,
Through all eternity.

**Chorus:**
Oh, Best Friend, yes, it''s true,
My loving heart for you.
A bond beyond compare,
A future we can share.

**Bridge:**
A sacred space we share,
Beyond all worldly care.
A love both strong and deep,
Our precious secrets keep.

**Final Chorus:**
Oh, Best Friend, yes, it''s true,
My loving heart for you.
A bond beyond compare,
A future we can share.

**Outro:**
My dearest friend, my soul,
You make my spirit whole.', NULL, 'draft', false, NULL, '"2025-09-20T20:42:42.627Z"', '"2025-09-20T20:42:42.627Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (53, 40, 1, '["Hindi"]', NULL, NULL, NULL, NULL, 'Intro:
आज का ये दिन कुछ खास है
तेरी दोस्ती मेरे पास है

Verse 1:
पल ये खुशियों से भरा है
जीवन का रंग निखरा है
तू साथ है तो सब है सही
कोई कमी अब रही नहीं

Chorus:
मेरे जन्मदिन पर, ओ best friend
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ best friend

Verse 2:
हंसी-खुशी में तू संग रहा
गम के पल भी तूने सहा
तेरी बातें, तेरा हर अंदाज़
बनाता है हर दिन खास आज

Chorus:
मेरे जन्मदिन पर, ओ best friend
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ best friend

Verse 3:
ख्वाबों को तूने राह दिखाई
हर चुनौती में हिम्मत बंधाई
सच्ची दोस्ती की ये निशानी
तेरी-मेरी ये अमर कहानी

Chorus:
मेरे जन्मदिन पर, ओ best friend
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ best friend

Bridge:
रिश्ता ये गहरा, सबसे अनमोल
बिना तेरे, जीवन का न मोल
तू है तो हर राह आसान
तेरी दोस्ती है मेरी पहचान

Final Chorus:
मेरे जन्मदिन पर, ओ best friend
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ best friend

Outro:
तेरा साथ बना रहे सदा
यह दुआ है हर पल मेरा
आज और हमेशा, best friend
आज और हमेशा, best friend', NULL, 'draft', false, NULL, '"2025-09-20T21:01:15.811Z"', '"2025-09-20T21:01:15.811Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (54, 40, 2, '["Hindi"]', NULL, NULL, NULL, '{"refineText":"add name suchi in this song"}', 'Here are the improved and refined lyrics with the name "Suchi" added, as per your request:

**Refined Lyrics (Version 2):**

Intro:
आज का ये दिन कुछ खास है
तेरी दोस्ती मेरे पास है

Verse 1:
पल ये खुशियों से भरा है
जीवन का रंग निखरा है
तू साथ है तो सब है सही
कोई कमी अब रही नहीं

Chorus:
मेरे जन्मदिन पर, ओ Suchi
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ Suchi

Verse 2:
हंसी-खुशी में तू संग रहा
गम के पल भी तूने सहा
तेरी बातें, तेरा हर अंदाज़
बनाता है हर दिन खास आज

Chorus:
मेरे जन्मदिन पर, ओ Suchi
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ Suchi

Verse 3:
ख्वाबों को तूने राह दिखाई
हर चुनौती में हिम्मत बंधाई
सच्ची दोस्ती की ये निशानी
तेरी-मेरी ये अमर कहानी

Chorus:
मेरे जन्मदिन पर, ओ Suchi
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ Suchi

Bridge:
रिश्ता ये गहरा, सबसे अनमोल
बिना तेरे, जीवन का न मोल
तू है तो हर राह आसान
तेरी दोस्ती है मेरी पहचान

Final Chorus:
मेरे जन्मदिन पर, ओ Suchi
तेरा साथ है, यह है मेरा अंतहीन
हर पल तेरा साथ है, यह है मेरा वरदान
मेरे जन्मदिन पर, ओ Suchi

Outro:
तेरा साथ बना रहे सदा
यह दुआ है हर पल मेरा
आज और हमेशा, Suchi
आज और हमेशा, Suchi', NULL, 'draft', false, NULL, '"2025-09-20T21:01:45.419Z"', '"2025-09-20T21:01:45.419Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (55, 41, 1, '["English"]', NULL, NULL, NULL, NULL, 'Intro:
Just for you, my friend
A simple song, it''s true.

Verse 1:
We share so much, you see
Best Friend, my friend, you''re there for me.
Through passing days, we stand.
A helping heart, a helping hand.

Chorus:
Best Friend, my friend, it''s clear
You banish every fear.
Best Friend, my friend, so true
This simple song is just for you.

Verse 2:
We''ve seen it all, we have.
Best Friend, my friend, through every path.
No fancy words to say,
You make each moment light the way.

Chorus:
Best Friend, my friend, it''s clear
You banish every fear.
Best Friend, my friend, so true
This simple song is just for you.

Verse 3:
A bond so strong, it grows.
Best Friend, my friend, everyone knows.
A steady presence near,
You dry away each falling tear.

Chorus:
Best Friend, my friend, it''s clear
You banish every fear.
Best Friend, my friend, so true
This simple song is just for you.

Bridge:
No complex thoughts, no grand design,
Just you and I, our spirits twine.
A simple truth, a loyal heart,
Right from the very start.

Final Chorus:
Best Friend, my friend, it''s clear
You banish every fear.
Best Friend, my friend, so true
This simple song is just for you.

Outro:
Best Friend, my friend, it''s true.
Just for you.', NULL, 'draft', false, NULL, '"2025-09-20T21:13:09.350Z"', '"2025-09-20T21:13:09.350Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (56, 41, 2, '["English"]', NULL, NULL, NULL, '{"refineText":"Make it more emotional"}', 'Here are the refined lyrics, made more emotional as requested:

**Intro:**
A whisper from my heart, just for you, my friend
A simple melody, honest and true.

**Verse 1:**
We''ve built a world, just you and me
My dearest friend, a constant you''ll always be.
Through every storm, we find our ground
Your loving solace, always profound.

**Chorus:**
Oh, my best friend, it''s crystal clear
You chase away the shadows, calm every tear.
My truest friend, steadfast and kind
This heartfelt song, for you, you''ll find.

**Verse 2:**
Through laughter bright and tears we''ve cried
My cherished friend, forever by my side.
No grand pronouncements, just a gentle grace
You light my spirit, find my sacred place.

**Chorus:**
Oh, my best friend, it''s crystal clear
You chase away the shadows, calm every tear.
My truest friend, steadfast and kind
This heartfelt song, for you, you''ll find.

**Verse 3:**
This sacred bond, a strength that flows
My soul''s true mirror, deep down, everyone knows.
Your gentle spirit, ever near
You softly chase away each falling tear.

**Chorus:**
Oh, my best friend, it''s crystal clear
You chase away the shadows, calm every tear.
My truest friend, steadfast and kind
This heartfelt song, for you, you''ll find.

**Bridge:**
No complex thoughts, no grand design,
Just kindred spirits, our hearts entwine.
A truth so pure, a loyal soul,
Making my broken pieces whole.

**Final Chorus:**
Oh, my best friend, it''s crystal clear
You chase away the shadows, calm every tear.
My truest friend, steadfast and kind
This heartfelt song, for you, you''ll find.

**Outro:**
My dearest friend, forever true
This song, my heart, belongs to you.', NULL, 'draft', false, NULL, '"2025-09-20T21:13:41.652Z"', '"2025-09-20T21:13:41.652Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (57, 45, 1, '["Hindi"]', NULL, NULL, NULL, NULL, 'Intro:
(Soft guitar arpeggios, gentle piano chords)
एक धुन है जो दिल में गूँज रही है

Verse 1:
समय का चक्र यूँ ही चलता रहा
हर पल में तू साथ खड़ा रहा
यादें बनती गईं, कहानी चलती रही
तेरी दोस्ती की लौ, कभी न बुझी

Chorus:
मेरे हमदम, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Verse 2:
हँसी-मज़ाक के वो पल कितने प्यारे
आँखों में देखे हमने कितने सपने
तेरी बातें, तेरी वो हर अदा
हर पल ने दिया है इक नया सिला

Chorus:
मेरे हमदम, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Verse 3:
जीवन की राहों में मिलते हैं कई लोग
पर तेरे जैसा ना कोई अपना
हर मुश्किल में तूने थामा मेरा हाथ
तू ही तो है मेरी हर उम्मीद का साथ

Chorus:
मेरे हमदम, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Bridge:
यह बंधन है अटूट, ये रिश्ता गहरा
तेरी मौजूदगी से हर पल है सुनहरा
ना लफ़्ज़ों में बयाँ हो पाए ये एहसास
तू ही तो है मेरे दिल के सबसे पास

Final Chorus:
मेरे हमदम, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Outro:
(Gentle guitar and piano fade out)
तेरा साथ है, बस यही है दुआ
हमेशा रहे ये दोस्ती, सदा', NULL, 'draft', false, NULL, '"2025-09-20T21:26:06.476Z"', '"2025-09-20T21:26:06.476Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (58, 45, 2, '["Hindi"]', NULL, NULL, NULL, '{"refineText":"add name of suchi into this song"}', 'Here are the refined lyrics with "Suchi" incorporated, while maintaining the sentimental style and emotional connection:

**Current Lyrics (Version 2):**

Intro:
(Soft guitar arpeggios, gentle piano chords)
Suchi, एक धुन है जो दिल में गूँज रही है

Verse 1:
समय का चक्र यूँ ही चलता रहा
हर पल में तू साथ खड़ी रही
यादें बनती गईं, कहानी चलती रही
तेरी दोस्ती की लौ, कभी न बुझी

Chorus:
मेरी Suchi, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Verse 2:
हँसी-मज़ाक के वो पल कितने प्यारे
आँखों में देखे हमने कितने सपने
तेरी बातें, तेरी वो हर अदा
हर पल ने दिया है इक नया सिला

Chorus:
मेरी Suchi, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Verse 3:
जीवन की राहों में मिलते हैं कई लोग
पर तेरे जैसा ना कोई अपना
हर मुश्किल में तूने थामा मेरा हाथ
तू ही तो है मेरी हर उम्मीद का साथ

Chorus:
मेरी Suchi, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Bridge:
यह बंधन है अटूट, ये रिश्ता गहरा
तेरी मौजूदगी से हर पल है सुनहरा
ना लफ़्ज़ों में बयाँ हो पाए ये एहसास
तू ही तो है मेरे दिल के सबसे पास

Final Chorus:
मेरी Suchi, best friend, my birthday
तेरी दोस्ती है, मेरा अनमोल सहारा
हर कदम पर पाया है मैंने तेरा साथ
खुशियाँ हों या गम, तू है सबसे खास

Outro:
(Gentle guitar and piano fade out)
Suchi, तेरा साथ है, बस यही है दुआ
हमेशा रहे ये दोस्ती, सदा', NULL, 'draft', false, NULL, '"2025-09-20T21:26:51.820Z"', '"2025-09-20T21:26:51.820Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (59, 47, 1, '["English"]', NULL, NULL, NULL, NULL, '(
Intro
A quiet moment, a gentle thought
Of all the years, the joy you brought.

Verse 1
Through every season, sun and rain,
You''ve stood beside me, easing pain.
A steady presence, always true,
My world is brighter, because of you.

Chorus
So here''s to you, best friend, my birthday,
A special day, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Verse 2
We''ve shared the laughter, soft and clear,
And wiped away each falling tear.
Memories woven, strong and deep,
Promises that we always keep.

Chorus
So here''s to you, best friend, my birthday,
A special day, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Verse 3
Another year, a journey new,
With adventures waiting, just for two.
Our bond grows stronger, day by day,
Lighting up every path and way.

Chorus
So here''s to you, best friend, my birthday,
A special day, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Bridge
More than words can ever say,
You make my life in every way.
A gift, a treasure, pure and kind,
The truest friendship I could find.

Final Chorus
So here''s to you, best friend, my birthday,
A happy wish, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Outro
Happy day, best friend,
Until the end.
)', NULL, 'draft', false, NULL, '"2025-09-20T21:38:43.530Z"', '"2025-09-20T21:38:43.530Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (60, 47, 2, '["English"]', NULL, NULL, NULL, '{"refineText":"add name of suchi into this song"}', 'Here are the refined lyrics with Suchi''s name added:

Intro
A quiet moment, a gentle thought
Of all the years, the joy you brought.

Verse 1
Through every season, sun and rain,
You''ve stood beside me, easing pain.
A steady presence, always true,
My world is brighter, because of you.

Chorus
So here''s to you, Suchi, my birthday,
A special day, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Verse 2
We''ve shared the laughter, soft and clear,
And wiped away each falling tear.
Memories woven, strong and deep,
Promises that we always keep.

Chorus
So here''s to you, Suchi, my birthday,
A special day, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Verse 3
Another year, a journey new,
With adventures waiting, just for two.
Our bond grows stronger, day by day,
Lighting up every path and way.

Chorus
So here''s to you, Suchi, my birthday,
A special day, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Bridge
More than words can ever say,
You make my life in every way.
A gift, a treasure, pure and kind,
The truest friendship I could find.

Final Chorus
So here''s to you, Suchi, my birthday,
A happy wish, in every way.
My gratitude, it knows no end,
For you, my cherished, dearest friend.

Outro
Happy day, Suchi,
Until the end.', NULL, 'draft', false, NULL, '"2025-09-20T21:39:14.559Z"', '"2025-09-20T21:39:14.559Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (61, 50, 1, '["hindi"]', NULL, NULL, NULL, NULL, 'Intro
एक ख़ामोश पल है आज
दिल में कुछ बातें हैं ख़ास
तेरी यादें आती हैं पास

Verse 1
जब से तुम मिले हो मुझको
जीवन में रंग भरे हैं
हर सुख-दुख में साथ रहे हो
कितने रास्ते तय किए हैं

Chorus
तुम हो मेरे, best friend, my birthday
यह दोस्ती अनमोल है
हर लम्हा तेरे संग जीना
यह मेरा सबसे प्यारा बोल है

Verse 2
कभी हँसी, कभी आँसू थे
हर मोड़ पर तुम साथ थे
मेरी हर बात को समझा है
तुमने थामे मेरे हाथ थे

Chorus
तुम हो मेरे, best friend, my birthday
यह दोस्ती अनमोल है
हर लम्हा तेरे संग जीना
यह मेरा सबसे प्यारा बोल है

Verse 3
वक्त गुज़रा, पर तुम न बदले
रिश्ता ये गहरा होता गया
तेरी सादगी, तेरी वफ़ा से
यह दिल मेरा जुड़ता गया

Chorus
तुम हो मेरे, best friend, my birthday
यह दोस्ती अनमोल है
हर लम्हा तेरे संग जीना
यह मेरा सबसे प्यारा बोल है

Bridge
कोई और नहीं है तुम जैसा
जो इतना समझे मुझको
यह बंधन है रब का दिया
शुक्रिया तेरा, हर पल को

Final Chorus
तुम हो मेरे, best friend, my birthday
यह दोस्ती अनमोल है
हर लम्हा तेरे संग जीना
यह मेरा सबसे प्यारा बोल है

Outro
यह दोस्ती बनी रहे
सदा यूँ ही खिलती रहे
मेरे दिल की यह दुआ है
तुम सदा मेरे साथ रहो', NULL, 'draft', false, NULL, '"2025-09-20T22:20:37.747Z"', '"2025-09-20T22:20:37.747Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (62, 51, 1, '["English"]', NULL, NULL, NULL, NULL, 'Intro
(Piano arpeggios, soft and reflective)

Verse 1
Another year has come and gone, a gentle turn of time
A special day is dawning now, a moment so sublime
For you, best friend, standing strong, through every passing phase
We''ve walked through many seasons, in so many different ways.

Chorus
Happy birthday, best friend, a cheer for all you are
A guiding light, a constant truth, a shining, distant star
Through laughter, joy, and quiet tears, your presence always true
Happy birthday, best friend, this song is just for you.

Verse 2
Remember all the secrets shared, the dreams we spun so high
The silly jokes, the knowing looks, beneath a summer sky
You''ve always been a listener, a shoulder strong and kind
The rarest treasure, pure and deep, a bond we''ll always find.

Chorus
Happy birthday, best friend, a cheer for all you are
A guiding light, a constant truth, a shining, distant star
Through laughter, joy, and quiet tears, your presence always true
Happy birthday, best friend, this song is just for you.

Verse 3
The years may change, the world may shift, but some things stay the same
Like loyalty that never fades, an ever-burning flame
You celebrate my victories, you lift me when I fall
My trusted anchor, firm and true, you answer every call.

Chorus
Happy birthday, best friend, a cheer for all you are
A guiding light, a constant truth, a shining, distant star
Through laughter, joy, and quiet tears, your presence always true
Happy birthday, best friend, this song is just for you.

Bridge
So raise a glass to memories, and futures yet untold
A tapestry of moments woven, more precious than fine gold
May all your wishes now come true, on this your special day
Best friend, may joy surround you, in every single way.

Final Chorus
Happy birthday, best friend, a cheer for all you are
A guiding light, a constant truth, a shining, distant star
Through laughter, joy, and quiet tears, your presence always true
Happy birthday, best friend, this song is just for you.

Outro
(Piano fades out with a final, gentle chord, strings softly sustain)
Best friend... happy birthday to you.', NULL, 'draft', false, NULL, '"2025-09-20T22:32:31.935Z"', '"2025-09-20T22:32:31.935Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (63, 52, 1, '["hindi"]', NULL, NULL, NULL, NULL, 'Intro:
पलट के देखूँ तो कभी, एक नाम याद आता है
मेरे हर पल में, वो साथ निभाता है

Verse 1:
कभी हँसी, कभी आँसू, सब साथ बाँटा है
मेरी बातों को, तुमने हमेशा समझा है
जब भी मैं गिरी, तुमने हाथ बढ़ाया है
मेरी दुनिया में, तुम एक सहारा हो

Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Verse 2:
बिन कहे मेरी हर बात, तुम समझ जाती हो
मेरी चुप्पी में भी, तुम आवाज़ सुन लेती हो
दुनिया बदले चाहे, तुम कभी नहीं बदली
हमारी ये यारी, सबसे प्यारी है

Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Verse 3:
कितने भी साल गुज़रें, ये बंधन ना टूटेगा
हमारी दोस्ती का रंग, कभी ना छूटेगा
मेरे हर सपने में, तुम साथ खड़ी हो
हर पल, हर लम्हा, तुम पास रहती हो

Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Bridge:
कोई और ऐसा दोस्त, कहाँ मिलेगा भला
तुम जैसी सहेली, किस्मत से मिलती है
ये साथ तुम्हारा, ज़िंदगी का आधार है

Final Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Outro:
मेरी suchi, मेरी सबसे प्यारी दोस्त
हमेशा रहना तुम, मेरे पास, मेरे दोस्त', NULL, 'draft', false, NULL, '"2025-09-21T08:13:01.701Z"', '"2025-09-21T08:13:01.701Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (64, 52, 1, NULL, NULL, NULL, NULL, NULL, 'Intro:
पलट के देखूँ तो कभी, एक नाम याद आता है
मेरे हर पल में, वो साथ निभाता है

Verse 1:
कभी हँसी, कभी आँसू, सब साथ बाँटा है
मेरी बातों को, तुमने हमेशा समझा है
जब भी मैं गिरी, तुमने हाथ बढ़ाया है
मेरी दुनिया में, तुम एक सहारा हो

Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Verse 2:
बिन कहे मेरी हर बात, तुम समझ जाती हो
मेरी चुप्पी में भी, तुम आवाज़ सुन लेती हो
दुनिया बदले चाहे, तुम कभी नहीं बदली
हमारी ये यारी, सबसे प्यारी है

Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Verse 3:
कितने भी साल गुज़रें, ये बंधन ना टूटेगा
हमारी दोस्ती का रंग, कभी ना छूटेगा
मेरे हर सपने में, तुम साथ खड़ी हो
हर पल, हर लम्हा, तुम पास रहती हो

Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Bridge:
कोई और ऐसा दोस्त, कहाँ मिलेगा भला
तुम जैसी सहेली, किस्मत से मिलती है
ये साथ तुम्हारा, ज़िंदगी का आधार है

Final Chorus:
ओ suchi, तुम मेरी ऐसी दोस्त हो
जो हर मुश्किल में, मेरे साथ खड़ी हो
तुम्हारी दोस्ती, एक अनमोल तोहफा है
जीवन के सफ़र में, तुम ही मेरी राह हो

Outro:
मेरी suchi, मेरी सबसे प्यारी दोस्त
हमेशा रहना तुम, मेरे पास, मेरे दोस्त', NULL, 'draft', false, NULL, '"2025-09-21T08:13:01.851Z"', '"2025-09-21T08:13:01.851Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (65, 53, 1, '["English"]', NULL, NULL, NULL, NULL, 'Soft melodies begin
A quiet moment, just for us

Another year has turned its page
And here we stand, upon life''s stage
Through all the laughter, joy, and tears
You''ve been with me, through all these years
Today''s my day, a special sign
But truly, it''s our bond that shines

Oh, best friend, on my birthday bright
You fill my world with warmth and light
A steady anchor, true and kind
The dearest solace I can find
Thank you for every memory we share
A friendship beyond all compare

Remember whispered secrets, late at night?
And chasing dreams with all our might
We built a world, just me and you
With promises we saw come true
Through changing tides and passing time
Your loyal heart remains sublime

Oh, best friend, on my birthday bright
You fill my world with warmth and light
A steady anchor, true and kind
The dearest solace I can find
Thank you for every memory we share
A friendship beyond all compare

Some days are hard, the path unclear
But knowing you are always near
Gives strength to rise and face the day
To chase the shadows far away
This celebration, it is true
Feels richer, standing here with you

Oh, best friend, on my birthday bright
You fill my world with warmth and light
A steady anchor, true and kind
The dearest solace I can find
Thank you for every memory we share
A friendship beyond all compare

More than just a friend, a sister of my soul
You make my broken pieces whole
With every passing year, our bond grows deep
The precious promises we keep

Oh, best friend, on my birthday bright
You fill my world with warmth and light
A steady anchor, true and kind
The dearest solace I can find
Thank you for every memory we share
A friendship beyond all compare

Yes, best friend, always there
A bond so rare, beyond compare.
Happy birthday to me, shared with you.', NULL, 'draft', false, NULL, '"2025-09-21T08:21:06.618Z"', '"2025-09-21T08:21:06.618Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (66, 54, 1, '["Hindi"]', NULL, NULL, NULL, NULL, 'Intro:
आज ये पल आया है
दिल में खुशी लाया है

Verse 1:
कितने दिन कितने साल
साथ चले हम
हर धूप हर छाँव में
साथ तेरा मिला

Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Verse 2:
हँसते रोते साथ रहे
कोई ना थी दूरी
हर बात हर काम में
तूने दी पूरी

Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Verse 3:
आज मेरी शादी है
तू मेरे पास खड़ी
तेरी आँखों में देखी मैंने
एक अपनी खुशी

Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Bridge:
ये बंधन हमारा
समय से भी ऊपर
तेरी दोस्ती ही तो है
जीवन का सफर

Final Chorus:
मेरी suchi, मेरी दोस्त
तू है मेरी पहचान
तेरा साथ ही तो है
मेरे जीवन का मान

Outro:
ये दोस्ती रहे सदा
मेरी suchi, मेरी दुआ', NULL, 'approved', false, NULL, '"2025-09-22T17:35:47.079Z"', '"2025-09-22T17:35:47.079Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (68, 56, 1, '["English"]', NULL, NULL, NULL, '{"languages":["English"],"refineText":null,"recipient_name":"Test User","additional_details":"Test details"}', 'Demo lyrics for Test User:

Verse 1:
This is a demo song
Created just for you
With love and care
And friendship true

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Verse 2:
Memories we''ve shared
Will always remain
In our hearts forever
Through joy and pain

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Outro:
So here''s to you, Test User
On this wonderful day
May happiness and joy
Always come your way', NULL, 'draft', false, NULL, '"2025-09-23T09:41:24.962Z"', '"2025-09-23T09:41:24.962Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (69, 57, 1, '["English"]', NULL, NULL, NULL, '{"languages":["English"],"refineText":null,"recipient_name":"suchi,bestie, my wedding","additional_details":"Sentimental style song. "}', 'Demo lyrics for suchi,bestie, my wedding:

Verse 1:
This is a demo song
Created just for you
With love and care
And friendship true

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Verse 2:
Memories we''ve shared
Will always remain
In our hearts forever
Through joy and pain

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Outro:
So here''s to you, suchi,bestie, my wedding
On this wonderful day
May happiness and joy
Always come your way', NULL, 'approved', false, NULL, '"2025-09-23T09:48:41.959Z"', '"2025-09-23T09:48:47.607Z"');
INSERT INTO lyrics_drafts (id, song_request_id, version, language, tone, length_hint, structure, prompt_input, generated_text, edited_text, status, is_approved, created_by, created_at, updated_at) VALUES (70, 58, 1, '["English"]', NULL, NULL, NULL, '{"languages":["English"],"refineText":null,"recipient_name":"best friend, my birthday","additional_details":"Sentimental style song. "}', 'Demo lyrics for best friend, my birthday:

Verse 1:
This is a demo song
Created just for you
With love and care
And friendship true

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Verse 2:
Memories we''ve shared
Will always remain
In our hearts forever
Through joy and pain

Chorus:
Happy birthday to you
May all your dreams come true
This special day is yours
Through and through

Outro:
So here''s to you, best friend, my birthday
On this wonderful day
May happiness and joy
Always come your way', NULL, 'draft', false, NULL, '"2025-09-23T16:17:15.052Z"', '"2025-09-23T16:17:15.052Z"');

-- Table: users (1 records)

      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE,
        phone_number TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Data for users
INSERT INTO users (id, email, password_hash, name, created_at, updated_at) VALUES (1, 'chavdavarsha860@gmail.com', '$2b$12$m8AvWqabLHEIztsmsASbR.U1yiPVjkM38gTBPA36p14qRUOX3mk86', 'Varsha Chavda', '"2025-08-30T12:29:43.419Z"', '"2025-08-30T12:29:43.419Z"');

-- Table: admin_users (3 records)

      CREATE TABLE IF NOT EXISTS admin_users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        email TEXT,
        role TEXT DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Data for admin_users
INSERT INTO admin_users (id, username, password_hash, created_at) VALUES (1, 'admin1', 'melodia2024!', '"2025-08-30T11:00:51.685Z"');
INSERT INTO admin_users (id, username, password_hash, created_at) VALUES (2, 'admin2', 'melodia2024!', '"2025-08-30T11:00:51.685Z"');
INSERT INTO admin_users (id, username, password_hash, created_at) VALUES (3, 'admin3', 'melodia2024!', '"2025-08-30T11:00:51.685Z"');

-- Table: anonymous_users (1 records)

      CREATE TABLE IF NOT EXISTS anonymous_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Data for anonymous_users
INSERT INTO anonymous_users (id, created_at) VALUES ('d8f75984-e6cd-415b-af43-e95ede1b853e', '"2025-09-22T17:34:36.659Z"');

-- Table: payments (0 records)

      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER,
        amount DECIMAL(10,2) NOT NULL,
        currency TEXT DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        payment_method TEXT,
        transaction_id TEXT,
        metadata JSONB,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Table: payment_webhooks (0 records)

      CREATE TABLE IF NOT EXISTS payment_webhooks (
        id SERIAL PRIMARY KEY,
        payment_id INTEGER,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        processed BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );

-- Re-enable foreign key checks
SET session_replication_role = DEFAULT;

-- Dump completed
