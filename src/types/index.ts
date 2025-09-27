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
  duration: number | null // Changed to number to match database integer field
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
  // Status tracking fields
  status_checked_at?: string | null
  last_status_check?: string | null
  status_check_count?: number | null
  // Payment integration fields
  payment_id?: number | null
  // Lyrics workflow fields
  approved_lyrics_id?: number | null
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
  duration: number | null // Changed from string to number to match integer database field
  slug: string
  selected_variant: number | null
}

// User authentication interfaces
export interface User {
  id: number
  email: string
  name: string | null
  created_at: string
  updated_at: string
}

export interface UserSession {
  user: User
  expires: string
}

// Song request interfaces
export interface SongRequest {
  id: number
  user_id: number | null
  requester_name: string
  recipient_details: string
  occasion?: string
  languages: string
  mood: string[] | null
  song_story: string | null
  status: 'pending' | 'processing' | 'completed' | 'failed'
  generated_song_id: number | null
  created_at: string
  updated_at: string
}

// Phase 6: Lyrics-related interfaces
export interface LyricsDraft {
  id: number
  song_request_id: number
  version: number
  lyrics_edit_prompt?: any
  generated_text: string
  status: 'draft' | 'needs_review' | 'approved' | 'archived'
  created_by?: number
  created_at: string
  updated_at: string
}

export interface GenerateLyricsParams {
  language: string[]
  refineText?: string
}

// Form data interfaces
export interface SongRequestFormData {
  requester_name: string
  recipient_details: string
  occasion?: string
  languages: string
  mood?: string[]
  song_story?: string
}




// Export payment types
export * from './payment'