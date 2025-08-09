# Database Setup and Admin Portal

This document describes the database-driven song management system for Melodia.

## Overview

The system has been migrated from static constants to a Supabase database with the following features:

- **Database-driven song storage** with fallback to static constants
- **Admin portal** for creating and managing songs
- **Suno API integration** for automatic song generation
- **Analytics tracking** for song views and plays
- **Webhook handling** for song generation status updates

## Database Schema

### Songs Table
```sql
CREATE TABLE songs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft',
  categories TEXT[],
  tags TEXT[],
  suno_task_id TEXT,
  metadata JSONB
);
```

### Analytics Table
```sql
CREATE TABLE song_analytics (
  id BIGSERIAL PRIMARY KEY,
  song_id BIGINT REFERENCES songs(id),
  play_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Suno API
SUNO_API_TOKEN=your_suno_api_token

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Setup Instructions

### 1. Create Supabase Tables

Run the following SQL in your Supabase SQL editor:

```sql
-- Create songs table
CREATE TABLE songs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
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
  is_active BOOLEAN DEFAULT true,
  status TEXT DEFAULT 'draft',
  categories TEXT[],
  tags TEXT[],
  suno_task_id TEXT,
  metadata JSONB
);

-- Create analytics table
CREATE TABLE song_analytics (
  id BIGSERIAL PRIMARY KEY,
  song_id BIGINT REFERENCES songs(id),
  play_count INTEGER DEFAULT 0,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_songs_slug ON songs(slug);
CREATE INDEX idx_songs_status ON songs(status);
CREATE INDEX idx_songs_is_active ON songs(is_active);
CREATE INDEX idx_analytics_song_id ON song_analytics(song_id);
```

### 2. Migrate Existing Songs

Run the migration script to move existing songs from constants to the database:

```bash
node scripts/migrate-songs.mjs
```

### 3. Set up Admin Authentication

The admin portal uses hardcoded credentials for now. You can modify them in `src/lib/db/services.ts`:

```typescript
const validCredentials = [
  { username: 'admin1', password: 'melodia2024!' },
  { username: 'admin2', password: 'melodia2024!' },
  { username: 'admin3', password: 'melodia2024!' },
];
```

## Admin Portal Usage

### Access
Navigate to `/song-admin-portal` and log in with the admin credentials.

### Features
- **Dashboard**: View all songs with their status
- **Create Song**: Add new songs with lyrics and metadata
- **Song Management**: Monitor song generation progress

### Creating a New Song

1. Go to `/song-admin-portal/create`
2. Fill in the required fields:
   - **Title**: Song title
   - **Music Style**: Select from dropdown
   - **Lyrics**: The lyrics that will be used as the prompt
   - **Categories** (optional): Comma-separated categories
   - **Tags** (optional): Comma-separated tags

3. Click "Create Song"
4. The system will:
   - Save the song to the database
   - Send lyrics to Suno API for generation
   - Update status as the generation progresses

### Song Status Flow

1. **draft** → Initial state when song is created
2. **pending** → Song is queued for generation
3. **generating** → Suno is processing the song
4. **completed** → Song is ready and active
5. **failed** → Generation failed

## API Endpoints

### GET /api/songs
Returns all active songs from the database.

### POST /api/suno-webhook
Webhook endpoint for Suno API callbacks to update song status.

## File Structure

```
src/
├── app/
│   ├── song-admin-portal/     # Admin portal pages
│   │   ├── page.tsx          # Dashboard
│   │   ├── create/
│   │   │   └── page.tsx      # Create song form
│   │   ├── login/
│   │   │   └── page.tsx      # Admin login
│   │   └── layout.tsx        # Admin layout with auth
│   └── api/
│       ├── songs/
│       │   └── route.ts      # Songs API
│       └── suno-webhook/
│           └── route.ts      # Suno webhook handler
├── lib/
│   ├── db/
│   │   ├── services.ts       # Database service functions
│   │   └── schema.ts         # Drizzle schema (for reference)
│   ├── actions.ts            # Server actions
│   └── suno-api.ts          # Suno API integration
└── scripts/
    └── migrate-songs.mjs     # Migration script
```

## Fallback System

The system includes a fallback mechanism:
- If database is unavailable, it falls back to static constants
- Existing songs continue to work even if database is down
- New songs created through admin portal require database

## Analytics

Song analytics are automatically tracked:
- **View count**: Incremented when song page is visited
- **Play count**: Incremented when song is played

Analytics data is stored in the `song_analytics` table and can be used for insights.

## Security Notes

- Admin authentication uses simple cookie-based sessions
- For production, consider implementing proper session management
- Suno API tokens should be kept secure
- Webhook endpoints should be validated in production

## Troubleshooting

### Common Issues

1. **Database connection errors**: Check Supabase credentials
2. **Song generation fails**: Verify Suno API token and webhook URL
3. **Admin login issues**: Check hardcoded credentials in services.ts

### Logs

Check the browser console and server logs for detailed error messages.

## Future Enhancements

- User authentication system
- Song approval workflow
- Advanced analytics dashboard
- Bulk song operations
- Search and filtering
- Caching layer
- File upload for audio files