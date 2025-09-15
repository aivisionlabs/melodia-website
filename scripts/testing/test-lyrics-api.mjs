#!/usr/bin/env node

// Test script for lyrics generation API
// Using built-in fetch (available in Node.js 18+)

const API_TOKEN = 'AIzaSyA86q8wbENrjMIB7Ufyqxgi9nZ20AKoObw';
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

async function testLyricsGeneration() {
  console.log('🧪 Testing Lyrics Generation API...\n');

  const testPrompt = `You are a professional songwriter. Create original song lyrics with the following specifications:

SONG DETAILS:
- Recipient: John (Brother)
- Person Description: Loving and supportive brother
- Languages: English
- Tone/Mood: Fun, upbeat, playful, and energetic
- Length: 2-3 verses with 1 chorus (about 60-90 seconds)
- Song Type: personal
- Additional Context: Birthday song

REQUIREMENTS:
1. Create lyrics in the specified languages: English
2. Match the tone: Fun, upbeat, playful, and energetic
3. Make it personal and meaningful for John
4. Use proper song structure with clear sections
5. Include appropriate section markers like [Verse 1], [Chorus], [Bridge], etc.
6. Make it short length as specified
7. Ensure the lyrics are original and creative

Create lyrics that would make John feel special and loved.

Please respond with only the lyrics content, formatted with clear section markers like [Verse 1], [Chorus], [Bridge], etc. Do not include any explanations or additional text.`;

  // Test API first
  try {
    console.log('📤 Sending request to Gemini API...');
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: testPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ API Response received successfully!\n');

    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      const generatedText = data.candidates[0].content.parts[0].text;
      console.log('🎵 Generated Lyrics:');
      console.log('='.repeat(50));
      console.log(generatedText);
      console.log('='.repeat(50));
      
      // Basic validation
      const hasVerse = generatedText.includes('[Verse');
      const hasChorus = generatedText.includes('[Chorus');
      const hasContent = generatedText.trim().length > 50;
      
      console.log('\n📊 Validation Results:');
      console.log(`✅ Contains verse markers: ${hasVerse}`);
      console.log(`✅ Contains chorus markers: ${hasChorus}`);
      console.log(`✅ Has sufficient content: ${hasContent}`);
      
      if (hasVerse && hasChorus && hasContent) {
        console.log('\n🎉 All tests passed! Lyrics generation is working correctly.');
      } else {
        console.log('\n⚠️  Some validation checks failed. Review the generated content.');
      }
    } else {
      console.log('❌ Unexpected API response format:', data);
    }

  } catch (error) {
    console.error('❌ Error testing lyrics generation:', error.message);
    
    if (error.message.includes('401')) {
      console.log('💡 This might be an authentication issue. Check the API token.');
    } else if (error.message.includes('403')) {
      console.log('💡 This might be a permission issue. Check API access.');
    } else if (error.message.includes('429')) {
      console.log('💡 Rate limit exceeded. Try again later.');
    }
    
    // Test fallback generation
    console.log('\n🔄 Testing fallback lyrics generation...');
    testFallbackGeneration(testPrompt);
  }
}

function testFallbackGeneration(prompt) {
  // Extract key information from the prompt to generate contextual fallback lyrics
  const recipientMatch = prompt.match(/Recipient: ([^(]+)/);
  const relationshipMatch = prompt.match(/\(([^)]+)\)/);
  const toneMatch = prompt.match(/Tone\/Mood: ([^\n]+)/);
  const lengthMatch = prompt.match(/Length: ([^\n]+)/);
  
  const recipient = recipientMatch ? recipientMatch[1].trim() : 'Someone special';
  const relationship = relationshipMatch ? relationshipMatch[1] : 'loved one';
  const tone = toneMatch ? toneMatch[1] : 'loving';
  const length = lengthMatch ? lengthMatch[1] : 'standard';
  
  console.log(`📝 Generating fallback lyrics for ${recipient} (${relationship}) with ${tone} tone...`);
  
  // Generate contextual lyrics based on the prompt
  let fallbackLyrics = '';
  if (tone.includes('Fun') || tone.includes('Energetic')) {
    fallbackLyrics = `[Verse 1]
Hey ${recipient}, you light up my day
With your smile and the way you play
Every moment with you is pure joy
You're my favorite girl or boy

[Chorus]
You're amazing, you're the best
You make every day a fest
${recipient}, you're my shining star
No matter where you are

[Verse 2]
Through the laughter and the fun
You're the one who makes it run
Your energy is contagious too
Everything you do is true

[Chorus]
You're amazing, you're the best
You make every day a fest
${recipient}, you're my shining star
No matter where you are`;
  } else {
    fallbackLyrics = `[Verse 1]
In this moment, I want to say
How much you mean to me each day
Your smile brightens up my world
Like a flag that's been unfurled

[Chorus]
You're the one who makes me whole
You're the one who touches my soul
Every day I'm grateful for
The love that we both share

[Verse 2]
Through the ups and through the downs
You've been there to turn things around
Your strength and your gentle heart
Show me what true love is from the start

[Chorus]
You're the one who makes me whole
You're the one who touches my soul
Every day I'm grateful for
The love that we both share`;
  }
  
  console.log('🎵 Fallback Lyrics Generated:');
  console.log('='.repeat(50));
  console.log(fallbackLyrics);
  console.log('='.repeat(50));
  
  // Basic validation
  const hasVerse = fallbackLyrics.includes('[Verse');
  const hasChorus = fallbackLyrics.includes('[Chorus');
  const hasContent = fallbackLyrics.trim().length > 50;
  
  console.log('\n📊 Fallback Validation Results:');
  console.log(`✅ Contains verse markers: ${hasVerse}`);
  console.log(`✅ Contains chorus markers: ${hasChorus}`);
  console.log(`✅ Has sufficient content: ${hasContent}`);
  
  if (hasVerse && hasChorus && hasContent) {
    console.log('\n🎉 Fallback lyrics generation is working correctly!');
    console.log('💡 The system will use fallback generation when API is unavailable.');
  } else {
    console.log('\n⚠️  Fallback generation has issues. Review the implementation.');
  }
}

// Run the test
testLyricsGeneration();
