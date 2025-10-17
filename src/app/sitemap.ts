import { MetadataRoute } from 'next';
import { getActiveSongsAction, getCategoriesWithCountsAction } from '@/lib/actions';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://melodia-songs.com';

  // Static pages with priorities
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/library`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  try {
    // Fetch all active songs from database (limit 10,000 to be safe)
    const songsResult = await getActiveSongsAction(10000, 0);

    const songPages: MetadataRoute.Sitemap =
      songsResult.success && songsResult.songs
        ? songsResult.songs.map((song) => ({
          url: `${baseUrl}/library/${song.slug}`,
          lastModified: new Date(song.updated_at || song.created_at),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        }))
        : [];

    // Optionally add category pages (if they exist)
    // Commenting out for now as category pages don't exist yet
    /*
    const categoriesResult = await getCategoriesWithCountsAction();
    const categoryPages: MetadataRoute.Sitemap =
      categoriesResult.success && categoriesResult.categories
        ? categoriesResult.categories.map((category) => ({
            url: `${baseUrl}/library/category/${category.slug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.6,
          }))
        : [];
    */

    console.log(
      `Sitemap generated: ${staticPages.length} static pages + ${songPages.length} song pages`
    );

    return [...staticPages, ...songPages];
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Return at least static pages if database query fails
    return staticPages;
  }
}

// Revalidate sitemap every 24 hours
export const revalidate = 86400;