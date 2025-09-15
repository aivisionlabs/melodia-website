'use client'

import { useState, useEffect } from 'react';
import { useAutosave } from '@/hooks/use-autosave';
import { Button } from '@/components/ui/button';
import { LyricsDraft } from '@/types';

interface LyricsEditorProps {
  requestId: string;
  currentDraft: LyricsDraft | null;
  onSave: (draftId: number, text: string) => Promise<any>;
  onApprove: (draftId: number) => Promise<any>;
  loading?: boolean;
}

export function LyricsEditor({ 
  currentDraft, 
  onSave, 
  onApprove, 
  loading = false 
}: LyricsEditorProps) {
  const [text, setText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedText, setLastSavedText] = useState('');
  
  // Update text when current draft changes
  useEffect(() => {
    if (currentDraft) {
      const displayText = currentDraft.edited_text || currentDraft.generated_text;
      setText(displayText);
      setLastSavedText(displayText);
    } else {
      setText('');
      setLastSavedText('');
    }
  }, [currentDraft]);
  
  // Auto-save hook
  useAutosave(text, async () => {
    if (currentDraft && text !== lastSavedText && text.trim()) {
      await handleSave();
    }
  }, 3000); // 3 seconds delay
  
  const handleSave = async () => {
    if (!currentDraft || !text.trim()) return;
    
    setIsSaving(true);
    try {
      await onSave(currentDraft.id, text);
      setLastSavedText(text);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleApprove = async () => {
    if (!currentDraft) return;
    
    // Save first, then approve
    await handleSave();
    await onApprove(currentDraft.id);
  };
  
  if (!currentDraft) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-gray-500">
          <p>No lyrics draft available.</p>
          <p className="text-sm">Generate lyrics first to start editing.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Lyrics Editor</h3>
          <p className="text-sm text-gray-500">
            Version {currentDraft.version} • {currentDraft.status}
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {isSaving ? 'Saving...' : 'Auto-saved'}
        </div>
      </div>
      
      {/* Editor */}
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-96 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono text-sm"
          placeholder="Your lyrics will appear here..."
          disabled={loading}
        />
        
        {/* Character count overlay */}
        <div className="absolute bottom-2 right-2 text-xs text-gray-400 bg-white px-2 py-1 rounded">
          {text.length} chars
        </div>
      </div>
      
      {/* Stats */}
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{text.split('\n').filter(line => line.trim()).length} lines</span>
        <span>{text.split(' ').filter(word => word.trim()).length} words</span>
      </div>
      
      {/* Actions */}
      <div className="flex gap-3">
        <Button 
          onClick={handleSave}
          disabled={loading || isSaving || !text.trim()}
          variant="outline"
          className="flex-1"
        >
          {isSaving ? 'Saving...' : 'Save Draft'}
        </Button>
        
        <Button 
          onClick={handleApprove}
          disabled={loading || isSaving || !text.trim() || currentDraft.status === 'approved'}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
        >
          Approve Lyrics
        </Button>
      </div>
      
      {/* Status indicator */}
      {currentDraft.status === 'approved' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm font-medium">
            ✓ Lyrics approved and ready for song creation
          </p>
        </div>
      )}
    </div>
  );
}
