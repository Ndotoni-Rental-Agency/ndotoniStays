'use client';

import { stayCategoryLabel } from '@/lib/stay-categories';
import { useStayCopy } from '@/hooks/useStayCopy';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const { copy, sw } = useStayCopy();
  const router = useRouter();
  const searchParams = useSearchParams();
  // Match region case-insensitively against known REGIONS list
  const matchedRegion = REGIONS.find((r) => r.toLowerCase() === region.toLowerCase()) || region;
  const [localRegion, setLocalRegion] = useState(matchedRegion);
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [localGuests, setLocalGuests] = useState(guests);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '');
  const [localBedrooms, setLocalBedrooms] = useState(bedrooms?.toString() || '');
  const [localCategory, setLocalCategory] = useState(searchParams.get("category") || "");
  const [localType, setLocalType] = useState(searchParams.get("propertyType") || "");
  const [localInstant, setLocalInstant] = useState(searchParams.get("instantBook") === "true");
  const panelRef = useRef<HTMLDivElement>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Count active advanced filters
  const activeFilterCount = [localMinPrice, localMaxPrice, localBedrooms, localCategory, localType, localInstant].filter(Boolean).length;

  // Auto-correct invalid price range from URL params on mount
  useEffect(() => {
    if (minPrice && maxPrice && minPrice >= maxPrice) {
      setLocalMaxPrice('');
    }
  }, []);

  useEffect(() => {
    if (!showFilters) return;
    const previousOverflow = document.body.style.overflow;
    const previousFocus = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    panelRef.current?.querySelector<HTMLButtonElement>('button')?.focus();
    return () => { document.body.style.overflow = previousOverflow; previousFocus?.focus(); };
  }, [showFilters]);

  // Auto-search when main filters change (debounced 400ms)
  // Don't trigger if check-in changed but check-out is empty (user still picking dates)
  const isInitialMount = useRef(true);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Skip auto-search on initial mount (URL params already trigger search in SearchContent)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Don't auto-search if user selected check-in but hasn't picked check-out yet
    if (localCheckIn && !localCheckOut) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      handleApply();
    }, 400);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [localRegion, localCheckIn, localCheckOut, localGuests]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleMinPriceChange = (value: string) => {
    setLocalMinPrice(value);
    if (value && localMaxPrice && Number(localMaxPrice) <= Number(value)) {
      setLocalMaxPrice('');
    }
  };

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["region", "minPrice", "maxPrice", "bedrooms", "category", "propertyType", "instantBook"].forEach(key => params.delete(key));
    if (localRegion) params.set('region', localRegion);
    params.set('checkIn', localCheckIn);
    params.set('checkOut', localCheckOut);
    params.set('guests', localGuests.toString());
    if (localMinPrice) params.set('minPrice', localMinPrice);
    if (localMaxPrice) params.set('maxPrice', localMaxPrice);
    if (localBedrooms) params.set('bedrooms', localBedrooms);
    if (localCategory) params.set("category", localCategory);
    if (localType) params.set("propertyType", localType);
    if (localInstant) params.set("instantBook", "true");
    setShowFilters(false);
    router.push(`/search?${params.toString()}`);
  };

  const clearAdvancedFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    setLocalBedrooms('');
    setLocalCategory(''); setLocalType(''); setLocalInstant(false);
  };

  useEffect(() => {
    if (!showFilters) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowFilters(false);
      if (event.key !== 'Tab') return;
      const elements = panelRef.current?.querySelectorAll<HTMLElement>('button:not([disabled]), select, input, a[href]');
      if (!elements?.length) return;
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showFilters]);

  const minPriceNum = localMinPrice ? Number(localMinPrice) : 0;

  return (
    <>
      {/* Main filter bar — always visible */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-end gap-2 sm:gap-3 bg-ink-50 rounded-2xl p-3 sm:p-4">
        <div className="flex-1 min-w-[120px]">
          <label htmlFor="search-region" className="block text-xs font-medium text-ink-500 mb-1">{copy("Location")}</label>
          <select
            id="search-region" value={localRegion}
            onChange={(e) => setLocalRegion(e.target.value)}
            className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            <option value="">{copy("All Regions")}</option>
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
            label={copy("Check-in")}
            placeholder={copy("Check-in")}
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
            rangeMode
            onRangeComplete={(ci, co) => { setLocalCheckIn(ci); setLocalCheckOut(co); }}
          />
        </div>

        <div className="hidden sm:block min-w-[130px]">
          <CalendarDatePicker
            value={localCheckOut}
            onChange={setLocalCheckOut}
            minExclusive={localCheckIn || undefined}
            label={copy("Check-out")}
            placeholder={copy("Check-out")}
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
            rangeMode
            rangePhaseStart="checkOut"
            onRangeComplete={(ci, co) => { setLocalCheckIn(ci); setLocalCheckOut(co); }}
          />
        </div>

        <div className="min-w-[90px]">
          <label htmlFor="search-guests" className="block text-xs font-medium text-ink-500 mb-1">{copy("Guests")}</label>
          <select
            id="search-guests" value={localGuests}
            onChange={(e) => setLocalGuests(Number(e.target.value))}
            className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
          >
            {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

      {/* Mobile date pickers — below bar on small screens */}
      <div className="col-span-2 grid grid-cols-2 gap-2 sm:hidden">
        <div className="flex-1">
          <CalendarDatePicker
            value={localCheckIn}
            onChange={(val) => {
              setLocalCheckIn(val);
              if (localCheckOut && val >= localCheckOut) setLocalCheckOut('');
            }}
            label={copy("Check-in")}
            placeholder={copy("Check-in")}
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
            rangeMode
            onRangeComplete={(ci, co) => { setLocalCheckIn(ci); setLocalCheckOut(co); }}
          />
        </div>
        <div className="flex-1">
          <CalendarDatePicker
            value={localCheckOut}
            onChange={setLocalCheckOut}
            minExclusive={localCheckIn || undefined}
            label={copy("Check-out")}
            placeholder={copy("Check-out")}
            rangeStart={localCheckIn}
            rangeEnd={localCheckOut}
            rangeMode
            rangePhaseStart="checkOut"
            onRangeComplete={(ci, co) => { setLocalCheckIn(ci); setLocalCheckOut(co); }}
          />
        </div>
      </div>

        {/* Filters button */}
        <button
          type="button"
          onClick={() => setShowFilters(true)}
          className="relative inline-flex min-h-11 justify-center items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2.5 text-sm font-medium text-ink-700 hover:bg-ink-50 transition-colors"
        >
          <AdjustmentsHorizontalIcon className="h-4 w-4" />
          <span>{copy("Filters")}</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[10px] font-bold text-white">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Search button */}
        <button
          onClick={handleApply}
          className="btn-primary min-h-11 w-full sm:w-auto py-2.5 px-4 sm:px-5 text-sm"
        >
          {copy("Search")}
        </button>
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
          <div ref={panelRef} role="dialog" aria-modal="true" aria-label={copy("Filters")} className="relative w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl p-6 pb-8 sm:p-8 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-ink-900">{copy("Filters")}</h3>
              <button
                onClick={() => setShowFilters(false)}
                aria-label={copy("Close filters")}
                className="p-2 -mr-2 rounded-xl hover:bg-ink-100 transition-colors"
              >
                <XMarkIcon className="h-5 w-5 text-ink-500" />
              </button>
            </div>

            {(localCategory || localType || localInstant) && <div className="mb-6 flex flex-wrap gap-2">
              {localCategory && <button onClick={() => setLocalCategory('')} className="rounded-full bg-brand-50 px-3 py-2 text-xs text-brand-800">{copy(stayCategoryLabel(localCategory))} ×</button>}
              {localType && <button onClick={() => setLocalType('')} className="rounded-full bg-brand-50 px-3 py-2 text-xs text-brand-800">{localType.replace(/_/g, ' ')} ×</button>}
              {localInstant && <button onClick={() => setLocalInstant(false)} className="rounded-full bg-brand-50 px-3 py-2 text-xs text-brand-800">{copy('Instant booking')} ×</button>}
            </div>}
            {/* Bedrooms */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-700 mb-3">{copy("Bedrooms")}</label>
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
                    {copy(opt.label)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price range */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-ink-700 mb-3">{copy("Price range (per night)")}</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-ink-400 mb-1">{copy("Min")}</label>
                  <select
                    value={localMinPrice}
                    onChange={(e) => handleMinPriceChange(e.target.value)}
                    className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    {PRICE_OPTIONS.map((p) => (
                      <option key={`min-${p.value}`} value={p.value}>
                        {p.value ? `TZS ${p.label}` : copy('No min')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-ink-400 mb-1">{copy("Max")}</label>
                  <select
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
                  >
                    <option value="">{copy("No max")}</option>
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
                {copy("Clear all")}
              </button>
              <button
                onClick={handleApply}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {copy("Show results")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
