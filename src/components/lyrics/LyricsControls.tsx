'use client'

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GenerateLyricsParams } from '@/types';

interface LyricsControlsProps {
  requestId: string;
  onGenerate: (params: GenerateLyricsParams) => Promise<any>;
  onRegenerate?: () => Promise<any>;
  onRefine?: (refineText: string, params: GenerateLyricsParams) => Promise<any>;
  loading?: boolean;
  hasExistingDraft?: boolean;
  currentDraft?: any;
}

export function LyricsControls({ 
  requestId, 
  onGenerate, 
  onRegenerate, 
  onRefine, 
  loading = false,
  hasExistingDraft = false,
  currentDraft
}: LyricsControlsProps) {
  const [languages, setLanguages] = useState<string[]>(['English']);
  const [tone, setTone] = useState<string[]>(['Fun']);
  const [lengthHint, setLengthHint] = useState<'short' | 'standard' | 'long'>('standard');
  const [refineText, setRefineText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        language: languages,
        tone: tone,
        lengthHint: lengthHint,
        refineText: refineText.trim() || undefined
      });
      setRefineText(''); // Clear refine text after generation
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsGenerating(true);
    try {
      await onRegenerate();
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleRefine = async () => {
    if (!onRefine || !refineText.trim() || !currentDraft) return;
    setIsGenerating(true);
    try {
      const currentLyrics = currentDraft.edited_text || currentDraft.generated_text;
      const params = {
        language: languages,
        tone: tone,
        lengthHint: lengthHint,
        structure: currentDraft.structure
      };
      await onRefine(refineText, params);
      setRefineText('');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Language Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Languages</label>
        <div className="flex flex-wrap gap-2">
          {['English', 'Hindi', 'Punjabi', 'Spanish', 'Gujarati', 'Marathi'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguages(prev => 
                prev.includes(lang) 
                  ? prev.filter(l => l !== lang)
                  : [...prev, lang]
              )}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                languages.includes(lang)
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tone Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Tone</label>
        <div className="flex flex-wrap gap-2">
          {['Fun', 'Emotional', 'Romantic', 'Energetic', 'Apology', 'Pride', 'Hope', 'Blues'].map((t) => (
            <button
              key={t}
              onClick={() => setTone(prev => 
                prev.includes(t) 
                  ? prev.filter(tone => tone !== t)
                  : [...prev, t]
              )}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                tone.includes(t)
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      
      {/* Length Selection */}
      <div>
        <label className="block text-sm font-medium mb-2">Length</label>
        <div className="flex gap-2">
          {[
            { value: 'short', label: 'Short (~60-90s)' },
            { value: 'standard', label: 'Standard (~2-3m)' },
            { value: 'long', label: 'Long (~3-4m)' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setLengthHint(option.value as any)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                lengthHint === option.value
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Refine Text Input */}
      <div>
        <label className="block text-sm font-medium mb-2">Refine Lyrics (Optional)</label>
        <textarea
          value={refineText}
          onChange={(e) => setRefineText(e.target.value)}
          placeholder="Add specific instructions to refine the lyrics..."
          className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
          rows={3}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={handleGenerate}
          disabled={loading || isGenerating}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white"
        >
          {isGenerating ? 'Generating...' : hasExistingDraft ? 'Generate New Version' : 'Generate Lyrics'}
        </Button>
        
        {hasExistingDraft && onRegenerate && (
          <Button 
            onClick={handleRegenerate}
            variant="outline"
            className="w-full"
            disabled={loading || isGenerating}
          >
            Regenerate Current
          </Button>
        )}
        
        {hasExistingDraft && onRefine && (
          <Button 
            onClick={handleRefine}
            variant="outline"
            className="w-full"
            disabled={loading || isGenerating || !refineText.trim()}
          >
            Refine Lyrics
          </Button>
        )}
      </div>
      
      {/* Help Text */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>• Select multiple languages for multilingual lyrics</p>
        <p>• Choose tone to match the song's mood</p>
        <p>• Use refine text for specific changes</p>
      </div>
    </div>
  );
}
