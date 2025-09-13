"use client";

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Music, ArrowLeft, Play, Download, Share2, Heart, Star } from 'lucide-react'

interface LyricsData {
  title: string;
  styleOfMusic: string;
  lyrics: string;
}

interface FormData {
  recipient_name: string;
  languages: string;
  additional_details: string;
}

export default function LyricsDisplayPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [lyricsData, setLyricsData] = useState<LyricsData | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const title = searchParams.get('title')
    const styleOfMusic = searchParams.get('styleOfMusic')
    const lyrics = searchParams.get('lyrics')
    const recipient_name = searchParams.get('recipient_name')
    const languages = searchParams.get('languages')
    const additional_details = searchParams.get('additional_details')

    if (title && styleOfMusic && lyrics) {
      setLyricsData({
        title,
        styleOfMusic,
        lyrics
      })
    }

    if (recipient_name && languages && additional_details) {
      setFormData({
        recipient_name,
        languages,
        additional_details
      })
    }

    setIsLoading(false)
  }, [searchParams])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-2">Loading Your Song...</h1>
          <p className="text-gray-300">Please wait while we prepare your personalized lyrics.</p>
        </div>
      </div>
    )
  }

  if (!lyricsData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">No Song Found</h1>
          <p className="text-gray-300 mb-6">It looks like there was an issue loading your song.</p>
          <Link href="/">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Create Song
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Music className="w-6 h-6 text-yellow-400" />
                <h1 className="text-xl font-bold text-white">Melodia</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Song Details */}
          <div className="lg:col-span-1">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Music className="w-5 h-5 mr-2" />
                  Song Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-sm text-gray-300 mb-1">Title</h3>
                  <p className="text-white">{lyricsData.title}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-sm text-gray-300 mb-1">Style</h3>
                  <p className="text-white text-sm">{lyricsData.styleOfMusic}</p>
                </div>

                {formData && (
                  <>
                    <div>
                      <h3 className="font-semibold text-sm text-gray-300 mb-1">For</h3>
                      <p className="text-white">{formData.recipient_name}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm text-gray-300 mb-1">Language</h3>
                      <p className="text-white">{formData.languages}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-sm text-gray-300 mb-1">Details</h3>
                      <p className="text-white text-sm">{formData.additional_details}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Lyrics */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center justify-between">
                  <span>Generated Lyrics</span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Heart className="w-4 h-4 mr-1" />
                      Like
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button size="sm" variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      <Download className="w-4 h-4 mr-1" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap text-white font-mono text-sm leading-relaxed">
                    {lyricsData.lyrics}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

