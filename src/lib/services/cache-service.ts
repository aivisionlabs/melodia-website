interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
  maxSize?: number // Maximum number of entries
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private defaultTTL = 5 * 60 * 1000 // 5 minutes
  private maxSize = 100

  constructor(options: CacheOptions = {}) {
    this.defaultTTL = options.ttl || this.defaultTTL
    this.maxSize = options.maxSize || this.maxSize
  }

  set<T>(key: string, data: T, ttl?: number): void {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    }

    this.cache.set(key, entry)
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry has expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  size(): number {
    return this.cache.size
  }

  private evictOldest(): void {
    let oldestKey: string | null = null
    let oldestTime = Date.now()

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Song status specific cache
export const songStatusCache = new CacheService({
  ttl: 30 * 1000, // 30 seconds for song status
  maxSize: 50
})

// Song data cache
export const songDataCache = new CacheService({
  ttl: 5 * 60 * 1000, // 5 minutes for song data
  maxSize: 100
})

// Cache keys
export const cacheKeys = {
  songStatus: (songId: number) => `song-status-${songId}`,
  songData: (songId: number) => `song-data-${songId}`,
  songBySlug: (slug: string) => `song-slug-${slug}`,
  songIdBySlug: (slug: string) => `song-id-slug-${slug}`
}

// Cache utilities
export function getCachedSongStatus(songId: number): any {
  return songStatusCache.get(cacheKeys.songStatus(songId))
}

export function setCachedSongStatus(songId: number, status: any) {
  songStatusCache.set(cacheKeys.songStatus(songId), status)
}

export function getCachedSongData(songId: number) {
  return songDataCache.get(cacheKeys.songData(songId))
}

export function setCachedSongData(songId: number, data: any) {
  songDataCache.set(cacheKeys.songData(songId), data)
}

export function invalidateSongCache(songId: number) {
  songStatusCache.delete(cacheKeys.songStatus(songId))
  songDataCache.delete(cacheKeys.songData(songId))
}

// Periodic cleanup
setInterval(() => {
  songStatusCache.cleanup()
  songDataCache.cleanup()
}, 60 * 1000) // Clean up every minute
