# Songs Migration to Public Library Guide

## Overview

This migration script transfers 26 existing songs from the `songs_rows.json` file into the new Melodia database schema, making them available in the public library. These songs will be accessible via the `/song/[slug]` URL structure.

## Migration Details

### Data Mapping

The migration performs the following schema transformations:

#### Old → New Field Mapping
- `timestamped_lyrics_variants` → `variant_timestamp_lyrics_processed`
- `timestamped_lyrics_api_responses` → `variant_timestamp_lyrics_api_response`
- `music_style` → `lyrics_drafts.music_style`
- `title` → `lyrics_drafts.title`
- `lyrics` → `lyrics_drafts.lyrics`

#### Additional Data Creation
- **Admin User**: Creates `admin_db@melodia.com` user for managing public library songs
- **Song Requests**: Creates song request entries with admin as requester
- **Lyrics Drafts**: Creates approved lyrics drafts for all songs
- **Public Access**: Sets `add_to_library: true` for all songs
- **Featured Status**: Sets `is_featured: true` to highlight songs in public library

## Song Inventory (26 Songs)

| Title | Style | Slug | Duration |
|-------|-------|------|----------|
| Ruchi My Queen | Rap | ruchi-my-queen | 179.00s |
| Kaleidoscope Heart | Romantic Song | kaleidoscope-heart | 189.00s |
| Same Office, Different Hearts | Corporate Romance | same-office-hearts | 165.00s |
| A kid's night musical | Musical | kids-night-musical | 181.00s |
| Lipsa Birthday Song | Birthday Song | lipsa-birthday-song | 142.00s |
| ... and 21 more songs | | |

## Generated Files

1. **`scripts/migrate-songs-to-public-library.sql`** - Complete SQL migration script
2. **`scripts/generate-songs-migration.mjs`** - Script generator (can be updated for future migrations)
3. **`scripts/run-songs-migration.sh`** - Executable runner script

## Usage

### Option 1: Automated Migration

```bash
export DATABASE_URL="postgresql://user:password@localhost:5432/melodia"
./scripts/run-songs-migration.sh
```

### Option 2: Manual Migration

```bash
psql "$DATABASE_URL" -f scripts/migrate-songs-to-public-library.sql
```

### Option 3: Via Drizzle (if integrated)

```bash
npm run db:migrate
```

## Database Changes

The migration creates:

1. **Users Table Entry**:
   ```sql
   INSERT INTO users (email, password_hash, name)
   VALUES ('admin_db@melodia.com', 'dummy_hash', 'Admin Database');
   ```

2. **Song Requests**: 26 entries with admin as requester
3. **Lyrics Drafts**: 26 approved drafts linked to song requests
4. **Songs**: 26 entries with complete metadata and timestamped lyrics

## Access URLs

After migration, songs will be available at:
- `/song/ruchi-my-queen`
- `/song/kaleidoscope-heart`
- `/song/same-office-hearts`
- `/song/kids-night-musical`
- `/song/lipsa-birthday-song`
- ... and 21 more

## Verification

The migration script includes verification queries that will display:
- Total songs migrated
- Songs added to library
- Songs marked as featured

## Timestamped Lyrics Handling

Songs with timestamped lyrics (like "Ruchi My Queen") preserve the synchronization data in:
- `variant_timestamp_lyrics_processed` - Processed format for display
- `variant_timestamp_lyrics_api_response` - Raw API response format

## Safety Features

- **Conflict Avoidance**: Uses `ON CONFLICT DO NOTHING` for user creation
- **Data Validation**: Includes NULL checks and defaults
- **Transaction Safety**: Wrapped in COMMIT for atomicity
- **Audit Trail**: Preserves original IDs and metadata

## Rollback (if needed)

To remove migrated data (use with caution):

```sql
BEGIN;
-- Remove songs
DELETE FROM songs WHERE song_request_id IN (
    SELECT id FROM song_requests WHERE requester_name = 'admin'
);
-- Remove lyrics drafts
DELETE FROM lyrics_drafts WHERE song_request_id IN (
    SELECT id FROM song_requests WHERE requester_name = 'admin'
);
-- Remove song requests
DELETE FROM song_requests WHERE requester_name = 'admin';
-- Optionally remove admin user
DELETE FROM users WHERE email = 'admin_db@melodia.com';
COMMIT;
```

## Next Steps After Migration

1. **Test Song Pages**: Verify `/song/[slug]` pages work correctly
2. **Update Navigation**: Add these songs to public library sections
3. **SEO Optimization**: Add meta descriptions and structured data
4. **Frontend Integration**: Ensure LyricalSongPlayer components render correctly
5. **Performance**: Monitor query performance for public library access

## Technical Notes

- Migration preserves original creation timestamps
- Adds logical dummy data where original data was missing
- Handles various music styles with appropriate mood arrays
- Creates slug-based URLs for SEO-friendly access
- Maintains referential integrity across all related tables

