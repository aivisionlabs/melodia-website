'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createSongFromLyricsAction, getSongRequestDataAction, getLyricsDraftsAction } from '@/lib/lyrics-actions';
import { SongRequest, LyricsDraft } from '@/types';

export default function CreateSongFromLyricsPage({ params }: { params: Promise<{ requestId: string }> }) {
  const router = useRouter();
  const [request, setRequest] = useState<SongRequest | null>(null);
  const [approvedDraft, setApprovedDraft] = useState<LyricsDraft | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string>('');
  
  // Song creation parameters
  const [voice, setVoice] = useState('default');
  const [style, setStyle] = useState('pop');
  const [genre, setGenre] = useState('pop');
  const [bpm, setBpm] = useState(120);
  
  // Await params for Next.js 15 compatibility
  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setRequestId(resolvedParams.requestId);
    };
    getParams();
  }, [params]);
  
  useEffect(() => {
    if (requestId) {
      loadData();
    }
  }, [requestId]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      
      const request = await getSongRequestDataAction(parseInt(requestId));
      if (!request) {
        setError('Failed to load data');
        return;
      }
      
      // Get the approved lyrics draft
      if (request.approved_lyrics_id) {
        const drafts = await getLyricsDraftsAction(parseInt(requestId));
        const approvedDraft = drafts.find((draft: LyricsDraft) => draft.id === request.approved_lyrics_id);
        setApprovedDraft(approvedDraft || null);
      }
      
      // Convert Date objects to strings for SongRequest type
      const songRequest: SongRequest = {
        id: request.id,
        user_id: request.user_id,
        requester_name: request.requester_name,
        phone_number: request.phone_number,
        email: request.email,
        delivery_preference: request.delivery_preference as 'email' | 'whatsapp' | 'both' | null,
        recipient_name: request.recipient_name,
        recipient_relationship: request.recipient_relationship,
        languages: request.languages,
        person_description: request.person_description,
        song_type: request.song_type,
        emotions: request.emotions,
        additional_details: request.additional_details,
        status: request.status as 'pending' | 'processing' | 'completed' | 'failed',
        suno_task_id: request.suno_task_id,
        generated_song_id: request.generated_song_id,
        created_at: request.created_at.toISOString(),
        updated_at: request.updated_at.toISOString(),
        lyrics_status: request.lyrics_status as 'pending' | 'generating' | 'needs_review' | 'approved',
        approved_lyrics_id: request.approved_lyrics_id,
        lyrics_locked_at: request.lyrics_locked_at?.toISOString() || null,
        payment_id: request.payment_id,
        payment_status: (request.payment_status as 'pending' | 'paid' | 'failed' | 'refunded' | null) || 'pending',
        payment_required: request.payment_required || false
      };
      setRequest(songRequest);
    } catch (err) {
      setError('Failed to load data');
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateSong = async () => {
    try {
      setCreating(true);
      setError(null);
      
      const result = await createSongFromLyricsAction(parseInt(requestId));
      
      if (result.success) {
        // Navigate to home page on success
        router.push('/');
      } else {
        setError(result.error || 'Failed to create song');
      }
    } catch (err) {
      setError('Failed to create song');
      console.error('Error creating song:', err);
    } finally {
      setCreating(false);
    }
  };
  
  if (!requestId || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>
        <div className="relative text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>
        <div className="relative text-center">
          <div className="bg-white/90 backdrop-blur-sm border border-red-200 rounded-2xl p-8 max-w-md shadow-2xl">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  if (!request || !approvedDraft) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
          <div className="absolute top-40 left-1/2 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
        </div>
        <div className="relative text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }
  
  const lyricsText = approvedDraft.edited_text || approvedDraft.generated_text;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-500"></div>
      </div>

      <div className="relative max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="p-3 bg-white/20 rounded-2xl">
                <svg className="h-8 w-8 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                Create Song from Lyrics
              </h1>
              <div className="p-3 bg-white/20 rounded-2xl">
                <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Configure song settings and generate your final song
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Approved Lyrics */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Approved Lyrics</h2>
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  Version {approvedDraft.version}
                </p>
              </div>
            </div>
            <div className="p-8">
              {/* Lyrics Display */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto shadow-inner">
                {lyricsText}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Song Settings */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Song Settings</h2>
                  <div className="p-3 bg-white/20 rounded-2xl">
                    <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  Configure your song parameters
                </p>
              </div>
            </div>
            <div className="p-8">
              <div className="space-y-6">
                {/* Voice Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Voice Style</label>
                  <select
                    value={voice}
                    onChange={(e) => setVoice(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all duration-200 hover:border-yellow-300"
                  >
                    <option value="default">Default Voice</option>
                    <option value="male">Male Voice</option>
                    <option value="female">Female Voice</option>
                    <option value="child">Child Voice</option>
                    <option value="elderly">Elderly Voice</option>
                  </select>
                </div>
                
                {/* Music Style */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Music Style</label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-200 hover:border-amber-300"
                  >
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="folk">Folk</option>
                    <option value="electronic">Electronic</option>
                    <option value="country">Country</option>
                    <option value="blues">Blues</option>
                  </select>
                </div>
                
                {/* Genre */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">Genre</label>
                  <select
                    value={genre}
                    onChange={(e) => setGenre(e.target.value)}
                    className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 hover:border-orange-300"
                  >
                    <option value="pop">Pop</option>
                    <option value="rock">Rock</option>
                    <option value="jazz">Jazz</option>
                    <option value="classical">Classical</option>
                    <option value="folk">Folk</option>
                    <option value="electronic">Electronic</option>
                    <option value="country">Country</option>
                    <option value="blues">Blues</option>
                    <option value="hip-hop">Hip Hop</option>
                    <option value="r&b">R&B</option>
                  </select>
                </div>
                
                {/* BPM */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Tempo (BPM): <span className="text-yellow-600 font-semibold">{bpm}</span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="200"
                    value={bpm}
                    onChange={(e) => setBpm(parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-yellow-200 to-orange-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Slow (60)</span>
                    <span>Fast (200)</span>
                  </div>
                </div>
                
                {/* Create Button */}
                <div className="pt-4">
                  <Button
                    onClick={handleCreateSong}
                    disabled={creating}
                    className="w-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:via-yellow-600 hover:to-yellow-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {creating ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Creating Song...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        Create Song
                      </div>
                    )}
                  </Button>
                </div>
                
                {/* Info */}
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
                  <div className="flex items-start">
                    <div className="text-yellow-600 mr-3 text-xl">ℹ️</div>
                    <div className="text-yellow-800 text-sm">
                      <p className="font-semibold mb-2">Song Creation Process:</p>
                      <ul className="space-y-1">
                        <li>• Your song will be generated using AI</li>
                        <li>• This may take 5-10 minutes</li>
                        <li>• You&apos;ll receive a notification when ready</li>
                        <li>• You can track progress in your dashboard</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
