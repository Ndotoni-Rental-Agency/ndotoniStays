'use client';

import { useEffect, useState } from 'react';
import { GoogleMapsParser } from '@/lib/parse-google-maps-link';

/**
 * Resolves property coordinates from multiple sources:
 * 1. Saved coordinates on the property
 * 2. Google Maps URL (sync + async short link resolution)
 * 3. Geocoding fallback via Nominatim (OpenStreetMap)
 */
export function usePropertyCoordinates(property: any): { lat: number; lng: number } | null {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!property) return;
    let cancelled = false;

    async function resolve() {
      // 1. Saved coordinates
      const saved = property.coordinates;
      if (saved?.latitude && saved?.longitude) {
        if (!cancelled) setCoords({ lat: saved.latitude, lng: saved.longitude });
        return;
      }

      // 2. Google Maps URL (sync parse first)
      const googleMapsUrl = property.googleMapsUrl;
      if (googleMapsUrl) {
        const parsed = GoogleMapsParser.parse(googleMapsUrl);
        if (parsed) {
          if (!cancelled) setCoords({ lat: parsed.latitude, lng: parsed.longitude });
          return;
        }

        // Async resolution for short links
        const asyncParsed = await GoogleMapsParser.parseAsync(googleMapsUrl);
        if (asyncParsed) {
          if (!cancelled) setCoords({ lat: asyncParsed.latitude, lng: asyncParsed.longitude });
          return;
        }
      }

      // 3. Geocoding fallback via Nominatim
      const query = [
        property.address?.street,
        property.address?.district || property.district,
        property.address?.region || property.region,
        'Tanzania',
      ]
        .filter(Boolean)
        .join(', ');

      if (!query || query === 'Tanzania') return;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
        );
        const data = await response.json();
        if (data?.[0] && !cancelled) {
          setCoords({ lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) });
        }
      } catch {
        // Geocoding failed silently
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [property]);

  return coords;
}
