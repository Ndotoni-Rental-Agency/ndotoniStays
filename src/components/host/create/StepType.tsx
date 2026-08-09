'use client';

import { PROPERTY_TYPES } from '@/components/host/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

export function StepType({ form, updateField }: StepProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.type.title')}</h2>
      <p className="text-sm sm:text-base text-ink-500 mb-5">{t('create.type.subtitle')}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {PROPERTY_TYPES.map((pt) => (
          <button
            key={pt.value}
            type="button"
            onClick={() => updateField('propertyType', pt.value)}
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
    </div>
  );
}
