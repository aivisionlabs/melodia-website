// Configuration for APIs
export const SUNO_CONFIG = {
  // Set to false to use real Suno API, true to use mock API
  USE_MOCK_API: false, // Use real Suno API

  // Real API configuration
  API_TOKEN: process.env.SUNO_API_TOKEN,
  BASE_URL: 'https://api.sunoapi.org/api/v1',

  // Mock API configuration
  MOCK_DELAYS: {
    STREAM_AVAILABLE: 5,    // 5 seconds - first variant ready for streaming
    COMPLETE: 15,           // 15 seconds - all variants ready for download
  }
};


// Helper function to check if we should use mock API
export function shouldUseMockAPI(): boolean {
  return process.env.DEMO_MODE === 'true';
}

// Helper function to get API token
export function getAPIToken(): string {
  if (!SUNO_CONFIG.API_TOKEN) {
    throw new Error('SUNO_API_TOKEN environment variable is required');
  }
  return SUNO_CONFIG.API_TOKEN;
}
