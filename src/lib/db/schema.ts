import {
  pgTable,
  serial,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  numeric
} from 'drizzle-orm/pg-core';

// Songs table
export const songsTable = pgTable('songs', {
  id: serial('id').primaryKey(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  title: text('title').notNull(),
  lyrics: text('lyrics'),
  timestamp_lyrics: jsonb('timestamp_lyrics'),
  timestamped_lyrics_variants: jsonb('timestamped_lyrics_variants').notNull().default('{}'), // Store lyrics for both variants
  timestamped_lyrics_api_responses: jsonb('timestamped_lyrics_api_responses').notNull().default('{}'), // Store only alignedWords data from API responses
  music_style: text('music_style'),
  service_provider: text('service_provider').default('SU'),
  song_requester: text('song_requester'),
  prompt: text('prompt'),
  song_url: text('song_url'),
  duration: integer('duration'), // Changed from numeric to integer to match database
  slug: text('slug').notNull().unique(),
  is_active: boolean('is_active').default(true), // Changed from add_to_library/is_deleted to is_active
  status: text('status').default('draft'),
  categories: text('categories').array(),
  tags: text('tags').array(),
  suno_task_id: text('suno_task_id'),
  metadata: jsonb('metadata'),
  user_id: integer('user_id'), // Reference to user who created this song
  // Legacy fields for backward compatibility
  add_to_library: boolean('add_to_library'),
  is_deleted: boolean('is_deleted'),
  negative_tags: text('negative_tags'),
  suno_variants: jsonb('suno_variants'),
  selected_variant: integer('selected_variant'),
  // Status tracking fields for song status checking
  status_checked_at: timestamp('status_checked_at'),
  last_status_check: timestamp('last_status_check'),
  status_check_count: integer('status_check_count').default(0),
  // Payment integration fields
  payment_id: integer('payment_id').references(() => paymentsTable.id, { onDelete: 'set null' }),
});

// Users table for regular user accounts
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Song requests table for form submissions
export const songRequestsTable = pgTable('song_requests', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id'), // Reference to user who made this request (nullable for guest requests)
  requester_name: text('requester_name').notNull(),
  phone_number: text('phone_number'),
  email: text('email'),
  delivery_preference: text('delivery_preference'), // 'email', 'whatsapp', 'both'
  recipient_name: text('recipient_name').notNull(),
  recipient_relationship: text('recipient_relationship').notNull(),
  languages: text('languages').array().notNull(),
  person_description: text('person_description'),
  song_type: text('song_type'),
  emotions: text('emotions').array(),
  additional_details: text('additional_details'),
  status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
  suno_task_id: text('suno_task_id'),
  generated_song_id: integer('generated_song_id'), // Reference to the generated song in songs table
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  // Phase 6: Lyrics workflow fields
  lyrics_status: text('lyrics_status').default('pending'),
  approved_lyrics_id: integer('approved_lyrics_id'),
  lyrics_locked_at: timestamp('lyrics_locked_at'),
  // Payment integration fields
  payment_id: integer('payment_id').references(() => paymentsTable.id, { onDelete: 'set null' }),
  payment_status: text('payment_status').default('pending'),
  payment_required: boolean('payment_required').default(true),
});

// Phase 6: Lyrics drafts table
export const lyricsDraftsTable = pgTable('lyrics_drafts', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id').notNull().references(() => songRequestsTable.id, { onDelete: 'cascade' }),
  version: integer('version').notNull().default(1),
  language: text('language').array(),
  tone: text('tone').array(),
  length_hint: text('length_hint'),
  structure: jsonb('structure'),
  prompt_input: jsonb('prompt_input'),
  generated_text: text('generated_text').notNull(),
  edited_text: text('edited_text'),
  status: text('status').notNull().default('draft'),
  created_by: integer('created_by').references(() => usersTable.id),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
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

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertSongRequest = typeof songRequestsTable.$inferInsert;
export type SelectSongRequest = typeof songRequestsTable.$inferSelect;

export type InsertLyricsDraft = typeof lyricsDraftsTable.$inferInsert;
export type SelectLyricsDraft = typeof lyricsDraftsTable.$inferSelect;

export type InsertAdminUser = typeof adminUsersTable.$inferInsert;
export type SelectAdminUser = typeof adminUsersTable.$inferSelect;

// Payments table
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => usersTable.id, { onDelete: 'cascade' }),
  song_request_id: integer('song_request_id').references(() => songRequestsTable.id, { onDelete: 'cascade' }),
  razorpay_payment_id: text('razorpay_payment_id').unique(),
  razorpay_order_id: text('razorpay_order_id'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('INR'),
  status: text('status').notNull().default('pending'),
  payment_method: text('payment_method'),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  metadata: jsonb('metadata'),
});

// Pricing plans table
export const pricingPlansTable = pgTable('pricing_plans', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('INR'),
  features: jsonb('features'),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// Payment webhooks table
export const paymentWebhooksTable = pgTable('payment_webhooks', {
  id: serial('id').primaryKey(),
  razorpay_event_id: text('razorpay_event_id').unique(),
  event_type: text('event_type').notNull(),
  payment_id: integer('payment_id').references(() => paymentsTable.id, { onDelete: 'cascade' }),
  webhook_data: jsonb('webhook_data').notNull(),
  processed: boolean('processed').default(false),
  created_at: timestamp('created_at').defaultNow(),
  processed_at: timestamp('processed_at'),
});


// Type exports for payments
export type InsertPayment = typeof paymentsTable.$inferInsert;
export type SelectPayment = typeof paymentsTable.$inferSelect;

export type InsertPricingPlan = typeof pricingPlansTable.$inferInsert;
export type SelectPricingPlan = typeof pricingPlansTable.$inferSelect;

export type InsertPaymentWebhook = typeof paymentWebhooksTable.$inferInsert;
export type SelectPaymentWebhook = typeof paymentWebhooksTable.$inferSelect;
