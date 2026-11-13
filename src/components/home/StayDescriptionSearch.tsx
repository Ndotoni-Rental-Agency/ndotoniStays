'use client';

import LocationSelect from '@/components/location/LocationSelect';

import { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';

type Location = { name: string; region: string; district?: string; type: string };
type Interpretation = { minPrice: number | null; maxPrice: number | null; bedrooms: number | null; propertyType: string | null; guests: number | null; unsupported: string[] };
type Result = { interpretation: Interpretation; locations: Location[]; locationUnresolved: boolean };
export default function StayDescriptionSearch({ base }: { base: { region?: string; district?: string; checkIn?: string; checkOut?: string; guests: number } }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const router = useRouter();
  const details = useRef<HTMLDetailsElement>(null);
  const summary = useRef<HTMLElement>(null);
  const input = useRef<HTMLTextAreaElement>(null);
  const request = useRef(0);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [locationIndex, setLocationIndex] = useState(0);
  useEffect(() => () => { request.current++; }, []);
  const cancel = () => { request.current++; setLoading(false); setResult(null); setError(''); };
  async function interpret() {
    if (loading || text.trim().length < 3) return;
    const current = ++request.current;
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await GraphQLClient.executePublic<{ interpretPropertySearch: string | Result }>(
        'query InterpretStaySearch($text: String!) { interpretPropertySearch(text: $text, stay: true) }', { text: text.trim() });
      if (current !== request.current) return;
      const data = typeof response.interpretPropertySearch === 'string' ? JSON.parse(response.interpretPropertySearch) : response.interpretPropertySearch;
      setResult(data); setLocationIndex(0);
    } catch {
      if (current === request.current) setError(sw ? 'Hatukuweza kutafsiri maelezo. Jaribu tena au tumia eneo, tarehe na wageni hapo juu.' : 'We couldn’t interpret that. Try again or use the location, dates and guests above.');
    } finally { if (current === request.current) setLoading(false); }
  }
  function search() {
    if (!result || result.locationUnresolved) return;
    const params = new URLSearchParams();
    if (base.region) params.set('region', base.region);
    if (base.district) params.set('district', base.district);
    if (base.checkIn) params.set('checkIn', base.checkIn);
    if (base.checkOut) params.set('checkOut', base.checkOut);
    params.set('guests', String(base.guests));
    const location = result.locations[locationIndex];
    if (location) {
      params.set('region', location.region);
      params.delete('district');
      if (location.type === 'district') params.set('district', location.name);
      if (location.type === 'ward' && location.district) params.set('district', location.district);
    }
    for (const key of ['minPrice', 'maxPrice', 'bedrooms', 'propertyType', 'guests'] as const) {
      const value = result.interpretation[key];
      if (value !== null && value !== undefined) params.set(key, String(value));
    }
    router.push(`/search?${params}`);
  }
  const i = result?.interpretation;
  const chosen = result?.locations[locationIndex];
  return <details ref={details} className="stays-description mt-3 pt-2 text-left" onToggle={event => {
    if (!event.currentTarget.open) { cancel(); return; }
    requestAnimationFrame(() => input.current?.focus({ preventScroll: true }));
  }}>
    <summary ref={summary} className="mx-auto w-fit cursor-pointer list-none rounded-md px-3 py-2 text-sm font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-800 hover:decoration-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700 [&::-webkit-details-marker]:hidden">
      {sw ? 'Unatafuta malazi ya aina gani?' : 'Have a stay in mind?'}
    </summary>
    <div className="stays-description-panel mt-2 rounded-xl bg-white p-1 text-ink-900 sm:p-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor="stay-description" className="text-sm font-semibold">{sw ? 'Eleza malazi unayotafuta' : 'Describe your ideal stay'}</label>
        <button type="button" aria-label={sw ? 'Funga maelezo' : 'Dismiss description search'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-stone-100" onClick={() => { cancel(); if (details.current) details.current.open = false; summary.current?.focus(); }}><X size={19} /></button>
      </div>
      <textarea ref={input} id="stay-description" rows={3} maxLength={500} value={text} disabled={loading}
        onChange={event => { setText(event.target.value); setResult(null); setError(''); }}
        onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); void interpret(); } }}
        placeholder={sw ? 'Mfano: Ghorofa Zanzibar kwa watu 2, hadi TSh 200,000 kwa usiku…' : 'An apartment in Zanzibar for two, under TSh 200,000 a night…'}
        className="mt-2 w-full resize-y rounded-xl border border-stone-300 bg-white p-3 text-base text-ink-900 outline-none placeholder:text-ink-400 focus:border-brand-600 focus:ring-2 focus:ring-brand-100" />
      {error && <p role="alert" className="mt-3 text-sm">{error}</p>}
      {result && i && <div className="mt-3 space-y-3 rounded-xl bg-stone-50 p-4" aria-live="polite">
        <p className="text-sm font-bold">{sw ? 'Kagua utafutaji wako' : 'Review your search'}</p>
        {result.locationUnresolved ? <p className="text-sm">{sw ? 'Eneo halijatambuliwa. Jaribu jina la eneo na mkoa.' : 'We couldn’t identify the area. Try its name and region.'}</p> : <>
          {result.locations.length > 1 && <label className="block text-sm">{sw ? 'Chagua eneo' : 'Choose the area'}<LocationSelect className="mt-1 min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3" value={locationIndex} onChange={e => setLocationIndex(Number(e.target.value))}>{result.locations.map((l, index) => <option key={index} value={index}>{l.name}, {l.region}</option>)}</LocationSelect></label>}
          <p className="text-sm">{[chosen ? (chosen.type === 'ward' ? chosen.district : chosen.name) : base.district || base.region, `${i.guests ?? base.guests} ${sw ? 'wageni' : 'guests'}`, i.propertyType ? ({ ROOM: sw ? 'Chumba' : 'Room', STUDIO: 'Studio', APARTMENT: sw ? 'Ghorofa' : 'Apartment', HOUSE: sw ? 'Nyumba' : 'House' }[i.propertyType] || i.propertyType) : null, i.bedrooms !== null ? `${i.bedrooms} ${sw ? 'vyumba' : 'bedrooms'}` : null].filter(Boolean).join(' · ')}</p>
          {(i.minPrice !== null || i.maxPrice !== null) && <p className="text-sm">{i.minPrice !== null ? `${sw ? 'Kuanzia' : 'From'} TSh ${i.minPrice.toLocaleString('en-US')} ` : ''}{i.maxPrice !== null ? `${sw ? 'Hadi' : 'Up to'} TSh ${i.maxPrice.toLocaleString('en-US')}` : ''} / {sw ? 'usiku' : 'night'}</p>}
          <p className="text-sm">{base.checkIn && base.checkOut ? `${base.checkIn} → ${base.checkOut}` : sw ? 'Tumia sehemu za tarehe hapo juu kuchagua siku.' : 'Use the date fields above to choose your dates.'}</p>
          {chosen?.type === 'ward' && <p className="text-sm">{sw ? 'Tutatafuta katika wilaya nzima.' : 'We’ll search the surrounding district.'}</p>}
        </>}
        {i.unsupported.length > 0 && <p className="text-sm text-ink-500">{sw ? 'Haya hayatachujwa:' : 'These won’t be filtered:'} {i.unsupported.join(', ')}</p>}
      </div>}
      <div className="mt-3 flex justify-end"><button type="button" disabled={loading || text.trim().length < 3 || !!result?.locationUnresolved} onClick={() => result ? search() : void interpret()}
        className="stays-press inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-600 px-5 text-sm font-bold text-white hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700 disabled:cursor-not-allowed disabled:opacity-50">
        <Search size={18} aria-hidden="true" />{loading ? (sw ? 'Tunatafuta…' : 'Working…') : result ? (sw ? 'Tafuta malazi' : 'Find stays') : (sw ? 'Angalia utafutaji' : 'Preview search')}
      </button></div>
      {loading && <p role="status" className="mt-2 text-sm">{sw ? 'Tunatafsiri maelezo yako…' : 'Reading your description…'}</p>}
    </div>
  </details>;
}
