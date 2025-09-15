'use client'

import React, { useState } from 'react';
import { useLyrics } from '@/hooks/use-lyrics';
import { LyricsEditor, LyricsControls, LyricsHistory, ApproveLyricsModal } from '@/components/lyrics';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { getSongRequestDataAction } from '@/lib/lyrics-actions';
import { SongRequest } from '@/types';

export default function CreateLyricsPage({ params }: { params: Promise<{ requestId: string }> }) {
  const router = useRouter();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [requestId, setRequestId] = useState<string>('');
  const [songRequest, setSongRequest] = useState<SongRequest | null>(null);
  
  // Await params for Next.js 15 compatibility
  React.useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setRequestId(resolvedParams.requestId);
    };
    getParams();
  }, [params]);

  // Load song request data when requestId is available
  React.useEffect(() => {
    const loadSongRequest = async () => {
      if (requestId) {
        try {
          console.log('Loading song request for ID:', requestId);
          const request = await getSongRequestDataAction(parseInt(requestId));
          console.log('Raw request data:', request);
          if (request) {
            // Convert Date objects to strings for SongRequest type
            const songRequest: SongRequest = {
              ...request,
              delivery_preference: request.delivery_preference as 'email' | 'whatsapp' | 'both' | null,
              status: request.status as 'pending' | 'processing' | 'completed' | 'failed',
              lyrics_status: request.lyrics_status as 'pending' | 'generating' | 'needs_review' | 'approved',
              created_at: request.created_at.toISOString(),
              updated_at: request.updated_at.toISOString(),
              lyrics_locked_at: request.lyrics_locked_at?.toISOString() || null
            } as SongRequest;
            setSongRequest(songRequest);
          } else {
            console.log('No request found for ID:', requestId);
          }
        } catch (error) {
          console.error('Error loading song request:', error);
        }
      }
    };
    loadSongRequest();
  }, [requestId]);
  
  const {
    drafts,
    currentDraft,
    loading,
    error,
    generateLyrics,
    saveDraft,
    approveDraft,
    refineLyrics,
    selectDraft,
    clearError
  } = useLyrics(requestId);
  
  const handleGenerate = async (params: any) => {
    const result = await generateLyrics(params);
    if (result.success) {
      setActiveTab('editor');
    }
  };
  
  const handleApprove = async (draftId: number) => {
    const result = await approveDraft(draftId);
    if (result.success) {
      // Navigate to song creation page
      router.push(`/create-song-from-lyrics/${requestId}`);
    }
  };
  
  const handleCompare = (draft1: any, draft2: any) => {
    // TODO: Implement comparison view
    console.log('Compare drafts:', draft1.id, draft2.id);
  };

  const handleRefine = async (refineText: string) => {
    if (!currentDraft) return;
    const currentLyrics = currentDraft.edited_text || currentDraft.generated_text;
    const result = await refineLyrics(currentLyrics, refineText);
    if (result.success) {
      setActiveTab('editor');
    }
  };
  
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
                Create Lyrics
              </h1>
              <div className="p-3 bg-white/20 rounded-2xl">
                <svg className="h-8 w-8 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Generate and edit beautiful lyrics for your personalized song
            </p>
          </div>
        </div>
        
        {/* Error Display */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}
        
        {/* Main Content */}
        {!requestId || !songRequest ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden sticky top-8">
              <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white p-6">
                <div className="text-center space-y-3">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold">Lyrics Generator</h2>
                    <div className="p-3 bg-white/20 rounded-2xl">
                      <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-white/90 text-sm">
                    Create beautiful lyrics with AI
                  </p>
                </div>
              </div>
              <div className="p-8">

                {songRequest && songRequest.languages && songRequest.languages.length > 0 ? (
                  <LyricsControls
                    key={`${songRequest.id}-${songRequest.languages.join(',')}`}
                    requestId={requestId}
                    onGenerate={handleGenerate}
                    onRefine={handleRefine}
                    loading={loading}
                    hasExistingDraft={drafts.length > 0}
                    currentDraft={currentDraft}
                    initialLanguages={songRequest.languages}
                  />
                ) : songRequest ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded text-sm">
                    <p className="text-red-800">No languages found in song request. Using default: English</p>
                    <LyricsControls
                      key={`${songRequest.id}-default`}
                      requestId={requestId}
                      onGenerate={handleGenerate}
                      onRefine={handleRefine}
                      loading={loading}
                      hasExistingDraft={drafts.length > 0}
                      currentDraft={currentDraft}
                      initialLanguages={['English']}
                    />
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          
          {/* Right Panel - Editor & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden">
              <div className="bg-gradient-to-r from-yellow-50 via-amber-50 to-orange-50 border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === 'editor'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      <span>Editor</span>
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                      activeTab === 'history'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>History ({drafts.length})</span>
                    </div>
                  </button>
                </nav>
              </div>
              
              <div className="p-8">
                {activeTab === 'editor' ? (
                  <LyricsEditor
                    requestId={requestId}
                    currentDraft={currentDraft}
                    onSave={saveDraft}
                    onApprove={() => {
                      setShowApproveModal(true);
                      return Promise.resolve();
                    }}
                    loading={loading}
                  />
                ) : (
                  <LyricsHistory
                    drafts={drafts}
                    currentDraft={currentDraft}
                    onSelectDraft={selectDraft}
                    onCompare={handleCompare}
                  />
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            {currentDraft && currentDraft.status === 'approved' && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-500 overflow-hidden p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-green-800">
                      ✓ Lyrics Approved
                    </h3>
                    <p className="text-gray-600">
                      Your lyrics are ready for song creation
                    </p>
                  </div>
                  <Button
                    onClick={() => router.push(`/create-song-from-lyrics/${requestId}`)}
                    className="bg-gradient-to-r from-green-600 via-green-700 to-green-800 hover:from-green-700 hover:via-green-800 hover:to-green-900 text-white font-semibold py-2 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                  >
                    Create Song
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
        )}
      </div>
      
      {/* Approve Modal */}
      <ApproveLyricsModal
        draft={currentDraft}
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onApprove={handleApprove}
        loading={loading}
      />
    </div>
  );
}
