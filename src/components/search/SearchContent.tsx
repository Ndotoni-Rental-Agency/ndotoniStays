'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
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
  }, [regionParam, checkIn, checkOut, guests, propertyType, stayCategory, validMinPrice, validMaxPrice, instantBookOnly, bedrooms]);

  async function fetchProperties() {
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
        // Flatten, deduplicate by propertyId, and shuffle
        const seen = new Set<string>();
        results = allResults.flat().filter((p) => {
          if (seen.has(p.propertyId)) return false;
          seen.add(p.propertyId);
          return true;
        });
        // Shuffle for variety
        results.sort(() => Math.random() - 0.5);
      }

      setProperties(results);
    } catch (err: any) {
      console.error('Search error:', err);
      setError('Failed to load properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const displayRegion = regionParam
    ? regionParam.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : 'Tanzania';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      <SearchFilters
        region={regionParam || ''}
        checkIn={checkIn}
        checkOut={checkOut}
        guests={guests}
        minPrice={minPrice}
        maxPrice={maxPrice}
        bedrooms={bedrooms}
      />

      {/* Results header */}
      <div className="mt-6 mb-4">
        <h1 className="text-xl font-semibold text-ink-900">
          {loading ? 'Searching...' : `${properties.length} places in ${displayRegion}`}
        </h1>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-center text-red-600">
          {error}
        </div>
      )}

      {/* Results grid */}
      {!loading && !error && properties.length === 0 && (
        <div className="text-center py-16">
          <p className="text-2xl mb-2">🏠</p>
          <h3 className="text-lg font-semibold text-ink-700">No places found</h3>
          <p className="text-ink-500 mt-1">
            Try changing your dates or searching a different area.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {properties.map((property) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
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
