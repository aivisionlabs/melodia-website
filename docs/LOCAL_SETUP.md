# Local Database Setup with Docker

This guide will help you set up a local PostgreSQL database using Docker for testing the Melodia application.

## Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed

## Quick Setup

### Option 1: Automated Setup (Recommended)

Run the setup script:

```bash
./scripts/setup-local-db.sh
```

This script will:
- Create `.env.local` file with database configuration
- Start PostgreSQL container
- Verify database connection
- Provide next steps

### Option 2: Manual Setup

1. **Create environment file:**
   ```bash
   # Create .env.local file
   cat > .env.local << EOF
   # Local PostgreSQL Database (Docker)
   DATABASE_URL=postgresql://postgres:melodia2024@localhost:5432/melodia

   # Base URL for webhooks
   NEXT_PUBLIC_BASE_URL=http://localhost:3000
   EOF
   ```

2. **Start the database:**
   ```bash
   docker-compose up -d postgres
   ```

3. **Wait for database to be ready:**
   ```bash
   # Check if database is ready
   docker exec melodia-postgres pg_isready -U postgres -d melodia
   ```

## Database Details

- **Host:** localhost
- **Port:** 5432
- **Database:** melodia
- **Username:** postgres
- **Password:** melodia2024

## Optional: pgAdmin

If you want a web interface to manage the database:

```bash
# Start pgAdmin (included in docker-compose.yml)
docker-compose up -d pgadmin
```

Then visit: http://localhost:8080
- **Email:** admin@melodia.com
- **Password:** melodia2024

## Testing the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Visit the admin portal:**
   - Go to: http://localhost:3000/song-admin-portal
   - Login with: `admin1` / `melodia2024!`

3. **Create a test song:**
   - Fill in the form with song details
   - Submit and check if it appears in the dashboard

## Database Management

### View Database Logs
```bash
docker-compose logs postgres
```

### Connect to Database Directly
```bash
docker exec -it melodia-postgres psql -U postgres -d melodia
```

### Stop the Database
```bash
docker-compose down
```

### Restart the Database
```bash
docker-compose up -d
```

### Reset Database (Delete all data)
```bash
docker-compose down -v
docker-compose up -d
```

## Troubleshooting

### Database Connection Issues

1. **Check if Docker is running:**
   ```bash
   docker info
   ```

2. **Check container status:**
   ```bash
   docker-compose ps
   ```

3. **Check database logs:**
   ```bash
   docker-compose logs postgres
   ```

4. **Test connection manually:**
   ```bash
   docker exec melodia-postgres pg_isready -U postgres -d melodia
   ```

### Port Already in Use

If port 5432 is already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Change to different port
```

Then update `.env.local`:
```
DATABASE_URL=postgresql://postgres:melodia2024@localhost:5433/melodia
```

### Permission Issues

If you get permission errors:

```bash
# Make script executable
chmod +x scripts/setup-local-db.sh

# Or run with sudo (if needed)
sudo ./scripts/setup-local-db.sh
```

## Next Steps

Once the local database is working:

1. Test the admin portal functionality
2. Create some sample songs
3. Verify the library page displays songs from database
4. When ready, migrate to Supabase by updating environment variables

## Migration to Supabase

When you're ready to use Supabase:

1. Update `.env.local` with Supabase credentials
2. Run migrations: `npx drizzle-kit push`
3. Test the connection
4. Deploy your application