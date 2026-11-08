import 'server-only';
import { cache } from 'react';
import type { ShortTermProperty } from '@/API';

export type PropertySEOData = ShortTermProperty & { groupId?: string | null; isPrimaryUnit?: boolean | null; unitLabel?: string | null };

// Public API projection only. Private contact/check-in data is loaded by authenticated flows.
const QUERY = `query GetShortTermProperty($propertyId: ID!) {
  getShortTermProperty(propertyId: $propertyId) {
    verified
    address {
      city
      country
      district
      postalCode
      region
      street
      ward
      __typename
    }
    advanceBookingDays
    allowsChildren
    allowsInfants
    allowsPets
    allowsSmoking
    amenities
    averageRating
    bathrooms
    kitchenCount
    kitchenAccess
    bedrooms
    cancellationPolicy
    checkInTime
    checkOutTime
    cleaningFee
    coordinates {
      latitude
      longitude
      __typename
    }
    createdAt
    currency
    description
    district
    googleMapsUrl
    groupId
    host {
      firstName
      lastName
      profileImage
      __typename
    }
    hostId
    houseRules
    images
    instantBookEnabled
    isPrimaryUnit
    maxAdults
    maxChildren
    maxGuests
    maxInfants
    maximumStay
    minimumStay
    nightlyRate
    propertyId
    propertyType
    publishedAt
    ratingSummary {
      accuracy
      averageRating
      cleanliness
      communication
      fiveStars
      fourStars
      location
      oneStar
      threeStars
      totalReviews
      twoStars
      value
      __typename
    }
    region
    serviceFeePercentage
    status
    stayCategories
    taxPercentage
    thumbnail
    title
    unitLabel
    updatedAt
    videos
    __typename
  }
}
`;

/** Null means a confirmed missing/unpublished listing; upstream failures must remain errors. */
export const fetchPropertyForSEO = cache(async (propertyId: string): Promise<PropertySEOData | null> => {
  const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT;
  const apiKey = process.env.NEXT_PUBLIC_API_KEY;
  if (!endpoint || !apiKey) throw new Error('Public property API is not configured');
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
    body: JSON.stringify({ query: QUERY, variables: { propertyId } }),
    next: { revalidate: 300 },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`Public property API returned ${response.status}`);
  const result = await response.json();
  if (result.errors?.length) {
    // AppSync currently wraps NdotoniError.notFound as Lambda:Unhandled.
    // Recognize only the exact application response, never generic upstream errors.
    const missing = result.data?.getShortTermProperty === null && result.errors.every((error: {
      message?: string; errorType?: string; path?: string[]; extensions?: { code?: string };
    }) => error.path?.length === 1 && error.path[0] === 'getShortTermProperty' && (
      error.extensions?.code === 'NOT_FOUND' || error.errorType === 'NOT_FOUND' ||
      (error.errorType === 'Lambda:Unhandled' && error.message === 'The requested property could not be found.')
    ));
    if (missing) return null;
    throw new Error('Public property API could not load the listing');
  }
  if (!result.data || !Object.prototype.hasOwnProperty.call(result.data, 'getShortTermProperty')) {
    throw new Error('Public property API returned an invalid response');
  }
  const property: PropertySEOData | null = result.data.getShortTermProperty;
  if (!property || property.status === 'DRAFT' || property.status === 'DELETED') return null;
  return property;
});
