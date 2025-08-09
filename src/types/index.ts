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
  timestamped_lyrics_variants: { [variantIndex: number]: LyricLine[] } | null
  timestamped_lyrics_api_responses: { [variantIndex: number]: any } | null
  music_style: string | null
  service_provider: string | null
  song_requester: string | null
  prompt: string | null
  song_url: string | null
  duration: number | null
  slug: string
  add_to_library?: boolean
  is_deleted?: boolean
  status?: string
  categories?: string[]
  tags?: string[]
  suno_task_id?: string
  negative_tags?: string
  suno_variants?: any
  selected_variant?: number
  metadata?: any
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