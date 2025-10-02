import { z } from 'zod';
import { VertexAI, GenerateContentRequest, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';
import { CredentialsManager } from '../ai/credentials-manager';

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

async function generateWithVertexAI(
  vertexAI: VertexAI,
  systemPrompt: string,
  userPrompt: string,
  temperature: number,
  maxOutputTokens: number,
  useJsonMode: boolean = true
): Promise<string> {
  const modelName = process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.0-flash-001';
  const generativeModel = vertexAI.getGenerativeModel({
    model: modelName,
    safetySettings: [
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
    ],
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
          { text: systemPrompt + '\n\n' + userPrompt }
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

export async function generateLyrics(formData: SongFormData): Promise<LLMResponse> {
  // Validate inputs first
  if (!formData || !formData.recipientDetails || !formData.languages || formData.languages.trim().length === 0) {
    throw new Error("Required details not found to produce lyrics");
  }

  const systemPrompt = `You are an expert songs producer writer who can produce songs in various music styles and in multiple languages, your job is to create a personalised song's
  Lyrics, Title and Style of Music for the given requirements.

Make sure all the lyrics you produce have correct meaning and they rhyme well and they convey the feel which user wants to create from the song.

For produced lyrics avoid creating translation of the lyrics.
In lyrics we should have not have numbers as part of lyrics, if there are case where we need to mention number write the number spelling in English.
For Style of Music, think about the kind of voice might be best suited for the song production along with the sound description based on the user input requirements.

When you produce a song think about the relationship mentioned between people and draft lyrics and music style accordingly.

If only if the time of the song is mentioned in the user input then consider reviewing and thinking which part of the song's structure can be shortened or removed?

IMPORTANT: The song style that you produce should not include the name of any singer.

CRITICAL: NEVER repeat the same word, phrase, or pattern more than 2 times in the title or musicStyle fields. If you find yourself repeating, STOP immediately.

STRICT OUTPUT RULES:
- Output ONLY a single JSON object. No markdown, no code fences, no commentary, no extra text.
- Do not include keys other than title, musicStyle, lyrics.
- If you need line breaks, use \\n inside JSON strings.
- Do not use any emojis or emoticons in the output text
- Do not use excessive punctuation like !!..??.. or repetitive symbols

STRICT FORMAT CONSTRAINTS:
- The title must be EXACTLY between 3 to 7 words. No more, no less.
- The musicStyle must be EXACTLY 2 to 3 short paragraphs. No repetition allowed.
- Do NOT repeat any phrase, name, or pattern more than twice.
- If a name appears in the title, use it ONLY ONCE.

LYRICS STRUCTURE RULES:
- Use explicit section labels in brackets exactly as lines by themselves.
- Start with a line like: (Music: brief intro mood/instrumentation)
- Then use sections like: (Verse 1), (Chorus), (Verse 2), (Bridge), (Outro)
- If there is an instrumental or melody, include it in brackets, e.g.: (Guitar Solo - soft and romantic)
- Place the actual lyric lines immediately after each bracketed section label.
- Keep labels and content clean and machine-parseable.

Example (format only, not content):
(Music: Starts with a soft, acoustic guitar melody)

(Verse 1 / Mukhda)
Line 1\\nLine 2

(Chorus)
Line 1\\nLine 2

(Bridge)
Line 1\\nLine 2

(Guitar Solo - soft and romantic)

(Outro)

NOTE: This JSON will be sent to a music generation service provider (e.g., Suno API) to create the song. Keep the lyrics strictly in the format above so they are easy to parse.

The output should be in the following JSON format:

{
  "title": "<a short title of the song, must be less than 8 words>",
  "musicStyle": "<description of the music style in 2-3 paragraphs>",
  "lyrics": "<Songs Lyrics>"
}`;

  const userPrompt = `Provided input for the song is following:
Language: ${formData.languages}
RecipientDetails: ${formData.recipientDetails}
SongDetailsAndStory: ${formData.songStory}
${formData.occassion ? `Occasion: ${formData.occassion}` : ''}
Mood: ${Array.isArray(formData.mood) ? formData.mood.join(', ') : formData.mood}`;

  try {
    const vertexAI = initializeVertexAI();

    // First attempt: JSON mode with higher temperature
    try {
      console.log('🎵 Attempting lyrics generation with JSON mode (temperature: 0.7)');
      const responseText = await generateWithVertexAI(vertexAI, systemPrompt, userPrompt, 0.7, 4000, true);

      const sanitized = sanitizeJsonString(responseText);
      const parsed = JSON.parse(sanitized);
      const validated = LLMResponseSchema.parse(parsed);
      validateOutput(validated);

      console.log("✅ OUTPUT (Attempt 1):", JSON.stringify(validated, null, 2));
      return validated;
    } catch (firstError) {
      console.warn('⚠️ First attempt failed, retrying with lower temperature:', firstError);

      // Second attempt: JSON mode with lower temperature
      try {
        console.log('🎵 Attempting lyrics generation with JSON mode (temperature: 0.3)');
        const responseText = await generateWithVertexAI(vertexAI, systemPrompt, userPrompt, 0.3, 4000, true);

        const sanitized = sanitizeJsonString(responseText);
        const parsed = JSON.parse(sanitized);
        const validated = LLMResponseSchema.parse(parsed);
        validateOutput(validated);

        console.log("✅ OUTPUT (Attempt 2):", JSON.stringify(validated, null, 2));
        return validated;
      } catch (secondError) {
        console.warn('⚠️ Second attempt failed, falling back to text mode + manual parse:', secondError);

        // Third attempt: Text mode with manual JSON extraction
        const enhancedPrompt = systemPrompt + '\n\nRemember: Output ONLY a single JSON object with keys: title, musicStyle, lyrics. No extra text, no markdown formatting.';
        const responseText = await generateWithVertexAI(vertexAI, enhancedPrompt, userPrompt, 0.3, 4000, false);

        console.log("📝 Raw text response:", responseText.substring(0, 200) + "...");

        // Sanitize and extract JSON from response
        const sanitized = sanitizeJsonString(responseText);
        const jsonMatch = sanitized.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in model output');
        }

        const parsed = JSON.parse(jsonMatch[0]);
        const validated = LLMResponseSchema.parse(parsed);
        validateOutput(validated);

        console.log("✅ OUTPUT (Attempt 3):", JSON.stringify(validated, null, 2));
        return validated;
      }
    }
  } catch (error) {
    console.error('❌ Error generating lyrics:', error);
    throw new Error("Error producing lyrics");
  }
}

