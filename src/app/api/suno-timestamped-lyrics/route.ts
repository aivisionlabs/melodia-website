import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { taskId, audioId, musicIndex = 0 } = await request.json()

    if (!taskId || !audioId) {
      return NextResponse.json(
        { error: 'taskId and audioId are required' },
        { status: 400 }
      )
    }

    // TODO: Integrate with real Suno API
    // const sunoResponse = await fetch('https://api.suno.ai/api/v1/generate/get-timestamped-lyrics', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.SUNO_API_KEY}`
    //   },
    //   body: JSON.stringify({ taskId, audioId, musicIndex })
    // });
    // const sunoData = await sunoResponse.json();

    // For now, return mock data since we don't have the actual Suno API integration
    const mockTimestampedLyrics = {
      code: 200,
      msg: "success",
      data: {
        alignedWords: [
          {
            word: "[Verse 1]\nसबसे अच्छा दोस्त है वर्षा",
            success: true,
            startS: 0,
            endS: 4.0,
            palign: 0
          },
          {
            word: "तू है सबसे खास तेरी शख्सियत में",
            success: true,
            startS: 4.0,
            endS: 8.0,
            palign: 0
          },
          {
            word: "वो गर्माहट, सब महसूस करें आराम",
            success: true,
            startS: 8.0,
            endS: 12.0,
            palign: 0
          },
          {
            word: "तू है सबसे देखभाल करने वाली",
            success: true,
            startS: 12.0,
            endS: 16.0,
            palign: 0
          },
          {
            word: "[Chorus]\nवर्षा, तू सिर्फ दोस्त नहीं",
            success: true,
            startS: 16.0,
            endS: 20.0,
            palign: 0
          },
          {
            word: "तू है मेरी बहन दिल से",
            success: true,
            startS: 20.0,
            endS: 24.0,
            palign: 0
          },
          {
            word: "मेरे हर राज़ की साथी",
            success: true,
            startS: 24.0,
            endS: 28.0,
            palign: 0
          },
          {
            word: "वो जिस पर मैं करूँ भरोसा",
            success: true,
            startS: 28.0,
            endS: 32.0,
            palign: 0
          }
        ],
        waveformData: [0, 1, 0.5, 0.75, 0.3, 0.8, 0.2, 0.9],
        hootCer: 0.3803191489361702,
        isStreamed: false
      }
    }

    // Convert Suno format to our MediaPlayer format
    const convertedLyrics = mockTimestampedLyrics.data.alignedWords.map((word, index) => ({
      index,
      text: word.word,
      start: word.startS * 1000, // Convert seconds to milliseconds
      end: word.endS * 1000,
      success: word.success,
      palign: word.palign
    }))

    return NextResponse.json({
      success: true,
      lyrics: convertedLyrics,
      waveformData: mockTimestampedLyrics.data.waveformData,
      hootCer: mockTimestampedLyrics.data.hootCer,
      isStreamed: mockTimestampedLyrics.data.isStreamed
    })

  } catch (error) {
    console.error('Error fetching timestamped lyrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timestamped lyrics' },
      { status: 500 }
    )
  }
}
