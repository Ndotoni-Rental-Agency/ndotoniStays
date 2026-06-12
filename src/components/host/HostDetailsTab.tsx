'use client';

import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PROPERTY_TYPES, REGIONS, AMENITIES, STAY_CATEGORIES } from './constants';
import { PropertyFormData } from './types';

interface Props {
  form: PropertyFormData;
  onUpdate: (field: string, value: any) => void;
  onToggleAmenity: (amenity: string) => void;
  onSave: () => void;
  saving: boolean;
}

export function HostDetailsTab({ form, onUpdate, onToggleAmenity, onSave, saving }: Props) {
  const [customAmenity, setCustomAmenity] = useState('');

  // Custom amenities are any in form.amenities that aren't in the preset list
  const customAmenities = form.amenities.filter((a) => !AMENITIES.includes(a));

  function addCustomAmenity() {
    const trimmed = customAmenity.trim();
    if (!trimmed) return;
    if (form.amenities.includes(trimmed)) {
      setCustomAmenity('');
      return;
    }
    onUpdate('amenities', [...form.amenities, trimmed]);
    setCustomAmenity('');
  }

  function removeCustomAmenity(amenity: string) {
    onUpdate('amenities', form.amenities.filter((a) => a !== amenity));
  }
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Basic Info */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Basic Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="input text-base"
              placeholder="Give your property a catchy name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="input min-h-[120px] sm:min-h-[140px] text-base"
              placeholder="What makes your place special? Mention the vibe, nearby attractions, and unique features."
              rows={5}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Property type</label>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onUpdate('propertyType', t.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 sm:p-3 transition-all touch-manipulation ${
                    form.propertyType === t.value
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50'
                  }`}
                >
                  <span className="text-lg sm:text-xl">{t.icon}</span>
                  <span className="text-[10px] sm:text-[11px] font-medium text-ink-700 leading-tight text-center">{t.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Stay Categories */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">What's this space great for?</label>
            <p className="text-xs text-ink-400 mb-2">Select all that apply — helps guests find you</p>
            <div className="flex flex-wrap gap-2">
              {STAY_CATEGORIES.map((cat) => {
                const isSelected = form.stayCategories.includes(cat.value);
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? form.stayCategories.filter((c) => c !== cat.value)
                        : [...form.stayCategories, cat.value];
                      onUpdate('stayCategories', updated);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all touch-manipulation ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Location</h2>
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Region</label>
            <select
              value={form.region}
              onChange={(e) => onUpdate('region', e.target.value)}
              className="input text-base"
            >
              <option value="">Select region</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">District / Area</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => onUpdate('district', e.target.value)}
              placeholder="e.g. Msasani, Mikocheni"
              className="input text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Street address</label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => onUpdate('street', e.target.value)}
              placeholder="Street name and number"
              className="input text-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => onUpdate('city', e.target.value)}
              placeholder="City name"
              className="input text-base"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Pricing</h2>
        <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Nightly rate</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                  {form.currency === 'TZS' ? 'TZS' : '$'}
                </span>
                <input
                  type="number"
                  value={form.nightlyRate}
                  onChange={(e) => onUpdate('nightlyRate', e.target.value)}
                  className="input pl-12 text-base"
                  min="0"
                  inputMode="numeric"
                />
              </div>
              <select
                value={form.currency}
                onChange={(e) => onUpdate('currency', e.target.value)}
                className="input w-24"
              >
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Cleaning fee</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                {form.currency === 'TZS' ? 'TZS' : '$'}
              </span>
              <input
                type="number"
                value={form.cleaningFee}
                onChange={(e) => onUpdate('cleaningFee', e.target.value)}
                className="input pl-12 text-base"
                min="0"
                placeholder="0"
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capacity */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Capacity</h2>
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-1.5">Max guests</label>
          <select
            value={form.maxGuests}
            onChange={(e) => onUpdate('maxGuests', e.target.value)}
            className="input text-base w-full sm:w-48"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
              <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Amenities */}
      <section>
        <h2 className="text-base sm:text-lg font-semibold text-ink-900 mb-3 sm:mb-4">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className={`flex items-center gap-2 rounded-xl border p-3 sm:p-3 cursor-pointer transition-all touch-manipulation active:scale-[0.98] ${
                form.amenities.includes(amenity)
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-ink-100 hover:border-ink-200'
              }`}
            >
              <input
                type="checkbox"
                checked={form.amenities.includes(amenity)}
                onChange={() => onToggleAmenity(amenity)}
                className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-xs sm:text-sm font-medium text-ink-700">{amenity}</span>
            </label>
          ))}
        </div>

        {/* Custom amenities */}
        {customAmenities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {customAmenities.map((amenity) => (
              <span
                key={amenity}
                className="inline-flex items-center gap-1 bg-brand-50 border border-brand-200 text-brand-700 text-xs sm:text-sm font-medium px-2.5 py-1.5 rounded-lg"
              >
                {amenity}
                <button
                  type="button"
                  onClick={() => removeCustomAmenity(amenity)}
                  className="text-brand-400 hover:text-brand-700 touch-manipulation"
                  aria-label={`Remove ${amenity}`}
                >
                  <XMarkIcon className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add custom amenity */}
        <div className="mt-3 flex gap-2">
          <input
            type="text"
            value={customAmenity}
            onChange={(e) => setCustomAmenity(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addCustomAmenity();
              }
            }}
            placeholder="Add custom amenity..."
            className="input text-sm py-2 flex-1"
          />
          <button
            type="button"
            onClick={addCustomAmenity}
            disabled={!customAmenity.trim()}
            className="btn-secondary text-sm py-2 px-3 shrink-0 disabled:opacity-40"
            aria-label="Add amenity"
          >
            <PlusIcon className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Save — full-width on mobile */}
      <div className="sticky bottom-4">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary w-full sm:w-auto sm:float-right py-3.5 sm:py-3 px-8 shadow-lg text-base sm:text-sm"
        >
          {saving ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </div>
  );
}
