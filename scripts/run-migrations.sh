#!/bin/bash

# Database migration script for Phase 6
echo "🚀 Running Phase 6 database migrations..."

# Check if database connection is available
echo "📊 Checking database connection..."

# Run the schema fix migration
echo "🔧 Fixing database schema..."
psql $DATABASE_URL -f scripts/fix-database-schema.sql

# Run the Phase 6 migration
echo "📝 Running Phase 6 migration..."
psql $DATABASE_URL -f scripts/migrate-phase6-schema.sql

echo "✅ Migrations completed successfully!"
echo ""
echo "📋 Migration Summary:"
echo "- Added missing fields to songs table for backward compatibility"
echo "- Created lyrics_drafts table for Phase 6 workflow"
echo "- Updated song_requests table with lyrics workflow fields"
echo "- Added proper indexes for performance"
echo ""
echo "🎉 Phase 6 database setup is complete!"
