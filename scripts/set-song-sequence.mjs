#!/usr/bin/env node

/**
 * Script to set sequence values for songs in the correct display order
 * Run this script after adding the sequence field to set the desired order
 */

import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables");
  console.error("NEXT_PUBLIC_SUPABASE_URL:", !!supabaseUrl);
  console.error("SUPABASE_SERVICE_ROLE_KEY:", !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setSongSequence() {
  try {
    console.log("Fetching songs to set sequence...");

    // Get all active songs ordered by the desired display order
    const { data: songs, error } = await supabase
      .from("songs")
      .select("id, title, created_at")
      .eq("add_to_library", true)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false }); // You can change this order as needed

    if (error) {
      throw error;
    }

    if (!songs || songs.length === 0) {
      console.log("No songs found to update");
      return;
    }

    console.log(`Found ${songs.length} songs to update`);

    // Update sequence values
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const sequence = i + 1; // Start from 1

      console.log(
        `Setting sequence ${sequence} for song: ${song.title} (ID: ${song.id})`
      );

      const { error: updateError } = await supabase
        .from("songs")
        .update({ sequence })
        .eq("id", song.id);

      if (updateError) {
        console.error(`Failed to update song ${song.id}:`, updateError);
      }
    }

    console.log("Sequence update completed successfully!");

    // Verify the update
    const { data: verifySongs, error: verifyError } = await supabase
      .from("songs")
      .select("id, title, sequence")
      .eq("add_to_library", true)
      .eq("is_deleted", false)
      .order("sequence");

    if (verifyError) {
      console.error("Error verifying update:", verifyError);
      return;
    }

    console.log("\nVerification - Songs in sequence order:");
    verifySongs?.forEach((song) => {
      console.log(`Sequence ${song.sequence}: ${song.title}`);
    });
  } catch (error) {
    console.error("Error setting song sequence:", error);
    process.exit(1);
  }
}

// Run the script
setSongSequence();
