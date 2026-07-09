/**
 * Server-side property fetching using raw fetch (no Amplify client dependency).
 * Used by generateMetadata and JSON-LD generation in property pages.
 */

const GRAPHQL_ENDPOINT = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT!;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY!;

const GET_SHORT_TERM_PROPERTY_QUERY = `query GetShortTermProperty($propertyId: ID!) {
  getShortTermProperty(propertyId: $propertyId) {
    propertyId
    title
    description
    propertyType
    nightlyRate
    currency
    region
    district
    amenities
    images
    thumbnail
    maxGuests
    bedrooms
    bathrooms
    averageRating
    coordinates {
      latitude
      longitude
    }
    address {
      city
      country
      district
      region
      street
    }
    host {
      firstName
      lastName
    }
    ratingSummary {
      averageRating
      totalReviews
    }
    checkInTime
    checkOutTime
    instantBookEnabled
  }
}`;

export interface PropertySEOData {
  propertyId: string;
  title: string;
  description: string;
  propertyType: string;
  nightlyRate: number;
  currency: string;
  region: string;
  district: string;
  amenities: string[];
  images: string[];
  thumbnail: string;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  averageRating: number | null;
  coordinates: { latitude: number; longitude: number } | null;
  address: {
    city: string;
    country: string;
    district: string;
    region: string;
    street: string;
  } | null;
  host: { firstName: string; lastName: string } | null;
  ratingSummary: { averageRating: number; totalReviews: number } | null;
  checkInTime: string | null;
  checkOutTime: string | null;
  instantBookEnabled: boolean;
}

export async function fetchPropertyForSEO(propertyId: string): Promise<PropertySEOData | null> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        query: GET_SHORT_TERM_PROPERTY_QUERY,
        variables: { propertyId },
      }),
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    const data = await response.json();
    return data?.data?.getShortTermProperty || null;
  } catch (error) {
    console.error('[fetchPropertyForSEO] Error:', error);
    return null;
  }
}
