#!/bin/bash

# Script to run the timestamped lyrics API responses cleanup migration
# This script will clean up existing data that has full API responses stored
# instead of just the alignedWords data.

echo "🚀 Starting Timestamped Lyrics Cleanup Migration..."
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "scripts/cleanup-timestamped-lyrics-api-responses.sql" ]; then
    echo "❌ Error: cleanup-timestamped-lyrics-api-responses.sql not found!"
    echo "   Make sure you're running this from the project root directory."
    exit 1
fi

# Check if database connection is available
echo "🔍 Checking database connection..."

# You can customize these environment variables based on your setup
DB_HOST=${DB_HOST:-"localhost"}
DB_PORT=${DB_PORT:-"5432"}
DB_NAME=${DB_NAME:-"melodia"}
DB_USER=${DB_USER:-"postgres"}

echo "📊 Database connection details:"
echo "   Host: $DB_HOST"
echo "   Port: $DB_PORT"
echo "   Database: $DB_NAME"
echo "   User: $DB_USER"
echo ""

# Ask for confirmation
read -p "⚠️  This will modify existing data. Are you sure you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled."
    exit 1
fi

echo ""
echo "🔄 Running migration..."

# Run the migration
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "scripts/cleanup-timestamped-lyrics-api-responses.sql"; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 What was cleaned up:"
    echo "   - Extracted alignedWords data from full API responses"
    echo "   - Updated database column comments"
    echo "   - Reduced storage overhead"
    echo ""
    echo "🔍 You can verify the changes by checking the database:"
    echo "   SELECT id, title, jsonb_typeof(timestamped_lyrics_api_responses) as response_type"
    echo "   FROM songs WHERE timestamped_lyrics_api_responses IS NOT NULL;"
else
    echo ""
    echo "❌ Migration failed!"
    echo "   Check the error messages above and ensure your database connection is working."
    exit 1
fi

echo ""
echo "🎉 Timestamped lyrics cleanup completed!"
echo "   The system will now store only the necessary alignedWords data."

