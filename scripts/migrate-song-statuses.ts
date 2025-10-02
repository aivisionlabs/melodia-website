#!/usr/bin/env tsx

/**
 * Database Migration Script: Update Song Statuses
 *
 * This script migrates existing song records from the old status system
 * (TEXT_SUCCESS, FIRST_SUCCESS, SUCCESS) to the new two-level status system
 * (PENDING, STREAM_AVAILABLE, COMPLETE).
 *
 * Usage:
 *   npx tsx scripts/migrate-song-statuses.ts
 *   npm run migrate:song-statuses
 */

import { db } from '../src/lib/db';
import { songsTable, songRequestsTable } from '../src/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

console.log('🔄 Starting song status migration...\n');

async function migrateSongStatuses() {
  try {
    // Get current state
    console.log('📊 Current database state:');
    const currentStats = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)`,
        processing: sql<number>`count(case when status = 'processing' then 1 end)`,
        failed: sql<number>`count(case when status = 'failed' then 1 end)`,
      })
      .from(songsTable);

    console.log(`   Total songs: ${currentStats[0].total}`);
    console.log(`   Completed: ${currentStats[0].completed}`);
    console.log(`   Processing: ${currentStats[0].processing}`);
    console.log(`   Failed: ${currentStats[0].failed}\n`);

    // Get songs that need migration
    const songsToMigrate = await db
      .select()
      .from(songsTable)
      .where(sql`song_variants IS NOT NULL AND jsonb_array_length(song_variants) > 0`);

    console.log(`🎯 Found ${songsToMigrate.length} songs with variants to migrate\n`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const song of songsToMigrate) {
      try {
        console.log(`   Migrating song ${song.id}...`);

        // Calculate new status based on variant data
        const variants = song.song_variants as any[];
        let newStatus = 'processing';

        if (variants && variants.length > 0) {
          // Check if any variant has download URLs
          const hasDownloadUrls = variants.some(variant =>
            variant.audioUrl || variant.sourceAudioUrl
          );

          // Check if any variant has streaming URLs
          const hasStreamingUrls = variants.some(variant =>
            variant.streamAudioUrl || variant.sourceStreamAudioUrl
          );

          if (hasDownloadUrls) {
            newStatus = 'completed';
          } else if (hasStreamingUrls) {
            newStatus = 'processing'; // This represents STREAM_AVAILABLE in new system
          }
        }

        // Update variants with new fields and calculated status
        const updatedVariants = variants.map(variant => ({
          ...variant,
          // Ensure new URL fields exist
          sourceAudioUrl: variant.sourceAudioUrl || variant.audioUrl,
          sourceStreamAudioUrl: variant.sourceStreamAudioUrl || variant.streamAudioUrl,
          sourceImageUrl: variant.sourceImageUrl || variant.imageUrl,

          // Calculate variant status
          variantStatus: (() => {
            if (!variant.sourceStreamAudioUrl && !variant.streamAudioUrl) {
              return 'PENDING';
            } else if (variant.audioUrl || variant.sourceAudioUrl) {
              return 'DOWNLOAD_READY';
            } else {
              return 'STREAM_READY';
            }
          })(),

          // Legacy fields for backward compatibility
          downloadStatus: (variant.audioUrl || variant.sourceAudioUrl) ? 'ready' : 'pending',
          isLoading: !(variant.sourceStreamAudioUrl || variant.streamAudioUrl)
        }));

        // Update the song
        await db
          .update(songsTable)
          .set({
            status: newStatus,
            song_variants: updatedVariants
          })
          .where(eq(songsTable.id, song.id));

        // Update corresponding song request
        if (song.song_request_id) {
          await db
            .update(songRequestsTable)
            .set({ status: newStatus })
            .where(eq(songRequestsTable.id, song.song_request_id));
        }

        console.log(`   ✅ Migrated song ${song.id} to status: ${newStatus}`);
        migratedCount++;

      } catch (error) {
        console.error(`   ❌ Error migrating song ${song.id}:`, error);
        errorCount++;
      }
    }

    // Get final state
    console.log('\n📊 Migration completed! Final state:');
    const finalStats = await db
      .select({
        total: sql<number>`count(*)`,
        completed: sql<number>`count(case when status = 'completed' then 1 end)`,
        processing: sql<number>`count(case when status = 'processing' then 1 end)`,
        failed: sql<number>`count(case when status = 'failed' then 1 end)`,
      })
      .from(songsTable);

    console.log(`   Total songs: ${finalStats[0].total}`);
    console.log(`   Completed: ${finalStats[0].completed}`);
    console.log(`   Processing: ${finalStats[0].processing}`);
    console.log(`   Failed: ${finalStats[0].failed}`);

    console.log(`\n✅ Migration Summary:`);
    console.log(`   Songs migrated: ${migratedCount}`);
    console.log(`   Errors: ${errorCount}`);

    // Show variant status distribution
    console.log('\n📈 Variant Status Distribution:');
    const variantStats = await db.execute(sql`
      SELECT
        jsonb_array_elements(song_variants)->>'variantStatus' as variant_status,
        COUNT(*) as count
      FROM songs
      WHERE song_variants IS NOT NULL
      GROUP BY variant_status
      ORDER BY count DESC
    `);

    for (const stat of variantStats) {
      console.log(`   ${stat.variant_status}: ${stat.count}`);
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrateSongStatuses()
  .then(() => {
    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
