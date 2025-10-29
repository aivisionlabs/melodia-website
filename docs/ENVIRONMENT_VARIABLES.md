# Environment Variables Documentation

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Database
```env
DATABASE_URL=postgresql://user:password@localhost:5432/melodia
```

Note: Use only `DATABASE_URL`. `POSTGRES_URL` is not used by this project.

### NextAuth.js Authentication
```env
# Generate a secret: openssl rand -base64 32
NEXTAUTH_SECRET=your-super-secret-key-minimum-32-characters-long
NEXTAUTH_URL=http://localhost:3000
```

### Google OAuth
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Razorpay Payment Integration
```env
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Suno API (Music Generation)
```env
SUNO_API_URL=https://api.suno.ai
SUNO_API_KEY=your-suno-api-key
```

### Google Cloud Vertex AI (Lyrics Generation)
```env
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_REGION=us-central1
GOOGLE_CLOUD_VERTEX_AI_MODEL=gemini-pro
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
```

### Upstash Redis (Rate Limiting)
```env
UPSTASH_REDIS_REST_URL=https://your-redis-url.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token
```

### Email Service (Resend)
```env
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=noreply@melodia.com
```

### Demo Mode (Development)
```env
# Set to 'true' to use demo/mock data instead of real API calls
DEMO_MODE=true
```

### Node Environment
```env
NODE_ENV=development
```

## Important Notes

1. **Never commit .env.local to version control**
2. **NEXTAUTH_SECRET** must be minimum 32 characters
3. Use **demo mode** during development to avoid API costs
4. Update **NEXTAUTH_URL** to your production domain before deployment
5. All sensitive keys should be stored securely in production (e.g., Vercel Environment Variables)

