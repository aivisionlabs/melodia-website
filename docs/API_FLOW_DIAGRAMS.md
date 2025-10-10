# 🎵 Melodia API Flow Diagrams

## 📊 Complete User Journey Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              MELODIA USER JOURNEY                              │
└─────────────────────────────────────────────────────────────────────────────────┘

🌐 WEBSITE VISIT
    │
    ▼
┌─────────────────┐
│ Anonymous User  │ ──► POST /api/users/anonymous
│ Creation        │     (Auto-created by useAnonymousUser hook)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Song Request    │ ──► POST /api/create-song-request
│ Form Submission │     Body: { recipient_name, languages, additional_details,
│                 │              anonymous_user_id }
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Lyrics          │ ──► POST /api/generate-lyrics
│ Generation      │     Body: { requestId, recipient_name, languages,
│                 │              additional_details }
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Review & Edit   │ ──► GET /api/fetch-lyrics?requestId=123
│ Lyrics          │     (User reviews generated lyrics)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Payment         │ ──► POST /api/payments/create-order
│ Creation        │     Body: { songRequestId, anonymous_user_id }
│                 │     Note: Fixed price ₹299 (no planId needed)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Razorpay        │ ──► User completes payment on Razorpay
│ Payment         │     (External payment gateway)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Payment         │ ──► POST /api/payments/verify
│ Verification    │     Body: { razorpay_payment_id, razorpay_order_id,
│                 │              razorpay_signature, anonymous_user_id }
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Song            │ ──► POST /api/generate-song
│ Generation      │     Body: { title, lyrics, style, recipient_name,
│                 │              requestId, userId/anonymous_user_id }
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Status          │ ──► GET /api/song-status/[songId]
│ Monitoring      │     (Polling for completion)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Song Variants   │ ──► GET /api/song-variants/[songId]
│ Selection       │     (User selects preferred version)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Content         │ ──► GET /api/fetch-user-song?anonymousUserId=uuid
│ Management      │     (View all user's songs and lyrics)
└─────────────────┘
```

---

## 🔄 Anonymous User Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            ANONYMOUS USER FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ FIRST VISIT
   ┌─────────────────┐
   │ Website Load    │ ──► useAnonymousUser() hook triggers
   │                 │     POST /api/users/anonymous
   │                 │     Response: { anonymous_user_id: "uuid" }
   │                 │     Storage: localStorage.setItem("anonymous_user_id", uuid)
   └─────────────────┘

2️⃣ SONG CREATION
   ┌─────────────────┐
   │ Form Submit     │ ──► POST /api/create-song-request
   │                 │     Body: { ..., anonymous_user_id: uuid }
   │                 │     Response: { requestId: 123 }
   └─────────────────┘

3️⃣ PAYMENT FLOW
   ┌─────────────────┐
   │ Create Order    │ ──► POST /api/payments/create-order
   │                 │     Body: { songRequestId: 123, anonymous_user_id: uuid }
   │                 │     Response: { orderId: "order_123", amount: 29900, key: "rzp_key", ... }
   │                 │     Note: Fixed price ₹299 (no planId needed)
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Razorpay        │ ──► User pays on Razorpay
   │ Payment         │     (External gateway)
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Verify Payment  │ ──► POST /api/payments/verify
   │                 │     Body: { ..., anonymous_user_id: uuid }
   │                 │     Response: { success: true, paymentId: 456 }
   └─────────────────┘

4️⃣ CONTENT ACCESS
   ┌─────────────────┐
   │ View Content    │ ──► GET /api/fetch-user-song
   │                 │     Response: { content: [songs, lyrics_drafts, requests] }
   └─────────────────┘
```

---

## 🔐 Registered User Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            REGISTERED USER FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ REGISTRATION
   ┌─────────────────┐
   │ Register        │ ──► POST /api/auth/register (simple) OR
   │                 │     POST /api/auth/signup (comprehensive)
   │                 │     Body: { email, password, name, anonymous_user_id? }
   │                 │     Response: { success: true, user: {...} }
   │                 │     Data Migration: Merges anonymous data automatically
   └─────────────────┘

2️⃣ LOGIN
   ┌─────────────────┐
   │ Login           │ ──► POST /api/auth/login
   │                 │     Body: { email, password, anonymous_user_id? }
   │                 │     Response: { success: true, user: {...} }
   │                 │     Session: localStorage.setItem("user-session", user)
   └─────────────────┘

3️⃣ SONG CREATION
   ┌─────────────────┐
   │ Form Submit     │ ──► POST /api/create-song-request
   │                 │     Body: { ..., user_id: 123 }
   │                 │     Response: { requestId: 124 }
   └─────────────────┘

4️⃣ PAYMENT FLOW
   ┌─────────────────┐
   │ Create Order    │ ──► POST /api/payments/create-order
   │                 │     Body: { songRequestId: 124, user_id: 123 }
   │                 │     Response: { orderId: "order_124", amount: 29900, ... }
   │                 │     Note: Fixed price ₹299 (no planId needed)
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Razorpay        │ ──► User pays on Razorpay
   │ Payment         │     (External gateway)
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Verify Payment  │ ──► POST /api/payments/verify
   │                 │     Body: { ..., user_id: 123 }
   │                 │     Response: { success: true, paymentId: 457 }
   └─────────────────┘

5️⃣ CONTENT ACCESS
   ┌─────────────────┐
   │ View Content    │ ──► GET /api/fetch-user-song?userId=123
   │                 │     Response: { content: [songs, lyrics_drafts, requests] }
   └─────────────────┘
```

---

## 🔐 Additional Authentication Endpoints

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ADDITIONAL AUTHENTICATION ENDPOINTS                       │
└─────────────────────────────────────────────────────────────────────────────────┘

📧 EMAIL VERIFICATION FLOW
   ┌─────────────────┐
   │ Send Verification│ ──► POST /api/auth/send-verification
   │                 │     Body: { userId }
   │                 │     Response: { success: true }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Verify Email    │ ──► POST /api/auth/verify-email
   │                 │     Body: { userId, code }
   │                 │     Response: { success: true, verified: true }
   └─────────────────┘

🔒 PASSWORD RESET FLOW
   ┌─────────────────┐
   │ Forgot Password │ ──► POST /api/auth/forgot-password
   │                 │     Body: { email }
   │                 │     Response: { success: true }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Verify OTP      │ ──► POST /api/auth/verify-forgot-password-otp
   │                 │     Body: { email, code }
   │                 │     Response: { success: true, token }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Reset Password  │ ──► POST /api/auth/reset-password
   │                 │     Body: { token, newPassword }
   │                 │     Response: { success: true }
   └─────────────────┘

👤 USER MANAGEMENT
   ┌─────────────────┐
   │ Get User Info   │ ──► GET /api/users/me
   │                 │     Response: { success: true, user: {...} }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Update Profile  │ ──► PATCH /api/users/me
   │                 │     Body: { name, phone_number, date_of_birth, profile_picture }
   │                 │     Response: { success: true, user: {...} }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Logout          │ ──► POST /api/auth/logout
   │                 │     Response: { success: true }
   └─────────────────┘
```

---

## 🎵 Additional Song Management Endpoints

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        ADDITIONAL SONG MANAGEMENT ENDPOINTS                      │
└─────────────────────────────────────────────────────────────────────────────────┘

📝 LYRICS MANAGEMENT
   ┌─────────────────┐
   │ Approve Lyrics  │ ──► POST /api/approve-lyrics
   │                 │     Body: { requestId, lyricsId }
   │                 │     Response: { success: true }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Refine Lyrics   │ ──► POST /api/refine-lyrics
   │                 │     Body: { requestId, refinement }
   │                 │     Response: { success: true, newLyrics }
   └─────────────────┘

🎼 SONG LIBRARY
   ┌─────────────────┐
   │ Best Songs      │ ──► GET /api/songs/best
   │                 │     Response: { songs: [...] }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Song Library    │ ──► GET /api/songs/library
   │                 │     Response: { songs: [...] }
   └─────────────────┘

🔗 WEBHOOKS
   ┌─────────────────┐
   │ Razorpay        │ ──► POST /api/webhooks/razorpay
   │ Webhook         │     Payment status updates from Razorpay
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Suno Webhook    │ ──► POST /api/suno-webhook
   │                 │     Song generation status updates from Suno
   └─────────────────┘
```

---

## 🔄 User Migration Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            USER MIGRATION FLOW                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

📱 ANONYMOUS ACTIVITY
   ┌─────────────────┐
   │ Anonymous User  │ ──► Creates songs, makes payments
   │ Activity        │     anonymous_user_id: "uuid-123"
   │                 │     Data stored with anonymous_user_id
   └─────────────────┘
   │
   ▼
🔐 REGISTRATION WITH MERGE
   ┌─────────────────┐
   │ Register        │ ──► POST /api/auth/register (simple) OR
   │                 │     POST /api/auth/signup (comprehensive with email verification)
   │                 │     Body: { email, password, name, anonymous_user_id: "uuid-123" }
   │                 │     Response: { success: true, user: { id: 456 } }
   └─────────────────┘
   │
   ▼
🔄 AUTOMATIC DATA MERGE
   ┌─────────────────┐
   │ Database        │ ──► UPDATE song_requests
   │ Migration       │     SET user_id = 456, anonymous_user_id = NULL
   │                 │     WHERE anonymous_user_id = "uuid-123"
   │                 │
   │                 │     UPDATE payments
   │                 │     SET user_id = 456, anonymous_user_id = NULL
   │                 │     WHERE anonymous_user_id = "uuid-123"
   │                 │
   │                 │     DELETE FROM anonymous_users
   │                 │     WHERE id = "uuid-123"
   └─────────────────┘
   │
   ▼
✅ MIGRATION COMPLETE
   ┌─────────────────┐
   │ User Now Has    │ ──► All previous anonymous data now belongs to user 456
   │ Registered      │     User can access all their songs and payments
   │ Account         │     Anonymous session cleared from localStorage
   └─────────────────┘
```

---

## 💳 Payment Flow Detail

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PAYMENT FLOW DETAIL                               │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ INITIATE PAYMENT
   ┌─────────────────┐
   │ Frontend        │ ──► User clicks "Pay Now"
   │                 │     PaymentModal component opens
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Create Order    │ ──► POST /api/payments/create-order
   │                 │     Body: { songRequestId, user_id/anonymous_user_id }
   │                 │     Response: { orderId, amount: 29900, key, prefill, ... }
   │                 │     Note: Fixed price ₹299 (no planId needed)
   └─────────────────┘

2️⃣ RAZORPAY PAYMENT
   ┌─────────────────┐
   │ Razorpay        │ ──► RazorpayCheckout opens
   │ Checkout        │     User enters payment details
   │                 │     Payment processed by Razorpay
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Payment         │ ──► Razorpay sends callback
   │ Callback        │     Frontend receives payment details
   └─────────────────┘

3️⃣ VERIFY PAYMENT
   ┌─────────────────┐
   │ Verify          │ ──► POST /api/payments/verify
   │                 │     Body: { razorpay_payment_id, razorpay_order_id,
   │                 │              razorpay_signature, user_id/anonymous_user_id }
   │                 │     Response: { success: true, paymentId }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Update Status   │ ──► Database updated:
   │                 │     - payment.status = "completed"
   │                 │     - song_request.payment_status = "paid"
   │                 │     - song.payment_id = paymentId
   └─────────────────┘

4️⃣ PROCEED TO SONG GENERATION
   ┌─────────────────┐
   │ Generate Song   │ ──► POST /api/generate-song
   │                 │     Payment check passes
   │                 │     Song generation starts
   └─────────────────┘
```

---

## 🎵 Song Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            SONG GENERATION FLOW                                │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ INITIATE GENERATION
   ┌─────────────────┐
   │ User Approval   │ ──► User clicks "Generate Song"
   │                 │     Frontend calls generate-song API
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Generate Song   │ ──► POST /api/generate-song
   │                 │     Body: { title, lyrics, style, recipient_name,
   │                 │              requestId, userId/anonymous_user_id }
   │                 │     Response: { success: true, taskId, songId }
   └─────────────────┘

2️⃣ SUNO API INTEGRATION
   ┌─────────────────┐
   │ Suno API        │ ──► API call to Suno service
   │                 │     Request: { prompt, style, title, customMode }
   │                 │     Response: { taskId: "suno-task-123" }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Database        │ ──► Create song record:
   │ Update          │     - songs.status = "processing"
   │                 │     - songs.suno_task_id = "suno-task-123"
   │                 │     - song_requests.status = "processing"
   └─────────────────┘

3️⃣ STATUS MONITORING
   ┌─────────────────┐
   │ Status Polling   │ ──► GET /api/song-status/[songId]
   │                 │     Frontend polls every 10 seconds
   │                 │     Response: { status: "processing/completed/failed" }
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Suno Webhook    │ ──► POST /api/suno-webhook
   │                 │     Suno sends status updates
   │                 │     Database updated with final results
   └─────────────────┘

4️⃣ COMPLETION
   ┌─────────────────┐
   │ Song Ready      │ ──► Status changes to "completed"
   │                 │     Audio URLs available
   │                 │     Frontend shows "Listen" button
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Variants        │ ──► GET /api/song-variants/[songId]
   │                 │     User can select preferred version
   │                 │     Response: { variants: [...] }
   └─────────────────┘
```

---

## 🔍 Content Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            CONTENT MANAGEMENT FLOW                             │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ CONTENT RETRIEVAL
   ┌─────────────────┐
   │ My Songs Page   │ ──► GET /api/fetch-user-song
   │                 │     Query: ?userId=123 OR ?anonymousUserId=uuid
   │                 │     Response: { content: [...] }
   └─────────────────┘

2️⃣ CONTENT TYPES
   ┌─────────────────┐
   │ Song Request    │ ──► Type: "song_request"
   │                 │     Status: "pending"
   │                 │     Action: "Create Lyrics"
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Lyrics Draft    │ ──► Type: "lyrics_draft"
   │                 │     Status: "draft/needs_review/approved"
   │                 │     Action: "Generate Song" / "Review Lyrics"
   └─────────────────┘
   │
   ┌─────────────────┐
   │ Song            │ ──► Type: "song"
   │                 │     Status: "processing/ready/failed"
   │                 │     Action: "Listen" / "View Progress" / "Retry"
   └─────────────────┘

3️⃣ DYNAMIC BUTTONS
   ┌─────────────────┐
   │ Button Logic    │ ──► getButtonForContent(item)
   │                 │     Returns: { text, action, variant }
   │                 │     Based on content type and status
   └─────────────────┘

4️⃣ CONTENT ACTIONS
   ┌─────────────────┐
   │ Delete Content  │ ──► POST /api/delete-content
   │                 │     Body: { contentId, contentType }
   │                 │     Removes from database
   └─────────────────┘
```

---

## 🚨 Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              ERROR HANDLING FLOW                               │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ VALIDATION ERRORS
   ┌─────────────────┐
   │ Input           │ ──► 400 Bad Request
   │ Validation      │     Response: { success: false, message: "Missing fields" }
   └─────────────────┘

2️⃣ AUTHENTICATION ERRORS
   ┌─────────────────┐
   │ Auth Required   │ ──► 401 Unauthorized
   │                 │     Response: { success: false, message: "Auth required" }
   └─────────────────┘

3️⃣ AUTHORIZATION ERRORS
   ┌─────────────────┐
   │ Access Denied   │ ──► 403 Forbidden
   │                 │     Response: { success: false, message: "Unauthorized" }
   └─────────────────┘

4️⃣ PAYMENT ERRORS
   ┌─────────────────┐
   │ Payment         │ ──► 402 Payment Required
   │ Required        │     Response: { success: false, requiresPayment: true }
   └─────────────────┘

5️⃣ RATE LIMITING
   ┌─────────────────┐
   │ Too Many        │ ──► 429 Too Many Requests
   │ Requests        │     Response: { success: false, retryAfter: 3600 }
   └─────────────────┘

6️⃣ SERVER ERRORS
   ┌─────────────────┐
   │ Internal        │ ──► 500 Internal Server Error
   │ Error           │     Response: { success: false, message: "Server error" }
   └─────────────────┘
```

---

## 🔧 Development & Testing Flow

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                            DEVELOPMENT & TESTING FLOW                          │
└─────────────────────────────────────────────────────────────────────────────────┘

1️⃣ DEMO MODE
   ┌─────────────────┐
   │ Demo Mode       │ ──► Set demoMode: true in requests
   │                 │     - No real AI API calls
   │                 │     - Mock responses returned
   │                 │     - Database still updated
   └─────────────────┘

2️⃣ TESTING ENDPOINTS
   ┌─────────────────┐
   │ Test APIs       │ ──► Use demo data for testing
   │                 │     - Avoid hitting real APIs
   │                 │     - Test database operations
   │                 │     - Verify error handling
   └─────────────────┘

3️⃣ VALIDATION
   ┌─────────────────┐
   │ Input           │ ──► Validate all inputs
   │ Validation      │     - UUID format for anonymous users
   │                 │     - Required fields present
   │                 │     - Data types correct
   └─────────────────┘

4️⃣ SECURITY
   ┌─────────────────┐
   │ Security        │ ──► Rate limiting applied
   │ Checks          │     - IP-based limiting
   │                 │     - User ownership validation
   │                 │     - Input sanitization
   └─────────────────┘
```

---

---

## 📋 API Endpoint Summary

### Core Endpoints
- **Anonymous User**: `POST /api/users/anonymous`
- **Song Request**: `POST /api/create-song-request`
- **Lyrics Generation**: `POST /api/generate-lyrics`
- **Lyrics Fetching**: `GET /api/fetch-lyrics?requestId=123`
- **Payment Order**: `POST /api/payments/create-order` (Fixed ₹299)
- **Payment Verify**: `POST /api/payments/verify`
- **Song Generation**: `POST /api/generate-song`
- **Song Status**: `GET /api/song-status/[songId]`
- **User Content**: `GET /api/fetch-user-song`

### Authentication Endpoints
- **Simple Registration**: `POST /api/auth/register`
- **Comprehensive Signup**: `POST /api/auth/signup` (with email verification)
- **Login**: `POST /api/auth/login`
- **Email Verification**: `POST /api/auth/verify-email`
- **Password Reset**: `POST /api/auth/forgot-password`
- **User Profile**: `GET /api/users/me`, `PATCH /api/users/me`

### Additional Features
- **Lyrics Management**: `POST /api/approve-lyrics`, `POST /api/refine-lyrics`
- **Song Library**: `GET /api/songs/best`, `GET /api/songs/library`
- **Webhooks**: `POST /api/webhooks/razorpay`, `POST /api/suno-webhook`

### Key Changes from Original Documentation
1. **Fixed Pricing**: No `planId` parameter - all songs cost ₹299
2. **Dual Registration**: Both `/api/auth/register` and `/api/auth/signup` available
3. **Correct Endpoints**: `/api/fetch-user-song` instead of `/api/user-content`
4. **Song Status**: Uses `[songId]` instead of `[taskId]`
5. **Additional Endpoints**: Many authentication and management endpoints added

*These flow diagrams show the complete API journey for Melodia, covering both anonymous and registered user experiences, payment flows, song generation, and content management.*
