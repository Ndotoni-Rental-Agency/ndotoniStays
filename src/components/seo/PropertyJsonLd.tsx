import { PropertySEOData } from '@/lib/fetch-property';

interface PropertyJsonLdProps {
  property: PropertySEOData;
}

export function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.title,
    description: property.description,
    image: property.images?.length > 0 ? property.images : property.thumbnail ? [property.thumbnail] : undefined,
    address: property.address
      ? {
          '@type': 'PostalAddress',
          streetAddress: property.address.street || undefined,
          addressLocality: property.address.city || property.district,
          addressRegion: property.address.region || property.region,
          addressCountry: property.address.country || 'TZ',
        }
      : undefined,
    geo: property.coordinates
      ? {
          '@type': 'GeoCoordinates',
          latitude: property.coordinates.latitude,
          longitude: property.coordinates.longitude,
        }
      : undefined,
    starRating: property.ratingSummary?.averageRating
      ? {
          '@type': 'Rating',
          ratingValue: property.ratingSummary.averageRating,
          bestRating: 5,
        }
      : undefined,
    aggregateRating: property.ratingSummary?.totalReviews
      ? {
          '@type': 'AggregateRating',
          ratingValue: property.ratingSummary.averageRating,
          reviewCount: property.ratingSummary.totalReviews,
          bestRating: 5,
          worstRating: 1,
        }
      : undefined,
    priceRange: `${property.currency} ${property.nightlyRate.toLocaleString()} / night`,
    amenityFeature: property.amenities?.map((amenity) => ({
      '@type': 'LocationFeatureSpecification',
      name: amenity,
      value: true,
    })),
    numberOfRooms: property.bedrooms || undefined,
    checkinTime: property.checkInTime || undefined,
    checkoutTime: property.checkOutTime || undefined,
    url: `https://www.ndotonistays.com/property/${property.propertyId}`,
    offers: {
      '@type': 'Offer',
      price: property.nightlyRate,
      priceCurrency: property.currency === 'TZS' ? 'TZS' : property.currency === '$' ? 'USD' : property.currency,
      availability: 'https://schema.org/InStock',
      validFrom: new Date().toISOString().split('T')[0],
    },
  };

  // Remove undefined values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd) }}
    />
  );
}
