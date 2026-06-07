'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import CalendarDatePicker from '@/components/ui/CalendarDatePicker';

const REGIONS = [
  'Dar es Salaam',
  'Arusha',
  'Dodoma',
  'Mwanza',
  'Zanzibar',
  'Mbeya',
  'Morogoro',
  'Tanga',
  'Kilimanjaro',
  'Iringa',
];

const ROTATING_WORDS = [
  'tonight',
  'your party',
  'a photoshoot',
  'your getaway',
  'a meeting',
  'your celebration',
];

export function HeroSection() {
  const router = useRouter();
  const [region, setRegion] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [wordIndex, setWordIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Rotate words
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
        setIsAnimating(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (region) params.set('region', region);
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    if (guests > 1) params.set('guests', guests.toString());
    router.push(`/search?${params.toString()}`);
  };

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const minCheckIn = tomorrow.toISOString().split('T')[0];

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
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            <span className="text-sm text-white/90 font-medium">
              Over 100+ places available now
            </span>
          </div>

          {/* Headline with rotating text */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-tight">
            Book a perfect place
            <br />
            for{' '}
            <span
              className={`inline-block text-brand-400 transition-all duration-300 ${
                isAnimating ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
              }`}
            >
              {ROTATING_WORDS[wordIndex]}
            </span>
          </h1>

          <p className="mt-5 text-lg sm:text-xl text-white max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Apartments, villas, party venues, and event spaces across Tanzania.
            Pick your dates, book instantly, show up.
          </p>
        </div>

        {/* Search Card */}
        <form
          onSubmit={handleSearch}
          className="mt-10 max-w-4xl mx-auto"
        >
          <div className="bg-white rounded-2xl shadow-2xl p-3 sm:p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Region */}
              <div className="relative lg:col-span-1">
                <MapPinIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full rounded-xl bg-ink-50 border-0 pl-10 pr-4 py-3.5 text-sm text-ink-900 font-medium focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                  aria-label="Location"
                >
                  <option value="">Anywhere</option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              {/* Check-in */}
              <CalendarDatePicker
                value={checkIn}
                onChange={setCheckIn}
                min={minCheckIn}
                placeholder="Check-in"
                rangeStart={checkIn}
                rangeEnd={checkOut}
              />

              {/* Check-out */}
              <CalendarDatePicker
                value={checkOut}
                onChange={setCheckOut}
                min={checkIn || minCheckIn}
                placeholder="Check-out"
                rangeStart={checkIn}
                rangeEnd={checkOut}
              />

              {/* Guests */}
              <div className="relative">
                <UserGroupIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400 pointer-events-none" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="w-full rounded-xl bg-ink-50 border-0 pl-10 pr-4 py-3.5 text-sm text-ink-900 font-medium focus:ring-2 focus:ring-brand-500 appearance-none cursor-pointer"
                  aria-label="Number of guests"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>
                      {n} {n === 1 ? 'Guest' : 'Guests'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 hover:bg-brand-700 hover:shadow-brand-700/30 transition-all active:scale-[0.98]"
              >
                <MagnifyingGlassIcon className="h-5 w-5" />
                <span>Search</span>
              </button>
            </div>
          </div>

          {/* Quick filters below search */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {['Instant Book', 'Under TZS 50K', 'Zanzibar', 'Party Venues', 'Beachfront'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  if (tag === 'Zanzibar') setRegion('Zanzibar');
                  if (tag === 'Instant Book') router.push('/search?instantBook=true');
                  if (tag === 'Under TZS 50K') router.push('/search?maxPrice=50000');
                  if (tag === 'Party Venues') router.push('/search?propertyType=VILLA');
                  if (tag === 'Beachfront') router.push('/search?amenities=Beachfront');
                }}
                className="px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/25 text-sm text-white/90 hover:bg-white/25 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        </form>
      </div>
    </section>
  );
}
