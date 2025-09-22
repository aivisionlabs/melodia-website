#!/bin/bash

# =====================================================
# Melodia Database Setup Script for Docker
# This script sets up the complete database with Docker
# =====================================================

set -e  # Exit on any error

echo "🐳 Starting Melodia Database Setup with Docker..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running!"
    echo "Please start Docker and try again."
    exit 1
fi

echo "✅ Docker is running"

# Check if docker-compose is available
if ! command -v docker-compose > /dev/null 2>&1; then
    echo "❌ Error: docker-compose is not installed!"
    echo "Please install docker-compose and try again."
    exit 1
fi

echo "✅ docker-compose is available"

# Start the database
echo "🚀 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is healthy
echo "🔍 Checking database health..."
if ! docker exec melodia-postgres pg_isready -U postgres -d melodia > /dev/null 2>&1; then
    echo "❌ Error: Database is not ready!"
    echo "Please check the logs: docker logs melodia-postgres"
    exit 1
fi

echo "✅ Database is ready"

# Run the schema update
echo "📝 Applying database schema updates..."
./scripts/update-database-schema.sh

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Database setup completed successfully!"
    echo ""
    echo "📊 Database Status:"
    echo "  • Container: $(docker ps --format 'table {{.Names}}\t{{.Status}}' | grep melodia-postgres)"
    echo "  • Health: $(docker exec melodia-postgres pg_isready -U postgres -d melodia)"
    echo ""
    echo "🔗 Connect to database:"
    echo "  docker exec -it melodia-postgres psql -U postgres -d melodia"
    echo ""
    echo "📁 View logs:"
    echo "  docker logs melodia-postgres"
else
    echo "❌ Error: Database setup failed!"
    exit 1
fi
