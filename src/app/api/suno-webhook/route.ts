import { db } from '@/lib/db';
import { songsTable } from '@/lib/db/schema';
import { SongDatabaseUpdateService } from '@/lib/services/song-database-update-service';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Extract query parameters for user context FIRST
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const anonymousUserId = searchParams.get('anonymousUserId');
    const requestId = searchParams.get('requestId');

    // Validate requestId if provided
    if (requestId && isNaN(parseInt(requestId))) {
      console.error('Invalid requestId provided:', requestId);
      return NextResponse.json(
        { error: 'Invalid requestId format' },
        { status: 400 }
      );
    }

    // FIRST STEP: Check if song is already COMPLETED before processing webhook body
    if (requestId) {
      const existingSongs = await db
        .select()
        .from(songsTable)
        .where(eq(songsTable.song_request_id, parseInt(requestId)));

      if (existingSongs.length > 0 && existingSongs[0].status === 'COMPLETED') {
        return NextResponse.json({
          success: true,
          message: `Song ${existingSongs[0].id} already completed.`
        });
      }
    }

    // Parse webhook body only after status check
    const body = await request.json();
    console.log('Suno Webhook received:', JSON.stringify(body, null, 2));

    // Extract data from official Suno API callback format
    const { code, msg, data } = body;

    console.log('Suno callback details:', { code, msg, callbackType: data?.callbackType, taskId: data?.task_id });

    if (!data || !data.task_id) {
      console.log('No task_id in webhook, skipping');
      return NextResponse.json({ success: true });
    }

    const taskId = data.task_id;
    const callbackType = data.callbackType;
    const variants = data.data || [];

    // Map callback type to status
    let status = 'PENDING';
    if (callbackType === 'complete') {
      status = 'COMPLETE';
    } else if (callbackType === 'error') {
      status = 'FAILED';
    } else if (callbackType === 'first') {
      status = 'STREAM_AVAILABLE';
    }

    // Transform variants from official Suno API format to SunoVariant format
    const transformedVariants = variants.map((variant: any) => ({
      id: variant.id,
      audioUrl: variant.audio_url,
      sourceAudioUrl: variant.source_audio_url,
      streamAudioUrl: variant.stream_audio_url,
      sourceStreamAudioUrl: variant.source_stream_audio_url,
      imageUrl: variant.image_url,
      sourceImageUrl: variant.source_image_url,
      prompt: variant.prompt,
      modelName: variant.model_name,
      title: variant.title,
      tags: variant.tags,
      createTime: variant.createTime,
      duration: variant.duration
    }));

    // Find song by requestId first (most reliable), then fallback to taskId
    let songs: any[] = [];

    if (requestId) {
      // Find song by requestId (most reliable method)
      songs = await db
        .select()
        .from(songsTable)
        .where(eq(songsTable.song_request_id, parseInt(requestId)));

      console.log(`Found ${songs.length} songs by requestId: ${requestId}`);
    }

    // Fallback: Find song by task ID if not found by requestId
    if (songs.length === 0) {
      songs = await db
        .select()
        .from(songsTable)
        .where(eq(songsTable.metadata, { suno_task_id: taskId }));

      console.log(`Found ${songs.length} songs by taskId: ${taskId}`);
    }

    if (songs.length === 0) {
      // Check if this task ID is in any of the variants
      const allSongs = await db.select().from(songsTable);
      let targetSong = null;

      for (const song of allSongs) {
        if (song.song_variants && Array.isArray(song.song_variants)) {
          const variant = song.song_variants.find((v: any) => v.id === taskId);
          if (variant) {
            targetSong = song;
            break;
          }
        }
      }

      if (!targetSong) {
        console.log(`No song found for task ID: ${taskId} in variants`);
        return NextResponse.json({
          success: true,
          message: `No song found for task ID: ${taskId}`
        });
      }

      // Validate user context if provided
      if (userId || anonymousUserId) {
        // TODO: Add user context validation here if needed
        console.log(`Processing webhook for song ${targetSong.id} with user context:`, { userId, anonymousUserId });
      }

      // Use the webhook status directly instead of recalculating
      try {
        // Map webhook status to SongStatus type
        const mappedStatus = status === 'COMPLETE' ? 'COMPLETED' : status;

        const updateResult = await SongDatabaseUpdateService.updateDatabaseWithPreCalculatedStatus(
          targetSong.id,
          mappedStatus as any, // Use the mapped status directly
          transformedVariants // Use the transformed variants
        );

        if (!updateResult.success) {
          console.error(`Failed to update song ${targetSong.id}:`, updateResult.error);
          return NextResponse.json(
            { error: `Failed to update song: ${updateResult.error}` },
            { status: 500 }
          );
        }

        console.log(`Successfully updated song ${targetSong.id} via webhook:`, updateResult);
      } catch (updateError) {
        console.error(`Error updating song ${targetSong.id}:`, updateError);
        return NextResponse.json(
          { error: 'Failed to update song in database' },
          { status: 500 }
        );
      }
    } else {
      // Handle primary task ID completion
      const song = songs[0];

      // Validate user context if provided
      if (userId || anonymousUserId) {
        // TODO: Add user context validation here if needed
        console.log(`Processing webhook for song ${song.id} with user context:`, { userId, anonymousUserId });
      }

      // Use the webhook status directly instead of recalculating
      try {
        // Map webhook status to SongStatus type
        const mappedStatus = status === 'COMPLETE' ? 'COMPLETED' : status;

        const updateResult = await SongDatabaseUpdateService.updateDatabaseWithPreCalculatedStatus(
          song.id,
          mappedStatus as any, // Use the mapped status directly
          transformedVariants // Use the transformed variants
        );

        if (!updateResult.success) {
          console.error(`Failed to update song ${song.id}:`, updateResult.error);
          return NextResponse.json(
            { error: `Failed to update song: ${updateResult.error}` },
            { status: 500 }
          );
        }

        console.log(`Successfully updated song ${song.id} via webhook:`, updateResult);
      } catch (updateError) {
        console.error(`Error updating song ${song.id}:`, updateError);
        return NextResponse.json(
          { error: 'Failed to update song in database' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Suno webhook:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}