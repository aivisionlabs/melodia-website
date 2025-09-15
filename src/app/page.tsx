"use client";

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { SongRequestFormData, PublicSong, SongRequest } from '@/types'
import { createSongRequest, getUserSongs, getUserSongRequests } from '@/lib/song-request-actions'
import { fetchUserContent, UserContentItem, getButtonForContent } from '@/lib/user-content-client'
// import { generateLyrics } from '@/lib/llm-integration' // No longer needed - using API directly
import { Music, User, LogOut, Play, ChevronRight, Menu, X, Clock, CheckCircle, XCircle, Heart, Globe, MessageCircle } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/components/ui/toast'
import { MediaPlayer } from '@/components/MediaPlayer'
import PaymentModal from '@/components/PaymentModal'
import PaymentRequired from '@/components/PaymentRequired'
import { isPaymentEnabled } from '@/lib/payment-config'

export default function HomePage() {
  const { user, loading, logout, isAuthenticated } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
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
    languages: [],
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

  // Dashboard state for authenticated users
  const [userSongs, setUserSongs] = useState<PublicSong[]>([])
  const [songRequests, setSongRequests] = useState<SongRequest[]>([])
  const [userContent, setUserContent] = useState<UserContentItem[]>([])
  const [isLoadingSongs, setIsLoadingSongs] = useState(false)

  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showPaymentRequired, setShowPaymentRequired] = useState(false)
  const [pendingSongRequest, setPendingSongRequest] = useState<any>(null)
  const [selectedPlanId, setSelectedPlanId] = useState<number>(1) // Default to Basic Plan

  // Real songs data for display
  const staticSongs = [
    {
      id: 1,
      title: "Ruchi My Queen",
      genre: "Hip Hop, Rap, Urban",
      duration: "2:59",
      audio: "/audio/ruchi-my-queen.mp3",
      image: "/images/melodia-logo-og.jpeg",
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
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/same-office-different-hearts.json"
    },
    {
      id: 4,
      title: "A Kid's Night Musical",
      genre: "Musical",
      duration: "3:01",
      audio: "/audio/kids-musical.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/kids-night-musical.json"
    },
    {
      id: 5,
      title: "Lipsa Birthday Song",
      genre: "Birthday, Celebration, Party",
      duration: "3:01",
      audio: "/audio/birthday-queen.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/lipsa-birthday-song.json"
    },
    {
      id: 6,
      title: "Nirvan's Birthday Song",
      genre: "Birthday Party",
      duration: "1:53",
      audio: "/audio/nirvan-birthday.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/nirvan-birthday-song.json"
    },
    {
      id: 7,
      title: "Ram and Akanksha's Wedding Anthem",
      genre: "Wedding",
      duration: "3:00",
      audio: "/audio/wedding-anthem.mp3",
      image: "/images/melodia-logo-og.jpeg",
      lyrics: "/lyrics/ram-akanksha-wedding-anthem.json"
    },
    {
      id: 8,
      title: "Har Lamha Naya",
      genre: "Romantic",
      duration: "2:45",
      audio: "/audio/har-lamha-naya.mp3",
      image: "/images/melodia-logo-og.jpeg",
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
      image: "/images/melodia-logo-og.jpeg",
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

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    }
  }, [isAuthenticated, user])

  // Pre-fill user data if available and restore pending form data
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        requester_name: user.name || '',
        email: user.email || ''
      }))

      // Check if there's pending form data from before login
      const pendingFormData = sessionStorage.getItem('pendingLyricsForm')
      if (pendingFormData) {
        try {
          const parsedData = JSON.parse(pendingFormData)
          setFormData(prev => ({
            ...prev,
            ...parsedData,
            requester_name: user.name || parsedData.recipient_name || '',
            email: user.email || parsedData.email || ''
          }))

          // Clear the pending form data
          sessionStorage.removeItem('pendingLyricsForm')

          // Show success message
          addToast({
            type: 'success',
            title: 'Welcome back!',
            message: 'Your form has been restored. You can now create your lyrics!'
          })
        } catch (error) {
          console.error('Error parsing pending form data:', error)
          sessionStorage.removeItem('pendingLyricsForm')
        }
      }
    }
  }, [user, addToast])

  const loadUserData = async () => {
    if (!user?.id) return

    try {
      setIsLoadingSongs(true)

      // Load user's content (lyrics drafts + songs + requests) via API
      const content = await fetchUserContent(user.id)
      setUserContent(content)

      // Also load the old data for backward compatibility
      const [songsResult, requestsResult] = await Promise.all([
        getUserSongs(user.id),
        getUserSongRequests(user.id)
      ])

      if (songsResult.success) {
        setUserSongs(songsResult.songs || [])
      }

      if (requestsResult.success) {
        setSongRequests(requestsResult.requests || [])
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

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Check for name + relation format
    if (!formData.recipient_name.trim()) {
      errors.recipient_name = 'Who is this song for? (Required)'
    } else if (formData.recipient_name.length < 3) {
      errors.recipient_name = 'Name must be at least 3 characters'
    } else if (!formData.recipient_name.includes(',')) {
      errors.recipient_name = 'Please include relation (e.g., "Sonu, my friend")'
    }

    // Check for proper language
    if (!formData.languages || formData.languages.length === 0) {
      errors.languages = 'Please enter a language'
    } else {
      const validLanguages = ['hindi', 'english', 'punjabi', 'bengali', 'tamil', 'telugu', 'gujarati', 'marathi', 'kannada', 'malayalam', 'odia', 'assamese', 'urdu', 'sanskrit']
      const hasValidLanguage = formData.languages.some(lang =>
        validLanguages.some(valid => lang.toLowerCase().includes(valid))
      )
      if (!hasValidLanguage) {
        errors.languages = 'Please enter a valid language (e.g., Hindi, English, Punjabi)'
      }
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

    // Clear any previous state when user makes changes
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

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }


  // Payment handlers
  const handlePaymentRequired = () => {
    setShowPaymentRequired(false)
    setShowPaymentModal(true)
  }

  const handlePaymentSuccess = async (paymentId: number) => {
    setShowPaymentModal(false)
    
    if (pendingSongRequest) {
      // Now try to generate lyrics again with payment completed
      try {
        const lyricsResponse = await fetch('/api/generate-lyrics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipient_name: pendingSongRequest.formData.recipient_name,
            languages: pendingSongRequest.formData.languages,
            additional_details: pendingSongRequest.formData.additional_details || '',
            requestId: pendingSongRequest.requestId,
            userId: user?.id
          })
        })

        if (lyricsResponse.ok) {
          const lyricsResult = await lyricsResponse.json()
          
          // Store the generated lyrics
          const storeResponse = await fetch('/api/store-lyrics', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requestId: pendingSongRequest.requestId,
              lyrics: lyricsResult.lyrics,
              recipient_name: pendingSongRequest.formData.recipient_name,
              languages: pendingSongRequest.formData.languages,
              additional_details: pendingSongRequest.formData.additional_details || ''
            })
          })

          addToast({
            type: 'success',
            title: 'Payment Successful!',
            message: 'Your personalized lyrics have been created successfully!'
          })

          // Redirect to lyrics display page
          router.push(`/lyrics-display?requestId=${pendingSongRequest.requestId}`)
        } else {
          throw new Error('Failed to generate lyrics after payment')
        }
      } catch (error) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Payment successful but failed to generate lyrics. Please try again.'
        })
      }
    }
    
    setPendingSongRequest(null)
  }

  const handlePaymentError = (error: string) => {
    addToast({
      type: 'error',
      title: 'Payment Failed',
      message: error
    })
  }

  const handlePaymentCancel = () => {
    setShowPaymentModal(false)
    setShowPaymentRequired(false)
    setPendingSongRequest(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // Check if user is authenticated first
    if (!isAuthenticated) {
      // Store form data in session storage for after login
      sessionStorage.setItem('pendingLyricsForm', JSON.stringify(formData))

      // Show message and redirect to login
      addToast({
        type: 'info',
        title: 'Login Required',
        message: 'Please log in to create your personalized lyrics!'
      })

      router.push('/auth/login')
      return
    }

    // Check if payment is enabled
    if (!isPaymentEnabled()) {
      addToast({
        type: 'info',
        title: 'Payment Disabled',
        message: 'Payment is currently disabled. You can create songs for free!'
      })
    }

    if (!validateForm()) {
      // Show specific validation errors instead of generic message
      const errors = Object.values(validationErrors).filter(error => error)
      if (errors.length > 0) {
        setError(errors[0]) // Show first error
      } else {
        setError('Please fill in all required fields to continue.')
      }
      return
    }

    setIsSubmitting(true)

    try {
      // Debug: Log form data before sending
      console.log('Form data being sent:', {
        recipient_name: formData.recipient_name,
        languages: formData.languages,
        additional_details: formData.additional_details
      });

      // Step 1: Create song request first (without payment)
      const songRequestResponse = await fetch('/api/create-song-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requester_name: user?.name || 'Anonymous',
          email: user?.email || null,
          recipient_name: formData.recipient_name,
          recipient_relationship: 'friend', // Default value
          languages: formData.languages,
          additional_details: formData.additional_details || '',
          delivery_preference: 'email',
          user_id: user?.id || null
        })
      })

      if (!songRequestResponse.ok) {
        throw new Error('Failed to create song request')
      }

      const songRequestResult = await songRequestResponse.json()

      if (songRequestResult.error) {
        throw new Error(songRequestResult.error)
      }

      const requestId = songRequestResult.requestId

      // Step 2: Try to generate lyrics (this will check payment status)
      const lyricsResponse = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: formData.additional_details || '',
          requestId: requestId,
          userId: user?.id
        })
      })

      if (lyricsResponse.status === 402) {
        // Payment required
        const errorResult = await lyricsResponse.json()
        setPendingSongRequest({ requestId, formData })
        setShowPaymentRequired(true)
        return
      }

      if (!lyricsResponse.ok) {
        const errorResult = await lyricsResponse.json()
        const errorMessage = errorResult.message || 'Failed to generate lyrics. Please try again.'
        
        setError(errorMessage)
        addToast({
          type: 'error',
          title: 'Lyrics Generation Failed',
          message: errorMessage
        })
        return
      }

      const lyricsResult = await lyricsResponse.json()

      if (lyricsResult.error) {
        // Show specific error message in the form
        const errorMessage = lyricsResult.message || 'Failed to generate lyrics. Please try again.'
        const suggestion = lyricsResult.example ? `Suggestion: ${lyricsResult.example}` : ''

        setError(`${errorMessage} ${suggestion}`)
        addToast({
          type: 'error',
          title: 'Lyrics Generation Failed',
          message: errorMessage
        })
        return
      }

      // Step 3: Store the generated lyrics in the database
      const storeResponse = await fetch('/api/store-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: requestId,
          lyrics: lyricsResult.lyrics,
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: formData.additional_details || ''
        })
      })

      if (!storeResponse.ok) {
        // If storing fails, we still have the song request, but no lyrics
        // This is better than having no song request at all
        console.error('Failed to store lyrics, but song request was created')
      }

      addToast({
        type: 'success',
        title: 'Lyrics Generated!',
        message: 'Your personalized lyrics have been created successfully!'
      })

      // Redirect to lyrics display page using requestId instead of query params
      router.push(`/lyrics-display?requestId=${requestId}`)

    } catch (error) {
      const errorMessage = 'Failed to generate lyrics. Please try again.'
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
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">

      {/* Header */}
      <header className="bg-slate-800 border-b border-slate-700 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-yellow-400">MELODIA</span>
            </div>

            <div className="flex items-center space-x-4">
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
                >
                  Contact
                </Link>
                <Link
                  href="/terms"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
                >
                  Terms
                </Link>
                <Link
                  href="/privacy"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  href="/refund"
                  className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
                >
                  Refund
                </Link>
                {isAuthenticated && (
                  <Link
                    href="/my-songs"
                    className="text-gray-300 hover:text-yellow-400 font-medium transition-colors"
                  >
                    My Songs
                  </Link>
                )}
            
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-gray-300 hover:text-yellow-400 p-2"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>

              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-300" />
                    <span className="text-sm text-gray-200">{user?.name || user?.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-slate-600 text-gray-200 hover:bg-slate-700 hover:border-slate-500"
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
                      className="border-slate-600 text-gray-200 hover:bg-slate-700 hover:border-slate-500"
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

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 shadow-lg">
          <nav className="flex flex-col py-2" aria-label="Mobile navigation">
            <Link
              href="/contact"
              className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/terms"
              className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Privacy
            </Link>
            <Link
              href="/refund"
              className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Refund
            </Link>
            <Link
              href="/library"
              className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Library
            </Link>
            {isAuthenticated && (
              <Link
                href="/my-songs"
                className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                My Songs
              </Link>
            )}
            <Link
              href="/#testimonials-title"
              className="px-4 py-3 text-gray-300 hover:text-yellow-400 hover:bg-slate-700 font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Testimonials
            </Link>
          </nav>
        </div>
      )}

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
          <Card className="bg-slate-800 border border-slate-700">
            <CardContent className="p-4 md:p-8">

              {/* Form Fields */}
              <div className="space-y-4 md:space-y-6">
                {/* Who is this song for? */}
                <div className="space-y-2">
                  <Label htmlFor="recipient_name" className="text-gray-200 font-medium text-sm md:text-base">
                    Who is this song for?
                  </Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                    placeholder="e.g., Sonu, my friend"
                    className="h-12 md:h-14 bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-yellow-500 text-sm md:text-base"
                  />
                  {validationErrors.recipient_name && (
                    <p className="text-red-500 text-xs md:text-sm">{validationErrors.recipient_name}</p>
                  )}
                </div>

                {/* Language Selection */}
                <div className="space-y-2">
                  <Label htmlFor="languages" className="text-gray-200 font-medium text-sm md:text-base">
                    Language
                  </Label>
                  <Input
                    id="languages"
                    value={formData.languages?.join(', ') || ''}
                    onChange={(e) => handleInputChange('languages', e.target.value.split(',').map(l => l.trim()).filter(l => l))}
                    placeholder="Hindi, English, Punjabi, etc."
                    className="h-12 md:h-14 bg-slate-700 border border-slate-600 text-white placeholder-gray-400 focus:border-yellow-500 text-sm md:text-base"
                  />
                  <p className="text-gray-400 text-xs md:text-sm">Type a valid language (Hindi, English, Punjabi, etc.)</p>
                  {validationErrors.languages && (
                    <p className="text-red-500 text-xs md:text-sm">{validationErrors.languages}</p>
                  )}
                </div>

                {/* Tell us more about the song */}
                <div className="space-y-2">
                  <Label htmlFor="additional_details" className="text-gray-200 font-medium text-sm md:text-base">
                    Tell us more about the song
                  </Label>
                  <textarea
                    id="additional_details"
                    value={formData.additional_details}
                    onChange={(e) => handleInputChange('additional_details', e.target.value)}
                    placeholder="Basic details about who the song is for, their story, genre, style preferences..."
                    className="w-full h-24 md:h-32 p-3 md:p-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:border-yellow-500 resize-none text-sm md:text-base"
                    maxLength={1000}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-gray-400 text-xs md:text-sm">Share the story, genre, and style you want</p>
                    <p className="text-gray-400 text-xs md:text-sm">{(formData.additional_details || '').length}/1000</p>
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
                  <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-xl">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-200">Error</h3>
                        <div className="mt-2 text-sm text-red-300">
                          {error}
                        </div>
                      </div>
                    </div>
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
                        Generating Lyrics...
                      </div>
                    ) : !isAuthenticated ? (
                      'Login to Create Lyrics'
                    ) : (
                      'Create Lyrics'
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
            <div
              ref={scrollContainerRef}
              className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 scrollbar-hide"
            >
              {staticSongs.map((song) => (
                <div
                  key={song.id}
                  className="flex-shrink-0 w-48 md:w-64 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-200 cursor-pointer group"
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
                    <h3 className="text-white font-semibold text-base md:text-lg mb-1">{song.title}</h3>
                    <p className="text-gray-300 text-xs md:text-sm mb-1">{song.genre}</p>
                    <p className="text-gray-400 text-xs">{song.duration}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 hidden md:block">
              <button
                onClick={scrollToLast}
                className="w-8 h-16 bg-slate-700 hover:bg-slate-600 rounded-l-lg flex items-center justify-center transition-colors duration-200"
              >
                <ChevronRight className="h-6 w-6 text-yellow-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mb-8 md:mb-16 px-4">
          <div className="text-center mb-6 md:mb-8">
            <div className="flex items-center justify-center mb-2">
              <Music className="h-6 w-6 text-yellow-400 mr-2" />
              <h2 className="text-2xl md:text-3xl font-bold text-white">Over 8,000 Stories Turned Into Songs</h2>
            </div>
            <p className="text-gray-300 text-sm md:text-base">watch real reactions, see how our songs touch hearts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
            {/* Testimonial 1 */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-purple-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">Couple&apos;s Love Story</p>
                    <p className="text-xs text-gray-600">Wedding Anniversary Song</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video bg-gradient-to-br from-yellow-100 to-orange-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-orange-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">Birthday Surprise</p>
                    <p className="text-xs text-gray-600">Special Celebration Song</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="aspect-video bg-gradient-to-br from-green-100 to-blue-100 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center shadow-lg">
                    <Play className="h-8 w-8 text-green-600 ml-1" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white bg-opacity-90 rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-800">Family Memories</p>
                    <p className="text-xs text-gray-600">Generational Love Song</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-gray-300 text-sm md:text-base mb-4">Watch how it works - and the emotions it creates.</p>
            <Button
              onClick={scrollToTop}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-3 rounded-xl"
            >
              I WANT TO CREATE ONE TOO
            </Button>
          </div>
        </div>

        {/* My Songs Section - Only show for authenticated users */}
        {isAuthenticated && (
          <div className="mb-8 md:mb-16 px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 text-center">My Songs</h2>
            {isLoadingSongs ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" text="Loading your songs..." />
              </div>
            ) : userContent.length > 0 ? (
              <div className="space-y-4 max-w-4xl mx-auto">
                {userContent.slice(0, 5).map((item) => {
                  const buttonInfo = getButtonForContent(item)
                  return (
                    <div
                      key={item.id}
                      className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-white font-semibold text-lg md:text-xl">
                              {item.title}
                            </h3>
                            <span className="px-2 py-1 bg-slate-600 text-gray-300 rounded text-xs font-medium">
                              {item.type.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm md:text-base mb-1">
                            For {item.recipient_name}
                          </p>
                          <p className="text-gray-400 text-xs md:text-sm">
                            {new Date(item.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            item.status === 'ready' || item.status === 'completed' 
                              ? 'bg-green-500/20 text-green-400'
                              : item.status === 'generating' || item.status === 'processing'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : item.status === 'failed'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}>
                            {item.status}
                          </span>
                          <Button
                            size="sm"
                            variant={buttonInfo.variant}
                            className={`${
                              buttonInfo.variant === 'default' 
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-black'
                                : buttonInfo.variant === 'destructive'
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-slate-600 hover:bg-slate-500 text-white'
                            } font-medium`}
                            onClick={() => {
                              switch (buttonInfo.action) {
                                case 'generate':
                                  router.push(`/lyrics-display?requestId=${item.request_id}`)
                                  break
                                case 'review':
                                  router.push(`/lyrics-display?requestId=${item.request_id}`)
                                  break
                                case 'view':
                                  router.push(`/lyrics-display?requestId=${item.request_id}`)
                                  break
                                case 'listen':
                                  // TODO: Implement audio player
                                  console.log('Play audio:', item.audio_url)
                                  break
                                case 'progress':
                                  router.push(`/my-songs`)
                                  break
                                case 'retry':
                                  router.push(`/lyrics-display?requestId=${item.request_id}`)
                                  break
                                case 'create_lyrics':
                                  router.push(`/create-lyrics/${item.request_id}`)
                                  break
                                default:
                                  router.push(`/my-songs`)
                              }
                            }}
                          >
                            {buttonInfo.text}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {userContent.length > 5 && (
                  <div className="text-center mt-6">
                    <Button
                      onClick={() => router.push('/my-songs')}
                      className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-6 py-3 rounded-xl"
                    >
                      View All Content ({userContent.length})
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Music className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-300 text-lg mb-4">No songs created yet</p>
                <p className="text-gray-400 text-sm">Create your first personalized song above!</p>
              </div>
            )}
          </div>
        )}
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

      {/* Payment Required Modal */}
      {showPaymentRequired && pendingSongRequest && (
        <PaymentRequired
          onProceedToPayment={handlePaymentRequired}
          onCancel={handlePaymentCancel}
          planName="Basic Plan"
          amount={99}
          currency="INR"
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && pendingSongRequest && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={handlePaymentCancel}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
          songRequestId={pendingSongRequest.requestId}
          planId={selectedPlanId}
          amount={99}
          currency="INR"
        />
      )}
    </div>
  )
}
