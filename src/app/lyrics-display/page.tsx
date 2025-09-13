"use client";

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Music, User, LogOut, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

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

export default function LyricsDisplayPage() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)

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

  const handleGenerateSong = () => {
    // This would integrate with your song generation API
    console.log('Generate song with:', { lyricsData, formData })
    // For now, just show an alert
    alert('Song generation feature coming soon!')
  }

  if (!lyricsData || !formData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          <p>Please wait while we load your lyrics.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 relative mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                <Music className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-yellow-400">MELODIA</span>
            </div>

            <div className="flex items-center space-x-4">
              {user && (
                <>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-gray-300" />
                    <span className="text-sm text-gray-200">{user?.name || user?.email}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left Side - Form Data */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Your Song</h1>
              <p className="text-gray-300">Personalized just for you</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-black font-bold">★</span>
                </div>
                <h3 className="text-white font-semibold text-lg">Song Details</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-gray-200 font-medium text-sm">For</label>
                  <p className="text-white text-lg mt-1">{formData.recipient_name}</p>
                </div>
                
                <div>
                  <label className="text-gray-200 font-medium text-sm">Language</label>
                  <p className="text-white text-lg mt-1">{formData.languages.join(', ')}</p>
                </div>
                
                <div>
                  <label className="text-gray-200 font-medium text-sm">Style & Mood</label>
                  <p className="text-white text-lg mt-1">{formData.additional_details}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Generated Lyrics */}
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{lyricsData.title}</h1>
              <p className="text-gray-300 text-sm">{lyricsData.styleOfMusic}</p>
            </div>
            
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                  <Music className="h-5 w-5 text-black" />
                </div>
                <h3 className="text-white font-semibold text-lg">Lyrics</h3>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <pre className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {lyricsData.lyrics}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Generate Song Button */}
        <div className="flex justify-center mt-8 space-x-4">
          <Button
            onClick={handleGenerateSong}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-8 py-4 text-lg rounded-xl flex items-center"
          >
            <Music className="h-5 w-5 mr-2" />
            Generate Song
          </Button>
          
          <Button
            variant="outline"
            className="border-gray-600 text-gray-200 hover:bg-gray-700 hover:border-gray-500 px-8 py-4 text-lg rounded-xl"
          >
            Save Lyrics
          </Button>
        </div>
      </main>
    </div>
  )
}

