'use client'

import React, { useState } from 'react';
import { useLyrics } from '@/hooks/use-lyrics';
import { LyricsEditor, LyricsControls, LyricsHistory, ApproveLyricsModal } from '@/components/lyrics';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function CreateLyricsPage({ params }: { params: Promise<{ requestId: string }> }) {
  const router = useRouter();
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history'>('editor');
  const [requestId, setRequestId] = useState<string>('');
  
  // Await params for Next.js 15 compatibility
  React.useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setRequestId(resolvedParams.requestId);
    };
    getParams();
  }, [params]);
  
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

  const handleRefine = async (refineText: string, params: any) => {
    if (!currentDraft) return;
    const currentLyrics = currentDraft.edited_text || currentDraft.generated_text;
    const result = await refineLyrics(currentLyrics, refineText, params);
    if (result.success) {
      setActiveTab('editor');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create Lyrics</h1>
          <p className="text-gray-600 mt-2">
            Generate and edit lyrics for your song request
          </p>
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
        {!requestId ? (
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
            <div className="bg-white rounded-lg shadow p-6 sticky top-8">
              <h2 className="text-xl font-semibold mb-6">Lyrics Generator</h2>
              <LyricsControls
                requestId={requestId}
                onGenerate={handleGenerate}
                onRefine={handleRefine}
                loading={loading}
                hasExistingDraft={drafts.length > 0}
                currentDraft={currentDraft}
              />
            </div>
          </div>
          
          {/* Right Panel - Editor & History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => setActiveTab('editor')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'editor'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Editor
                  </button>
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-yellow-500 text-yellow-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    History ({drafts.length})
                  </button>
                </nav>
              </div>
              
              <div className="p-6">
                {activeTab === 'editor' ? (
                  <LyricsEditor
                    requestId={requestId}
                    currentDraft={currentDraft}
                    onSave={saveDraft}
                    onApprove={(draftId) => {
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
              <div className="bg-white rounded-lg shadow p-6">
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
                    className="bg-green-600 hover:bg-green-700 text-white"
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
