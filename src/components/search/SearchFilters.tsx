'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { AdjustmentsHorizontalIcon, XMarkIcon } from '@heroicons/react/24/outline';
import CalendarDatePicker from '@/components/ui/CalendarDatePicker';

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '0', label: '0' },
  { value: '10000', label: '10,000' },
  { value: '25000', label: '25,000' },
  { value: '50000', label: '50,000' },
  { value: '100000', label: '100,000' },
  { value: '200000', label: '200,000' },
  { value: '500000', label: '500,000' },
];

interface Props {
  region: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
}

export function SearchFilters({ region, checkIn, checkOut, guests, minPrice, maxPrice, bedrooms }: Props) {
  const router = useRouter();
  const [localRegion, setLocalRegion] = useState(region);
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [localGuests, setLocalGuests] = useState(guests);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '');
  const [localBedrooms, setLocalBedrooms] = useState(bedrooms?.toString() || '');
  const [showFilters, setShowFilters] = useState(false);

  // Count active advanced filters
  const activeFilterCount = [localMinPrice, localMaxPrice, localBedrooms].filter(Boolean).length;

  // Auto-correct invalid price range from URL params on mount
  useEffect(() => {
    if (minPrice && maxPrice && minPrice >= maxPrice) {
      setLocalMaxPrice('');
    }
  }, []);

  // Lock body scroll when filter panel is open on mobile
  useEffect(() => {
    if (showFilters) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showFilters]);

  const handleMinPriceChange = (value: string) => {
    setLocalMinPrice(value);
    if (value && localMaxPrice && Number(localMaxPrice) <= Number(value)) {
      setLocalMaxPrice('');
    }
  };

  const handleApply = () => {
    const params = new URLSearchParams();
    if (localRegion) params.set('region', localRegion);
    params.set('checkIn', localCheckIn);
    params.set('checkOut', localCheckOut);
    params.set('guests', localGuests.toString());
    if (localMinPrice) params.set('minPrice', localMinPrice);
    if (localMaxPrice) params.set('maxPrice', localMaxPrice);
    if (localBedrooms) params.set('bedrooms', localBedrooms);
    setShowFilters(false);
    router.push(`/search?${params.toString()}`);
  };

  const clearAdvancedFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalBedrooms('');
  };

  const minPriceNum = localMinPrice ? Number(localMinPrice) : 0;

  return (
    <>
      {/* Main filter bar — always visible */}
      <div className="flex flex-wrap items-end gap-2 sm:gap-3 bg-ink-50 rounded-2xl p-3 sm:p-4">
        <div className="flex-1 min-w-[120px]">
          <label className="block text-xs font-medium text-ink-500 mb-1">Location</label>
          <select
            value={localRegion}
            onChange={(e) => setLocalRegion(e.target.value)}
            className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">All Regions</option>
            {REGIONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        <div className="hidden sm:block min-w-[130px]">
          <CalendarDatePicker
            value={localCheckIn}
            onChange={(val) => {
              setLocalCheckIn(val);
              if (localCheckOut && val >= localCheckOut) setLocalCheckOut('');
            }}
            label="Check-in"
            placeholder="Check-in"
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
          />
        </div>

        <div className="hidden sm:block min-w-[130px]">
          <CalendarDatePicker
            value={localCheckOut}
            onChange={setLocalCheckOut}
            minExclusive={localCheckIn || undefined}
            label="Check-out"
            placeholder="Check-out"
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
          />
        </div>

        <div className="min-w-[90px]">
          <label className="block text-xs font-medium text-ink-500 mb-1">Guests</label>
          <select
            value={localGuests}
            onChange={(e) => setLocalGuests(Number(e.target.value))}
            className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        {/* Filters button */}
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="relative inline-flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search button */}
        <button
          onClick={handleApply}
          className="btn-primary py-2.5 px-4 sm:px-5 text-sm"
        >
          Search
        </button>
      </div>

      {/* Mobile date pickers — below bar on small screens */}
      <div className="flex gap-2 mt-2 sm:hidden">
        <div className="flex-1">
          <CalendarDatePicker
            value={localCheckIn}
            onChange={(val) => {
              setLocalCheckIn(val);
              if (localCheckOut && val >= localCheckOut) setLocalCheckOut('');
            }}
            label="Check-in"
            placeholder="Check-in"
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
          />
        </div>
        <div className="flex-1">
          <CalendarDatePicker
            value={localCheckOut}
            onChange={setLocalCheckOut}
            minExclusive={localCheckIn || undefined}
            label="Check-out"
            placeholder="Check-out"
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
          />
        </div>
      </div>

      {/* Filter drawer/modal */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />

          {/* Panel */}
          <div className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:p-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-ink-900">Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 -mr-2 rounded-xl hover:bg-ink-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-ink-500" />
              </button>
            </div>

            {/* Bedrooms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-700 mb-3">Bedrooms</label>
              <div className="flex gap-2 flex-wrap">
                {[{ value: '', label: 'Any' }, ...([1, 2, 3, 4, 5].map(n => ({ value: n.toString(), label: `${n}+` })))].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLocalBedrooms(opt.value)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      localBedrooms === opt.value
                        ? 'bg-ink-900 text-white border-ink-900'
                        : 'bg-white text-ink-700 border-ink-200 hover:border-ink-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-700 mb-3">Price range (per night)</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1">Min</label>
                  <select
                    value={localMinPrice}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    {PRICE_OPTIONS.map((p) => (
                      <option key={`min-${p.value}`} value={p.value}>
                        {p.value ? `TZS ${p.label}` : 'No min'}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1">Max</label>
                  <select
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">No max</option>
                    {[10000, 25000, 50000, 100000, 200000, 500000, 1000000]
                      .filter((v) => v > minPriceNum)
                      .map((v) => (
                        <option key={`max-${v}`} value={v}>
                          TZS {v.toLocaleString()}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-ink-100">
              <button
                type="button"
                onClick={clearAdvancedFilters}
                className="text-sm font-medium text-ink-500 hover:text-ink-700 underline"
              >
                Clear all
              </button>
              <button
                onClick={handleApply}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                Show results
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
