# Drizzle Migration Guide

This document outlines the steps to apply and manage database migrations using Drizzle Kit.

## 1. Generating a New Migration

When you make changes to your Drizzle schema (e.g., adding a new table, column, or changing a column type), you need to generate a new migration file.

```bash
npx drizzle-kit generate
```

This command will inspect your schema and create a new SQL file in the `drizzle/migrations` directory. The filename will include a timestamp and a descriptive name (e.g., `0001_initial_schema.sql`).

If you want to give a custom name to your migration, you can use:

```bash
npx drizzle-kit generate --name your_migration_name
```

## 2. Creating a Custom Data Migration

Sometimes, you might need to run a migration that modifies existing data rather than just changing the schema (like updating a default value for existing rows). Drizzle Kit's `generate` command won't create these automatically. In such cases, you need to create a new SQL file manually in the `drizzle/migrations` directory.

For example, to update the `llm_model_name` for existing `lyrics_drafts`:

```sql
UPDATE "lyrics_drafts" SET "llm_model_name" = 'gemini-2.5-flash' WHERE "llm_model_name" IS NULL;
```

Save this file as `drizzle/migrations/0002_update_llm_model_name.sql` (or similar, ensuring a sequential number).

## 3. Applying Migrations to the Database

To apply the pending migration scripts to your database, you can use the `db:migrations` script defined in `package.json`.

First, ensure the script is executable:

```bash
chmod +x ./scripts/run-drizzle-migrations.sh
```

Then, run the migrate command:

```bash
./scripts/run-drizzle-migrations.sh migrate
```

This command will apply all pending migration files in the `drizzle/migrations` directory to your database.

## 4. Checking Migration Status

To see the current status of your migrations (which ones are applied and which are pending):

```bash
./scripts/run-drizzle-migrations.sh status
```

## 5. Pushing Schema Changes (Development Only)

For rapid development, Drizzle Kit allows you to push schema changes directly to the database without generating migration files. **Use this with caution and only in development environments, as it bypasses the migration history.**

```bash
npx drizzle-kit push
```

If you encounter prompts (e.g., about truncating tables), you might need to force the push (again, development only):

```bash
npx drizzle-kit push --force
```

**Note:** When running `drizzle-kit push` and it asks `Do you want to truncate table?`, if you want to proceed without truncating, you can provide input like this (though `drizzle-kit push --force` is generally preferred for dev):

```bash
echo "No, add the constraint without truncating the table" | npx drizzle-kit push
```
