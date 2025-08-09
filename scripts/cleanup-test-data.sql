-- Clean up test data that might be causing duplicate slug issues
DELETE FROM songs WHERE slug LIKE 'test%' OR title LIKE 'test%';

-- Reset the sequence if needed
-- SELECT setval('songs_id_seq', (SELECT MAX(id) FROM songs));