'use client';

import Link from 'next/link';
import { useEffect, useState, type ComponentProps } from 'react';
import { ArrowRight } from 'lucide-react';
import { GraphQLClient } from '@/lib/graphql-client';
import { PropertyCard } from '@/components/property/PropertyCard';
import { useLanguage } from '@/contexts/LanguageContext';

type Property = ComponentProps<typeof PropertyCard>['property'];
const QUERY = `query HomeStays($input: ShortTermSearchInput!) {
  searchShortTermProperties(input: $input) {
    properties {
      propertyId title nightlyRate currency propertyType region district
      address { ward street } thumbnail images averageRating
      ratingSummary { averageRating totalReviews } maxGuests bedrooms bathrooms instantBookEnabled
    }
  }
}`;
const REGIONS = ['Dar es Salaam', 'Zanzibar', 'Arusha', 'Dodoma', 'Mwanza'];
function upcomingDates() {
  const date = new Date();
  const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  date.setDate(date.getDate()+1);
  const checkIn = format(date);
  date.setDate(date.getDate()+1);
  return {checkIn, checkOut:format(date)};
}
export function HomeProperties() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [region, setRegion] = useState(REGIONS[0]);
  const [dates, setDates] = useState<ReturnType<typeof upcomingDates> | null>(null);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => setDates(upcomingDates()), []);
  useEffect(() => {
    if (!dates) return;
    let active = true;
    setLoading(true); setError(false); setProperties([]);
    GraphQLClient.executePublic<{searchShortTermProperties: {properties:Property[]}}>(QUERY, {input:{
      region, checkInDate:dates.checkIn, checkOutDate:dates.checkOut, numberOfGuests:1, limit:12,
    }}).then(data => {
      if (active) {
        const seen = new Set<string>();
        setProperties((data.searchShortTermProperties?.properties || []).filter(property => {
          // Published integration-test fixtures should not be promoted on the homepage.
          if (/^HydraTest[-_]/i.test(property.title) || seen.has(property.propertyId)) return false;
          seen.add(property.propertyId); return true;
        }).slice(0, 8));
      }
    })
      .catch(() => {if(active) setError(true);})
      .finally(() => {if(active) setLoading(false);});
    return () => {active = false;};
  }, [region, dates, retry]);
  const params = new URLSearchParams({region});
  if(dates) {params.set('checkIn',dates.checkIn);params.set('checkOut',dates.checkOut);}
  const href = `/search?${params}`;
  const dateLabel = (value:string) => new Date(`${value}T12:00:00`).toLocaleDateString(sw ? 'sw-TZ' : 'en-GB',{day:'numeric',month:'short'});
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="home-stays-title">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-brand-800">{sw ? 'Anza na sehemu hizi' : 'Your next stay starts here'}</p>
        <h2 id="home-stays-title" className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{sw ? 'Sehemu za kuangalia' : 'Places to explore'}</h2>
        <p className="mt-2 text-sm text-ink-500">{sw ? 'Angalia picha, bei na maelezo kabla ya kuchagua.' : 'Explore photos, prices and the details before you decide.'}</p>
      </div>
      <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-800 hover:underline">{sw ? 'Angalia zote' : 'Explore all places'}<ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
    <div className="my-5 flex flex-wrap items-center justify-between gap-3">
      <div role="group" aria-label={sw ? 'Chagua eneo' : 'Choose a region'} className="flex flex-wrap gap-2">
        {REGIONS.map(value => <button key={value} type="button" aria-pressed={region===value} onClick={()=>setRegion(value)} className={`min-h-11 rounded-full border px-4 text-sm font-medium transition-colors ${region===value ? 'border-brand-800 bg-brand-800 text-white' : 'border-ink-200 bg-white text-ink-600 hover:border-brand-700'}`}>{value}</button>)}
      </div>
      {dates && <Link href={href} className="text-xs leading-relaxed text-ink-500 underline underline-offset-4">{dateLabel(dates.checkIn)} – {dateLabel(dates.checkOut)} · {sw ? 'mgeni 1 · Badilisha tarehe' : '1 guest · Change dates'}</Link>}
    </div>
    {error ? <div role="alert" className="rounded-2xl border border-ink-200 bg-ink-50 p-6"><p className="text-sm text-ink-600">{sw ? 'Sehemu hazijapakia. Tafadhali jaribu tena.' : 'Places could not load. Please try again.'}</p><button type="button" onClick={()=>setRetry(value=>value+1)} className="mt-3 min-h-11 text-sm font-semibold text-brand-800 underline">{sw ? 'Jaribu tena' : 'Try again'}</button></div>
      : loading ? <div aria-label={sw ? 'Inapakia sehemu' : 'Loading stays'} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(key=><div key={key} aria-hidden="true" className="animate-pulse"><div className="aspect-[4/3] rounded-2xl bg-ink-100"/><div className="mt-4 h-4 w-3/4 rounded bg-ink-100"/><div className="mt-3 h-4 w-1/2 rounded bg-ink-100"/></div>)}</div>
      : properties.length ? <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{properties.map(property=><PropertyCard key={property.propertyId} property={property} checkIn={dates?.checkIn} checkOut={dates?.checkOut}/>)}</div>
      : <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6 text-sm text-ink-600"><p>{sw ? 'Hakuna sehemu zilizopatikana kwa tarehe hizi. Chagua eneo jingine au badilisha tarehe.' : 'No places found for these dates. Try another region or choose different dates.'}</p><Link href={href} className="mt-3 inline-flex min-h-11 items-center font-semibold text-brand-800 underline">{sw ? 'Badilisha tarehe' : 'Choose other dates'}</Link></div>}
  </section>;
}
