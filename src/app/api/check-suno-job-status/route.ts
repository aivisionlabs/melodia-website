import { NextRequest, NextResponse } from 'next/server';
import { checkSunoJobStatusAction } from '@/lib/lyrics-actions';

export async function POST(request: NextRequest) {
  try {
    const { taskId } = await request.json();
    
    if (!taskId) {
      return NextResponse.json(
        { success: false, error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const result = await checkSunoJobStatusAction(taskId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking Suno job status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}
 