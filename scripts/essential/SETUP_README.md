# Melodia Complete Setup Guide

This directory contains consolidated scripts for setting up Melodia from scratch on any device.

## 🚀 Quick Start

### Option 1: One-Command Setup (Recommended)
```bash
# Make the script executable
chmod +x scripts/setup-complete.sh

# Run the complete setup
./scripts/setup-complete.sh
```

### Option 2: Manual Setup
```bash
# 1. Start the database
docker-compose up -d postgres

# 2. Wait for database to be ready, then run the SQL setup
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/setup-complete-database.sql

# 3. Install dependencies and start
npm install
npm run dev
```

## 📁 Script Files

### `setup-complete.sh` - Main Setup Script
- **Purpose**: Complete automation of Melodia setup from scratch
- **What it does**:
  - Checks prerequisites (Docker, Node.js, npm)
  - Creates environment configuration
  - Starts PostgreSQL database
  - Sets up complete database schema
  - Installs dependencies
  - Builds the project
  - Verifies everything works

### `setup-complete-database.sql` - Database Schema
- **Purpose**: Complete database setup with all tables and features
- **What it includes**:
  - All table structures (songs, users, song_requests, lyrics_drafts, admin_users)
  - All necessary indexes for performance
  - Foreign key constraints
  - Triggers and functions
  - Initial admin user data
  - Complete documentation

## 🔧 Prerequisites

Before running the setup:

1. **Docker**: Must be installed and running
2. **Node.js**: Version 18+ required
3. **npm**: Must be installed
4. **Git**: To clone the repository

## 🌍 Environment Variables

The setup script automatically creates `.env.local` with:
- Database connection string
- Base URL configuration
- Placeholders for Supabase and Suno API (uncomment when needed)

## 📊 Database Details

After setup, you'll have:
- **Host**: localhost:5432
- **Database**: melodia
- **Username**: postgres
- **Password**: melodia2024
- **pgAdmin**: http://localhost:8080 (admin@melodia.com / melodia2024)

## 🚀 After Setup

1. **Start development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Main app: http://localhost:3000
   - Admin portal: http://localhost:3000/song-admin-portal
   - Login: admin1 / melodia2024!

## 🛠️ Troubleshooting

### Database won't start
```bash
# Check Docker logs
docker-compose logs postgres

# Restart containers
docker-compose down
docker-compose up -d postgres
```

### Permission denied on script
```bash
chmod +x scripts/setup-complete.sh
```

### Port already in use
```bash
# Check what's using the port
lsof -i :5432

# Stop conflicting services or change ports in docker-compose.yml
```

## 🔄 Updating Existing Setup

If you already have Melodia running and want to update:

```bash
# Pull latest changes
git pull

# Run just the database updates
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/setup-complete-database.sql

# Restart the app
npm run dev
```

## 📝 What's Included

The consolidated setup includes all these features from the original scripts:
- ✅ Base database schema
- ✅ User authentication system
- ✅ Song request management
- ✅ Lyrics workflow (Phase 6)
- ✅ Suno API integration fields
- ✅ Status tracking and monitoring
- ✅ Sequence management for song ordering
- ✅ Timestamped lyrics support
- ✅ Performance indexes
- ✅ Complete documentation

## 🆘 Need Help?

If you encounter issues:
1. Check the prerequisites are met
2. Ensure Docker is running
3. Check the logs for specific error messages
4. Verify you're in the correct directory

The setup script provides detailed feedback and will exit with helpful error messages if something goes wrong.
