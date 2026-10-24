'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { GraphQLClient } from '@/lib/graphql-client';
import { PropertyCard } from '@/components/property/PropertyCard';
import { CategoryGrid } from './CategoryGrid';
import { QUERY, prepareStays, type Property, type HomeStaysData } from '@/lib/home-stays';
import { useLanguage } from '@/contexts/LanguageContext';

const REGIONS = ['Dar es Salaam', 'Zanzibar', 'Arusha', 'Dodoma', 'Mwanza'];
function upcomingDates() {
  const date = new Date();
  const format = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  date.setDate(date.getDate()+1);
  const checkIn = format(date);
  date.setDate(date.getDate()+1);
  return {checkIn, checkOut:format(date)};
}
export function HomeProperties({ initialData = null }: { initialData?: HomeStaysData | null }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [region, setRegion] = useState(REGIONS[0]);
  const [dates, setDates] = useState<ReturnType<typeof upcomingDates> | null>(initialData?.dates || null);
  const [properties, setProperties] = useState<Property[]>(initialData?.properties || []);
  const [visibleCount, setVisibleCount] = useState(12);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => { if (!initialData) setDates(upcomingDates()); }, [initialData]);
  useEffect(() => {
    if (!dates) return;
    if (initialData && region === REGIONS[0] && retry === 0 && dates.checkIn === initialData.dates.checkIn && dates.checkOut === initialData.dates.checkOut) {
      setProperties(initialData.properties); setLoading(false); setError(false); setVisibleCount(12);
      return;
    }
    let active = true;
    setLoading(true); setError(false); setProperties([]); setVisibleCount(12);
    GraphQLClient.executePublic<{searchShortTermProperties: {properties:Property[]}}>(QUERY, {input:{
      region, checkInDate:dates.checkIn, checkOutDate:dates.checkOut, numberOfGuests:1, limit:100,
    }}).then(data => {
      if (active) {
        setProperties(prepareStays(data.searchShortTermProperties?.properties || []));
      }
    })
      .catch(() => {if(active) setError(true);})
      .finally(() => {if(active) setLoading(false);});
    return () => {active = false;};
  }, [region, dates, retry, initialData]);
  const params = new URLSearchParams({region});
  if(dates) {params.set('checkIn',dates.checkIn);params.set('checkOut',dates.checkOut);}
  const href = `/search?${params}`;
  const availableCategories = new Set(properties.flatMap(property => property.stayCategories || []));
  const dateLabel = (value:string) => new Date(`${value}T12:00:00`).toLocaleDateString(sw ? 'sw-TZ' : 'en-GB',{day:'numeric',month:'short'});
  return <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8" aria-labelledby="home-stays-title">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 id="home-stays-title" className="text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">{sw ? 'Sehemu za kuangalia' : 'Places to explore'}</h2>
      </div>
      <Link href={href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-brand-800 hover:underline">{sw ? 'Angalia zote' : 'Explore all places'}<ArrowRight size={17} aria-hidden="true" /></Link>
    </div>
    <div className="mb-6 mt-4 flex min-w-0 flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div role="group" aria-label={sw ? 'Chagua eneo' : 'Choose a region'} className="flex w-full min-w-0 gap-6 overflow-x-auto border-b border-ink-100 lg:w-auto">
        {REGIONS.map(value => <button key={value} type="button" aria-pressed={region===value} onClick={()=>setRegion(value)} className={`min-h-12 shrink-0 border-b-2 text-sm font-semibold transition-colors ${region===value ? 'border-brand-700 text-brand-800' : 'border-transparent text-ink-500 hover:text-brand-800'}`}>{value}</button>)}
      </div>
      {dates && <Link href={href} className="shrink-0 text-sm leading-relaxed text-ink-500 underline underline-offset-4">{dateLabel(dates.checkIn)} – {dateLabel(dates.checkOut)} · {sw ? 'mgeni 1 · Badilisha tarehe' : '1 guest · Change dates'}</Link>}
    </div>
    {error ? <div role="alert" className="rounded-2xl border border-ink-200 bg-ink-50 p-6"><p className="text-sm text-ink-600">{sw ? 'Sehemu hazijapakia. Tafadhali jaribu tena.' : 'Places could not load. Please try again.'}</p><button type="button" onClick={()=>setRetry(value=>value+1)} className="mt-3 min-h-11 text-sm font-semibold text-brand-800 underline">{sw ? 'Jaribu tena' : 'Try again'}</button></div>
      : loading ? <div aria-label={sw ? 'Inapakia sehemu' : 'Loading stays'} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">{[0,1,2,3].map(key=><div key={key} aria-hidden="true" className="animate-pulse"><div className="aspect-[4/3] rounded-2xl bg-ink-100"/><div className="mt-4 h-4 w-3/4 rounded bg-ink-100"/><div className="mt-3 h-4 w-1/2 rounded bg-ink-100"/></div>)}</div>
      : properties.length ? <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">{properties.slice(0, visibleCount).map((property, index)=><PropertyCard priority={index < 2} key={property.propertyId} property={property} checkIn={dates?.checkIn} checkOut={dates?.checkOut}/>)}</div>
      : <div className="rounded-2xl border border-ink-200 bg-ink-50 p-6 text-sm text-ink-600"><p>{sw ? 'Hakuna sehemu zilizopatikana kwa tarehe hizi. Chagua eneo jingine au badilisha tarehe.' : 'No places found for these dates. Try another region or choose different dates.'}</p><Link href={href} className="mt-3 inline-flex min-h-11 items-center font-semibold text-brand-800 underline">{sw ? 'Badilisha tarehe' : 'Choose other dates'}</Link></div>}
    {!loading && !error && visibleCount < properties.length && <div className="mt-8 flex justify-center"><button type="button" onClick={() => setVisibleCount(count => count + 12)} className="min-h-12 rounded-full border border-brand-800 px-7 text-sm font-semibold text-brand-800">{sw ? 'Onyesha sehemu zaidi' : 'Show more places'}</button></div>}
    {!loading && !error && <CategoryGrid availableCategories={availableCategories} searchBase={href} />}
  </section>;
}
