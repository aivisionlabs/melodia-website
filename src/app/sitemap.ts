import { MetadataRoute } from 'next'
import { customCreations } from '@/lib/constants'
import { Song } from '@/types'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://melodia-songs.com'

  // Base pages
  const basePages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Song pages
  const songPages = customCreations.map((song: Song) => ({
    url: `${baseUrl}/library/${song.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...basePages, ...songPages]
}