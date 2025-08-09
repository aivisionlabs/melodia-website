#!/bin/bash

echo "🚀 Setting up local PostgreSQL database for Melodia..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create .env.local file if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cat > .env.local << EOF
# Local PostgreSQL Database (Docker)
DATABASE_URL=postgresql://postgres:melodia2024@localhost:5432/melodia

# Supabase (for later use)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Suno API (for later use)
# SUNO_API_TOKEN=your_suno_api_token

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
EOF
    echo "✅ .env.local file created"
else
    echo "ℹ️  .env.local file already exists"
fi

# Start Docker containers
echo "🐳 Starting PostgreSQL database..."
docker-compose up -d postgres

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Check if database is accessible
echo "🔍 Testing database connection..."
if docker exec melodia-postgres pg_isready -U postgres -d melodia; then
    echo "✅ Database is ready!"
else
    echo "❌ Database connection failed. Please check Docker logs:"
    docker-compose logs postgres
    exit 1
fi

echo ""
echo "🎉 Local database setup complete!"
echo ""
echo "📊 Database Details:"
echo "   Host: localhost"
echo "   Port: 5432"
echo "   Database: melodia"
echo "   Username: postgres"
echo "   Password: melodia2024"
echo ""
echo "🌐 Optional: pgAdmin is available at http://localhost:8080"
echo "   Email: admin@melodia.com"
echo "   Password: melodia2024"
echo ""
echo "🚀 Next steps:"
echo "   1. Run: npm run dev"
echo "   2. Visit: http://localhost:3000/song-admin-portal"
echo "   3. Login with: admin1 / melodia2024!"
echo ""
echo "🛑 To stop the database: docker-compose down"
echo "🔄 To restart: docker-compose up -d"