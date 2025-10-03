#!/bin/bash

# =====================================================
# MELODIA DATABASE SETUP SCRIPT
# =====================================================
# This script sets up the complete database schema for Melodia
# DEVELOPMENT MODE: Drops all existing data and starts fresh
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
DB_NAME="melodia"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SQL_FILE="$SCRIPT_DIR/setup-database.sql"

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

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS]"
    echo ""
    echo "Options:"
    echo "  -d, --database NAME    Database name (default: melodia)"
    echo "  -u, --user USER        Database user (default: postgres)"
    echo "  -h, --host HOST        Database host (default: localhost)"
    echo "  -p, --port PORT        Database port (default: 5432)"
    echo "  -f, --file FILE        SQL file path (default: setup-database.sql)"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Use defaults"
    echo "  $0 -d mydb -u myuser                 # Custom database and user"
    echo "  $0 -h db.example.com -p 5433         # Custom host and port"
    echo ""
    echo "Environment Variables:"
    echo "  PGPASSWORD                           # Database password"
    echo "  DATABASE_URL                         # Full database URL (overrides other options)"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -d|--database)
            DB_NAME="$2"
            shift 2
            ;;
        -u|--user)
            DB_USER="$2"
            shift 2
            ;;
        -h|--host)
            DB_HOST="$2"
            shift 2
            ;;
        -p|--port)
            DB_PORT="$2"
            shift 2
            ;;
        -f|--file)
            SQL_FILE="$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
done

# Check if SQL file exists
if [[ ! -f "$SQL_FILE" ]]; then
    print_error "SQL file not found: $SQL_FILE"
    exit 1
fi

# Check if psql is available
if ! command -v psql &> /dev/null; then
    print_error "psql command not found. Please install PostgreSQL client tools."
    exit 1
fi

# Check if database exists
print_status "Checking if database '$DB_NAME' exists..."
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
    print_warning "Database '$DB_NAME' already exists."
    print_warning "This script will DROP ALL DATA and recreate the schema!"
    echo ""
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Operation cancelled."
        exit 0
    fi
else
    print_status "Database '$DB_NAME' does not exist. Creating it..."
    createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    print_success "Database '$DB_NAME' created successfully."
fi

# Run the SQL script
print_status "Running database setup script..."
print_status "Database: $DB_NAME"
print_status "User: $DB_USER"
print_status "Host: $DB_HOST"
print_status "Port: $DB_PORT"
print_status "SQL File: $SQL_FILE"
echo ""

# Execute the SQL script
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE"; then
    print_success "Database setup completed successfully!"
    echo ""
    print_status "Database schema has been created with the following tables:"
    echo "  - songs (with new refactored schema)"
    echo "  - users"
    echo "  - anonymous_users"
    echo "  - song_requests"
    echo "  - lyrics_drafts"
    echo "  - admin_users"
    echo "  - payments"
    echo "  - pricing_plans"
    echo "  - payment_webhooks"
    echo ""
    print_status "Sample data has been inserted:"
    echo "  - 3 admin users (admin1, admin2, admin3)"
    echo "  - 3 pricing plans (Basic, Premium, Pro)"
    echo ""
    print_success "You can now start the Melodia application!"
else
    print_error "Database setup failed!"
    exit 1
fi
