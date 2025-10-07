# Google Search Console Integration Guide

This guide will help you set up Google Search Console to track your website's SEO performance.

## Prerequisites

1. A Google account
2. Access to your website's DNS or HTML files
3. Your website must be live and accessible

## Step 1: Set Up Google Search Console

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Start now" and sign in with your Google account
3. Add your property:
   - Enter your website URL: `https://melodia-songs.com`
   - Choose "Domain" property type (recommended) or "URL prefix"
   - Click "Continue"

## Step 2: Verify Ownership

### Option A: HTML Tag (Recommended)
1. In Search Console, go to "Settings" > "Ownership verification"
2. Copy the HTML tag provided (looks like: `<meta name="google-site-verification" content="...">`)
3. Create a `.env.local` file in your project root:
   ```bash
   GOOGLE_SEARCH_CONSOLE_VERIFICATION=your-verification-code-here
   ```
4. Replace `your-verification-code-here` with the verification code from the HTML tag
5. Deploy your website
6. Click "Verify" in Search Console

### Option B: DNS Record
1. In Search Console, choose "DNS record" verification method
2. Add the provided TXT record to your domain's DNS settings
3. Wait for DNS propagation (can take up to 24 hours)
4. Click "Verify" in Search Console

## Step 3: Submit Sitemap

1. In Search Console, go to "Sitemaps"
2. Add your sitemap URL: `https://melodia-songs.com/sitemap.xml`
3. Click "Submit"

## Step 4: Monitor Performance

### Key Metrics to Track:
- **Search Performance**: Clicks, impressions, CTR, average position
- **Index Coverage**: Pages indexed vs. not indexed
- **Core Web Vitals**: Loading performance, interactivity, visual stability
- **Mobile Usability**: Mobile-friendly issues
- **Security & Manual Actions**: Any penalties or security issues

### Regular Tasks:
1. **Weekly**: Check for new search queries and performance changes
2. **Monthly**: Review Core Web Vitals and mobile usability
3. **Quarterly**: Analyze search performance trends and optimize content

## Step 5: Additional SEO Features

### URL Inspection
- Use this tool to check how Google sees specific pages
- Request indexing for new or updated pages
- Debug indexing issues

### Performance Reports
- Monitor which queries bring traffic
- Identify opportunities for content optimization
- Track ranking improvements

### Core Web Vitals
- Monitor LCP (Largest Contentful Paint)
- Track FID (First Input Delay)
- Watch CLS (Cumulative Layout Shift)

## Troubleshooting

### Common Issues:
1. **Verification Failed**: Double-check the verification code and ensure it's properly deployed
2. **Sitemap Errors**: Verify your sitemap is accessible and properly formatted
3. **No Data**: It can take several days for data to appear after verification

### Getting Help:
- [Google Search Console Help Center](https://support.google.com/webmasters/)
- [Search Console Community](https://support.google.com/webmasters/community)

## Advanced Features

### Enhanced Reporting
Consider setting up Google Analytics 4 alongside Search Console for enhanced reporting:
1. Create a GA4 property
2. Link it to Search Console
3. Get more detailed user behavior data

### Search Console API
For advanced users, you can use the Search Console API to:
- Automate reporting
- Build custom dashboards
- Integrate with other tools

## Files Modified in This Project

- `src/app/layout.tsx`: Added Google verification meta tag and Google Analytics (G-TJW2DN7ND5)
- `src/app/sitemap.ts`: Dynamic sitemap generation
- `src/app/robots.ts`: Dynamic robots.txt generation
- `src/components/StructuredData.tsx`: JSON-LD structured data
- `src/components/GoogleAnalytics.tsx`: Google Analytics component (available for future use)
- `src/app/song/[songId]/page.tsx`: Added song-specific structured data

## Environment Variables

Add to your `.env.local` file:
```bash
# Google Search Console
GOOGLE_SEARCH_CONSOLE_VERIFICATION=your-verification-code-here

# Google Analytics (optional - currently hardcoded in layout.tsx)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TJW2DN7ND5
```

## Next Steps

1. Set up Google Analytics 4 for enhanced tracking
2. Implement Core Web Vitals monitoring
3. Set up automated reporting
4. Create content optimization strategies based on search data