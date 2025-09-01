'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { PublicSong, SongRequest } from '@/types'
import { getUserSongs, getUserSongRequests } from '@/lib/song-request-actions'
import { Music, Plus, LogOut, User, Clock, CheckCircle, XCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'
import { useSongStatus } from '@/hooks/use-song-status-client'
import { SongStatusBadge } from '@/components/dashboard/SongStatusBadge'

// Component to handle song link with status checking
function SongLinkButton({ songId }: { songId: number }) {
  const { song, status, isLoading, error, refreshStatus } = useSongStatus(songId, {
    autoCheck: true // Enable auto-check to get latest status
  })



  if (isLoading) {
    return (
      <Button size="sm" className="bg-gray-500 hover:bg-gray-600 text-white" disabled>
        Loading...
      </Button>
    )
  }

  if (error || !song) {
    return (
      <Button
        size="sm"
        className="bg-red-500 hover:bg-red-600 text-white"
        onClick={refreshStatus}
      >
        Retry
      </Button>
    )
  }

  // If song is ready, show listen button
  if ((status === 'ready' && song.song_url) || (song?.song_url && song?.status === 'completed')) {
    return (
      <Link href={`/library/${song.slug}`}>
        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
          Listen to Song
        </Button>
      </Link>
    )
  }

  // If song is processing, show status
  if (status === 'processing' || song?.status === 'generating') {
    return (
      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" disabled>
        Generating...
      </Button>
    )
  }

  // If song failed, show retry button
  if (status === 'failed' || song?.status === 'failed') {
    return (
      <Button
        size="sm"
        className="bg-red-500 hover:bg-red-600 text-white"
        onClick={refreshStatus}
      >
        Retry
      </Button>
    )
  }

  // Default case - check status
  return (
    <Button
      size="sm"
      className="bg-yellow-500 hover:bg-yellow-600 text-white"
      onClick={refreshStatus}
    >
      Check Status
    </Button>
  )
}

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const [userSongs, setUserSongs] = useState<PublicSong[]>([])
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(true)
  const router = useRouter()
  const { addToast } = useToast()

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])

  // Load user's songs and requests
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    }
  }, [isAuthenticated, user])

  const loadUserData = async () => {
    if (!user?.id) return

    try {
      setIsLoadingSongs(true)

      // Load user's songs and requests in parallel
      const [songsResult, requestsResult] = await Promise.all([
        getUserSongs(user.id),
        getUserSongRequests(user.id)
      ])

      if (songsResult.success) {
        setUserSongs(songsResult.songs || [])
      } else {
        addToast({
          type: 'error',
          title: 'Failed to load songs',
          message: songsResult.error || 'Please try again later'
        })
      }

      if (requestsResult.success) {
        setSongRequests(requestsResult.requests || [])
      } else {
        addToast({
          type: 'error',
          title: 'Failed to load requests',
          message: requestsResult.error || 'Please try again later'
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your data. Please refresh the page.'
      })
    } finally {
      setIsLoadingSongs(false)
    }
  }

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push('/')
    }
  }

  const getStatusIcon = (status: string, lyricsStatus?: string) => {
    // Phase 6: Check lyrics status first if available
    if (lyricsStatus) {
      switch (lyricsStatus) {
        case 'approved':
          return <CheckCircle className="h-4 w-4 text-green-500" />
        case 'needs_review':
          return <Clock className="h-4 w-4 text-yellow-500" />
        case 'generating':
          return <Clock className="h-4 w-4 text-blue-500" />
        case 'pending':
          return <Clock className="h-4 w-4 text-gray-500" />
      }
    }

    // Fallback to original status
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: string, lyricsStatus?: string) => {
    // Phase 6: Check lyrics status first if available
    if (lyricsStatus) {
      switch (lyricsStatus) {
        case 'approved':
          return 'Ready for Song Creation'
        case 'needs_review':
          return 'Lyrics Need Review'
        case 'generating':
          return 'Generating Lyrics'
        case 'pending':
          return 'Pending Lyrics'
      }
    }

    // Fallback to original status
    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const getStatusColor = (status: string, lyricsStatus?: string) => {
    // Phase 6: Check lyrics status first if available
    if (lyricsStatus) {
      switch (lyricsStatus) {
        case 'approved':
          return 'bg-green-100 text-green-800'
        case 'needs_review':
          return 'bg-yellow-100 text-yellow-800'
        case 'generating':
          return 'bg-blue-100 text-blue-800'
        case 'pending':
          return 'bg-gray-100 text-gray-800'
      }
    }

    // Fallback to original status
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getActionButton = (request: SongRequest) => {
    // Phase 6: Show appropriate action based on lyrics status
    if (request.lyrics_status) {
      switch (request.lyrics_status) {
        case 'pending':
          return (
            <Link href={`/create-lyrics/${request.id}`}>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                Create Lyrics
              </Button>
            </Link>
          )
        case 'needs_review':
          return (
            <Link href={`/create-lyrics/${request.id}`}>
              <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                Edit Lyrics
              </Button>
            </Link>
          )
        case 'approved':
          // Check if song has already been created
          if (request.generated_song_id) {
            // Song exists - redirect to listen to it
            return (
              <SongLinkButton songId={request.generated_song_id} />
            )
          } else {
            // Lyrics approved but song not created yet
            return (
              <Link href={`/create-song-from-lyrics/${request.id}`}>
                <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                  Create Song
                </Button>
              </Link>
            )
          }
      }
    }

    // Fallback for old requests without lyrics status
    return (
      <Link href={`/create-lyrics/${request.id}`}>
        <Button variant="outline" size="sm">
          View
        </Button>
      </Link>
    )
  }

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading your dashboard..." />
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                Melodia
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700">Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-gray-600">
            Manage your songs and track your song creation requests.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="px-4 sm:px-0 mb-8">
          <div className="flex flex-wrap gap-4">
            <Link href="/create-song">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create New Song Request
              </Button>
            </Link>
            <Link href="/library">
              <Button variant="outline">
                <Music className="h-4 w-4 mr-2" />
                Browse All Songs
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 sm:px-0">
          {/* My Songs Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Music className="h-5 w-5 mr-2" />
                My Songs
              </CardTitle>
              <CardDescription>
                Songs you&apos;ve created or requested
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSongs ? (
                <LoadingSpinner size="lg" text="Loading your songs..." />
              ) : userSongs.length === 0 ? (
                <div className="text-center py-8">
                  <Music className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">You haven&apos;t created any songs yet.</p>
                  <Link href="/create-song">
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                      Create Your First Song
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {userSongs.map((song) => (
                    <div
                      key={song.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{song.title}</h3>
                        <p className="text-sm text-gray-500">{song.music_style}</p>
                      </div>
                      <Link href={`/library/${song.slug}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Song Requests Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Song Requests
              </CardTitle>
              <CardDescription>
                Track the status of your song creation requests
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingSongs ? (
                <LoadingSpinner size="lg" text="Loading requests..." />
              ) : songRequests.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No song requests yet.</p>
                  <Link href="/create-song">
                    <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600">
                      Make Your First Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {songRequests.map((request) => (
                    <div
                      key={request.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(request.status, request.lyrics_status)}
                          <h3 className="font-medium text-gray-900">
                            Song for {request.recipient_name}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-500">
                          {request.recipient_relationship} • {request.languages?.join(', ')}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Requested on {new Date(request.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status, request.lyrics_status)}`}>
                          {getStatusText(request.status, request.lyrics_status)}
                        </span>
                        {getActionButton(request)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
