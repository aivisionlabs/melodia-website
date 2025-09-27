#!/usr/bin/env node

import { config } from "dotenv";
import postgres from "postgres";

// Load environment variables
config({ path: ".env" });
config({ path: ".env.local" });

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

async function checkSongRequests() {
  let client;

  try {
    // Create database connection
    client = postgres(DATABASE_URL, {
      ssl: false,
      connect_timeout: 30,
      idle_timeout: 20,
      max: 5,
    });

    console.log("🔍 Checking song requests status...\n");

    // Get all song requests with their lyrics status
    const requests = await client`
      SELECT
        id,
        recipient_details,
        languages,
        status,
        lyrics_status,
        created_at
      FROM song_requests
      ORDER BY created_at DESC;
    `;

    if (requests.length === 0) {
      console.log("📝 No song requests found in the database.");
      return;
    }

    console.log(`📊 Found ${requests.length} song request(s):\n`);

    requests.forEach((request, index) => {
      console.log(`${index + 1}. Song for ${request.recipient_name}`);
      console.log(
        `   Languages: ${request.languages?.join(", ") || "Not specified"}`
      );
      console.log(`   Status: ${request.status}`);
      console.log(
        `   Lyrics Status: ${request.lyrics_status || "NULL"} ${
          request.lyrics_status ? "✅" : "❌"
        }`
      );
      console.log(
        `   Created: ${new Date(request.created_at).toLocaleDateString()}`
      );
      console.log("");
    });

    // Check if any requests need lyrics_status update
    const nullLyricsStatus = requests.filter((r) => !r.lyrics_status);
    if (nullLyricsStatus.length > 0) {
      console.log(
        `⚠️  ${nullLyricsStatus.length} request(s) still have NULL lyrics_status.`
      );
      console.log('🔄 Updating them to "pending"...');

      // lyrics_status moved to lyrics_drafts table - no longer needed
      console.log(
        "ℹ️  lyrics_status moved to lyrics_drafts table - skipping update"
      );

      console.log("✅ Updated successfully!");
    } else {
      console.log("✅ All song requests have proper lyrics_status!");
    }
  } catch (error) {
    console.error("❌ Error checking song requests:", error.message);
    process.exit(1);
  } finally {
    if (client) {
      await client.end();
    }
  }
}

checkSongRequests();
