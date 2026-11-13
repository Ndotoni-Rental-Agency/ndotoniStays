'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Check, MapPin, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useRegionSearch } from '@/hooks/useRegionSearch';
import type { FlattenedLocation } from '@/lib/location/cloudfront-locations';

const popular: FlattenedLocation[] = [
  { type: 'region', name: 'DAR-ES-SALAAM', displayName: 'Dar es Salaam' },
  { type: 'region', name: 'Zanzibar', displayName: 'Zanzibar' },
  { type: 'region', name: 'ARUSHA', displayName: 'Arusha' },
  { type: 'region', name: 'MWANZA', displayName: 'Mwanza' },
  { type: 'region', name: 'DODOMA', displayName: 'Dodoma' },
];
const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '');
const key = (location: FlattenedLocation) => `${location.type}:${normalize(location.name)}:${normalize(location.regionName || '')}`;

export default function StayLocationPicker({ selected, onSelect }: { selected: FlattenedLocation | null; onSelect: (location: FlattenedLocation) => void }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const { results, isLoading, error } = useRegionSearch(query);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const rows = useRef<HTMLDivElement>(null);
  const found = new Map<string, FlattenedLocation>();
  const searching = !!query.trim();
  for (const location of searching ? [...popular.filter(p => normalize(p.displayName).includes(normalize(query))), ...results] : popular) {
    if (!found.has(key(location))) found.set(key(location), location);
  }
  const choices = Array.from(found.values()).slice(0, 12);
  const visible = error && !choices.length ? popular : choices;
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // Focus is explicit on desktop; on phones the list is immediately usable without a keyboard covering it.
    if (window.matchMedia('(min-width: 640px)').matches) input.current?.focus();
    else panel.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key !== 'Tab') return;
      const controls = panel.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input');
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panel.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', keydown); trigger.current?.focus(); };
  }, [open]);
  function close() { setOpen(false); setQuery(''); }
  return <div className="relative col-span-2 lg:col-span-4">
    <button ref={trigger} type="button" onClick={() => { setQuery(''); setOpen(true); }} aria-label={sw ? 'Chagua eneo' : 'Choose destination'} aria-haspopup="dialog" aria-expanded={open}
      className="stays-search-field flex h-[76px] w-full items-center rounded-xl border border-ink-200 bg-ink-50/60 px-4 text-left hover:border-brand-600 hover:bg-brand-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
      <span className="min-w-0"><span className="block text-sm font-semibold text-ink-900">{sw ? 'Eneo' : 'Destination'}</span><span className="mt-1 block truncate text-base text-ink-500">{selected?.displayName || (sw ? 'Chagua eneo' : 'Choose a destination')}</span></span>
    </button>
    {open && createPortal(<div className="stays-picker-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-ink-900/40 sm:items-center sm:p-6" onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="stay-location-title" tabIndex={-1} className="stays-picker-panel flex max-h-[90dvh] w-full max-w-lg flex-col rounded-t-3xl bg-white shadow-xl outline-none sm:rounded-3xl">
        <div className="px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 id="stay-location-title" className="text-xl font-semibold tracking-tight text-ink-900">{sw ? 'Ungependa kukaa wapi?' : 'Where would you like to stay?'}</h2><button type="button" onClick={close} aria-label={sw ? 'Funga maeneo' : 'Close destinations'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-ink-50"><X size={21} /></button></div>
          <div className="flex items-center gap-3 rounded-xl border border-ink-300 bg-white px-4 focus-within:border-brand-700 focus-within:ring-2 focus-within:ring-brand-100">
            <Search size={20} className="shrink-0 text-brand-700" aria-hidden="true" />
            <input ref={input} value={query} onChange={event => setQuery(event.target.value)} aria-label={sw ? 'Tafuta eneo' : 'Search destinations'} placeholder={sw ? 'Mkoa au wilaya' : 'Search a region or district'}
              onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); rows.current?.querySelector<HTMLButtonElement>('button')?.focus(); } }}
              className="h-14 w-full min-w-0 border-0 bg-transparent py-3.5 text-base text-ink-900 outline-none placeholder:text-ink-400 focus:ring-0" />
            {query && <button type="button" onClick={() => { setQuery(''); input.current?.focus(); }} aria-label={sw ? 'Futa utafutaji' : 'Clear search'} className="flex h-11 w-8 shrink-0 items-center justify-center text-ink-500"><X size={17} /></button>}
          </div>
        </div>
        <div className="overflow-y-auto px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5">
          <p className="px-3 pb-2 text-sm font-medium text-ink-500">{searching && !error ? (sw ? 'Matokeo' : 'Search results') : (sw ? 'Maeneo maarufu' : 'Popular destinations')}</p>
          {error && searching && <p role="status" className="px-3 py-2 text-sm text-ink-500">{sw ? 'Utafutaji wa maeneo haujapatikana. Unaweza kuchagua eneo hapa chini.' : 'Location search is unavailable. You can still choose a destination below.'}</p>}
          {isLoading && !visible.length ? <p role="status" className="px-3 py-6 text-sm text-ink-500">{sw ? 'Tunatafuta maeneo…' : 'Loading destinations…'}</p> : !visible.length ? <div role="status" className="px-3 py-6"><p className="text-base font-medium text-ink-900">{sw ? 'Eneo halijapatikana' : 'No destinations found'}</p><p className="mt-1 text-sm text-ink-500">{sw ? 'Jaribu jina la mkoa au wilaya nyingine.' : 'Try another region or district name.'}</p></div> : null}
          <div ref={rows}>{visible.map((location, index) => {
            const active = !!selected && key(location) === key(selected);
            const name = location.type === 'district' ? location.displayName.split(',')[0] : location.displayName;
            return <button key={key(location)} type="button" aria-pressed={active} onClick={() => { onSelect(location); close(); }}
              onKeyDown={event => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); const all = rows.current?.querySelectorAll<HTMLButtonElement>('button'); const next = index + (event.key === 'ArrowDown' ? 1 : -1); if (all?.[next]) all[next].focus(); else input.current?.focus(); } }}
              className={`flex min-h-[68px] w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors duration-150 hover:bg-ink-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-brand-700 motion-reduce:transition-none ${active ? 'bg-brand-50/60' : ''}`}>
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${active ? 'bg-brand-100 text-brand-800' : 'bg-ink-50 text-ink-500'}`}><MapPin size={19} aria-hidden="true" /></span>
              <span className="min-w-0 flex-1"><span className="block text-base font-medium text-ink-900">{name}</span>{location.type === 'district' && <span className="mt-0.5 block text-sm text-ink-500">{location.regionName?.replace(/-/g, ' ')}</span>}</span>
              {active && <Check size={19} className="shrink-0 text-brand-700" aria-hidden="true" />}
            </button>;
          })}</div>
        </div>
      </div>
    </div>, document.body)}
  </div>;
}
