#!/bin/bash

# =====================================================
# Production Database Dump Script (Docker Version)
# =====================================================
# This script creates a dump of your production database using Docker
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

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_status "Production Database Dump Script (Docker Version)"
print_status "Timestamp: $TIMESTAMP"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create database dump using Docker
create_dump() {
    print_status "Creating production database dump using Docker..."
    
    # Get database connection details
    echo ""
    print_status "Please provide your production database connection details:"
    echo ""
    
    read -p "Database Host: " DB_HOST
    read -p "Database Port (default: 5432): " DB_PORT
    read -p "Database Name: " DB_NAME
    read -p "Database Username: " DB_USER
    read -s -p "Database Password: " DB_PASSWORD
    echo ""
    
    # Set default port if not provided
    DB_PORT=${DB_PORT:-5432}
    
    # Create dump filename
    DUMP_FILE="$BACKUP_DIR/prod_dump_$TIMESTAMP.sql"
    
    print_status "Creating dump file: $DUMP_FILE"
    
    # Create the dump using Docker
    if docker run --rm \
        -e PGPASSWORD="$DB_PASSWORD" \
        postgres:15 \
        pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
        > "$DUMP_FILE"; then
        
        print_success "Database dump created successfully: $DUMP_FILE"
        
        # Get file size
        FILE_SIZE=$(du -h "$DUMP_FILE" | cut -f1)
        print_status "Dump file size: $FILE_SIZE"
        
        # Show first few lines to verify
        print_status "Dump file preview (first 10 lines):"
        head -10 "$DUMP_FILE"
        
        return 0
    else
        print_error "Failed to create database dump"
        exit 1
    fi
}

# Function to create environment file for production
create_prod_env() {
    print_status "Creating production environment file..."
    
    ENV_FILE="$PROJECT_DIR/.env.production"
    
    cat > "$ENV_FILE" << EOF
# Production Database Configuration
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@$DB_HOST:$DB_PORT/$DB_NAME

# Production URLs
NEXT_PUBLIC_BASE_URL=https://your-production-domain.com

# API Keys (add your production keys here)
# SUNO_API_TOKEN=your_production_suno_token
# GEMINI_API_KEY=your_production_gemini_key

# Database connection pool settings
DATABASE_POOL_MIN=5
DATABASE_POOL_MAX=20

# Production specific settings
NODE_ENV=production
EOF
    
    print_success "Production environment file created: $ENV_FILE"
    print_warning "Please update the API keys and URLs in the file before using"
}

# Function to restore dump to local Docker database
restore_to_local() {
    print_status "Do you want to restore this dump to your local Docker database? (y/n)"
    read -p "Restore to local database: " RESTORE_LOCAL
    
    if [[ $RESTORE_LOCAL =~ ^[Yy]$ ]]; then
        print_status "Restoring dump to local Docker database..."
        
        # Check if local database container is running
        if docker ps | grep -q "postgres"; then
            # Restore the dump
            docker exec -i postgres psql -U postgres -d melodia < "$DUMP_FILE"
            print_success "Dump restored to local database successfully"
        else
            print_warning "Local postgres container not running. Please start it first with:"
            print_status "docker-compose up -d postgres"
        fi
    fi
}

# Main function
main() {
    print_status "Starting production database dump process..."
    
    # Create dump
    create_dump
    
    # Create production env file
    create_prod_env
    
    # Ask about restoring to local
    restore_to_local
    
    print_success "Production database dump completed!"
    echo ""
    print_status "Next steps:"
    print_status "1. Review the dump file: $DUMP_FILE"
    print_status "2. Update .env.production with your production settings"
    print_status "3. Run the setup scripts to configure your local environment"
    echo ""
    print_status "To restore this dump to a local database manually:"
    print_status "docker exec -i postgres psql -U postgres -d melodia < $DUMP_FILE"
}

# Run main function
main "$@"

