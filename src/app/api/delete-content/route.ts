import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable, songRequestsTable, lyricsDraftsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(request: NextRequest) {
  try {
    const { contentId, contentType } = await request.json();

    if (!contentId || !contentType) {
      return NextResponse.json(
        { error: true, message: 'Missing required fields: contentId, contentType' },
        { status: 400 }
      );
    }

    console.log('Deleting content:', { contentId, contentType });

    // Parse the content ID to get the actual database ID
    const id = parseInt(contentId.split('-')[1]); // e.g., "song-2" -> 2

    if (isNaN(id)) {
      return NextResponse.json(
        { error: true, message: 'Invalid content ID format' },
        { status: 400 }
      );
    }

    let deleted = false;

    switch (contentType) {
      case 'song':
        // Delete from songs table
        const songResult = await db
          .delete(songsTable)
          .where(eq(songsTable.id, id))
          .returning({ id: songsTable.id });
        
        if (songResult.length > 0) {
          deleted = true;
          console.log('Deleted song:', songResult[0]);
        }
        break;

      case 'lyrics_draft':
        // Delete from lyrics_drafts table
        const lyricsResult = await db
          .delete(lyricsDraftsTable)
          .where(eq(lyricsDraftsTable.id, id))
          .returning({ id: lyricsDraftsTable.id });
        
        if (lyricsResult.length > 0) {
          deleted = true;
          console.log('Deleted lyrics draft:', lyricsResult[0]);
        }
        break;

      case 'song_request':
        // Delete from song_requests table
        const requestResult = await db
          .delete(songRequestsTable)
          .where(eq(songRequestsTable.id, id))
          .returning({ id: songRequestsTable.id });
        
        if (requestResult.length > 0) {
          deleted = true;
          console.log('Deleted song request:', requestResult[0]);
        }
        break;

      default:
        return NextResponse.json(
          { error: true, message: 'Invalid content type' },
          { status: 400 }
        );
    }

    if (!deleted) {
      return NextResponse.json(
        { error: true, message: 'Content not found or already deleted' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Content deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting content:', error);
    return NextResponse.json(
      { error: true, message: 'Failed to delete content' },
      { status: 500 }
    );
  }
}
