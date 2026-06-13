'use client';

import { StepProps } from './types';

function formatWithCommas(value: string): string {
  const num = value.replace(/[^0-9]/g, '');
  if (!num) return '';
  return Number(num).toLocaleString('en-US');
}

function stripCommas(value: string): string {
  return value.replace(/,/g, '');
}

export function StepPricing({ form, updateField, setForm }: StepProps) {
  const displayPrice = form.nightlyRate ? formatWithCommas(form.nightlyRate) : '';

  function handlePriceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = stripCommas(e.target.value);
    updateField('nightlyRate', raw);
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Name and price your space</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-6">A good title and fair price attract more bookings</p>
      </div>

      <div className="max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">Property name</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
            placeholder="e.g. Cozy Beach Apartment in Msasani"
            className="input text-base sm:text-lg py-3.5"
            required
          />
          <p className="text-xs sm:text-sm text-ink-400 mt-2">Tip: mention the area and what makes it special</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Price per night</label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-semibold">
                  {form.currency === 'TZS' ? 'TZS' : '$'}
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={displayPrice}
                  onChange={handlePriceChange}
                  placeholder={form.currency === 'TZS' ? '50,000' : '25'}
                  className="input pl-12 text-lg font-semibold py-3.5"
                  required
                />
              </div>
              <select
                value={form.currency}
                onChange={(e) => updateField('currency', e.target.value)}
                className="input w-20 sm:w-24 py-3.5"
              >
                <option value="TZS">TZS</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Max guests</label>
            <select
              value={form.maxGuests}
              onChange={(e) => updateField('maxGuests', e.target.value)}
              className="input text-base py-3.5 w-full"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Instant Book Toggle */}
        <div className="flex items-center justify-between p-4 rounded-xl border border-ink-200 bg-ink-50/50">
          <div>
            <p className="text-sm font-medium text-ink-800">⚡ Instant booking</p>
            <p className="text-xs text-ink-500 mt-0.5">Guests can book without waiting for your approval</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.instantBookEnabled}
            onClick={() => setForm(prev => ({ ...prev, instantBookEnabled: !prev.instantBookEnabled }))}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.instantBookEnabled ? 'bg-brand-600' : 'bg-ink-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.instantBookEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
