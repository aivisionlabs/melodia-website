import { db } from '@/lib/db'
import {
  lyricsDraftsTable,
  SelectSong,
  songRequestsTable,
  songsTable,
} from '@/lib/db/schema'
import { getUserContextFromRequest } from '@/lib/middleware-utils'
import { calculateVariantStatus, VariantData } from '@/lib/services/song-status-calculation-service'
import { sanitizeAnonymousUserId } from '@/lib/utils/validation'
import { desc, eq, inArray, ne } from 'drizzle-orm'
import { NextRequest, NextResponse } from 'next/server'

type ApiSongVariant = {
  index: number
  id?: string
  title?: string
  imageUrl?: string | null
  duration?: number
  // Prefer "source" URLs as requested
  sourceStreamAudioUrl?: string | null
  sourceAudioUrl?: string | null
  streamAudioUrl?: string | null
  audioUrl?: string | null
  variantStatus: 'PENDING' | 'STREAM_READY' | 'DOWNLOAD_READY'
}

type ApiSongItem = {
  songId: number
  requestId: number
  title: string
  slug: string
  createdAt: string
  variants: ApiSongVariant[]
  selectedVariantIndex?: number | null
  variantTimestampLyricsProcessed?: any;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const pageSize = Math.min(25, Math.max(5, parseInt(searchParams.get('pageSize') || '10')))

    // Get user context from middleware - this is the ONLY source of truth
    const userContext = getUserContextFromRequest(request)

    console.log("[fetch-user-song] User context:", {
      userId: userContext.userId,
      anonymousUserId: userContext.anonymousUserId,
      isAuthenticated: userContext.isAuthenticated,
      hasUserId: !!userContext.userId,
      hasAnonymousUserId: !!userContext.anonymousUserId
    });

    // Validate that we have proper user context
    if (!userContext.userId && !userContext.anonymousUserId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required. Please log in or ensure you have an active session.'
        },
        { status: 401 }
      )
    }

    const userId = userContext.userId
    const anonymousUserId = userContext.anonymousUserId

    // Additional validation for anonymous users
    if (anonymousUserId) {
      const sanitizedId = sanitizeAnonymousUserId(anonymousUserId)
      if (!sanitizedId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid anonymous user session'
          },
          { status: 401 }
        )
      }
    }

    // Build where clause for ownership filtering
    // If user is logged in, fetch all their songs (including previously anonymous ones that were merged)
    // If user is anonymous, only fetch anonymous songs
    const ownershipFilter = userId
      ? eq(songRequestsTable.user_id, userId)
      : eq(songRequestsTable.anonymous_user_id, anonymousUserId!)

    console.log("[fetch-user-song] Querying with filter:", {
      type: userId ? 'user_id' : 'anonymous_user_id',
      value: userId || anonymousUserId
    });

    // Fetch all song requests for owner
    const allRequests = await db
      .select({
        id: songRequestsTable.id,
        status: songRequestsTable.status,
        created_at: songRequestsTable.created_at,
        recipient_details: songRequestsTable.recipient_details,
      })
      .from(songRequestsTable)
      .where(ownershipFilter)
      .orderBy(desc(songRequestsTable.created_at))

    console.log("[fetch-user-song] Found requests:", {
      count: allRequests.length,
      requestIds: allRequests.slice(0, 5).map(r => r.id) // Log first 5 IDs for debugging
    });

    // Fetch songs for all owner requests
    const requestIds = new Set(allRequests.map((r) => r.id))
    const songsQuery = await db
      .select()
      .from(songsTable)
      .where(
        // Filter songs that are not deleted
        ne(songsTable.is_deleted, true),
      )
    const songsAll = (songsQuery as SelectSong[]).filter((s) => requestIds.has(s.song_request_id))
    // Sort songs by created_at desc for pagination of completed section
    songsAll.sort((a, b) => new Date(b.created_at as any).getTime() - new Date(a.created_at as any).getTime())
    const total = songsAll.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const pageSongs = songsAll.slice(start, end)

    // Helper: fetch latest lyrics draft title for a request
    async function fetchTitleForRequest(requestId: number): Promise<string> {
      const drafts = await db
        .select({
          id: lyricsDraftsTable.id,
          song_title: lyricsDraftsTable.song_title,
          created_at: lyricsDraftsTable.created_at,
          version: lyricsDraftsTable.version,
        })
        .from(lyricsDraftsTable)
        .where(eq(lyricsDraftsTable.song_request_id, requestId))
        .orderBy(desc(lyricsDraftsTable.version), desc(lyricsDraftsTable.created_at))
        .limit(1)
      const title = drafts?.[0]?.song_title || 'Untitled Song'
      return title
    }

    // Map songs to response with 2 variants and computed statuses
    const songs: ApiSongItem[] = []
    for (const song of pageSongs) {
      const requestId = song.song_request_id
      const title = await fetchTitleForRequest(requestId)

      const variantsArray: any[] = Array.isArray(song.song_variants) ? (song.song_variants as any[]) : []
      const firstTwo = variantsArray.slice(0, 2)

      const apiVariants: ApiSongVariant[] = firstTwo.map((v: any, idx: number) => {
        const forStatus: VariantData = {
          id: v.id || '',
          audioUrl: v.audioUrl || null,
          sourceAudioUrl: v.sourceAudioUrl || null,
          streamAudioUrl: v.streamAudioUrl || null,
          sourceStreamAudioUrl: v.sourceStreamAudioUrl || null,
          imageUrl: v.imageUrl || v.sourceImageUrl || null,
          sourceImageUrl: v.sourceImageUrl || null,
          title: v.title || undefined,
          duration: typeof v.duration === 'number' ? v.duration : undefined,
          prompt: v.prompt || undefined,
          modelName: v.modelName || undefined,
          tags: v.tags || undefined,
          createTime: v.createTime || undefined,
        }
        return {
          index: idx,
          id: v.id,
          title: v.title,
          imageUrl: v.imageUrl || v.sourceImageUrl || null,
          duration: typeof v.duration === 'number' ? v.duration : undefined,
          sourceStreamAudioUrl: v.sourceStreamAudioUrl || null,
          sourceAudioUrl: v.sourceAudioUrl || null,
          streamAudioUrl: v.streamAudioUrl || null,
          audioUrl: v.audioUrl || null,
          variantStatus: calculateVariantStatus(forStatus),
        }
      })

      songs.push({
        songId: song.id,
        requestId,
        title,
        slug: song.slug, // Add slug for lyrics navigation
        createdAt: (song.created_at as unknown as Date).toISOString?.() || String(song.created_at),
        variants: apiVariants,
        selectedVariantIndex: song.selected_variant,
        variantTimestampLyricsProcessed: song.variant_timestamp_lyrics_processed,
      })
    }

    // Build stage-based items list
    type Stage = 'SONG_REQUEST_CREATED' | 'LYRICS_CREATED' | 'SONG_CREATED'
    const songRequestIdToSong: Record<number, SelectSong | undefined> = {}
    for (const s of songsAll) songRequestIdToSong[s.song_request_id] = s

    // For lyrics presence check, fetch draft existence per request
    const draftsExistence: Record<number, boolean> = {}
    if (allRequests.length > 0) {
      const ids = allRequests.map(r => r.id)
      // Efficient existence check per request
      // Note: drizzle lacks EXISTS per-group; fetch last draft ids
      const latestDrafts = await db
        .select({
          id: lyricsDraftsTable.id,
          song_request_id: lyricsDraftsTable.song_request_id,
          version: lyricsDraftsTable.version
        })
        .from(lyricsDraftsTable)
        .where(inArray(lyricsDraftsTable.song_request_id, ids))
      for (const d of latestDrafts) draftsExistence[d.song_request_id] = true
    }

    const items = await Promise.all(allRequests.map(async (r) => {
      const hasSong = Boolean(songRequestIdToSong[r.id])
      const hasDraft = Boolean(draftsExistence[r.id])
      const stage: Stage = hasSong ? 'SONG_CREATED' : (hasDraft ? 'LYRICS_CREATED' : 'SONG_REQUEST_CREATED')
      const title = await fetchTitleForRequest(r.id)
      return {
        requestId: r.id,
        createdAt: r.created_at,
        stage,
        title: title !== 'Untitled Song' ? title : `For ${r.recipient_details}`,
        // Only when song exists, attach minimal song summary for convenience
        song: hasSong ? {
          id: songRequestIdToSong[r.id]!.id,
          slug: songRequestIdToSong[r.id]!.slug,
        } : null
      }
    }))

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      total,
      hasMore: end < total,
      songs,
      items,
    })
  } catch (error) {
    console.error('Error in fetch-user-song:', error)
    return NextResponse.json({ error: true, message: 'Failed to fetch user songs' }, { status: 500 })
  }
}



