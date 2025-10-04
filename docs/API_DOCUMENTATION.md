# 🎵 Melodia API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Authentication & User Management](#authentication--user-management)
3. [Song Creation Journey](#song-creation-journey)
4. [Payment System](#payment-system)
5. [Content Management](#content-management)
6. [Song Processing](#song-processing)
7. [Admin & Utilities](#admin--utilities)
8. [User Journey Flows](#user-journey-flows)
9. [Error Handling](#error-handling)
10. [Rate Limiting](#rate-limiting)

---

## 🎯 Overview

Melodia is a personalized song generation platform that supports both **registered users** and **anonymous users**. The API is designed to provide a seamless experience from song creation to payment and delivery.

### Key Features:
- ✅ **Anonymous User Support**: Users can create songs without registration
- ✅ **Payment Integration**: Razorpay integration for both user types
- ✅ **AI-Powered**: Gemini for lyrics, Suno for music generation
- ✅ **Real-time Processing**: Status tracking and polling
- ✅ **Content Management**: Lyrics drafts and song variants

---

## 🔐 Authentication & User Management

### 1. Anonymous User Creation
**Endpoint**: `POST /api/users/anonymous`

**Purpose**: Creates a new anonymous user session for users who haven't registered yet.

**Request**:
```json
// No body required
```

**Response**:
```json
{
  "success": true,
  "anonymous_user_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Usage in Journey**:
- **When**: First visit to the website
- **Frontend**: Automatically called by `useAnonymousUser()` hook
- **Storage**: Anonymous user ID stored in localStorage

---

### 2. User Registration
**Endpoint**: `POST /api/auth/register`

**Purpose**: Creates a new registered user account and merges any existing anonymous data.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe",
  "anonymous_user_id": "550e8400-e29b-41d4-a716-446655440000" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Usage in Journey**:
- **When**: User decides to create an account
- **Data Migration**: Automatically merges anonymous user's song requests and payments
- **Session**: Creates authenticated session

---

### 3. User Login
**Endpoint**: `POST /api/auth/login`

**Purpose**: Authenticates existing users and merges anonymous data if provided.

**Request**:
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "anonymous_user_id": "550e8400-e29b-41d4-a716-446655440000" // Optional
}
```

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Usage in Journey**:
- **When**: Returning user wants to access their account
- **Data Migration**: Merges any anonymous activity with registered account

---

### 4. Get Current User
**Endpoint**: `GET /api/users/me`

**Purpose**: Retrieves current authenticated user information.

**Response**:
```json
{
  "success": true,
  "user": {
    "id": 123,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Usage in Journey**:
- **When**: App needs to check if user is authenticated
- **Frontend**: Used by `useAuth()` hook

---

## 🎵 Song Creation Journey

### 1. Create Song Request
**Endpoint**: `POST /api/create-song-request`

**Purpose**: Creates a new song request with user's requirements and preferences.

**Request**:
```json
{
  "requester_name": "John Doe",
  "email": "john@example.com",
  "recipient_name": "Sarah, my friend",
  "recipient_relationship": "friend",
  "languages": ["English"],
  "additional_details": "She loves pop music and dancing",
  "delivery_preference": "email",
  "user_id": 123, // For registered users
  "anonymous_user_id": "550e8400-e29b-41d4-a716-446655440000" // For anonymous users
}
```

**Response**:
```json
{
  "success": true,
  "requestId": 456
}
```

**Usage in Journey**:
- **When**: User submits the song creation form
- **Validation**: Validates form data and creates request record
- **Next Step**: Proceed to lyrics generation

---

### 2. Generate Lyrics with Storage
**Endpoint**: `POST /api/generate-lyrics-with-storage`

**Purpose**: Generates lyrics using AI and stores them in the database.

**Request**:
```json
{
  "requestId": 456,
  "recipient_name": "Sarah, my friend",
  "languages": ["English"],
  "additional_details": "She loves pop music and dancing",
  "demoMode": false // Set to true for testing
}
```

**Response**:
```json
{
  "success": true,
  "title": "Song for Sarah",
  "styleOfMusic": "Pop",
  "lyrics": "Verse 1:\nThis is a song for you...",
  "draftId": 789,
  "requestId": 456
}
```

**Usage in Journey**:
- **When**: After song request is created
- **AI Integration**: Uses Gemini API for lyrics generation
- **Storage**: Creates lyrics draft in database
- **Next Step**: User reviews and approves lyrics

---

### 3. Generate Song
**Endpoint**: `POST /api/generate-song`

**Purpose**: Creates the final song using approved lyrics and Suno API.

**Request**:
```json
{
  "title": "Song for Sarah",
  "lyrics": "Verse 1:\nThis is a song for you...",
  "style": "Pop",
  "recipient_name": "Sarah",
  "requestId": 456,
  "userId": 123, // For registered users
  "demoMode": false // Set to true for testing
}
```

**Response**:
```json
{
  "success": true,
  "taskId": "suno-task-12345",
  "songId": 101,
  "message": "Song generation started successfully"
}
```

**Usage in Journey**:
- **When**: User approves lyrics and clicks "Generate Song"
- **Payment Check**: Verifies payment status if required
- **AI Integration**: Uses Suno API for music generation
- **Next Step**: Monitor song generation progress

---

## 💳 Payment System

### 1. Create Payment Order
**Endpoint**: `POST /api/payments/create-order`

**Purpose**: Creates a Razorpay payment order for song generation.

**Request**:
```json
{
  "songRequestId": 456,
  "planId": 1,
  "anonymous_user_id": "550e8400-e29b-41d4-a716-446655440000" // For anonymous users
}
```

**Response**:
```json
{
  "success": true,
  "orderId": "order_12345",
  "amount": 10000,
  "currency": "INR",
  "key": "rzp_test_12345",
  "name": "Melodia",
  "description": "Payment for Basic Plan - 1 Song",
  "prefill": {
    "name": "John Doe",
    "email": "john@example.com"
  },
  "notes": {
    "payment_id": 201,
    "song_request_id": 456,
    "plan_id": 1
  },
  "theme": {
    "color": "#3B82F6"
  }
}
```

**Usage in Journey**:
- **When**: User needs to pay for song generation
- **Payment Gateway**: Integrates with Razorpay
- **Frontend**: Used by PaymentModal component
- **Next Step**: User completes payment on Razorpay

---

### 2. Verify Payment
**Endpoint**: `POST /api/payments/verify`

**Purpose**: Verifies payment completion and updates payment status.

**Request**:
```json
{
  "razorpay_payment_id": "pay_12345",
  "razorpay_order_id": "order_12345",
  "razorpay_signature": "signature_hash",
  "anonymous_user_id": "550e8400-e29b-41d4-a716-446655440000" // For anonymous users
}
```

**Response**:
```json
{
  "success": true,
  "paymentId": 201,
  "message": "Payment verified successfully"
}
```

**Usage in Journey**:
- **When**: After user completes payment on Razorpay
- **Security**: Verifies payment signature
- **Database**: Updates payment and song request status
- **Next Step**: Proceed with song generation

---

### 3. Get Payment Status
**Endpoint**: `GET /api/payments/status/[paymentId]`

**Purpose**: Retrieves current payment status.

**Response**:
```json
{
  "success": true,
  "payment": {
    "id": 201,
    "status": "completed",
    "amount": 10000,
    "currency": "INR",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Usage in Journey**:
- **When**: Need to check payment status
- **Frontend**: Used for payment status display

---

### 4. Get Pricing Plans
**Endpoint**: `GET /api/pricing-plans`

**Purpose**: Retrieves available pricing plans.

**Response**:
```json
{
  "success": true,
  "plans": [
    {
      "id": 1,
      "name": "Basic Plan",
      "description": "1 Song Generation",
      "price": 10000,
      "currency": "INR",
      "features": {
        "songs": 1,
        "lyrics_generation": true,
        "music_generation": true,
        "download": true
      },
      "is_active": true
    }
  ]
}
```

**Usage in Journey**:
- **When**: User needs to select a payment plan
- **Frontend**: Used by pricing components

---

## 📱 Content Management

### 1. Get User Content
**Endpoint**: `GET /api/user-content`

**Purpose**: Retrieves all user's content (song requests, lyrics drafts, songs).

**Query Parameters**:
- `userId`: For registered users
- `anonymousUserId`: For anonymous users

**Request**:
```
GET /api/user-content?userId=123
GET /api/user-content?anonymousUserId=550e8400-e29b-41d4-a716-446655440000
```

**Response**:
```json
{
  "success": true,
  "content": [
    {
      "id": "song-101",
      "type": "song",
      "title": "Song for Sarah",
      "recipient_name": "Sarah",
      "status": "ready",
      "created_at": "2024-01-15T10:30:00Z",
      "lyrics": "Verse 1:\nThis is a song...",
      "audio_url": "https://example.com/song.mp3",
      "request_id": 456,
      "song_id": 101,
      "variants": [...]
    },
    {
      "id": "lyrics-789",
      "type": "lyrics_draft",
      "title": "Lyrics for Mike",
      "recipient_name": "Mike",
      "status": "draft",
      "created_at": "2024-01-15T09:15:00Z",
      "lyrics": "Verse 1:\nThis is a draft...",
      "request_id": 457,
      "lyrics_draft_id": 789
    }
  ]
}
```

**Usage in Journey**:
- **When**: User wants to view their "My Songs" page
- **Frontend**: Used by user content components
- **Dynamic Buttons**: Content type determines available actions

---

### 2. Get Lyrics Display Data
**Endpoint**: `GET /api/lyrics-display`

**Purpose**: Retrieves lyrics display data for a specific request.

**Query Parameters**:
- `requestId`: Song request ID

**Response**:
```json
{
  "success": true,
  "request": {
    "id": 456,
    "recipient_name": "Sarah",
    "status": "needs_review",
    "lyrics_status": "needs_review"
  },
  "drafts": [
    {
      "id": 789,
      "version": 1,
      "generated_text": "Original lyrics...",
      "edited_text": "Edited lyrics...",
      "status": "draft",
      "is_approved": false
    }
  ]
}
```

**Usage in Journey**:
- **When**: User wants to review/edit lyrics
- **Frontend**: Used by lyrics display page

---

## 🎤 Song Processing

### 1. Check Song Status
**Endpoint**: `GET /api/song-status/[taskId]`

**Purpose**: Checks the status of a song generation task.

**Response**:
```json
{
  "success": true,
  "status": "completed",
  "songUrl": "https://example.com/song.mp3",
  "duration": 180,
  "message": "Song generation completed"
}
```

**Usage in Journey**:
- **When**: Monitoring song generation progress
- **Frontend**: Used by status polling components
- **Real-time**: Updates UI with current status

---

### 2. Get Song Variants
**Endpoint**: `GET /api/song-variants/[songId]`

**Purpose**: Retrieves available song variants for a completed song.

**Response**:
```json
{
  "success": true,
  "variants": [
    {
      "id": "variant-1",
      "audioUrl": "https://example.com/variant1.mp3",
      "title": "Song for Sarah - Version 1",
      "duration": 180,
      "modelName": "Suno V4"
    },
    {
      "id": "variant-2",
      "audioUrl": "https://example.com/variant2.mp3",
      "title": "Song for Sarah - Version 2",
      "duration": 175,
      "modelName": "Suno V4"
    }
  ]
}
```

**Usage in Journey**:
- **When**: Song generation is complete
- **Frontend**: Used for variant selection UI
- **User Choice**: User can select preferred version

---

### 3. Suno Webhook
**Endpoint**: `POST /api/suno-webhook`

**Purpose**: Receives status updates from Suno API.

**Request**:
```json
{
  "taskId": "suno-task-12345",
  "status": "completed",
  "audioUrl": "https://example.com/song.mp3",
  "metadata": {...}
}
```

**Usage in Journey**:
- **When**: Suno API sends status updates
- **Backend**: Updates song status in database
- **Real-time**: Triggers frontend updates

---

## 🛠️ Admin & Utilities

### 1. Delete Content
**Endpoint**: `POST /api/delete-content`

**Purpose**: Deletes user content (song requests, lyrics, songs).

**Request**:
```json
{
  "contentId": "song-101",
  "contentType": "song"
}
```

**Usage in Journey**:
- **When**: User wants to delete their content
- **Frontend**: Used by delete buttons

---

### 2. Verify Database
**Endpoint**: `GET /api/verify-db`

**Purpose**: Verifies database connection and schema.

**Usage in Journey**:
- **When**: Debugging database issues
- **Admin**: Used for system health checks

---

## 🚀 User Journey Flows

### Flow 1: Anonymous User Journey
```
1. Visit Website
   ↓
2. POST /api/users/anonymous (auto-created)
   ↓
3. Fill Song Form
   ↓
4. POST /api/create-song-request (with anonymous_user_id)
   ↓
5. POST /api/generate-lyrics-with-storage
   ↓
6. Review Lyrics
   ↓
7. POST /api/payments/create-order (with anonymous_user_id)
   ↓
8. Complete Payment on Razorpay
   ↓
9. POST /api/payments/verify (with anonymous_user_id)
   ↓
10. POST /api/generate-song
    ↓
11. GET /api/song-status/[taskId] (polling)
    ↓
12. GET /api/song-variants/[songId]
    ↓
13. Select Variant & Enjoy Song
```

### Flow 2: Registered User Journey
```
1. Visit Website
   ↓
2. POST /api/auth/register (with anonymous_user_id if exists)
   ↓
3. Fill Song Form
   ↓
4. POST /api/create-song-request (with user_id)
   ↓
5. POST /api/generate-lyrics-with-storage
   ↓
6. Review Lyrics
   ↓
7. POST /api/payments/create-order (with user_id)
   ↓
8. Complete Payment on Razorpay
   ↓
9. POST /api/payments/verify (with user_id)
   ↓
10. POST /api/generate-song
    ↓
11. GET /api/song-status/[taskId] (polling)
    ↓
12. GET /api/song-variants/[songId]
    ↓
13. Select Variant & Enjoy Song
```

### Flow 3: User Migration Journey
```
1. Anonymous User Activity
   ↓
2. POST /api/auth/register (with anonymous_user_id)
   ↓
3. System automatically merges data:
   - Updates song_requests: user_id = new_user.id, anonymous_user_id = null
   - Updates payments: user_id = new_user.id, anonymous_user_id = null
   - Deletes anonymous user record
   ↓
4. User now has registered account with all previous data
```

---

## ⚠️ Error Handling

### Common Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Missing required fields",
  "error": "Validation failed"
}
```

**401 Unauthorized**:
```json
{
  "success": false,
  "message": "Authentication required"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "message": "Unauthorized access"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Resource not found"
}
```

**402 Payment Required**:
```json
{
  "success": false,
  "message": "Payment required",
  "requiresPayment": true,
  "paymentStatus": "pending"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## 🚦 Rate Limiting

### Rate Limits Applied
- **Song Creation**: 10 requests per hour per IP
- **Payment Creation**: 5 requests per hour per IP
- **API Calls**: 100 requests per hour per IP

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642234567
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "retryAfter": 3600
}
```

---

## 🔧 Development Notes

### Demo Mode
Most APIs support `demoMode: true` for testing without hitting real AI services:
- **Lyrics Generation**: Returns mock lyrics
- **Song Generation**: Creates demo song records
- **Payment**: Simulates payment flow

### Environment Variables
```bash
# Database
DATABASE_URL=postgresql://...

# AI Services
GEMINI_API_KEY=your_gemini_key
SUNO_API_KEY=your_suno_key

# Payment
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Testing Endpoints
- Use `demoMode: true` for safe testing
- Anonymous user IDs are UUIDs (validate format)
- All timestamps are in ISO format
- Error responses include helpful messages

---

## 📞 Support

For API support or questions:
- Check error messages for specific guidance
- Use demo mode for testing
- Verify request format matches documentation
- Check rate limiting if requests are failing

---

*Last updated: January 2024*
*Version: 1.0*
