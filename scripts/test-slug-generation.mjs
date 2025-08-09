#!/usr/bin/env node

/**
 * Test script for slug generation
 * Run with: node scripts/test-slug-generation.mjs
 */

// Since we can't directly import TypeScript files in Node.js, let's implement the functions inline for testing
function generateBaseSlug(title) {
  if (!title || typeof title !== "string") {
    return "song";
  }

  const slug = title
    .toLowerCase()
    .trim()
    // Replace special characters and spaces with hyphens
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, "")
    // Limit length to 50 characters
    .substring(0, 50);

  // If the result is empty (e.g., title was just special characters), use default
  if (!slug) {
    return "song";
  }

  return slug;
}

function isValidSlug(slug) {
  if (!slug || typeof slug !== "string") {
    return false;
  }

  // Check if slug matches the expected pattern
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugPattern.test(slug) && slug.length <= 100;
}

const testTitles = [
  "Hello World",
  "My Song Title!",
  "Song with (Parentheses)",
  "Very Long Title That Should Be Truncated Because It Exceeds The Maximum Length",
  "Song with Numbers 123",
  "Special@#$%Characters",
  "Multiple   Spaces",
  "Trailing-Hyphens-",
  "-Leading-Hyphens",
  "Mixed_Case_And_Spaces",
  "Song with Emojis 🎵🎶",
  "123 Numbers Only",
  "   Spaces Around   ",
  "",
  "---",
  "A".repeat(100), // Very long title
];

console.log("🎵 Testing Slug Generation\n");

testTitles.forEach((title, index) => {
  const slug = generateBaseSlug(title);
  const isValid = isValidSlug(slug);

  console.log(`${index + 1}. Title: "${title}"`);
  console.log(`   Slug: "${slug}"`);
  console.log(`   Valid: ${isValid ? "✅" : "❌"}`);
  console.log(`   Length: ${slug.length} characters\n`);
});

console.log("✅ Slug generation test completed!");
