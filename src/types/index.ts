export interface LyricLine {
  index: number
  text: string
  start: number
  end: number
}

export interface Song {
  id: number
  created_at: string
  title: string
  lyrics: string | null
  timestamp_lyrics: LyricLine[] | null
  music_style: string | null
  service_provider: string | null
  song_requester: string | null
  prompt: string | null
  song_url: string | null
  duration: number | null
  slug: string
}

// Public song interface (without sensitive fields)
export interface PublicSong {
  id: number
  title: string
  lyrics: string | null
  timestamp_lyrics: LyricLine[] | null
  music_style: string | null
  service_provider: string | null
  song_url: string | null
  duration: number | null
  slug: string
}