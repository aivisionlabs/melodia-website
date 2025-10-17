import { sql } from 'drizzle-orm';
import { pgTable, serial, text, timestamp, boolean, integer, jsonb, numeric, uniqueIndex, index } from 'drizzle-orm/pg-core';

// This migration adds performance indexes to optimize library queries
export const performanceIndexesMigration = {
  up: async (db: any) => {
    // Add indexes for songs table filtering
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_add_to_library ON songs(add_to_library)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_is_deleted ON songs(is_deleted)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_sequence ON songs(sequence)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_created_at_desc ON songs(created_at DESC)`);

    // Composite index for the main library query (add_to_library = true AND is_deleted = false)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_library_filter ON songs(add_to_library, is_deleted, sequence, created_at)`);

    // Index for search queries
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_title_search ON songs USING gin(to_tsvector('english', title))`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_description_search ON songs USING gin(to_tsvector('english', song_description))`);

    // Index for category filtering
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_song_categories_song_id ON song_categories(song_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_song_categories_category_id ON song_categories(category_id)`);

    // Index for categories table
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_categories_sequence ON categories(sequence)`);

    // Index for song likes
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_song_likes_song_id ON song_likes(song_id)`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_song_likes_user_ip ON song_likes(user_ip)`);

    // Partial indexes for better performance (only index active records)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_active_library ON songs(sequence, created_at) WHERE add_to_library = true AND is_deleted = false`);

    // Index for slug lookups (already exists but ensuring it's there)
    await db.execute(sql`CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug)`);
  },

  down: async (db: any) => {
    // Remove all the indexes we created
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_add_to_library`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_is_deleted`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_sequence`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_created_at_desc`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_library_filter`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_title_search`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_description_search`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_song_categories_song_id`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_song_categories_category_id`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_categories_slug`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_categories_sequence`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_song_likes_song_id`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_song_likes_user_ip`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_active_library`);
    await db.execute(sql`DROP INDEX IF EXISTS idx_songs_slug`);
  }
};
