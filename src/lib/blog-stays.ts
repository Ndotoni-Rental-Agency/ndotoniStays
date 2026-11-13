import 'server-only';
import { cache } from 'react';
import { QUERY, prepareStays, type Property } from '@/lib/home-stays';

// Dates are explicit: these are search results for a sample night, not an evergreen inventory ranking.
export const getBlogStays = cache(async (region: string, stayCategory: string) => {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  const checkIn = date.toISOString().slice(0, 10);
  date.setUTCDate(date.getUTCDate() + 1);
  const checkOut = date.toISOString().slice(0, 10);
  const empty = { properties: [] as Property[], checkIn, checkOut };
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  const key = process.env.NEXT_PUBLIC_API_KEY;
  if (!endpoint || !key) return empty;
  try {
    const response = await fetch(endpoint, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'x-api-key': key },
      body: JSON.stringify({ query: QUERY, variables: { input: { region, stayCategory, checkInDate: checkIn, checkOutDate: checkOut, numberOfGuests: 1, limit: 100 } } }),
      next: { revalidate: 300 }, signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return empty;
    const result = await response.json();
    if (result.errors) return empty;
    const properties: Property[] = result.data?.searchShortTermProperties?.properties || [];
    // Re-check category and region so a broad API response cannot populate the wrong guide.
    const normalizeRegion = (value: string) => value.toLowerCase().replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    const matching = prepareStays(properties).filter(p => normalizeRegion(p.region || '') === normalizeRegion(region) && p.stayCategories?.includes(stayCategory as NonNullable<Property['stayCategories']>[number]));
    return { properties: matching.sort((a, b) => a.propertyId.localeCompare(b.propertyId)).slice(0, 6), checkIn, checkOut };
  } catch { return empty; }
});
