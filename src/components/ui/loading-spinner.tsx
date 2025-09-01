import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
}

export function LoadingSpinner({ 
  size = 'md', 
  text,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg'
  }

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className={`animate-spin rounded-full border-b-2 border-yellow-500 ${sizeClasses[size]}`} />
      {text && (
        <span className={`text-gray-600 mt-2 ${textSizeClasses[size]}`}>
          {text}
        </span>
      )}
    </div>
  )
}

export function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <LoadingSpinner size="xl" text="Loading..." />
    </div>
  )
}

export function LoadingCard() {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  )
}

export function LoadingButton({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center">
      <Loader2 className="h-4 w-4 animate-spin mr-2" />
      <span>{text}</span>
    </div>
  )
}
