export interface LyricLine {
  index: number
  text: string
  start: number
  end: number
}

export interface AlignedWord {
  word: string
  startS: number // Changed from start_s to startS to match API response
  endS: number   // Changed from end_s to endS to match API response
  success: boolean
  palign: number // API response uses 'palign' not 'p_align'
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
  duration: string | null // Changed from number to string to match numeric database field
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
  sequence?: number // Field to control display order
}

// Public song interface (without sensitive fields)
export interface PublicSong {
  id: number
  title: string
  lyrics: string | null
  timestamp_lyrics: LyricLine[] | null
  timestamped_lyrics_variants: { [variantIndex: number]: LyricLine[] } | null
  music_style: string | null
  service_provider: string | null
  song_url: string | null
  duration: string | null // Changed from number to string to match numeric database field
  slug: string
}