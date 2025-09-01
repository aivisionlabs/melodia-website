#!/usr/bin/env node

import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
config({ path: '.env' });
config({ path: '.env.local' });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

console.log('🚀 Running Phase 6 database migrations...');
console.log('📊 Database URL:', DATABASE_URL.replace(/\/\/.*@/, '//***:***@'));

async function runMigrations() {
  try {
    // Import the database connection
    const { db } = await import('../src/lib/db/index.js');
    
    console.log('🔧 Fixing database schema...');
    
    // Read and execute the schema fix migration
    const schemaFixSQL = readFileSync(join(process.cwd(), 'scripts/fix-database-schema.sql'), 'utf8');
    await db.execute(schemaFixSQL);
    
    console.log('📝 Running Phase 6 migration...');
    
    // Read and execute the Phase 6 migration
    const phase6SQL = readFileSync(join(process.cwd(), 'scripts/migrate-phase6-schema.sql'), 'utf8');
    await db.execute(phase6SQL);
    
    console.log('✅ Migrations completed successfully!');
    console.log('');
    console.log('📋 Migration Summary:');
    console.log('- Added missing fields to songs table for backward compatibility');
    console.log('- Created lyrics_drafts table for Phase 6 workflow');
    console.log('- Updated song_requests table with lyrics workflow fields');
    console.log('- Added proper indexes for performance');
    console.log('');
    console.log('🎉 Phase 6 database setup is complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Make sure your database is running and accessible');
    process.exit(1);
  }
}

runMigrations();
