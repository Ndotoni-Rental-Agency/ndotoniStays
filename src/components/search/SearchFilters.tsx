'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import CalendarDatePicker from '@/components/ui/CalendarDatePicker';

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

interface Props {
  region: string;
  checkIn: string;
  checkOut: string;
  guests: number;
}

export function SearchFilters({ region, checkIn, checkOut, guests }: Props) {
  const router = useRouter();
  const [localRegion, setLocalRegion] = useState(region);
  const [localCheckIn, setLocalCheckIn] = useState(checkIn);
  const [localCheckOut, setLocalCheckOut] = useState(checkOut);
  const [localGuests, setLocalGuests] = useState(guests);

  const handleApply = () => {
    const params = new URLSearchParams();
    params.set('region', localRegion);
    params.set('checkIn', localCheckIn);
    params.set('checkOut', localCheckOut);
    params.set('guests', localGuests.toString());
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
          onChange={setLocalCheckIn}
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
          min={localCheckIn}
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
