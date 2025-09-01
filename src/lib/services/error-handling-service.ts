export interface ErrorInfo {
  code: string
  message: string
  userMessage: string
  retryable: boolean
  severity: 'low' | 'medium' | 'high' | 'critical'
}

export class SongStatusError extends Error {
  public code: string
  public userMessage: string
  public retryable: boolean
  public severity: 'low' | 'medium' | 'high' | 'critical'

  constructor(errorInfo: ErrorInfo) {
    super(errorInfo.message)
    this.name = 'SongStatusError'
    this.code = errorInfo.code
    this.userMessage = errorInfo.userMessage
    this.retryable = errorInfo.retryable
    this.severity = errorInfo.severity
  }
}

export function handleSongStatusError(error: any): SongStatusError {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new SongStatusError({
      code: 'NETWORK_ERROR',
      message: 'Network request failed',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      retryable: true,
      severity: 'medium'
    })
  }

  // API rate limiting
  if (error.message?.includes('rate limit') || error.status === 429) {
    return new SongStatusError({
      code: 'RATE_LIMITED',
      message: 'API rate limit exceeded',
      userMessage: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
      severity: 'low'
    })
  }

  // API timeout
  if (error.name === 'AbortError' || error.message?.includes('timeout')) {
    return new SongStatusError({
      code: 'TIMEOUT',
      message: 'Request timeout',
      userMessage: 'The request took too long. Please try again.',
      retryable: true,
      severity: 'medium'
    })
  }

  // Song not found
  if (error.message?.includes('not found') || error.status === 404) {
    return new SongStatusError({
      code: 'SONG_NOT_FOUND',
      message: 'Song not found',
      userMessage: 'The requested song could not be found.',
      retryable: false,
      severity: 'high'
    })
  }

  // Suno API errors
  if (error.message?.includes('Suno API')) {
    return new SongStatusError({
      code: 'SUNO_API_ERROR',
      message: error.message,
      userMessage: 'There was an issue with the song generation service. Please try again later.',
      retryable: true,
      severity: 'medium'
    })
  }

  // Database errors
  if (error.message?.includes('database') || error.message?.includes('db')) {
    return new SongStatusError({
      code: 'DATABASE_ERROR',
      message: error.message,
      userMessage: 'There was an issue accessing the database. Please try again.',
      retryable: true,
      severity: 'high'
    })
  }

  // Authentication errors
  if (error.status === 401 || error.status === 403) {
    return new SongStatusError({
      code: 'AUTH_ERROR',
      message: 'Authentication failed',
      userMessage: 'Please log in again to continue.',
      retryable: false,
      severity: 'high'
    })
  }

  // Server errors
  if (error.status >= 500) {
    return new SongStatusError({
      code: 'SERVER_ERROR',
      message: error.message,
      userMessage: 'The server is experiencing issues. Please try again later.',
      retryable: true,
      severity: 'medium'
    })
  }

  // Unknown errors
  return new SongStatusError({
    code: 'UNKNOWN_ERROR',
    message: error.message || 'Unknown error occurred',
    userMessage: 'An unexpected error occurred. Please try again.',
    retryable: true,
    severity: 'medium'
  })
}

export function shouldRetryError(error: SongStatusError, retryCount: number): boolean {
  if (!error.retryable) return false
  
  // Don't retry too many times
  if (retryCount >= 3) return false
  
  // Don't retry critical errors
  if (error.severity === 'critical') return false
  
  return true
}

export function getRetryDelay(error: SongStatusError, retryCount: number): number {
  const baseDelay = 1000 // 1 second
  
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(2, retryCount)
  const jitter = Math.random() * 1000 // Random jitter up to 1 second
  
  return Math.min(exponentialDelay + jitter, 30000) // Max 30 seconds
}

export function logError(error: SongStatusError, context?: any): void {
  console.error('Song Status Error:', {
    code: error.code,
    message: error.message,
    userMessage: error.userMessage,
    severity: error.severity,
    retryable: error.retryable,
    context,
    timestamp: new Date().toISOString()
  })
}
