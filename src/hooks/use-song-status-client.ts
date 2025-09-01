import { useState, useEffect, useCallback, useRef } from 'react'
import { Song } from '@/types'

export interface SongStatus {
  status: 'loading' | 'ready' | 'processing' | 'failed' | 'pending'
  isReady: boolean
  songUrl?: string
  duration?: number
  estimatedCompletion?: Date
  error?: string
}

export interface SongWithStatus extends Song {
  statusInfo: SongStatus
}

export interface UseSongStatusReturn {
  song: Song | null
  status: 'loading' | 'ready' | 'processing' | 'failed' | 'pending'
  isLoading: boolean
  error: string | null
  refreshStatus: () => Promise<void>
  isReady: boolean
  estimatedCompletion?: Date
  songUrl?: string
  duration?: number
}

interface UseSongStatusOptions {
  autoCheck?: boolean
  pollingInterval?: number
  maxPollingTime?: number
  enableExponentialBackoff?: boolean
  maxRetries?: number
  taskId?: string // Optional taskId for more efficient API calls
}

/**
 * Client-side hook for managing song status using API endpoints
 */
export function useSongStatus(
  songId: number | null,
  options: UseSongStatusOptions = {}
): UseSongStatusReturn {
  const {
    autoCheck = true,
    pollingInterval = 10000, // 10 seconds
    maxPollingTime = 10 * 60 * 1000, // 10 minutes
    enableExponentialBackoff = true,
    maxRetries = 3,
    taskId
  } = options

  const [song, setSong] = useState<Song | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'processing' | 'failed' | 'pending'>('loading')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estimatedCompletion, setEstimatedCompletion] = useState<Date | undefined>()
  const [songUrl, setSongUrl] = useState<string | undefined>()
  const [duration, setDuration] = useState<number | undefined>()

  const pollingRef = useRef<NodeJS.Timeout | null>(null)
  const startTimeRef = useRef<number>(Date.now())
  const isPollingRef = useRef(false)
  const retryCountRef = useRef<number>(0)
  const currentIntervalRef = useRef<number>(pollingInterval)

  // Check if song is ready
  const isReady = status === 'ready' && !!songUrl

  /**
   * Fetch song data and status from API
   */
  const fetchSongData = useCallback(async () => {
    if (!songId) {
      setSong(null)
      setStatus('pending')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Use taskId if available for more efficient API calls
      const url = taskId
        ? `/api/song/status/${songId}?taskId=${taskId}`
        : `/api/song/status/${songId}`

      const response = await fetch(url, {
        method: 'POST'
      })
      const data = await response.json()




      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch song data')
      }

      if (!data.success) {
        setSong(null)
        setStatus('failed')
        setError(data.error || 'Song not found')
        setIsLoading(false)
        return
      }
      // console.log(data);

      // Handle the new response structure
      if (data.song) {
        // GET request returns song with statusInfo
        const songWithStatus = data.song

        setSong(songWithStatus)
        setStatus(songWithStatus.statusInfo?.status)
        setEstimatedCompletion(songWithStatus.statusInfo?.estimatedCompletion)
        setSongUrl(songWithStatus.statusInfo?.songUrl)
        setDuration(songWithStatus.statusInfo?.duration)

        // If song is ready, stop polling
        if (songWithStatus.statusInfo?.isReady) {
          stopPolling()
        }
      } else if (data.status) {
        // POST request returns just status info
        const statusInfo = data.status
        setStatus(statusInfo?.status)
        setEstimatedCompletion(statusInfo?.estimatedCompletion)
        setSongUrl(statusInfo?.songUrl)
        setDuration(statusInfo?.duration)
        setError(statusInfo?.error || null)

        // If song is ready, stop polling
        if (statusInfo?.isReady) {
          stopPolling()
        }
      }

      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching song data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch song data')
      setIsLoading(false)
    }
  }, [songId, taskId])

  /**
   * Check and update song status via API
   */
  const checkStatus = useCallback(async () => {
    if (!songId) return

    try {
      // Use taskId if available for more efficient API calls
      const url = taskId
        ? `/api/song/status/${songId}?taskId=${taskId}`
        : `/api/song/status/${songId}`

      const response = await fetch(url, {
        method: 'POST'
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check status')
      }

      if (!data.success) {
        throw new Error(data.error || 'Status check failed')
      }

      // Reset retry count on successful check
      retryCountRef.current = 0
      currentIntervalRef.current = pollingInterval

      // Handle the new response structure - POST returns just status info
      const statusInfo = data.status
      setStatus(statusInfo.status)
      setEstimatedCompletion(statusInfo.estimatedCompletion)
      setSongUrl(statusInfo.songUrl)
      setDuration(statusInfo.duration)
      setError(statusInfo.error || null)

      // Update song data if we have it
      if (song) {
        setSong({
          ...song,
          status: statusInfo.status === 'ready' ? 'completed' : statusInfo.status,
          song_url: statusInfo.songUrl || song.song_url,
          duration: statusInfo.duration?.toString() || song.duration
        })
      }

      // Stop polling if song is ready or failed
      if (statusInfo.isReady || statusInfo.status === 'failed') {
        stopPolling()
      }
    } catch (err) {
      console.error('Error checking song status:', err)
      setError(err instanceof Error ? err.message : 'Failed to check status')

      // Handle exponential backoff
      if (enableExponentialBackoff) {
        retryCountRef.current += 1
        if (retryCountRef.current <= maxRetries) {
          currentIntervalRef.current = Math.min(
            currentIntervalRef.current * 2,
            60000 // Max 1 minute
          )
        } else {
          stopPolling()
        }
      }
    }
  }, [songId, song, pollingInterval, enableExponentialBackoff, maxRetries, taskId])

  /**
   * Refresh status manually
   */
  const refreshStatus = useCallback(async () => {
    if (!songId) return

    setIsLoading(true)
    await checkStatus()
    setIsLoading(false)
  }, [songId, checkStatus])

  /**
   * Start polling for status updates
   */
  const startPolling = useCallback(() => {
    if (isPollingRef.current || !songId) return

    isPollingRef.current = true
    startTimeRef.current = Date.now()

    const poll = async () => {
      // Check if we've exceeded max polling time
      if (Date.now() - startTimeRef.current > maxPollingTime) {
        console.log('Max polling time exceeded, stopping polling')
        stopPolling()
        return
      }

      await checkStatus()

      // Continue polling if still processing
      if (status === 'processing' && isPollingRef.current) {
        pollingRef.current = setTimeout(poll, currentIntervalRef.current)
      }
    }

    pollingRef.current = setTimeout(poll, currentIntervalRef.current)
  }, [songId, checkStatus, status, maxPollingTime])

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearTimeout(pollingRef.current)
      pollingRef.current = null
    }
    isPollingRef.current = false
  }, [])

  // Initial data fetch
  useEffect(() => {
    fetchSongData()
  }, [fetchSongData])

  // Start/stop polling based on status
  useEffect(() => {
    if (!autoCheck || !songId) return

    if (status === 'processing' && !isPollingRef.current) {
      startPolling()
    } else if (status !== 'processing' && isPollingRef.current) {
      stopPolling()
    }
  }, [status, songId, autoCheck, startPolling, stopPolling])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPolling()
    }
  }, [stopPolling])

  return {
    song,
    status,
    isLoading,
    error,
    refreshStatus,
    isReady,
    estimatedCompletion,
    songUrl,
    duration
  }
}

/**
 * Hook for managing song status by slug using API
 */
export function useSongStatusBySlug(
  slug: string | null,
  options: UseSongStatusOptions = {}
): UseSongStatusReturn {
  const [songId, setSongId] = useState<number | null>(null)

  // Get song ID from slug
  useEffect(() => {
    const getSongId = async () => {
      if (!slug) {
        setSongId(null)
        return
      }

      try {
        const response = await fetch(`/api/song/${slug}/id`)
        if (response.ok) {
          const data = await response.json()
          setSongId(data.songId)
        } else {
          setSongId(null)
        }
      } catch (error) {
        console.error('Error getting song ID from slug:', error)
        setSongId(null)
      }
    }

    getSongId()
  }, [slug])

  return useSongStatus(songId, options)
}
