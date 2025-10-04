#!/bin/bash

echo "🧪 Testing path resolution..."

# Get the script directory and ensure we're in the project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MIGRATION_FILE="$SCRIPT_DIR/simple-songs-migration.sql"

echo "📁 Script directory: $SCRIPT_DIR"
echo "📁 Project root: $PROJECT_ROOT"
echo "📄 Migration file path: $MIGRATION_FILE"

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration script not found at: $MIGRATION_FILE"
    echo "📂 Available files in scripts directory:"
    ls -la "$SCRIPT_DIR/" | grep -E '\.(sql|sh)$'
    exit 1
fi

echo "✅ Migration file found!"
echo "📊 File size: $(wc -c < "$MIGRATION_FILE") bytes"
echo "📊 File permissions: $(ls -la "$MIGRATION_FILE")"

echo "🎉 Path resolution test successful!"
