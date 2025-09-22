# 🚀 Melodia API Quick Reference

## 📋 Essential Endpoints

### 🔐 Authentication
```bash
# Create anonymous user
POST /api/users/anonymous
# Response: { success: true, anonymous_user_id: "uuid" }

# Register user
POST /api/auth/register
# Body: { email, password, name, anonymous_user_id? }

# Login user
POST /api/auth/login
# Body: { email, password, anonymous_user_id? }

# Get current user
GET /api/users/me
```

### 🎵 Song Creation
```bash
# Create song request
POST /api/create-song-request
# Body: { recipient_name, languages, additional_details, user_id?, anonymous_user_id? }

# Generate lyrics
POST /api/generate-lyrics-with-storage
# Body: { requestId, recipient_name, languages, additional_details }

# Generate song
POST /api/generate-song
# Body: { title, lyrics, style, recipient_name, requestId, userId?, anonymous_user_id? }
```

### 💳 Payment
```bash
# Create payment order
POST /api/payments/create-order
# Body: { songRequestId, planId, anonymous_user_id? }

# Verify payment
POST /api/payments/verify
# Body: { razorpay_payment_id, razorpay_order_id, razorpay_signature, anonymous_user_id? }

# Get pricing plans
GET /api/pricing-plans
```

### 📱 Content Management
```bash
# Get user content
GET /api/user-content?userId=123
GET /api/user-content?anonymousUserId=uuid

# Get lyrics display
GET /api/lyrics-display?requestId=123

# Delete content
POST /api/delete-content
# Body: { contentId, contentType }
```

### 🎤 Song Processing
```bash
# Check song status
GET /api/song-status/[taskId]

# Get song variants
GET /api/song-variants/[songId]

# Suno webhook
POST /api/suno-webhook
```

---

## 🔄 Common User Flows

### Anonymous User Journey
```javascript
// 1. Create anonymous user (auto)
const anonymousUser = await fetch('/api/users/anonymous', { method: 'POST' });
const { anonymous_user_id } = await anonymousUser.json();

// 2. Create song request
const songRequest = await fetch('/api/create-song-request', {
  method: 'POST',
  body: JSON.stringify({
    recipient_name: "Sarah, my friend",
    languages: ["English"],
    additional_details: "She loves pop music",
    anonymous_user_id
  })
});

// 3. Generate lyrics
const lyrics = await fetch('/api/generate-lyrics-with-storage', {
  method: 'POST',
  body: JSON.stringify({
    requestId: 123,
    recipient_name: "Sarah, my friend",
    languages: ["English"],
    additional_details: "She loves pop music"
  })
});

// 4. Create payment
const payment = await fetch('/api/payments/create-order', {
  method: 'POST',
  body: JSON.stringify({
    songRequestId: 123,
    planId: 1,
    anonymous_user_id
  })
});

// 5. Generate song
const song = await fetch('/api/generate-song', {
  method: 'POST',
  body: JSON.stringify({
    title: "Song for Sarah",
    lyrics: "Generated lyrics...",
    style: "Pop",
    recipient_name: "Sarah",
    requestId: 123,
    anonymous_user_id
  })
});
```

### Registered User Journey
```javascript
// 1. Register (with anonymous data merge)
const register = await fetch('/api/auth/register', {
  method: 'POST',
  body: JSON.stringify({
    email: "user@example.com",
    password: "password",
    name: "John Doe",
    anonymous_user_id // Optional: merges anonymous data
  })
});

// 2. Create song request
const songRequest = await fetch('/api/create-song-request', {
  method: 'POST',
  body: JSON.stringify({
    recipient_name: "Sarah, my friend",
    languages: ["English"],
    additional_details: "She loves pop music",
    user_id: 123 // For registered users
  })
});

// 3. Generate lyrics (same as anonymous)
// 4. Create payment
const payment = await fetch('/api/payments/create-order', {
  method: 'POST',
  body: JSON.stringify({
    songRequestId: 123,
    planId: 1,
    user_id: 123 // For registered users
  })
});

// 5. Generate song
const song = await fetch('/api/generate-song', {
  method: 'POST',
  body: JSON.stringify({
    title: "Song for Sarah",
    lyrics: "Generated lyrics...",
    style: "Pop",
    recipient_name: "Sarah",
    requestId: 123,
    userId: 123 // For registered users
  })
});
```

---

## 🎯 Frontend Integration

### React Hooks
```javascript
// Anonymous user management
import { useAnonymousUser } from '@/hooks/use-anonymous-user';

function MyComponent() {
  const { anonymousUserId } = useAnonymousUser();
  // anonymousUserId is automatically created and managed
}

// Authentication
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { user, loading, isAuthenticated } = useAuth();
  // user contains current user data or null
}
```

### API Client Functions
```javascript
// User content
import { getUserContent } from '@/lib/user-content-client';

const content = await getUserContent(userId, anonymousUserId);

// Lyrics display
import { fetchLyricsDisplayData } from '@/lib/lyrics-display-client';

const lyricsData = await fetchLyricsDisplayData(requestId);
```

---

## 🔧 Development Tips

### Demo Mode
```javascript
// Use demo mode for testing
const response = await fetch('/api/generate-lyrics-with-storage', {
  method: 'POST',
  body: JSON.stringify({
    requestId: 123,
    recipient_name: "Test User",
    languages: ["English"],
    additional_details: "Test details",
    demoMode: true // Returns mock data
  })
});
```

### Error Handling
```javascript
try {
  const response = await fetch('/api/create-song-request', {
    method: 'POST',
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const result = await response.json();
  // Handle success
} catch (error) {
  console.error('API Error:', error.message);
  // Handle error
}
```

### Validation
```javascript
// Validate anonymous user ID format
import { isValidAnonymousUserId } from '@/lib/utils/validation';

if (!isValidAnonymousUserId(anonymousUserId)) {
  throw new Error('Invalid anonymous user ID');
}
```

---

## 📊 Response Formats

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Payment Required Response
```json
{
  "success": false,
  "message": "Payment required",
  "requiresPayment": true,
  "paymentStatus": "pending"
}
```

---

## 🚦 Status Codes

- **200**: Success
- **400**: Bad Request (validation error)
- **401**: Unauthorized (authentication required)
- **402**: Payment Required
- **403**: Forbidden (authorization error)
- **404**: Not Found
- **429**: Too Many Requests (rate limited)
- **500**: Internal Server Error

---

## 🔍 Debugging

### Check Database
```bash
# Verify database connection
GET /api/verify-db
```

### Test Anonymous User
```javascript
// Test anonymous user creation
const testAnonymous = await fetch('/api/users/anonymous', {
  method: 'POST'
});
console.log(await testAnonymous.json());
```

### Check Rate Limits
```javascript
// Check rate limit headers
const response = await fetch('/api/create-song-request', {
  method: 'POST',
  body: JSON.stringify(data)
});

console.log('Rate Limit:', {
  limit: response.headers.get('X-RateLimit-Limit'),
  remaining: response.headers.get('X-RateLimit-Remaining'),
  reset: response.headers.get('X-RateLimit-Reset')
});
```

---

## 🎵 Content Types & Actions

### Content Types
- **song_request**: Initial request, status: "pending"
- **lyrics_draft**: Generated lyrics, status: "draft/needs_review/approved"
- **song**: Final song, status: "processing/ready/failed"

### Dynamic Actions
```javascript
// Get appropriate button for content
import { getButtonForContent } from '@/lib/user-content-actions';

const button = getButtonForContent(contentItem);
// Returns: { text: "Generate Song", action: "generate", variant: "default" }
```

### Button Actions
- **Create Lyrics**: For pending song requests
- **Review Lyrics**: For lyrics that need review
- **Generate Song**: For approved lyrics
- **Listen**: For completed songs
- **View Progress**: For processing songs
- **Retry**: For failed songs

---

*This quick reference covers the most commonly used APIs and patterns for Melodia development.*
