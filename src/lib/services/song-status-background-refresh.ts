/**
 * Background Refresh Service
 *
 * This service handles background refresh operations for song status,
 * updating the database without blocking the main response.
 */

import { performDemoRefresh } from '@/lib/services/song-status-demo-handler'
import { performProductionRefresh } from '@/lib/services/song-status-production-handler'
import { isDemoTask } from '@/lib/services/song-status-api-utils'

/**
 * Background refresh function - updates DB without blocking response
 */
export async function refreshInBackground(songId: string, taskId: string): Promise<void> {
  try {
    console.log('🔄 [BACKGROUND] Starting refresh for song:', songId)

    if (isDemoTask(taskId)) {
      await performDemoRefresh(songId, taskId)
    } else {
      await performProductionRefresh(songId, taskId)
    }

    console.log('✅ [BACKGROUND] Refresh completed for song:', songId)
  } catch (error) {
    console.error('❌ [BACKGROUND] Refresh failed for song:', songId, error)
  }
}
