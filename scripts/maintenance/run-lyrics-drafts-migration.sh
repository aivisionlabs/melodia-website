#!/bin/bash

# =====================================================
# Lyrics Drafts Schema Migration Script
# This script applies the lyrics_drafts table cleanup migration
# =====================================================

set -e  # Exit on any error

echo "🚀 Starting Lyrics Drafts Schema Migration..."

# Check if docker is running
if ! docker ps | grep -q "melodia-postgres"; then
    echo "❌ Error: melodia-postgres container is not running!"
    echo "Please start the database with: docker-compose up -d postgres"
    exit 1
fi

echo "✅ Database container is running"

# Check if the migration file exists
if [ ! -f "scripts/maintenance/schema-migration-lyrics-drafts-cleanup.sql" ]; then
    echo "❌ Error: schema-migration-lyrics-drafts-cleanup.sql file not found!"
    exit 1
fi

echo "✅ Migration script found"

# Run the migration
echo "📝 Applying lyrics_drafts schema migration..."
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/maintenance/schema-migration-lyrics-drafts-cleanup.sql

if [ $? -eq 0 ]; then
    echo "✅ Lyrics drafts schema migration completed successfully!"
    echo ""
    echo "📊 Summary of changes:"
    echo "  • Renamed prompt_input column to lyrics_edit_prompt"
    echo "  • Removed unused columns: structure, length_hint, is_approved, edited_text, tone, language"
    echo "  • Updated table comments"
    echo ""
    echo "🎉 Database schema is now updated!"
else
    echo "❌ Error: Lyrics drafts schema migration failed!"
    exit 1
fi
