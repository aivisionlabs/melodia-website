import { createClient, SupabaseClient } from '@supabase/supabase-js'

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
          slug: string
          is_active: boolean
          status: string
          categories: string[] | null
          tags: string[] | null
          suno_task_id: string | null
          metadata: any
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
          slug: string
          is_active?: boolean
          status?: string
          categories?: string[] | null
          tags?: string[] | null
          suno_task_id?: string | null
          metadata?: any
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
          slug?: string
          is_active?: boolean
          status?: string
          categories?: string[] | null
          tags?: string[] | null
          suno_task_id?: string | null
          metadata?: any
        }
      }
      song_analytics: {
        Row: {
          id: number
          song_id: number
          play_count: number
          view_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          song_id: number
          play_count?: number
          view_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          song_id?: number
          play_count?: number
          view_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Global variable to store the client instance
let supabaseClient: SupabaseClient<Database> | null = null
let supabaseServerClient: SupabaseClient<Database> | null = null

// Client-side Supabase client (for browser)
export function getSupabaseClient(): SupabaseClient<Database> {
  if (typeof window === 'undefined') {
    throw new Error('getSupabaseClient() should only be called on the client side')
  }

  if (!supabaseClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables for client')
    }

    supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
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
  }

  return supabaseClient
}

// Server-side Supabase client (for server actions and API routes)
export function getSupabaseServerClient(): SupabaseClient<Database> {
  if (typeof window !== 'undefined') {
    throw new Error('getSupabaseServerClient() should only be called on the server side')
  }

  if (!supabaseServerClient) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase environment variables for server')
    }

    supabaseServerClient = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  }

  return supabaseServerClient
}

// Legacy exports for backward compatibility
export const supabase = typeof window !== 'undefined' ? getSupabaseClient() : null
export const createServerSupabaseClient = getSupabaseServerClient