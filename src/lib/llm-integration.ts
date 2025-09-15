export interface LLMResponse {
  error: boolean;
  title?: string;
  styleOfMusic?: string;
  lyrics?: string;
  missingField?: string;
  message?: string;
  example?: string;
}

export interface SongFormData {
  recipient_name: string;
  languages: string[];
  additional_details: string;
}

export async function generateLyrics(formData: SongFormData): Promise<LLMResponse> {
  // Validate inputs first
  if (!formData || !formData.recipient_name || !formData.languages || formData.additional_details === undefined) {
    return {
      error: true,
      missingField: 'System',
      message: 'Invalid form data provided',
      example: 'Please check your connection and try again.'
    };
  }

  const prompt = `Create a song using ONLY these exact inputs. Do not add any extra descriptions or words.

CRITICAL: Return ONLY valid JSON. Never include instructional text, arrows (→), or formatting symbols in the actual lyrics.

🚨 NAME TRANSLITERATION RULE - MOST IMPORTANT 🚨
- The recipient name MUST appear EXACTLY as provided in the recipient_name field
- Use the name exactly as it appears - do not change, translate, or transliterate it
- NEVER convert names to different scripts or languages
- KEEP THE NAME EXACTLY AS PROVIDED IN THE FIELD
- This rule applies even if the song is in Hindi language

STRICT REQUIREMENTS:
- Use the EXACT name as provided in the recipient_name field - do not change it
- Use ONLY the exact language specified
- Use ONLY the exact style/genre mentioned in details
- Do NOT add extra descriptive words like "मधुर", "सुंदर", "अद्भुत" etc.
- Create song based ONLY on these 3 inputs - nothing else

VALIDATION:
- Recipient must include both name and relationship (e.g., "Varsha, my daughter")
- At least one valid language must be specified
- Song details must contain meaningful information about style, mood, or story

ERROR RESPONSE (if validation fails):
{
  "error": true,
  "missingField": "field name",
  "message": "what is missing",
  "example": "correct format example"
}

SUCCESS RESPONSE (if all valid):
{
  "error": false,
  "title": "Creative, meaningful song title",
  "styleOfMusic": "Detailed genre description with voice type and instrumentation",
  "lyrics": "Complete song with proper structure"
}

SONGWRITING GUIDELINES:
- Create a complete song with: Intro, Verse 1, Chorus, Verse 2, Chorus, Verse 3, Chorus, Bridge, Final Chorus, Outro
- 🚨 CRITICAL: Use the recipient's name EXACTLY as provided in the recipient_name field
- Do not change, translate, or transliterate the name in any way
- Use correct gender pronouns based on relationship
- Write in the specified language ONLY - if Hindi is specified, write in Hindi with Devanagari script BUT keep names exactly as provided
- Follow the exact style/genre mentioned in details
- Do NOT add extra descriptive words
- Keep it simple and direct based on the 3 inputs only

EXACT USER INPUTS TO USE:
Recipient Name & Relationship: ${formData.recipient_name}
Language(s): ${Array.isArray(formData.languages) ? formData.languages.join(', ') : formData.languages}
Specific Details & Style: ${formData.additional_details}

Create a song using ONLY these 3 inputs. Do not add extra words or descriptions.`;

  try {
    // Call Gemini API directly
    const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    const GEMINI_API_TOKEN = 'AIzaSyA86q8wbENrjMIB7Ufyqxgi9nZ20AKoObw';
    
    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_TOKEN}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API request failed with status: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      throw new Error('No generated text found in Gemini response');
    }
    
    // Clean up markdown formatting if present
    let cleanText = generatedText; 
    if (cleanText.includes('```json')) {
      cleanText = cleanText.replace(/```json\s*/, '').replace(/\s*```$/, '');
    }
    if (cleanText.includes('```')) {
      cleanText = cleanText.replace(/```\s*/, '').replace(/\s*```$/, '');
    }
    
    try {
      const result = JSON.parse(cleanText);
      return result;
    } catch (parseError) {
      // Try to extract JSON from the text if it's embedded
      const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (extractError) {
          throw new Error('Failed to parse JSON from Gemini response');
        }
      }
      throw new Error('No valid JSON found in Gemini response');
    }
  } catch (error) {
    console.error('Error generating lyrics:', error);
    return {
      error: true,
      missingField: 'System',
      message: 'Failed to generate lyrics. Please try again.',
      example: 'Please check your connection and try again.'
    };
  }
}

