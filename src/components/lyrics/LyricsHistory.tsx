'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LyricsDraft } from '@/types';

interface LyricsHistoryProps {
  drafts: LyricsDraft[];
  currentDraft: LyricsDraft | null;
  onSelectDraft: (draft: LyricsDraft) => void;
  onCompare?: (draft1: LyricsDraft, draft2: LyricsDraft) => void;
}

export function LyricsHistory({ 
  drafts, 
  currentDraft, 
  onSelectDraft, 
  onCompare 
}: LyricsHistoryProps) {
  const [selectedForCompare, setSelectedForCompare] = useState<number | null>(null);
  
  if (drafts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No lyrics drafts yet.</p>
        <p className="text-sm">Generate your first lyrics to see history.</p>
      </div>
    );
  }
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const handleCompareClick = (draftId: number) => {
    if (selectedForCompare === draftId) {
      setSelectedForCompare(null);
    } else if (selectedForCompare) {
      const draft1 = drafts.find(d => d.id === selectedForCompare);
      const draft2 = drafts.find(d => d.id === draftId);
      if (draft1 && draft2 && onCompare) {
        onCompare(draft1, draft2);
      }
      setSelectedForCompare(null);
    } else {
      setSelectedForCompare(draftId);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Version History</h3>
        {drafts.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSelectedForCompare(null)}
            disabled={!selectedForCompare}
          >
            Cancel Compare
          </Button>
        )}
      </div>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {drafts.map((draft) => (
          <div
            key={draft.id}
            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
              currentDraft?.id === draft.id
                ? 'border-yellow-500 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${selectedForCompare === draft.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelectDraft(draft)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">Version {draft.version}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(draft.status)}`}>
                    {draft.status.replace('_', ' ')}
                  </span>
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>Languages: {draft.language?.join(', ') || 'Not specified'}</p>
                  <p>Tone: {draft.tone?.join(', ') || 'Not specified'}</p>
                  <p>Length: {draft.length_hint || 'Not specified'}</p>
                  <p>Created: {formatDate(draft.created_at)}</p>
                </div>
                
                {draft.edited_text && (
                  <div className="mt-2 text-xs text-gray-500">
                    <span className="font-medium">✓ Edited</span>
                  </div>
                )}
              </div>
              
              {drafts.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCompareClick(draft.id);
                  }}
                  className={`ml-2 ${
                    selectedForCompare === draft.id 
                      ? 'bg-blue-100 text-blue-700' 
                      : ''
                  }`}
                >
                  {selectedForCompare === draft.id ? 'Selected' : 'Compare'}
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedForCompare && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            Select another version to compare with Version {
              drafts.find(d => d.id === selectedForCompare)?.version
            }
          </p>
        </div>
      )}
    </div>
  );
}
