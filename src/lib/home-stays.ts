import type { ComponentProps } from 'react';
import type { PropertyCard } from '@/components/property/PropertyCard';
import type { StayCategory } from '@/API';

export type Property = ComponentProps<typeof PropertyCard>['property'] & { stayCategories?: StayCategory[] | null };
export const QUERY = `query HomeStays($input: ShortTermSearchInput!) {
  searchShortTermProperties(input: $input) {
    properties {
      propertyId title verified nightlyRate currency propertyType region district
      address { ward street } thumbnail images averageRating
      ratingSummary { averageRating totalReviews } maxGuests bedrooms bathrooms instantBookEnabled stayCategories
    }
  }
}`;

export type HomeStaysData = { properties: Property[]; dates: { checkIn: string; checkOut: string } };
export function prepareStays(properties: Property[]): Property[] {
  const seen = new Set<string>();
  return properties.filter(p => {
    if (/^HydraTest[-_]/i.test(p.title) || seen.has(p.propertyId)) return false;
    seen.add(p.propertyId); return true;
  }).sort((a, b) => {
    const rate = (p: Property) => (Number(p.nightlyRate) || 0) *
      (({ TZS: 1, USD: 2650, EUR: 2900, GBP: 3400, KES: 21 } as Record<string, number>)[(p.currency || 'TZS').toUpperCase()] || 1);
    return rate(b) - rate(a);
  });
}
