# Drizzle ORM Migration System

This document explains how to use Drizzle ORM's built-in migration system for managing database schema changes in the Melodia project.

## Overview

Drizzle ORM provides a robust migration system that automatically tracks executed SQL scripts using a built-in `__drizzle_migrations` table. This eliminates the need for custom migration tracking mechanisms.

## Key Features

- **Automatic Migration Tracking**: Drizzle creates and manages a `__drizzle_migrations` table to track applied migrations
- **Schema-First Approach**: Define your schema in TypeScript, then generate SQL migrations
- **Idempotent Operations**: Migrations are only applied once, preventing duplicate execution
- **Rollback Support**: Built-in support for migration rollbacks
- **Studio Integration**: Visual database management with Drizzle Studio

## Configuration

The migration system is configured in `drizzle.config.ts`:

```typescript
import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

config({ path: '.env.local' });

export default defineConfig({
  schema: './src/lib/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  migrations: {
    table: '__drizzle_migrations',
  },
});
```

## Migration Commands

### Using the Helper Script

We provide a convenient shell script at `scripts/run-drizzle-migrations.sh`:

```bash
# Make the script executable
chmod +x scripts/run-drizzle-migrations.sh

# Apply all pending migrations
./scripts/run-drizzle-migrations.sh migrate

# Generate a new migration from schema changes
./scripts/run-drizzle-migrations.sh generate add_user_preferences

# Check migration status
./scripts/run-drizzle-migrations.sh status

# Open Drizzle Studio
./scripts/run-drizzle-migrations.sh studio

# Push schema changes directly (development only)
./scripts/run-drizzle-migrations.sh push
```

### Direct Drizzle Commands

You can also use Drizzle commands directly:

```bash
# Generate migration from schema changes
npx drizzle-kit generate --name=your_migration_name

# Apply migrations
npx drizzle-kit migrate

# Open Drizzle Studio
npx drizzle-kit studio

# Push schema changes (development only)
npx drizzle-kit push
```

## Migration Workflow

### 1. Making Schema Changes

When you need to modify the database schema:

1. **Update the TypeScript schema** in `src/lib/db/schema.ts`
2. **Generate a migration** using `npx drizzle-kit generate --name=descriptive_name`
3. **Review the generated SQL** in `drizzle/migrations/`
4. **Apply the migration** using `npx drizzle-kit migrate`

### 2. Example: Adding a New Table

```typescript
// In src/lib/db/schema.ts
export const userPreferencesTable = pgTable('user_preferences', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull(),
  theme: text('theme').default('light'),
  notifications: boolean('notifications').default(true),
  created_at: timestamp('created_at').defaultNow(),
});
```

Then generate and apply:

```bash
npx drizzle-kit generate --name=add_user_preferences
npx drizzle-kit migrate
```

### 3. Example: Modifying Existing Tables

```typescript
// In src/lib/db/schema.ts - add new column
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  name: text('name'),
  // Add new field
  last_login: timestamp('last_login'),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),
});
```

## Migration Files Structure

Migration files are stored in `drizzle/migrations/` with the following naming convention:

```
drizzle/migrations/
├── 0000_initial_schema.sql
├── 0001_add_user_preferences.sql
├── 0002_update_songs_table.sql
└── ...
```

Each migration file contains:
- **Up migration**: SQL to apply the changes
- **Down migration**: SQL to rollback the changes (if applicable)
- **Metadata**: Migration ID, hash, and timestamp

## Migration Tracking Table

Drizzle automatically creates and manages the `__drizzle_migrations` table:

```sql
CREATE TABLE __drizzle_migrations (
  id SERIAL PRIMARY KEY,
  hash TEXT NOT NULL,
  created_at BIGINT NOT NULL
);
```

This table tracks:
- **Hash**: Unique identifier for each migration
- **Created At**: Timestamp when the migration was applied
- **ID**: Sequential migration ID

## Best Practices

### 1. Always Review Generated Migrations

Before applying migrations, always review the generated SQL:

```bash
npx drizzle-kit generate --name=my_changes
# Review the generated file in drizzle/migrations/
npx drizzle-kit migrate
```

### 2. Use Descriptive Migration Names

```bash
# Good
npx drizzle-kit generate --name=add_user_preferences_table
npx drizzle-kit generate --name=update_songs_schema_v2

# Avoid
npx drizzle-kit generate --name=changes
npx drizzle-kit generate --name=update
```

### 3. Test Migrations in Development

Always test migrations in a development environment before applying to production:

```bash
# Development
npx drizzle-kit push  # Direct schema push for testing

# Production
npx drizzle-kit migrate  # Use proper migrations
```

### 4. Backup Before Major Changes

For significant schema changes, always backup your database:

```bash
# Create backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Apply migration
npx drizzle-kit migrate
```

## Troubleshooting

### Migration Already Applied

If you get an error about a migration already being applied:

```bash
# Check migration status
npx drizzle-kit migrate

# If needed, you can force re-run (use with caution)
npx drizzle-kit migrate --force
```

### Schema Drift

If your database schema doesn't match your TypeScript schema:

```bash
# Check what's different
npx drizzle-kit push --dry-run

# Sync schema (development only)
npx drizzle-kit push
```

### Connection Issues

Ensure your database connection is properly configured:

```bash
# Check environment variables
echo $DATABASE_URL

# Test connection
npx drizzle-kit studio
```

## Migration Examples

### Example 1: Songs Table Schema Refactoring

The existing `songs-table-schema-refactor.sql` has been converted to a Drizzle migration:

```sql
-- drizzle/migrations/0001_songs_table_schema_refactor.sql
-- Step 1: Add new JSONB fields
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS song_variants JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS variant_timestamp_lyrics_api_response JSONB NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS variant_timestamp_lyrics_processed JSONB NOT NULL DEFAULT '{}';

-- Step 2: Drop old fields
ALTER TABLE songs
DROP COLUMN IF EXISTS title,
DROP COLUMN IF EXISTS lyrics,
-- ... other fields
```

### Example 2: Adding Indexes

```sql
-- Generated migration for adding indexes
CREATE INDEX IF NOT EXISTS idx_songs_song_variants ON songs USING GIN (song_variants);
CREATE INDEX IF NOT EXISTS idx_songs_variant_timestamp_lyrics_api_response ON songs USING GIN (variant_timestamp_lyrics_api_response);
```

## Environment Setup

### Required Environment Variables

```bash
# .env.local
DATABASE_URL=postgresql://username:password@localhost:5432/melodia
```

### Required Dependencies

```json
{
  "dependencies": {
    "drizzle-orm": "^0.44.4"
  },
  "devDependencies": {
    "drizzle-kit": "^0.31.4"
  }
}
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Database Migrations
on:
  push:
    branches: [main]

jobs:
  migrate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npx drizzle-kit migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
```

## Summary

Drizzle ORM's migration system provides:

- ✅ **Automatic tracking** of executed migrations
- ✅ **Schema-first approach** with TypeScript definitions
- ✅ **Idempotent operations** preventing duplicate execution
- ✅ **Built-in rollback support**
- ✅ **Visual database management** with Drizzle Studio
- ✅ **CI/CD integration** ready

This system replaces the need for custom migration tracking scripts and provides a more robust, industry-standard approach to database schema management.
