# Maintenance Scripts

These scripts are used for ongoing maintenance and monitoring of the Melodia application.

## 📁 Files

- **`check-song-requests.mjs`** - Monitor song request status and health
- **`run-timestamped-lyrics-cleanup.sh`** - Clean up timestamped lyrics data
- **`schema-migration-lyrics-drafts-cleanup.sql`** - SQL migration to clean up lyrics_drafts table
- **`run-lyrics-drafts-migration.sh`** - Script to apply lyrics_drafts schema migration

## 🔧 Usage

### Check Song Requests
```bash
node scripts/maintenance/check-song-requests.mjs
```

### Run Lyrics Cleanup
```bash
chmod +x scripts/maintenance/run-timestamped-lyrics-cleanup.sh
./scripts/maintenance/run-timestamped-lyrics-cleanup.sh
```

### Run Lyrics Drafts Schema Migration
```bash
chmod +x scripts/maintenance/run-lyrics-drafts-migration.sh
./scripts/maintenance/run-lyrics-drafts-migration.sh
```

## 📊 Monitoring

The `check-song-requests.mjs` script is particularly useful for:
- Monitoring song generation status
- Checking for stuck requests
- Verifying API connectivity
- Database health checks

## 🗄️ Database Migrations

### Lyrics Drafts Cleanup Migration
The `schema-migration-lyrics-drafts-cleanup.sql` migration:
- Renames `prompt_input` column to `lyrics_edit_prompt`
- Removes unused columns: `structure`, `length_hint`, `is_approved`, `edited_text`, `tone`, `language`
- Updates table comments

This migration is automatically included in:
- `scripts/essential/setup-complete.sh` (for new setups)
- `scripts/update-database-schema.sh` (for existing databases)

## ⚠️ Maintenance Notes

- Run cleanup scripts during low-traffic periods
- Monitor logs for any issues
- Consider setting up automated monitoring for production
- Database migrations should be tested in staging before production
