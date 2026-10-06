'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatPrice } from '@/lib/utils';

export function MobileBookingBar({ nightlyRate, currency }: { nightlyRate: number; currency: string }) {
  const { language } = useLanguage();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const panel = document.getElementById('mobile-booking');
    if (!panel) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0 });
    observer.observe(panel);
    return () => observer.disconnect();
  }, []);
  if (!visible) return null;
  return <aside aria-label={language === 'sw' ? 'Weka nafasi' : 'Book this stay'} className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-3 border-t border-ink-200 bg-white/95 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm lg:hidden">
    <p className="text-sm font-bold text-ink-900">{formatPrice(nightlyRate, currency)}<span className="block text-xs font-normal text-ink-500">{language === 'sw' ? 'kwa usiku' : 'per night'}</span></p>
    <button type="button" className="btn-primary min-h-11 px-5 text-sm" onClick={() => {
      const panel = document.getElementById('mobile-booking');
      panel?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      panel?.focus({ preventScroll: true });
    }}>{language === 'sw' ? 'Chagua tarehe' : 'Choose dates'}</button>
  </aside>;
}
