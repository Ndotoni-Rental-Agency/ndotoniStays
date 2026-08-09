'use client';

import { STAY_CATEGORIES } from '@/components/host/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

export function StepCategory({ form, setForm }: StepProps) {
  const { t } = useLanguage();

  return (
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.type.categoryTitle')}</h2>
      <p className="text-sm sm:text-base text-ink-500 mb-5">{t('create.type.categorySubtitle')}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {STAY_CATEGORIES.map((cat) => {
          const isSelected = form.stayCategories.includes(cat.value);
          return (
            <button
              key={cat.value}
              type="button"
              onClick={() => {
                setForm(prev => ({
                  ...prev,
                  stayCategories: isSelected
                    ? prev.stayCategories.filter(c => c !== cat.value)
                    : [...prev.stayCategories, cat.value],
                }));
              }}
              className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 sm:py-3.5 text-sm transition-all duration-200 active:scale-95 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold shadow-sm scale-[1.03]'
                  : 'border-ink-100 text-ink-600 hover:border-ink-200 hover:bg-ink-50'
              }`}
            >
              <cat.icon className="w-5 h-5 shrink-0" />
              <span className="text-left leading-tight">{cat.label}</span>
            </button>
          );
        })}
      </div>
      {form.stayCategories.length === 0 && (
        <p className="text-sm text-amber-600 mt-3">{t('create.type.categoryRequired')}</p>
      )}
    </div>
  );
}
