import { NextRequest, NextResponse } from 'next/server'
import { and, desc, eq, or, isNull } from 'drizzle-orm'
import { db } from '@/lib/db'
import {
  lyricsDraftsTable,
  SelectSong,
  songRequestsTable,
  songsTable,
} from '@/lib/db/schema'
import { getCurrentUser } from '@/lib/user-actions'
import { sanitizeAnonymousUserId, validateUserOwnership } from '@/lib/utils/validation'
import { calculateVariantStatus, VariantData } from '@/lib/services/song-status-calculation-service'
import { getUserContextFromRequest } from '@/lib/middleware-utils'

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
    const ownershipFilter = userId
      ? eq(songRequestsTable.user_id, userId)
      : eq(songRequestsTable.anonymous_user_id, anonymousUserId!)

    // 1) Fetch completed song requests with recipient details
    const completedRequests = await db
      .select({
        id: songRequestsTable.id,
        status: songRequestsTable.status,
        created_at: songRequestsTable.created_at,
        recipient_details: songRequestsTable.recipient_details,
      })
      .from(songRequestsTable)
      .where(
        and(
          ownershipFilter,
          eq(songRequestsTable.status, 'completed')
        )
      )
      .orderBy(desc(songRequestsTable.created_at))


    // 2) Fetch not completed song requests (pending/processing) with recipient details
    const inProgressRequests = await db
      .select({
        id: songRequestsTable.id,
        status: songRequestsTable.status,
        created_at: songRequestsTable.created_at,
        recipient_details: songRequestsTable.recipient_details,
      })
      .from(songRequestsTable)
      .where(
        and(
          ownershipFilter,
          or(eq(songRequestsTable.status, 'pending'), eq(songRequestsTable.status, 'processing'))
        )
      )
      .orderBy(desc(songRequestsTable.created_at))

    // 3) Fetch songs for completed requests only
    const completedRequestIds = new Set(completedRequests.map((r) => r.id))

    const completedSongsQuery = await db
      .select()
      .from(songsTable)
      .where(
        // Filter songs that are not deleted
        isNull(songsTable.is_deleted)
      )

    const completedSongsAll = (completedSongsQuery as SelectSong[]).filter((s) => completedRequestIds.has(s.song_request_id))
    // Sort by created_at desc
    completedSongsAll.sort((a, b) => new Date(b.created_at as any).getTime() - new Date(a.created_at as any).getTime())

    const total = completedSongsAll.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const pageSongs = completedSongsAll.slice(start, end)

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
        createdAt: (song.created_at as unknown as Date).toISOString?.() || String(song.created_at),
        variants: apiVariants,
        selectedVariantIndex: song.selected_variant,
        variantTimestampLyricsProcessed: song.variant_timestamp_lyrics_processed,
      })
    }

    // Helper: fetch song title for in-progress requests
    const inProgressWithTitles = await Promise.all(
      inProgressRequests.map(async (r) => {
        const title = await fetchTitleForRequest(r.id);
        return {
          id: r.id,
          status: r.status,
          created_at: r.created_at,
          title: title !== 'Untitled Song' ? title : `For ${r.recipient_details}`,
        };
      })
    );

    return NextResponse.json({
      success: true,
      page,
      pageSize,
      total,
      hasMore: end < total,
      songs,
      inProgressRequests: inProgressWithTitles,
    })
  } catch (error) {
    console.error('Error in fetch-user-song:', error)
    return NextResponse.json({ error: true, message: 'Failed to fetch user songs' }, { status: 500 })
  }
}



