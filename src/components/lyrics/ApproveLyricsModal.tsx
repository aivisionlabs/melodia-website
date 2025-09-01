'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LyricsDraft } from '@/types';

interface ApproveLyricsModalProps {
  draft: LyricsDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (draftId: number) => Promise<any>;
  loading?: boolean;
}

export function ApproveLyricsModal({ 
  draft, 
  isOpen, 
  onClose, 
  onApprove, 
  loading = false 
}: ApproveLyricsModalProps) {
  const [isApproving, setIsApproving] = useState(false);
  
  if (!isOpen || !draft) return null;
  
  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprove(draft.id);
      onClose();
    } catch (error) {
      console.error('Failed to approve lyrics:', error);
    } finally {
      setIsApproving(false);
    }
  };
  
  const lyricsText = draft.edited_text || draft.generated_text;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Approve Lyrics</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={loading || isApproving}
            >
              ✕
            </button>
          </div>
          <p className="text-gray-600 mt-2">
            Review and approve the lyrics before creating your song. Once approved, lyrics cannot be changed.
          </p>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {/* Draft Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Version:</span> {draft.version}
              </div>
              <div>
                <span className="font-medium">Status:</span> {draft.status}
              </div>
              <div>
                <span className="font-medium">Languages:</span> {draft.language?.join(', ') || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Tone:</span> {draft.tone?.join(', ') || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Length:</span> {draft.length_hint || 'Not specified'}
              </div>
              <div>
                <span className="font-medium">Created:</span> {new Date(draft.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
          
          {/* Lyrics Preview */}
          <div>
            <h3 className="font-medium mb-2">Lyrics Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-64 overflow-y-auto">
              {lyricsText}
            </div>
          </div>
          
          {/* Warning */}
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="text-yellow-600 mr-2">⚠️</div>
              <div className="text-yellow-800 text-sm">
                <p className="font-medium">Important:</p>
                <ul className="mt-1 space-y-1">
                  <li>• Once approved, lyrics cannot be edited</li>
                  <li>• The song will be generated using these exact lyrics</li>
                  <li>• Make sure you're satisfied with the content</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={loading || isApproving}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApprove}
            disabled={loading || isApproving}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isApproving ? 'Approving...' : 'Approve Lyrics'}
          </Button>
        </div>
      </div>
    </div>
  );
}
