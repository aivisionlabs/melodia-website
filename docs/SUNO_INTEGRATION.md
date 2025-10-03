# Suno API Integration

This document describes the implementation of Suno API integration for automatic song generation in the Melodia admin portal.

## Overview

The Suno integration allows admins to:
1. Create songs with lyrics and metadata
2. Generate two song variants using Suno's AI
3. Monitor generation progress in real-time
4. Select the preferred variant
5. Download audio files

## Architecture

### Components

1. **Mock Suno API Service** (`src/lib/suno-api.ts`)
   - Simulates Suno API responses for testing
   - Provides realistic timing for generation states
   - Can be easily switched to real API

2. **Database Schema Updates**
   - Added `negative_tags` field for generation parameters
   - Added `suno_variants` to store both generated variants
   - Added `selected_variant` to track user choice
   - Enhanced `suno_task_id` tracking

3. **User Flow Pages**
   - **Create Song Form**: Enhanced with negative tags field
   - **Progress Screen**: Real-time generation monitoring
   - **Variant Selection**: Side-by-side comparison with audio players

4. **Webhook Endpoint** (`/api/suno-webhook`)
   - Handles Suno API callbacks
   - Currently logs data for debugging

## User Flow

### 1. Song Creation
```
Admin fills form → Submits → Suno API called → Redirected to progress page
```

### 2. Generation Progress
```
Progress page → Polls Suno API every 5s → Shows status updates → Displays lyrics
```

### 3. Variant Selection
```
Both variants ready → Redirect to selection page → User chooses → Saves to database
```

## API States

The Suno API returns these states:
- `PENDING`: Task is waiting to be processed
- `STREAM_AVAILABLE`: First variant ready for streaming
- `COMPLETE`: All variants ready for download
- `CREATE_TASK_FAILED`: Failed to create the generation task
- `GENERATE_AUDIO_FAILED`: Failed to generate music tracks
- `CALLBACK_EXCEPTION`: Error occurred during callback
- `SENSITIVE_WORD_ERROR`: Content contains prohibited words

## Database Migration

Run the migration script to add new columns:

```sql
-- Run in Supabase SQL editor
ALTER TABLE songs
ADD COLUMN IF NOT EXISTS negative_tags TEXT,
ADD COLUMN IF NOT EXISTS suno_variants JSONB,
ADD COLUMN IF NOT EXISTS selected_variant INTEGER;

CREATE INDEX IF NOT EXISTS idx_songs_suno_task_id ON songs(suno_task_id);
```

## Environment Variables

Add these to your `.env.local`:

```bash
# For real API integration (currently using mock)
SUNO_API_TOKEN=your_suno_api_token

# Base URL for webhooks
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Testing with Mock API

The current implementation uses a mock API that:
- Simulates realistic generation timing (25-30 seconds)
- Generates two variants with different durations
- Provides mock audio URLs for testing
- Can simulate errors for testing error handling

### Mock API Features
- **Realistic Timing**: PENDING → STREAM_AVAILABLE → COMPLETE
- **Error Simulation**: Call `mockSunoAPI.simulateError(taskId, errorType)` to test error states
- **Variant Generation**: Creates two variants with different metadata

## Switching to Real API

To switch from mock to real API:

1. **Update Environment Variables**:
   ```bash
   SUNO_API_TOKEN=your_actual_suno_token
   ```

2. **Update API Service**:
   ```typescript
   // In src/lib/suno-api.ts
   export default new SunoAPI(process.env.SUNO_API_TOKEN!);
   ```

3. **Configure Webhook URL**:
   - Update `callBackUrl` in the generate request
   - Ensure your domain is accessible to Suno's servers

## Error Handling

The system handles various error scenarios:
- **API Failures**: Shows error messages in toast notifications
- **Network Issues**: Graceful degradation with retry logic
- **Invalid Content**: Handles sensitive word errors
- **Database Errors**: Proper error logging and user feedback

## File Structure

```
src/
├── lib/
│   ├── suno-api.ts              # Suno API service (mock + real)
│   └── db/
│       ├── services.ts          # Enhanced with Suno functions
│       └── queries/
│           ├── select.ts        # Added getSongByTaskId
│           └── update.ts        # Added updateSongWithVariants
├── app/
│   ├── song-admin-portal/
│   │   ├── create/page.tsx      # Enhanced form with negative tags
│   │   ├── generate/[taskId]/   # Progress monitoring page
│   │   └── select-variant/[taskId]/ # Variant selection page
│   └── api/
│       └── suno-webhook/        # Webhook endpoint
└── types/
    └── index.ts                 # Updated Song interface
```

## Future Enhancements

1. **Real API Integration**: Switch from mock to actual Suno API
2. **Audio Download**: Implement server-side audio file saving
3. **Batch Processing**: Handle multiple song generations
4. **Advanced Error Recovery**: Retry failed generations
5. **Analytics**: Track generation success rates and timing
6. **Caching**: Cache generated variants for performance

## Troubleshooting

### Common Issues

1. **Task Not Found**: Check if task ID is properly stored in database
2. **Polling Failures**: Verify network connectivity and API endpoints
3. **Database Errors**: Check migration script execution
4. **Form Submission Issues**: Verify all required fields are filled

### Debug Mode

Enable debug logging by setting:
```bash
NODE_ENV=development
```

This will show detailed API calls and responses in the console.