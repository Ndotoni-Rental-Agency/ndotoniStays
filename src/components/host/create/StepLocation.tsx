'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchLocations, LocationData } from '@/lib/location/cloudfront-locations';
import { GraphQLClient } from '@/lib/graphql-client';
import { getWards } from '@/graphql/queries';
import LocationMapPicker from '@/components/location/LocationMapPicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

interface Ward {
  id: string;
  name: string;
}

interface ResolvedLocation {
  lat: number;
  lng: number;
  region?: string;
  district?: string;
}

/**
 * Resolve a Google Maps URL to coordinates by fetching the page and extracting from body.
 * Then reverse-geocodes to get region/district for Tanzania.
 */
async function resolveGoogleMapsCoords(url: string): Promise<ResolvedLocation | null> {
  if (!url || !url.startsWith('http')) return null;
  try {
    const response = await fetch(url, { method: 'GET', redirect: 'follow', headers: { 'User-Agent': 'Mozilla/5.0' } });
    const finalUrl = response.url;

    let lat: number | null = null;
    let lng: number | null = null;

    // Try extracting from the final URL
    const atMatch = finalUrl?.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
    if (atMatch) {
      lat = parseFloat(atMatch[1]);
      lng = parseFloat(atMatch[2]);
    }

    // Fall back to page body
    if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      const body = await response.text();
      const centerMatch = body.match(/center=(-?\d+\.\d+)%2C(-?\d+\.\d+)/);
      if (centerMatch) {
        lat = parseFloat(centerMatch[1]);
        lng = parseFloat(centerMatch[2]);
      }
      if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        const bodyAtMatch = body.match(/@(-?\d+\.\d{4,}),(-?\d+\.\d{4,})/);
        if (bodyAtMatch) {
          lat = parseFloat(bodyAtMatch[1]);
          lng = parseFloat(bodyAtMatch[2]);
        }
      }
    }

    if (lat === null || lng === null || lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;

    // Reverse geocode to get region/district
    const location = await reverseGeocode(lat, lng);
    return { lat, lng, ...location };
  } catch (err) {
    console.warn('[StepLocation] Failed to resolve Google Maps link:', err);
  }
  return null;
}

/**
 * Reverse geocode coordinates using Nominatim to get region and district.
 */
async function reverseGeocode(lat: number, lng: number): Promise<{ region?: string; district?: string }> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=10`
    );
    const data = await res.json();
    const address = data?.address;
    if (!address) return {};

    // Nominatim returns Tanzania regions as "state" and districts as "county" or "city"
    const region = address.state?.toLowerCase();
    const district = (address.county || address.city || address.town || address.suburb)?.toLowerCase();

    return { region: region || undefined, district: district || undefined };
  } catch {
    return {};
  }
}

export function StepLocation({ form, setForm }: StepProps) {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [wards, setWards] = useState<Ward[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [wardSearchMode, setWardSearchMode] = useState<'select' | 'custom'>('select');
  const [mapsCoords, setMapsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [resolvingLink, setResolvingLink] = useState(false);

  // Resolve Google Maps link to coordinates when it changes
  useEffect(() => {
    const link = form.googleMapsLink?.trim();
    if (!link || !link.startsWith('http')) {
      setMapsCoords(null);
      return;
    }

    setResolvingLink(true);
    resolveGoogleMapsCoords(link).then((result) => {
      if (result) {
        setMapsCoords({ lat: result.lat, lng: result.lng });
        setForm((prev) => ({
          ...prev,
          lat: result.lat,
          lng: result.lng,
          // Auto-fill region/district if not already set
          ...(result.region && !prev.region ? { region: result.region } : {}),
          ...(result.district && !prev.district ? { district: result.district } : {}),
        }));
      }
    }).finally(() => setResolvingLink(false));
  }, [form.googleMapsLink]);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch((err) => console.error('Failed to load locations:', err))
      .finally(() => setLoading(false));
  }, []);

  // Fetch wards when district changes
  useEffect(() => {
    if (!form.district) {
      setWards([]);
      return;
    }

    setLoadingWards(true);
    // The districtId in the GraphQL is typically the district name slugified
    const districtId = form.district.toLowerCase().replace(/\s+/g, '-');
    GraphQLClient.executePublic<{ getWards: Ward[] }>(getWards, { districtId })
      .then((data) => {
        const fetched = data.getWards || [];
        setWards(fetched.sort((a, b) => a.name.localeCompare(b.name)));
        // If no wards found, switch to custom input
        if (fetched.length === 0) setWardSearchMode('custom');
        else setWardSearchMode('select');
      })
      .catch(() => {
        setWards([]);
        setWardSearchMode('custom');
      })
      .finally(() => setLoadingWards(false));
  }, [form.district]);

  const regions = useMemo(() => {
    if (!locations) return [];
    return Object.keys(locations).sort();
  }, [locations]);

  const districts = useMemo(() => {
    if (!locations || !form.region) return [];
    return (locations[form.region] || []).sort();
  }, [locations, form.region]);

  function handleRegionChange(region: string) {
    setForm((prev) => ({ ...prev, region, district: '', ward: '', street: '', lat: 0, lng: 0 }));
  }

  function handleDistrictChange(district: string) {
    setForm((prev) => ({ ...prev, district, ward: '', street: '', lat: 0, lng: 0 }));
  }

  function handleWardChange(ward: string) {
    setForm((prev) => ({ ...prev, ward }));
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.location.title')}</h2>
          <p className="text-sm sm:text-base text-ink-500 mb-6">{t('create.location.subtitle')}</p>
          <div className="max-w-xl animate-pulse space-y-4">
            <div className="h-11 bg-ink-100 rounded-xl" />
            <div className="h-11 bg-ink-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.location.title')}</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-6">{t('create.location.subtitle')}</p>

        <div className="max-w-xl space-y-4">
          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              {t('create.location.region')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.region}
              onChange={(e) => handleRegionChange(e.target.value)}
              className="w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
              required
            >
              <option value="">{t('create.location.selectRegion')}</option>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {toTitleCase(r)}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              {t('create.location.district')} <span className="text-red-500">*</span>
            </label>
            <select
              value={form.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              disabled={!form.region || districts.length === 0}
              className={`w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-base ${
                !form.region ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              required
            >
              <option value="">{t('create.location.selectDistrict')}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {toTitleCase(d)}
                </option>
              ))}
            </select>
          </div>

          {/* Ward — dropdown from GraphQL or custom text input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-ink-700">
                {t('create.location.ward')}
              </label>
              {wards.length > 0 && (
                <button
                  type="button"
                  onClick={() => setWardSearchMode(wardSearchMode === 'select' ? 'custom' : 'select')}
                  className="text-xs text-brand-600 hover:text-brand-700"
                >
                  {wardSearchMode === 'select' ? t('create.location.typeManually') : t('create.location.selectFromList')}
                </button>
              )}
            </div>

            {loadingWards ? (
              <div className="h-11 bg-ink-100 rounded-xl animate-pulse" />
            ) : wardSearchMode === 'select' && wards.length > 0 ? (
              <select
                value={form.ward}
                onChange={(e) => handleWardChange(e.target.value)}
                disabled={!form.district}
                className="w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-base"
              >
                <option value="">{t('create.location.selectWard')}</option>
                {wards.map((w) => (
                  <option key={w.id} value={w.name}>
                    {toTitleCase(w.name)}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={form.ward}
                onChange={(e) => handleWardChange(e.target.value)}
                className="w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-ink-400 text-base"
                placeholder={t('create.location.wardPlaceholder')}
              />
            )}
          </div>

          {/* Street address */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              {t('create.location.street')}
            </label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => setForm((prev) => ({ ...prev, street: e.target.value }))}
              className="w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-ink-400 text-base"
              placeholder={t('create.location.streetPlaceholder')}
            />
          </div>

          {/* Google Maps link */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-ink-700">
                Google Maps link
              </label>
              <span className="text-xs text-ink-400">optional</span>
            </div>
            <input
              type="url"
              value={form.googleMapsLink}
              onChange={(e) => setForm((prev) => ({ ...prev, googleMapsLink: e.target.value }))}
              className="w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-ink-400 text-base"
              placeholder="e.g. https://maps.app.goo.gl/..."
            />
            <p className="text-xs text-ink-400 mt-1">
              {resolvingLink ? 'Resolving location...' : 'Paste a Google Maps link to pinpoint your property\u0027s exact location.'}
            </p>
          </div>
        </div>
      </div>

      {/* Map for pinning exact location */}
      {(form.region && form.district) || mapsCoords ? (
        <div className="border-t border-ink-100 pt-8">
          <h3 className="text-base sm:text-lg font-semibold text-ink-900 mb-1">{t('create.location.pinTitle')}</h3>
          <p className="text-sm text-ink-500 mb-4">{t('create.location.pinSubtitle')}</p>
          <LocationMapPicker
            location={{
              region: form.region,
              district: form.district,
              ward: form.ward,
              street: form.street,
            }}
            initialCoords={mapsCoords}
            onChange={(coords) =>
              setForm((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
            }
          />
          {form.lat !== 0 && form.lng !== 0 && (
            <p className="text-xs text-ink-400 mt-2">
              📍 {form.lat.toFixed(5)}, {form.lng.toFixed(5)}
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
