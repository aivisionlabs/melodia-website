-- Add primary key to song_categories table
-- This migration adds an id column as primary key to the song_categories table
-- to enable proper delete operations with Drizzle ORM

-- Add id column as serial primary key
ALTER TABLE "song_categories" ADD COLUMN "id" serial PRIMARY KEY;

-- The unique index on song_id and category_id combination is already in place
-- from the previous migration, so no additional constraints needed
