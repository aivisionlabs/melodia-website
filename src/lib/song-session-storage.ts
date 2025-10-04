// Utility functions for managing song data in session storage
// This reduces URL parameter length and improves user experience

export interface SongSessionData {
  title: string
  styleOfMusic: string
  lyrics: string
  recipient_name: string
  languages: string[]
  additional_details: string
  timestamp: number
}

const SESSION_KEY = 'melodia-current-song'

export function saveSongToSession(data: SongSessionData): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving song to session:', error)
    }
  }
}

export function getSongFromSession(): SongSessionData | null {
  if (typeof window !== 'undefined') {
    try {
      const data = sessionStorage.getItem(SESSION_KEY)
      if (data) {
        const parsed = JSON.parse(data)
        // Check if data is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
        if (Date.now() - parsed.timestamp < maxAge) {
          return parsed
        } else {
          // Clear expired data
          clearSongFromSession()
        }
      }
    } catch (error) {
      console.error('Error getting song from session:', error)
    }
  }
  return null
}

export function clearSongFromSession(): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem(SESSION_KEY)
    } catch (error) {
      console.error('Error clearing song from session:', error)
    }
  }
}

export function createSongSessionData(
  title: string,
  styleOfMusic: string,
  lyrics: string,
  recipient_name: string,
  languages: string[],
  additional_details: string
): SongSessionData {
  return {
    title,
    styleOfMusic,
    lyrics,
    recipient_name,
    languages,
    additional_details,
    timestamp: Date.now()
  }
}
