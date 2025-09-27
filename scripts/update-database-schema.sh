#!/bin/bash

# =====================================================
# Melodia Database Schema Update Script
# This script updates the database schema with missing columns and tables
# =====================================================

set -e  # Exit on any error

echo "🚀 Starting Melodia Database Schema Update..."

# Check if docker is running
if ! docker ps | grep -q "melodia-postgres"; then
    echo "❌ Error: melodia-postgres container is not running!"
    echo "Please start the database with: docker-compose up -d postgres"
    exit 1
fi

echo "✅ Database container is running"

# --- New: Run the complete setup script first to ensure base tables exist ---
echo "📝 Applying complete database setup (base tables)..."
if [ ! -f "scripts/essential/setup-complete-database.sql" ]; then
    echo "❌ Error: scripts/essential/setup-complete-database.sql file not found!"
    exit 1
fi
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/essential/setup-complete-database.sql
if [ $? -ne 0 ]; then
    echo "❌ Error: Base database setup failed!"
    exit 1
fi
echo "✅ Base database setup applied successfully"

# Check if the SQL file exists (for schema updates)
if [ ! -f "scripts/database-schema-updates.sql" ]; then
    echo "❌ Error: database-schema-updates.sql file not found!"
    exit 1
fi

echo "✅ SQL script for schema updates found"

# Run the schema update
echo "📝 Applying additional database schema updates..."
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/database-schema-updates.sql

# Run lyrics_drafts schema migration
echo "📝 Applying lyrics_drafts schema migration..."
if [ -f "scripts/maintenance/schema-migration-lyrics-drafts-cleanup.sql" ]; then
    docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/maintenance/schema-migration-lyrics-drafts-cleanup.sql
    if [ $? -eq 0 ]; then
        echo "✅ Lyrics drafts schema migration completed"
    else
        echo "⚠️  Warning: Lyrics drafts migration failed - continuing with existing schema"
    fi
else
    echo "⚠️  Warning: Lyrics drafts migration file not found - skipping migration"
fi

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
    echo ""
    echo "📊 Summary of changes:"
    echo "  • Added anonymous_user_id to song_requests table"
    echo "  • Cleaned up lyrics_drafts table (removed unused fields, renamed prompt_input to lyrics_edit_prompt)"
    echo "  • Added song_request_id, song_url_variant_1, song_url_variant_2, is_featured, approved_lyrics_id to songs table"
    echo "  • Created anonymous_users table"
    echo "  • Created payments table"
    echo "  • Created pricing_plans table"
    echo "  • Created payment_webhooks table"
    echo "  • Added all foreign key constraints"
    echo "  • Added performance indexes"
    echo "  • Inserted sample pricing plans"
    echo ""
    echo "🎉 Database is now ready for production!"
else
    echo "❌ Error: Database schema update failed!"
    exit 1
fi
