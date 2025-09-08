"use client";

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { SongRequestFormData } from '@/types'
import { createSongRequest } from '@/lib/song-request-actions'
import { Music, User, LogOut, Play, ChevronRight } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'
import { MediaPlayer } from '@/components/MediaPlayer'

export default function HomePage() {
  const { user, loading, logout, isAuthenticated } = useAuth()
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
  const [selectedSong, setSelectedSong] = useState<any>(null)
  const [songLyrics, setSongLyrics] = useState<any[]>([])
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Real songs data for display
  const staticSongs = [
    { 
      id: 1, 
      title: "Ruchi My Queen", 
      genre: "Hip Hop, Rap, Urban", 
      duration: "2:59", 
      audio: "/audio/ruchi-my-queen.mp3", 
      image: "/images/melodia-logo.jpeg",
      lyrics: "/lyrics/ruchi-my-queen.json"
    },
    { 
      id: 2, 
      title: "Kaleidoscope Heart", 
      genre: "Romantic, Acoustic, Ballad", 
      duration: "3:09", 
      audio: "/audio/kaleidoscope.mp3", 
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/kaleidoscope-heart.json"
    },
    { 
      id: 3, 
      title: "Same Office, Different Hearts", 
      genre: "Love Story", 
      duration: "3:15", 
      audio: "/audio/office-love.mp3", 
      image: "/images/melodia-logo-transparent.png",
      lyrics: "/lyrics/same-office-different-hearts.json"
    },
    { 
      id: 4, 
      title: "A Kid's Night Musical", 
      genre: "Musical", 
      duration: "3:01", 
      audio: "/audio/kids-musical.mp3", 
      image: "/images/optimized/logo-large.png",
      lyrics: "/lyrics/kids-night-musical.json"
    },
    { 
      id: 5, 
      title: "Lipsa Birthday Song", 
      genre: "Birthday, Celebration, Party", 
      duration: "3:01", 
      audio: "/audio/birthday-queen.mp3", 
      image: "/images/optimized/logo-medium.png",
      lyrics: "/lyrics/lipsa-birthday-song.json"
    },
    { 
      id: 6, 
      title: "Nirvan's Birthday Song", 
      genre: "Birthday Party", 
      duration: "1:53", 
      audio: "/audio/nirvan-birthday.mp3", 
      image: "/images/optimized/logo-small.png",
      lyrics: "/lyrics/nirvan-birthday-song.json"
    },
    { 
      id: 7, 
      title: "Ram and Akanksha's Wedding Anthem", 
      genre: "Wedding", 
      duration: "3:00", 
      audio: "/audio/wedding-anthem.mp3", 
      image: "/images/melodia-logo.png",
      lyrics: "/lyrics/ram-akanksha-wedding-anthem.json"
    },
    { 
      id: 8, 
      title: "Har Lamha Naya", 
      genre: "Romantic", 
      duration: "2:45", 
      audio: "/audio/har-lamha-naya.mp3", 
      image: "/images/melodia-logo.jpeg",
      lyrics: "/lyrics/har-lamha-naya.json"
    },
    { 
      id: 9, 
      title: "Jassi Di Jaan", 
      genre: "Punjabi, Celebration", 
      duration: "2:30", 
      audio: "/audio/jassi-di-jaan.mp3", 
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/jassi-di-jaan.json"
    },
    { 
      id: 10, 
      title: "Sweet Dreams Tonight", 
      genre: "Lullaby", 
      duration: "2:15", 
      audio: "/audio/sweet-dreams-tonight.mp3", 
      image: "/images/melodia-logo-transparent.png",
      lyrics: "/lyrics/sweet-dreams-tonight.json"
    }
  ]

  // Load lyrics when song is selected
  useEffect(() => {
    if (selectedSong && selectedSong.lyrics) {
      const loadLyrics = async () => {
        try {
          const response = await fetch(selectedSong.lyrics)
          const lyrics = await response.json()
          setSongLyrics(lyrics)
        } catch (error) {
          console.error('Error loading lyrics:', error)
          setSongLyrics([])
        }
      }
      loadLyrics()
    }
  }, [selectedSong])

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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.recipient_name.trim()) {
      errors.recipient_name = 'Who is this song for? (Required)'
    } else if (formData.recipient_name.length < 3) {
      errors.recipient_name = 'Name must be at least 3 characters'
    }

    if (!formData.languages || formData.languages.length === 0) {
      errors.languages = 'Please enter a language'
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
    const hasLanguage = formData.languages && formData.languages.length > 0
    const hasAdditionalDetails = (formData.additional_details?.trim().length || 0) > 0
    
    return hasRecipientName && hasLanguage && hasAdditionalDetails
  }

  const handlePlaySong = (song: any) => {
    setSelectedSong(song)
  }

  const scrollToLast = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth'
      })
    }
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

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      router.push('/')
    }
  }

  if (loading) {
    return <LoadingSpinner size="xl" text="Loading..." />
  }

  return (
    <div className="min-h-screen bg-yellow-100 relative overflow-hidden">
      
      {/* Header */}
      <header className="bg-white border-b border-yellow-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
      </div>
              <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">MELODIA</span>
          </div>

            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{user?.name || user?.email}</span>
          </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link href="/auth/login">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-yellow-300 text-yellow-700 hover:bg-yellow-50 hover:border-yellow-400"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white"
                    >
                      Get Started
                    </Button>
                    </Link>
                </div>
              )}
              </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Song Creation Form */}
        <div className="text-center mb-8 md:mb-12 px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Create Songs In Under 60-Seconds
              </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            <span className="text-yellow-600 font-semibold">HOLD YOUR BREATH:</span> Describe your song and prepare to be surprised.
          </p>
            </div>

        {/* Song Creation Form */}
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto mb-8 md:mb-16 px-4">
          <Card className="bg-white border border-gray-200">
            <CardContent className="p-4 md:p-8">

              {/* Form Fields */}
              <div className="space-y-4 md:space-y-6">
                {/* Who is this song for? */}
                <div className="space-y-2">
                  <Label htmlFor="recipient_name" className="text-gray-700 font-medium text-sm md:text-base">
                    Who is this song for?
                  </Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                    placeholder="e.g., LiLi, my wife"
                    className="h-12 md:h-14 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500 text-sm md:text-base"
                  />
                  {validationErrors.recipient_name && (
                    <p className="text-red-500 text-xs md:text-sm">{validationErrors.recipient_name}</p>
                  )}
          </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label htmlFor="languages" className="text-gray-700 font-medium text-sm md:text-base">
                    Language
                  </Label>
                  <Input
                    id="languages"
                    value={formData.languages?.join(', ') || ''}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
                    placeholder="Hindi, English, or any language"
                    className="h-12 md:h-14 bg-white border border-gray-300 text-gray-900 placeholder-gray-500 focus:border-yellow-500 text-sm md:text-base"
                  />
                  <p className="text-gray-500 text-xs md:text-sm">Type any language you want the song in</p>
                </div>

                {/* Tell us more about the song */}
                <div className="space-y-2">
                  <Label htmlFor="additional_details" className="text-gray-700 font-medium text-sm md:text-base">
                    Tell us more about the song
                  </Label>
                  <textarea
                    id="additional_details"
                    value={formData.additional_details}
                    onChange={(e) => handleInputChange('additional_details', e.target.value)}
                    placeholder="Basic details about who the song is for, their story, genre, style preferences..."
                    className="w-full h-24 md:h-32 p-3 md:p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:border-yellow-500 resize-none text-sm md:text-base"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-gray-500 text-xs md:text-sm">Share the story, genre, and style you want</p>
                    <p className="text-gray-500 text-xs md:text-sm">{(formData.additional_details || '').length}/1000</p>
                  </div>
                  {validationErrors.additional_details && (
                    <p className="text-red-500 text-xs md:text-sm">{validationErrors.additional_details}</p>
                  )}
                </div>

                {/* Hidden fields for form compatibility */}
                <input type="hidden" name="recipient_relationship" value={formData.recipient_relationship || 'friend'} />
                <input type="hidden" name="person_description" value={formData.person_description || ''} />
                <input type="hidden" name="song_type" value={formData.song_type || ''} />

                {/* Error Display */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isSubmitting}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-8 md:px-12 py-3 md:py-4 text-base md:text-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 md:h-5 md:w-5 border-b-2 border-white mr-2 md:mr-3"></div>
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
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4 md:mb-6 text-center">Popular Songs</h2>
          <div className="relative">
            <div 
              ref={scrollContainerRef}
              className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide"
            >
              {staticSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-48 md:w-64 bg-white border border-gray-200 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer group"
                >
                  <div className="relative">
                    <img 
                      src={song.image} 
                      alt={song.title}
                      className="w-full h-36 md:h-48 object-cover"
                    />
                    <div className="absolute top-2 md:top-4 right-2 md:right-4">
                      <button
                        onClick={() => handlePlaySong(song)}
                        className="w-6 h-6 md:w-8 md:h-8 bg-yellow-500 hover:bg-yellow-600 rounded-full flex items-center justify-center transition-colors duration-200"
                      >
                        <Play className="h-3 w-3 md:h-4 md:w-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="p-3 md:p-4">
                    <h3 className="text-gray-900 font-semibold text-base md:text-lg mb-1">{song.title}</h3>
                    <p className="text-gray-600 text-xs md:text-sm mb-1">{song.genre}</p>
                    <p className="text-gray-500 text-xs">{song.duration}</p>
            </div>
          </div>
              ))}
          </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
              <button
                onClick={scrollToLast}
                className="w-8 h-16 bg-yellow-100 hover:bg-yellow-200 rounded-l-lg flex items-center justify-center transition-colors duration-200"
              >
                <ChevronRight className="h-6 w-6 text-yellow-600" />
              </button>
            </div>
          </div>
        </div>
      </main>


      {/* MediaPlayer Modal */}
      {selectedSong && (
        <MediaPlayer
          song={{
            title: selectedSong.title,
            artist: selectedSong.genre,
            song_url: selectedSong.audio,
            slug: selectedSong.title.toLowerCase().replace(/\s+/g, '-'),
            lyrics: songLyrics
          }}
          onClose={() => setSelectedSong(null)}
        />
      )}
    </div>
  )
}