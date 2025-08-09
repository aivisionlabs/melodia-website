-- Migration script to insert existing songs from constants into database
-- Run this after the Suno schema migration

-- Insert existing songs with their original IDs and data
INSERT INTO songs (
  id, created_at, title, lyrics, timestamp_lyrics, music_style,
  service_provider, song_requester, prompt, song_url, duration,
  slug, is_active, status, categories, tags, suno_task_id,
  negative_tags, suno_variants, selected_variant, metadata
) VALUES
  (1, '2024-01-01T00:00:00Z', 'Kaleidoscope Heart', NULL, NULL, 'Romantic Song', 'Melodia', NULL, NULL, '/audio/kaleidoscope.mp3', 189, 'kaleidoscope-heart', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (2, '2024-01-01T00:00:00Z', 'Same Office, Different Hearts', NULL, NULL, 'Love Story', 'Melodia', NULL, NULL, '/audio/office-love.mp3', 195, 'same-office-different-hearts', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (3, '2024-01-01T00:00:00Z', 'A kid''s night musical', NULL, NULL, 'Musical', 'Melodia', NULL, NULL, '/audio/kids-musical.mp3', 181, 'kids-night-musical', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (4, '2024-01-01T00:00:00Z', 'Lipsa Birthday Song', NULL, NULL, 'Birthday Song', 'Melodia', NULL, NULL, '/audio/birthday-queen.mp3', 181, 'lipsa-birthday-song', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (5, '2024-01-01T00:00:00Z', 'Nirvan''s Birthday Song', NULL, NULL, 'Birthday Party', 'Melodia', NULL, NULL, '/audio/nirvan-birthday.mp3', 113, 'nirvan-birthday-song', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (6, '2024-01-01T00:00:00Z', 'Ram and Akanksha''s wedding anthem', NULL, NULL, 'Wedding Song', 'Melodia', NULL, NULL, '/audio/wedding-anthem.mp3', 180, 'ram-akanksha-wedding-anthem', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (7, '2024-01-01T00:00:00Z', 'Unchained', NULL, NULL, 'Motivational Song', 'Melodia', NULL, NULL, '/audio/unchained.mp3', 180, 'unchained', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (8, '2024-01-01T00:00:00Z', 'Birthday Boy''s Blue Party', NULL, NULL, 'Kids Birthday Song', 'Melodia', NULL, NULL, '/audio/blue-party.mp3', 150, 'birthday-blue-party', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (9, '2024-01-01T00:00:00Z', 'Sweet Dreams Tonight', NULL, NULL, 'Lullaby', 'Melodia', NULL, NULL, '/audio/sweet-dreams-tonight.mp3', 200, 'sweet-dreams-tonight', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (10, '2024-01-01T00:00:00Z', 'Akash''s Birthday Bash Song', NULL, NULL, 'Birthday Song', 'Melodia', NULL, NULL, '/audio/akash-birthday.mp3', 181, 'akash-birthday-bash', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (11, '2024-01-01T00:00:00Z', 'Ruchi My Queen', NULL, NULL, 'Rap', 'Melodia', NULL, NULL, '/audio/ruchi-my-queen.mp3', 179, 'ruchi-my-queen', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (12, '2024-01-01T00:00:00Z', 'Yaara', NULL, NULL, 'Romantic Song', 'Melodia', NULL, NULL, '/audio/yaara.mp3', 197, 'yaara', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (13, '2024-01-01T00:00:00Z', 'Har Lamha Naya', NULL, NULL, 'Love Song', 'Melodia', NULL, NULL, '/audio/har-lamha-naya.mp3', 269, 'har-lamha-naya', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (14, '2024-01-01T00:00:00Z', 'Jashn-e-Hemali', NULL, NULL, 'Birthday Party Song', 'Melodia', NULL, NULL, '/audio/jashn-e-hemali.mp3', 174, 'jashn-e-hemali', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (15, '2024-01-01T00:00:00Z', 'Jassi-di-jaan', NULL, NULL, 'Punjabi Romantic Song', 'Melodia', NULL, NULL, '/audio/jassi-di-jaan.mp3', 174, 'jassi-di-jaan', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL),
  (16, '2024-01-01T00:00:00Z', 'A Dream Named Jivy', NULL, NULL, 'Mother''s Love Lullaby', 'Melodia', NULL, NULL, '/audio/a-dream-named-jivy.mp3', 274, 'a-dream-named-jivy', true, 'completed', NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Update the sequence to start after the highest ID
SELECT setval('songs_id_seq', (SELECT MAX(id) FROM songs), true);

-- Verify the migration
SELECT COUNT(*) as total_songs FROM songs;
SELECT title, slug, status FROM songs ORDER BY id;