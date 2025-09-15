import { useState, useEffect } from 'react';
import { generateLyricsAction, saveLyricsDraftAction, approveLyricsAction, refineLyricsAction, getLyricsDraftsAction, checkSunoJobStatusAction } from '@/lib/lyrics-actions';
import { GenerateLyricsParams, LyricsDraft } from '@/types';

export function useLyrics(requestId: string) {
  const [drafts, setDrafts] = useState<LyricsDraft[]>([]);
  const [currentDraft, setCurrentDraft] = useState<LyricsDraft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load drafts on mount
  useEffect(() => {
    loadDrafts();
  }, [requestId]);
  
  const loadDrafts = async () => {
    try {
      // Don't load drafts if requestId is empty or invalid
      if (!requestId || requestId.trim() === '') {
        return;
      }
      
      setLoading(true);
      const drafts = await getLyricsDraftsAction(parseInt(requestId));
      setDrafts(drafts);
      if (drafts.length > 0) {
        setCurrentDraft(drafts[0]); // Latest draft
      }
    } catch (err) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const generateLyrics = async (params: GenerateLyricsParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateLyricsAction(params, parseInt(requestId));
      if (result.success) {
        // Reload drafts to get the new ones
        await loadDrafts();
        
        // If a draft was created, select it as current
        if (result.draft) {
          // Find the corresponding draft in our loaded drafts
          const loadedDrafts = await getLyricsDraftsAction(parseInt(requestId));
          if (loadedDrafts.length > 0) {
            setCurrentDraft(loadedDrafts[0]); // Select the first draft
          }
        }
        
        return result;
      } else {
        setError(result.error || 'Failed to generate lyrics');
        return result;
      }
    } catch (err) {
      setError('Failed to generate lyrics');
      return { success: false, error: 'Failed to generate lyrics' };
    } finally {
      setLoading(false);
    }
  };
  
  const saveDraft = async (draftId: number, text: string) => {
    try {
      const result = await saveLyricsDraftAction(draftId, text);
      if (result.success) {
        // Update local state
        setDrafts(prev => prev.map(draft => 
          draft.id === draftId 
            ? { ...draft, edited_text: text, status: 'needs_review' }
            : draft
        ));
        setCurrentDraft(prev => prev?.id === draftId 
          ? { ...prev!, edited_text: text, status: 'needs_review' }
          : prev
        );
      }
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to save draft' };
    }
  };
  
  const approveDraft = async (draftId: number) => {
    setLoading(true);
    try {
      const result = await approveLyricsAction(draftId, parseInt(requestId));
      if (result.success) {
        // Update local state
        setDrafts(prev => prev.map(draft => 
          draft.id === draftId 
            ? { ...draft, status: 'approved' }
            : draft
        ));
        setCurrentDraft(prev => prev?.id === draftId 
          ? { ...prev!, status: 'approved' }
          : prev
        );
      }
      return result;
    } catch (err) {
      return { success: false, error: 'Failed to approve draft' };
    } finally {
      setLoading(false);
    }
  };
  
  const selectDraft = (draft: LyricsDraft) => {
    setCurrentDraft(draft);
  };

  const refineLyrics = async (currentLyrics: string, refineText: string, params: GenerateLyricsParams) => {
    setLoading(true);
    setError(null);
    try {
      const result = await refineLyricsAction(refineText, parseInt(requestId));
      if (result.success) {
        // Reload drafts to get the new refined version
        await loadDrafts();
        return result;
      } else {
        setError(result.error || 'Failed to refine lyrics');
        return result;
      }
    } catch (err) {
      setError('Failed to refine lyrics');
      return { success: false, error: 'Failed to refine lyrics' };
    } finally {
      setLoading(false);
    }
  };
  
  const clearError = () => {
    setError(null);
  };
  
  return {
    drafts,
    currentDraft,
    loading,
    error,
    generateLyrics,
    saveDraft,
    approveDraft,
    refineLyrics,
    selectDraft,
    loadDrafts,
    clearError,
  };
}

// Hook for checking Suno job status
export function useSunoJobStatus(taskId: string | null) {
  const [status, setStatus] = useState<string>('processing');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  useEffect(() => {
    if (!taskId) {
      setStatus('processing');
      setAudioUrl(null);
      setDuration(null);
      setError(null);
      return;
    }

    const pollJobStatus = async () => {
      if (!taskId) return;

      setLoading(true);
      try {
        const result = await checkSunoJobStatusAction(taskId);
        
        if (result.success) {
          setStatus(result.status || 'processing');
          
          if (result.status === 'completed' && result.audioUrl) {
            setAudioUrl(result.audioUrl);
            setDuration(result.duration);
            setIsPolling(false);
            // Stop polling when completed
            if (pollInterval) {
              clearInterval(pollInterval);
            }
          } else if (result.status === 'failed') {
            setError(result.error || 'Song generation failed');
            setIsPolling(false);
            // Stop polling when failed
            if (pollInterval) {
              clearInterval(pollInterval);
            }
          }
        } else {
          setError(result.error || 'Failed to check job status');
        }
      } catch (err) {
        setError('Failed to check job status');
        console.error('Error polling job status:', err);
      } finally {
        setLoading(false);
      }
    };

    // Start polling immediately
    pollJobStatus();
    
    // Set up polling interval (check every 10 seconds)
    const pollInterval: NodeJS.Timeout = setInterval(pollJobStatus, 10000);
    setIsPolling(true);

    // Cleanup on unmount or when taskId changes
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
      setIsPolling(false);
    };
  }, [taskId]);

  const checkStatus = async () => {
    if (!taskId) return;
    
    setLoading(true);
    try {
      const result = await checkSunoJobStatusAction(taskId);
      if (result.success) {
        setStatus(result.status || 'processing');
        if (result.status === 'completed' && result.audioUrl) {
          setAudioUrl(result.audioUrl);
          setDuration(result.duration);
        }
      } else {
        setError(result.error || 'Failed to check job status');
      }
    } catch (err) {
      setError('Failed to check job status');
    } finally {
      setLoading(false);
    }
  };

  return {
    status,
    audioUrl,
    duration,
    loading,
    error,
    isPolling,
    checkStatus,
  };
}
