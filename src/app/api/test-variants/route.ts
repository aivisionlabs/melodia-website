import { NextRequest, NextResponse } from 'next/server';
import { updateSongWithSunoVariants } from '@/lib/db/services';

export async function POST(request: NextRequest) {
  try {
    const { testVariants, selectedVariant, addToLibrary } = await request.json();

    console.log("Test API - Received data:", {
      testVariants,
      selectedVariant,
      addToLibrary
    });

    // Use a test song ID (you might need to create a test song first)
    const testSongId = 1; // This should be an existing song ID

    const result = await updateSongWithSunoVariants(
      testSongId,
      testVariants,
      selectedVariant,
      addToLibrary
    );

    console.log("Test API - Update result:", result);

    return NextResponse.json({
      success: true,
      result,
      message: "Variant storage test completed"
    });
  } catch (error) {
    console.error("Test API - Error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}