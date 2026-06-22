'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchLocations, LocationData } from '@/lib/location/cloudfront-locations';
import LocationMapPicker from '@/components/location/LocationMapPicker';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

function toTitleCase(str: string): string {
  return str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function StepLocation({ form, setForm }: StepProps) {
  const { t } = useLanguage();
  const [locations, setLocations] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations()
      .then(setLocations)
      .catch((err) => console.error('Failed to load locations:', err))
      .finally(() => setLoading(false));
  }, []);

  const regions = useMemo(() => {
    if (!locations) return [];
    return Object.keys(locations).sort();
  }, [locations]);

  const districts = useMemo(() => {
    if (!locations || !form.region) return [];
    return (locations[form.region] || []).sort();
  }, [locations, form.region]);

  function handleRegionChange(region: string) {
    setForm((prev) => ({ ...prev, region, district: '', ward: '', street: '' }));
  }

  function handleDistrictChange(district: string) {
    setForm((prev) => ({ ...prev, district, ward: '', street: '' }));
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

          {/* Ward */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">
              {t('create.location.ward')}
            </label>
            <input
              type="text"
              value={form.ward}
              onChange={(e) => setForm((prev) => ({ ...prev, ward: e.target.value }))}
              className="w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-ink-400 text-base"
              placeholder={t('create.location.wardPlaceholder')}
            />
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
        </div>
      </div>

      {form.region && form.district && (
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
            onChange={(coords) =>
              setForm((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
            }
          />
        </div>
      )}
    </div>
  );
}
