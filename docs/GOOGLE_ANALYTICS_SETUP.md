# Google Analytics Configuration Guide for Melodia

## 📊 Overview

This document outlines the complete Google Analytics setup for the Melodia platform, including current implementation, configuration instructions, and gaps that need to be addressed.

## ✅ Current Implementation

### 1. Google Analytics Setup

**Location:** `src/app/layout.tsx`

**Current Configuration:**
- **Measurement ID:** `G-TJW2DN7ND5`
- **Environment:** Production only (development is disabled)
- **Script Strategy:** `afterInteractive` (loads after page becomes interactive)

```92:108:src/app/layout.tsx
        {/* Google tag (gtag.js) - Production only */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script
              src="https://www.googletagmanager.com/gtag/js?id=G-TJW2DN7ND5"
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-TJW2DN7ND5');
              `}
            </Script>
          </>
        )}
```

### 2. Page Tracking

**Location:** `src/hooks/use-page-tracking.ts` and `src/components/PageTracking.tsx`

**Current Implementation:**
- Automatically tracks page views on route changes
- Limited page title mapping for specific routes
- Tracks URL and page title

```1:29:src/hooks/use-page-tracking.ts
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { trackPageView } from '@/lib/analytics';

export const usePageTracking = () => {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname) {
      const pageTitle = getPageTitle(pathname);
      const pageUrl = `${window.location.origin}${pathname}`;
      trackPageView(pageTitle, pageUrl);
    }
  }, [pathname]);
};

const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Melodia - Create Personalized Songs for loved ones';
    case '/library':
      return 'Melodia - Song Library';
    default:
      if (pathname.startsWith('/library/')) {
        return 'Melodia - Song Player';
      }
      return 'Melodia';
  }
};
```

### 3. Analytics Utility Library

**Location:** `src/lib/analytics.ts`

**Available Tracking Functions:**
- Player events (play, pause, seek, skip, audio load, error, end)
- Navigation events (page view, click, navigate)
- Engagement events (share, copy link, lyric click/scroll, like)
- Search events (search, results, suggestions, no results)
- CTA events (CTA click, form submit, WhatsApp contact)

### 4. Currently Tracked Components

**Files with analytics tracking:**
- ✅ `src/components/MediaPlayer.tsx` - Audio player interactions
- ✅ `src/components/FullPageMediaPlayer.tsx` - Full-page player interactions
- ✅ `src/components/SongLikeButton.tsx` - Like button clicks
- ✅ `src/components/LibrarySearchBar.tsx` - Search functionality
- ✅ `src/components/search-bar.tsx` - General search
- ✅ `src/components/ShareRequirementsCTA.tsx` - CTA clicks
- ✅ `src/components/WhatsAppCTA.tsx` - WhatsApp contact
- ✅ `src/hooks/useAudioPlayer.ts` - Audio player events
- ✅ `src/app/page.tsx` - Homepage navigation
- ✅ `src/lib/actions.ts` - Form submissions (some)

---

## 🔍 Critical Gaps and Missing Analytics

### 1. Page Tracking Gaps

**Missing Page Title Mappings:**

The following pages are not properly tracked with specific titles:

```typescript
// Missing mappings in getPageTitle() function:
- /occasions → 'All Occasions | Melodia'
- /occasions/weddings → 'Wedding Songs | Melodia'
- /occasions/birthday → 'Birthday Songs | Melodia'
- /occasions/anniversary → 'Anniversary Songs | Melodia'
- /occasions/romantic → 'Romantic Songs | Melodia'
- /occasions/party → 'Party Songs | Melodia'
- /occasions/kids → 'Kids Songs | Melodia'
- /occasions/friendship → 'Friendship Songs | Melodia'
- /occasions/apology → 'Apology Songs | Melodia'
- /occasions/corporate-events → 'Corporate Event Songs | Melodia'
- /occasions/farewell → 'Farewell Songs | Melodia'
- /occasions/lullaby → 'Lullaby Songs | Melodia'
- /occasions/siblings → 'Sibling Songs | Melodia'
- /occasions/parents → 'Parent Songs | Melodia'
- /occasions/congratulations → 'Congratulations Songs | Melodia'
- /occasions/thank-you → 'Thank You Songs | Melodia'
- /occasions/motivational → 'Motivational Songs | Melodia'
- /occasions/devotional-spiritual → 'Devotional Songs | Melodia'
- /occasions/festive-holiday → 'Festive Holiday Songs | Melodia'
- /occasions/sangeet → 'Sangeet Songs | Melodia'
- /about → 'About Melodia'
- /contact → 'Contact Us'
- /privacy → 'Privacy Policy'
- /terms → 'Terms of Service'
- /refund → 'Refund Policy'
- /library → Already tracked
```

### 2. Conversion Tracking Gaps

**Critical Missing Events:**

1. **Song Request Form Submission**
   - Location: Homepage form
   - Should track: Form submission, recipient name, occasion type
   - Priority: **HIGH**

2. **Lyrics Generation**
   - Location: After form submission
   - Should track: Successful lyrics generation, generation time
   - Priority: **HIGH**

3. **Song Generation**
   - Location: After lyrics approval
   - Should track: Song creation request, generation start
   - Priority: **HIGH**

4. **Song Completion**
   - Location: Webhook callback
   - Should track: Successful song completion, generation duration
   - Priority: **HIGH**

5. **Contact Form Submission**
   - Location: `/contact` page
   - Should track: Form submissions
   - Priority: **MEDIUM**

### 3. User Journey Tracking Gaps

**Missing Funnel Analysis:**

1. **Homepage → Form Fill**
   - Track "Share Requirements" CTA clicks
   - Track form field interactions
   - Track form abandonment

2. **Form → Lyrics Display**
   - Track lyrics generation success/failure
   - Track lyrics editing actions
   - Track "Generate Song" button clicks

3. **Song Generation → Completion**
   - Track generation progress
   - Track successful completions
   - Track errors or failures

4. **Library → Song Play**
   - Track library page views
   - Track song thumbnail clicks
   - Track song detail page views

### 4. Engagement Tracking Gaps

**Missing Interactions:**

1. **Occasion Page Interactions**
   - Track occasion category clicks
   - Track occasion page scroll depth
   - Track "Order Now" or similar CTA clicks

2. **Library Interactions**
   - Track song filter usage
   - Track search results clicks
   - Track pagination clicks
   - Track like button interactions

3. **Player Interactions**
   - Track volume changes
   - Track full-screen mode usage
   - Track lyrics synchronization clicks

### 5. Goal and E-commerce Tracking

**Missing Conversions:**

1. **Custom Goals Not Configured**
   - Song request completion (conversion goal)
   - Song generation completion (conversion goal)
   - User registration (if implemented)

2. **E-commerce Events Missing**
   - Item views (for songs)
   - Add to cart (if implementing)
   - Purchase (for premium features)
   - Checkout progress

---

## 🚀 Implementation Plan

### Phase 1: Fix Critical Gaps (Priority: HIGH)

#### 1.1 Update Page Title Tracking

**File:** `src/hooks/use-page-tracking.ts`

**Action Required:**
```typescript
const getPageTitle = (pathname: string): string => {
  switch (pathname) {
    case '/':
      return 'Melodia - Create Personalized Songs for loved ones';
    case '/library':
      return 'Melodia - Song Library';
    // Add ALL occasions mapping
    case '/occasions':
      return 'All Occasions | Melodia';
    case '/occasions/weddings':
      return 'Wedding Songs | Melodia';
    case '/occasions/birthday':
      return 'Birthday Songs | Melodia';
    case '/occasions/anniversary':
      return 'Anniversary Songs | Melodia';
    // ... add all occasions
    case '/about':
      return 'About Melodia';
    case '/contact':
      return 'Contact Us';
    case '/privacy':
      return 'Privacy Policy';
    case '/terms':
      return 'Terms of Service';
    case '/refund':
      return 'Refund Policy';
    default:
      if (pathname.startsWith('/library/')) {
        return 'Melodia - Song Player';
      }
      if (pathname.startsWith('/occasions/')) {
        // Extract occasion name and capitalize
        const occasion = pathname.split('/')[2];
        const occasionName = occasion.split('-').map(
          word => word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
        return `${occasionName} Songs | Melodia`;
      }
      return 'Melodia';
  }
};
```

#### 1.2 Add Form Submission Tracking

**Location:** `src/app/page.tsx` (homepage form)

**Action Required:**
Add tracking to form submission handler:
```typescript
// After successful form submission
trackCTAEvent.formSubmit('Song Request Form', 'homepage');
trackCustomEvent('song_request_initiated', {
  recipient_name: formData.get('recipientName'),
  occasion_type: formData.get('occasion'),
  timestamp: Date.now(),
});
```

#### 1.3 Add Lyrics Generation Tracking

**Location:** API route for lyrics generation

**Action Required:**
Add tracking in `/api/generate-lyrics-with-storage` or similar:
```typescript
trackCustomEvent('lyrics_generated', {
  request_id: requestId,
  generation_time: elapsedTime,
  success: true,
  timestamp: Date.now(),
});
```

#### 1.4 Add Song Generation Tracking

**Location:** API route for song generation

**Action Required:**
Add tracking in `/api/generate-song`:
```typescript
trackCustomEvent('song_generation_started', {
  request_id: requestId,
  song_id: songId,
  timestamp: Date.now(),
});
```

#### 1.5 Add Song Completion Tracking

**Location:** Webhook handler or status update

**Action Required:**
Add tracking when song completes:
```typescript
trackCustomEvent('song_generation_completed', {
  song_id: songId,
  duration: generationDuration,
  timestamp: Date.now(),
});
```

### Phase 2: Add User Journey Tracking (Priority: MEDIUM)

#### 2.1 Track Occasion Page Clicks

**Files:** `src/app/occasions/page.tsx` and individual occasion pages

**Action Required:**
Add click tracking to occasion cards:
```typescript
onClick={() => {
  trackNavigationEvent.click(
    `Occasion: ${occasion.name}`,
    window.location.href,
    'occasion_card'
  );
}}
```

#### 2.2 Track Library Interactions

**File:** `src/app/library/page.tsx`

**Action Required:**
Add tracking for:
- Filter usage
- Search results clicks
- Song thumbnail clicks

#### 2.3 Track Form Abandonment

**File:** `src/app/page.tsx`

**Action Required:**
Track form field interactions and abandonment:
```typescript
// On form field blur
trackCustomEvent('form_field_interaction', {
  field_name: fieldName,
  field_value_length: value.length,
  form_stage: 'started',
});
```

### Phase 3: Set Up Goals and Conversions (Priority: MEDIUM)

#### 3.1 Configure GA4 Conversion Events

**In Google Analytics Dashboard:**
1. Go to **Admin** → **Goals**
2. Create custom goal for "Song Request Submitted"
3. Create custom goal for "Song Generated Successfully"
4. Create custom goal for "Contact Form Submitted"

#### 3.2 Implement Enhanced E-commerce (if applicable)

**Action Required:**
Add e-commerce tracking for:
- Song views (as product views)
- Premium feature purchases
- Subscription tracking

### Phase 4: Advanced Analytics (Priority: LOW)

#### 4.1 Set Up Event Parameters

**Action Required:**
Enhance existing events with more parameters:
- Add user demographics
- Add device type
- Add screen size
- Add session duration
- Add scroll depth

#### 4.2 Custom Dimensions

**Action Required:**
Set up custom dimensions in GA4:
- User type (new vs returning)
- Song category
- Generation method (demo vs real)
- Platform (web vs mobile)

#### 4.3 Audience Segments

**Action Required:**
Create audience segments:
- Frequent users
- One-time users
- Users by occasion type
- High-value users

---

## 📋 Quick Implementation Checklist

### Immediate Actions

- [ ] Update `getPageTitle()` function to include all route mappings
- [ ] Add form submission tracking to homepage
- [ ] Add lyrics generation tracking to API
- [ ] Add song generation tracking to API
- [ ] Add song completion tracking to webhook
- [ ] Test all tracking in production

### Short-term Actions (Next 2 weeks)

- [ ] Add occasion page click tracking
- [ ] Add library interaction tracking
- [ ] Add contact form submission tracking
- [ ] Configure GA4 conversion goals
- [ ] Set up custom dimensions

### Long-term Actions (Next month)

- [ ] Implement e-commerce tracking
- [ ] Create audience segments
- [ ] Set up automated reports
- [ ] Implement A/B testing framework
- [ ] Add heatmap tracking (use separate tool)

---

## 🔧 Configuration Instructions

### 1. Environment Variables

**Add to `.env.local`:**
```bash
# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TJW2DN7ND5

# Optional: Custom event debugging
NEXT_PUBLIC_ANALYTICS_DEBUG=true
```

### 2. Update Layout to Support Environment Variable

**Modify:** `src/app/layout.tsx`

```typescript
{/* Google tag (gtag.js) - Production only */}
{process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
  <>
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
    <Script id="google-analytics" strategy="afterInteractive">
      {`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
      `}
    </Script>
  </>
)}
```

### 3. Verify Google Analytics Setup

**In Google Analytics Dashboard:**

1. **Verify Data Collection:**
   - Go to Admin → Data Streams
   - Click on your property
   - Check "Enhanced measurement" is enabled

2. **Set Up Debug Mode (Development):**
   - Add parameter to config: `gtag('config', 'G-TJW2DN7ND5', { debug_mode: true });`
   - Use GA Debugger Chrome extension for testing

3. **Configure Audiences:**
   - Go to Admin → Audiences
   - Create custom audiences based on events

4. **Set Up Conversions:**
   - Go to Admin → Events
   - Mark important events as conversions:
     - `song_request_initiated`
     - `song_generation_completed`
     - `form_submit`

---

## 📊 Key Metrics to Monitor

### Essential Metrics

1. **User Acquisition**
   - New vs returning users
   - Traffic sources
   - Referral sites

2. **Engagement**
   - Session duration
   - Pages per session
   - Bounce rate

3. **Conversions**
   - Song request submissions
   - Successful song generations
   - Form completions

4. **Content Performance**
   - Most viewed pages
   - Popular occasions
   - Popular songs

5. **Technical Performance**
   - Page load times
   - Core Web Vitals
   - Error rates

### Custom Reports to Create

1. **User Journey Report**
   - Homepage → Form → Lyrics → Song Generation
   - Identify drop-off points

2. **Occasion Performance Report**
   - Most popular occasions
   - Conversion rates by occasion

3. **Song Engagement Report**
   - Most played songs
   - Average play duration
   - Most liked songs

4. **Generation Success Report**
   - Success rate of song generation
   - Average generation time
   - Error types and frequencies

---

## 🐛 Debugging and Testing

### Testing in Development

1. **Enable Debug Mode:**
```typescript
// Add to layout.tsx for development
gtag('config', 'G-TJW2DN7ND5', {
  debug_mode: true,
  send_page_view: true,
});
```

2. **Use GA Debugger:**
   - Install Chrome extension: "Google Analytics Debugger"
   - Enable it to see all events in console

3. **Test Events Manually:**
```typescript
// In browser console
window.gtag('event', 'test_event', {
  event_category: 'test',
  event_label: 'manual_test',
  value: 1
});
```

### Production Verification

1. **Real-time Reports:**
   - Go to Google Analytics → Realtime
   - Verify events are firing

2. **Event Tracking:**
   - Use GA4's Event Builder
   - Check "Events" section in reports

3. **Audience Building:**
   - Create test audiences
   - Verify they populate correctly

---

## 📈 Success Criteria

### Week 1
- [ ] All page views properly tracked
- [ ] Form submissions tracked
- [ ] Basic conversion goals configured

### Week 2
- [ ] User journey funnel established
- [ ] Library interactions tracked
- [ ] Occasion page clicks tracked

### Week 3
- [ ] Song generation tracked end-to-end
- [ ] Error tracking implemented
- [ ] Custom reports created

### Week 4
- [ ] Audience segments configured
- [ ] Automated reports set up
- [ ] Documentation updated

---

## 🔗 Additional Resources

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [gtag.js Reference](https://developers.google.com/analytics/devguides/collection/gtagjs)
- [GA4 Event Parameters](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Next.js Analytics Integration](https://nextjs.org/docs/app/building-your-application/optimizing/analytics)

---

## 📝 Notes

- Currently tracking is production-only (development disabled)
- Measurement ID: `G-TJW2DN7ND5`
- All tracking is client-side using gtag.js
- Page tracking is automatic via `PageTracking` component
- Event tracking is manual and component-specific
- Need to add server-side event tracking for API calls

## ⚠️ Privacy Considerations

- Ensure GDPR compliance for EU users
- Add cookie consent banner if needed
- Configure data retention settings in GA4
- Implement IP anonymization if required
- Consider user privacy preferences


