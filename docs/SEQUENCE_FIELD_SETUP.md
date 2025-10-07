# Sequence Field Setup Guide

This guide explains how to set up and use the new `sequence` field to control the display order of songs in the library.

## Overview

The `sequence` field has been added to the `songs` table to allow manual control over the order in which songs appear in the library. Songs with lower sequence values will appear first.

## Database Migration

### 1. Run the Migration Script

Execute the migration script to add the sequence field:

```bash
# Connect to your database and run:
psql -d your_database_name -f scripts/add-sequence-field.sql
```

Or run it directly in your database client.

### 2. Verify the Migration

The migration script will:
- Add the `sequence` column to the `songs` table
- Set default sequence values based on existing song IDs
- Create an index for better performance
- Verify the migration was successful

## Setting Sequence Values

### Option 1: Use the Automated Script

Run the provided script to automatically set sequence values:

```bash
node scripts/set-song-sequence.mjs
```

This script will:
- Fetch all active songs
- Set sequence values starting from 1
- Order songs by creation date (newest first)
- Verify the update

### Option 2: Manual Database Update

You can manually set sequence values using SQL:

```sql
-- Set specific songs to specific positions
UPDATE songs SET sequence = 1 WHERE title = 'Song Title 1';
UPDATE songs SET sequence = 2 WHERE title = 'Song Title 2';
UPDATE songs SET sequence = 3 WHERE title = 'Song Title 3';

-- Or set based on a specific order
UPDATE songs
SET sequence = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as row_num
  FROM songs
  WHERE add_to_library = true AND is_deleted = false
) subquery
WHERE songs.id = subquery.id;
```

## Code Changes Made

### 1. Database Schema (`src/lib/db/schema.ts`)
- Added `sequence: integer('sequence')` field

### 2. Type Definitions (`src/types/index.ts`)
- Added `sequence?: number` to the `Song` interface

### 3. Database Queries (`src/lib/db/queries/select.ts`)
- Updated `getAllSongs()` to order by sequence first, then created_at

### 4. Actions (`src/lib/actions.ts`)
- Added sequence field to song mapping in `getActiveSongsAction()`

### 5. Library Page (`src/app/best-song/page.tsx`)
- Added client-side sorting with fallback to created_at for backward compatibility

## How It Works

1. **Database Level**: Songs are ordered by the `sequence` field in the database query
2. **Client Level**: Additional sorting ensures proper order even if some songs don't have sequence values
3. **Fallback**: Songs without sequence values fall back to ordering by creation date

## Best Practices

1. **Start with 1**: Use sequence values starting from 1 for easier management
2. **Leave Gaps**: Leave gaps between sequence numbers (1, 5, 10, 15) to allow for future insertions
3. **Consistent Updates**: Update sequence values whenever you add/remove songs or change the desired order
4. **Backup**: Always backup your database before running migrations

## Troubleshooting

### Songs Not in Expected Order
- Check if the sequence field was added successfully
- Verify sequence values are set for all songs
- Check the database query logs for any errors

### Migration Errors
- Ensure you have the necessary permissions to alter the table
- Check if the sequence column already exists
- Verify the database connection and credentials

### Script Errors
- Ensure environment variables are set correctly
- Check if Supabase service role key has the necessary permissions
- Verify the songs table structure matches expectations

## Future Enhancements

Consider adding:
- Admin interface to reorder songs visually
- Bulk sequence updates
- Sequence validation to prevent duplicates
- Automatic sequence adjustment when songs are added/removed
