#!/bin/bash

# =====================================================
# COMPLETE MELODIA SETUP SCRIPT
# =====================================================
# This script sets up Melodia from scratch on any device
# It handles database setup, environment configuration, and verification
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
}

# Function to check if Node.js is installed
check_node() {
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        print_status "You can download it from: https://nodejs.org/"
        exit 1
    fi

    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_error "Node.js version 18+ is required. Current version: $(node --version)"
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
}

# Function to check if npm is installed
check_npm() {
    if ! command_exists npm; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    print_success "npm $(npm --version) is installed"
}

# Function to create environment file
create_env_file() {
    if [ ! -f .env.local ]; then
        print_status "Creating .env.local file..."
        cat > .env.local << EOF
# Local PostgreSQL Database (Docker)
DATABASE_URL=postgresql://postgres:melodia2024@localhost:5432/melodia

# Supabase (for later use - uncomment and fill when needed)
# NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Suno API (for later use - uncomment and fill when needed)
# SUNO_API_TOKEN=your_suno_api_token

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Database connection pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
EOF
        print_success ".env.local file created"
    else
        print_status ".env.local file already exists"
    fi
}

# Function to start database
start_database() {
    print_status "Starting PostgreSQL database..."

    # Check if docker-compose.yml exists
    if [ ! -f docker-compose.yml ]; then
        print_error "docker-compose.yml not found. Please ensure you're in the Melodia project directory."
        exit 1
    fi

    # Start PostgreSQL container
    docker-compose up -d postgres

    # Wait for database to be ready
    print_status "Waiting for database to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if docker exec melodia-postgres pg_isready -U postgres -d melodia >/dev/null 2>&1; then
            print_success "Database is ready!"
            break
        fi

        if [ $attempt -eq $max_attempts ]; then
            print_error "Database failed to start within expected time. Check Docker logs:"
            docker-compose logs postgres
            exit 1
        fi

        print_status "Attempt $attempt/$max_attempts - waiting for database..."
        sleep 2
        attempt=$((attempt + 1))
    done
}

# Function to setup database schema
setup_database_schema() {
    print_status "Setting up database schema..."

    # Check if the SQL file exists
    if [ ! -f "scripts/essential/setup-complete-database.sql" ]; then
        print_error "Database setup SQL file not found: scripts/essential/setup-complete-database.sql"
        exit 1
    fi

    # Execute the SQL file
    if docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/essential/setup-complete-database.sql; then
        print_success "Database schema setup completed"
    else
        print_error "Failed to setup database schema"
        exit 1
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing Node.js dependencies..."

    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Function to build the project
build_project() {
    print_status "Building the project..."

    if npm run build; then
        print_success "Project built successfully"
    else
        print_error "Failed to build project"
        exit 1
    fi
}

# Function to run database migrations (if using Drizzle)
run_migrations() {
    if [ -f "drizzle.config.ts" ]; then
        print_status "Running database migrations..."

        if npm run db:migrate 2>/dev/null || npm run db:push 2>/dev/null; then
            print_success "Database migrations completed"
        else
            print_warning "Database migrations failed or not configured - continuing with manual setup"
        fi
    else
        print_status "No Drizzle config found - skipping migrations"
    fi
}

# Function to verify setup
verify_setup() {
    print_status "Verifying setup..."

    # Check if database is accessible
    if docker exec melodia-postgres psql -U postgres -d melodia -c "SELECT COUNT(*) FROM admin_users;" >/dev/null 2>&1; then
        print_success "Database connection verified"
    else
        print_error "Database connection verification failed"
        exit 1
    fi

    # Check if tables exist
    local tables=("songs" "admin_users" "users" "anonymous_users" "song_requests" "lyrics_drafts" "payments" "pricing_plans" "payment_webhooks")
    for table in "${tables[@]}"; do
        if docker exec melodia-postgres psql -U postgres -d melodia -c "SELECT 1 FROM $table LIMIT 1;" >/dev/null 2>&1; then
            print_success "Table '$table' exists"
        else
            print_error "Table '$table' not found"
            exit 1
        fi
    done
}

# Function to show next steps
show_next_steps() {
    echo ""
    echo -e "${GREEN}🎉 Melodia setup completed successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Database Details:${NC}"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: melodia"
    echo "   Username: postgres"
    echo "   Password: melodia2024"
    echo ""
    echo -e "${BLUE}🌐 Optional: pgAdmin is available at http://localhost:8080${NC}"
    echo "   Email: admin@melodia.com"
    echo "   Password: melodia2024"
    echo ""
    echo -e "${BLUE}🚀 Next steps:${NC}"
    echo "   1. Start the development server: npm run dev"
    echo "   2. Visit: http://localhost:3000"
    echo "   3. Admin portal: http://localhost:3000/song-admin-portal"
    echo "   4. Login with: admin1 / melodia2024!"
    echo ""
    echo -e "${BLUE}🛑 To stop the database: docker-compose down${NC}"
    echo -e "${BLUE}🔄 To restart: docker-compose up -d${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "   - Make sure Docker is running before starting the app"
    echo "   - The database will persist data between restarts"
    echo "   - Check .env.local for additional configuration options"
}

# Main setup function
main() {
    echo -e "${BLUE}=====================================================${NC}"
    echo -e "${BLUE}    MELODIA COMPLETE SETUP SCRIPT${NC}"
    echo -e "${BLUE}=====================================================${NC}"
    echo ""

    # Check prerequisites
    print_status "Checking prerequisites..."
    check_docker
    check_node
    check_npm

    # Create environment file
    create_env_file

    # Start database
    start_database

    # Setup database schema
    setup_database_schema

    # Install dependencies
    install_dependencies

    # Run migrations (if applicable)
    run_migrations

    # Build project
    build_project

    # Verify setup
    verify_setup

    # Show next steps
    show_next_steps
}

# Run main function
main "$@"
