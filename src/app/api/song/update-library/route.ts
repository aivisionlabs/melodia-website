import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { songId, addToLibrary } = await request.json();

    if (!songId || typeof addToLibrary !== 'boolean') {
      return NextResponse.json(
        { success: false, error: 'Song ID and addToLibrary boolean are required' },
        { status: 400 }
      );
    }

    // Update the add_to_library field
    await db
      .update(songsTable)
      .set({ add_to_library: addToLibrary })
      .where(eq(songsTable.id, songId));

    console.log(`Updated song ${songId} add_to_library to ${addToLibrary}`);

    return NextResponse.json({
      success: true,
      message: `Song ${addToLibrary ? 'added to' : 'removed from'} library`,
      songId,
      addToLibrary
    });

  } catch (error) {
    console.error('Error updating song library status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update song library status' },
      { status: 500 }
    );
  }
}
