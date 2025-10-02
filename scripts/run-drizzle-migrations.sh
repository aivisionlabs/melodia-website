#!/bin/bash

# =====================================================
# MELODIA DRIZZLE MIGRATION RUNNER
# =====================================================
# This script provides a simple interface to run Drizzle migrations
# with proper error handling and status reporting
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Default values
DRY_RUN=false
VERBOSE=false

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

print_verbose() {
    if [ "$VERBOSE" = true ]; then
        echo -e "${CYAN}[VERBOSE]${NC} $1"
    fi
}

# Function to show usage
show_usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  migrate                 Apply pending migrations to database"
    echo "  generate [name]         Generate new migration from schema changes"
    echo "  status                  Show migration status"
    echo "  studio                  Open Drizzle Studio"
    echo "  push                    Push schema changes directly (dev only)"
    echo ""
    echo "Options:"
    echo "  --dry-run              Show what would be executed without running"
    echo "  --verbose              Enable verbose output"
    echo "  --help                 Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 migrate                              # Apply all pending migrations"
    echo "  $0 generate add_user_table              # Generate migration for schema changes"
    echo "  $0 status                               # Show migration status"
    echo "  $0 studio                               # Open Drizzle Studio"
    echo "  $0 --dry-run migrate                    # Preview migrations"
    echo ""
    echo "Environment Variables:"
    echo "  DATABASE_URL                            # Database connection string"
}

# Function to check if drizzle-kit is available
check_drizzle_kit() {
    if ! command -v npx &> /dev/null; then
        print_error "npx command not found. Please install Node.js."
        exit 1
    fi

    if ! npx drizzle-kit --version &> /dev/null; then
        print_error "drizzle-kit not found. Please install it with: npm install drizzle-kit"
        exit 1
    fi
}

# Function to run migrations
run_migrate() {
    print_status "Running Drizzle migrations..."

    if [ "$DRY_RUN" = true ]; then
        print_warning "[DRY RUN] Would execute: npx drizzle-kit migrate"
        return 0
    fi

    if npx drizzle-kit migrate; then
        print_success "Migrations applied successfully!"
    else
        print_error "Migration failed!"
        exit 1
    fi
}

# Function to generate migration
run_generate() {
    local migration_name="$1"

    if [ -z "$migration_name" ]; then
        print_error "Migration name is required for generate command"
        echo "Usage: $0 generate <migration_name>"
        exit 1
    fi

    print_status "Generating migration: $migration_name"

    if npx drizzle-kit generate --name="$migration_name"; then
        print_success "Migration generated successfully!"
        print_status "Review the generated migration file before applying it."
    else
        print_error "Migration generation failed!"
        exit 1
    fi
}

# Function to show migration status
run_status() {
    print_status "Checking migration status..."

    # Check if migrations table exists
    if ! npx drizzle-kit migrate --help &> /dev/null; then
        print_warning "Cannot check migration status. Make sure your database is accessible."
        return 1
    fi

    print_status "Migration status check completed."
    print_status "Use 'npx drizzle-kit migrate' to see detailed status."
}

# Function to open Drizzle Studio
run_studio() {
    print_status "Opening Drizzle Studio..."

    if npx drizzle-kit studio; then
        print_success "Drizzle Studio opened successfully!"
    else
        print_error "Failed to open Drizzle Studio!"
        exit 1
    fi
}

# Function to push schema changes
run_push() {
    print_warning "PUSH MODE: This will apply schema changes directly to the database!"
    print_warning "This is intended for development only. Use migrations for production."

    if [ "$DRY_RUN" = true ]; then
        print_warning "[DRY RUN] Would execute: npx drizzle-kit push"
        return 0
    fi

    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Operation cancelled."
        exit 0
    fi

    print_status "Pushing schema changes..."

    if npx drizzle-kit push; then
        print_success "Schema changes pushed successfully!"
    else
        print_error "Schema push failed!"
        exit 1
    fi
}

# Parse command line arguments
COMMAND=""
while [[ $# -gt 0 ]]; do
    case $1 in
        migrate|generate|status|studio|push)
            COMMAND="$1"
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        -*)
            print_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
        *)
            if [ "$COMMAND" = "generate" ]; then
                run_generate "$1"
                exit 0
            else
                print_error "Unknown argument: $1"
                show_usage
                exit 1
            fi
            ;;
    esac
done

# Check prerequisites
check_drizzle_kit

# Execute command
case $COMMAND in
    migrate)
        run_migrate
        ;;
    generate)
        print_error "Migration name is required for generate command"
        echo "Usage: $0 generate <migration_name>"
        exit 1
        ;;
    status)
        run_status
        ;;
    studio)
        run_studio
        ;;
    push)
        run_push
        ;;
    "")
        print_error "No command specified"
        show_usage
        exit 1
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
