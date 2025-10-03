#!/bin/bash

# Script to run the songs migration for public library
# This script executes the generated SQL migration

echo "🚀 Starting Melodia Songs Migration to Public Library..."
echo "================================================="

# Check if database connection variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable is not set"
    echo "Please set DATABASE_URL to your PostgreSQL connection string"
    echo "Example: export DATABASE_URL='postgresql://user:password@localhost:5432/dbname'"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql command not found"
    echo "Please install PostgreSQL client tools"
    exit 1
fi

echo "📊 Database: $(echo $DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)"
echo "📂 Migration script: scripts/final-songs-migration.sql"
echo "🎵 Songs to migrate: 26 songs"

# Ask for confirmation
read -p "Do you want to proceed with the migration? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo "⏳ Executing migration..."

# Get the script directory and ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$SCRIPT_DIR/final-songs-migration.sql"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Project root: $PROJECT_ROOT"
echo "📄 Migration file path: $MIGRATION_FILE"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration script not found at: $MIGRATION_FILE"
    echo "📂 Available files in scripts directory:"
    ls -la "$SCRIPT_DIR/" | grep -E '\.(sql|sh)$'
    exit 1
fi

echo "✅ Migration file found!"

# Change to project root and run the migration
cd "$PROJECT_ROOT"
echo "📍 Current directory: $(pwd)"

# Run the migration script
psql "$DATABASE_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "🎉 All 26 songs have been migrated to the public library"
    echo "🔍 You can now access these songs via /song/[slug] pages"
    echo "📚 Example URLs:"
    echo "   - /song/ruchi-my-queen"
    echo "   - /song/kaleidoscope-heart"
    echo "   - /song/same-office-hearts"
    echo ""
    echo "🛠️  Next steps:"
    echo "   1. Test a few song pages to ensure they work"
    echo "   2. Update any frontend components if needed"
    echo "   3. Consider adding these to navigation menus"
else
    echo "❌ Migration failed"
    echo "Please check the error messages above and fix any issues"
    exit 1
fi

