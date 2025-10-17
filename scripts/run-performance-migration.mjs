#!/usr/bin/env node

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { performanceIndexesMigration } from "./performance-indexes.js";

// Database connection
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!connectionString) {
  console.error(
    "❌ DATABASE_URL or POSTGRES_URL environment variable is required"
  );
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

async function runMigration() {
  try {
    console.log("🚀 Starting performance indexes migration...");

    // Run the migration
    await performanceIndexesMigration.up(db);

    console.log("✅ Performance indexes migration completed successfully!");
    console.log("📊 Added indexes for:");
    console.log("   - Songs filtering (add_to_library, is_deleted)");
    console.log("   - Search optimization (title, description)");
    console.log("   - Category filtering");
    console.log("   - Pagination (sequence, created_at)");
    console.log("   - Song likes");
    console.log("   - Partial indexes for active records");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export { runMigration };
