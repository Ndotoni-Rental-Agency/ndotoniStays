'use client';

import { useRef } from 'react';
import { PROPERTY_TYPES } from '@/components/host/constants';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

export function StepType({ form, updateField, setForm }: StepProps) {
  const { t } = useLanguage();
  const phoneSectionRef = useRef<HTMLDivElement>(null);

  function handleSelectType(value: string) {
    updateField('propertyType', value);
    // The phone field is below the fold on mobile until a type is picked —
    // nudge it into view so it doesn't get skipped. A short delay lets the
    // selection state render first; 'nearest' avoids over-scrolling past
    // the sticky top bar.
    setTimeout(() => {
      phoneSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 150);
  }

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.type.title')}</h2>
      <p className="text-sm sm:text-base text-ink-500 mb-5">{t('create.type.subtitle')}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {PROPERTY_TYPES.map((pt) => (
          <button
            key={pt.value}
            type="button"
            onClick={() => handleSelectType(pt.value)}
            className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 sm:p-5 transition-all duration-200 active:scale-95 ${
              form.propertyType === pt.value
                ? 'border-brand-500 bg-brand-50 shadow-md scale-[1.03]'
                : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50 hover:shadow-sm'
            }`}
          >
            <pt.icon className="w-8 h-8 sm:w-10 sm:h-10 text-ink-500" />
            <span className="text-xs sm:text-sm font-medium text-ink-700">{pt.label}</span>
          </button>
        ))}
      </div>

      {/* Optional early phone capture — not required to advance. Lets us follow up
          with hosts who start a listing and drop off before reaching the mandatory
          phone field on the last step. See notifyListingStarted() in page.tsx. */}
      <div ref={phoneSectionRef} className="mt-8 pt-6 border-t border-ink-100 max-w-md">
        <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.type.phone')}</label>
        <PhoneInput
          value={form.phoneNumber}
          onChange={(val) => setForm(prev => ({ ...prev, phoneNumber: val }))}
          placeholder={t('create.photos.phonePlaceholder')}
        />
      </div>
    </div>
  );
}
