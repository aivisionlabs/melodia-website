import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'

export async function POST(request: NextRequest) {
  try {
    const { title, lyrics, style, recipient_name } = await request.json()

    console.log('Received request:', { title, lyrics: lyrics?.substring(0, 100) + '...', style, recipient_name })

    if (!title || !lyrics || !style) {
      console.log('Missing required fields:', { title: !!title, lyrics: !!lyrics, style: !!style })
      return NextResponse.json(
        { error: true, message: 'Missing required fields: title, lyrics, style' },
        { status: 400 }
      )
    }

    // Create the prompt for Suno API
    const prompt = `Title: ${title}\n\nLyrics:\n${lyrics}\n\nStyle: ${style}`

    // Initialize Suno API
    const sunoAPI = SunoAPIFactory.getAPI()
    console.log('SunoAPI initialized:', typeof sunoAPI)

    // Generate song
    const generateRequest = {
      prompt,
      style,
      title,
      customMode: true,
      instrumental: false,
      model: 'V4',  
      callBackUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/song-callback`
    }
    
    console.log('Sending request to Suno API:', generateRequest)
    
    let generateResponse;
    try {
      generateResponse = await sunoAPI.generateSong(generateRequest)
      console.log('Suno API response:', generateResponse)
    } catch (apiError) {
      console.error('Suno API call failed:', apiError)
      return NextResponse.json(
        { error: true, message: `Suno API call failed: ${apiError instanceof Error ? apiError.message : 'Unknown error'}` },
        { status: 500 }
      )
    }

    if (generateResponse.code !== 0) {
      console.log('Suno API error:', generateResponse.msg)
      return NextResponse.json(
        { error: true, message: `Suno API error: ${generateResponse.msg}` },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      taskId: generateResponse.data.taskId,
      message: 'Song generation started successfully'
    })

  } catch (error) {
    console.error('Error generating song:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to generate song' },
      { status: 500 }
    )
  }
}
