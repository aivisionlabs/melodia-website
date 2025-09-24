#!/bin/bash

# =====================================================
# COMPLETE PRODUCTION SETUP SCRIPT
# =====================================================
# This script runs all necessary scripts for production setup
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

print_status "Complete Production Setup Script for Melodia"
print_status "Project directory: $PROJECT_DIR"

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check if Docker is running
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker and try again."
        exit 1
    fi
    print_success "Docker is running"
    
    # Check if Node.js is installed
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    print_success "Node.js $(node --version) is installed"
    
    # Check if npm is installed
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    print_success "npm $(npm --version) is installed"
    
    # Check if we're in the right directory
    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    print_success "Project directory verified"
}

# Function to create production database dump
create_prod_dump() {
    print_status "Step 1: Creating production database dump..."
    
    if [ -f "$SCRIPT_DIR/create-prod-dump-docker.sh" ]; then
        print_status "Running production database dump script (Docker version)..."
        bash "$SCRIPT_DIR/create-prod-dump-docker.sh"
        print_success "Production database dump completed"
    elif [ -f "$SCRIPT_DIR/create-prod-dump.sh" ]; then
        print_status "Running production database dump script..."
        bash "$SCRIPT_DIR/create-prod-dump.sh"
        print_success "Production database dump completed"
    else
        print_warning "Production dump script not found. Skipping..."
    fi
}

# Function to setup Docker database
setup_docker_database() {
    print_status "Step 2: Setting up Docker database..."
    
    if [ -f "$SCRIPT_DIR/setup-database-docker.sh" ]; then
        print_status "Running Docker database setup script..."
        bash "$SCRIPT_DIR/setup-database-docker.sh"
        print_success "Docker database setup completed"
    else
        print_error "Docker database setup script not found!"
        exit 1
    fi
}

# Function to run database schema updates
run_schema_updates() {
    print_status "Step 3: Running database schema updates..."
    
    if [ -f "$SCRIPT_DIR/update-database-schema.sh" ]; then
        print_status "Running database schema update script..."
        bash "$SCRIPT_DIR/update-database-schema.sh"
        print_success "Database schema updates completed"
    else
        print_warning "Schema update script not found. Skipping..."
    fi
}

# Function to run essential setup
run_essential_setup() {
    print_status "Step 4: Running essential database setup..."
    
    if [ -f "$SCRIPT_DIR/essential/setup-complete.sh" ]; then
        print_status "Running essential setup script..."
        bash "$SCRIPT_DIR/essential/setup-complete.sh"
        print_success "Essential setup completed"
    else
        print_warning "Essential setup script not found. Skipping..."
    fi
}

# Function to run payment database setup
run_payment_setup() {
    print_status "Step 5: Setting up payment database tables..."
    
    if [ -f "$SCRIPT_DIR/payment-database-setup.sql" ]; then
        print_status "Running payment database setup..."
        
        # Check if database container is running
        if docker ps | grep -q "melodia-postgres"; then
            docker exec -i melodia-postgres psql -U postgres -d melodia < "$SCRIPT_DIR/payment-database-setup.sql"
            print_success "Payment database setup completed"
        else
            print_warning "Database container not running. Skipping payment setup..."
        fi
    else
        print_warning "Payment database setup script not found. Skipping..."
    fi
}

# Function to run maintenance scripts
run_maintenance_scripts() {
    print_status "Step 6: Running maintenance scripts..."
    
    # Run anonymous user ID script
    if [ -f "$SCRIPT_DIR/maintenance/add-anonymous-user-id.sql" ]; then
        print_status "Adding anonymous user ID column..."
        if docker ps | grep -q "melodia-postgres"; then
            docker exec -i melodia-postgres psql -U postgres -d melodia < "$SCRIPT_DIR/maintenance/add-anonymous-user-id.sql"
            print_success "Anonymous user ID column added"
        fi
    fi
    
    # Run payment columns script
    if [ -f "$SCRIPT_DIR/maintenance/add-payment-columns.sql" ]; then
        print_status "Adding payment columns..."
        if docker ps | grep -q "melodia-postgres"; then
            docker exec -i melodia-postgres psql -U postgres -d melodia < "$SCRIPT_DIR/maintenance/add-payment-columns.sql"
            print_success "Payment columns added"
        fi
    fi
}

# Function to install dependencies
install_dependencies() {
    print_status "Step 7: Installing Node.js dependencies..."
    
    cd "$PROJECT_DIR"
    
    if npm install; then
        print_success "Dependencies installed successfully"
    else
        print_error "Failed to install dependencies"
        exit 1
    fi
}

# Function to build the project
build_project() {
    print_status "Step 8: Building the project..."
    
    cd "$PROJECT_DIR"
    
    if npm run build; then
        print_success "Project built successfully"
    else
        print_error "Failed to build project"
        exit 1
    fi
}

# Function to verify setup
verify_setup() {
    print_status "Step 9: Verifying setup..."
    
    # Check if database is accessible
    if docker exec melodia-postgres psql -U postgres -d melodia -c "SELECT COUNT(*) FROM admin_users;" >/dev/null 2>&1; then
        print_success "Database connection verified"
    else
        print_error "Database connection verification failed"
        exit 1
    fi
    
    # Check if essential tables exist
    local tables=("songs" "admin_users" "users" "song_requests" "lyrics_drafts")
    for table in "${tables[@]}"; do
        if docker exec melodia-postgres psql -U postgres -d melodia -c "SELECT 1 FROM $table LIMIT 1;" >/dev/null 2>&1; then
            print_success "Table '$table' exists"
        else
            print_error "Table '$table' not found"
            exit 1
        fi
    done
    
    # Check if payment tables exist
    local payment_tables=("payments" "pricing_plans" "payment_webhooks")
    for table in "${payment_tables[@]}"; do
        if docker exec melodia-postgres psql -U postgres -d melodia -c "SELECT 1 FROM $table LIMIT 1;" >/dev/null 2>&1; then
            print_success "Payment table '$table' exists"
        else
            print_warning "Payment table '$table' not found (this is optional)"
        fi
    done
}

# Function to show final status
show_final_status() {
    echo ""
    echo -e "${GREEN}🎉 Complete Production Setup Completed Successfully!${NC}"
    echo ""
    echo -e "${BLUE}📊 Database Status:${NC}"
    echo "   Container: melodia-postgres"
    echo "   Host: localhost"
    echo "   Port: 5432"
    echo "   Database: melodia"
    echo "   Username: postgres"
    echo "   Password: melodia2024"
    echo ""
    echo -e "${BLUE}🌐 Optional Services:${NC}"
    echo "   pgAdmin: http://localhost:8080"
    echo "   Email: admin@melodia.com"
    echo "   Password: melodia2024"
    echo ""
    echo -e "${BLUE}🚀 Next Steps:${NC}"
    echo "   1. Start the development server: npm run dev"
    echo "   2. Visit: http://localhost:3000"
    echo "   3. Admin portal: http://localhost:3000/song-admin-portal"
    echo "   4. Login with: admin1 / melodia2024!"
    echo ""
    echo -e "${BLUE}📁 Important Files:${NC}"
    echo "   Production dump: backups/prod_dump_*.sql"
    echo "   Environment: .env.production"
    echo "   Local environment: .env.local"
    echo ""
    echo -e "${BLUE}🛑 To stop services: docker-compose down${NC}"
    echo -e "${BLUE}🔄 To restart: docker-compose up -d${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  Important Notes:${NC}"
    echo "   - Make sure Docker is running before starting the app"
    echo "   - The database will persist data between restarts"
    echo "   - Check .env.production for production configuration"
    echo "   - All scripts have been run successfully"
}

# Main function
main() {
    echo -e "${BLUE}=====================================================${NC}"
    echo -e "${BLUE}    MELODIA COMPLETE PRODUCTION SETUP${NC}"
    echo -e "${BLUE}=====================================================${NC}"
    echo ""
    
    # Check prerequisites
    check_prerequisites
    
    # Ask user if they want to create production dump
    echo ""
    read -p "Do you want to create a production database dump first? (y/n): " CREATE_DUMP
    if [[ $CREATE_DUMP =~ ^[Yy]$ ]]; then
        create_prod_dump
    else
        print_status "Skipping production database dump"
    fi
    
    # Run all setup steps
    setup_docker_database
    run_schema_updates
    run_essential_setup
    run_payment_setup
    run_maintenance_scripts
    install_dependencies
    build_project
    verify_setup
    
    # Show final status
    show_final_status
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        echo "Usage: $0 [OPTIONS]"
        echo ""
        echo "Options:"
        echo "  --help, -h           Show this help message"
        echo "  --skip-dump          Skip production database dump"
        echo "  --skip-build         Skip project build"
        echo "  --verify-only        Only verify the current setup"
        echo ""
        echo "This script will:"
        echo "  1. Create production database dump (optional)"
        echo "  2. Setup Docker database"
        echo "  3. Run database schema updates"
        echo "  4. Run essential setup"
        echo "  5. Setup payment tables"
        echo "  6. Run maintenance scripts"
        echo "  7. Install dependencies"
        echo "  8. Build the project"
        echo "  9. Verify setup"
        echo ""
        exit 0
        ;;
    --skip-dump)
        print_status "Skipping production database dump"
        check_prerequisites
        setup_docker_database
        run_schema_updates
        run_essential_setup
        run_payment_setup
        run_maintenance_scripts
        install_dependencies
        build_project
        verify_setup
        show_final_status
        ;;
    --skip-build)
        print_status "Skipping project build"
        check_prerequisites
        create_prod_dump
        setup_docker_database
        run_schema_updates
        run_essential_setup
        run_payment_setup
        run_maintenance_scripts
        install_dependencies
        verify_setup
        show_final_status
        ;;
    --verify-only)
        print_status "Verifying current setup only"
        verify_setup
        print_success "Setup verification completed"
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
