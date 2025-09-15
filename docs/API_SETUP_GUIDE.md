# API Setup Guide for Phase 6

## Google Gemini API Setup

### 1. Get Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure Environment Variables

Add your API key to your `.env.local` file:

```bash
# Add this line to your .env.local file
GEMINI_API_TOKEN=your_actual_api_key_here
```

### 3. Test the API

Run the test script to verify your API key works:

```bash
node scripts/test-lyrics-api.mjs
```

You should see output like:
```
🧪 Testing Lyrics Generation API...
📤 Sending request to Gemini API...
✅ API Response received successfully!
🎵 Generated Lyrics:
[Verse 1]
...
🎉 All tests passed! Lyrics generation is working correctly.
```

### 4. Fallback Mode

If you don't have an API key or it's invalid, the system will automatically use fallback lyrics generation. This provides:

- Contextual lyrics based on user input
- Proper song structure with verses and choruses
- Personalization based on recipient and tone
- Multiple tone variations (Fun, Romantic, etc.)

### 5. API Usage Limits

- **Free Tier**: 15 requests per minute
- **Paid Tier**: Higher limits available
- **Cost**: Free for most use cases

### 6. Troubleshooting

#### 401 Unauthorized Error
- Check that your API key is correct
- Ensure the API key is properly set in `.env.local`
- Verify the API key hasn't expired

#### 429 Rate Limit Error
- Wait a minute and try again
- Consider upgrading to paid tier for higher limits

#### API Not Responding
- Check your internet connection
- Verify the API service is available
- The system will automatically fall back to local generation

### 7. Security Notes

- Never commit your API key to version control
- Use environment variables for all API keys
- Rotate your API keys regularly
- Monitor your API usage

## Alternative: Local Lyrics Generation

If you prefer not to use the Google API, the system includes a sophisticated fallback system that:

- Generates contextual lyrics based on user input
- Maintains proper song structure
- Provides multiple tone variations
- Personalizes content for the recipient

The fallback system is automatically used when:
- No API key is configured
- API key is invalid
- API service is unavailable
- Rate limits are exceeded

This ensures the Phase 6 workflow always works, even without external API access.
