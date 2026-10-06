'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Home, SlidersHorizontal, ArrowRight } from 'lucide-react';
import { GraphQLClient } from '@/lib/graphql-client';
import { searchShortTermProperties } from '@/graphql/queries';
import { PropertyCard } from '@/components/property/PropertyCard';
import { SearchFilters } from './SearchFilters';

// All active regions to query when no specific region is selected
const ALL_REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

interface ShortTermProperty {
  propertyId: string;
  title: string;
  nightlyRate: number;
  currency: string;
  propertyType: string;
  stayCategories: string[] | null;
  region: string;
  district: string;
  address?: { ward?: string | null; street?: string | null } | null;
  thumbnail: string;
  images: string[];
  averageRating: number | null;
  ratingSummary: { averageRating: number; totalReviews: number } | null;
  maxGuests: number;
  bedrooms: number | null;
  bathrooms: number | null;
  instantBookEnabled: boolean;
}

export function SearchContent() {
  const searchParams = useSearchParams();
  const requestId = useRef(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [properties, setProperties] = useState<ShortTermProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const regionParam = searchParams.get('region');
  const checkIn = searchParams.get('checkIn') || getDefaultCheckIn();
  const checkOut = searchParams.get('checkOut') || getDefaultCheckOut();
  const guests = parseInt(searchParams.get('guests') || '1');
  const propertyType = searchParams.get('propertyType') || undefined;
  const stayCategory = searchParams.get('category') || undefined;
  const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
  const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;
  const instantBookOnly = searchParams.get('instantBook') === 'true';
  const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;

  // Guard: don't send invalid price ranges to backend
  const validMinPrice = (minPrice !== undefined && maxPrice !== undefined && minPrice >= maxPrice) ? undefined : minPrice;
  const validMaxPrice = (minPrice !== undefined && maxPrice !== undefined && maxPrice <= minPrice) ? undefined : maxPrice;

  useEffect(() => {
    fetchProperties();
    return () => { requestId.current += 1; };
  }, [regionParam, checkIn, checkOut, guests, propertyType, stayCategory, validMinPrice, validMaxPrice, instantBookOnly, bedrooms]);

  async function fetchProperties() {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const baseInput = {
        checkInDate: checkIn,
        checkOutDate: checkOut,
        numberOfGuests: guests,
        ...(propertyType && { propertyType }),
        ...(stayCategory && { stayCategory }),
        ...(validMinPrice && { minPrice: validMinPrice }),
        ...(validMaxPrice && { maxPrice: validMaxPrice }),
        ...(instantBookOnly && { instantBookOnly: true }),
        ...(bedrooms && { bedrooms }),
        limit: 20,
      };

      let results: ShortTermProperty[];

      if (regionParam) {
        // Single region query
        const data = await GraphQLClient.executePublic<{
          searchShortTermProperties: { properties: ShortTermProperty[]; nextToken: string | null };
        }>(searchShortTermProperties, { input: { ...baseInput, region: regionParam } });

        results = data.searchShortTermProperties?.properties || [];
      } else {
        // No region specified — query all regions in parallel
        const queries = ALL_REGIONS.map((region) =>
          GraphQLClient.executePublic<{
            searchShortTermProperties: { properties: ShortTermProperty[]; nextToken: string | null };
          }>(searchShortTermProperties, { input: { ...baseInput, region } })
            .then((d) => d.searchShortTermProperties?.properties || [])
            .catch(() => [] as ShortTermProperty[])
        );

        const allResults = await Promise.all(queries);
        // Keep a stable region order and deduplicate by propertyId.
        const seen = new Set<string>();
        results = allResults.flat().filter((p) => {
          if (seen.has(p.propertyId)) return false;
          seen.add(p.propertyId);
          return true;
        });

      }

      if (currentRequest !== requestId.current) return;
      setProperties(results.filter(p => !/^HydraTest[-_]/i.test(p.title)));
    } catch (err: any) {
      console.error('Search error:', err);
      if (currentRequest !== requestId.current) return;
      setError('Failed to load properties. Please try again.');
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  const displayRegion = regionParam
    ? regionParam.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : 'Tanzania';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-5">
        <div><p className="text-xs uppercase tracking-[0.18em] font-semibold text-brand-700 mb-3">Find your next stay</p>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900">A little escape in {displayRegion}.</h1>
          <p className="mt-3 text-sm text-ink-500">{new Date(`${checkIn}T12:00:00`).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} – {new Date(`${checkOut}T12:00:00`).toLocaleDateString('en-GB', {day:'numeric', month:'short'})} · {guests} {guests === 1 ? 'guest' : 'guests'}</p>
        </div>
        <button className="btn-secondary gap-2 min-h-[44px]" aria-expanded={filtersOpen} aria-controls="stay-search-filters" onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={16} />{filtersOpen ? 'Hide filters' : 'Dates & filters'}</button>
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {[propertyType?.replace(/_/g, ' '), stayCategory?.replace(/_/g, ' '), minPrice !== undefined ? `From TSh ${minPrice.toLocaleString()}` : '', maxPrice !== undefined ? `Up to TSh ${maxPrice.toLocaleString()}` : '', bedrooms ? `${bedrooms}+ bedrooms` : '', instantBookOnly ? 'Instant booking' : ''].filter(Boolean).map(label => <button key={label} onClick={() => setFiltersOpen(true)} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-medium text-brand-800">{label}</button>)}
      </div>
      <div id="stay-search-filters" hidden={!filtersOpen} className="mb-8">
      <SearchFilters
        region={regionParam || ''}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        minPrice={minPrice}
        maxPrice={maxPrice}
        bedrooms={bedrooms}
      />

      </div>
      {/* Results header */}
      <div className="mt-6 mb-4">
        <h2 className="text-sm font-medium text-ink-600" aria-live="polite">
          {loading ? 'Searching...' : `${properties.length} places loaded · Prices per night`}
        </h2>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center text-red-600">
          {error}
          <button onClick={fetchProperties} className="block mx-auto mt-3 underline font-medium">Try again</button>
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && properties.length === 0 && (
        <div className="text-center py-16 px-5 rounded-3xl bg-ink-50 border border-ink-100">
          <Home className="w-6 h-6 text-ink-400 mx-auto mb-2" />
          <h3 className="text-lg font-semibold text-ink-700">No places found</h3>
          <p className="text-ink-500 mt-1">
            Try changing your dates or searching a different area.
          </p>
          <button onClick={() => setFiltersOpen(true)} className="btn-primary mt-6 gap-2">Change dates or area <ArrowRight size={16} /></button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-9">
        {!loading && !error && properties.map((property) => (
          <PropertyCard
            key={property.propertyId}
            property={property}
            checkIn={checkIn}
            checkOut={checkOut}
          />
        ))}
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-9">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-ink-100">
              <div className="h-48 bg-ink-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 w-3/4 bg-ink-100 rounded" />
                <div className="h-3 w-1/2 bg-ink-100 rounded" />
                <div className="h-5 w-1/3 bg-ink-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function getDefaultCheckIn(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function getDefaultCheckOut(): string {
  const d = new Date();
  d.setDate(d.getDate() + 2);
  return d.toISOString().split('T')[0];
}
