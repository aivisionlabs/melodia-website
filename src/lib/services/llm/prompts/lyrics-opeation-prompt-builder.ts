import { DBSongRequest } from '@/types/song-request';
import { SongFormData } from '../llm-lyrics-opearation';

/**
 * Builds the system prompt for lyrics generation
 */
export function buildGenerationPrompt(): string {
  return `You are an expert songs producer writer who can produce songs in various music styles and in multiple languages, your job is to create a personalised song's
  Lyrics, Title and Style of Music for the given requirements.

Make sure all the lyrics you produce have correct meaning and they rhyme well and they convey the feel which user wants to create from the song.
Selection of the music instrument should also be thought of and mentioned in the music style.

For produced lyrics avoid creating translation of the lyrics.
For Style of Music, think about the kind of voice might be best suited for the song production along with the sound description based on the user input requirements.

When you produce a song think about the relationship mentioned between people and draft lyrics and music style accordingly.
Music Style should also contain the voice requirements for the song, Male Voice, Female Voice or Duet and characterstics of the voice should also be mentioned.
Length of Music Style music style must be less than 1000 characters.

If only if the time of the song is mentioned in the user input then consider reviewing and thinking which part of the song's structure can be shortened or removed?

IMPORTANT:
1. The song style that you produce should not include the name of any singer or music band.
2. The Lyrics text script should be in the language which is provided in the user input.
3. All the numbers mentioned(if any) should be written in English.


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

(Verse 1)
Line 1\\nLine 2

(Chorus)
Line 1\\nLine 2

(Bridge)
Line 1\\nLine 2

(Guitar Solo - soft and romantic)

(Outro)

NOTE: This JSON will be sent to a music generation service provider (e.g., Suno API) to create the song. Keep the lyrics strictly in the format above so they are easy to parse and understood well by SUNO.

The output should be in the following JSON format:

{
  "title": "<a short title of the song, must be less than 8 words>",
  "musicStyle": "<description of the music style in 2-3 paragraphs>",
  "lyrics": "<Songs Lyrics>"
}`;
}

/**
 * Builds the user prompt for lyrics generation
 */
export function buildGenerationUserPrompt(formData: SongFormData): string {
  return `Provided input for the song is following:
Language: ${formData.languages}
RecipientDetails: ${formData.recipientDetails}
SongDetailsAndStory: ${formData.songStory}
${formData.occassion ? `Occasion: ${formData.occassion}` : ''}
Mood: ${Array.isArray(formData.mood) ? formData.mood.join(', ') : formData.mood}`;
}

/**
 * Builds the system prompt for lyrics refinement
 */
export function buildRefinementPrompt(): string {
  return `Please improve and change the provided lyrics based on the user's feedback.

Instructions:
- Maintain all the context and personal details from the original song request
- Keep the emotional connection and personal touch from the previous version
- Only make the specific changes requested by the user
- If the user asks to "make it short" or "make it longer", adjust length while keeping all important details
- If the user asks to change names or details, update only those specific elements
- Preserve the overall theme and message from the song request

Please provide the refined lyrics that address the user's feedback while maintaining the complete context and personal connection.`;
}

/**
 * Builds the user prompt for lyrics refinement
 */
export function buildRefinementUserPrompt(currentLyrics: string, refineText: string, songRequest: DBSongRequest): string {
  return `Current Lyrics:
${currentLyrics}

User's Refinement Request:
${refineText}

Song Context:
Recipient: ${songRequest.recipient_details}
Song Style: Personal
Mood: ${songRequest.mood?.join(', ') || 'Not specified'}
Song Story: ${songRequest.song_story || 'None'}`;
}
