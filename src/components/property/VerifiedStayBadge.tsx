'use client';

import { ShieldCheckIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';

export function VerifiedStayBadge() {
  const { language } = useLanguage();
  return <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold leading-4 text-emerald-800 shadow-sm">
    <ShieldCheckIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
    {language === 'sw' ? 'Imethibitishwa' : 'Verified'}
  </span>;
}
