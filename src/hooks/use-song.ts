'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { getSong } from '@/lib/actions'
import { PublicSong } from '@/types'

export const useSong = (songId: string) => {
  const [song, setSong] = useState<PublicSong | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!songId) {
      setLoading(false)
      return
    }

    fetchSong()
  }, [songId, fetchSong])

  const fetchSong = useCallback(async () => {
    startTransition(async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getSong(songId)

        if (result.error) {
          setError(result.error)
          return
        }

        setSong(result.song)
      } catch (err) {
        console.error('Error fetching song:', err)
        setError('Failed to load song')
      } finally {
        setLoading(false)
      }
    })
  }, [songId, startTransition])

  return {
    song,
    loading: loading || isPending,
    error,
    refetch: fetchSong
  }
}