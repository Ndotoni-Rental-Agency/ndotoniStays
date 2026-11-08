import type { Metadata } from 'next';
import type { PropertySEOData } from './fetch-property';
import { locationLine } from './location/format';

export const PROPERTY_BASE_URL = 'https://www.ndotonistays.com';
export function propertyCanonical(propertyId: string) {
  return `${PROPERTY_BASE_URL}/property/${encodeURIComponent(propertyId)}`;
}
function compact(value: string) { return value.replace(/\s+/g, ' ').trim(); }
function snippet(value: string) {
  const text = compact(value);
  if (text.length <= 160) return text;
  return text.slice(0, 157).replace(/\s+\S*$/, '') + '…';
}
export function buildPropertyMetadata(property: PropertySEOData): Metadata {
  const name = compact(property.title);
  const location = locationLine({ ward: property.address?.ward, district: property.district, region: property.region });
  const price = Number.isFinite(property.nightlyRate) && property.nightlyRate > 0
    ? `Listed rate: ${property.currency} ${property.nightlyRate.toLocaleString('en-TZ')}/night.` : '';
  const specs = [property.bedrooms ? `${property.bedrooms} bedrooms` : '', property.maxGuests ? `up to ${property.maxGuests} guests` : ''].filter(Boolean).join(', ');
  const amenities = (property.amenities || []).filter((a): a is string => !!a).slice(0, 3).join(', ');
  const description = snippet([location ? `Stay in ${location}.` : '', price, specs ? `${specs}.` : '', amenities ? `${amenities}.` : '', 'See photos and check your dates.'].filter(Boolean).join(' '));
  const image = property.images?.[0] || property.thumbnail || undefined;
  const title = `${name}${location && !name.toLowerCase().includes(location.toLowerCase()) ? ` – ${location}` : ''} | Ndotoni Stays`;
  const canonical = propertyCanonical(property.propertyId);
  return {
    title, description,
    alternates: { canonical },
    robots: property.status === 'AVAILABLE' ? { index: true, follow: true } : { index: false, follow: true },
    openGraph: { title, description, url: canonical, type: 'website', images: image ? [{ url: image, alt: name }] : undefined },
    twitter: { card: image ? 'summary_large_image' : 'summary', title, description, images: image ? [image] : undefined },
  };
}
