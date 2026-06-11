'use client';

import { PROPERTY_TYPES, REGIONS, AMENITIES } from './constants';
import { PropertyFormData } from './types';

interface Props {
  form: PropertyFormData;
  onUpdate: (field: string, value: any) => void;
  onToggleAmenity: (amenity: string) => void;
  onSave: () => void;
  saving: boolean;
}

export function HostDetailsTab({ form, onUpdate, onToggleAmenity, onSave, saving }: Props) {
  return (
    <div className="space-y-8 max-w-3xl">
      {/* Basic Info */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Basic Info</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="input"
              placeholder="Give your property a catchy name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => onUpdate('description', e.target.value)}
              className="input min-h-[140px]"
              placeholder="What makes your place special? Mention the vibe, nearby attractions, and unique features."
              rows={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Property type</label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {PROPERTY_TYPES.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => onUpdate('propertyType', t.value)}
                  className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                    form.propertyType === t.value
                      ? 'border-brand-500 bg-brand-50 shadow-sm'
                      : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50'
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span className="text-[11px] font-medium text-ink-700">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Location */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Region</label>
            <select
              value={form.region}
              onChange={(e) => onUpdate('region', e.target.value)}
              className="input"
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
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Street address</label>
            <input
              type="text"
              value={form.street}
              onChange={(e) => onUpdate('street', e.target.value)}
              placeholder="Street name and number"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">City</label>
            <input
              type="text"
              value={form.city}
              onChange={(e) => onUpdate('city', e.target.value)}
              placeholder="City name"
              className="input"
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  className="input pl-12"
                  min="0"
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
                className="input pl-12"
                min="0"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Capacity */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Capacity</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Max guests</label>
            <select
              value={form.maxGuests}
              onChange={(e) => onUpdate('maxGuests', e.target.value)}
              className="input"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Amenities */}
      <section>
        <h2 className="text-lg font-semibold text-ink-900 mb-4">Amenities</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {AMENITIES.map((amenity) => (
            <label
              key={amenity}
              className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
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
              <span className="text-sm font-medium text-ink-700">{amenity}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Save */}
      <div className="sticky bottom-4 flex justify-end">
        <button
          onClick={onSave}
          disabled={saving}
          className="btn-primary py-3 px-8 shadow-lg"
        >
          {saving ? 'Saving...' : 'Save Details'}
        </button>
      </div>
    </div>
  );
}
