# Authentication Fix Summary

## Issue
Logged-in users could not access their songs on the `/my-songs` page, while anonymous users could access theirs without problems.

## Root Causes Identified

### 1. **Anonymous User ID Not Cleared After Login**
**Location**: `src/contexts/AuthContext.tsx`

**Problem**: After successful login, the `anonymous_user_id` remained in localStorage, causing the middleware to send both authenticated and anonymous identifiers, creating confusion in the backend.

**Fix**: Added `localStorage.removeItem("anonymous_user_id")` after successful login.

### 2. **Invalid Header in API Client**
**Location**: `src/lib/api-client.ts`

**Problem**: The API client was trying to add `credentials: 'include'` to the headers object instead of the fetch options, and was using the wrong header name for anonymous user ID.

**Fix**:
- Corrected the header to use `x-local-anonymous-user-id` (matching middleware expectations)
- Removed `credentials` from headers and kept it only in fetch options
- Fixed TypeScript type casting for headers

### 3. **Middleware Processing Both Auth Types Simultaneously**
**Location**: `middleware.ts` and `src/lib/middleware-utils.ts`

**Problem**: The middleware would extract and forward both authenticated user ID and anonymous user ID even when a user was logged in, causing ambiguity in the backend about which identity to use.

**Fix**: Modified the logic to only process anonymous user ID when no authenticated user is present:

```typescript
// Only process anonymous user ID if no authenticated user
if (!isAuthenticated) {
  // Get anonymous user ID from localStorage header
  const localStorageAnonymousId = request.headers.get('x-local-anonymous-user-id')
  if (localStorageAnonymousId) {
    anonymousUserId = localStorageAnonymousId
  }
}
```

### 4. **Anonymous User Created Even When Logged In**
**Location**: `src/hooks/use-anonymous-user.ts` and `src/app/onboarding/page.tsx`

**Problem**: The `useAnonymousUser` hook was creating anonymous user IDs on every page reload, even when users were already authenticated. This caused confusion and unnecessary API calls.

**Fix**:
- Modified `useAnonymousUser` to check authentication status first
- Only creates anonymous users when no authenticated user exists
- Added authentication check to onboarding page
- Returns `null` for `anonymousUserId` when user is authenticated

### 5. **Unnecessary localStorage Cache**
**Location**: `src/contexts/AuthContext.tsx`

**Problem**: The application was maintaining a localStorage cache (`melodia_auth_cache`) that duplicated user data already stored in the JWT token, adding complexity and potential sync issues.

**Fix**: Removed the entire localStorage caching system:
- Removed `CACHE_KEY` and `CACHE_DURATION` constants
- Removed `getCachedAuth()` and `setCachedAuth()` functions
- Simplified `initializeAuth()` to directly fetch from API
- Simplified all auth functions (login, register, logout, refreshUser)

## Files Modified

### 1. `src/contexts/AuthContext.tsx`
- ✅ Added `localStorage.removeItem("anonymous_user_id")` after login
- ✅ Removed localStorage cache system (50+ lines simplified)
- ✅ Fixed useCallback dependency arrays

### 2. `src/lib/api-client.ts`
- ✅ Fixed header name to `x-local-anonymous-user-id`
- ✅ Removed invalid `credentials` from headers object
- ✅ Fixed TypeScript types

### 3. `middleware.ts`
- ✅ Prioritize authenticated users over anonymous users
- ✅ Only process anonymous user ID when no JWT token exists

### 4. `src/lib/middleware-utils.ts`
- ✅ Applied same logic as middleware for consistency
- ✅ Only extract anonymous ID when user is not authenticated

### 5. `src/hooks/use-anonymous-user.ts`
- ✅ Added authentication check before creating anonymous users
- ✅ Returns `null` for anonymousUserId when user is authenticated
- ✅ Waits for auth loading to complete before initializing

### 6. `src/app/onboarding/page.tsx`
- ✅ Added authentication check to prevent logged-in users from going through onboarding
- ✅ Redirects authenticated users to homepage

### 7. `src/app/api/fetch-user-song/route.ts`
- ✅ Added detailed logging for debugging user context
- ✅ Added logging for query filters and results

## How Authentication Now Works

### Anonymous User Flow:
1. Frontend creates UUID and stores in localStorage as `anonymous_user_id`
2. API client sends it via `x-local-anonymous-user-id` header
3. Middleware forwards it to API routes via `x-anonymous-user-id` header
4. Backend queries: `WHERE anonymous_user_id = ?`

### Authenticated User Flow:
1. Backend sets JWT token in httpOnly cookie after login/register
2. Middleware reads and verifies JWT from cookie
3. Middleware forwards `x-user-id` header to API routes
4. Backend queries: `WHERE user_id = ?`
5. Anonymous user ID is **ignored** when JWT exists

### Login/Register Merge Flow:
1. User logs in/registers with `anonymous_user_id` in request body
2. Backend merges anonymous data:
   - `UPDATE song_requests SET user_id = ?, anonymous_user_id = NULL WHERE anonymous_user_id = ?`
   - `UPDATE payments SET user_id = ?, anonymous_user_id = NULL WHERE anonymous_user_id = ?`
3. Frontend clears `anonymous_user_id` from localStorage
4. Future requests use only JWT token

## Benefits of Changes

### Security
- ✅ Single source of truth (JWT cookie)
- ✅ No confusion between authenticated and anonymous states
- ✅ HttpOnly cookies prevent XSS attacks
- ✅ No unnecessary anonymous user creation for logged-in users

### Performance
- ✅ Removed unnecessary localStorage operations
- ✅ Simpler code paths (less complexity)
- ✅ Single API call on initialization (no cache checks)
- ✅ No unnecessary anonymous user API calls for authenticated users

### Maintainability
- ✅ ~100 lines of code removed
- ✅ No cache synchronization issues
- ✅ Clearer authentication flow
- ✅ Follows KISS (Keep It Simple, Stupid) principle
- ✅ Consistent authentication checks across all components

## Testing Checklist

### Anonymous User
- [ ] Create song request as anonymous user
- [ ] View songs on `/my-songs` page
- [ ] Verify localStorage has `anonymous_user_id`

### Login/Register
- [ ] Login with existing account (with anonymous songs)
- [ ] Verify `anonymous_user_id` is cleared from localStorage
- [ ] Verify anonymous songs now appear in logged-in user's account
- [ ] Register new account (with anonymous songs)
- [ ] Verify same merge behavior

### Authenticated User
- [ ] View `/my-songs` page as logged-in user
- [ ] Verify all songs (including previously anonymous) are visible
- [ ] Create new song request as logged-in user
- [ ] Verify new song appears in `/my-songs`
- [ ] Logout and verify redirect/state clear

### Edge Cases
- [ ] Login on one device, then another (JWT should work on both)
- [ ] Clear cookies while staying on page (should show not authenticated)
- [ ] Clear localStorage while authenticated (should still work via JWT)
- [ ] Have anonymous songs, logout, login as different user (songs should not merge)

## Debug Logging

The following console logs have been added to aid debugging:

```typescript
// In fetch-user-song route
console.log("[fetch-user-song] User context:", {
  userId: userContext.userId,
  anonymousUserId: userContext.anonymousUserId,
  isAuthenticated: userContext.isAuthenticated,
  hasUserId: !!userContext.userId,
  hasAnonymousUserId: !!userContext.anonymousUserId
});

console.log("[fetch-user-song] Querying with filter:", {
  type: userId ? 'user_id' : 'anonymous_user_id',
  value: userId || anonymousUserId
});

console.log("[fetch-user-song] Found requests:", {
  count: allRequests.length,
  requestIds: allRequests.slice(0, 5).map(r => r.id)
});
```

These logs can be removed once the system is verified to work correctly.

## Architecture Principles Applied

1. **Single Responsibility Principle**: Each component has one clear purpose
2. **DRY (Don't Repeat Yourself)**: Removed duplicate user data storage
3. **KISS (Keep It Simple, Stupid)**: Simplified by removing unnecessary cache layer
4. **Single Source of Truth**: JWT cookie is the only source for auth state

## Future Improvements

1. **Consider Server-Side Sessions**: For more complex scenarios, server-side sessions might be better than JWT-only
2. **Add Session Management**: Track active sessions and allow users to log out from all devices
3. **Implement Refresh Tokens**: For better security, use short-lived access tokens with refresh tokens
4. **Add Rate Limiting**: Protect `/api/auth/me` endpoint from abuse

## Notes

- JWT tokens expire in 100 days (configured in `src/lib/auth/jwt.ts`)
- Anonymous user merge happens in both login and register flows
- The middleware runs on all `/api/*` routes except public endpoints
- The system supports both authenticated and anonymous users simultaneously (different users)

