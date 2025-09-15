# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://postgres:melodia2024@localhost:5432/melodia"

# Razorpay Configuration
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_KEY_SECRET=your_razorpay_key_secret_here
RAZORPAY_WEBHOOK_SECRET=your_razorpay_webhook_secret_here

# Payment Configuration
PAYMENT_CURRENCY=INR
PAYMENT_DESCRIPTION=Melodia Song Generation
REQUIRE_PAYMENT=true

# Webhook Configuration
RAZORPAY_WEBHOOK_URL=https://your-domain.com/api/webhooks/razorpay

# Base URL for callbacks
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Gemini API Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Suno API Configuration
SUNO_API_KEY=your_suno_api_key_here
SUNO_BASE_URL=https://api.suno.ai

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

## How to Get Razorpay Keys

1. **Sign up for Razorpay Account**: Go to [https://razorpay.com](https://razorpay.com)
2. **Get API Keys**: 
   - Go to Dashboard → Settings → API Keys
   - Generate new API keys
   - Copy the Key ID and Key Secret
3. **Set up Webhook**:
   - Go to Dashboard → Settings → Webhooks
   - Add webhook URL: `https://your-domain.com/api/webhooks/razorpay`
   - Select events: `payment.captured`, `payment.failed`, `refund.processed`
   - Copy the webhook secret

## How to Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new API key
3. Copy the key and add it to your environment variables

## How to Get Suno API Key

1. Go to [Suno AI](https://suno.ai)
2. Sign up and get your API key
3. Add it to your environment variables

## Important Notes

- **Never commit `.env.local` to version control**
- **Use different keys for development and production**
- **Keep your keys secure and don't share them**
- **For production, use environment variables from your hosting platform**

## Testing the Setup

After setting up the environment variables:

1. Restart your development server: `npm run dev`
2. Check the console for any missing environment variable errors
3. Test the payment flow with Razorpay test mode
4. Verify webhook endpoints are accessible

## Production Deployment

For production deployment, make sure to:

1. Set all environment variables in your hosting platform
2. Update `NEXT_PUBLIC_BASE_URL` to your production domain
3. Update `RAZORPAY_WEBHOOK_URL` to your production webhook URL
4. Use production Razorpay keys (not test keys)
5. Enable webhook signature verification in production