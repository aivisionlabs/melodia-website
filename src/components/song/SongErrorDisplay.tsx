import React from "react";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface SongErrorDisplayProps {
  error: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  showBackButton?: boolean;
  className?: string;
}

export function SongErrorDisplay({
  error,
  onRetry,
  showHomeButton = true,
  showBackButton = true,
  className = "",
}: SongErrorDisplayProps) {
  return (
    <div
      className={`min-h-screen bg-melodia-cream flex items-center justify-center p-4 ${className}`}
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-elegant p-8">
        {/* Error Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-melodia-coral-20 rounded-full p-4">
            <AlertTriangle className="w-10 h-10 text-melodia-coral" />
          </div>
        </div>

        {/* Error Title */}
        <h1 className="text-2xl font-heading font-bold text-melodia-teal text-center mb-3">
          Oops! Something went wrong
        </h1>

        {/* Error Message */}
        <p className="text-lg font-body text-melodia-teal text-center mb-8 leading-relaxed">
          {error}
        </p>

        {/* Action Buttons */}
        <div className="space-y-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full bg-melodia-yellow hover:bg-gradient-to-r hover:from-melodia-yellow hover:to-melodia-coral text-melodia-teal font-heading font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Try Again</span>
            </button>
          )}

          {showBackButton && (
            <button
              onClick={() => window.history.back()}
              className="w-full bg-white hover:bg-melodia-teal-light text-melodia-teal hover:text-melodia-teal font-heading font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-melodia-teal hover:border-melodia-teal shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Go Back</span>
            </button>
          )}

          {showHomeButton && (
            <Link
              href="/"
              className="w-full bg-melodia-coral hover:bg-gradient-to-r hover:from-melodia-coral hover:to-melodia-yellow text-white font-heading font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              <span>Go Home</span>
            </Link>
          )}
        </div>

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm font-body text-melodia-teal opacity-70">
            If this problem persists, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}
