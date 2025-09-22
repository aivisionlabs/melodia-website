// Configuration for APIs
export const SUNO_CONFIG = {
  // Set to false to use real Suno API, true to use mock API
  USE_MOCK_API: false, // Use real Suno API

  // Real API configuration
  API_TOKEN: process.env.SUNO_API_TOKEN || '581c3b4d123449f16df7738f71d8090d',
  BASE_URL: 'https://api.sunoapi.org/api/v1',

  // Mock API configuration
  MOCK_DELAYS: {
    TEXT_SUCCESS: 5,    // 5 seconds
    FIRST_SUCCESS: 15,  // 15 seconds
    SUCCESS: 25,        // 25 seconds
  }
};

// Configuration for Gemini API (Lyrics Generation)
export const GEMINI_CONFIG = {
  API_TOKEN: 'AIzaSyA86q8wbENrjMIB7Ufyqxgi9nZ20AKoObw',
  API_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
  GENERATION_CONFIG: {
    temperature: 0.8,
    topK: 40,
    topP: 0.95,
    maxOutputTokens: 8192,
  }
};

// Export config object for lyrics generation
export const config = {
  GEMINI_API_TOKEN: GEMINI_CONFIG.API_TOKEN,
  GEMINI_API_URL: GEMINI_CONFIG.API_URL,
  LYRICS_GENERATION: GEMINI_CONFIG.GENERATION_CONFIG,
  AUTOSAVE: {
    delay: 3000
  }
};

// Helper function to check if we should use mock API
export function shouldUseMockAPI(): boolean {
  return SUNO_CONFIG.USE_MOCK_API;
}

// Helper function to get API token
export function getAPIToken(): string {
  if (!SUNO_CONFIG.API_TOKEN) {
    throw new Error('SUNO_API_TOKEN environment variable is required');
  }
  return SUNO_CONFIG.API_TOKEN;
}
