import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Client-side Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'melodia-website'
    }
  }
})

// Server-side Supabase client (for API routes)
export const createServerSupabaseClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Database types
export interface Database {
  public: {
    Tables: {
      songs: {
        Row: {
          id: number
          created_at: string
          title: string
          lyrics: string | null
          timestamp_lyrics: Array<{
            index: number
            text: string
            start: number
            end: number
          }> | null
          music_style: string | null
          service_provider: string | null
          song_requester: string | null
          prompt: string | null
          song_url: string | null
          duration: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          title: string
          lyrics?: string | null
          timestamp_lyrics?: Array<{
            index: number
            text: string
            start: number
            end: number
          }> | null
          music_style?: string | null
          service_provider?: string | null
          song_requester?: string | null
          prompt?: string | null
          song_url?: string | null
          duration?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          title?: string
          lyrics?: string | null
          timestamp_lyrics?: Array<{
            index: number
            text: string
            start: number
            end: number
          }> | null
          music_style?: string | null
          service_provider?: string | null
          song_requester?: string | null
          prompt?: string | null
          song_url?: string | null
          duration?: number | null
        }
      }
    }
  }
}