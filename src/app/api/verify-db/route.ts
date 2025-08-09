import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { songsTable } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log("Verifying database schema...");

    // Check if we can query the songs table
    const songs = await db.select().from(songsTable).limit(1);
    console.log("Database connection successful, found songs:", songs.length);

    // Check if the suno_variants column exists by trying to select it
    try {
      const testQuery = await db.select({
        id: songsTable.id,
        suno_variants: songsTable.suno_variants,
        selected_variant: songsTable.selected_variant
      }).from(songsTable).limit(1);

      console.log("Schema verification successful:", testQuery);

      return NextResponse.json({
        success: true,
        message: "Database schema verified successfully",
        data: {
          songsCount: songs.length,
          schemaTest: testQuery
        }
      });
    } catch (schemaError) {
      console.error("Schema verification failed:", schemaError);
      return NextResponse.json({
        success: false,
        error: "Schema verification failed",
        details: schemaError instanceof Error ? schemaError.message : "Unknown error"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Database verification error:", error);
    return NextResponse.json({
      success: false,
      error: "Database connection failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { songId, testVariants } = await request.json();

    console.log("Testing variant storage for song ID:", songId);

    // Test updating a song with variants
    const updateData = {
      suno_variants: testVariants,
      selected_variant: 0,
      status: 'completed',
      add_to_library: true
    };

    console.log("Update data:", updateData);

    await db.update(songsTable)
      .set(updateData)
      .where(eq(songsTable.id, songId));

    console.log("Variant storage test successful");

    // Verify the update
    const updatedSong = await db.select({
      id: songsTable.id,
      suno_variants: songsTable.suno_variants,
      selected_variant: songsTable.selected_variant,
      status: songsTable.status
    }).from(songsTable).where(eq(songsTable.id, songId));

    console.log("Updated song data:", updatedSong);

    return NextResponse.json({
      success: true,
      message: "Variant storage test successful",
      data: updatedSong[0]
    });
  } catch (error) {
    console.error("Variant storage test failed:", error);
    return NextResponse.json({
      success: false,
      error: "Variant storage test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}