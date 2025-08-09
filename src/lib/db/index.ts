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

// Supabase requires SSL; enable it when connecting to Supabase
const isSupabase = /\.supabase\.co/.test(databaseUrl);

const client = postgres(databaseUrl, isSupabase ? { ssl: 'require' } : {});
export const db = drizzle(client);

// Export schema for migrations
export * from './schema';