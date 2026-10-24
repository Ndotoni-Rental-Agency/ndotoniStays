'use client';

import StayDescriptionSearch from './StayDescriptionSearch';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import StayDateRangePicker from './StayDateRangePicker';
import StayLocationPicker from './StayLocationPicker';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FlattenedLocation } from '@/lib/location/cloudfront-locations';

export function HeroSection() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const sw = language === 'sw';
  const [selectedLocation, setSelectedLocation] = useState<FlattenedLocation | null>({
    type: 'region',
    name: 'DAR-ES-SALAAM',
    displayName: 'Dar es Salaam',
  } as FlattenedLocation);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (selectedLocation) {
      if (selectedLocation.type === 'region') {
        params.set('region', selectedLocation.name);
      } else if (selectedLocation.type === 'district' && selectedLocation.regionName) {
        params.set('region', selectedLocation.regionName);
        params.set('district', selectedLocation.name);
      }
    }

    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', guests.toString());
    router.push(`/search?${params.toString()}`);
  };

  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
  const minCheckIn = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;

  return (
    <section className="bg-white px-4 pb-3 pt-5 sm:px-6 sm:pt-8 lg:px-8" aria-labelledby="stay-hero-title">
      <div className="mx-auto max-w-7xl pb-2 sm:pb-5">
        <div className="relative overflow-hidden rounded-t-[28px] bg-brand-900">
          <img src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=75&w=960&auto=format&fit=crop"
            srcSet={[480,640,960,1280,1920].map(width => `https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=75&w=${width}&auto=format&fit=crop ${width}w`).join(', ')}
            sizes="(max-width: 1279px) 100vw, 1280px" alt="" fetchPriority="high" decoding="async" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/35" />
          <h1 id="stay-hero-title" className="relative px-7 py-12 text-left text-[38px] font-semibold leading-[1.1] tracking-[-0.04em] text-white sm:px-12 sm:py-20 sm:text-[60px]">
            {sw ? 'Stay nzuri kwa' : 'Find your next'}<br /><span className="text-brand-200">{sw ? 'mapumziko yako' : 'stay.'}</span>
          </h1>
        </div>
        <form onSubmit={handleSearch} aria-label={sw ? 'Tafuta malazi' : 'Search stays'} className="rounded-b-[28px] border border-t-0 border-ink-200 bg-white p-3 sm:p-4">
            <div className="grid grid-cols-2 items-stretch gap-2 sm:gap-3 lg:grid-cols-12">
              <StayLocationPicker selected={selectedLocation} onSelect={setSelectedLocation} />

              <StayDateRangePicker checkIn={checkIn} checkOut={checkOut} min={minCheckIn} onChange={(start, end) => { setCheckIn(start); setCheckOut(end); }} />

              {/* Guests */}
              <div className="relative lg:col-span-2">
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="stays-search-field h-[76px] w-full cursor-pointer appearance-none rounded-xl border border-ink-200 bg-ink-50/60 pl-4 pr-9 pt-7 pb-2 text-base text-ink-700 transition-colors hover:border-brand-600 hover:bg-brand-50/40 focus:outline-none focus:ring-2 focus:ring-brand-100"
                  aria-label={sw ? 'Idadi ya wageni' : 'Number of guests'}
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? t('hero.search.guest') : t('hero.search.guests')}
                    </option>
                  ))}
                </select>
                <span className="absolute left-4 top-3 text-sm font-semibold text-ink-900 pointer-events-none">
                  {sw ? 'Wageni' : 'Guests'}
                </span>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="stays-press flex min-h-[76px] items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 text-sm font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 lg:col-span-2"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>{sw ? 'Tafuta malazi' : 'Search stays'}</span>
              </button>
            </div>

          <StayDescriptionSearch base={{
            region: selectedLocation?.type === 'region' ? selectedLocation.name : selectedLocation?.regionName,
            district: selectedLocation?.type === 'district' ? selectedLocation.name : undefined,
            checkIn, checkOut, guests,
          }} />

        </form>
      </div>
    </section>
  );
}
