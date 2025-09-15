#!/usr/bin/env bash

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${BLUE}[INFO]${NC} $*"; }
success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
error() { echo -e "${RED}[ERROR]${NC} $*"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
TMP_DIR="$PROJECT_DIR/tmp/migrate-local-to-production/$TIMESTAMP"
BACKUP_DIR="$PROJECT_DIR/backups"
mkdir -p "$TMP_DIR" "$BACKUP_DIR"

###############################################
# User-configurable connection variables
# (Environment variables override these.)
###############################################
# Example:
# LOCAL_POSTGRES_URL="postgresql://postgres:melodia2024@localhost:5432/melodia"
# PRODUCTION_POSTGRES_URL="postgresql://user:pass@host:5432/prod_db"

usage() {
  cat <<EOF
Usage: $0 [--replace] [--skip-backup] [--include-analytics]

Migrates data from local Postgres to production Postgres (upsert by slug).

Sources for connection strings (in priority order):
  - ENV: LOCAL_DATABASE_URL, PRODUCTION_DATABASE_URL
  - ENV: DATABASE_URL (for PRODUCTION if PRODUCTION_DATABASE_URL missing)
  - Script variables: LOCAL_POSTGRES_URL, PRODUCTION_POSTGRES_URL
  - .env.local (for LOCAL) and .env.production (for PRODUCTION)
  - Default local: postgresql://postgres:melodia2024@localhost:5432/melodia

Flags:
  --replace       Truncate production songs table before import (DANGEROUS)
  --skip-backup   Skip production backup (not recommended)
  --include-analytics  Also migrate aggregated song_analytics (safe upsert)
  -h, --help      Show this help
EOF
}

REPLACE_MODE=false
SKIP_BACKUP=false
INCLUDE_ANALYTICS=false
while [[ $# -gt 0 ]]; do
  case "$1" in
    --replace) REPLACE_MODE=true; shift ;;
    --skip-backup) SKIP_BACKUP=true; shift ;;
    --include-analytics) INCLUDE_ANALYTICS=true; shift ;;
    -h|--help) usage; exit 0 ;;
    *) error "Unknown argument: $1"; usage; exit 1 ;;
  esac
done

require_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    error "Required command not found: $1"
    exit 1
  fi
}

info "Checking prerequisites..."
require_cmd psql
require_cmd psql
if [[ -n "${PG_DUMP_BIN:-}" ]]; then
  if ! command -v "$PG_DUMP_BIN" >/dev/null 2>&1; then
    error "PG_DUMP_BIN is set to '$PG_DUMP_BIN' but not found in PATH"
    exit 1
  fi
else
  require_cmd pg_dump
fi
require_cmd awk
require_cmd sed
success "Prerequisites OK"

# Helper: read key from .env file
read_env_var() {
  local file="$1"; local key="$2"
  if [[ -f "$file" ]]; then
    # shellcheck disable=SC2002
    cat "$file" | sed -n "s/^${key}=//p" | head -n1
  fi
}

# Resolve connection strings
DEFAULT_LOCAL="postgresql://postgres:melodia2024@localhost:5432/melodia"
LOCAL_DATABASE_URL="${LOCAL_DATABASE_URL:-}"
PRODUCTION_DATABASE_URL="${PRODUCTION_DATABASE_URL:-}"

# Resolve LOCAL
if [[ -z "$LOCAL_DATABASE_URL" ]]; then
  if [[ -n "${LOCAL_POSTGRES_URL:-}" ]]; then
    LOCAL_DATABASE_URL="${LOCAL_POSTGRES_URL}"
  else
    LOCAL_DATABASE_URL="$(read_env_var "$PROJECT_DIR/.env.local" "DATABASE_URL" || true)"
  fi
fi

# Resolve PRODUCTION
if [[ -z "$PRODUCTION_DATABASE_URL" ]]; then
  if [[ -n "${DATABASE_URL:-}" ]]; then
    PRODUCTION_DATABASE_URL="${DATABASE_URL}"
  elif [[ -n "${PRODUCTION_POSTGRES_URL:-}" ]]; then
    PRODUCTION_DATABASE_URL="${PRODUCTION_POSTGRES_URL}"
  else
    PRODUCTION_DATABASE_URL="$(read_env_var "$PROJECT_DIR/.env.production" "DATABASE_URL" || true)"
  fi
fi

if [[ -z "$LOCAL_DATABASE_URL" ]]; then LOCAL_DATABASE_URL="$DEFAULT_LOCAL"; fi

if [[ -z "$PRODUCTION_DATABASE_URL" ]]; then
  error "Missing PRODUCTION_DATABASE_URL (or DATABASE_URL). Provide via env or .env.production."
  exit 1
fi

info "Local DB:      $LOCAL_DATABASE_URL"
info "Production DB: $PRODUCTION_DATABASE_URL"

# For Supabase production, add sslmode=require only for production connections
ensure_sslmode_required() {
  local url="$1"
  if [[ "$url" == *"sslmode="* ]]; then
    echo "$url"
    return
  fi
  if [[ "$url" == *"?"* ]]; then
    echo "${url}&sslmode=require"
  else
    echo "${url}?sslmode=require"
  fi
}

SUPABASE_MATCH=false
if [[ "$PRODUCTION_DATABASE_URL" == *"supabase.co"* || "$PRODUCTION_DATABASE_URL" == *"supabase.com"* ]]; then
  SUPABASE_MATCH=true
fi

# Warn if password contains '@' (should be URL-encoded as %40)
if [[ "$PRODUCTION_DATABASE_URL" == *"@"*"@"* ]]; then
  warn "Production URL contains multiple '@'. If the password includes '@', URL-encode it as %40."
fi

if [[ "$SUPABASE_MATCH" == true ]]; then
  info "Detected Supabase in production URL. Enforcing sslmode=require for production connection only."
  PRODUCTION_DB_URL_EFFECTIVE="$(ensure_sslmode_required "$PRODUCTION_DATABASE_URL")"
else
  PRODUCTION_DB_URL_EFFECTIVE="$PRODUCTION_DATABASE_URL"
fi

# Verify connectivity
info "Verifying DB connectivity..."
psql "$LOCAL_DATABASE_URL" -c '\l' -q >/dev/null
psql "$PRODUCTION_DB_URL_EFFECTIVE" -c '\l' -q >/dev/null
success "Connectivity OK"

# Backup production
if [[ "$SKIP_BACKUP" == false ]]; then
  info "Creating production backup..."
  BACKUP_FILE="$BACKUP_DIR/prod_backup_$TIMESTAMP.sql"

  # Use overridable pg_dump binary or PATH default
  DUMP_BIN="${PG_DUMP_BIN:-pg_dump}"

  set +e
  "$DUMP_BIN" "$PRODUCTION_DB_URL_EFFECTIVE" > "$BACKUP_FILE" 2>"$BACKUP_FILE.err"
  DUMP_STATUS=$?
  set -e

  if [[ $DUMP_STATUS -ne 0 ]]; then
    ERR_MSG=$(tail -n 5 "$BACKUP_FILE.err" || true)
    warn "pg_dump failed with $DUMP_BIN. Error: $ERR_MSG"
    warn "Attempting dockerized pg_dump using postgres:17 image (compatible with Supabase 17.x)"

    if command -v docker >/dev/null 2>&1; then
      # Run pg_dump inside docker to match server version; mount a tmp dir to capture output
      DOCKER_BACKUP_FILE="$BACKUP_DIR/prod_backup_${TIMESTAMP}_docker.sql"
      docker run --rm -e PGPASSWORD="" -v "$BACKUP_DIR":"/backup" postgres:17 \
        bash -lc "PGPASSWORD= $(which pg_dump) '$PRODUCTION_DB_URL_EFFECTIVE' > /backup/$(basename '$DOCKER_BACKUP_FILE')" || true

      if [[ -s "$DOCKER_BACKUP_FILE" ]]; then
        mv "$DOCKER_BACKUP_FILE" "$BACKUP_FILE"
        success "Production backup saved via dockerized pg_dump: $BACKUP_FILE"
      else
        error "Dockerized pg_dump also failed. See $BACKUP_FILE.err for details."
        exit 1
      fi
    else
      error "pg_dump failed and Docker is not available to try a compatible version."
      error "You can set PG_DUMP_BIN to a newer pg_dump binary or run with --skip-backup (not recommended)."
      exit 1
    fi
  else
    success "Production backup saved: $BACKUP_FILE"
  fi
else
  warn "Skipping production backup per flag"
fi

# Prepare production schema idempotently
info "Preparing production schema (idempotent migrations)..."

# 1) Ensure songs table exists (if production is brand new). We won't drop anything; only create if needed
psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'songs'
  ) THEN
    CREATE TABLE public.songs (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      title TEXT NOT NULL,
      lyrics TEXT,
      timestamp_lyrics JSONB,
      music_style TEXT,
      service_provider TEXT DEFAULT 'Melodia',
      song_requester TEXT,
      prompt TEXT,
      song_url TEXT,
      duration INTEGER,
      slug TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'draft',
      categories TEXT[],
      tags TEXT[],
      suno_task_id TEXT,
      metadata JSONB
    );
  END IF;
END$$;
EOSQL

# 2) Add/rename columns safely
psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
DO $$
BEGIN
  -- Rename is_active -> add_to_library if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='is_active'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='add_to_library'
  ) THEN
    EXECUTE 'ALTER TABLE songs RENAME COLUMN is_active TO add_to_library';
  END IF;

  -- Ensure add_to_library exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='add_to_library'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN add_to_library BOOLEAN DEFAULT TRUE';
  END IF;

  -- Ensure is_deleted exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='is_deleted'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE';
  END IF;

  -- Suno-related columns
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='negative_tags'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN negative_tags TEXT';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='suno_variants'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN suno_variants JSONB';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='selected_variant'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN selected_variant INTEGER';
  END IF;

  -- Timestamped lyrics columns introduced for production
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='timestamped_lyrics_variants'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN timestamped_lyrics_variants JSONB DEFAULT ''{}''::jsonb';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='songs' AND column_name='timestamped_lyrics_api_responses'
  ) THEN
    EXECUTE 'ALTER TABLE songs ADD COLUMN timestamped_lyrics_api_responses JSONB DEFAULT ''{}''::jsonb';
  END IF;
END$$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_songs_slug ON songs(slug);
CREATE INDEX IF NOT EXISTS idx_songs_status ON songs(status);
CREATE INDEX IF NOT EXISTS idx_songs_created_at ON songs(created_at);
CREATE INDEX IF NOT EXISTS idx_songs_suno_task_id ON songs(suno_task_id);
EOSQL

success "Production schema ready"

# Detect local schema shape (is_active vs add_to_library)
info "Detecting local schema shape..."
LOCAL_HAS_IS_ACTIVE=$(psql "$LOCAL_DATABASE_URL" -At -c "SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='is_active' LIMIT 1" || true)
LOCAL_HAS_ADD_TO_LIBRARY=$(psql "$LOCAL_DATABASE_URL" -At -c "SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='add_to_library' LIMIT 1" || true)
LOCAL_HAS_IS_DELETED=$(psql "$LOCAL_DATABASE_URL" -At -c "SELECT 1 FROM information_schema.columns WHERE table_name='songs' AND column_name='is_deleted' LIMIT 1" || true)

EXPORT_SQL_SELECT=""
if [[ -n "$LOCAL_HAS_IS_ACTIVE" ]]; then
  info "Local has column: is_active"
  if [[ -n "$LOCAL_HAS_IS_DELETED" ]]; then
    EXPORT_SQL_SELECT="SELECT id, created_at, title, lyrics, timestamp_lyrics, music_style, service_provider, song_requester, prompt, song_url, duration, slug, status, categories, tags, suno_task_id, metadata, is_active AS add_to_library, is_deleted FROM songs"
  else
    EXPORT_SQL_SELECT="SELECT id, created_at, title, lyrics, timestamp_lyrics, music_style, service_provider, song_requester, prompt, song_url, duration, slug, status, categories, tags, suno_task_id, metadata, is_active AS add_to_library, FALSE AS is_deleted FROM songs"
  fi
elif [[ -n "$LOCAL_HAS_ADD_TO_LIBRARY" ]]; then
  info "Local has column: add_to_library"
  if [[ -n "$LOCAL_HAS_IS_DELETED" ]]; then
    EXPORT_SQL_SELECT="SELECT id, created_at, title, lyrics, timestamp_lyrics, music_style, service_provider, song_requester, prompt, song_url, duration, slug, status, categories, tags, suno_task_id, metadata, add_to_library, is_deleted FROM songs"
  else
    EXPORT_SQL_SELECT="SELECT id, created_at, title, lyrics, timestamp_lyrics, music_style, service_provider, song_requester, prompt, song_url, duration, slug, status, categories, tags, suno_task_id, metadata, add_to_library, FALSE AS is_deleted FROM songs"
  fi
else
  error "Local songs table missing both is_active and add_to_library columns. Aborting."
  exit 1
fi

info "Exporting songs from local to CSV..."
EXPORT_CSV="$TMP_DIR/songs_export.csv"
psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -c "\\copy ($EXPORT_SQL_SELECT) TO STDOUT WITH CSV HEADER" > "$EXPORT_CSV"
success "Local export complete: $EXPORT_CSV"

# Import into production using temp table and upsert by slug
info "Importing into production (mode: ${REPLACE_MODE:+replace}${REPLACE_MODE:-upsert})..."

if [[ "$REPLACE_MODE" == true ]]; then
  warn "REPLACE mode: truncating production songs table before import"
  psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 -c "TRUNCATE TABLE songs RESTART IDENTITY CASCADE"
fi

psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
CREATE TEMP TABLE songs_import_raw (
  id TEXT,
  created_at TEXT,
  title TEXT,
  lyrics TEXT,
  timestamp_lyrics TEXT,
  music_style TEXT,
  service_provider TEXT,
  song_requester TEXT,
  prompt TEXT,
  song_url TEXT,
  duration TEXT,
  slug TEXT,
  status TEXT,
  categories TEXT,
  tags TEXT,
  suno_task_id TEXT,
  metadata TEXT,
  add_to_library TEXT,
  is_deleted TEXT
);
EOSQL

psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 -c "\\copy songs_import_raw FROM '$EXPORT_CSV' WITH CSV HEADER"

psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
-- Insert or update by slug
INSERT INTO songs (
  id, created_at, title, lyrics, timestamp_lyrics, music_style, service_provider, song_requester, prompt, song_url, duration, slug, status, categories, tags, suno_task_id, metadata, add_to_library, is_deleted
)
SELECT
  NULLIF(id,'')::INTEGER,
  NULLIF(created_at,'')::TIMESTAMPTZ,
  title,
  NULLIF(lyrics,'')::TEXT,
  CASE WHEN timestamp_lyrics IS NULL OR timestamp_lyrics='' THEN NULL ELSE timestamp_lyrics::JSONB END,
  NULLIF(music_style,'')::TEXT,
  NULLIF(service_provider,'')::TEXT,
  NULLIF(song_requester,'')::TEXT,
  NULLIF(prompt,'')::TEXT,
  NULLIF(song_url,'')::TEXT,
  NULLIF(duration,'')::INTEGER,
  slug,
  COALESCE(NULLIF(status,''),'draft')::TEXT,
  CASE WHEN categories IS NULL OR categories='' THEN NULL ELSE categories::TEXT[] END,
  CASE WHEN tags IS NULL OR tags='' THEN NULL ELSE tags::TEXT[] END,
  NULLIF(suno_task_id,'')::TEXT,
  CASE WHEN metadata IS NULL OR metadata='' THEN NULL ELSE metadata::JSONB END,
  CASE LOWER(add_to_library) WHEN 't' THEN TRUE WHEN 'true' THEN TRUE WHEN '1' THEN TRUE ELSE FALSE END,
  CASE LOWER(is_deleted) WHEN 't' THEN TRUE WHEN 'true' THEN TRUE WHEN '1' THEN TRUE ELSE FALSE END
FROM songs_import_raw
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  lyrics = EXCLUDED.lyrics,
  timestamp_lyrics = EXCLUDED.timestamp_lyrics,
  music_style = EXCLUDED.music_style,
  service_provider = EXCLUDED.service_provider,
  song_requester = EXCLUDED.song_requester,
  prompt = EXCLUDED.prompt,
  song_url = EXCLUDED.song_url,
  duration = EXCLUDED.duration,
  status = EXCLUDED.status,
  categories = EXCLUDED.categories,
  tags = EXCLUDED.tags,
  suno_task_id = EXCLUDED.suno_task_id,
  metadata = EXCLUDED.metadata,
  add_to_library = EXCLUDED.add_to_library,
  is_deleted = EXCLUDED.is_deleted;

-- Fix the sequence to the max(id)
SELECT setval(
  pg_get_serial_sequence('songs','id'),
  GREATEST(COALESCE((SELECT MAX(id) FROM songs), 1), 1),
  TRUE
);
EOSQL

success "Import/upsert completed"

# Ensure admin_users table on production
info "Ensuring admin_users table exists on production..."
psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='admin_users'
  ) THEN
    CREATE TABLE public.admin_users (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END$$;
-- Ensure unique on username
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname='admin_users_username_key'
  ) THEN
    BEGIN
      ALTER TABLE admin_users ADD CONSTRAINT admin_users_username_key UNIQUE (username);
    EXCEPTION WHEN duplicate_table THEN
      NULL;
    END;
  END IF;
END$$;
EOSQL

# Migrate admin_users if present in local
LOCAL_HAS_ADMIN=$(psql "$LOCAL_DATABASE_URL" -At -c "SELECT 1 FROM information_schema.tables WHERE table_name='admin_users' LIMIT 1" || true)
if [[ -n "$LOCAL_HAS_ADMIN" ]]; then
  info "Exporting admin_users from local..."
  ADMIN_EXPORT_CSV="$TMP_DIR/admin_users_export.csv"
  psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -c "\\copy (SELECT id, username, password_hash, created_at FROM admin_users) TO STDOUT WITH CSV HEADER" > "$ADMIN_EXPORT_CSV"
  success "Exported admin_users: $ADMIN_EXPORT_CSV"

  info "Importing admin_users into production (upsert by username)..."
  psql "$PRODUCTION_DATABASE_URL" -v ON_ERROR_STOP=1 <<'EOSQL'
CREATE TEMP TABLE admin_users_import (
  id TEXT,
  username TEXT,
  password_hash TEXT,
  created_at TEXT
);
EOSQL
  psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 -c "\\copy admin_users_import FROM '$ADMIN_EXPORT_CSV' WITH CSV HEADER"
  psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
INSERT INTO admin_users (id, username, password_hash, created_at)
SELECT NULLIF(id,'')::INTEGER, username, password_hash, NULLIF(created_at,'')::TIMESTAMPTZ
FROM admin_users_import
ON CONFLICT (username) DO UPDATE SET
  password_hash = EXCLUDED.password_hash;

-- Fix sequence
SELECT setval(
  pg_get_serial_sequence('admin_users','id'),
  GREATEST(COALESCE((SELECT MAX(id) FROM admin_users), 1), 1),
  TRUE
);
EOSQL
  success "admin_users migration completed"
else
  warn "Local admin_users table not found; skipping admin users migration"
fi

# Optionally migrate song_analytics
if [[ "$INCLUDE_ANALYTICS" == true ]]; then
  info "Preparing to migrate song_analytics (aggregated by song_id)..."
  LOCAL_HAS_ANALYTICS=$(psql "$LOCAL_DATABASE_URL" -At -c "SELECT 1 FROM information_schema.tables WHERE table_name='song_analytics' LIMIT 1" || true)
  if [[ -z "$LOCAL_HAS_ANALYTICS" ]]; then
    warn "Local song_analytics table not found; skipping analytics migration"
  else
    # Ensure production table exists
    psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='song_analytics'
  ) THEN
    CREATE TABLE public.song_analytics (
      id SERIAL PRIMARY KEY,
      song_id BIGINT NOT NULL,
      play_count INTEGER DEFAULT 0,
      view_count INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END$$;

-- Deduplicate existing prod rows by song_id to allow a unique index
WITH ranked AS (
  SELECT id, song_id, play_count, view_count,
         ROW_NUMBER() OVER (PARTITION BY song_id ORDER BY id) AS rn
  FROM song_analytics
)
DELETE FROM song_analytics sa
USING ranked r
WHERE sa.id = r.id AND r.rn > 1;

-- Create unique index on song_id for upsert
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uq_song_analytics_song_id'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX uq_song_analytics_song_id ON song_analytics(song_id);
    EXCEPTION WHEN others THEN
      -- If unique creation fails (due to remaining dupes), we skip upsert safely later
      NULL;
    END;
  END IF;
END$$;
EOSQL

    info "Exporting aggregated analytics from local..."
    ANALYTICS_EXPORT_CSV="$TMP_DIR/song_analytics_export.csv"
    psql "$LOCAL_DATABASE_URL" -v ON_ERROR_STOP=1 -c "\\copy (SELECT song_id, SUM(play_count) AS play_count, SUM(view_count) AS view_count, MAX(created_at) AS created_at, MAX(updated_at) AS updated_at FROM song_analytics GROUP BY song_id) TO STDOUT WITH CSV HEADER" > "$ANALYTICS_EXPORT_CSV"
    success "Exported analytics: $ANALYTICS_EXPORT_CSV"

    info "Importing analytics into production (merge by song_id when possible)..."
    psql "$PRODUCTION_DATABASE_URL" -v ON_ERROR_STOP=1 <<'EOSQL'
CREATE TEMP TABLE song_analytics_import (
  song_id TEXT,
  play_count TEXT,
  view_count TEXT,
  created_at TEXT,
  updated_at TEXT
);
EOSQL
    psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 -c "\\copy song_analytics_import FROM '$ANALYTICS_EXPORT_CSV' WITH CSV HEADER"

    # Try upsert using unique index; if fails, fallback to merge-replace per song_id
    set +e
    psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
-- Try upsert
INSERT INTO song_analytics (song_id, play_count, view_count, created_at, updated_at)
SELECT NULLIF(song_id,'')::BIGINT,
       COALESCE(NULLIF(play_count,'')::INTEGER,0),
       COALESCE(NULLIF(view_count,'')::INTEGER,0),
       NOW(),
       NOW()
FROM song_analytics_import
ON CONFLICT (song_id) DO UPDATE SET
  play_count = GREATEST(song_analytics.play_count, EXCLUDED.play_count),
  view_count = GREATEST(song_analytics.view_count, EXCLUDED.view_count),
  updated_at = NOW();
EOSQL
    STATUS=$?
    set -e
    if [[ $STATUS -ne 0 ]]; then
      warn "Upsert failed (likely missing unique idx). Falling back to replace-merge logic."
      psql "$PRODUCTION_DB_URL_EFFECTIVE" -v ON_ERROR_STOP=1 <<'EOSQL'
-- Replace existing per song_id then insert
DELETE FROM song_analytics sa
USING (SELECT DISTINCT NULLIF(song_id,'')::BIGINT AS song_id FROM song_analytics_import) s
WHERE sa.song_id = s.song_id;

INSERT INTO song_analytics (song_id, play_count, view_count, created_at, updated_at)
SELECT NULLIF(song_id,'')::BIGINT,
       COALESCE(NULLIF(play_count,'')::INTEGER,0),
       COALESCE(NULLIF(view_count,'')::INTEGER,0),
       NOW(),
       NOW()
FROM song_analytics_import;
EOSQL
    fi
    success "song_analytics migration completed"
  fi
else
  info "Analytics migration disabled. Use --include-analytics to enable."
fi

info "Done. Files stored in: $TMP_DIR"

echo ""
success "Migration from local to production completed successfully"

