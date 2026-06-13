'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import CalendarDatePicker from '@/components/ui/CalendarDatePicker';

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

const PRICE_OPTIONS = [
  { value: '', label: 'Any' },
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
}

export function SearchFilters({ region, checkIn, checkOut, guests, minPrice, maxPrice }: Props) {
  const router = useRouter();
  const [localRegion, setLocalRegion] = useState(region);
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [localGuests, setLocalGuests] = useState(guests);
  const [localMinPrice, setLocalMinPrice] = useState(minPrice?.toString() || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(maxPrice?.toString() || '');

  const handleApply = () => {
    const params = new URLSearchParams();
    params.set('region', localRegion);
    params.set('checkIn', localCheckIn);
    params.set('checkOut', localCheckOut);
    params.set('guests', localGuests.toString());
    if (localMinPrice) params.set('minPrice', localMinPrice);
    if (localMaxPrice) params.set('maxPrice', localMaxPrice);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-end gap-3 bg-ink-50 rounded-2xl p-4">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-xs font-medium text-ink-500 mb-1">Location</label>
        <select
          value={localRegion}
          onChange={(e) => setLocalRegion(e.target.value)}
          className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
        >
          {REGIONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>

      <div className="min-w-[140px]">
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

      <div className="min-w-[140px]">
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

      <div className="min-w-[100px]">
        <label className="block text-xs font-medium text-ink-500 mb-1">Guests</label>
        <select
          value={localGuests}
          onChange={(e) => setLocalGuests(Number(e.target.value))}
          className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
        >
          {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </div>

      {/* Price range */}
      <div className="min-w-[110px]">
        <label className="block text-xs font-medium text-ink-500 mb-1">Min price</label>
        <select
          value={localMinPrice}
          onChange={(e) => setLocalMinPrice(e.target.value)}
          className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
        >
          {PRICE_OPTIONS.map((p) => (
            <option key={`min-${p.value}`} value={p.value}>
              {p.value ? `TZS ${p.label}+` : 'Any'}
            </option>
          ))}
        </select>
      </div>

      <div className="min-w-[110px]">
        <label className="block text-xs font-medium text-ink-500 mb-1">Max price</label>
        <select
          value={localMaxPrice}
          onChange={(e) => setLocalMaxPrice(e.target.value)}
          className="w-full rounded-xl border-ink-200 bg-white px-3 py-2.5 text-sm focus:ring-brand-500 focus:border-brand-500"
        >
          <option value="">Any</option>
          <option value="25000">Up to TZS 25,000</option>
          <option value="50000">Up to TZS 50,000</option>
          <option value="100000">Up to TZS 100,000</option>
          <option value="200000">Up to TZS 200,000</option>
          <option value="500000">Up to TZS 500,000</option>
          <option value="1000000">Up to TZS 1,000,000</option>
        </select>
      </div>

      <button
        onClick={handleApply}
        className="btn-primary py-2.5 px-5 text-sm"
      >
        <AdjustmentsHorizontalIcon className="h-4 w-4 mr-1.5" />
        Update
      </button>
    </div>
  );
}
