import { NextRequest, NextResponse } from 'next/server'
import { SunoAPIFactory } from '@/lib/suno-api'

export async function GET(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const { taskId } = params

    if (!taskId) {
      return NextResponse.json(
        { error: true, message: 'Task ID is required' },
        { status: 400 }
      )
    }

    // Initialize Suno API
    const sunoAPI = SunoAPIFactory.getAPI()

    // Get song status
    const statusResponse = await sunoAPI.getRecordInfo(taskId)

    if (statusResponse.code !== 0) {
      return NextResponse.json(
        { error: true, message: statusResponse.msg },
        { status: 400 }
      )
    }

    const { status, response } = statusResponse.data

    if (status === 'completed' && response?.sunoData?.length > 0) {
      // Return the first variant's audio URL
      const audioUrl = response.sunoData[0].audioUrl || response.sunoData[0].streamAudioUrl
      
      return NextResponse.json({
        success: true,
        status: 'completed',
        audioUrl,
        variants: response.sunoData
      })
    } else if (status === 'failed') {
      return NextResponse.json({
        success: true,
        status: 'failed',
        errorMessage: statusResponse.data.errorMessage || 'Song generation failed'
      })
    } else {
      return NextResponse.json({
        success: true,
        status: 'processing',
        message: 'Song is still being generated'
      })
    }

  } catch (error) {
    console.error('Error checking song status:', error)
    return NextResponse.json(
      { error: true, message: 'Failed to check song status' },
      { status: 500 }
    )
  }
}
