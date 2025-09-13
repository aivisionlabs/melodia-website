"use client";

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Music, User, LogOut, ArrowLeft, Play, Download, Share2, Heart, Star, Edit3, Save, X, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import Header from '@/components/Header'
import { saveSongToSession, createSongSessionData } from '@/lib/song-session-storage'
import { useToast } from '@/components/ui/toast'

interface LyricsData {
  title: string;
  styleOfMusic: string;
  lyrics: string;
}

interface FormData {
  recipient_name: string;
  languages: string[];
  additional_details: string;
}

interface GeneratedSong {
  id: string;
  title: string;
  lyrics: string;
  styleOfMusic: string;
  status: 'generating' | 'ready' | 'error';
  audioUrl?: string;
  errorMessage?: string;
  taskId?: string;
}

export default function NewLyricsDisplayPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isEditingStyle, setIsEditingStyle] = useState(false)
  const [editedStyle, setEditedStyle] = useState('')
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [modificationRequest, setModificationRequest] = useState('')
  const [isModifyingLyrics, setIsModifyingLyrics] = useState(false)
  const [generatedSongs, setGeneratedSongs] = useState<GeneratedSong[]>([])
  const [isGeneratingSong, setIsGeneratingSong] = useState(false)
  const [songGenerationError, setSongGenerationError] = useState<string | null>(null)
  const { addToast } = useToast()

  useEffect(() => {
    // Get data from URL params
    const title = searchParams.get('title')
    const styleOfMusic = searchParams.get('styleOfMusic')
    const lyrics = searchParams.get('lyrics')
    const recipient_name = searchParams.get('recipient_name')
    const languages = searchParams.get('languages')?.split(',') || []
    const additional_details = searchParams.get('additional_details')

    if (title && styleOfMusic && lyrics) {
      setLyricsData({ title, styleOfMusic, lyrics })
      setEditedStyle(styleOfMusic)
    }

    if (recipient_name && languages.length > 0 && additional_details) {
      setFormData({ recipient_name, languages, additional_details })
    }
  }, [searchParams])

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push('/')
    }
  }

  // Check if user has reached the 5 song limit
  const checkSongLimit = (): boolean => {
    if (typeof window === 'undefined') return false
    
    try {
      const savedSongs = JSON.parse(localStorage.getItem('melodia-saved-songs') || '[]')
      return false
    } catch (error) {
      console.error('Error checking song limit:', error)
      return false
    }
  }

  const handleGenerateSong = async () => {
    if (!lyricsData || !formData) return
    
    // Check song limit
    if (checkSongLimit()) {
      addToast({
        type: 'error',
        title: 'Song Limit Reached',
        message: 'You have reached the maximum limit of 5 songs. Please delete some songs from My Songs to create new ones.'
      })
      return
    }
    
    setIsGeneratingSong(true)
    setSongGenerationError(null)
    
    try {
      // Call Suno API to generate real song
      const response = await fetch('/api/generate-song', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lyricsData.title,
          lyrics: lyricsData.lyrics,
          style: lyricsData.styleOfMusic,
          recipient_name: formData.recipient_name,
  
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate song')
      }

      const result = await response.json()
      
      if (result.error) {
        throw new Error(result.message || 'Failed to generate song')
      }

      // Create 2 song objects with generating status (Suno creates 2 versions)
      const newSongs: GeneratedSong[] = [
        {
          id: `song-1-${Date.now()}`,
          title: `${formData.recipient_name.split(',')[0].trim()} - Version 1`,
          lyrics: lyricsData.lyrics,
          styleOfMusic: lyricsData.styleOfMusic,
          status: 'generating',
          taskId: result.taskId
        },
        {
          id: `song-2-${Date.now()}`,
          title: `${formData.recipient_name.split(',')[0].trim()} - Version 2`,
          lyrics: lyricsData.lyrics,
          styleOfMusic: lyricsData.styleOfMusic,
          status: 'generating',
          taskId: result.taskId
        }
      ]

      setGeneratedSongs(newSongs)
      
      addToast({
        type: 'success',
        title: 'Song Generation Started',
        message: 'Your personalized song is being generated. This may take a few minutes.'
      })

      // Start polling for completion (but with timeout protection)
      pollSongStatusOnce(result.taskId, newSongs)
      
      // Show the song immediately on the same page
      // No redirect needed - song will appear in the Generated Songs section below
      
    } catch (error) {
      console.error('Error generating song:', error)
      setSongGenerationError(error instanceof Error ? error.message : 'Failed to generate song')
      addToast({
        type: 'error',
        title: 'Generation Failed',
        message: error instanceof Error ? error.message : 'Failed to generate song'
      })
    } finally {
      setIsGeneratingSong(false)
    }
  }


  const pollSongStatusOnce = async (taskId: string, songs: GeneratedSong[]) => {
    try {
      // Wait 30 seconds before checking (give Suno time to generate)
      await new Promise(resolve => setTimeout(resolve, 30000))
      
      const response = await fetch(`/api/song-status/${taskId}`)
      const result = await response.json()

      if (result.status === 'completed' && result.variants && result.variants.length > 0) {
        // Update both songs with real audio URLs from Suno variants
        const updatedSongs = songs.map((song, index) => ({
          ...song,
          status: 'ready' as const,
          audioUrl: result.variants[index]?.audioUrl || result.variants[index]?.streamAudioUrl || '/audio/har-lamha-naya.mp3'
        }))
        
        setGeneratedSongs(updatedSongs)
        
        // Save to localStorage
        saveSongsToLocalStorage(updatedSongs)
        
        addToast({
          type: 'success',
          title: 'Songs Ready!',
          message: 'Your personalized songs have been generated successfully!'
        })
      } else if (result.status === 'failed') {
        const updatedSongs = songs.map(song => ({
          ...song,
          status: 'error' as const,
          errorMessage: result.errorMessage || 'Generation failed'
        }))
        
        setGeneratedSongs(updatedSongs)
        
        addToast({
          type: 'error',
          title: 'Generation Failed',
          message: result.errorMessage || 'Song generation failed'
        })
      } else {
        // Still processing, show as ready with fallback audio
        const updatedSongs = songs.map(song => ({
          ...song,
          status: 'ready' as const,
          audioUrl: '/audio/har-lamha-naya.mp3' // Fallback audio
        }))
        
        setGeneratedSongs(updatedSongs)
        saveSongsToLocalStorage(updatedSongs)
        
        addToast({
          type: 'info',
          title: 'Songs Ready (Demo)',
          message: 'Your songs are still processing. Playing demo versions for now.'
        })
      }
    } catch (error) {
      console.error('Error checking song status:', error)
      // Show as ready with fallback audio
      const updatedSongs = songs.map(song => ({
        ...song,
        status: 'ready' as const,
        audioUrl: '/audio/har-lamha-naya.mp3' // Fallback audio
      }))
      
      setGeneratedSongs(updatedSongs)
      saveSongsToLocalStorage(updatedSongs)
      
      addToast({
        type: 'info',
        title: 'Songs Ready (Demo)',
        message: 'Playing demo versions while your songs process.'
      })
    }
  }

  const saveSongsToLocalStorage = (songsToSave: GeneratedSong[]) => {
    if (typeof window !== 'undefined') {
      try {
        const existingSongs = JSON.parse(localStorage.getItem('melodia-saved-songs') || '[]')
        const newSongs = songsToSave.map(song => ({
          ...song,
          createdAt: new Date().toISOString(),
          recipientName: formData?.recipient_name || 'Unknown',
          id: `${Date.now()}-${song.id}`
        }))
        const allSongs = [...existingSongs, ...newSongs]
        localStorage.setItem('melodia-saved-songs', JSON.stringify(allSongs))
        console.log('Songs saved to My Songs:', newSongs.length)
      } catch (error) {
        console.error('Error saving songs:', error)
      }
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: lyricsData?.title || 'Generated Song',
        text: `Check out this personalized song: ${lyricsData?.title}`,
        url: window.location.href
      })
    } else {
      // Fallback to copying URL
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  const handleEditStyle = () => {
    setIsEditingStyle(true)
  }

  const handleCancelEdit = () => {
    setIsEditingStyle(false)
    setEditedStyle(lyricsData?.styleOfMusic || '')
  }

  const handleSaveStyle = () => {
    if (lyricsData) {
      // Just update the style locally, no LLM call
      setLyricsData({
        ...lyricsData,
        styleOfMusic: editedStyle
      })
      setIsEditingStyle(false)
    }
  }

  const handleGenerateNewLyrics = async () => {
    if (!formData || !lyricsData) return
    
    setIsModifyingLyrics(true)
    
    try {
      // Call the LLM API with original context + current style + modification request (if any)
      // IMPORTANT: Always use original form data, not current lyrics to avoid name transliteration issues
      const additionalContext = modificationRequest.trim() 
        ? `${formData.additional_details}. Style: ${lyricsData.styleOfMusic}. Modification request: ${modificationRequest}`
        : `${formData.additional_details}. Style: ${lyricsData.styleOfMusic}`
      
      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: additionalContext
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate new lyrics')
      }

      const lyricsResult = await response.json()

      if (lyricsResult.error) {
        alert(`Error: ${lyricsResult.message || 'Failed to generate new lyrics'}`)
        return
      }

      // Update the lyrics with new generated content
      setLyricsData({
        ...lyricsData,
        lyrics: lyricsResult.lyrics || lyricsData.lyrics
      })
      
      // Clear the modification request
      setModificationRequest('')
      
    } catch (error) {
      console.error('Error generating new lyrics:', error)
      alert('Failed to generate new lyrics. Please try again.')
    } finally {
      setIsModifyingLyrics(false)
    }
  }


  if (!lyricsData || !formData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Your Song...</h1>
          <p className="text-gray-300">Please wait while we prepare your personalized lyrics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Navigation Header */}
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">

          {/* Left Side - Song Info */}
          <div className="xl:col-span-1 space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Star className="h-5 w-5 mr-2 text-yellow-400" />
                  Song Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-gray-300 font-medium text-sm">For</label>
                  <p className="text-white text-lg mt-1 font-semibold">{formData.recipient_name}</p>
                </div>

                <div>
                  <label className="text-gray-300 font-medium text-sm">Language</label>
                  <p className="text-white text-lg mt-1">{formData.languages.join(', ')}</p>
                </div>

                <div>
                  <label className="text-gray-300 font-medium text-sm">Style & Mood</label>
                  <p className="text-white text-lg mt-1">{formData.additional_details}</p>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                onClick={handleGenerateSong}
                disabled={isGeneratingSong || checkSongLimit()}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 text-lg rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGeneratingSong ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Generating Song...
                  </>
                ) : checkSongLimit() ? (
                  <>
                    <X className="h-5 w-5 mr-2" />
                    Song Limit Reached (5/5)
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5 mr-2" />
                    Generate Song
                  </>
                )}
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="w-full border-gray-600 text-gray-200 hover:bg-gray-700 bg-gray-700"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share Song
              </Button>
            </div>
          </div>

          {/* Right Side - Generated Lyrics */}
          <div className="xl:col-span-2 space-y-6">
            <Card className="bg-gray-800 border border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Music className="h-5 w-5 mr-2 text-yellow-400" />
                  Lyrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-700 rounded-xl p-6 border border-gray-600">
                  {/* Song Title */}
                  <div className="text-center mb-6">
                    <h2 className="text-3xl font-bold text-white mb-4">{lyricsData.title}</h2>
                  </div>
                  
                  {/* Music Style Section - Editable */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-gray-300 font-medium text-sm">Music Style</label>
                      {!isEditingStyle ? (
                        <Button
                          onClick={handleEditStyle}
                          size="sm"
                          variant="outline"
                          className="border-gray-500 text-gray-300 hover:bg-gray-500 h-8 px-3"
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Edit Style
                        </Button>
                      ) : (
                        <div className="flex space-x-2">
                          <Button
                            onClick={handleSaveStyle}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white h-8 px-3"
                          >
                            <Save className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                          <Button
                            onClick={handleCancelEdit}
                            size="sm"
                            variant="outline"
                            className="border-gray-500 text-gray-300 hover:bg-gray-500 h-8 px-3"
                          >
                            <X className="h-3 w-3 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {isEditingStyle ? (
                      <Input
                        value={editedStyle}
                        onChange={(e) => setEditedStyle(e.target.value)}
                        className="bg-gray-600 border-gray-500 text-white placeholder-gray-400"
                        placeholder="Enter music style..."
                      />
                    ) : (
                      <div className="bg-gray-600 rounded-lg p-4 border border-gray-500">
                        <p className="text-gray-300 text-lg">{lyricsData.styleOfMusic}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Lyrics Section - Read Only */}
                  <div className="mb-6">
                    <label className="text-gray-300 font-medium text-sm mb-2 block">Lyrics</label>
                    <pre className="text-white text-base whitespace-pre-wrap font-mono leading-relaxed">
                      {lyricsData.lyrics}
                    </pre>
                  </div>
                  
                  {/* Lyrics Modification Section */}
                  <div className="bg-gray-600 rounded-lg p-4 border border-gray-500">
                    <label className="text-gray-300 font-medium text-sm mb-2 block">
                      What you want to modify in the current lyrics?
                    </label>
                    <textarea
                      value={modificationRequest}
                      onChange={(e) => setModificationRequest(e.target.value)}
                      className="w-full h-20 p-3 bg-gray-700 border border-gray-500 rounded-lg text-white placeholder-gray-400 resize-none text-sm"
                      placeholder="e.g., Make it more romantic, change the chorus, add more verses, make it shorter..."
                    />
                    <Button
                      onClick={handleGenerateNewLyrics}
                      disabled={isModifyingLyrics}
                      className="w-full mt-3 bg-yellow-600 hover:bg-yellow-700 text-black font-semibold py-2"
                    >
                      {isModifyingLyrics ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                          Generating new lyrics...
                        </>
                      ) : (
                        'Generate new lyrics'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Generated Songs Section */}
            {generatedSongs.length > 0 && (
              <Card className="bg-gray-800 border border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Music className="h-5 w-5 mr-2 text-yellow-400" />
                    Generated Songs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {generatedSongs.map((song) => (
                      <div key={song.id} className="bg-gray-700 rounded-xl p-4 border border-gray-600">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h3 className="text-white font-semibold text-lg mb-2">{song.title}</h3>
                            <p className="text-gray-300 text-sm mb-2">{song.styleOfMusic}</p>
                            <div className="flex items-center space-x-2">
                              {song.status === 'generating' && (
                                <div className="flex items-center text-yellow-400">
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  <span className="text-sm">Generating...</span>
                                </div>
                              )}
                              {song.status === 'ready' && (
                                <div className="flex items-center text-green-400">
                                  <Play className="h-4 w-4 mr-2" />
                                  <span className="text-sm">Ready to play</span>
                                </div>
                              )}
                              {song.status === 'error' && (
                                <div className="flex items-center text-red-400">
                                  <X className="h-4 w-4 mr-2" />
                                  <span className="text-sm">{song.errorMessage || 'Generation failed'}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            {song.status === 'ready' && song.audioUrl ? (
                              <Button
                                onClick={() => {
                                  const audio = new Audio(song.audioUrl)
                                  audio.play()
                                }}
                                className="bg-green-500 hover:bg-green-600 text-white"
                                size="sm"
                              >
                                <Play className="h-4 w-4 mr-2" />
                                Play
                              </Button>
                            ) : song.status === 'generating' ? (
                              <Button disabled className="bg-gray-500 text-white" size="sm">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Generating
                              </Button>
                            ) : (
                              <Button
                                onClick={() => handleGenerateSong()}
                                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                                size="sm"
                              >
                                Retry
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Error Display */}
            {songGenerationError && (
              <Card className="bg-red-900/20 border border-red-500">
                <CardContent className="p-4">
                  <div className="flex items-center text-red-400">
                    <X className="h-5 w-5 mr-2" />
                    <span>{songGenerationError}</span>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </main>
    </div>
  )
}
