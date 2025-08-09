import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load local env only in non-prod environments; Next.js handles env in prod
if (process.env.NODE_ENV !== 'production') {
  config({ path: '.env.local' });
}

let databaseUrl = process.env.DATABASE_URL || '';

// Guard against mistakenly embedding the key in the value (e.g., "DATABASE_URL=postgres://...")
if (databaseUrl.startsWith('DATABASE_URL=')) {
  databaseUrl = databaseUrl.replace(/^DATABASE_URL=/, '');
}

if (!databaseUrl) {
  throw new Error('DATABASE_URL is not set. Please configure it in environment variables or .env.local');
}

// Supabase requires SSL; include both supabase.co and supabase.com (pooler)
const isSupabase = /\.supabase\./.test(databaseUrl);
const isSupabasePooler = /pooler\.supabase\.com/.test(databaseUrl);

const clientOptions = isSupabase
  ? {
    ssl: 'require',
    ...(isSupabasePooler ? { prepare: false } : {}),
    connect_timeout: 30,
    idle_timeout: 20,
    max: 5,
  }
  : {};

declare global {
  var __melodia_postgres_client: ReturnType<typeof postgres> | undefined;
}

const existing = globalThis.__melodia_postgres_client;
const client = existing ?? postgres(databaseUrl, clientOptions as any);
if (!existing) {
  globalThis.__melodia_postgres_client = client;
}

export const db = drizzle(client);

// Export schema for migrations
export * from './schema';