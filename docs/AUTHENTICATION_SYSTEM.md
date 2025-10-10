# Authentication System Documentation

## Overview

The Melodia application uses a centralized authentication system that handles both authenticated users and anonymous users through middleware-based authentication. This system eliminates security vulnerabilities present in query parameter-based authentication.

## Architecture

### 1. Middleware-Based Authentication (`middleware.ts`)

The middleware is the central authentication system that:
- Extracts user context from cookies and headers
- Validates user sessions
- Sets standardized headers for API routes
- Handles both authenticated and anonymous users

#### Flow:
1. **Request arrives** → Middleware intercepts API routes
2. **Extract user context** from cookies/headers
3. **Validate sessions** and anonymous user IDs
4. **Set headers** (`x-user-id`, `x-anonymous-user-id`, `x-is-authenticated`)
5. **Pass to API route** with validated context

### 2. API Route Authentication (`src/lib/middleware-utils.ts`)

API routes use standardized utilities to:
- Extract user context from middleware headers
- Validate user ownership
- Ensure security without query parameters

#### Key Functions:
- `getUserContextFromRequest()` - Extract user context from headers
- `getCurrentUserId()` - Get current user ID (authenticated or anonymous)
- `hasUserContext()` - Check if request has valid user context
- `requireUserContext()` - Validate and require user context

### 3. Frontend API Client (`src/lib/api-client.ts`)

Centralized API client that:
- Automatically handles authentication headers
- Manages anonymous user sessions
- Provides consistent error handling
- Eliminates manual header management

## Security Improvements

### Before (Vulnerable):
```typescript
// ❌ SECURITY RISK: Query parameters can be manipulated
const qp = new URLSearchParams();
qp.set("userId", String(user.id));
qp.set("anonymousUserId", anonymousUserId);
const res = await fetch(`/api/fetch-user-song?${qp.toString()}`);
```

### After (Secure):
```typescript
// ✅ SECURE: Middleware handles authentication automatically
const res = await apiClient.get(`/api/fetch-user-song?${qp.toString()}`);
```

## Implementation Details

### Middleware Authentication Flow

```typescript
// 1. Extract user context from cookies/headers
const userContext = extractUserContext(request)

// 2. Validate anonymous user ID format
if (anonymousUserId && !isValidAnonymousUserId(anonymousUserId)) {
  console.warn('Invalid anonymous user ID format:', anonymousUserId)
  anonymousUserId = undefined
}

// 3. Set headers for API routes
response.headers.set('x-user-id', userContext.userId.toString())
response.headers.set('x-anonymous-user-id', userContext.anonymousUserId)
response.headers.set('x-is-authenticated', userContext.isAuthenticated.toString())
```

### API Route Authentication

```typescript
// 1. Get user context from middleware headers (ONLY source of truth)
const userContext = getUserContextFromRequest(request)

// 2. Validate authentication
if (!userContext.userId && !userContext.anonymousUserId) {
  return NextResponse.json(
    { success: false, error: 'Authentication required' },
    { status: 401 }
  )
}

// 3. Use validated user context
const userId = userContext.userId
const anonymousUserId = userContext.anonymousUserId
```

### Frontend API Client

```typescript
// Automatic authentication handling
const { apiClient, hasUserContext } = useAuthenticatedApi()

// Make authenticated requests
const res = await apiClient.get('/api/fetch-user-song')
```

## User Types

### 1. Authenticated Users
- **Session**: Stored in `user-session` cookie
- **ID**: Numeric user ID from database
- **Validation**: Session cookie validation
- **Headers**: `x-user-id`, `x-is-authenticated: true`

### 2. Anonymous Users
- **Session**: Stored in localStorage as `anonymous_user_id`
- **ID**: UUID format (validated by middleware)
- **Validation**: UUID format validation
- **Headers**: `x-anonymous-user-id`, `x-is-authenticated: false`

## Anonymous User Management

### Creation
```typescript
// Frontend creates anonymous user
const response = await fetch('/api/users/anonymous', { method: 'POST' })
const data = await response.json()
localStorage.setItem('anonymous_user_id', data.anonymous_user_id)
```

### Validation
```typescript
// Middleware validates UUID format
function isValidAnonymousUserId(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}
```

### Migration
When anonymous users sign up:
1. Create authenticated user account
2. Transfer anonymous user data to authenticated user
3. Clear anonymous user session
4. Set authenticated session cookie

## API Endpoints

### Public Endpoints (No Authentication Required)
- `/api/auth/login`
- `/api/auth/register`
- `/api/auth/logout`
- `/api/users/anonymous`
- `/api/webhooks/*`
- `/api/suno-webhook`
- `/api/song-callback`
- `/api/payments/verify`
- `/api/payments/status/*`
- `/api/pricing-plans`
- `/api/songs/best-songs`

### Protected Endpoints (Authentication Required)
- `/api/fetch-user-song`
- `/api/generate-song`
- `/api/song-status/*`
- All other API routes

## Error Handling

### Authentication Errors
```typescript
// 401 Unauthorized
{
  success: false,
  error: 'Authentication required. Please log in or ensure you have an active session.'
}

// 400 Bad Request (Invalid anonymous user)
{
  success: false,
  error: 'Invalid anonymous user session'
}
```

### Frontend Error Handling
```typescript
const res = await apiClient.get('/api/fetch-user-song')
if (!res.ok) {
  if (res.status === 401) {
    // Handle authentication error
    console.warn('Authentication required')
    return
  }
  throw new Error('Failed to fetch songs')
}
```

## Migration Guide

### For API Routes:
1. Remove query parameter authentication
2. Use `getUserContextFromRequest()` instead
3. Validate user context before processing
4. Return proper error responses

### For Frontend Components:
1. Replace manual fetch calls with `useAuthenticatedApi()`
2. Remove query parameter construction
3. Use `apiClient.get()` or `apiClient.post()`
4. Handle authentication errors properly

## Benefits

### Security
- ✅ No query parameter manipulation
- ✅ Centralized authentication validation
- ✅ Proper session management
- ✅ Anonymous user validation

### Developer Experience
- ✅ Consistent API client
- ✅ Automatic header management
- ✅ Centralized error handling
- ✅ Type-safe authentication

### Performance
- ✅ Reduced request size (no query params)
- ✅ Better caching (no user-specific URLs)
- ✅ Centralized validation logic

## Testing

### Test Authentication Flow
```typescript
// Test authenticated user
const authenticatedResponse = await apiClient.get('/api/fetch-user-song')
expect(authenticatedResponse.status).toBe(200)

// Test anonymous user
const anonymousResponse = await apiClient.get('/api/fetch-user-song')
expect(anonymousResponse.status).toBe(200)

// Test unauthenticated request
const unauthenticatedResponse = await fetch('/api/fetch-user-song')
expect(unauthenticatedResponse.status).toBe(401)
```

### Test Middleware
```typescript
// Test middleware header setting
const request = new NextRequest('/api/fetch-user-song')
const response = middleware(request)
expect(response.headers.get('x-is-authenticated')).toBe('false')
```

## Future Enhancements

1. **JWT Token Authentication**: Add JWT tokens for stateless authentication
2. **Rate Limiting**: Implement per-user rate limiting
3. **Session Management**: Add session expiration and refresh
4. **Audit Logging**: Log authentication events for security monitoring
5. **Multi-Factor Authentication**: Add MFA support for authenticated users
