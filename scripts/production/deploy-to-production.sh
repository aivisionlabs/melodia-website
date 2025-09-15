#!/bin/bash

# Production Deployment Script for Melodia Website
# This script automates the deployment process

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

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_DIR/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

print_status "Starting production deployment for Melodia Website"
print_status "Timestamp: $TIMESTAMP"
print_status "Project directory: $PROJECT_DIR"

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    # Check if git is installed
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed"
        exit 1
    fi

    # Check if node is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi

    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi

    # Check if we're in the right directory
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Create backup
create_backup() {
    print_status "Creating backup..."

    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"

    # Create backup filename
    BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_warning "DATABASE_URL not set. Skipping database backup."
        return 0
    fi

    # Create database backup
    if command -v pg_dump &> /dev/null; then
        print_status "Creating database backup..."
        pg_dump "$DATABASE_URL" > "$BACKUP_FILE"
        print_success "Database backup created: $BACKUP_FILE"
    else
        print_warning "pg_dump not found. Skipping database backup."
    fi
}

# Run database migration
run_migration() {
    print_status "Running database migration..."

    # Check if migration script exists
    MIGRATION_SCRIPT="$SCRIPT_DIR/production-migration.sql"
    if [ ! -f "$MIGRATION_SCRIPT" ]; then
        print_error "Migration script not found: $MIGRATION_SCRIPT"
        exit 1
    fi

    # Check if DATABASE_URL is set
    if [ -z "$DATABASE_URL" ]; then
        print_error "DATABASE_URL not set. Cannot run migration."
        exit 1
    fi

    # Run migration
    print_status "Executing migration script..."
    psql "$DATABASE_URL" -f "$MIGRATION_SCRIPT"

    if [ $? -eq 0 ]; then
        print_success "Database migration completed successfully"
    else
        print_error "Database migration failed"
        exit 1
    fi
}

# Build application
build_application() {
    print_status "Building application..."

    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --production

    # Build application
    print_status "Building application..."
    npm run build

    if [ $? -eq 0 ]; then
        print_success "Application build completed successfully"
    else
        print_error "Application build failed"
        exit 1
    fi
}

# Deploy application
deploy_application() {
    print_status "Deploying application..."

    # This section would be customized based on your deployment platform
    # For example, if using Vercel, Netlify, or a custom server

    print_warning "Please deploy the application manually or customize this section"
    print_status "Current deployment options:"
    print_status "1. Push to main branch (if using Vercel/Netlify)"
    print_status "2. Copy files to server"
    print_status "3. Use deployment platform CLI"

    # Example for Vercel
    # if command -v vercel &> /dev/null; then
    #     print_status "Deploying to Vercel..."
    #     vercel --prod
    # else
    #     print_warning "Vercel CLI not found. Please deploy manually."
    # fi
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."

    # Check if application is running
    if [ -n "$PRODUCTION_URL" ]; then
        print_status "Checking application health..."

        # Wait for application to be ready
        sleep 10

        # Check if application responds
        if curl -f -s "$PRODUCTION_URL" > /dev/null; then
            print_success "Application is responding"
        else
            print_warning "Application may not be ready yet"
        fi
    else
        print_warning "PRODUCTION_URL not set. Skipping health check."
    fi
}

# Main deployment function
main() {
    print_status "Starting deployment process..."

    # Check prerequisites
    check_prerequisites

    # Create backup
    create_backup

    # Run migration
    run_migration

    # Build application
    build_application

    # Deploy application
    deploy_application

    # Verify deployment
    verify_deployment

    print_success "Deployment completed successfully!"
    print_status "Next steps:"
    print_status "1. Test the application thoroughly"
    print_status "2. Monitor for any issues"
    print_status "3. Update documentation"
    print_status "4. Notify team of successful deployment"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h     Show this help message"
        echo "  --backup-only  Only create backup"
        echo "  --migrate-only Only run database migration"
        echo "  --build-only   Only build application"
        echo ""
        echo "Environment variables:"
        echo "  DATABASE_URL      Database connection string"
        echo "  PRODUCTION_URL    Production application URL"
        echo ""
        exit 0
        ;;
    --backup-only)
        check_prerequisites
        create_backup
        exit 0
        ;;
    --migrate-only)
        check_prerequisites
        run_migration
        exit 0
        ;;
    --build-only)
        check_prerequisites
        build_application
        exit 0
        ;;
    "")
        main
        ;;
    *)
        print_error "Unknown option: $1"
        echo "Use --help for usage information"
        exit 1
        ;;
esac