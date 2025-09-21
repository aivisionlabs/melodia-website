import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lyricsDraftsTable } from '@/lib/db/schema';

export async function GET(request: NextRequest) {
  try {
    // Get all lyrics drafts
    const result = await db
      .select()
      .from(lyricsDraftsTable)
      .orderBy(lyricsDraftsTable.created_at);

    return NextResponse.json({
      success: true,
      lyricsDrafts: result
    });

  } catch (error) {
    console.error('Error checking lyrics drafts:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
