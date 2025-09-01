'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { AVAILABLE_LANGUAGES, AVAILABLE_EMOTIONS, SongRequestFormData } from '@/types'
import { createSongRequest } from '@/lib/song-request-actions'
import { useToast } from '@/components/ui/toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  User, 
  Phone, 
  Mail, 
  Heart, 
  Music, 
  Send,
  ArrowLeft,
  CheckCircle
} from 'lucide-react'

export default function CreateSongPage() {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const { addToast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/auth/login')
    }
  }, [loading, isAuthenticated, router])

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

    // Required fields validation
    if (!formData.requester_name.trim()) {
      errors.requester_name = 'Your name is required'
    } else if (formData.requester_name.length < 2) {
      errors.requester_name = 'Name must be at least 2 characters'
    }

    if (!formData.recipient_name.trim()) {
      errors.recipient_name = 'Recipient name is required'
    } else if (formData.recipient_name.length < 3) {
      errors.recipient_name = 'Recipient name must be at least 3 characters'
    }

    if (!formData.recipient_relationship.trim()) {
      errors.recipient_relationship = 'Relationship is required'
    }

    if (formData.languages.length === 0) {
      errors.languages = 'Please select at least one language'
    }

    // Contact validation
    if (!formData.phone_number && !formData.email) {
      errors.contact = 'Please provide either phone number or email'
    }

    if (formData.phone_number && !isValidPhone(formData.phone_number)) {
      errors.phone_number = 'Please enter a valid phone number'
    }

    if (formData.email && !isValidEmail(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Delivery preference validation
    if ((formData.phone_number || formData.email) && !formData.delivery_preference) {
      errors.delivery_preference = 'Please select delivery preference'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }

  const handleInputChange = (field: keyof SongRequestFormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleLanguageToggle = (language: string) => {
    const updatedLanguages = formData.languages.includes(language)
      ? formData.languages.filter(l => l !== language)
      : [...formData.languages, language]
    
    handleInputChange('languages', updatedLanguages)
  }

  const handleEmotionToggle = (emotion: string) => {
    const updatedEmotions = formData.emotions?.includes(emotion)
      ? formData.emotions.filter(e => e !== emotion)
      : [...(formData.emotions || []), emotion]
    
    handleInputChange('emotions', updatedEmotions)
  }

  const isFormValid = (): boolean => {
    return !!(
      formData.requester_name.trim() &&
      formData.recipient_name.trim() &&
      formData.recipient_relationship.trim() &&
      formData.languages.length > 0 &&
      (formData.phone_number || formData.email) &&
      formData.delivery_preference &&
      Object.keys(validationErrors).length === 0
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createSongRequest(formData, user?.id)
      
      if (result.success) {
        setSuccess(true)
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
    return <LoadingSpinner size="xl" text="Loading..." />
  }

  if (!isAuthenticated) {
    return null // Will redirect in useEffect
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-100 to-yellow-200">
        <Card className="max-w-md w-full shadow-xl">
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
            <p className="text-gray-600 mb-4">
              Your song request has been submitted successfully. Now let&apos;s create the lyrics!
            </p>
            <div className="animate-pulse">
              <p className="text-sm text-gray-500">Redirecting to lyrics creation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 to-yellow-200 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Song Request</h1>
          <p className="text-gray-600">
            Tell us about the person and song you want to create. After submitting, you&apos;ll create the lyrics first, then the final song.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Contact Information
              </CardTitle>
              <CardDescription>
                How should we deliver your personalized song?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="requester_name">Your Name *</Label>
                  <Input
                    id="requester_name"
                    value={formData.requester_name}
                    onChange={(e) => handleInputChange('requester_name', e.target.value)}
                    placeholder="Enter your full name"
                    className={validationErrors.requester_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.requester_name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.requester_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone_number">Phone Number (WhatsApp)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="phone_number"
                      value={formData.phone_number}
                      onChange={(e) => handleInputChange('phone_number', e.target.value)}
                      placeholder="+1234567890"
                      className={`pl-10 ${validationErrors.phone_number ? 'border-red-500' : ''}`}
                    />
                  </div>
                  {validationErrors.phone_number && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.phone_number}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email ID</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="your@email.com"
                    className={`pl-10 ${validationErrors.email ? 'border-red-500' : ''}`}
                  />
                </div>
                {validationErrors.email && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
                )}
              </div>

              {(formData.phone_number || formData.email) && (
                <div>
                  <Label>Delivery Preference *</Label>
                  <div className="flex gap-4 mt-2">
                    {formData.email && (
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="delivery_preference"
                          value="email"
                          checked={formData.delivery_preference === 'email'}
                          onChange={(e) => handleInputChange('delivery_preference', e.target.value)}
                          className="mr-2"
                        />
                        Email
                      </label>
                    )}
                    {formData.phone_number && (
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="delivery_preference"
                          value="whatsapp"
                          checked={formData.delivery_preference === 'whatsapp'}
                          onChange={(e) => handleInputChange('delivery_preference', e.target.value)}
                          className="mr-2"
                        />
                        WhatsApp
                      </label>
                    )}
                    {(formData.phone_number && formData.email) && (
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="delivery_preference"
                          value="both"
                          checked={formData.delivery_preference === 'both'}
                          onChange={(e) => handleInputChange('delivery_preference', e.target.value)}
                          className="mr-2"
                        />
                        Both
                      </label>
                    )}
                  </div>
                  {validationErrors.delivery_preference && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.delivery_preference}</p>
                  )}
                </div>
              )}

              {validationErrors.contact && (
                <Alert variant="destructive">
                  <AlertDescription>{validationErrors.contact}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Recipient Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Who is this song for?
              </CardTitle>
              <CardDescription>
                Tell us about the person you want to create this song for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="recipient_name">Recipient Name & Relationship *</Label>
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                    placeholder="e.g., Leena, my wife"
                    className={validationErrors.recipient_name ? 'border-red-500' : ''}
                  />
                  {validationErrors.recipient_name && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.recipient_name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="recipient_relationship">Relationship *</Label>
                  <Input
                    id="recipient_relationship"
                    value={formData.recipient_relationship}
                    onChange={(e) => handleInputChange('recipient_relationship', e.target.value)}
                    placeholder="e.g., my wife, my friend"
                    className={validationErrors.recipient_relationship ? 'border-red-500' : ''}
                  />
                  {validationErrors.recipient_relationship && (
                    <p className="text-red-500 text-sm mt-1">{validationErrors.recipient_relationship}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>What language do you want this song in? *</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                  {AVAILABLE_LANGUAGES.map((language) => (
                    <label key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(language)}
                        onChange={() => handleLanguageToggle(language)}
                        className="mr-2"
                      />
                      {language}
                    </label>
                  ))}
                </div>
                {validationErrors.languages && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.languages}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Song Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Music className="h-5 w-5 mr-2" />
                Song Details
              </CardTitle>
              <CardDescription>
                Help us understand what kind of song you have in mind
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="person_description">Tell us more about the person (Optional)</Label>
                <textarea
                  id="person_description"
                  value={formData.person_description}
                  onChange={(e) => handleInputChange('person_description', e.target.value)}
                  placeholder="Likes, dislikes, what would they like to listen to..."
                  className="w-full h-24 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  maxLength={500}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.person_description || '').length}/500 characters
                </p>
              </div>

              <div>
                <Label htmlFor="song_type">What kind of a song do you have in mind? (Optional)</Label>
                <textarea
                  id="song_type"
                  value={formData.song_type}
                  onChange={(e) => handleInputChange('song_type', e.target.value)}
                  placeholder="Song type, mood, style preferences..."
                  className="w-full h-20 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  maxLength={300}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.song_type || '').length}/300 characters
                </p>
              </div>

              <div>
                <Label>What emotions should the song evoke? (Optional)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 mt-2">
                  {AVAILABLE_EMOTIONS.map((emotion) => (
                    <label key={emotion} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.emotions?.includes(emotion) || false}
                        onChange={() => handleEmotionToggle(emotion)}
                        className="mr-2"
                      />
                      {emotion}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="additional_details">Feel free to tell us more (Optional)</Label>
                <textarea
                  id="additional_details"
                  value={formData.additional_details}
                  onChange={(e) => handleInputChange('additional_details', e.target.value)}
                  placeholder="Inside jokes, private anecdotes, type of music, basically anything under the sun. Don't hold back!"
                  className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  maxLength={1000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {(formData.additional_details || '').length}/1000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-center">
            <Button
              type="submit"
              size="lg"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3"
              disabled={!isFormValid() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Request...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Request & Start Lyrics
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
