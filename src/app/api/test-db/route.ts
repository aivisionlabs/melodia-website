import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Try to insert a minimal record to see what columns exist
    const result = await db.execute(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'song_requests' 
      ORDER BY ordinal_position
    `);

    return NextResponse.json({
      success: true,
      columns: result.rows
    });

  } catch (error) {
    console.error('Error checking database structure:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
