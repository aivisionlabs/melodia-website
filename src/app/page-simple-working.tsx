'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SimplePage() {
  const [formData, setFormData] = useState({
    recipient_name: '',
    languages: [] as string[],
    additional_details: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    try {
      const response = await fetch('/api/generate-lyrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient_name: formData.recipient_name,
          languages: formData.languages,
          additional_details: formData.additional_details || ''
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate lyrics')
      }

      const result = await response.json()
      
      if (result.error) {
        setError(result.message || 'Failed to generate lyrics')
      } else {
        // Redirect to lyrics display page with the generated data
        const params = new URLSearchParams({
          title: result.title,
          styleOfMusic: result.styleOfMusic,
          lyrics: result.lyrics,
          recipient_name: formData.recipient_name,
          languages: formData.languages.join(', '),
          additional_details: formData.additional_details
        })
        
        router.push(`/lyrics-display-new?${params.toString()}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Failed to generate lyrics. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Create Songs In Under 60-Seconds</h1>
      
      {error && (
        <div className="max-w-2xl mx-auto mb-6 p-4 bg-red-900 border border-red-600 rounded-lg text-red-200">
          <div className="flex items-center">
            <span className="text-red-400 mr-2">⚠️</span>
            <span>{error}</span>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Who is this song for?</label>
          <input
            type="text"
            value={formData.recipient_name}
            onChange={(e) => setFormData(prev => ({ ...prev, recipient_name: e.target.value }))}
            placeholder="e.g., Varsha, my bestie"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Language</label>
          <input
            type="text"
            value={formData.languages.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              languages: e.target.value.split(',').map(l => l.trim()).filter(l => l)
            }))}
            placeholder="e.g., Hindi, English"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Tell us more about the song</label>
          <textarea
            value={formData.additional_details}
            onChange={(e) => setFormData(prev => ({ ...prev, additional_details: e.target.value }))}
            placeholder="e.g., Create song for my bestie, style: happy, genre: classic"
            className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white h-24"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Creating Lyrics...' : 'Create Lyrics'}
        </button>
      </form>
    </div>
  )
}
