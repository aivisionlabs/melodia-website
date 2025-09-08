'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { PublicSong, SongRequest, SongRequestFormData } from '@/types'
import { getUserSongs, getUserSongRequests, createSongRequest } from '@/lib/song-request-actions'
import { Music, Plus, LogOut, User, Clock, CheckCircle, XCircle, Heart, Globe, MessageCircle, Play, ChevronRight } from 'lucide-react'
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
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { addToast } = useToast()

  // Form state for new song creation
  const [formData, setFormData] = useState<SongRequestFormData>({
    requester_name: '',
    phone_number: '',
    email: '',
    delivery_preference: undefined,
    recipient_name: '',
    recipient_relationship: '',
    languages: ['English'],
    person_description: '',
    song_type: '',
    emotions: [],
    additional_details: ''
  })

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Static songs data for display
  const staticSongs = [
    { id: 1, title: "Top 50", likes: "50K", image: "/images/static-songs/top50.svg" },
    { id: 2, title: "Emotional", likes: "10K", image: "/images/static-songs/emotional.svg" },
    { id: 3, title: "House", likes: "19K", image: "/images/static-songs/house.svg" },
    { id: 4, title: "Study", likes: "20K", image: "/images/static-songs/study.svg" },
    { id: 5, title: "Lofi", likes: "20K", image: "/images/static-songs/lofi.svg" },
    { id: 6, title: "Afrobeat", likes: "13K", image: "/images/static-songs/afrobeat.svg" },
    { id: 7, title: "Classical", likes: "10K", image: "/images/static-songs/classical.svg" },
    { id: 8, title: "Pop", likes: "25K", image: "/images/static-songs/pop.svg" },
    { id: 9, title: "Rock", likes: "15K", image: "/images/static-songs/rock.svg" },
    { id: 10, title: "Jazz", likes: "8K", image: "/images/static-songs/jazz.svg" }
  ]

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

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        requester_name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.recipient_name.trim()) {
      errors.recipient_name = 'Who is this song for? (Required)'
    } else if (formData.recipient_name.length < 3) {
      errors.recipient_name = 'Name must be at least 3 characters'
    }

    if (!formData.recipient_relationship.trim()) {
      errors.recipient_relationship = 'Relationship is required'
    }

    if (!formData.additional_details?.trim()) {
      errors.additional_details = 'Please tell us more about the song'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleInputChange = (field: keyof SongRequestFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    // Clear general error when user makes changes
    if (error) {
      setError(null)
    }
  }

  const isFormValid = (): boolean => {
    const hasRecipientName = formData.recipient_name.trim().length >= 3
    const hasRelationship = formData.recipient_relationship.trim().length > 0
    const hasAdditionalDetails = (formData.additional_details?.trim().length || 0) > 0
    
    return hasRecipientName && hasRelationship && hasAdditionalDetails
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      setError('Please fill in all required fields to continue.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createSongRequest(formData, user?.id)
      
      if (result.success) {
        addToast({
          type: 'success',
          title: 'Request Submitted!',
          message: 'Your song request has been submitted successfully. Now let\'s create the lyrics!'
        })
        // Redirect to lyrics creation page after success
        setTimeout(() => {
          router.push(`/create-lyrics/${result.requestId}`)
        }, 2000)
      } else {
        const errorMessage = result.error || 'Failed to submit song request. Please try again.'
        setError(errorMessage)
        addToast({
          type: 'error',
          title: 'Submission Failed',
          message: errorMessage
        })
      }
    } catch {
      const errorMessage = 'Failed to submit song request. Please try again.'
      setError(errorMessage)
      addToast({
        type: 'error',
        title: 'Error',
        message: errorMessage
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading your dashboard..." />
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">MELODIA</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">{user?.name || user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Song Creation Form */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            Create Songs In Under 60-Seconds
          </h1>
          <p className="text-base md:text-lg text-gray-300 max-w-2xl mx-auto">
            <span className="text-yellow-400 font-semibold">HOLD YOUR BREATH:</span> Describe your song and prepare to be surprised.
          </p>
        </div>

        {/* Song Creation Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-8 md:mb-16 px-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4 md:p-8">
              {/* Method Selection Tabs */}
              <div className="flex flex-wrap justify-center gap-2 md:gap-4 mb-6 md:mb-8">
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 md:px-6 py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-sm md:text-base"
                >
                  <Music className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Generate</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 md:px-6 py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors text-sm md:text-base"
                >
                  <Music className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Song Wizard</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 md:px-6 py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors relative text-sm md:text-base"
                >
                  <Music className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Custom Lyrics</span>
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-500 text-black text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-bold">PRO</span>
                </button>
                <button
                  type="button"
                  className="flex items-center space-x-2 px-3 md:px-6 py-2 md:py-3 bg-gray-700 hover:bg-gray-600 rounded-xl transition-colors relative text-sm md:text-base"
                >
                  <Music className="h-4 w-4 md:h-5 md:w-5" />
                  <span>Instrumental</span>
                  <span className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-yellow-500 text-black text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-bold">PRO</span>
                </button>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 md:space-y-6">
                {/* Who is this song for? */}
                <div className="space-y-2">
                  <Label htmlFor="recipient_name" className="text-white font-medium text-sm md:text-base">
                    Who is this song for?
                  </Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                    placeholder="e.g., LiLi, my wife"
                    className="h-12 md:h-14 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                  />
                  {validationErrors.recipient_name && (
                    <p className="text-red-400 text-xs md:text-sm">{validationErrors.recipient_name}</p>
                  )}
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label htmlFor="languages" className="text-white font-medium text-sm md:text-base">
                    Language
                  </Label>
                  <Input
                    id="languages"
                    value={formData.languages?.join(', ') || ''}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
                    placeholder="Hindi, English, or any language"
                    className="h-12 md:h-14 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-yellow-500 focus:border-yellow-500 text-sm md:text-base"
                  />
                  <p className="text-gray-400 text-xs md:text-sm">Type any language you want the song in</p>
                </div>

                {/* Tell us more about the song */}
                <div className="space-y-2">
                  <Label htmlFor="additional_details" className="text-white font-medium text-sm md:text-base">
                    Tell us more about the song
                  </Label>
                  <textarea
                    id="additional_details"
                    value={formData.additional_details}
                    onChange={(e) => handleInputChange('additional_details', e.target.value)}
                    placeholder="Basic details about who the song is for, their story, genre, style preferences..."
                    className="w-full h-24 md:h-32 p-3 md:p-4 bg-gray-700 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 resize-none text-sm md:text-base"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-xs md:text-sm">Share the story, genre, and style you want</p>
                    <p className="text-gray-400 text-xs md:text-sm">{(formData.additional_details || '').length}/1000</p>
                    </div>
                  {validationErrors.additional_details && (
                    <p className="text-red-400 text-xs md:text-sm">{validationErrors.additional_details}</p>
                  )}
                    </div>

                {/* Hidden fields for form compatibility */}
                <input type="hidden" name="recipient_relationship" value={formData.recipient_relationship || 'friend'} />
                <input type="hidden" name="person_description" value={formData.person_description || ''} />
                <input type="hidden" name="song_type" value={formData.song_type || ''} />

                {/* Error Display */}
                {error && (
                  <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 md:px-12 py-3 md:py-4 text-base md:text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-black mr-2 md:mr-3"></div>
                        Creating Song...
                      </div>
                    ) : (
                      'Create Song'
                    )}
                      </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Static Songs Section */}
        <div className="mb-8 md:mb-16 px-4">
          <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-6 text-center">Popular Songs</h2>
          <div className="relative">
            <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {staticSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-48 md:w-64 bg-gray-800 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer group"
                >
                  <div className="relative">
                    <img 
                      src={song.image} 
                      alt={song.title}
                      className="w-full h-36 md:h-48 object-cover"
                    />
                    <div className="absolute top-2 md:top-4 right-2 md:right-4">
                      <div className="w-6 h-6 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Play className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </div>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-white font-semibold text-base md:text-lg mb-1">{song.title}</h3>
                    <p className="text-gray-400 text-xs md:text-sm">{song.likes} Likes</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
              <div className="w-8 h-16 bg-gray-700/50 rounded-l-lg flex items-center justify-center">
                <ChevronRight className="h-6 w-6 text-white" />
              </div>
            </div>
                  </div>
                </div>

        {/* My Songs Section */}
        {songRequests.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">My Songs</h2>
            <div className="space-y-4">
              {songRequests.slice(0, 5).map((request) => (
                    <div
                      key={request.id}
                  className="bg-gray-800 rounded-xl p-6 hover:bg-gray-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-semibold text-lg">
                              Song for {request.recipient_name}
                            </h3>
                      <p className="text-gray-400">
                            {request.recipient_relationship} • {request.languages?.join(', ')}
                          </p>
                      <p className="text-gray-500 text-sm">
                        {new Date(request.created_at).toLocaleDateString()}
                          </p>
                        </div>
                    <div className="flex items-center space-x-3">
                      <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                        {request.status}
                          </span>
                      <Button
                        size="sm"
                        className="bg-yellow-500 hover:bg-yellow-600 text-black"
                      >
                        View
                      </Button>
                        </div>
                      </div>
                    </div>
                  ))}
            </div>
                </div>
              )}
      </main>
    </div>
  )
}
