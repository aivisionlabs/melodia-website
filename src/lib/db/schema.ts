import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// Songs table
export const songsTable = pgTable('songs', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  title: text('title').notNull(),
  lyrics: text('lyrics'),
  song_description: text('song_description'),
  timestamp_lyrics: jsonb('timestamp_lyrics'),
  timestamped_lyrics_variants: jsonb('timestamped_lyrics_variants'), // Store lyrics for both variants
  timestamped_lyrics_api_responses: jsonb('timestamped_lyrics_api_responses'), // Store only alignedWords data from API responses
  music_style: text('music_style'),
  service_provider: text('service_provider').default('sunoapi'),
  song_requester: text('song_requester'),
  prompt: text('prompt'),
  song_url: text('song_url'),
  duration: numeric('duration', { precision: 10, scale: 2 }), // Store duration with 2 decimal places for precision
  slug: text('slug').notNull().unique(),
  add_to_library: boolean('add_to_library').default(true),
  is_deleted: boolean('is_deleted').default(false),
  is_active: boolean('is_active').default(true),
  status: text('status').default('draft'),
  categories: text('categories').array(),
  tags: text('tags').array(),
  suno_task_id: text('suno_task_id'),
  negative_tags: text('negative_tags'),
  suno_variants: jsonb('suno_variants'),
  selected_variant: integer('selected_variant'),
  metadata: jsonb('metadata'),
  sequence: integer('sequence'), // Field to control display order
  show_lyrics: boolean('show_lyrics').default(true), // Field to control whether to show lyrics
  likes_count: integer('likes_count').default(0),
});

// Categories table (canonical list with fixed order via sequence)
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  sequence: integer('sequence').default(0),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Song to Category mapping (many-to-many)
export const songCategoriesTable = pgTable('song_categories', {
  id: serial('id').primaryKey(),
  song_id: integer('song_id').notNull(),
  category_id: integer('category_id').notNull(),
}, (table) => ({
  songCategoryUnique: uniqueIndex('song_categories_song_id_category_id_unique').on(table.song_id, table.category_id),
}));

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

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;

export type InsertAdminUser = typeof adminUsersTable.$inferInsert;
export type SelectAdminUser = typeof adminUsersTable.$inferSelect;
