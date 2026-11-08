import type { MetadataRoute } from 'next';
import { blogPosts } from './blog/posts';
import { getSitemapListings } from '@/lib/sitemap-listings';

const BASE_URL = 'https://www.ndotonistays.com';
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/impact`, changeFrequency: 'monthly', priority: 0.6 },
    {
      url: BASE_URL,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/become-host`,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/invest`,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
  const blogPages: MetadataRoute.Sitemap = blogPosts.map(post => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date), changeFrequency: 'monthly', priority: 0.7,
  }));
  staticPages.push({ url: `${BASE_URL}/blog`, changeFrequency: 'weekly', priority: 0.8 });
  // Preserve the existing category URLs while their indexing strategy is reviewed separately.
  const categoryPages: MetadataRoute.Sitemap = ['NIGHTLY_STAY', 'BEACH', 'SAFARI', 'PARTY', 'PHOTOSHOOT', 'MEETING'].map(category => ({
    url: `${BASE_URL}/search?category=${category}`, changeFrequency: 'weekly', priority: 0.7,
  }));
  const listings = await getSitemapListings();
  const propertyPages: MetadataRoute.Sitemap = listings.map(property => ({
    url: `${BASE_URL}/property/${encodeURIComponent(property.propertyId)}`,
    ...(property.updatedAt && Number.isFinite(Date.parse(property.updatedAt)) ? { lastModified: new Date(property.updatedAt) } : {}),
    changeFrequency: 'weekly', priority: 0.8,
  }));
  return [...staticPages, ...blogPages, ...categoryPages, ...propertyPages];
}
