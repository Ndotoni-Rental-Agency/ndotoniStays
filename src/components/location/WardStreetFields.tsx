'use client';

import { useEffect, useMemo, useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { getWards, getStreets } from '@/graphql/queries';
import { useLanguage } from '@/contexts/LanguageContext';

interface Place {
  id: string;
  name: string;
}

interface WardStreetFieldsProps {
  region: string;
  district: string;
  ward: string;
  street: string;
  onChange: (patch: { ward?: string; street?: string }) => void;
}

/** 'Dar es Salaam' / 'DAR-ES-SALAAM' / 'dar-es-salaam' → 'dar-es-salaam' */
const slug = (s: string) => (s || '').trim().toLowerCase().replace(/[\s_]+/g, '-');

/** The location service keys districts as DISTRICT::<district>::<region>. */
const districtIdFor = (region: string, district: string) => `DISTRICT::${slug(district)}::${slug(region)}`;

const titleCase = (s: string) =>
  s.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');

const inputClass =
  'w-full px-3 py-3 bg-ink-50 text-ink-900 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder-ink-400 text-base';

/**
 * Ward and street for a listing, picked from the location service's lists (wards of the
 * district, streets of the ward). Both lists have gaps, so each can switch to typing instead.
 */
export function WardStreetFields({ region, district, ward, street, onChange }: WardStreetFieldsProps) {
  const { t } = useLanguage();
  const [wards, setWards] = useState<Place[]>([]);
  const [streets, setStreets] = useState<Place[]>([]);
  const [loadingWards, setLoadingWards] = useState(false);
  const [loadingStreets, setLoadingStreets] = useState(false);
  const [typeWard, setTypeWard] = useState(false);
  const [typeStreet, setTypeStreet] = useState(false);

  useEffect(() => {
    if (!region || !district) {
      setWards([]);
      return;
    }
    let cancelled = false;
    setLoadingWards(true);
    GraphQLClient.executePublic<{ getWards: Place[] }>(getWards, { districtId: districtIdFor(region, district) })
      .then((data) => {
        if (!cancelled) setWards([...(data.getWards || [])].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => !cancelled && setWards([]))
      .finally(() => !cancelled && setLoadingWards(false));
    return () => { cancelled = true; };
  }, [region, district]);

  const matchedWard = useMemo(() => wards.find((w) => slug(w.name) === slug(ward)), [wards, ward]);

  useEffect(() => {
    if (!matchedWard) {
      setStreets([]);
      return;
    }
    let cancelled = false;
    setLoadingStreets(true);
    GraphQLClient.executePublic<{ getStreets: Place[] }>(getStreets, { wardId: matchedWard.id })
      .then((data) => {
        if (!cancelled) setStreets([...(data.getStreets || [])].sort((a, b) => a.name.localeCompare(b.name)));
      })
      .catch(() => !cancelled && setStreets([]))
      .finally(() => !cancelled && setLoadingStreets(false));
    return () => { cancelled = true; };
  }, [matchedWard]);

  const matchedStreet = streets.find((s) => slug(s.name) === slug(street));

  // Nothing listed, or a saved value that isn't in the list: type it.
  const showWardInput = typeWard || (!loadingWards && (wards.length === 0 || (!!ward && !matchedWard)));
  const showStreetInput = typeStreet || (!loadingStreets && (streets.length === 0 || (!!street && !matchedStreet)));

  function toggle(label: string, onClick: () => void) {
    return (
      <button type="button" onClick={onClick} className="text-xs text-brand-600 hover:text-brand-700">
        {label}
      </button>
    );
  }

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-ink-700">
            {t('create.location.ward')} <span className="text-red-500">*</span>
          </label>
          {wards.length > 0 && toggle(
            showWardInput ? t('create.location.selectFromList') : t('create.location.typeManually'),
            () => { setTypeWard(!showWardInput); onChange({ ward: '', street: '' }); }
          )}
        </div>
        {loadingWards ? (
          <div className="h-11 bg-ink-100 rounded-xl animate-pulse" />
        ) : showWardInput ? (
          <input
            type="text"
            value={ward}
            onChange={(e) => onChange({ ward: e.target.value })}
            disabled={!district}
            className={inputClass}
            placeholder={t('create.location.wardPlaceholder')}
          />
        ) : (
          <select
            value={matchedWard?.name || ''}
            onChange={(e) => onChange({ ward: e.target.value, street: '' })}
            className={inputClass}
          >
            <option value="">{t('create.location.selectWard')}</option>
            {wards.map((w) => (
              <option key={w.id} value={w.name}>{titleCase(w.name)}</option>
            ))}
          </select>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-ink-700">
            {t('create.location.street')} <span className="text-red-500">*</span>
          </label>
          {streets.length > 0 && toggle(
            showStreetInput ? t('create.location.selectFromList') : t('create.location.typeManually'),
            () => { setTypeStreet(!showStreetInput); onChange({ street: '' }); }
          )}
        </div>
        {loadingStreets ? (
          <div className="h-11 bg-ink-100 rounded-xl animate-pulse" />
        ) : showStreetInput ? (
          <input
            type="text"
            value={street}
            onChange={(e) => onChange({ street: e.target.value })}
            className={inputClass}
            placeholder={t('create.location.streetPlaceholder')}
          />
        ) : (
          <select
            value={matchedStreet?.name || ''}
            onChange={(e) => onChange({ street: e.target.value })}
            className={inputClass}
          >
            <option value="">{t('create.location.selectStreet')}</option>
            {streets.map((s) => (
              <option key={s.id} value={s.name}>{titleCase(s.name)}</option>
            ))}
          </select>
        )}
      </div>
    </>
  );
}
