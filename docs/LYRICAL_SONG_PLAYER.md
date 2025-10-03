# Lyrical Song Player Implementation Guide

This document explains the new lyrical song player feature with synchronized lyrics display.

## Overview

The lyrical song player provides a Spotify-like experience with:
- **Line-by-line synchronized lyrics** that highlight as the song plays
- **Section headers** (Verse, Chorus, Bridge, etc.) displayed in a different style
- **Auto-scrolling** to keep the current lyric centered
- **Click-to-seek** functionality - click any lyric line to jump to that timestamp
- **Responsive design** that works on both mobile and desktop
- **Two modes**: Standalone page and modal overlay

## Architecture

### Components

1. **`use-lyrics-sync.ts`** - Custom React hook
   - Manages audio playback state
   - Synchronizes lyrics with audio timeline
   - Provides auto-scrolling functionality
   - Handles play/pause, seek, and time formatting

2. **`LyricalSongPlayer.tsx`** - Main display component
   - Renders lyrics with highlighting and animations
   - Parses section headers from lyrics
   - Displays audio controls and progress bar
   - Supports both page and modal modes

3. **`LyricalSongPlayerModal.tsx`** - Modal wrapper
   - Fetches song data on open
   - Handles loading and error states
   - Provides modal-specific UI (close button, backdrop)

4. **`/app/song/[slug]/page.tsx`** - Standalone page
   - Server-side route for direct access
   - Includes access control and error handling
   - SEO-friendly with proper metadata

5. **`/app/api/song/[slug]/lyrics/route.ts`** - API endpoint
   - Fetches song data from database
   - Validates access permissions
   - Returns processed lyrics and audio URLs

## Usage

### 1. Standalone Page

Navigate to `/song/{slug}` to open the full-page lyrics player:

```typescript
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push(`/song/${songSlug}`);
```

### 2. Modal Mode

Use the modal component in your page:

```typescript
import LyricalSongPlayerModal from '@/components/LyricalSongPlayerModal';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [songSlug, setSongSlug] = useState('');

  return (
    <>
      <button onClick={() => {
        setSongSlug('your-song-slug');
        setIsOpen(true);
      }}>
        View Lyrics
      </button>

      <LyricalSongPlayerModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        slug={songSlug}
      />
    </>
  );
}
```

### 3. Integration with SongPlayerCard

The `SongPlayerCard` component already supports the lyrical song button:

```typescript
<SongPlayerCard
  variant={variant}
  variantIndex={index}
  // ... other props
  showLyricalSongButton={hasTimestampLyrics}
  onViewLyricalSong={() => router.push(`/song/${slug}`)}
/>
```

## Data Structure

### Required Lyrics Format

Lyrics must be in the `LyricLine` format:

```typescript
interface LyricLine {
  index: number;      // Sequential line number
  text: string;       // The lyric text
  start: number;      // Start time in milliseconds
  end: number;        // End time in milliseconds
}
```

### Example Lyrics Data

```typescript
const lyrics: LyricLine[] = [
  {
    index: 0,
    text: "(Verse 1)",
    start: 0,
    end: 100
  },
  {
    index: 1,
    text: "The first time I saw your face",
    start: 100,
    end: 5000
  },
  {
    index: 2,
    text: "You smiled and lit up the whole place",
    start: 5000,
    end: 10000
  },
  {
    index: 3,
    text: "(Chorus)",
    start: 10000,
    end: 10100
  },
  // ... more lines
];
```

### Section Headers

Lines matching the pattern `(Section Name)` (text enclosed in parentheses) are automatically detected and styled as section headers.

Examples:
- `(Verse 1)`
- `(Chorus)`
- `(Bridge)`
- `(Outro)`

## Database Schema

The song must have the following fields in the database:

```typescript
{
  slug: string;                           // Unique identifier
  selected_variant: number;               // Which variant to display
  variant_timestamp_lyrics_processed: {   // Processed lyrics by variant
    [variantIndex: number]: LyricLine[]
  };
  song_variants: {                        // Audio and metadata by variant
    [variantIndex: number]: {
      audioUrl?: string;
      imageUrl?: string;
      // ... other fields
    }
  };
  add_to_library: boolean;                // Public access flag
  lyrics_draft_title?: string;            // Song title
}
```

## Access Control

### Public Songs

Songs with `add_to_library: true` are publicly accessible:
- Anyone can view lyrics at `/song/{slug}`
- Download button is hidden for anonymous users
- Share button works normally

### Private Songs

Songs with `add_to_library: false` require authentication:
- API returns 403 Forbidden
- Users must be authenticated and own the song
- Share button prompts user to make song public first

## Features

### 1. Synchronized Highlighting

- Active lyric line is highlighted in coral red (`#EF476F`)
- Active line is larger and bolder
- Past lines appear dimmer
- Future lines are visible but less prominent

### 2. Auto-Scrolling

- Container auto-scrolls to keep active lyric centered
- Smooth scrolling animation
- Maintains context by showing surrounding lines

### 3. Click to Seek

- Click any lyric line to jump to that timestamp
- Useful for navigating long songs
- Works whether audio is playing or paused

### 4. Responsive Design

- Full-screen on mobile devices
- Optimized text sizing for different screen sizes
- Touch-friendly controls
- Maintains layout in both orientations

### 5. Audio Controls

- Play/pause button
- Skip forward/backward (10 seconds)
- Seekable progress bar
- Time display (current / total)
- Album art display

## Styling

The component uses the Melodia brand colors:

- **Primary (Yellow)**: `#FFD166` - Play button background
- **Accent (Coral)**: `#EF476F` - Active lyric highlight
- **Text (Teal)**: `#073B4C` - Headers and text
- **Background**: White to neutral gradient

Fonts:
- **Headings**: Poppins - Bold, energetic
- **Body**: Montserrat - Clean, readable

## Error Handling

### No Audio Available
- Displays message: "Audio unavailable. Lyrics display only."
- Lyrics still display and can be scrolled manually
- All other features work normally

### No Lyrics Available
- Shows friendly error message
- Provides "Go Back" button
- Suggests user check back later

### Song Not Found
- 404 error with friendly message
- "Go Back" button to return

### Access Denied
- 403 error explaining privacy
- Prompts to sign in if needed
- Links to authentication flow

## Performance Considerations

### Optimization Techniques

1. **Lazy Loading**: Lyrics are loaded only when page/modal opens
2. **Ref Management**: Uses refs for smooth scrolling without re-renders
3. **Memoization**: Callbacks are memoized to prevent unnecessary updates
4. **Debouncing**: Audio time updates are throttled

### Best Practices

- Keep lyrics under 200 lines for optimal performance
- Ensure audio files are compressed and optimized
- Use CDN for audio file delivery
- Preload metadata for faster start

## Future Enhancements

### Planned Features

1. **Word-level highlighting** (karaoke-style)
2. **Lyrics translation** (multiple languages)
3. **Fullscreen mode** for immersive experience
4. **Lyrics editing** for corrections
5. **Social sharing** with specific timestamp links
6. **Accessibility improvements** (screen reader support)

### Integration Ideas

1. **Playlist support** - Navigate between multiple songs
2. **Background play** - Continue playing when navigating away
3. **Offline mode** - Cache lyrics for offline viewing
4. **Collaborative playlists** - Share with friends

## Troubleshooting

### Lyrics Not Syncing

1. Check that `variant_timestamp_lyrics_processed` has data
2. Verify timestamps are in milliseconds
3. Ensure audio URL is valid and accessible
4. Check browser console for errors

### Audio Not Playing

1. Verify audio file format (MP3, M4A supported)
2. Check CORS headers for audio files
3. Test audio URL directly in browser
3. Check for browser autoplay restrictions

### Scrolling Issues

1. Ensure container has fixed height
2. Check that lyrics have proper refs
3. Verify CSS for scroll container
4. Test on different browsers

## API Reference

### GET `/api/song/[slug]/lyrics`

Fetches song lyrics and metadata.

**Parameters:**
- `slug` (path) - Song identifier

**Response:**
```typescript
{
  id: number;
  slug: string;
  title: string;
  lyrics: LyricLine[];
  audioUrl: string | null;
  imageUrl: string | null;
  selectedVariant: number;
  isPublic: boolean;
  canDownload: boolean;
  status: string;
}
```

**Error Responses:**
- `400` - Invalid slug
- `403` - Private song, auth required
- `404` - Song not found
- `500` - Internal server error

## Examples

### Example 1: Basic Integration

```typescript
'use client';

import { useState } from 'react';
import LyricalSongPlayerModal from '@/components/LyricalSongPlayerModal';

export default function SongList() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState('');

  const songs = [
    { id: 1, title: 'My Song', slug: 'my-song-123' },
    // ... more songs
  ];

  return (
    <div>
      {songs.map(song => (
        <div key={song.id}>
          <h3>{song.title}</h3>
          <button onClick={() => {
            setSelectedSlug(song.slug);
            setModalOpen(true);
          }}>
            View Lyrics
          </button>
        </div>
      ))}

      <LyricalSongPlayerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        slug={selectedSlug}
      />
    </div>
  );
}
```

### Example 2: Direct Navigation

```typescript
'use client';

import { useRouter } from 'next/navigation';

export default function SongCard({ slug, title }) {
  const router = useRouter();

  return (
    <div>
      <h3>{title}</h3>
      <button onClick={() => router.push(`/song/${slug}`)}>
        Open Lyrical View
      </button>
    </div>
  );
}
```

## Testing

### Manual Testing Checklist

- [ ] Page loads correctly with valid slug
- [ ] 404 error shows for invalid slug
- [ ] 403 error shows for private songs
- [ ] Audio plays and pauses correctly
- [ ] Lyrics highlight in sync with audio
- [ ] Auto-scroll keeps active lyric centered
- [ ] Click-to-seek works on all lines
- [ ] Section headers display correctly
- [ ] Progress bar seeks correctly
- [ ] Download button works (when shown)
- [ ] Share button works
- [ ] Modal opens and closes properly
- [ ] Mobile layout is responsive
- [ ] Desktop layout is optimized

### Automated Testing

```typescript
// Example test
describe('LyricalSongPlayer', () => {
  it('highlights active lyric based on current time', () => {
    // Test implementation
  });

  it('scrolls to active lyric automatically', () => {
    // Test implementation
  });

  it('seeks to correct timestamp on lyric click', () => {
    // Test implementation
  });
});
```

## Support

For issues or questions:
1. Check this documentation first
2. Review the component source code
3. Check browser console for errors
4. Test with a known-good song
5. Contact the development team

---

**Last Updated**: 2025-10-03
**Version**: 1.0.0


