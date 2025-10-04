# Phase 6: Lyrics-First Creation Flow Implementation

## Overview

Phase 6 transforms the song creation process from a direct generation approach to a two-step workflow:
1. **Generate & Edit Lyrics** → Users create and refine lyrics
2. **Create Song** → Users approve lyrics and generate the final song

This gives users more control over the creative process and improves final song quality.

## Database Changes

### New Table: `lyrics_drafts`

Stores multiple versions of lyrics for each song request:

```sql
CREATE TABLE lyrics_drafts (
  id SERIAL PRIMARY KEY,
  song_request_id INTEGER NOT NULL REFERENCES song_requests(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  language TEXT[],
  tone TEXT[],
  length_hint TEXT,
  structure JSONB,
  prompt_input JSONB,
  generated_text TEXT NOT NULL,
  edited_text TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Updated Table: `song_requests`

Added lyrics workflow fields:

```sql
ALTER TABLE song_requests
ADD COLUMN lyrics_status TEXT DEFAULT 'pending',
ADD COLUMN approved_lyrics_id INTEGER REFERENCES lyrics_drafts(id),
ADD COLUMN lyrics_locked_at TIMESTAMPTZ;
```

## New Files Created

### Database Layer
- `src/lib/db/queries/lyrics.ts` - Lyrics-specific database queries
- `scripts/migrate-phase6-schema.sql` - Database migration script

### Server Actions
- `src/lib/lyrics-actions.ts` - Server actions for lyrics operations

### Hooks
- `src/hooks/use-lyrics.ts` - React hook for lyrics state management
- `src/hooks/use-autosave.ts` - Auto-save functionality for lyrics editor

### Components
- `src/components/lyrics/LyricsEditor.tsx` - Main lyrics editing interface
- `src/components/lyrics/LyricsControls.tsx` - Lyrics generation controls
- `src/components/lyrics/LyricsHistory.tsx` - Version history management
- `src/components/lyrics/ApproveLyricsModal.tsx` - Lyrics approval modal
- `src/components/lyrics/index.ts` - Component exports

### Pages
- `src/app/create-lyrics/[requestId]/page.tsx` - Lyrics creation and editing page
- `src/app/create-song-from-lyrics/[requestId]/page.tsx` - Final song creation page

### Types
- Updated `src/types/index.ts` with new interfaces:
  - `LyricsDraft`
  - `GenerateLyricsParams`
  - Updated `SongRequest` with lyrics fields

## User Flow

### 1. Create Lyrics (`/create-lyrics/[requestId]`)

**Left Panel - Controls:**
- Language selection (multiple languages supported)
- Tone selection (Fun, Emotional, Romantic, etc.)
- Length selection (Short, Standard, Long)
- Refine text input for specific instructions
- Generate/Regenerate/Refine buttons

**Right Panel - Editor:**
- Tabbed interface: Editor | History
- Rich text editor with auto-save
- Character/word/line count
- Save draft and approve buttons
- Version history with comparison

### 2. Create Song (`/create-song-from-lyrics/[requestId]`)

**Left Panel - Approved Lyrics:**
- Display approved lyrics content
- Show song request details
- Version information

**Right Panel - Song Settings:**
- Voice style selection
- Music style selection
- Genre selection
- Tempo (BPM) slider
- Create song button

## Status Workflow

### Lyrics Status Flow:
1. `pending` - Initial state, no lyrics generated
2. `generating` - Lyrics being generated
3. `needs_review` - Lyrics generated, ready for editing
4. `approved` - Lyrics approved, ready for song creation

### Dashboard Integration:
- Shows appropriate status badges
- Dynamic action buttons based on lyrics status
- Clear progression indicators

## Key Features

### Auto-Save
- Automatically saves lyrics drafts every 3 seconds
- Prevents data loss during editing
- Visual feedback for save status

### Version History
- Tracks all lyrics versions
- Compare different versions
- Restore previous versions
- Clear version labeling

### Multi-Language Support
- Generate lyrics in multiple languages
- Support for Hindi, English, Punjabi, Spanish, etc.
- Language-specific formatting

### Approval Workflow
- Modal confirmation before approval
- Clear warnings about irreversible changes
- Status tracking throughout the process

## API Integration

### Lyrics Generation API
The system uses Google's Generative AI API (Gemini) for lyrics generation:

- **API Endpoint**: `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent`
- **Token**: Configured in `src/lib/config.ts`
- **Model**: Gemini Pro for creative text generation
- **Fallback**: Built-in fallback lyrics if API fails

### Server Actions:
- `generateLyricsAction()` - Generate new lyrics using AI
- `refineLyricsAction()` - Refine existing lyrics based on feedback
- `saveLyricsDraftAction()` - Save edited lyrics
- `approveLyricsAction()` - Approve lyrics for song creation
- `createSongFromLyricsAction()` - Create final song

### Database Queries:
- `getLyricsDraftsByRequest()` - Get all drafts for a request
- `getLatestLyricsDraft()` - Get the most recent draft
- `createLyricsDraft()` - Create new draft
- `updateLyricsDraft()` - Update existing draft
- `approveLyricsDraft()` - Mark draft as approved

## Migration Guide

### Running the Migration:
```bash
# Connect to your database and run:
psql -d your_database -f scripts/migrate-phase6-schema.sql
```

### Migration Features:
- Safe migration with `IF NOT EXISTS` clauses
- Indexes for performance optimization
- Foreign key constraints for data integrity
- Automatic timestamp triggers
- Comprehensive documentation comments

## Testing

### Manual Testing Checklist:
1. **Create new song request** → Should show "Create Lyrics" button
2. **Generate lyrics** → Should create draft and show editor
3. **Edit lyrics** → Should auto-save and allow approval
4. **Refine lyrics** → Should create new version based on feedback
5. **Approve lyrics** → Should lock lyrics and show "Create Song" button
6. **Create song** → Should use approved lyrics and generate song
7. **Version history** → Should show all versions with comparison
8. **Dashboard updates** → Should show correct status and actions

### API Testing:
```bash
# Test the lyrics generation API
node scripts/test-lyrics-api.mjs
```

### Error Handling:
- Network failures during generation
- Invalid lyrics content
- Database connection issues
- User permission problems

## Future Enhancements

### Planned Features:
1. **Lyrics Templates** - Pre-defined structures for different song types
2. **Collaborative Editing** - Multiple users can edit lyrics
3. **AI Suggestions** - Smart suggestions for lyrics improvements
4. **Export Options** - Export lyrics in various formats
5. **Advanced Comparison** - Side-by-side diff view for versions
6. **Bulk Operations** - Generate multiple versions simultaneously

### Performance Optimizations:
1. **Caching** - Cache generated lyrics to reduce API calls
2. **Lazy Loading** - Load version history on demand
3. **Debouncing** - Optimize auto-save frequency
4. **Compression** - Compress lyrics data in database

## Troubleshooting

### Common Issues:

**Lyrics not generating:**
- Check LLM API configuration
- Verify database connection
- Check user permissions

**Auto-save not working:**
- Verify browser console for errors
- Check network connectivity
- Ensure proper hook implementation

**Status not updating:**
- Check database migration completion
- Verify foreign key constraints
- Check server action error handling

### Debug Commands:
```bash
# Check database schema
\d lyrics_drafts
\d song_requests

# Check for orphaned records
SELECT * FROM lyrics_drafts WHERE song_request_id NOT IN (SELECT id FROM song_requests);

# Check status distribution
SELECT lyrics_status, COUNT(*) FROM song_requests GROUP BY lyrics_status;
```

## Contributing

When adding new features to Phase 6:

1. **Follow the existing patterns** - Use similar component structure and naming
2. **Update types** - Add new interfaces to `src/types/index.ts`
3. **Add tests** - Include unit and integration tests
4. **Update documentation** - Keep this file current
5. **Consider migration** - Plan database changes carefully

## Support

For issues related to Phase 6:
1. Check this documentation first
2. Review the database migration
3. Test with a fresh song request
4. Check browser console for errors
5. Verify all dependencies are installed
