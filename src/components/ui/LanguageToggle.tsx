'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const toggle = () => {
    setLanguage(language === 'en' ? 'sw' : 'en');
  };

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors rounded-full px-2.5 py-1.5 hover:bg-ink-50"
      aria-label={`Switch language to ${language === 'en' ? 'Swahili' : 'English'}`}
      title={language === 'en' ? 'Badilisha kwa Kiswahili' : 'Switch to English'}
    >
      <span className="text-base leading-none">{language === 'en' ? '🇹🇿' : '🇬🇧'}</span>
      <span className="uppercase tracking-wide">{language === 'en' ? 'SW' : 'EN'}</span>
    </button>
  );
}
