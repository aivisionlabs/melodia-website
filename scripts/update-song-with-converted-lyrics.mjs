#!/usr/bin/env node

/**
 * Sample script showing how to update a song in the database
 * with the converted timestamped lyrics format.
 *
 * Usage examples:
 * 1. To update variant_timestamp_lyrics_processed field:
 *    node update-song-with-converted-lyrics.mjs --song-id 123 --field processed
 *
 * 2. To update variant_timestamp_lyrics_api_response field:
 *    node update-song-with-converted-lyrics.mjs --song-id 123 --field api-response
 */

import fs from "fs";
import path from "path";

// Import the converted lyrics data
const CONVERTED_FILE_PATH =
  "../src/app/generate-lyrics/[song-request-id]/sample-yaro-song-converted.json";

async function updateSongExample(songId, fieldType) {
  try {
    // Read the converted lyrics data
    const convertedFile = path.resolve(
      new URL(import.meta.url).pathname,
      CONVERTED_FILE_PATH
    );
    const lyricsData = JSON.parse(fs.readFileSync(convertedFile, "utf-8"));

    console.log(
      `📝 Sample SQL to update song ${songId} with converted lyrics:`
    );
    console.log("");

    if (fieldType === "processed") {
      console.log("-- Update variant_timestamp_lyrics_processed field");
      console.log(
        `UPDATE songs SET variant_timestamp_lyrics_processed = '${JSON.stringify(
          lyricsData
        ).replace(/'/g, "''")}' WHERE id = ${songId};`
      );
    } else if (fieldType === "api-response") {
      console.log("-- Update variant_timestamp_lyrics_api_response field");
      console.log(
        `UPDATE songs SET variant_timestamp_lyrics_api_response = '${JSON.stringify(
          lyricsData
        ).replace(/'/g, "''")}' WHERE id = ${songId};`
      );
    } else {
      console.log('❌ Invalid field type. Use "processed" or "api-response"');
      return;
    }

    console.log("");
    console.log("📊 Data summary:");
    console.log(
      `- Variant 0 contains ${lyricsData[0]?.length || 0} lyrics entries`
    );
    if (lyricsData[0]?.length > 0) {
      console.log(
        `- Duration: ${lyricsData[0][0].startS}s to ${
          lyricsData[0][lyricsData[0].length - 1].endS
        }s`
      );
      console.log(`- First word: "${lyricsData[0][0].word}"`);
      console.log(
        `- Last word: "${lyricsData[0][lyricsData[0].length - 1].word}"`
      );
    }

    console.log("");
    console.log("📝 Alternative using Prisma/Drizzle ORM:");
    console.log(`await db.update(songsTable)
  .set({
    variant_timestamp_lyrics_processed: ${JSON.stringify(lyricsData, null, 4)}
  })
  .where(eq(songsTable.id, ${songId}));`);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const songIdIndex = args.indexOf("--song-id");
const fieldIndex = args.indexOf("--field");

if (
  songIdIndex === -1 ||
  fieldIndex === -1 ||
  songIdIndex + 1 >= args.length ||
  fieldIndex + 1 >= args.length
) {
  console.log(
    "Usage: node update-song-with-converted-lyrics.mjs --song-id <id> --field <processed|api-response>"
  );
  console.log("");
  console.log("Examples:");
  console.log(
    "  node update-song-with-converted-lyrics.mjs --song-id 123 --field processed"
  );
  console.log(
    "  node update-song-with-converted-lyrics.mjs --song-id 123 --field api-response"
  );
  process.exit(1);
}

const songId = args[songIdIndex + 1];
const fieldType = args[fieldIndex + 1];

updateSongExample(songId, fieldType);
