'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Play, Pause, Download, Share2, ArrowLeft, Music, Trash2, RefreshCw } from 'lucide-react'
import Header from '@/components/Header'

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
  const [savedSongs, setSavedSongs] = useState<SavedSong[]>([])
  const [currentlyPlaying, setCurrentlyPlaying] = useState<HTMLAudioElement | null>(null)
  const [playingSongId, setPlayingSongId] = useState<string | null>(null)

  const loadSavedSongs = () => {
    if (typeof window !== 'undefined') {
      // Clear all existing songs first
      localStorage.removeItem('melodia-saved-songs')
      setSavedSongs([])
      console.log('All songs cleared from My Songs')
    }
  }

  useEffect(() => {
    loadSavedSongs()
  }, [])

  const handlePlaySong = (song: SavedSong) => {
    // Navigate to generated-songs page with song data
    const params = new URLSearchParams({
      recipient_name: song.recipientName,
      lyrics1: song.lyrics,
      lyrics2: song.lyrics, // Use same lyrics for both versions
      style1: song.styleOfMusic,
      style2: song.styleOfMusic,
      additional_details: '',
      languages: 'hindi'
    })
    
    router.push(`/generated-songs?${params.toString()}`)
  }

  const handleDeleteSong = (songId: string) => {
    if (confirm('Are you sure you want to delete this song?')) {
      const updatedSongs = savedSongs.filter(song => song.id !== songId)
      setSavedSongs(updatedSongs)
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('melodia-saved-songs', JSON.stringify(updatedSongs))
      }
    }
  }

  const handleBack = () => {
    router.back()
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
              onClick={loadSavedSongs}
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
        {savedSongs.length === 0 ? (
        <Card className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/30">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
            <h3 className="text-xl font-bold text-white mb-2">No Songs Yet</h3>
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
        ) : (
          <>
            {/* Songs Count */}
            <div className="mb-6">
              <p className="text-gray-300">
                Showing {savedSongs.length} song{savedSongs.length !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Songs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedSongs.map((song) => (
                <Card 
                  key={song.id} 
                  className="bg-gray-800/50 backdrop-blur-sm border-yellow-500/30 hover:bg-yellow-500/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handlePlaySong(song)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg font-bold line-clamp-1 group-hover:text-yellow-300 transition-colors">
                        {song.title}
                      </CardTitle>
                      <Badge 
                        variant="default"
                        className="bg-green-500 text-white"
                      >
                        Ready
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Created: {formatDate(song.createdAt)}
                    </p>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="bg-yellow-500/10 rounded-lg p-3">
                      <p className="text-gray-300 text-sm line-clamp-3">
                        {song.styleOfMusic}
                      </p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlaySong(song)
                        }}
                        className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-bold"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Play with Lyrics
                      </Button>
                      
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSong(song.id)
                        }}
                        variant="outline"
                        size="icon"
                        className="border-red-300 text-red-300 hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}