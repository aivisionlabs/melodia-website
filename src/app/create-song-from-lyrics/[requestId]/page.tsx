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
        ...request,
        delivery_preference: request.delivery_preference as 'email' | 'whatsapp' | 'both' | null,
        status: request.status as 'pending' | 'processing' | 'completed' | 'failed',
        lyrics_status: request.lyrics_status as 'pending' | 'generating' | 'needs_review' | 'approved',
        created_at: request.created_at.toISOString(),
        updated_at: request.updated_at.toISOString(),
        lyrics_locked_at: request.lyrics_locked_at?.toISOString() || null
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
        // Navigate to dashboard on success
        router.push('/dashboard');
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Error</h2>
            <p className="text-red-600 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }
  
  const lyricsText = approvedDraft.edited_text || approvedDraft.generated_text;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Song from Lyrics</h1>
          <p className="text-gray-600 mt-2">
            Configure song settings and generate your final song
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Approved Lyrics */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Approved Lyrics</h2>
            
            {/* Request Info */}
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-medium mb-2">Song Request Details</h3>
              <div className="text-sm space-y-1">
                <p><span className="font-medium">Recipient:</span> {request.recipient_name}</p>
                <p><span className="font-medium">Relationship:</span> {request.recipient_relationship}</p>
                <p><span className="font-medium">Languages:</span> {request.languages.join(', ')}</p>
                {request.person_description && (
                  <p><span className="font-medium">Description:</span> {request.person_description}</p>
                )}
              </div>
            </div>
            
            {/* Lyrics Display */}
            <div>
              <h3 className="font-medium mb-2">Lyrics (Version {approvedDraft.version})</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                {lyricsText}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Song Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Song Settings</h2>
            
            <div className="space-y-6">
              {/* Voice Selection */}
              <div>
                <label className="block text-sm font-medium mb-2">Voice Style</label>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                <label className="block text-sm font-medium mb-2">Music Style</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                <label className="block text-sm font-medium mb-2">Genre</label>
                <select
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
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
                <label className="block text-sm font-medium mb-2">
                  Tempo (BPM): {bpm}
                </label>
                <input
                  type="range"
                  min="60"
                  max="200"
                  value={bpm}
                  onChange={(e) => setBpm(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Slow (60)</span>
                  <span>Fast (200)</span>
                </div>
              </div>
              
              {/* Create Button */}
              <div className="pt-4">
                <Button
                  onClick={handleCreateSong}
                  disabled={creating}
                  className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3"
                >
                  {creating ? 'Creating Song...' : 'Create Song'}
                </Button>
              </div>
              
              {/* Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="text-blue-600 mr-2">ℹ️</div>
                  <div className="text-blue-800 text-sm">
                    <p className="font-medium">Song Creation Process:</p>
                    <ul className="mt-1 space-y-1">
                      <li>• Your song will be generated using AI</li>
                      <li>• This may take 5-10 minutes</li>
                      <li>• You'll receive a notification when ready</li>
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
  );
}
