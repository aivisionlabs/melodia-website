# Melodia Database Scripts

This directory contains the unified database setup scripts for the Melodia project.

## Files

- `setup-database.sql` - Complete database schema setup script (SQL)
- `setup-database.sh` - Shell script wrapper for easy database setup

## Quick Start

### Using the Shell Script (Recommended)

```bash
# Basic usage with defaults
./scripts/setup-database.sh

# Custom database and user
./scripts/setup-database.sh -d mydb -u myuser

# Custom host and port
./scripts/setup-database.sh -h db.example.com -p 5433

# Show help
./scripts/setup-database.sh --help
```

### Using SQL Directly

```bash
# Create database (if it doesn't exist)
createdb melodia

# Run the SQL script
psql -d melodia -f scripts/setup-database.sql
```

## What This Script Does

1. **Drops all existing tables** (DEVELOPMENT MODE - starts fresh)
2. **Creates all tables** with the new refactored schema:
   - `songs` (with new JSONB fields for variants and lyrics)
   - `users`
   - `anonymous_users`
   - `song_requests`
   - `lyrics_drafts`
   - `admin_users`
   - `payments`
   - `pricing_plans`
   - `payment_webhooks`
3. **Adds foreign key constraints** for data integrity
4. **Creates indexes** for optimal performance
5. **Sets up triggers** for automatic timestamp updates
6. **Inserts sample data** (admin users and pricing plans)
7. **Adds documentation** via column comments

## Schema Changes

The new schema includes:
- **Removed fields**: 18 legacy fields from songs table
- **Added fields**: 3 new JSONB fields for better data organization
- **Foreign keys**: Proper relationships between all tables
- **Indexes**: Optimized for common query patterns

## Environment Variables

- `PGPASSWORD` - Database password
- `DATABASE_URL` - Full database URL (overrides other options)

## Requirements

- PostgreSQL client tools (`psql`, `createdb`)
- Database user with appropriate permissions