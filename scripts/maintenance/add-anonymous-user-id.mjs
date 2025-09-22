import { db } from '../../src/lib/db/index.ts';
import fs from 'fs';

async function addAnonymousUserIdColumn() {
  try {
    console.log('Adding anonymous_user_id column to song_requests table...');
    
    // Read the SQL file
    const sql = fs.readFileSync('./scripts/maintenance/add-anonymous-user-id.sql', 'utf8');
    
    // Execute the SQL
    await db.execute(sql);
    
    console.log('✅ Successfully added anonymous_user_id column to song_requests table');
    
    // Verify the column was added
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'song_requests' 
      AND column_name = 'anonymous_user_id'
    `);
    
    console.log('Verification result:', result);
    
  } catch (error) {
    console.error('❌ Error adding column:', error);
  } finally {
    process.exit(0);
  }
}

addAnonymousUserIdColumn();
