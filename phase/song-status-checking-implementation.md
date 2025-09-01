# Song Status Checking & URL Fetching Implementation Plan

## Overview
Implement a robust system to check Suno job status, fetch song URLs, and update the database before playing songs. This ensures users always get the latest song status and proper error handling.

## Current State Analysis
- ✅ API endpoint exists: `/api/check-suno-job-status`
- ✅ `checkSunoJobStatusAction` function available
- ✅ Database schema supports song status and URL storage
- ❌ No automatic status checking on song page load
- ❌ No real-time status updates
- ❌ No proper error handling for incomplete songs

## Phase 1: Core Status Checking Infrastructure

### 1.1 Enhance Database Queries
**Files to modify:**
- `src/lib/db/queries/select.ts`
- `src/lib/db/queries/update.ts`

**Tasks:**
- [ ] Add `getSongById` function if not exists
- [ ] Add `getSongBySlug` function for library pages
- [ ] Add `updateSongStatus` function for status updates
- [ ] Add `updateSongUrl` function for URL updates

### 1.2 Create Song Status Service
**New file:** `src/lib/services/song-status-service.ts`

**Features:**
- [ ] `checkAndUpdateSongStatus(songId: number)` - Check status and update DB
- [ ] `getSongWithStatus(songId: number)` - Get song with latest status
- [ ] `isSongReady(song: Song)` - Check if song is ready to play
- [ ] `getSongStatus(song: Song)` - Get human-readable status

### 1.3 Create Status Checking Hook
**New file:** `src/hooks/use-song-status.ts`

**Features:**
- [ ] `useSongStatus(songId: number)` - Hook for song status management
- [ ] Auto-check status on mount
- [ ] Polling for status updates
- [ ] Loading states
- [ ] Error handling

## Phase 2: Library Page Integration

### 2.1 Update Library Page
**File:** `src/app/library/[slug]/page.tsx`

**Implementation:**
- [ ] Use `useSongStatus` hook
- [ ] Show loading state while checking status
- [ ] Auto-update song URL if available
- [ ] Show appropriate UI based on status:
  - ✅ **Ready**: Play button, song info
  - 🔄 **Processing**: Progress indicator, estimated time
  - ❌ **Failed**: Error message, retry option
  - ⏳ **Pending**: Queue position, estimated wait time

### 2.2 Create Song Status Components
**New files:**
- `src/components/song/SongStatusIndicator.tsx`
- `src/components/song/SongProgressBar.tsx`
- `src/components/song/SongErrorDisplay.tsx`

**Features:**
- [ ] Visual status indicators
- [ ] Progress bars for processing songs
- [ ] Error messages with retry options
- [ ] Estimated completion times

## Phase 3: Dashboard Integration

### 3.1 Update Dashboard Song Links
**File:** `src/app/dashboard/page.tsx`

**Implementation:**
- [ ] Modify `SongLinkButton` component
- [ ] Check song status before navigation
- [ ] Show status in dashboard
- [ ] Disable links for incomplete songs
- [ ] Add status badges to song cards

### 3.2 Create Dashboard Status Components
**New files:**
- `src/components/dashboard/SongStatusBadge.tsx`
- `src/components/dashboard/SongProgressCard.tsx`

**Features:**
- [ ] Status badges for each song
- [ ] Progress indicators
- [ ] Quick status refresh buttons
- [ ] Estimated completion times

## Phase 4: Real-time Updates

### 4.1 Implement Polling System
**Enhance:** `src/hooks/use-song-status.ts`

**Features:**
- [ ] Automatic polling for processing songs
- [ ] Configurable poll intervals
- [ ] Stop polling when song is ready
- [ ] Exponential backoff for failed requests

### 4.2 Add WebSocket Support (Optional)
**New file:** `src/lib/services/websocket-service.ts`

**Features:**
- [ ] Real-time status updates
- [ ] Push notifications for completed songs
- [ ] Live progress updates
- [ ] Connection management

## Phase 5: Error Handling & User Experience

### 5.1 Comprehensive Error Handling
**Implementation:**
- [ ] Network error handling
- [ ] API rate limiting
- [ ] Timeout handling
- [ ] Retry mechanisms
- [ ] Fallback states

### 5.2 User Experience Enhancements
**Features:**
- [ ] Toast notifications for status changes
- [ ] Loading skeletons
- [ ] Smooth transitions
- [ ] Accessibility improvements
- [ ] Mobile responsiveness

## Phase 6: Performance & Optimization

### 6.1 Caching Strategy
**Implementation:**
- [ ] Cache song status in localStorage
- [ ] Implement stale-while-revalidate pattern
- [ ] Optimize API calls
- [ ] Reduce unnecessary re-renders

### 6.2 Database Optimization
**Tasks:**
- [ ] Add indexes for status queries
- [ ] Optimize update queries
- [ ] Implement batch updates
- [ ] Add status change timestamps

## Implementation Order

### Week 1: Core Infrastructure
1. **Day 1-2:** Phase 1.1 - Database queries
2. **Day 3-4:** Phase 1.2 - Song status service
3. **Day 5:** Phase 1.3 - Status checking hook

### Week 2: Library Integration
1. **Day 1-2:** Phase 2.1 - Library page updates
2. **Day 3-4:** Phase 2.2 - Status components
3. **Day 5:** Testing and refinement

### Week 3: Dashboard & Real-time
1. **Day 1-2:** Phase 3.1 - Dashboard integration
2. **Day 3-4:** Phase 3.2 - Dashboard components
3. **Day 5:** Phase 4.1 - Polling system

### Week 4: Polish & Optimization
1. **Day 1-2:** Phase 5.1 - Error handling
2. **Day 3-4:** Phase 5.2 - UX enhancements
3. **Day 5:** Phase 6.1 - Performance optimization

## Technical Specifications

### API Endpoints
```typescript
// Existing
POST /api/check-suno-job-status
Body: { taskId: string }

// New (if needed)
GET /api/song/[id]/status
GET /api/song/[slug]/status
```

### Database Schema Updates
```sql
-- Add status tracking fields
ALTER TABLE songs ADD COLUMN IF NOT EXISTS status_checked_at TIMESTAMP;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS last_status_check TIMESTAMP;
ALTER TABLE songs ADD COLUMN IF NOT EXISTS status_check_count INTEGER DEFAULT 0;
```

### Hook Interface
```typescript
interface UseSongStatusReturn {
  song: Song | null;
  status: 'loading' | 'ready' | 'processing' | 'failed' | 'pending';
  isLoading: boolean;
  error: string | null;
  refreshStatus: () => Promise<void>;
  isReady: boolean;
  estimatedCompletion?: Date;
}
```

### Component Props
```typescript
interface SongStatusIndicatorProps {
  song: Song;
  showProgress?: boolean;
  showEstimatedTime?: boolean;
  onStatusChange?: (status: string) => void;
}
```

## Success Metrics
- [ ] 100% of songs show correct status on page load
- [ ] < 2 second response time for status checks
- [ ] < 5% error rate for status updates
- [ ] 95% user satisfaction with status visibility
- [ ] Zero broken song links in dashboard

## Risk Mitigation
- [ ] Fallback to cached status if API fails
- [ ] Graceful degradation for network issues
- [ ] Rate limiting to prevent API abuse
- [ ] Comprehensive error logging
- [ ] User-friendly error messages

## Testing Strategy
- [ ] Unit tests for status service
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Performance testing for polling
- [ ] Error scenario testing

This plan ensures a robust, user-friendly system for song status checking and URL fetching with proper error handling and real-time updates.
