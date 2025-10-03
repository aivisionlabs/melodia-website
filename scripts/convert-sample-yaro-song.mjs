#!/usr/bin/env node

/**
 * Script to convert sample-yaro-song.json to the format expected by
 * variant_timestamp_lyrics_processed field in the songs table.
 *
 * This script:
 * 1. Reads the JSON string from the file
 * 2. Parses it to extract lyrics data
 * 3. Converts the format to match the expected database structure
 * 4. Outputs the converted JSON structure
 */

import fs from "fs";
import path from "path";

const SAMPLE_FILE_PATH = "./sample-yaro-song.json";
const OUTPUT_FILE_PATH = "./sample-yaro-song-converted.json";

function convertLyricsFormat(inputData) {
  try {
    // Parse the JSON string (file contains a quoted JSON string)
    let parsedData =
      typeof inputData === "string" ? JSON.parse(inputData) : inputData;

    // If the parsed data is still a string (nested JSON), parse it again
    if (typeof parsedData === "string") {
      parsedData = JSON.parse(parsedData);
    }

    // The data structure: {[variantIndex: number]: AlignedWord[]}
    // Variant "0" contains an array of lyrics objects
    const variantZeroData = parsedData["0"];

    if (!Array.isArray(variantZeroData)) {
      throw new Error('Expected variant "0" to contain an array');
    }

    // Convert each lyrics object to the expected format
    const convertedLyrics = variantZeroData.map((item) => {
      return {
        word: item.text, // Convert 'text' to 'word'
        success: true, // Assume successful alignment
        startS: item.start / 1000, // Convert milliseconds to seconds
        endS: item.end / 1000, // Convert milliseconds to seconds
        palign: 0, // Set to 0 (API response alignment)
      };
    });

    // Create the final structure: {[variantIndex: number]: AlignedWord[]}
    return {
      0: convertedLyrics,
    };
  } catch (error) {
    console.error("Error converting lyrics format:", error);
    throw error;
  }
}

function main() {
  try {
    console.log("Converting sample-yaro-song.json...");

    // Read the input file
    const inputContent = fs.readFileSync(SAMPLE_FILE_PATH, "utf-8");

    // Convert the format
    const convertedData = convertLyricsFormat(inputContent);

    // Write the converted data to file
    fs.writeFileSync(OUTPUT_FILE_PATH, JSON.stringify(convertedData, null, 2));

    console.log("✅ Conversion completed successfully!");
    console.log(`📝 Original file: ${SAMPLE_FILE_PATH}`);
    console.log(`📝 Converted file: ${OUTPUT_FILE_PATH}`);
    console.log(
      `📊 Processed ${convertedData[0].length} lyrics entries for variant 0`
    );

    // Show sample of converted data
    console.log("\nSample of converted lyrics:");
    console.log(JSON.stringify(convertedData[0].slice(0, 3), null, 2));
  } catch (error) {
    console.error("❌ Conversion failed:", error.message);
    process.exit(1);
  }
}

// Run the conversion if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { convertLyricsFormat };
