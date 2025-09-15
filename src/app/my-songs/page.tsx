'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Play, Pause, Download, Share2, ArrowLeft, Music, Trash2, RefreshCw, Loader2, Search, Filter, X } from 'lucide-react'
import Header from '@/components/Header'
import { useAuth } from '@/hooks/use-auth'
import { fetchUserContent, UserContentItem, getButtonForContent } from '@/lib/user-content-client'
import { useToast } from '@/components/ui/toast'
import { pollSongStatus, SongStatusResponse } from '@/lib/song-status-client'
import { VariantSelectionModal } from '@/components/VariantSelectionModal'
import { MediaPlayer } from '@/components/MediaPlayer'

interface SavedSong {
  id: string
  title: string
  lyrics: string
  styleOfMusic: string
  status: 'ready' | 'generating' | 'error'
  audioUrl?: string | null
  createdAt: string
  recipientName: string
  errorMessage?: string
}

export default function MySongsPage() {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  const { addToast } = useToast()
  const [userContent, setUserContent] = useState<UserContentItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<HTMLAudioElement | null>(null)
  const [playingSongId, setPlayingSongId] = useState<string | null>(null)
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [progressItem, setProgressItem] = useState<UserContentItem | null>(null)
  const [pollingSongs, setPollingSongs] = useState<Set<string>>(new Set())
  const [songStatuses, setSongStatuses] = useState<Map<string, SongStatusResponse>>(new Map())
  const cleanupFunctionsRef = useRef<Map<string, () => void>>(new Map())
  
  // Variant selection modal state
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [selectedSongForVariants, setSelectedSongForVariants] = useState<UserContentItem | null>(null)
  
  // Media player state
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [songLyrics, setSongLyrics] = useState<any[]>([])
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [filteredContent, setFilteredContent] = useState<UserContentItem[]>([])

  const stopPollingSong = (songId: string) => {
    // Call cleanup function if it exists
    const cleanup = cleanupFunctionsRef.current.get(songId)
    if (cleanup) {
      console.log(`Stopping polling for song ${songId}`)
      cleanup()
      cleanupFunctionsRef.current.delete(songId)
    }
    
    // Remove from polling set
    setPollingSongs(prev => {
      const newSet = new Set(prev)
      newSet.delete(songId)
      return newSet
    })
  }

  const loadUserContent = async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      console.log('Loading user content for user:', user.id)
      const content = await fetchUserContent(user.id)
      console.log('Loaded user content:', content.length, 'items')
      setUserContent(content)
      setFilteredContent(content) // Initialize filtered content
    } catch (error) {
      console.error('Error loading user content:', error)
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load your songs. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter content based on search query and filters
  const applyFilters = () => {
    let filtered = [...userContent]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.recipient_name.toLowerCase().includes(query)
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => {
        const button = getButtonForContent(item)
        const statusText = button.text.toLowerCase()
        
        switch (statusFilter) {
          case 'ready':
            return statusText.includes('listen') || statusText.includes('play')
          case 'processing':
            return statusText.includes('progress') || statusText.includes('generating')
          case 'draft':
            return statusText.includes('generate') || statusText.includes('review')
          case 'failed':
            return statusText.includes('retry') || statusText.includes('failed')
          default:
            return true
        }
      })
    }

    setFilteredContent(filtered)
  }

  // Apply filters when search query or filters change
  useEffect(() => {
    applyFilters()
  }, [searchQuery, statusFilter, userContent])

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
  }

  // Helper function to safely parse lyrics
  const parseLyrics = (lyrics: any): any[] => {
    if (!lyrics) return []
    
    if (typeof lyrics === 'string') {
      try {
        return JSON.parse(lyrics)
      } catch {
        // If it's not valid JSON, treat it as plain text and create a simple lyrics array
        return [{ text: lyrics, start: 0, end: 30000 }]
      }
    }
    
    return Array.isArray(lyrics) ? lyrics : []
  }

  // Handle variant selection for MediaPlayer
  const handleVariantSelectForPlayer = (variant: any, variantIndex: number) => {
    if (!selectedSongForVariants) return

    // Create song object for MediaPlayer
    const songForPlayer = {
      title: selectedSongForVariants.title,
      artist: selectedSongForVariants.recipient_name,
      song_url: variant.audioUrl || variant.streamAudioUrl,
      slug: selectedSongForVariants.title.toLowerCase().replace(/\s+/g, '-'),
      lyrics: parseLyrics(selectedSongForVariants.lyrics),
      timestamp_lyrics: null,
      timestamped_lyrics_variants: null,
      selected_variant: variantIndex,
      // Suno-specific fields for timestamped lyrics
      suno_task_id: selectedSongForVariants.suno_task_id,
      suno_audio_id: variant.id // Use variant ID as audio ID
    }

    setSelectedSong(songForPlayer)
    setSongLyrics(songForPlayer.lyrics || [])
  }

  // Handle listen button click
  const handleListenClick = (item: UserContentItem) => {
    if (item.variants && item.variants.length > 1) {
      // Show variant selection modal for songs with multiple variants
      setSelectedSongForVariants(item)
      setShowVariantModal(true)
    } else if (item.variants && item.variants.length === 1) {
      // Direct play for songs with single variant
      handleVariantSelectForPlayer(item.variants[0], 0)
    } else {
      // Fallback for songs without variants
      const songForPlayer = {
        title: item.title,
        artist: item.recipient_name,
        song_url: item.audio_url,
        slug: item.title.toLowerCase().replace(/\s+/g, '-'),
        lyrics: parseLyrics(item.lyrics),
        timestamp_lyrics: null,
        timestamped_lyrics_variants: null,
        selected_variant: 0,
        // Suno-specific fields for timestamped lyrics
        suno_task_id: item.suno_task_id,
        suno_audio_id: item.song_id?.toString() // Use song ID as audio ID
      }
      setSelectedSong(songForPlayer)
      setSongLyrics(songForPlayer.lyrics || [])
    }
  }

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login')
      return
    }

    if (user?.id) {
      loadUserContent()
    }
  }, [user, authLoading, isAuthenticated, router])

  // Refresh data when page becomes visible (e.g., when user navigates back from home)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.id) {
        loadUserContent()
      } else if (document.hidden) {
        // Stop all polling when page becomes hidden
        console.log('Page hidden - stopping all polling')
        cleanupFunctionsRef.current.forEach((cleanup, songId) => {
          console.log(`Stopping polling for song ${songId} - page hidden`)
          cleanup()
        })
        cleanupFunctionsRef.current.clear()
        setPollingSongs(new Set())
      }
    }

    const handleFocus = () => {
      if (user?.id) {
        loadUserContent()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [user?.id])

  // Start individual song polling for processing songs
  useEffect(() => {
    if (user?.id && userContent.length > 0) {
      // Find songs that need polling
      const songsToPoll = userContent.filter(item => 
        item.type === 'song' && 
        (item.status === 'processing' || item.status === 'generating') &&
        !pollingSongs.has(item.id)
      )

      if (songsToPoll.length > 0) {
        console.log(`Found ${songsToPoll.length} songs to poll:`, songsToPoll.map(s => s.id))
        
        songsToPoll.forEach(song => {
          // Extract taskId from song metadata or use a fallback
          const taskId = song.suno_task_id || `demo-task-${Date.now()}`
          
          console.log(`Starting polling for song ${song.id} with taskId ${taskId}`)
          
          // Mark as polling immediately to prevent duplicate polling
          setPollingSongs(prev => new Set(prev.add(song.id)))
          
          // Start polling this individual song
          const cleanup = pollSongStatus(
            taskId,
            (status) => {
              console.log(`Song ${song.id} status update:`, status)
              
              // Update the song status in our state
              setSongStatuses(prev => new Map(prev.set(song.id, status)))
              
              // If completed, update the user content
              if (status.status === 'completed' && status.audioUrl) {
                setUserContent(prev => prev.map(item => 
                  item.id === song.id 
                    ? { ...item, status: 'ready', audio_url: status.audioUrl }
                    : item
                ))
                
                addToast({
                  type: 'success',
                  title: 'Song Ready!',
                  message: `${song.title} has been generated and is ready to listen!`
                })
                
                // Stop polling this song
                stopPollingSong(song.id)
              } else if (status.status === 'failed') {
                setUserContent(prev => prev.map(item => 
                  item.id === song.id 
                    ? { ...item, status: 'failed' }
                    : item
                ))
                
                addToast({
                  type: 'error',
                  title: 'Song Generation Failed',
                  message: `${song.title} failed to generate. You can try again.`
                })
                
                // Stop polling this song
                stopPollingSong(song.id)
              }
            },
            (error) => {
              console.error(`Error polling song ${song.id}:`, error)
              addToast({
                type: 'error',
                title: 'Status Check Failed',
                message: 'Failed to check song status. Please refresh the page.'
              })
              
              // Stop polling this song on error
              stopPollingSong(song.id)
            },
            10000 // Poll every 10 seconds
          )
          
          // Store cleanup function in ref
          cleanupFunctionsRef.current.set(song.id, cleanup)
        })
      }
    }
  }, [userContent, user?.id]) // Removed pollingSongs from dependencies

  // Cleanup polling when component unmounts
  useEffect(() => {
    return () => {
      console.log('Cleaning up all polling on component unmount')
      // Call all cleanup functions
      cleanupFunctionsRef.current.forEach((cleanup, songId) => {
        console.log(`Stopping polling for song ${songId}`)
        cleanup()
      })
      // Clear the ref
      cleanupFunctionsRef.current.clear()
    }
  }, []) // Empty dependency array - only run on unmount

  const handlePlaySong = (item: UserContentItem) => {
    const button = getButtonForContent(item);
    
    switch (button.action) {
      case 'listen':
        handleListenClick(item)
        break;
        
      case 'progress':
        // Show progress modal
        setProgressItem(item);
        setShowProgressModal(true);
        break;
        
      case 'retry':
        // Navigate to lyrics display page to retry generation
        if (item.request_id) {
          router.push(`/lyrics-display?requestId=${item.request_id}`)
        }
        break;
        
      case 'generate':
        // Navigate to lyrics display page to generate song
        if (item.request_id) {
          router.push(`/lyrics-display?requestId=${item.request_id}`)
        }
        break;
        
      case 'view':
      case 'review':
      default:
        // Navigate to lyrics display page
        if (item.request_id) {
          router.push(`/lyrics-display?requestId=${item.request_id}`)
        }
        break;
    }
  }

  const handleDeleteSong = async (item: UserContentItem) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        const response = await fetch('/api/delete-content', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contentId: item.id,
            contentType: item.type
          })
        });

        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || 'Failed to delete item');
        }

        // Remove from local state
        const updatedContent = userContent.filter(content => content.id !== item.id);
        setUserContent(updatedContent);
        
        addToast({
          type: 'success',
          title: 'Deleted',
          message: 'Item deleted successfully'
        });
      } catch (error) {
        console.error('Error deleting item:', error);
        addToast({
          type: 'error',
          title: 'Delete Failed',
          message: error instanceof Error ? error.message : 'Failed to delete item'
        });
      }
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleRefresh = () => {
    loadUserContent()
  }

  const handleVariantSelect = async (item: UserContentItem, variantIndex: number) => {
    if (!item.song_id) return

    try {
      const response = await fetch(`/api/song-variants/${item.song_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variantIndex: variantIndex
        })
      })

      if (!response.ok) {
        throw new Error('Failed to select variant')
      }

      const result = await response.json()

      if (result.success) {
        // Update local state
        setUserContent(prev => prev.map(content => 
          content.id === item.id 
            ? { 
                ...content, 
                selected_variant: variantIndex,
                audio_url: result.selectedVariant.audioUrl
              }
            : content
        ))

        addToast({
          type: 'success',
          title: 'Variant Selected',
          message: `Now playing variant ${variantIndex + 1}`
        })
      }
    } catch (error) {
      console.error('Error selecting variant:', error)
      addToast({
        type: 'error',
        title: 'Variant Selection Failed',
        message: 'Failed to select variant. Please try again.'
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (item: UserContentItem) => {
    const button = getButtonForContent(item)
    return (
      <Badge 
        variant={button.variant === 'destructive' ? 'destructive' : 'default'}
        className={button.variant === 'destructive' ? 'bg-red-500' : 'bg-green-500'}
      >
        {button.text}
      </Badge>
    )
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-yellow-400" />
          <p className="text-white">Loading your songs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation Header */}
      <Header />
      
      {/* Page Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">My Songs</h1>
              <p className="text-gray-300">All your generated songs in one place</p>
            </div>
            
            <Button
              onClick={handleRefresh}
              variant="ghost"
              className="text-white hover:bg-white/10"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters - Always Visible */}
        {userContent.length > 0 && (
          <div className="mb-6 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Search by title or recipient name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-yellow-500"
                />
                {searchQuery && (
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* Filter Chips */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-300 text-sm">Filters:</span>
                </div>

                {/* Filter Chips Container */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-400 font-medium self-center mr-2">Status:</span>
                  {[
                    { value: 'all', label: 'All Status', icon: '🔍' },
                    { value: 'ready', label: 'Ready to Play', icon: '▶️' },
                    { value: 'processing', label: 'Processing', icon: '⏳' },
                    { value: 'draft', label: 'Draft/Review', icon: '📄' },
                    { value: 'failed', label: 'Failed', icon: '❌' }
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => setStatusFilter(status.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                        statusFilter === status.value
                          ? 'bg-yellow-500 text-black hover:bg-yellow-600'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600 border border-gray-600'
                      }`}
                    >
                      <span className="mr-1">{status.icon}</span>
                      {status.label}
                    </button>
                  ))}

                  {/* Clear All Filters */}
                  {(searchQuery || statusFilter !== 'all') && (
                    <button
                      onClick={clearFilters}
                      className="px-3 py-1.5 rounded-full text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-all duration-200 border border-red-500"
                    >
                      <X className="w-4 h-4 mr-1 inline" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="text-gray-300">
                    Showing {filteredContent.length} of {userContent.length} item{userContent.length !== 1 ? 's' : ''}
                  </p>
                  {(searchQuery || statusFilter !== 'all') && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        {[searchQuery, statusFilter !== 'all'].filter(Boolean).length} filter{([searchQuery, statusFilter !== 'all'].filter(Boolean).length !== 1) ? 's' : ''} active
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
        )}

        {/* Content Display */}
        {userContent.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/30">
            <CardContent className="p-8 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">No Content Yet</h3>
              <p className="text-gray-300 mb-4">
                Generate your first personalized song to see it here!
              </p>
              <Button
                onClick={() => router.push('/')}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              >
                Create Your First Song
              </Button>
            </CardContent>
          </Card>
        ) : filteredContent.length === 0 ? (
          <Card className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/30">
            <CardContent className="p-8 text-center">
              <Music className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
              <h3 className="text-xl font-bold text-white mb-2">No Results Found</h3>
              <p className="text-gray-300 mb-4">
                Try adjusting your search or filters to find what you&apos;re looking for.
              </p>
              {(searchQuery || statusFilter !== 'all') && (
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Current filters:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {searchQuery && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Search: &quot;{searchQuery}&quot;
                      </span>
                    )}
                    {statusFilter !== 'all' && (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full border border-yellow-500/30">
                        Status: {statusFilter}
                      </span>
                    )}
                  </div>
                </div>
              )}
              <Button
                onClick={clearFilters}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
              >
                Clear All Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContent.map((item) => {
                const button = getButtonForContent(item)
                return (
                  <Card 
                    key={`${item.type}-${item.id}`} 
                    className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/30 hover:bg-yellow-500/10 transition-all duration-300 cursor-pointer group"
                    onClick={() => handlePlaySong(item)}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-white text-lg font-bold line-clamp-1 group-hover:text-yellow-300 transition-colors">
                          {item.title}
                        </CardTitle>
                        {getStatusBadge(item)}
                      </div>
                      <p className="text-gray-400 text-sm">
                        Created: {formatDate(item.created_at)}
                      </p>
                      <p className="text-gray-500 text-xs">
                        For: {item.recipient_name}
                      </p>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="bg-yellow-500/10 rounded-lg p-3">
                        <p className="text-gray-300 text-sm">
                          Type: {item.type.replace('_', ' ').toUpperCase()}
                        </p>
                        {item.audio_url && (
                          <p className="text-green-400 text-xs mt-1">
                            🎵 Audio available
                          </p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex space-x-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              if (button.action === 'listen') {
                                handleListenClick(item)
                              } else {
                                handlePlaySong(item)
                              }
                            }}
                            className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
                          >
                            <Play className="w-4 h-4 mr-2" />
                            {button.text}
                          </Button>
                          
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteSong(item)
                            }}
                            variant="outline"
                            size="icon"
                            className="border-red-300 text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
          </div>
        )}
      </div>

      {/* Progress Modal */}
      {showProgressModal && progressItem && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Card className="bg-gray-800/95 backdrop-blur-sm border-yellow-500/30 max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Song Generation in Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {progressItem.title}
                </h3>
                <p className="text-gray-300 mb-4">
                  Your personalized song is being generated. This usually takes 2-3 minutes.
                </p>
                
                <div className="bg-yellow-500/10 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-yellow-400" />
                    <span className="text-yellow-400 text-sm">
                      Processing your song...
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-400 text-sm">
                  We&apos;ll automatically update this page when your song is ready!
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  onClick={() => setShowProgressModal(false)}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowProgressModal(false);
                    loadUserContent(); // Refresh the data
                  }}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
                >
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Variant Selection Modal */}
      {showVariantModal && selectedSongForVariants && (
        <VariantSelectionModal
          isOpen={showVariantModal}
          onClose={() => {
            setShowVariantModal(false)
            setSelectedSongForVariants(null)
          }}
          songTitle={selectedSongForVariants.title}
          variants={selectedSongForVariants.variants || []}
          onSelectVariant={handleVariantSelectForPlayer}
        />
      )}

      {/* MediaPlayer Modal */}
      {selectedSong && (
        <MediaPlayer
          song={selectedSong}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  )
}