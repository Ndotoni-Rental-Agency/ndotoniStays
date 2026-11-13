'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parse = (value: string) => { const [y, m, d] = value.split('-').map(Number); return new Date(y, m - 1, d); };
const nightCount = (start: string, end: string) => {
  if (!start || !end) return 0;
  const utc = (value: string) => { const [y,m,d] = value.split('-').map(Number); return Date.UTC(y,m-1,d); };
  return Math.max(0, Math.round((utc(end) - utc(start)) / 86400000));
};

export default function StayDateRangePicker({ checkIn, checkOut, min, onChange, blockedDates, minimumNights = 1, className = 'col-span-2 lg:col-span-4' }: {
  checkIn: string; checkOut: string; min: string; blockedDates?: Set<string>; minimumNights?: number; className?: string; onChange: (start: string, end: string) => void;
}) {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const locale = sw ? 'sw-TZ' : 'en-GB';
  const [open, setOpen] = useState(false);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [phase, setPhase] = useState<'in' | 'out'>('in');
  const [month, setMonth] = useState(() => parse(min));
  const [hover, setHover] = useState('');
  const trigger = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const nights = nightCount(start, end);
  const rangeBlocked = (from: string, to: string) => {
    if (!blockedDates?.size || !from || !to) return false;
    return Array.from(blockedDates).some(date => date >= from && date <= to);
  };
  const canApply = (nights >= minimumNights && !rangeBlocked(start, end)) || (!start && !end && !!(checkIn || checkOut));
  const short = (value: string) => value ? parse(value).toLocaleDateString(locale, { day: 'numeric', month: 'short' }) : sw ? 'Chagua tarehe' : 'Add date';
  function show() {
    setStart(checkIn); setEnd(checkOut); setHover('');
    setPhase(checkIn && !checkOut ? 'out' : 'in');
    const date = parse(checkIn && checkIn >= min ? checkIn : min);
    setMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setOpen(true);
  }
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    const keydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { event.preventDefault(); setOpen(false); }
      if (event.key !== 'Tab') return;
      const buttons = dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
      if (!buttons?.length) return;
      const first = buttons[0], last = buttons[buttons.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', keydown);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', keydown);
      trigger.current?.focus();
    };
  }, [open]);
  function select(value: string) {
    if (phase === 'in' || !start || value <= start) {
      setStart(value); setEnd(''); setPhase('out');
    } else { setEnd(value); setHover(''); }
  }
  const minimum = parse(min);
  const canGoBack = month.getFullYear() * 12 + month.getMonth() > minimum.getFullYear() * 12 + minimum.getMonth();
  function calendar(offset: number) {
    const date = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    const days = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const firstDay = (date.getDay() + 6) % 7;
    const rangeEnd = end || (hover > start ? hover : '');
    return <div className={offset ? 'hidden sm:block' : ''}>
      <h3 className="mb-5 text-center text-base font-semibold text-ink-900">{date.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</h3>
      <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-ink-400">{Array.from({length: 7}, (_, index) => <span key={index}>{new Date(2026,0,5 + index).toLocaleDateString(locale, { weekday: 'short' })}</span>)}</div>
      <div className="grid grid-cols-7 gap-y-1">{Array.from({length: firstDay}, (_, index) => <span key={`blank-${index}`} />)}{Array.from({length: days}, (_, index) => {
        const day = index + 1;
        const value = iso(new Date(date.getFullYear(), date.getMonth(), day));
        const disabled = value < min || !!blockedDates?.has(value) || (phase === 'out' && !!start && value > start && rangeBlocked(start, value));
        const endpoint = value === start || value === end;
        const inside = start && rangeEnd && value > start && value < rangeEnd;
        return <button key={value} type="button" data-date={value} disabled={disabled} aria-pressed={endpoint}
          aria-label={parse(value).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          onClick={() => select(value)} onMouseEnter={() => { if (phase === 'out' && !end) setHover(value); }}
          className={`flex h-11 min-w-0 items-center justify-center text-sm transition-colors duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-700 ${disabled ? 'text-ink-200' : 'text-ink-900'} ${inside ? 'bg-brand-50' : ''} ${value === start && rangeEnd ? 'rounded-l-full bg-brand-50' : ''} ${value === end ? 'rounded-r-full bg-brand-50' : ''}`}>
          <span className={`flex h-10 w-10 items-center justify-center rounded-full ${endpoint ? 'bg-brand-800 font-semibold text-white' : disabled ? '' : 'hover:bg-ink-100'}`}>{day}</span>
        </button>;
      })}</div>
    </div>;
  }
  return <>
    <div className={className}>
      <button ref={trigger} type="button" onClick={show} aria-haspopup="dialog" aria-expanded={open}
        aria-label={`${sw ? 'Tarehe za malazi' : 'Stay dates'}: ${short(checkIn)} — ${short(checkOut)}`}
        className="stays-search-field grid h-[76px] w-full cursor-pointer grid-cols-2 rounded-xl border border-ink-200 bg-ink-50/60 text-left transition-colors hover:border-brand-600 hover:bg-brand-50/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600">
        <span className="my-3 border-r border-ink-100 px-4"><span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-900">{sw ? 'Kuwasili' : 'Check-in'}</span><span className={`mt-1 block text-base ${checkIn ? 'text-ink-900' : 'text-ink-500'}`}>{short(checkIn)}</span></span>
        <span className="my-3 px-4"><span className="flex items-center justify-between gap-2 text-sm font-semibold text-ink-900">{sw ? 'Kuondoka' : 'Check-out'}</span><span className={`mt-1 block text-base ${checkOut ? 'text-ink-900' : 'text-ink-500'}`}>{short(checkOut)}</span></span>
      </button>
    </div>
    {open && createPortal(<div className="stays-picker-backdrop fixed inset-0 z-[100] flex items-end justify-center bg-ink-900/40 sm:items-center sm:p-6" onClick={event => { if (event.target === event.currentTarget) setOpen(false); }}>
      <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="stay-dates-title" tabIndex={-1}
        className="stays-picker-panel flex max-h-[92dvh] w-full max-w-[720px] flex-col rounded-t-3xl bg-white shadow-xl outline-none sm:rounded-3xl">
        <div className="px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <div className="flex items-center justify-between gap-3"><h2 id="stay-dates-title" className="text-xl font-semibold tracking-tight text-ink-900">{sw ? 'Utakaa lini?' : 'When’s your stay?'}</h2><button type="button" onClick={() => setOpen(false)} aria-label={sw ? 'Funga tarehe' : 'Close dates'} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink-50"><X size={21} /></button></div>
          <p className="mt-1 text-sm text-ink-500" aria-live="polite">{sw ? (phase === 'in' ? 'Chagua siku ya kuwasili.' : end ? 'Tarehe zimechaguliwa. Unaweza kuzibadilisha.' : 'Sasa chagua siku ya kuondoka.') : (phase === 'in' ? 'Choose your check-in date.' : end ? 'Dates selected. You can still adjust them.' : 'Now choose your check-out date.')}</p>
          <div className="mt-5 grid grid-cols-2 gap-3">{(['in','out'] as const).map(part => <button key={part} type="button" onClick={() => { setPhase(part === 'out' && !start ? 'in' : part); setHover(''); }} className={`rounded-xl border px-4 py-3 text-left ${phase === part ? 'border-brand-700 bg-brand-50/50 ring-1 ring-brand-700' : 'border-ink-200'}`}><span className="block text-xs font-semibold text-ink-500">{part === 'in' ? (sw ? 'Kuwasili' : 'Check-in') : (sw ? 'Kuondoka' : 'Check-out')}</span><span className="mt-1 block text-base font-medium text-ink-900">{short(part === 'in' ? start : end)}</span></button>)}</div>
        </div>
        <div className="overflow-y-auto px-5 pb-6 sm:px-7" onMouseLeave={() => setHover('')}>
          <div className="mb-2 flex justify-between"><button type="button" disabled={!canGoBack} aria-label={sw ? 'Mwezi uliopita' : 'Previous month'} onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()-1,1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink-50 disabled:opacity-20"><ChevronLeft size={20} /></button><button type="button" aria-label={sw ? 'Mwezi ujao' : 'Next month'} onClick={() => setMonth(new Date(month.getFullYear(),month.getMonth()+1,1))} className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-ink-50"><ChevronRight size={20} /></button></div>
          <div className="grid gap-8 sm:grid-cols-2">{calendar(0)}{calendar(1)}</div>
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-7">
          <button type="button" onClick={() => { setStart(''); setEnd(''); setPhase('in'); setHover(''); }} className="min-h-11 text-sm font-semibold text-ink-700 underline underline-offset-4">{sw ? 'Futa tarehe' : 'Clear dates'}</button>
          <div className="flex items-center gap-4"><span className="text-sm text-ink-500" aria-live="polite">{nights > 0 ? (nights < minimumNights ? (sw ? `Angalau usiku ${minimumNights}` : `${minimumNights} nights minimum`) : `${nights} ${sw ? 'usiku' : nights === 1 ? 'night' : 'nights'}`) : ''}</span><button type="button" disabled={!canApply} onClick={() => { onChange(start,end); setOpen(false); }} className="stays-press min-h-12 rounded-full bg-brand-800 px-5 text-sm font-semibold text-white hover:bg-brand-900 disabled:opacity-40">{sw ? 'Tumia tarehe' : 'Apply dates'}</button></div>
        </div>
      </div>
    </div>, document.body)}
  </>;
}
