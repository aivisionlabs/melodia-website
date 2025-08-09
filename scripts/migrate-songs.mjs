import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import { songsTable } from "../src/lib/db/schema.js";

// Load environment variables
config({ path: ".env.local" });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error(
    "Missing DATABASE_URL. Please set DATABASE_URL in your .env.local file"
  );
  process.exit(1);
}

// Create database connection
const client = postgres(databaseUrl);
const db = drizzle(client);

// Import customCreations from constants
const { customCreations } = await import("../src/lib/constants.js");

async function migrateSongs() {
  console.log("Starting song migration...");

  for (const song of customCreations) {
    try {
      // Check if song already exists
      const existingSong = await db
        .select({ id: songsTable.id })
        .from(songsTable)
        .where(eq(songsTable.slug, song.slug))
        .limit(1);

      if (existingSong.length > 0) {
        console.log(`Song "${song.title}" already exists, skipping...`);
        continue;
      }

      // Prepare song data for database
      const songData = {
        title: song.title,
        lyrics: song.lyrics,
        timestamp_lyrics: song.timestamp_lyrics,
        music_style: song.music_style,
        service_provider: song.service_provider,
        song_requester: song.song_requester,
        prompt: song.prompt,
        song_url: song.song_url,
        duration: song.duration,
        slug: song.slug,
        is_active: true,
        status: "completed", // Mark existing songs as completed
        categories: [],
        tags: [],
        created_at: new Date(song.created_at),
      };

      // Insert song into database
      const [insertedSong] = await db
        .insert(songsTable)
        .values(songData)
        .returning();

      if (insertedSong) {
        console.log(
          `Successfully migrated song "${song.title}" with ID: ${insertedSong.id}`
        );
      }
    } catch (error) {
      console.error(`Error processing song "${song.title}":`, error);
    }
  }

  console.log("Migration completed!");

  // Close database connection
  await client.end();
}

// Run migration
migrateSongs().catch(console.error);
