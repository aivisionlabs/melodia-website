import Fuse, { IFuseOptions, FuseResult } from 'fuse.js';
import { Song } from '@/types';

export interface SearchableSong {
  id: number;
  title: string;
  song_description?: string | null;
  music_style?: string | null;
  service_provider?: string | null;
  categories?: string[] | null;
  categoryNames?: string[] | null; // NEW: Flattened category names for better search
  tags?: string[] | null;
  slug: string;
}

// Configure Fuse.js options for optimal song search
const fuseOptions: IFuseOptions<SearchableSong> = {
  keys: [
    {
      name: 'title',
      weight: 0.35 // Reduced from 0.4 to make room for category names
    },
    {
      name: 'song_description',
      weight: 0.25 // Reduced from 0.3 to make room for category names
    },
    {
      name: 'music_style',
      weight: 0.15
    },
    {
      name: 'categoryNames',
      weight: 0.15 // NEW: High weight for category names
    },
    {
      name: 'service_provider',
      weight: 0.05
    },
    {
      name: 'categories',
      weight: 0.03 // Reduced from 0.05 since we have categoryNames
    },
    {
      name: 'tags',
      weight: 0.02
    }
  ],
  threshold: 0.4, // Lower threshold = more strict matching (0.0 = exact match, 1.0 = match anything)
  distance: 100, // Maximum distance for fuzzy matching
  includeScore: true, // Include match scores in results
  includeMatches: true, // Include which fields matched
  minMatchCharLength: 2, // Minimum characters required for a match
  shouldSort: true, // Sort results by relevance
  findAllMatches: true, // Find all matches, not just the first one
  ignoreLocation: true, // Ignore location of match within the string
  useExtendedSearch: true, // Enable extended search syntax
};

export class FuzzySongSearch {
  private fuse: Fuse<SearchableSong>;
  private songs: SearchableSong[] = [];

  constructor(songs: SearchableSong[]) {
    this.songs = songs;
    this.fuse = new Fuse(songs, fuseOptions);
  }

  /**
   * Perform fuzzy search on songs
   * @param query - Search query string
   * @param limit - Maximum number of results to return (default: 50)
   * @returns Array of search results with scores
   */
  search(query: string, limit: number = 50): FuseResult<SearchableSong>[] {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const trimmedQuery = query.trim();

    // Use extended search for better results
    const extendedQuery = this.buildExtendedQuery(trimmedQuery);

    const results = this.fuse.search(extendedQuery);

    // Apply additional filtering and scoring
    const filteredResults = this.applyAdditionalScoring(results, trimmedQuery);

    return filteredResults.slice(0, limit);
  }

  /**
   * Build extended search query for better matching
   */
  private buildExtendedQuery(query: string): string {
    const words = query.split(/\s+/).filter(word => word.length > 0);

    if (words.length === 1) {
      // Single word - use fuzzy matching
      return words[0];
    } else {
      // Multiple words - require all words to match (AND logic)
      return words.map(word => `'${word}`).join(' ');
    }
  }

  /**
   * Apply additional scoring based on various factors
   */
  private applyAdditionalScoring(
    results: FuseResult<SearchableSong>[],
    originalQuery: string
  ): FuseResult<SearchableSong>[] {
    return results.map(result => {
      let additionalScore = 0;
      const item = result.item;
      const query = originalQuery.toLowerCase();

      // Boost score for exact title matches
      if (item.title.toLowerCase().includes(query)) {
        additionalScore += 0.1;
      }

      // Boost score for exact description matches
      if (item.song_description?.toLowerCase().includes(query)) {
        additionalScore += 0.05;
      }

      // Boost score for exact style matches
      if (item.music_style?.toLowerCase().includes(query)) {
        additionalScore += 0.03;
      }

      // Boost score for category matches
      if (item.categories?.some((cat: string) => cat.toLowerCase().includes(query))) {
        additionalScore += 0.02;
      }

      // Boost score for category name matches (higher boost for category names)
      if (item.categoryNames?.some((catName: string) => catName.toLowerCase().includes(query))) {
        additionalScore += 0.08;
      }

      // Boost score for tag matches
      if (item.tags?.some((tag: string) => tag.toLowerCase().includes(query))) {
        additionalScore += 0.02;
      }

      // Boost score for songs with more complete information
      let completenessScore = 0;
      if (item.song_description) completenessScore += 0.01;
      if (item.music_style) completenessScore += 0.01;
      if (item.categories && item.categories.length > 0) completenessScore += 0.01;
      if (item.tags && item.tags.length > 0) completenessScore += 0.01;

      // Adjust the final score (lower is better in Fuse.js)
      const adjustedScore = Math.max(0, (result.score || 1) - additionalScore - completenessScore);

      return {
        ...result,
        score: adjustedScore
      };
    }).sort((a, b) => (a.score || 1) - (b.score || 1));
  }

  /**
   * Get search suggestions based on partial input
   * @param query - Partial search query
   * @param limit - Maximum number of suggestions
   * @returns Array of suggestion strings
   */
  getSuggestions(query: string, limit: number = 5): string[] {
    if (!query || query.trim().length < 1) {
      return [];
    }

    const trimmedQuery = query.trim().toLowerCase();
    const suggestions = new Set<string>();

    // Extract suggestions from titles
    this.songs.forEach(song => {
      const title = song.title.toLowerCase();
      if (title.includes(trimmedQuery)) {
        // Find the word that contains the query
        const words = song.title.split(/\s+/);
        words.forEach(word => {
          if (word.toLowerCase().includes(trimmedQuery) && word.length > trimmedQuery.length) {
            suggestions.add(word);
          }
        });
      }
    });

    // Extract suggestions from descriptions
    this.songs.forEach(song => {
      if (song.song_description) {
        const description = song.song_description.toLowerCase();
        if (description.includes(trimmedQuery)) {
          const words = song.song_description.split(/\s+/);
          words.forEach(word => {
            if (word.toLowerCase().includes(trimmedQuery) && word.length > trimmedQuery.length) {
              suggestions.add(word);
            }
          });
        }
      }
    });

    // Extract suggestions from music styles
    this.songs.forEach(song => {
      if (song.music_style) {
        const style = song.music_style.toLowerCase();
        if (style.includes(trimmedQuery)) {
          suggestions.add(song.music_style);
        }
      }
    });

    // Extract suggestions from category names
    this.songs.forEach(song => {
      if (song.categoryNames) {
        song.categoryNames.forEach(categoryName => {
          const category = categoryName.toLowerCase();
          if (category.includes(trimmedQuery)) {
            suggestions.add(categoryName);
          }
        });
      }
    });

    return Array.from(suggestions).slice(0, limit);
  }

  /**
   * Update the songs data
   */
  updateSongs(songs: SearchableSong[]): void {
    this.songs = songs;
    this.fuse = new Fuse(songs, fuseOptions);
  }

  /**
   * Get all songs (for fallback)
   */
  getAllSongs(): SearchableSong[] {
    return this.songs;
  }
}

/**
 * Convert Song type to SearchableSong type
 */
export function songToSearchable(song: Song): SearchableSong {
  return {
    id: song.id,
    title: song.title,
    song_description: song.song_description,
    music_style: song.music_style,
    service_provider: song.service_provider,
    categories: song.categories,
    tags: song.tags,
    slug: song.slug,
  };
}

/**
 * Convert SearchableSong back to Song type
 */
export function searchableToSong(searchableSong: SearchableSong, originalSong: Song): Song {
  return {
    ...originalSong,
    id: searchableSong.id,
    title: searchableSong.title,
    song_description: searchableSong.song_description ?? null,
    music_style: searchableSong.music_style ?? null,
    service_provider: searchableSong.service_provider ?? null,
    categories: searchableSong.categories ?? undefined,
    tags: searchableSong.tags ?? undefined,
    slug: searchableSong.slug,
  };
}
