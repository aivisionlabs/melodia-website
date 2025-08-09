import { db } from '../index';
import { InsertSong, songsTable } from '../schema';

export async function createSong(data: InsertSong) {
  try {
    const result = await db.insert(songsTable).values(data).returning();
    return result[0];
  } catch (error) {
    console.error('Database insert error:', error);
    throw new Error(`Failed query: ${error instanceof Error ? error.message : 'Unknown database error'}`);
  }
}