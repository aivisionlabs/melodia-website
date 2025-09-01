#!/usr/bin/env node

import { config } from 'dotenv';

// Load environment variables
config({ path: '.env' });
config({ path: '.env.local' });

console.log('🚀 Running Phase 6 database migrations...');

async function runMigrations() {
  try {
    // Import the database connection and schema
    const { db } = await import('../src/lib/db/index.ts');
    const { songRequestsTable, lyricsDraftsTable } = await import('../src/lib/db/schema.ts');
    
    console.log('🔧 Adding missing columns to song_requests table...');
    
    // Add the missing columns to song_requests table
    await db.execute(`
      ALTER TABLE song_requests 
      ADD COLUMN IF NOT EXISTS lyrics_status TEXT DEFAULT 'pending',
      ADD COLUMN IF NOT EXISTS approved_lyrics_id INTEGER,
      ADD COLUMN IF NOT EXISTS lyrics_locked_at TIMESTAMPTZ;
    `);
    
    console.log('📝 Creating lyrics_drafts table...');
    
    // Create lyrics_drafts table
    await db.execute(`
      CREATE TABLE IF NOT EXISTS lyrics_drafts (
        id SERIAL PRIMARY KEY,
        song_request_id INTEGER NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
        version INTEGER NOT NULL DEFAULT 1,
        language TEXT[],
        tone TEXT[],
        length_hint TEXT,
        structure JSONB,
        prompt_input JSONB,
        generated_text TEXT NOT NULL,
        edited_text TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        created_by INTEGER REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    
    console.log('🔗 Adding foreign key constraint...');
    
    // Add foreign key constraint for approved_lyrics_id
    await db.execute(`
      ALTER TABLE song_requests 
      ADD CONSTRAINT IF NOT EXISTS fk_song_requests_approved_lyrics 
      FOREIGN KEY (approved_lyrics_id) REFERENCES lyrics_drafts(id);
    `);
    
    console.log('📊 Creating indexes...');
    
    // Create indexes for better performance
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_req ON lyrics_drafts(song_request_id);
      CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_status ON lyrics_drafts(status);
      CREATE INDEX IF NOT EXISTS idx_lyrics_drafts_version ON lyrics_drafts(version DESC);
    `);
    
    console.log('🔄 Updating existing records...');
    
    // Update existing song requests to have pending lyrics status
    await db.execute(`
      UPDATE song_requests 
      SET lyrics_status = 'pending' 
      WHERE lyrics_status IS NULL;
    `);
    
    console.log('✅ Migrations completed successfully!');
    console.log('');
    console.log('📋 Migration Summary:');
    console.log('- ✅ Added lyrics_status, approved_lyrics_id, lyrics_locked_at to song_requests');
    console.log('- ✅ Created lyrics_drafts table for Phase 6 workflow');
    console.log('- ✅ Added foreign key constraints');
    console.log('- ✅ Created performance indexes');
    console.log('- ✅ Updated existing records');
    console.log('');
    console.log('🎉 Phase 6 database setup is complete!');
    console.log('💡 You can now use the lyrics-first creation flow!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('💡 Make sure your database is running and accessible');
    console.error('🔍 Full error:', error);
    process.exit(1);
  }
}

runMigrations();
