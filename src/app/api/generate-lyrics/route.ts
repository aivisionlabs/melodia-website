import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';
import { generateLyrics } from '@/lib/llm-integration';

const GEMINI_API_URL = config.GEMINI_API_URL;
const GEMINI_API_TOKEN = config.GEMINI_API_TOKEN;

// Fallback lyrics generation functions
function generateHindiLyrics(name: string, relation: string, details: string): string {
  const templates = [
    `Verse 1:
${name}, तेरे लिए ये गीत लिखा है
दिल से निकल कर जो भी कहना था
तेरे बिना जीना मुश्किल है
तेरे साथ जीना आसान है

Chorus:
${name}, ${name}
मैं जीता हूं, मैं मरता हूं
${name}, ${name}
दिल से मैंने ये गीत गाया

Verse 2:
तेरी आंखों में मैंने देखा है
अपना चेहरा जो छुपा था
तेरे साथ चलना चाहता हूं
हर पल, हर लम्हा

Chorus:
${name}, ${name}
मैं जीता हूं, मैं मरता हूं
${name}, ${name}
दिल से मैंने ये गीत गाया`,

    `Verse 1:
${name} मेरे ${relation}, तू है मेरी जान
हर दिन तेरे साथ बिताना है
तेरी मुस्कान मेरी खुशी
तेरा दुख मेरा दुख है

Chorus:
${name} मेरे ${relation}
तू है मेरी दुनिया
${name} मेरे ${relation}
तू है मेरी हर खुशी

Verse 2:
जब भी तू मुस्कुराता है
मेरा दिल खुश हो जाता है
तेरे साथ हर पल अच्छा लगता है
ये रिश्ता निभाना है

Chorus:
${name} मेरे ${relation}
तू है मेरी दुनिया
${name} मेरे ${relation}
तू है मेरी हर खुशी`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

function generateEnglishLyrics(name: string, relation: string, details: string): string {
  const templates = [
    `Verse 1:
${name}, this song is for you
From my heart, everything that's true
Without you, life is hard to bear
With you, everything's so fair

Chorus:
${name}, ${name}
You're my joy, you're my pain
${name}, ${name}
I'll sing this song again

Verse 2:
In your eyes, I see my reflection
Your love gives me direction
Walking with you every day
Is the only way

Chorus:
${name}, ${name}
You're my joy, you're my pain
${name}, ${name}
I'll sing this song again`,

    `Verse 1:
${name} my ${relation}, you light up my world
Your smile makes my heart unfurled
Every moment with you is pure gold
Your story will always be told

Chorus:
${name} my ${relation}
You're my shining star
${name} my ${relation}
No matter where you are

Verse 2:
Through the laughter and the tears
You've been with me all these years
Your love is my greatest treasure
Beyond any measure

Chorus:
${name} my ${relation}
You're my shining star
${name} my ${relation}
No matter where you are`
  ];
  
  return templates[Math.floor(Math.random() * templates.length)];
}

export async function POST(request: NextRequest) {
  try {
    const { recipient_name, languages, additional_details } = await request.json();

    // Use the generateLyrics function from llm-integration
    console.log('Using generateLyrics function with inputs:', { recipient_name, languages, additional_details });
    
    const generatedResponse = await generateLyrics({
      recipient_name,
      languages,
      additional_details
    });
    
    console.log('Generated response:', generatedResponse);
    
    return NextResponse.json(generatedResponse);
  } catch (error) {
    console.error('Error in generate-lyrics API:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      {
        error: true,
        missingField: 'System',
        message: 'Failed to generate lyrics. Please try again.',
        example: 'Please check your connection and try again.'
      },
      { status: 500 }
    );
  }
}
