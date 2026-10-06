'use client';

import { useLanguage } from '@/contexts/LanguageContext';

export function useStayCopy() {
  const { language, t } = useLanguage();
  return { language, sw: language === 'sw', copy: (text: string) => {
    const key = `stay.${text}`;
    const value = t(key);
    return value === key ? text : value;
  } };
}
