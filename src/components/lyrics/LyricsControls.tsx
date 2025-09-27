"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { GenerateLyricsParams } from "@/types";

interface LyricsControlsProps {
  requestId: string;
  onGenerate: (params: GenerateLyricsParams) => Promise<any>;
  onRegenerate?: () => Promise<any>;
  onRefine?: (refineText: string, params: GenerateLyricsParams) => Promise<any>;
  loading?: boolean;
  hasExistingDraft?: boolean;
  currentDraft?: any;
  initialLanguages?: string;
}

export function LyricsControls({
  onGenerate,
  onRegenerate,
  onRefine,
  loading = false,
  hasExistingDraft = false,
  currentDraft,
  initialLanguages = "English",
}: LyricsControlsProps) {
  const [languages, setLanguages] = useState<string[]>(
    initialLanguages.split(",").map((l) => l.trim())
  );
  const [refineText, setRefineText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Update languages when initialLanguages changes
  React.useEffect(() => {
    if (initialLanguages && initialLanguages.trim().length > 0) {
      setLanguages(initialLanguages.split(",").map((l) => l.trim()));
    }
  }, [initialLanguages]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await onGenerate({
        language: languages,
        refineText: refineText.trim() || undefined,
      });
      setRefineText(""); // Clear refine text after generation
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
      const params = {
        language: languages,
        structure: currentDraft.structure,
      };
      await onRefine(refineText, params);
      setRefineText("");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Language Selection */}
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center mr-4">
            <svg
              className="h-5 w-5 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0010 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800">Languages</h3>
        </div>

        {/* Selected Languages Display */}
        {languages.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-w-full">
              {languages.map((lang) => (
                <div
                  key={lang}
                  className="inline-flex items-center px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 whitespace-nowrap flex-shrink-0"
                >
                  <span>{lang}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updatedLanguages = languages.filter(
                        (l) => l !== lang
                      );
                      setLanguages(updatedLanguages);
                    }}
                    className="ml-3 text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-white/20 flex-shrink-0"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Refine Text Input */}
      <div className="space-y-6">
        <label className="block text-lg font-bold text-gray-800 mb-6 flex items-center">
          <div className="p-3 bg-blue-100 rounded-xl mr-4">
            <svg
              className="h-6 w-6 text-blue-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          Lyrics Instructions (Optional)
        </label>
        <div className="relative">
          <textarea
            value={refineText}
            onChange={(e) => setRefineText(e.target.value)}
            placeholder="Add specific instructions for lyrics generation (e.g., include specific words, phrases, or themes)..."
            className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 hover:border-blue-300 focus:border-blue-400 text-base"
            rows={3}
          />
          <div className="absolute top-4 right-4 pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleGenerate}
          disabled={loading || isGenerating}
          className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Generating...
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              {hasExistingDraft ? "Generate New Version" : "Generate Lyrics"}
            </div>
          )}
        </Button>

        {hasExistingDraft && onRegenerate && (
          <Button
            onClick={handleRegenerate}
            variant="outline"
            className="w-full border-2 border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200"
            disabled={loading || isGenerating}
          >
            Regenerate Current
          </Button>
        )}

        {hasExistingDraft && onRefine && (
          <Button
            onClick={handleRefine}
            variant="outline"
            className="w-full border-2 border-indigo-300 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-400 transition-all duration-200"
            disabled={loading || isGenerating || !refineText.trim()}
          >
            Refine Lyrics
          </Button>
        )}
      </div>
    </div>
  );
}
