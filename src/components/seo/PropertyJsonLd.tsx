import { PropertySEOData } from '@/lib/fetch-property';

interface PropertyJsonLdProps {
  property: PropertySEOData;
}

export function PropertyJsonLd({ property }: PropertyJsonLdProps) {
  // Video-only listings (no images, empty thumbnail) would otherwise omit `image` entirely —
  // Google's rich-result guidelines expect one, so fall back to a site placeholder rather
  // than leaving the listing thumbnail-less in search results.
  const previewImage = property.images?.length
    ? property.images
    : [property.thumbnail || 'https://www.ndotonistays.com/placeholder.jpg'];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: property.title,
    description: property.description,
    image: previewImage,
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
      // A listed nightly rate does not establish availability for any particular dates.
      url: `https://www.ndotonistays.com/property/${property.propertyId}`,
    },
  };

  // Remove undefined values
  const cleanJsonLd = JSON.parse(JSON.stringify(jsonLd));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(cleanJsonLd).replace(/</g, '\\u003c') }}
    />
  );
}
