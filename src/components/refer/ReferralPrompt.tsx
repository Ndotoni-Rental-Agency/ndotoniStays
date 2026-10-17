'use client';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Gift, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const KEY = 'ndotoni:referral-prompt';
/** A small, dismissible invitation after browsing or a completed listing. */
export function ReferralPrompt() {
  const path = usePathname();
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    setVisible(false);
    function show() {
      try {
        const last = Number(localStorage.getItem(KEY) || 0);
        if (Date.now() - last < 7 * 86400000) return;
        localStorage.setItem(KEY, String(Date.now()));
        setVisible(true);
      } catch { /* Storage unavailable: omit the optional prompt. */ }
    }
    const timer = path === '/search' ? window.setTimeout(show, 60000) : undefined;
    window.addEventListener('ndotoni:listing-completed', show);
    return () => { if (timer) window.clearTimeout(timer); window.removeEventListener('ndotoni:listing-completed', show); };
  }, [path]);
  if (!visible) return null;
  return <aside aria-label={sw ? 'Rufaa' : 'Referral invitation'} className="fixed bottom-24 left-4 right-4 z-40 mx-auto max-w-sm rounded-2xl border border-brand-200 bg-white p-5 shadow-xl dark:border-gray-700 dark:bg-gray-900"><button aria-label={sw ? 'Funga' : 'Dismiss'} onClick={() => setVisible(false)} className="absolute right-2 top-2 rounded-full p-2 text-stone-400 hover:bg-stone-100 dark:hover:bg-gray-800"><X size={18} /></button><Gift size={23} className="text-brand-600" /><p className="mt-3 pr-4 text-base font-bold text-ink-900 dark:text-white">{sw ? 'Unamfahamu mwenye nyumba?' : 'Know a property owner?'}</p><p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-gray-400">{sw ? 'Tufuate Instagram, pakua app. Pata hadi TZS 50,000 kwa rufaa za booking na hadi TZS 30,000 kwa wenyeji.' : 'Follow us on Instagram and download the app. Earn up to TZS 50,000 for booking referrals and TZS 30,000 for hosts.'}</p><Link onClick={() => setVisible(false)} href="/refer" className="mt-4 block rounded-xl bg-brand-600 px-4 py-3 text-center text-sm font-bold text-white hover:bg-brand-700">{sw ? 'Pata Link yangu' : 'Get my referral link'} →</Link></aside>;
}
