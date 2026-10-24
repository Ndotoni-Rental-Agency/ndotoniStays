'use client';

import { useEffect, useId, useRef, useState, type SelectHTMLAttributes } from 'react';
import { Check, MapPin, Search, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

/** Keeps the native form value and change contract while presenting a searchable location sheet. */
export default function LocationSelect({ fieldLabel, ...props }: SelectHTMLAttributes<HTMLSelectElement> & { fieldLabel?: string }) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const id = useId();
  const select = useRef<HTMLSelectElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<{ value: string; label: string; disabled: boolean }[]>([]);
  const [title, setTitle] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState('');
  useEffect(() => { setSelected(select.current?.selectedOptions[0]?.textContent || ''); }, [props.value, props.children]);
  useEffect(() => { if (!open) return; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [open]);
  const normalize = (s: string) => s.toLowerCase().replace(/[-_]/g, ' ');
  const choices = options.filter(o => normalize(o.label).includes(normalize(query)));
  function close() { dialog.current?.close(); }
  function show() {
    const element = select.current;
    if (!element) return;
    setQuery('');
    setOptions(Array.from(element.options).map(o => ({ value: o.value, label: o.text, disabled: o.disabled })));
    const label = props.id ? Array.from(document.querySelectorAll('label')).find(l => l.htmlFor === props.id)?.textContent : null;
    setTitle(label?.trim().replace(/\*/g, '') || element.options[0]?.text || (sw ? 'Chagua eneo' : 'Choose a location'));
    setOpen(true);
    dialog.current?.showModal();
    if (window.matchMedia('(min-width: 640px)').matches) input.current?.focus();
    else dialog.current?.focus();
  }
  return <>
    <select {...props} id={props.id ? `${props.id}-native` : undefined} ref={select} tabIndex={-1} aria-hidden="true" onInvalid={e => { props.onInvalid?.(e); e.preventDefault(); show(); }} className="sr-only" />
    <button id={props.id} type="button" ref={trigger} disabled={props.disabled} aria-haspopup="dialog" aria-expanded={open} onClick={show} aria-required={props.required}
      aria-label={props['aria-label'] || undefined}
      className={fieldLabel
        ? "stays-search-field flex h-[76px] w-full items-center rounded-xl border border-ink-200 bg-ink-50/60 px-4 text-left hover:border-brand-600 hover:bg-brand-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 disabled:opacity-50"
        : "flex min-h-12 w-full items-center gap-3 rounded-xl border border-gray-300 bg-white px-3 py-3 text-left text-base text-gray-900 transition-colors hover:border-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"}>
      {!fieldLabel && <MapPin size={18} className="shrink-0 text-emerald-700" />}
      <span className="min-w-0 flex-1">{fieldLabel && <span className="block text-sm font-semibold text-ink-900">{fieldLabel}</span>}<span className={fieldLabel ? 'mt-1 block truncate text-base text-ink-900' : 'block truncate'}>{selected || options.find(o => o.value === String(props.value ?? ''))?.label || (sw ? 'Chagua eneo' : 'Choose a location')}</span></span>
    </button>
    <dialog ref={dialog} tabIndex={-1} aria-labelledby={id} onClose={() => { setOpen(false); trigger.current?.focus(); }}
      onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); close(); } }}
      onClick={e => { if (e.target === e.currentTarget) { const r = e.currentTarget.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close(); } }}
      className="location-choice-dialog fixed inset-x-0 bottom-0 top-auto m-0 max-h-[90dvh] w-full max-w-lg rounded-t-3xl border-0 bg-white p-0 text-gray-900 shadow-xl outline-none backdrop:bg-black/40 sm:inset-0 sm:m-auto sm:max-h-[min(640px,90dvh)] sm:rounded-3xl">
      <div className="flex max-h-[90dvh] flex-col sm:max-h-[min(640px,90dvh)]">
        <div className="px-5 pb-4 pt-5 sm:px-7">
          <div className="mb-4 flex items-center justify-between gap-3"><h2 id={id} className="text-xl font-semibold tracking-tight">{title}</h2><button type="button" onClick={close} aria-label={sw ? 'Funga' : 'Close locations'} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-gray-100"><X size={21} /></button></div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-300 px-4 focus-within:border-emerald-700 focus-within:ring-2 focus-within:ring-emerald-100"><Search size={20} className="shrink-0 text-emerald-700" /><input ref={input} value={query} onChange={e => setQuery(e.target.value)} aria-label={sw ? 'Tafuta eneo' : 'Search locations'} placeholder={sw ? 'Tafuta eneo' : 'Search locations'} className="h-14 w-full min-w-0 border-0 bg-transparent text-base outline-none focus:ring-0" /></div>
        </div>
        <div className="overflow-y-auto px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5">
          {choices.map(o => <button type="button" key={o.value} disabled={o.disabled} aria-pressed={o.value === String(props.value ?? '')} onClick={() => { if (select.current) { select.current.value = o.value; select.current.dispatchEvent(new Event('change', { bubbles: true })); } close(); }} className={`flex min-h-[68px] w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-gray-50 disabled:opacity-50 ${o.value === String(props.value ?? '') ? 'bg-emerald-50' : ''}`}><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-emerald-700"><MapPin size={19} /></span><span className="flex-1 text-base font-medium">{o.label}</span>{o.value === String(props.value ?? '') && <Check size={19} className="text-emerald-700" />}</button>)}
          {!choices.length && <p role="status" className="px-3 py-6 text-base text-gray-500">{sw ? 'Eneo halijapatikana. Jaribu jina jingine.' : 'No locations found. Try another name.'}</p>}
        </div>
      </div>
    </dialog>
  </>;
}
