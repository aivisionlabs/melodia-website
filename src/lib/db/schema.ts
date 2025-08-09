import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb
} from 'drizzle-orm/pg-core';

// Songs table
export const songsTable = pgTable('songs', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  title: text('title').notNull(),
  lyrics: text('lyrics'),
  timestamp_lyrics: jsonb('timestamp_lyrics'),
  timestamped_lyrics_variants: jsonb('timestamped_lyrics_variants'), // Store lyrics for both variants
  timestamped_lyrics_api_responses: jsonb('timestamped_lyrics_api_responses'), // Store raw API responses
  music_style: text('music_style'),
  service_provider: text('service_provider').default('Melodia'),
  song_requester: text('song_requester'),
  prompt: text('prompt'),
  song_url: text('song_url'),
  duration: integer('duration'),
  slug: text('slug').notNull().unique(),
  add_to_library: boolean('add_to_library').default(true),
  is_deleted: boolean('is_deleted').default(false),
  status: text('status').default('draft'),
  categories: text('categories').array(),
  tags: text('tags').array(),
  suno_task_id: text('suno_task_id'),
  negative_tags: text('negative_tags'),
  suno_variants: jsonb('suno_variants'),
  selected_variant: integer('selected_variant'),
  metadata: jsonb('metadata'),
});

// Admin users table
export const adminUsersTable = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Types
export type InsertSong = typeof songsTable.$inferInsert;
export type SelectSong = typeof songsTable.$inferSelect;

export type InsertAdminUser = typeof adminUsersTable.$inferInsert;
export type SelectAdminUser = typeof adminUsersTable.$inferSelect;
