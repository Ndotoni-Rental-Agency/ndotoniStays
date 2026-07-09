'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/solid';
import CalendarDatePicker from '@/components/ui/CalendarDatePicker';
import { useRegionSearch } from '@/hooks/useRegionSearch';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FlattenedLocation } from '@/lib/location/cloudfront-locations';

function toTitleCase(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

const ROTATING_KEYS = [
  'hero.rotating.tonight',
  'hero.rotating.party',
  'hero.rotating.photoshoot',
  'hero.rotating.getaway',
  'hero.rotating.meeting',
  'hero.rotating.celebration',
];

export function HeroSection() {
  const router = useRouter();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('Dar es Salaam');
  const [modalSearchQuery, setModalSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<FlattenedLocation | null>({
    type: 'region',
    name: 'DAR ES SALAAM',
    displayName: 'Dar es Salaam',
  } as FlattenedLocation);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [mounted, setMounted] = useState(false);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [wordIndex, setWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const { results: filteredLocations } = useRegionSearch(modalSearchQuery, 8);

  useEffect(() => setMounted(true), []);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_KEYS.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleLocationSelect = (location: FlattenedLocation) => {
    setSelectedLocation(location);
    setSearchQuery(toTitleCase(location.displayName));
    setModalSearchQuery('');
    setShowLocationDropdown(false);
  };

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
    <section className="relative overflow-hidden">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1920&auto=format&fit=crop"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-28">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-sm text-white/90 font-medium">
              {t('hero.badge')}
            </span>
          </div>

          {/* Headline with rotating text */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            {t('hero.title')}
            <br />
            {t('hero.titleFor')}{' '}
            <span
              className={`inline-block text-brand-400 transition-all duration-300 ${
                isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              {t(ROTATING_KEYS[wordIndex])}
            </span>
          </h1>
        </div>

        {/* Search Card */}
        <form onSubmit={handleSearch} className="mt-8 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Location — fuzzy search modal */}
              <div className="relative lg:col-span-1">
                <div className="relative">
                  <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onFocus={() => setShowLocationDropdown(true)}
                    placeholder={t('hero.search.where')}
                    className="w-full rounded-xl bg-ink-50 border-0 pl-10 pr-4 pt-5 pb-2 text-base sm:text-sm text-ink-900 font-medium placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:outline-none cursor-pointer hover:bg-ink-100 transition-colors"
                    aria-label="Location"
                    readOnly
                  />
                  <span className="absolute left-10 top-1.5 text-[10px] font-semibold text-ink-500 uppercase tracking-wide pointer-events-none">
                    {t('hero.search.locationLabel')}
                  </span>
                </div>

                {/* Location search modal */}
                {showLocationDropdown && mounted && createPortal(
                  <>
                    <div
                      className="fixed inset-0 bg-black/40 z-[9998]"
                      onClick={() => setShowLocationDropdown(false)}
                    />
                    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
                      <div className="bg-white rounded-2xl shadow-2xl border border-ink-100 w-full max-w-md max-h-[70vh] overflow-y-auto pointer-events-auto">
                        <div className="sticky top-0 bg-white px-4 pt-4 pb-2 border-b border-ink-100">
                          <input
                            type="text"
                            value={modalSearchQuery}
                            onChange={(e) => setModalSearchQuery(e.target.value)}
                            placeholder={t('hero.search.region')}
                            className="w-full rounded-xl bg-ink-50 border-0 px-4 py-3 text-base sm:text-sm text-ink-900 font-medium placeholder:text-ink-400 focus:ring-2 focus:ring-brand-500 focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <div className="p-2">
                          {filteredLocations.length > 0 ? (
                            filteredLocations.map((location, index) => (
                              <button
                                key={`${location.type}-${location.name}-${index}`}
                                type="button"
                                onClick={() => handleLocationSelect(location)}
                                className="w-full px-4 py-3 text-left hover:bg-ink-50 rounded-xl transition-colors"
                              >
                                <div className="text-sm font-medium text-ink-900">
                                  {toTitleCase(location.displayName)}
                                </div>
                                <div className="text-xs text-ink-500">
                                  {location.type === 'region' ? t('common.region') : t('common.district')}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="px-4 py-6 text-center text-sm text-ink-400">
                              {t('hero.search.noLocations')}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>,
                  document.body
                )}
              </div>

              {/* Check-in */}
              <CalendarDatePicker
                value={checkIn}
                onChange={(val) => {
                  setCheckIn(val);
                  if (checkOut && val >= checkOut) setCheckOut('');
                }}
                min={minCheckIn}
                label={t('hero.search.checkInLabel')}
                placeholder={t('hero.search.checkIn')}
                rangeStart={checkIn}
                rangeEnd={checkOut}
              />

              {/* Check-out */}
              <CalendarDatePicker
                value={checkOut}
                onChange={setCheckOut}
                minExclusive={checkIn || undefined}
                min={minCheckIn}
                label={t('hero.search.checkOutLabel')}
                placeholder={t('hero.search.checkOut')}
                rangeStart={checkIn}
                rangeEnd={checkOut}
              />

              {/* Guests */}
              <div className="relative">
                <UserGroupIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl bg-ink-50 border-0 pl-10 pr-4 pt-5 pb-2 text-sm text-ink-900 font-medium focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                  aria-label="Number of guests"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? t('hero.search.guest') : t('hero.search.guests')}
                    </option>
                  ))}
                </select>
                <span className="absolute left-10 top-1.5 text-[10px] font-semibold text-ink-500 uppercase tracking-wide pointer-events-none">
                  {t('hero.search.guestsLabel')}
                </span>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/30 transition-all active:scale-[0.98]"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>{t('hero.search.button')}</span>
              </button>
            </div>
          </div>

          {/* Quick filters below search */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {[
              { label: t('hero.filter.instantBook'), action: () => router.push('/search?instantBook=true') },
              { label: t('hero.filter.under50k'), action: () => router.push('/search?maxPrice=50000') },
              { label: t('hero.filter.zanzibar'), action: () => router.push('/search?region=Zanzibar') },
              { label: t('hero.filter.beachfront'), action: () => router.push('/search?amenities=Beachfront') },
              { label: t('hero.filter.longTerm'), action: () => window.open('https://www.ndotoni.com', '_blank'), highlight: true },
            ].map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={tag.action}
                className={`px-3.5 py-1.5 rounded-full backdrop-blur-sm border text-sm transition-colors ${
                  tag.highlight
                    ? 'bg-brand-500/20 border-brand-300/30 text-white hover:bg-brand-500/30'
                    : 'bg-white/15 border-white/25 text-white/90 hover:bg-white/25'
                }`}
              >
                {tag.label}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
