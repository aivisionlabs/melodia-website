# Melodia App → Melodia Website: Comprehensive Merge Strategy

**Date:** January 2025
**Status:** In Progress
**Approach:** Option A - Full Integration (Backend Complete, UI Minimal)

---

## 📋 Executive Summary

This document outlines the strategy for merging the **melodia-app** (full-featured SaaS application) into **melodia-website** (marketing/showcase site). The goal is to implement the complete backend infrastructure while keeping the UI minimal initially.

### Key Principles
1. ✅ **Full backend migration** - All APIs, services, and database tables
2. ✅ **Minimal UI changes** - Only song request form visible initially
3. ✅ **Hidden authentication** - Full auth system implemented but not exposed in UI
4. ✅ **Separate tables** - Keep `songs` (library) and `user_songs` (generated) separate for now
5. ✅ **Demo mode enabled** - For development without hitting real APIs
6. ✅ **Unified design system** - Both projects already use same theme

---

## 🎯 Migration Goals

### What We're Achieving
- [x] Full user authentication system (Email/Password + Google OAuth) - **Backend only**
- [x] Anonymous user session management
- [x] Complete song generation workflow (request → lyrics → music)
- [x] Payment integration with Razorpay
- [x] Rate limiting with Upstash Redis
- [x] Email notifications via Resend
- [x] AI lyrics generation with Google Vertex AI
- [x] Suno API integration for music generation
- [x] Admin portal enhancements

### What's NOT Changing (For Now)
- [ ] Current homepage design
- [ ] Library/gallery pages
- [ ] Occasions pages
- [ ] Navigation structure
- [ ] No login/signup buttons in header
- [ ] Existing admin portal remains separate

---

## 📊 Database Strategy

### Current State (melodia-website)
```
Tables:
- songs (library songs, public)
- categories
- song_categories
- admin_users
```

### New Tables to Add (from melodia-app)
```
Tables to Create:
- users (registered user accounts)
- anonymous_users (temporary sessions)
- song_requests (song generation requests)
- user_songs (user-generated songs)
- lyrics_drafts (AI-generated lyrics with versions)
- payments (payment records)
- payment_webhooks (payment webhook logs)
- email_verification_codes (OTP codes)
- rate_limit_violations (rate limit tracking)
- blocked_ips (IP blocking)
- rate_limit_analytics (analytics data)
```

### Table Relationships
```
users (1) ──→ (N) song_requests
anonymous_users (1) ──→ (N) song_requests
song_requests (1) ──→ (1) user_songs
song_requests (1) ──→ (N) lyrics_drafts
song_requests (1) ──→ (N) payments
user_songs (1) ──→ (1) payments

// NO relationship between 'songs' and 'user_songs' (yet)
```

### Why Keep Songs and User_Songs Separate?

**Current Reasoning:**
1. **Different purposes:**
   - `songs`: Curated library songs for marketing/showcase
   - `user_songs`: User-generated songs with payment tracking

2. **Different access patterns:**
   - `songs`: Public, always accessible
   - `user_songs`: Private, requires authentication or payment

3. **Different metadata:**
   - `songs`: Categories, SEO, library management
   - `user_songs`: Payment IDs, variants, processing status

**Future Merge Strategy (Document Only):**

When we eventually merge these tables, we'll:
1. Add a `is_library_song` boolean flag to `user_songs`
2. Migrate all `songs` data to `user_songs`
3. Update all library queries to filter by `is_library_song = true`
4. Create database views for backward compatibility
5. Drop the `songs` table

**Migration SQL (for future reference):**
```sql
-- Step 1: Add flag to user_songs
ALTER TABLE user_songs ADD COLUMN is_library_song BOOLEAN DEFAULT false;

-- Step 2: Migrate data
INSERT INTO user_songs (
  slug, created_at, status, song_variants,
  metadata, is_library_song, add_to_library
)
SELECT
  slug, created_at, status, suno_variants as song_variants,
  metadata, true as is_library_song, add_to_library
FROM songs;

-- Step 3: Create view for backward compatibility
CREATE VIEW songs_view AS
SELECT * FROM user_songs WHERE is_library_song = true;

-- Step 4: Drop old table (after thorough testing)
-- DROP TABLE songs;
```

---

## 🔐 Authentication Strategy

### Implementation Status
- ✅ **Backend:** Full NextAuth.js implementation with JWT sessions
- ✅ **Google OAuth:** Complete configuration
- ✅ **Anonymous Users:** UUID-based sessions
- ❌ **UI:** No login/signup buttons visible (yet)

### Auth Flow (Backend Only)
```
1. Anonymous User Flow:
   - User visits site
   - useAnonymousUser hook creates UUID
   - Stored in cookie
   - Can create song requests

2. Registered User Flow (Hidden):
   - API endpoints exist
   - Email verification system ready
   - Google OAuth configured
   - Not exposed in UI navigation

3. Admin Flow (Existing):
   - Remains separate from new auth system
   - Uses existing admin_users table
   - No changes to current admin portal
```

### Files to Add
```
src/lib/auth/
├── nextauth.ts              # NextAuth configuration
├── middleware.ts            # Auth middleware
├── cookies.ts               # Cookie management
└── jwt.ts                   # JWT utilities

src/app/api/auth/
├── [...nextauth]/route.ts   # NextAuth handler
├── register/route.ts        # User registration
├── login/route.ts           # User login
├── logout/route.ts          # User logout
├── verify-email/route.ts    # Email verification
├── forgot-password/route.ts # Password reset
└── google/route.ts          # Google OAuth

src/hooks/
├── use-auth.ts              # Auth state hook
├── use-anonymous-user.ts    # Anonymous user hook
└── use-auth-form.ts         # Auth form logic
```

---

## 🎵 Song Generation Flow

### Complete Backend Implementation
```
1. Song Request Creation
   POST /api/create-song-request
   - Creates entry in song_requests table
   - Links to user_id or anonymous_user_id
   - Sends email notification
   - Returns requestId

2. Lyrics Generation
   POST /api/generate-lyrics
   - Uses Google Vertex AI
   - Creates entry in lyrics_drafts table
   - Supports versioning
   - Demo mode available

3. Lyrics Refinement (Optional)
   POST /api/refine-lyrics
   - Modifies existing lyrics
   - Creates new version in lyrics_drafts
   - AI-powered refinement

4. Lyrics Approval
   POST /api/approve-lyrics
   - Marks lyrics as approved
   - Updates status in lyrics_drafts

5. Song Generation
   POST /api/generate-song
   - Creates entry in user_songs table
   - Calls Suno API
   - Returns taskId and songId
   - Demo mode available

6. Status Polling
   GET /api/song-status/[songId]
   - Checks Suno API status
   - Updates user_songs table
   - Returns current status

7. Webhook Receipt
   POST /api/suno-webhook
   - Receives completion from Suno
   - Processes timestamped lyrics
   - Updates user_songs with audio URLs
   - Sends notification email

8. Song Playback
   GET /api/song/[slug]/lyrics
   - Returns complete song data
   - Includes synchronized lyrics
   - Checks ownership for private songs
```

### UI Implementation (Phase 1)
- Only song request form visible
- Hidden pages for lyrics editing, song generation, etc.
- These pages work but not linked in navigation

---

## 💳 Payment Integration

### Razorpay Setup
```
Files to Add:
src/lib/razorpay.ts              # Razorpay client
src/lib/razorpay-client.ts       # Client wrapper
src/lib/payment-config.ts        # Payment configuration

APIs to Create:
POST /api/payments/create-order
POST /api/payments/verify
GET  /api/payments/status/[id]
POST /api/webhooks/razorpay

Tables:
- payments
- payment_webhooks
```

### Payment Flow
```
1. Create Order → 2. Razorpay Checkout → 3. Payment Verification → 4. Webhook Processing → 5. Song Association
```

---

## ⚡ Rate Limiting

### Implementation
```
Service: Upstash Redis
Tiers: Low, Medium, High, Critical

Files to Add:
src/lib/rate-limiting/
├── index.ts          # Main module
├── config.ts         # Tier configuration
├── middleware.ts     # Rate limit middleware
├── utils.ts          # Utilities
└── admin.ts          # Admin operations

Tables:
- rate_limit_violations
- blocked_ips
- rate_limit_analytics
```

### Rate Limit Configuration
```typescript
{
  song_request: { requests: 5, window: '1h' },
  lyrics_generation: { requests: 10, window: '1h' },
  payment: { requests: 20, window: '1h' },
  anonymous: { requests: 3, window: '1h' }
}
```

---

## 📧 Email & Notifications

### Resend Integration
```
Files to Add:
src/lib/services/email-service.ts
src/lib/services/otp-service.ts

Email Templates:
- Welcome email
- Email verification OTP
- Password reset OTP
- Song request confirmation
- Song ready notification
- Payment confirmation
```

---

## 🤖 AI & LLM Services

### Google Vertex AI Integration
```
Files to Add:
src/lib/services/llm/
├── llm-lyrics-operation.ts       # Main lyrics generation
├── prompts/
│   └── lyrics-operation-prompt-builder.ts
├── prompt-security-validator.ts  # Security layer
└── ai/
    └── credentials-manager.ts

Features:
- Lyrics generation with context
- Lyrics refinement/editing
- Multi-language support
- Prompt injection protection
```

---

## 🎼 Suno API Integration

### Music Generation Service
```
Files to Add:
src/lib/suno-api.ts
src/lib/services/
├── song-status-calculation-service.ts
├── song-status-background-refresh.ts
├── song-status-api-utils.ts
├── song-status-database-service.ts
├── song-status-demo-handler.ts
└── song-status-production-handler.ts

Features:
- Song generation with Suno API
- Status polling
- Webhook handling
- Timestamped lyrics processing
- Demo mode for development
```

---

## 📦 Dependencies to Add

### New Dependencies (package.json)
```json
{
  "dependencies": {
    "next-auth": "4.24.11",
    "@auth/drizzle-adapter": "1.10.0",
    "razorpay": "2.9.6",
    "@google-cloud/vertexai": "1.10.0",
    "@upstash/redis": "1.35.4",
    "bcryptjs": "3.0.2",
    "jsonwebtoken": "9.0.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.6"
  }
}
```

### Existing (Keep)
```json
{
  "next": "15.4.5",
  "react": "19.1.0",
  "drizzle-orm": "0.44.4",
  "resend": "6.1.3",
  "bcrypt": "6.0.0"
}
```

**Note:** Replace `bcrypt` with `bcryptjs` for better compatibility.

---

## 🔧 Environment Variables

### New Variables to Add
```env
# Authentication
NEXTAUTH_SECRET=your-secret-key-minimum-32-characters
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payments
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret

# Music Generation
SUNO_API_URL=https://api.suno.ai
SUNO_API_KEY=your-suno-api-key

# AI/LLM
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_CLOUD_VERTEX_AI_MODEL=gemini-pro

# Rate Limiting
UPSTASH_REDIS_REST_URL=your-redis-url
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Email
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=noreply@melodia.com

# Demo Mode (Development)
DEMO_MODE=true
```

### Existing (Keep)
```env
DATABASE_URL=postgresql://...
POSTGRES_URL=postgresql://...
```

---

## 📁 File Structure After Merge

```
melodia-website/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Homepage (no changes)
│   │   ├── library/                    # Library pages (no changes)
│   │   ├── occasions/                  # Occasions pages (no changes)
│   │   ├── api/
│   │   │   ├── auth/                   # ✨ NEW: Auth APIs
│   │   │   ├── create-song-request/    # ✨ NEW: Song request
│   │   │   ├── generate-lyrics/        # ✨ NEW: Lyrics generation
│   │   │   ├── generate-song/          # ✨ NEW: Song generation
│   │   │   ├── song-status/            # ✨ NEW: Status polling
│   │   │   ├── payments/               # ✨ NEW: Payment APIs
│   │   │   ├── webhooks/               # ✨ NEW: Webhook handlers
│   │   │   └── users/                  # ✨ NEW: User APIs
│   │   ├── profile/                    # ✨ NEW: Profile pages (hidden)
│   │   ├── generate-lyrics/            # ✨ NEW: Lyrics editing (hidden)
│   │   └── song-options/               # ✨ NEW: Song options (hidden)
│   │
│   ├── components/
│   │   ├── forms/                      # ✨ NEW: Form components
│   │   ├── auth/                       # ✨ NEW: Auth components
│   │   ├── song/                       # Existing + new song components
│   │   └── ui/                         # Existing UI components
│   │
│   ├── lib/
│   │   ├── db/
│   │   │   └── schema.ts               # ✨ EXTENDED: Add new tables
│   │   ├── auth/                       # ✨ NEW: Auth utilities
│   │   ├── services/                   # ✨ NEW: All services
│   │   ├── rate-limiting/              # ✨ NEW: Rate limiting
│   │   ├── suno-api.ts                 # ✨ NEW: Suno integration
│   │   ├── razorpay.ts                 # ✨ NEW: Razorpay integration
│   │   └── design-system.ts            # Existing (no changes)
│   │
│   └── hooks/
│       ├── use-auth.ts                 # ✨ NEW: Auth hooks
│       ├── use-anonymous-user.ts       # ✨ NEW: Anonymous user
│       └── use-song-status-polling.ts  # ✨ NEW: Status polling
│
├── docs/
│   └── MERGE_STRATEGY.md               # This document
│
├── drizzle/
│   └── migrations/                     # ✨ NEW: Add new migrations
│
└── package.json                        # ✨ UPDATED: New dependencies
```

---

## 🚀 Implementation Phases

### Phase 1: Database Foundation (Day 1-2)
- [ ] Extend `src/lib/db/schema.ts` with new tables
- [ ] Create Drizzle migrations
- [ ] Test database connections
- [ ] Run migrations on development database

### Phase 2: Authentication System (Day 3-4)
- [ ] Install NextAuth.js and dependencies
- [ ] Create auth configuration files
- [ ] Implement auth API routes
- [ ] Add auth hooks (hidden from UI)
- [ ] Test authentication flow

### Phase 3: Core Services (Day 5-7)
- [ ] Email service (Resend)
- [ ] OTP service
- [ ] LLM lyrics service (Vertex AI)
- [ ] Suno API service
- [ ] Demo mode handlers
- [ ] Test all services in demo mode

### Phase 4: Song Generation APIs (Day 8-10)
- [ ] Create song request API
- [ ] Generate lyrics API
- [ ] Refine lyrics API
- [ ] Approve lyrics API
- [ ] Generate song API
- [ ] Song status API
- [ ] Webhook handlers
- [ ] Test complete flow with demo mode

### Phase 5: Payment Integration (Day 11-12)
- [ ] Razorpay client setup
- [ ] Payment APIs
- [ ] Webhook handlers
- [ ] Payment verification
- [ ] Test payment flow (demo mode)

### Phase 6: Rate Limiting (Day 13-14)
- [ ] Upstash Redis setup
- [ ] Rate limiting middleware
- [ ] IP blocking system
- [ ] Analytics tracking
- [ ] Test rate limits

### Phase 7: Components & Pages (Day 15-16)
- [ ] Add form components
- [ ] Add auth components (hidden)
- [ ] Create profile pages (hidden)
- [ ] Create lyrics editing pages (hidden)
- [ ] Create song options pages (hidden)
- [ ] Ensure no links in navigation

### Phase 8: Testing & Documentation (Day 17-18)
- [ ] End-to-end testing of anonymous song request
- [ ] Test all API endpoints
- [ ] Test demo mode
- [ ] Update environment variables documentation
- [ ] Create API documentation
- [ ] Test deployment

---

## 🎨 Design System Alignment

✅ **No changes needed** - Both projects use identical design system:
- Colors: Yellow (#FFD166), Cream (#FDFDFD), Coral (#EF476F), Teal (#073B4C)
- Fonts: Poppins (headings) + Montserrat (body)
- Components: Same Tailwind configuration

---

## ⚠️ Important Notes

### Demo Mode (Development)
```typescript
// All APIs support demo mode
{
  "demoMode": true  // Add to request body
}

// Benefits:
- No real API calls
- No costs incurred
- Instant responses
- Safe for testing
```

### Hidden Features
These features are **fully implemented** but **not visible in UI**:
1. Login/Signup pages (exist but not linked)
2. Profile pages (exist but not linked)
3. Lyrics editing interface (exist but not linked)
4. Song generation progress pages (exist but not linked)

**Why?** This allows backend development and testing without confusing users.

### Security Considerations
1. ✅ All sensitive operations require authentication (backend enforced)
2. ✅ Rate limiting prevents abuse
3. ✅ Prompt injection protection for LLM
4. ✅ Payment verification with Razorpay signatures
5. ✅ CORS configured properly
6. ✅ Environment variables secured

---

## 📝 Migration Checklist

### Pre-Migration
- [x] Backup existing database
- [x] Document current schema
- [x] Review existing admin portal functionality
- [x] Confirm external service accounts (Suno, Razorpay, etc.)

### During Migration
- [ ] Install new dependencies
- [ ] Create database migrations
- [ ] Add environment variables
- [ ] Implement authentication system
- [ ] Add all API routes
- [ ] Implement services
- [ ] Add rate limiting
- [ ] Create hidden pages/components

### Post-Migration
- [ ] Test anonymous song request flow
- [ ] Verify demo mode works
- [ ] Test admin portal (ensure no breaking changes)
- [ ] Update documentation
- [ ] Deploy to staging environment
- [ ] Monitor for errors

---

## 🔮 Future Roadmap

### Phase 1: Current (Hidden Backend)
- Full backend implemented
- Only song request form visible
- Anonymous users only

### Phase 2: Public Launch (1-2 months)
- Expose login/signup UI
- Show profile pages
- Enable registered user features
- Marketing campaign

### Phase 3: Advanced Features (3-6 months)
- Merge `songs` and `user_songs` tables
- Advanced lyrics editing UI
- Song variants selection
- Social sharing features
- Payment plans (subscriptions)

---

## 📞 Support & Questions

For questions during implementation:
1. Refer to `MELODIA_APP_INTEGRATION_GUIDE.md`
2. Check `MELODIA_APP_ARCHITECTURE.md`
3. Review `MELODIA_APP_QUICK_REFERENCE.md`

---

**Last Updated:** January 2025
**Status:** Ready for Implementation
**Next Step:** Phase 1 - Database Foundation


