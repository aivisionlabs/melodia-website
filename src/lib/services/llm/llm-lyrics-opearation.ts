import { z } from 'zod';
import { VertexAI, GenerateContentRequest, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { CredentialsManager } from '../ai/credentials-manager';
import { DBSongRequest } from '@/types/song-request';
import { buildGenerationPrompt, buildGenerationUserPrompt, buildRefinementPrompt, buildRefinementUserPrompt } from './prompts/lyrics-opeation-prompt-builder';

const LLMResponseSchema = z.object({
  title: z.string().optional(),
  musicStyle: z.string().optional(),
  lyrics: z.string().optional(),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

export interface SongFormData {
  languages: string;
  recipientDetails: string;
  songStory: string;
  occassion?: string;
  mood: string[] | string;
  requesterName?: string;
}

export interface RefinementRequest {
  currentLyrics: string;
  refineText: string;
  songRequest: DBSongRequest;
}

// Configuration for LLM parameters
const LLM_CONFIG = {
  modelName: process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.5-flash',
  generation: {
    temperature_attempt1: 0.7,
    temperature_attempt2: 0.3,
    maxOutputTokens: 4000,
  },
  refinement: {
    temperature: 0.7,
    maxOutputTokens: 4000,
  },
};

function sanitizeJsonString(jsonString: string): string {
  // Remove any potential BOM or leading/trailing whitespace
  let cleaned = jsonString.trim();

  // If the string is wrapped in markdown code blocks, remove them
  cleaned = cleaned.replace(/^```json?\s*/i, '').replace(/```\s*$/, '');

  // First try: return as-is if it's already valid JSON
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue to sanitization
  }

  // Extract JSON object if embedded in other text
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  // Second try: after extracting JSON
  try {
    JSON.parse(cleaned);
    return cleaned;
  } catch {
    // Continue to more aggressive sanitization
  }

  // Aggressive sanitization: Replace control characters
  // This handles the case where the model outputs actual newlines/tabs instead of \n \t
  const sanitized = cleaned;

  // Process character by character, escaping control chars inside strings
  let inString = false;
  let currentPart = '';
  let escaped = false;

  for (let i = 0; i < sanitized.length; i++) {
    const char = sanitized[i];

    if (char === '\\' && !escaped) {
      escaped = true;
      currentPart += char;
      continue;
    }

    if (char === '"' && !escaped) {
      inString = !inString;
      currentPart += char;
    } else if (inString && !escaped) {
      // Inside a string, escape control characters
      switch (char) {
        case '\n':
          currentPart += '\\n';
          break;
        case '\r':
          currentPart += '\\r';
          break;
        case '\t':
          currentPart += '\\t';
          break;
        case '\f':
          currentPart += '\\f';
          break;
        case '\b':
          currentPart += '\\b';
          break;
        default:
          // Check for other control characters (ASCII 0-31)
          if (char.charCodeAt(0) < 32) {
            currentPart += `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
          } else {
            currentPart += char;
          }
      }
    } else {
      currentPart += char;
    }

    escaped = false;
  }

  return currentPart;
}

function validateOutput(output: LLMResponse): void {
  // Check for repetitive patterns that indicate gibberish

  if (output.title) {
    const words = output.title.trim().split(/\s+/);
    if (words.length > 8) {
      throw new Error('Title exceeds maximum word count of 8 words');
    }



    // Check if title is abnormally long (> 200 chars is definitely wrong)
    if (output.title.length > 200) {
      throw new Error('Title is abnormally long, likely gibberish');
    }
  }

  if (output.musicStyle) {

    // Check if music style is abnormally long (> 2000 chars is definitely wrong)
    if (output.musicStyle.length > 2000) {
      throw new Error('Music style is abnormally long, likely gibberish');
    }
  }
}

// Common Vertex AI initialization
function initializeVertexAI() {
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
  }

  const creds = CredentialsManager.getGCSCredentialsFromEnv();

  // Initialize Vertex AI with credentials
  const vertexAI = new VertexAI({
    project,
    location,
    googleAuthOptions: {
      credentials: {
        client_email: creds?.client_email,
        private_key: creds?.private_key ? creds.private_key.replace(/\\n/g, '\n') : undefined,
      }
    }
  });

  return vertexAI;
}

// Common safety settings for all Vertex AI requests
function getSafetySettings() {
  return [
    {
      category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
    {
      category: HarmCategory.HARM_CATEGORY_HARASSMENT,
      threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
    },
  ];
}

// Common function for generating content with Vertex AI
async function generateWithVertexAI(
  vertexAI: VertexAI,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxOutputTokens: number,
  useJsonMode: boolean = true
): Promise<string> {
  const modelName = LLM_CONFIG.modelName;
  const generativeModel = vertexAI.getGenerativeModel({
    model: modelName,
    safetySettings: getSafetySettings(),
    generationConfig: {
      temperature,
      maxOutputTokens,
      topP: temperature > 0.5 ? 0.95 : 0.9,
      ...(useJsonMode ? { responseMimeType: 'application/json' } : {}),
    },
  });

  const request: GenerateContentRequest = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemPrompt}\n\n${userPrompt}` }
        ]
      }
    ],
  };

  const result = await generativeModel.generateContent(request);
  const response = result.response;

  if (!response.candidates || response.candidates.length === 0) {
    throw new Error('No response candidates returned from model');
  }

  const candidate = response.candidates[0];
  if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
    throw new Error('No content parts in response');
  }

  const text = candidate.content.parts[0].text;
  if (!text) {
    throw new Error('No text in response');
  }

  return text;
}

// Helper to attempt lyrics generation with given parameters and handle parsing/validation
async function _attemptGenerateLyrics(
  vertexAI: VertexAI,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxOutputTokens: number,
  useJsonMode: boolean,
  attemptName: string
): Promise<LLMResponse> {
  console.log(`🎵 Attempting lyrics generation with ${attemptName} (temperature: ${temperature})`);
  const responseText = await generateWithVertexAI(
    vertexAI,
    systemPrompt,
    userPrompt,
    temperature,
    maxOutputTokens,
    useJsonMode
  );

  const sanitized = sanitizeJsonString(responseText);
  const parsed = JSON.parse(sanitized);
  const validated = LLMResponseSchema.parse(parsed);
  validateOutput(validated);

  console.log(`✅ OUTPUT (${attemptName}):`, JSON.stringify(validated, null, 2));
  return validated;
}

export async function generateLyrics(formData: SongFormData): Promise<LLMResponse> {
  // Validate inputs first
  if (!formData || !formData.recipientDetails || !formData.languages || formData.languages.trim().length === 0) {
    throw new Error("Required details not found to produce lyrics");
  }

  const systemPrompt = buildGenerationPrompt();
  const userPrompt = buildGenerationUserPrompt(formData);

  try {
    const vertexAI = initializeVertexAI();

    // First attempt: JSON mode with higher temperature
    try {
      return await _attemptGenerateLyrics(vertexAI, systemPrompt, userPrompt, LLM_CONFIG.generation.temperature_attempt1, LLM_CONFIG.generation.maxOutputTokens, true, 'Attempt 1');
    } catch (firstError) {
      console.warn('⚠️ First attempt failed, retrying with lower temperature:', firstError);

      // Second attempt: JSON mode with lower temperature
      try {
        return await _attemptGenerateLyrics(vertexAI, systemPrompt, userPrompt, LLM_CONFIG.generation.temperature_attempt2, LLM_CONFIG.generation.maxOutputTokens, true, 'Attempt 2');
      } catch (secondError) {
        console.warn('⚠️ Second attempt failed, falling back to text mode + manual parse:', secondError);
        throw secondError;
      }
    }
  } catch (error) {
    console.error('❌ Error generating lyrics:', error);
    throw new Error("Error producing lyrics");
  }
}

// Refine lyrics using Vertex AI
export async function refineLyrics(refinementRequest: RefinementRequest): Promise<string> {
  const { currentLyrics, refineText, songRequest } = refinementRequest;

  // Validate inputs
  if (!currentLyrics || !refineText || !songRequest) {
    throw new Error("Required refinement details not found");
  }

  const systemPrompt = buildRefinementPrompt();
  const userPrompt = buildRefinementUserPrompt(currentLyrics, refineText, songRequest);

  try {
    console.log('🎵 Attempting lyrics refinement with Vertex AI');
    const vertexAI = initializeVertexAI();
    // Use text mode for refinement (not JSON mode)
    const refinedText = await generateWithVertexAI(
      vertexAI,
      systemPrompt,
      userPrompt,
      LLM_CONFIG.refinement.temperature,
      LLM_CONFIG.refinement.maxOutputTokens,
      false
    );
    console.log("✅ Refined lyrics generated successfully");
    return refinedText.trim();
  } catch (error) {
    console.error('❌ Error refining lyrics:', error);
    throw new Error("Error refining lyrics");
  }
}
