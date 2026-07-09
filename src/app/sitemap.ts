import { MetadataRoute } from 'next';

const BASE_URL = 'https://www.ndotonistays.com';

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

interface PropertyResult {
  propertyId: string;
  updatedAt?: string;
}

async function fetchPropertyIds(): Promise<PropertyResult[]> {
  const query = `query SearchShortTermProperties($input: ShortTermSearchInput!) {
    searchShortTermProperties(input: $input) {
      properties {
        propertyId
        updatedAt
      }
    }
  }`;

  // Get tomorrow and day after for required date fields
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 2);

  const checkInDate = tomorrow.toISOString().split('T')[0];
  const checkOutDate = dayAfter.toISOString().split('T')[0];

  const allProperties: PropertyResult[] = [];

  // Query all regions in parallel
  const queries = REGIONS.map(async (region) => {
    try {
      const response = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY,
        },
        body: JSON.stringify({
          query,
          variables: {
            input: {
              region,
              checkInDate,
              checkOutDate,
              numberOfGuests: 1,
              limit: 50,
            },
          },
        }),
        next: { revalidate: 3600 }, // Cache for 1 hour
      });

      const data = await response.json();
      return data?.data?.searchShortTermProperties?.properties || [];
    } catch {
      return [];
    }
  });

  const results = await Promise.all(queries);
  const seen = new Set<string>();

  for (const properties of results) {
    for (const p of properties) {
      if (!seen.has(p.propertyId)) {
        seen.add(p.propertyId);
        allProperties.push(p);
      }
    }
  }

  return allProperties;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/become-host`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/invest`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  // Category search pages
  const categories = ['NIGHTLY_STAY', 'BEACH', 'SAFARI', 'PARTY', 'PHOTOSHOOT', 'MEETING'];
  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/search?category=${cat}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }));

  // Dynamic property pages
  let propertyPages: MetadataRoute.Sitemap = [];
  try {
    const properties = await fetchPropertyIds();
    propertyPages = properties.map((p) => ({
      url: `${BASE_URL}/property/${p.propertyId}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error('Failed to fetch properties for sitemap:', error);
  }

  return [...staticPages, ...categoryPages, ...propertyPages];
}
