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
    autoCheck: true, // Enable auto-check to get latest status
    pollingInterval: 5000 // Check every 5 seconds for faster updates
  })

  console.log('SongLinkButton - songId:', songId, 'status:', status, 'song:', song, 'error:', error)



  if (isLoading) {
    return (
      <Button size="sm" className="bg-gray-500 hover:bg-gray-600 text-white" disabled>
        Loading...
      </Button>
    )
  }

  // If there's an error but song exists, try to refresh
  if (error && song) {
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

  // If no song data and no error, show processing (song might be being created)
  if (!song && !error) {
    return (
      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" disabled>
        Processing...
      </Button>
    )
  }

  // If song is ready, show listen button
  if ((status === 'ready' && song?.song_url) || (song?.song_url && song?.status === 'completed')) {
    return (
      <Link href={`/library/${song?.slug}`}>
        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
          Listen to Song
        </Button>
      </Link>
    )
  }

  // If song is processing, show status
  if (status === 'processing' || song?.status === 'generating' || song?.status === 'processing') {
    return (
      <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white" disabled>
        Processing...
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

  // Default case - show retry only if there's a clear error
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

export default function DashboardPage() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const [userSongs, setUserSongs] = useState<PublicSong[]>([])
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
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

  // Helper function to check if any songs are processing
  const hasProcessingSongs = () => {
    return songRequests.some(request => {
      const status = getStatusText(request.status, request.lyrics_status, request)
      return status === 'Generating Lyrics' || status === 'Processing' || 
             (request.status === 'processing' && !request.generated_song_id)
    })
  }

  // Auto-refresh data every 30 seconds only if there are processing songs
  useEffect(() => {
    if (!isAuthenticated || !user) return

    const interval = setInterval(() => {
      // Only refresh if there are songs currently processing
      if (hasProcessingSongs()) {
        loadUserData()
      }
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [isAuthenticated, user, songRequests])

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

  const getStatusText = (status: string, lyricsStatus?: string, request?: any) => {
    // Check if song failed first (priority check)
    if (status === 'failed' || request?.status === 'failed') {
      return 'Failed'
    }

    // Check if song is completed (has song_url and not failed)
    if (request?.generated_song_id && request?.status !== 'failed') {
      return 'Completed'
    }

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

  const getStatusColor = (status: string, lyricsStatus?: string, request?: any) => {
    // Check if song failed first (priority check)
    if (status === 'failed' || request?.status === 'failed') {
      return 'bg-red-100 text-red-800'
    }

    // Check if song is completed (has song_url and not failed)
    if (request?.generated_song_id && request?.status !== 'failed') {
      return 'bg-green-100 text-green-800'
    }

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

  // Helper function to get display name for status filter
  const getStatusDisplayName = (filter: string) => {
    switch (filter) {
      case 'ready': return 'Ready for Song Creation'
      case 'pending': return 'Pending Lyrics'
      case 'completed': return 'Completed'
      case 'failed': return 'Failed'
      default: return filter
    }
  }

  // Filter function for song requests based on status
  const getFilteredSongRequests = () => {
    if (statusFilter === 'all') {
      return songRequests
    }
    
    return songRequests.filter((request) => {
      const statusText = getStatusText(request.status, request.lyrics_status, request)
      
      // Filter based on exact status text
      if (statusFilter === 'ready') {
        return statusText === 'Ready for Song Creation'
      } else if (statusFilter === 'pending') {
        return statusText === 'Pending Lyrics'
      } else if (statusFilter === 'completed') {
        return statusText === 'Completed'
      } else if (statusFilter === 'failed') {
        return statusText === 'Failed'
      }
      
      return false
    })
  }

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading your dashboard..." />
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <Link href="/" className="text-xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Melodia
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700 font-medium">Dashboard</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700 font-medium">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 sm:px-0 mb-8 text-center">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Manage your songs and track your song creation requests.
          </p>
        </div>

        {/* My Songs Section - Single Column */}
        <div className="px-4 sm:px-0">
          <Card className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Music className="h-8 w-8" />
                    </div>
                    <h2 className="text-3xl font-bold">My Songs</h2>
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <Clock className="h-8 w-8" />
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    {/* Create New Song Button */}
                    <Link href="/create-song">
                      <Button className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/30 hover:border-white/50 font-semibold py-2 px-4 rounded-xl transition-all duration-300 transform hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        Create New Song
                      </Button>
                    </Link>
                    {/* Filter UI */}
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                      <div className="flex items-center space-x-3">
                        <span className="text-white font-medium text-sm">Filter:</span>
                        <select
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="px-3 py-1.5 border-2 border-white/30 rounded-lg focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-200 hover:border-white/50 bg-white/90 text-gray-800 text-sm"
                        >
                          <option value="all">All Songs</option>
                          <option value="ready">Ready for Song Creation</option>
                          <option value="pending">Pending Lyrics</option>
                          <option value="completed">Completed</option>
                          <option value="failed">Failed</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8">
              {isLoadingSongs ? (
                <LoadingSpinner size="lg" text="Loading requests..." />
              ) : getFilteredSongRequests().length === 0 ? (
                <div className="text-center py-12">
                  <div className="p-6 bg-gradient-to-r from-blue-100 to-purple-100 rounded-2xl inline-block mb-6">
                    <Clock className="h-16 w-16 text-blue-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {statusFilter === 'all' ? 'No song requests yet' : `No songs with "${getStatusDisplayName(statusFilter)}" status`}
                  </h3>
                  <p className="text-gray-600 mb-6">
                    {statusFilter === 'all' 
                      ? 'Start creating beautiful personalized songs for your loved ones'
                      : 'Try selecting a different filter or create a new song request'
                    }
                  </p>
                  <Link href="/create-song">
                    <Button className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl">
                      <Plus className="h-5 w-5 mr-2" />
                      Make Your First Request
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {getFilteredSongRequests().map((request) => (
                    <div
                      key={request.id}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-3">
                            {getStatusIcon(request.status, request.lyrics_status)}
                            <h3 className="text-xl font-semibold text-gray-900">
                              Song for {request.recipient_name}
                            </h3>
                          </div>
                          <p className="text-gray-600 mb-2">
                            {request.recipient_relationship} • {request.languages?.join(', ')}
                          </p>
                          <p className="text-sm text-gray-500">
                            Requested on {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex flex-col items-end space-y-3">
                          <span className={`text-sm px-4 py-2 rounded-full font-medium ${getStatusColor(request.status, request.lyrics_status, request)}`}>
                            {getStatusText(request.status, request.lyrics_status, request)}
                          </span>
                          {getActionButton(request)}
                        </div>
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
