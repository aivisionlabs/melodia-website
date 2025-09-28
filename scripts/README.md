# 🗄️ Melodia Database Scripts

This directory contains scripts for managing the Melodia database schema and data.

## 📁 Files

### **Database Schema Scripts**
- `database-schema-updates.sql` - Complete schema update script
- `update-database-schema.sh` - Shell script to run schema updates
- `docker-compose.override.yml` - Docker Compose override for database management

### **Existing Scripts**
- `essential/` - Database setup scripts
- `maintenance/` - Database maintenance scripts
- `production/` - Production deployment scripts
- `testing/` - Testing and validation scripts

## 🚀 Quick Start

### **1. Start Database**
```bash
# Start PostgreSQL with Docker Compose
docker-compose up -d postgres
```

### **2. Update Database Schema**
```bash
# Run the schema update script
./scripts/update-database-schema.sh

# Or run manually
docker exec -i melodia-postgres psql -U postgres -d melodia < scripts/database-schema-updates.sql
```

### **3. Connect to Database**
```bash
# Connect to PostgreSQL
docker exec -it melodia-postgres psql -U postgres -d melodia
```

## 📋 Schema Updates Included

### **Missing Columns Added:**
- `song_requests.anonymous_user_id` (UUID) - For anonymous user tracking
- `lyrics_drafts.lyrics_edit_prompt` (TEXT) - Renamed from prompt_input, stores user edit prompts
- `songs.song_request_id` (INTEGER, UNIQUE) - Link songs to requests
- `songs.song_url_variant_1` (TEXT) - First song variant URL
- `songs.song_url_variant_2` (TEXT) - Second song variant URL

### **Columns Removed from lyrics_drafts:**
- `structure` - Unused JSONB field
- `length_hint` - Unused text field
- `is_approved` - Replaced by status field
- `edited_text` - Replaced by updating generated_text
- `tone` - Unused array field
- `language` - Unused array field

### **New Tables Created:**
- `anonymous_users` - Track anonymous user sessions
- `payments` - Payment processing and tracking
- `pricing_plans` - Subscription plans and pricing
- `payment_webhooks` - Webhook event processing

### **Foreign Key Constraints:**
- `songs.song_request_id` → `song_requests.id`
- `payments.song_request_id` → `song_requests.id`
- `payments.user_id` → `users.id`
- `payments.anonymous_user_id` → `anonymous_users.id`
- `payment_webhooks.payment_id` → `payments.id`

### **Performance Indexes:**
- Indexes on frequently queried columns
- Foreign key indexes for better join performance
- Status and date indexes for filtering

## 🔧 Database Management

### **Check Database Status**
```bash
# Check if database is running
docker ps | grep melodia-postgres

# Check database health
docker exec melodia-postgres pg_isready -U postgres -d melodia
```

### **Backup Database**
```bash
# Create backup
docker exec melodia-postgres pg_dump -U postgres -d melodia > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
docker exec -i melodia-postgres psql -U postgres -d melodia < backup_file.sql
```

### **Reset Database**
```bash
# Drop and recreate database
docker exec melodia-postgres psql -U postgres -c "DROP DATABASE IF EXISTS melodia;"
docker exec melodia-postgres psql -U postgres -c "CREATE DATABASE melodia;"
./scripts/update-database-schema.sh
```

## 🐛 Troubleshooting

### **Common Issues:**

1. **Container not running:**
   ```bash
   docker-compose up -d postgres
   ```

2. **Permission denied:**
   ```bash
   chmod +x scripts/update-database-schema.sh
   ```

3. **Database connection failed:**
   ```bash
   # Check if container is healthy
   docker exec melodia-postgres pg_isready -U postgres -d melodia
   ```

4. **Schema already exists:**
   - The script uses `IF NOT EXISTS` and `ON CONFLICT DO NOTHING`
   - Safe to run multiple times

### **Logs:**
```bash
# View database logs
docker logs melodia-postgres

# Follow logs in real-time
docker logs -f melodia-postgres
```

## 📊 Verification

After running the schema update, verify everything is working:

```sql
-- Check all tables exist
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check all columns exist
SELECT table_name, column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('song_requests', 'lyrics_drafts', 'songs', 'payments')
ORDER BY table_name, column_name;

-- Check foreign keys
SELECT tc.table_name, kcu.column_name, ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';
```

## 🎯 Next Steps

1. **Run the schema update script**
2. **Verify all tables and columns exist**
3. **Test the application with the new schema**
4. **Create database backups regularly**

---

**Note:** This script is idempotent - it can be run multiple times safely without causing issues.