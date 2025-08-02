'use client'

import { useState, useEffect, useTransition, useCallback } from 'react'
import { getSongs } from '@/lib/actions'
import { PublicSong } from '@/types'

export const useSongs = (search?: string) => {
  const [songs, setSongs] = useState<PublicSong[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    fetchSongs()
  }, [search, fetchSongs])

  const fetchSongs = useCallback(async () => {
    startTransition(async () => {
      try {
        setLoading(true)
        setError(null)

        const result = await getSongs(search, 50, 0)

        if (result.error) {
          setError(result.error)
          return
        }

        setSongs(result.songs)
        setHasMore(result.hasMore)
      } catch (err) {
        console.error('Error fetching songs:', err)
        setError('Failed to load songs')
      } finally {
        setLoading(false)
      }
    })
  }, [search, startTransition])

  return {
    songs,
    loading: loading || isPending,
    error,
    hasMore,
    refetch: fetchSongs
  }
}