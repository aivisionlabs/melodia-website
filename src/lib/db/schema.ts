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
  uuid,
  date,
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
  // Extra columns present in all_data.sql export (kept nullable for compatibility)
  song_request_id: integer('song_request_id'),
  user_id: integer('user_id'),
  is_featured: boolean('is_featured').default(false),
  song_url_variant_1: text('song_url_variant_1'),
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

// ============================================
// NEW TABLES FROM MELODIA-APP
// ============================================

// Users table - Registered user accounts
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  date_of_birth: date('date_of_birth').notNull(),
  phone_number: text('phone_number'),
  profile_picture: text('profile_picture'),
  email_verified: boolean('email_verified').default(false),
  password_hash: text('password_hash'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Anonymous users table - Temporary user sessions
export const anonymousUsersTable = pgTable('anonymous_users', {
  id: uuid('id').primaryKey().defaultRandom(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Song requests table - Song generation requests
export const songRequestsTable = pgTable('song_requests', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').references(() => usersTable.id),
  anonymous_user_id: uuid('anonymous_user_id').references(() => anonymousUsersTable.id),
  requester_name: text('requester_name'),
  recipient_details: text('recipient_details').notNull(),
  occasion: text('occasion'),
  languages: text('languages').notNull(),
  mood: text('mood').array(),
  song_story: text('song_story'),
  mobile_number: text('mobile_number'),
  email: text('email'),
  status: text('status').default('pending'), // 'pending', 'processing', 'completed', 'failed', 'cancelled'
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// User songs table - Generated songs (separate from library songs)
export const userSongsTable = pgTable('user_songs', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id').notNull().unique(),
  created_at: timestamp('created_at').notNull().defaultNow(),
  slug: text('slug').notNull().unique(),
  status: text('status').default('processing'), // 'processing', 'completed', 'failed'
  is_featured: boolean('is_featured').default(false),
  song_variants: jsonb('song_variants').default({}),
  variant_timestamp_lyrics_api_response: jsonb('variant_timestamp_lyrics_api_response').default({}),
  variant_timestamp_lyrics_processed: jsonb('variant_timestamp_lyrics_processed').default({}),
  metadata: jsonb('metadata'),
  approved_lyrics_id: integer('approved_lyrics_id'),
  service_provider: text('service_provider').default('SU'), // 'SU' for Suno
  categories: text('categories').array(),
  tags: text('tags').array(),
  add_to_library: boolean('add_to_library').default(false),
  is_deleted: boolean('is_deleted').default(false),
  selected_variant: integer('selected_variant'),
  payment_id: integer('payment_id'),
});

// Lyrics drafts table - Generated lyrics with versioning
export const lyricsDraftsTable = pgTable('lyrics_drafts', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id').notNull(),
  version: integer('version').default(1),
  lyrics_edit_prompt: text('lyrics_edit_prompt'),
  generated_text: text('generated_text').notNull(),
  song_title: text('song_title'),
  music_style: text('music_style'),
  language: text('language').default('English'),
  llm_model_name: text('llm_model_name'),
  status: text('status').default('draft'), // 'draft', 'needs_review', 'approved', 'archived'
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Payments table - Payment records
export const paymentsTable = pgTable('payments', {
  id: serial('id').primaryKey(),
  song_request_id: integer('song_request_id'),
  user_id: integer('user_id'),
  anonymous_user_id: uuid('anonymous_user_id'),
  razorpay_payment_id: text('razorpay_payment_id').unique(),
  razorpay_order_id: text('razorpay_order_id'),
  amount: numeric('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('INR'),
  status: text('status').default('pending'), // 'pending', 'completed', 'failed', 'refunded'
  payment_method: text('payment_method'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
  metadata: jsonb('metadata'),
});

// Payment webhooks table - Payment webhook logs
export const paymentWebhooksTable = pgTable('payment_webhooks', {
  id: serial('id').primaryKey(),
  razorpay_event_id: text('razorpay_event_id').unique(),
  event_type: text('event_type').notNull(),
  payment_id: integer('payment_id'),
  webhook_data: jsonb('webhook_data').notNull(),
  processed: boolean('processed').default(false),
  created_at: timestamp('created_at').notNull().defaultNow(),
  processed_at: timestamp('processed_at'),
});

// Email verification codes table - Email OTP codes
export const emailVerificationCodesTable = pgTable('email_verification_codes', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  code: text('code').notNull(),
  attempts: integer('attempts').default(0),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').notNull().defaultNow(),
});

// Rate limit violations table - Rate limit tracking
export const rateLimitViolationsTable = pgTable('rate_limit_violations', {
  id: serial('id').primaryKey(),
  ip_address: text('ip_address').notNull(),
  endpoint: text('endpoint').notNull(),
  user_id: integer('user_id'),
  anonymous_user_id: uuid('anonymous_user_id'),
  violation_count: integer('violation_count').default(1),
  tier: text('tier').notNull(), // 'low', 'medium', 'high', 'critical'
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Blocked IPs table - IP blocking
export const blockedIpsTable = pgTable('blocked_ips', {
  id: serial('id').primaryKey(),
  ip_address: text('ip_address').notNull().unique(),
  reason: text('reason').notNull(),
  block_type: text('block_type').default('temporary'), // 'temporary', 'permanent'
  blocked_at: timestamp('blocked_at').notNull().defaultNow(),
  blocked_until: timestamp('blocked_until'),
  violation_count: integer('violation_count').default(0),
  last_attempt_at: timestamp('last_attempt_at'),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// Rate limit analytics table - Analytics
export const rateLimitAnalyticsTable = pgTable('rate_limit_analytics', {
  id: serial('id').primaryKey(),
  date: date('date').notNull(),
  endpoint: text('endpoint').notNull(),
  total_requests: integer('total_requests').default(0),
  blocked_requests: integer('blocked_requests').default(0),
  unique_ips: integer('unique_ips').default(0),
  metadata: jsonb('metadata'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});

// ============================================
// TYPES - Existing
// ============================================
export type InsertSong = typeof songsTable.$inferInsert;
export type SelectSong = typeof songsTable.$inferSelect;

export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;

export type InsertAdminUser = typeof adminUsersTable.$inferInsert;
export type SelectAdminUser = typeof adminUsersTable.$inferSelect;

// ============================================
// TYPES - New Tables
// ============================================
export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;

export type InsertAnonymousUser = typeof anonymousUsersTable.$inferInsert;
export type SelectAnonymousUser = typeof anonymousUsersTable.$inferSelect;

export type InsertSongRequest = typeof songRequestsTable.$inferInsert;
export type SelectSongRequest = typeof songRequestsTable.$inferSelect;

export type InsertUserSong = typeof userSongsTable.$inferInsert;
export type SelectUserSong = typeof userSongsTable.$inferSelect;

export type InsertLyricsDraft = typeof lyricsDraftsTable.$inferInsert;
export type SelectLyricsDraft = typeof lyricsDraftsTable.$inferSelect;

export type InsertPayment = typeof paymentsTable.$inferInsert;
export type SelectPayment = typeof paymentsTable.$inferSelect;

export type InsertPaymentWebhook = typeof paymentWebhooksTable.$inferInsert;
export type SelectPaymentWebhook = typeof paymentWebhooksTable.$inferSelect;

export type InsertEmailVerificationCode = typeof emailVerificationCodesTable.$inferInsert;
export type SelectEmailVerificationCode = typeof emailVerificationCodesTable.$inferSelect;

export type InsertRateLimitViolation = typeof rateLimitViolationsTable.$inferInsert;
export type SelectRateLimitViolation = typeof rateLimitViolationsTable.$inferSelect;

export type InsertBlockedIp = typeof blockedIpsTable.$inferInsert;
export type SelectBlockedIp = typeof blockedIpsTable.$inferSelect;

export type InsertRateLimitAnalytics = typeof rateLimitAnalyticsTable.$inferInsert;
export type SelectRateLimitAnalytics = typeof rateLimitAnalyticsTable.$inferSelect;
