'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useAuth } from '@/hooks/use-auth'
import { AVAILABLE_EMOTIONS, SongRequestFormData } from '@/types'
import { createSongRequest } from '@/lib/song-request-actions'
import { useToast } from '@/components/ui/toast'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  User, 
  Heart, 
  Music, 
  Send,
  ArrowLeft,
  CheckCircle,
  Sparkles,
  Palette
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
    languages: ['English'], // Default language for lyrics generation
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

    // Only validate visible required fields
    if (!formData.recipient_name.trim()) {
      errors.recipient_name = 'Who is this song for? (Required)'
    } else if (formData.recipient_name.length < 3) {
      errors.recipient_name = 'Name must be at least 3 characters'
    }

    if (!formData.recipient_relationship.trim()) {
      errors.recipient_relationship = 'Relationship is required'
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



  const handleEmotionToggle = (emotion: string) => {
    const updatedEmotions = formData.emotions?.includes(emotion)
      ? formData.emotions.filter(e => e !== emotion)
      : [...(formData.emotions || []), emotion]
    
    handleInputChange('emotions', updatedEmotions)
  }

  const isFormValid = (): boolean => {
    // Only check visible required fields
    const hasRecipientName = formData.recipient_name.trim().length >= 3
    const hasRelationship = formData.recipient_relationship.trim().length > 0
    
    return hasRecipientName && hasRelationship
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!validateForm()) {
      setError('Please fill in all required fields to continue.')
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>
        
        <Card className="max-w-md w-full shadow-2xl bg-white/90 backdrop-blur-sm border-0 relative">
          <CardContent className="text-center py-16 px-8">
            <div className="relative">
              <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6 animate-bounce" />
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Request Submitted!
            </h2>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Your song request has been submitted successfully. Now let&apos;s create the lyrics!
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
              <span>Redirecting to lyrics creation...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pb-16 sm:pb-20">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-yellow-600 transition-colors duration-200 group focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded-lg px-2 py-1"
            aria-label="Go back to dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Dashboard
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Main Form Card */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white p-8 sm:p-12">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Heart className="h-8 w-8" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold">Create Your Perfect Song</h2>
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <Music className="h-8 w-8" />
                  </div>
                </div>
                <p className="text-lg text-white/90 max-w-2xl mx-auto">
                  Tell us about the person and song you want to create. Language selection will be done during lyrics creation.
                </p>
              </div>
            </CardHeader>
            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Main Form Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Who is this song for? */}
                  <div className="space-y-4">
                    <Label htmlFor="recipient_name" className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="p-2 bg-pink-100 rounded-lg mr-3">
                        <Heart className="h-4 w-4 text-pink-500" />
                      </div>
                      Who is this song for? *
                    </Label>
                    <div className="relative">
                  <Input
                    id="recipient_name"
                    value={formData.recipient_name}
                    onChange={(e) => handleInputChange('recipient_name', e.target.value)}
                    placeholder="e.g., Leena, my wife"
                        className={`h-14 pl-4 pr-4 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-200 text-base ${
                          validationErrors.recipient_name ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-pink-300 focus:border-pink-400'
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <Heart className="h-4 w-4 text-gray-400" />
                      </div>
                </div>
                    {validationErrors.recipient_name && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.recipient_name}
                      </p>
                )}
              </div>

                  {/* Tell us about them */}
                  <div className="space-y-4">
                    <Label htmlFor="person_description" className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                        <User className="h-4 w-4 text-yellow-500" />
                      </div>
                      Tell us about them (Optional)
                    </Label>
                    <div className="relative">
                <textarea
                  id="person_description"
                  value={formData.person_description}
                  onChange={(e) => handleInputChange('person_description', e.target.value)}
                  placeholder="Likes, dislikes, what would they like to listen to..."
                        className="w-full h-24 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-yellow-300 focus:border-yellow-400 text-base"
                  maxLength={500}
                />
                      <div className="absolute top-3 right-3 pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        💡 Help us understand them better
                      </p>
                      <p className="text-xs text-gray-500">
                        {(formData.person_description || '').length}/500
                      </p>
                    </div>
              </div>

                  {/* Song Style */}
                  <div className="space-y-4">
                    <Label htmlFor="song_type" className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <Music className="h-4 w-4 text-purple-500" />
                      </div>
                      Song Style (Optional)
                    </Label>
                    <div className="relative">
                <textarea
                  id="song_type"
                  value={formData.song_type}
                  onChange={(e) => handleInputChange('song_type', e.target.value)}
                  placeholder="Song type, mood, style preferences..."
                        className="w-full h-20 p-4 border-2 border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 hover:border-purple-300 focus:border-purple-400 text-base"
                  maxLength={300}
                />
                      <div className="absolute top-3 right-3 pointer-events-none">
                        <Music className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        🎵 What style should the song be?
                      </p>
                      <p className="text-xs text-gray-500">
                        {(formData.song_type || '').length}/300
                      </p>
                    </div>
                  </div>
              </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Relationship */}
                  <div className="space-y-4">
                    <Label htmlFor="recipient_relationship" className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <User className="h-4 w-4 text-blue-500" />
                      </div>
                      Relationship *
                    </Label>
                    <div className="relative">
                      <Input
                        id="recipient_relationship"
                        value={formData.recipient_relationship}
                        onChange={(e) => handleInputChange('recipient_relationship', e.target.value)}
                        placeholder="e.g., my wife, my friend"
                        className={`h-14 pl-4 pr-4 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base ${
                          validationErrors.recipient_relationship ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 hover:border-blue-300 focus:border-blue-400'
                        }`}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    {validationErrors.recipient_relationship && (
                      <p className="text-red-500 text-sm mt-2 flex items-center">
                        <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                        {validationErrors.recipient_relationship}
                      </p>
                    )}
                  </div>

                  {/* Emotions */}
                  <div className="space-y-4">
                    <Label htmlFor="emotion-select" className="text-sm font-semibold text-gray-700 flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <Palette className="h-4 w-4 text-green-500" />
                      </div>
                      Emotions (Optional)
                    </Label>
                    
                    {/* Selected Emotions Display */}
                    {formData.emotions && formData.emotions.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {formData.emotions.map((emotion) => (
                          <span
                            key={emotion}
                            className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white text-sm font-medium rounded-xl border border-green-200 shadow-sm"
                          >
                            {emotion}
                            <button
                              type="button"
                              onClick={() => {
                                const updatedEmotions = formData.emotions?.filter(e => e !== emotion) || [];
                                handleInputChange('emotions', updatedEmotions);
                              }}
                              className="ml-2 text-white hover:text-gray-200 transition-colors"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    
                    <div className="relative">
                      <div className="w-full min-h-[120px] border-2 border-gray-200 rounded-xl focus-within:ring-2 focus-within:ring-green-500 focus-within:border-transparent transition-all duration-200 hover:border-green-300 bg-white p-4">
                        <div className="grid grid-cols-2 gap-3">
                          {AVAILABLE_EMOTIONS.map((emotion) => (
                            <button
                              key={emotion}
                              type="button"
                              onClick={() => handleEmotionToggle(emotion)}
                              className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 text-center min-h-[48px] flex items-center justify-center ${
                                formData.emotions?.includes(emotion)
                                  ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                              }`}
                            >
                      {emotion}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="absolute top-3 right-3 pointer-events-none">
                        <Palette className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500 flex items-center">
                        <span className="mr-1">💡</span>
                        Click to select multiple emotions
                      </p>
                      <p className="text-xs text-gray-500">
                        {formData.emotions?.length || 0} selected
                      </p>
                    </div>
                  </div>
                </div>
              </div>


            </CardContent>
          </Card>


          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}


          {/* Validation Summary - Only Visible Fields */}
          {Object.keys(validationErrors).length > 0 && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="space-y-1">
                  <p className="font-semibold">Please fix the following required fields:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.recipient_name && (
                      <li>• {validationErrors.recipient_name}</li>
                    )}
                    {validationErrors.recipient_relationship && (
                      <li>• {validationErrors.recipient_relationship}</li>
                    )}
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <div className="flex justify-center pt-8 pb-8 sm:pb-12">
            <Button
              type="submit"
              size="lg"
              className={`relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white px-8 sm:px-12 py-4 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:scale-100 whitespace-nowrap ${
                !isFormValid() || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isFormValid() || isSubmitting}
            >
              <div className="relative flex items-center">
              {isSubmitting ? (
                <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-4"></div>
                    <span className="text-lg">Creating Request...</span>
                </>
              ) : (
                <>
                    <Send className="h-6 w-6 mr-4" />
                    <span className="text-lg">Create Song Request</span>
                    <Sparkles className="h-5 w-5 ml-3 animate-pulse" />
                </>
              )}
              </div>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
