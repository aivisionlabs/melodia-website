import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { createVertex } from '@ai-sdk/google-vertex';
import { CredentialsManager } from './services/ai/credentials-manager';

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

function initializeVertexProvider() {
  const project = process.env.GOOGLE_CLOUD_PROJECT_ID;
  const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

  if (!project) {
    throw new Error('GOOGLE_CLOUD_PROJECT_ID environment variable is required');
  }

  const creds = CredentialsManager.getGCSCredentialsFromEnv();

  // Configure the Vertex provider with explicit project & location
  return createVertex({
    project, location, googleAuthOptions: {
      credentials: {
        client_email: creds?.client_email,
        private_key: creds?.private_key ? creds.private_key.replace(/\\n/g, '\n') : undefined,
      }
    }
  });
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

STRICT OUTPUT RULES:
- Output ONLY a single JSON object. No markdown, no code fences, no commentary, no extra text.
- Do not include keys other than title, musicStyle, lyrics.
- If you need line breaks, use \n inside JSON strings.
- Do not use any emojis or emoticons in the output text

STRICT FORMAT CONSTRAINTS:
- The title must be less than 8 words (maximum 7 words).
- The musicStyle must be less than 3 paragraphs (maximum 2 short paragraphs).
- Avoid repeating phrases or sentences.

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
Line 1\nLine 2

(Chorus)
Line 1\nLine 2

(Bridge)
Line 1\nLine 2

(Guitar Solo - soft and romantic)

(Outro)

NOTE: This JSON will be sent to a music generation service provider (e.g., Suno API) to create the song. Keep the lyrics strictly in the format above so they are easy to parse.

The output should be in the following JSON format:

{
  "title": "<a short title of the song, must be less than 8 words>",
  "musicStyle": "<description of the music style in less than 3 paragraphs>",
  "lyrics": "<Songs Lyrics>"
}`;

  const userPrompt = `Provided input for the song is following:
Language: ${formData.languages}
RecipientDetails: ${formData.recipientDetails}
SongDetailsAndStory: ${formData.songStory}
${formData.occassion ? `Occasion: ${formData.occassion}` : ''}
Mood: ${Array.isArray(formData.mood) ? formData.mood.join(', ') : formData.mood}`;

  try {
    const vertexProvider = initializeVertexProvider();
    const vertexModel = process.env.GOOGLE_VERTEX_MODEL || 'gemini-2.5-pro';
    // Prefer a stable generally-available model; adjust if you require another
    const model = vertexProvider(vertexModel);

    try {
      const { object } = await generateObject({
        model,
        schema: LLMResponseSchema,
        schemaName: 'SongOutput',
        schemaDescription: 'Structured output for personalised song generation',
        system: systemPrompt,
        prompt: userPrompt,
        mode: 'json',
        temperature: 0.8,
        maxOutputTokens: 8192,
        presencePenalty: 0.5,
        frequencyPenalty: 0.5,
      });
      return object;
    } catch (firstError) {
      console.warn('First structured attempt failed, retrying with lower temperature:', firstError);
      try {
        const { object } = await generateObject({
          model,
          schema: LLMResponseSchema,
          schemaName: 'SongOutput',
          schemaDescription: 'Structured output for personalised song generation',
          system: systemPrompt,
          prompt: userPrompt,
          mode: 'json',
          temperature: 0.3,
          maxOutputTokens: 8192,
          presencePenalty: 0.5,
          frequencyPenalty: 0.5,
        });
        return object;
      } catch (secondError) {
        console.warn('Second structured attempt failed, falling back to text + parse:', secondError);
        const { text } = await generateText({
          model,
          system: systemPrompt + '\n\nRemember: Output ONLY a single JSON object with keys: title, musicStyle, lyrics. No extra text.',
          prompt: userPrompt,
          temperature: 0.3,
          maxOutputTokens: 8192,
          presencePenalty: 0.5,
          frequencyPenalty: 0.5,
        });

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in model output');
        }
        const parsed = JSON.parse(jsonMatch[0]);
        const validated = LLMResponseSchema.parse(parsed);
        return validated;
      }
    }
  } catch (error) {
    console.error('Error generating lyrics:', error);
    throw new Error("Error producing lyrics");
  }
}

