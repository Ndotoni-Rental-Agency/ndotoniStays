'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/graphql/queries';
import { ShortTermProperty } from '@/API';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyInfo } from '@/components/property/PropertyInfo';
import { BookingSidebar } from '@/components/property/BookingSidebar';
import { PropertyReviews } from '@/components/property/PropertyReviews';
import { PropertyLocationMap } from '@/components/property/PropertyLocationMap';
import { usePropertyCoordinates } from '@/hooks/usePropertyCoordinates';

export function PropertyDetailClient() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<ShortTermProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const coords = usePropertyCoordinates(property);

  useEffect(() => {
    if (!id) return;
    fetchProperty();
  }, [id]);

  async function fetchProperty() {
    try {
      const data = await GraphQLClient.executePublic<{ getShortTermProperty: ShortTermProperty }>(
        getShortTermProperty,
        { propertyId: id }
      );
      console.log('[PropertyDetail] host data:', data.getShortTermProperty?.host ?? '⚠️ host is null');
      setProperty(data.getShortTermProperty);
    } catch (err) {
      console.error('Error fetching property:', err);
      setError('Failed to load property details.');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="h-[400px] bg-ink-100 rounded-2xl mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <div className="h-8 w-3/4 bg-ink-100 rounded" />
            <div className="h-4 w-1/2 bg-ink-100 rounded" />
            <div className="h-24 bg-ink-100 rounded" />
          </div>
          <div className="h-80 bg-ink-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-4xl mb-4">😕</p>
        <h2 className="text-xl font-semibold text-ink-700">
          {error || 'Property not found'}
        </h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8">
      {/* Gallery — full-bleed on mobile, padded on desktop */}
      <div className="sm:px-0">
        <PropertyGallery images={property.images ?? []} videos={property.videos ?? undefined} title={property.title} />
      </div>

      {/* Mobile booking card - shown above property details on small screens */}
      <div className="mt-6 px-4 sm:px-0 lg:hidden">
        <BookingSidebar
          property={property}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
        />
      </div>

      {/* Content grid */}
      <div className="mt-8 px-4 sm:px-0 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Property info */}
        <div className="lg:col-span-2">
          <PropertyInfo property={property} />
          <PropertyReviews
            propertyId={property.propertyId}
            ratingSummary={property.ratingSummary}
          />
          <PropertyLocationMap
            lat={coords?.lat || 0}
            lng={coords?.lng || 0}
            title={property.title}
          />
        </div>

        {/* Right: Booking sidebar (sticky) - desktop only */}
        <div className="hidden lg:block lg:col-span-1">
          <BookingSidebar
            property={property}
            initialCheckIn={checkIn}
            initialCheckOut={checkOut}
          />
        </div>
      </div>
    </div>
  );
}
