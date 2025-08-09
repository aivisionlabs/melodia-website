# Switching Between Mock and Real Suno API

This application supports both mock and real Suno API implementations, making it easy to develop and test without using real API credits.

## Quick Switch Commands

### Switch to Real API
```bash
npm run switch-to-real-api
```

### Switch to Mock API
```bash
npm run switch-to-mock-api
```

## Configuration

The API switching is controlled by the `src/lib/config.ts` file:

```typescript
export const SUNO_CONFIG = {
  // Set to false to use real Suno API, true to use mock API
  USE_MOCK_API: process.env.NODE_ENV === 'development' ? true : false,

  // Real API configuration
  API_TOKEN: process.env.SUNO_API_TOKEN,
  BASE_URL: 'https://api.sunoapi.org/api/v1',

  // Mock API configuration
  MOCK_DELAYS: {
    TEXT_SUCCESS: 5000,    // 5 seconds
    FIRST_SUCCESS: 15000,  // 15 seconds
    SUCCESS: 25000,        // 25 seconds
  }
};
```

## Environment Variables

When using the real API, make sure to set:

```bash
# .env.local
SUNO_API_TOKEN=your_suno_api_token_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## How It Works

### Factory Pattern
The application uses a factory pattern to abstract the API implementation:

```typescript
// src/lib/suno-api.ts
export class SunoAPIFactory {
  static getAPI(): MockSunoAPI | SunoAPI {
    if (shouldUseMockAPI()) {
      return new MockSunoAPI();
    } else {
      return new SunoAPI(getAPIToken());
    }
  }
}
```

### Usage in Components
All components use the factory instead of directly importing specific implementations:

```typescript
// ✅ Good - uses factory
import sunoAPI from "@/lib/suno-api";

// ❌ Bad - hardcoded to specific implementation
import { mockSunoAPI } from "@/lib/suno-api";
```

## Mock API Features

The mock API provides realistic simulation:

- **Realistic Timing**: Simulates actual generation delays
- **Multiple Variants**: Generates 2 variants with different durations
- **Progress States**: Shows PENDING → TEXT_SUCCESS → FIRST_SUCCESS → SUCCESS
- **Error Simulation**: Can simulate various error conditions
- **Persistent Storage**: Uses localStorage to maintain state across page refreshes

## Real API Features

When using the real Suno API:

- **Actual Generation**: Creates real songs using Suno's AI
- **Real Variants**: Generates actual audio files
- **Webhook Support**: Handles real webhook callbacks
- **Error Handling**: Handles real API errors and rate limits

## Development Workflow

1. **Development**: Use mock API for faster iteration
2. **Testing**: Use mock API to test error scenarios
3. **Production**: Use real API for actual song generation
4. **Staging**: Use real API with test credentials

## Troubleshooting

### "Task not found" Error
This usually means the mock API state was cleared. Use the "Clear Mock Data" button in the admin portal to reset.

### API Token Error
Make sure `SUNO_API_TOKEN` is set in your environment variables when using the real API.

### Module Import Errors
If you see Node.js module import errors, make sure you're using the factory pattern and not importing database services directly in client components.