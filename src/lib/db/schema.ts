import {
  pgTable,
  serial,
  text,
  timestamp,
  date,
  boolean,
  integer,
  jsonb,
  numeric,
  uuid
} from 'drizzle-orm/pg-core';

// Songs table - stores the final, generated song
export const songsTable = pgTable('songs', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id').notNull().unique(), // Each request generates one song record

  created_at: timestamp('created_at').notNull().defaultNow(),
  title: text('title').notNull(),
  lyrics: text('lyrics').notNull(),
  duration: integer('duration'),
  slug: text('slug').notNull().unique(),
  status: text('status').default('processing'), // e.g., 'processing', 'complete', 'failed'
  is_featured: boolean('is_featured').default(false), // For the "Best Songs" gallery

  // Store the two generated audio files
  song_url_variant_1: text('song_url_variant_1'),
  song_url_variant_2: text('song_url_variant_2'),
  metadata: jsonb('metadata'), // For storing provider-specific data like suno_task_id, etc.
  approved_lyrics_id: integer('approved_lyrics_id'), // Reference to the approved lyrics draft
  timestamp_lyrics: jsonb('timestamp_lyrics'),
  timestamped_lyrics_variants: jsonb('timestamped_lyrics_variants').notNull().default('{}'),
  timestamped_lyrics_api_responses: jsonb('timestamped_lyrics_api_responses').notNull().default('{}'),
  service_provider: text('service_provider').default('SU'),
  song_requester: text('song_requester'),
  prompt: text('prompt'),
  song_url: text('song_url'),
  music_style: text('music_style'),
  is_active: boolean('is_active').default(true),
  categories: text('categories').array(),
  tags: text('tags').array(),
  suno_task_id: text('suno_task_id'),
  add_to_library: boolean('add_to_library').default(false),
  is_deleted: boolean('is_deleted'),
  negative_tags: text('negative_tags'),
  suno_variants: jsonb('suno_variants'),
  selected_variant: integer('selected_variant'),
  status_checked_at: timestamp('status_checked_at'),
  last_status_check: timestamp('last_status_check'),
  status_check_count: integer('status_check_count').default(0),
  payment_id: integer('payment_id'), // Will be properly referenced later
});

// Users table for regular user accounts
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  date_of_birth: date('date_of_birth').notNull(),
  phone_number: text('phone_number'),
  email_verified: boolean('email_verified').notNull().default(false),
  password_hash: text('password_hash'), // Optional for now, will be added later for login
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Anonymous users table to track anonymous sessions
export const anonymousUsersTable = pgTable('anonymous_users', {
  id: uuid('id').primaryKey().defaultRandom(), // Use UUID
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Song requests table for form submissions
export const songRequestsTable = pgTable('song_requests', {
  id: serial('id').primaryKey(),
  // --- User relationship change ---
  user_id: integer('user_id'), // For registered users
  anonymous_user_id: uuid('anonymous_user_id'), // For anonymous users

  requester_name: text('requester_name').notNull(),
  recipient_details: text('recipient_details').notNull(),
  occasion: text('occasion'),
  languages: text('languages').array().notNull(),
  mood: text('mood').array(),
  song_story: text('song_story'),
  status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed'
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Phase 6: Lyrics drafts table
export const lyricsDraftsTable = pgTable('lyrics_drafts', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id').notNull(),
  version: integer('version').notNull().default(1),
  lyrics_edit_prompt: text('lyrics_edit_prompt'),
  generated_text: text('generated_text').notNull(),
  song_title: text('song_title'),
  music_style: text('music_style'),
  status: text('status').notNull().default('draft'),
  created_by: integer('created_by'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Email verification codes table (database implementation of OTP storage)
export const emailVerificationCodesTable = pgTable('email_verification_codes', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  attempts: integer('attempts').notNull().default(0),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
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

export type InsertAnonymousUser = typeof anonymousUsersTable.$inferInsert;
export type SelectAnonymousUser = typeof anonymousUsersTable.$inferSelect;

export type InsertSongRequest = typeof songRequestsTable.$inferInsert;
export type SelectSongRequest = typeof songRequestsTable.$inferSelect;

export type InsertLyricsDraft = typeof lyricsDraftsTable.$inferInsert;
export type SelectLyricsDraft = typeof lyricsDraftsTable.$inferSelect;

export type InsertEmailVerificationCode = typeof emailVerificationCodesTable.$inferInsert;
export type SelectEmailVerificationCode = typeof emailVerificationCodesTable.$inferSelect;

export type InsertAdminUser = typeof adminUsersTable.$inferInsert;
export type SelectAdminUser = typeof adminUsersTable.$inferSelect;

// Payments table - supports both registered and anonymous users
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),

  // The song_request is the primary link
  song_request_id: integer('song_request_id'),

  // --- Ownership fields ---
  user_id: integer('user_id'), // Nullable for anonymous payments
  anonymous_user_id: uuid('anonymous_user_id'), // For anonymous users

  // Payment provider fields
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
  payment_id: integer('payment_id'),
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
