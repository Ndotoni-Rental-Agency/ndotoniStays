'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Flag, SearchX } from 'lucide-react';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/graphql/queries';
import { ShortTermProperty } from '@/API';
import { PropertyGallery } from '@/components/property/PropertyGallery';
import { PropertyInfo } from '@/components/property/PropertyInfo';
import { MobileBookingBar } from '@/components/property/MobileBookingBar';
import { BookingSidebar } from '@/components/property/BookingSidebar';
import { PropertyReviews } from '@/components/property/PropertyReviews';
import { PropertyLocationMap } from '@/components/property/PropertyLocationMap';
import { PropertyGroupUnits } from '@/components/property/PropertyGroupUnits';
import { AdminContactCard } from '@/components/property/AdminContactCard';
import { usePropertyCoordinates } from '@/hooks/usePropertyCoordinates';
import { ReportPropertyModal } from '@/components/property/ReportPropertyModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';

// Not yet in the generated ShortTermProperty type — see queries.ts note on getShortTermProperty.
type PropertyWithGroup = ShortTermProperty & { groupId?: string | null };

export function PropertyDetailClient() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const [property, setProperty] = useState<PropertyWithGroup | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [reportAfterSignIn, setReportAfterSignIn] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const checkIn = searchParams.get('checkIn') || '';
  const checkOut = searchParams.get('checkOut') || '';

  const coords = usePropertyCoordinates(property);

  useEffect(() => {
    if (!id) return;
    fetchProperty();
  }, [id]);

  // Resume the report flow once a signed-out user finishes signing in
  useEffect(() => {
    if (isAuthenticated && reportAfterSignIn) {
      setReportAfterSignIn(false);
      setShowAuth(false);
      setShowReport(true);
    }
  }, [isAuthenticated, reportAfterSignIn]);

  function handleOpenReport() {
    if (!isAuthenticated) {
      setReportAfterSignIn(true);
      setShowAuth(true);
      return;
    }
    setShowReport(true);
  }

  async function fetchProperty() {
    try {
      const data = await GraphQLClient.executePublic<{ getShortTermProperty: PropertyWithGroup }>(
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
        <SearchX className="w-10 h-10 text-ink-400 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-ink-700">
          {error || 'Property not found'}
        </h2>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 sm:py-8 pb-24 lg:pb-8">
      {property.status && property.status !== 'AVAILABLE' && (
        <div className="mx-4 sm:mx-0 my-4 sm:mt-0 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {t('property.notLive').replace('{status}', property.status)}
        </div>
      )}

      {/* Gallery — full-bleed on mobile, padded on desktop */}
      <div className="sm:px-0">
        <PropertyGallery images={property.images ?? []} videos={property.videos ?? undefined} title={property.title} />
      </div>

      {/* Mobile booking card - shown above property details on small screens */}
      <div id="mobile-booking" tabIndex={-1} className="scroll-mt-24 mt-6 px-4 sm:px-0 lg:hidden">
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
          <AdminContactCard propertyId={property.propertyId} />
          {property.groupId && (
            <PropertyGroupUnits groupId={property.groupId} currentPropertyId={property.propertyId} />
          )}
          <PropertyReviews
            propertyId={property.propertyId}
            ratingSummary={property.ratingSummary}
          />
          <PropertyLocationMap
            lat={coords?.lat || 0}
            lng={coords?.lng || 0}
            title={property.title}
          />
          <button
            type="button"
            onClick={handleOpenReport}
            className="mt-8 inline-flex items-center gap-2 text-sm text-ink-500 hover:text-red-600 underline-offset-4 hover:underline transition-colors"
          >
            <Flag className="w-4 h-4" />
            {t('property.report')}
          </button>
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

      <MobileBookingBar nightlyRate={property.nightlyRate} currency={property.currency} />
      <ReportPropertyModal
        isOpen={showReport}
        onClose={() => setShowReport(false)}
        propertyId={property.propertyId}
        propertyTitle={property.title}
      />
      {/* The pending report isn't cleared on close: AuthModal closes in the same tick it
          signs the user in, so clearing here would drop the report before the effect sees auth. */}
      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </div>
  );
}
