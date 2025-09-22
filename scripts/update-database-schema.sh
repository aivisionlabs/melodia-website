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

# Check if the SQL file exists
if [ ! -f "scripts/database-schema-updates.sql" ]; then
    echo "❌ Error: database-schema-updates.sql file not found!"
    exit 1
fi

echo "✅ SQL script found"

# Run the SQL script
echo "📝 Applying database schema updates..."
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/database-schema-updates.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema updated successfully!"
    echo ""
    echo "📊 Summary of changes:"
    echo "  • Added anonymous_user_id to song_requests table"
    echo "  • Added is_approved to lyrics_drafts table"
    echo "  • Added song_request_id, song_url_variant_1, song_url_variant_2, is_featured to songs table"
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
