'use client';

import { STAY_CATEGORIES } from '@/components/host/constants';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'Apartment', icon: '🏢' },
  { value: 'HOUSE', label: 'House', icon: '🏠' },
  { value: 'VILLA', label: 'Villa', icon: '🏡' },
  { value: 'STUDIO', label: 'Studio', icon: '🎨' },
  { value: 'ROOM', label: 'Room', icon: '🛏️' },
  { value: 'GUESTHOUSE', label: 'Guesthouse', icon: '🏘️' },
  { value: 'HOTEL', label: 'Hotel', icon: '🏨' },
  { value: 'COTTAGE', label: 'Cottage', icon: '🛖' },
  { value: 'BUNGALOW', label: 'Bungalow', icon: '🌴' },
  { value: 'LODGE', label: 'Lodge', icon: '🏕️' },
  { value: 'OTHER', label: 'Other', icon: '🏗️' },
];

export function StepTypeCategory({ form, updateField, setForm }: StepProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.type.title')}</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-5">{t('create.type.subtitle')}</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {PROPERTY_TYPES.map((pt) => (
            <button
              key={pt.value}
              type="button"
              onClick={() => updateField('propertyType', pt.value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 sm:p-5 transition-all active:scale-95 ${
                form.propertyType === pt.value
                  ? 'border-brand-500 bg-brand-50 shadow-md'
                  : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50 hover:shadow-sm'
              }`}
            >
              <span className="text-3xl sm:text-4xl">{pt.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-ink-700">{pt.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-ink-100 pt-8">
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
                className={`flex items-center gap-2.5 rounded-xl border-2 px-4 py-3 sm:py-3.5 text-sm transition-all active:scale-95 ${
                  isSelected
                    ? 'border-brand-500 bg-brand-50 text-brand-700 font-semibold shadow-sm'
                    : 'border-ink-100 text-ink-600 hover:border-ink-200 hover:bg-ink-50'
                }`}
              >
                <span className="text-xl shrink-0">{cat.icon}</span>
                <span className="text-left leading-tight">{cat.label}</span>
              </button>
            );
          })}
        </div>
        {form.stayCategories.length === 0 && (
          <p className="text-sm text-amber-600 mt-3">{t('create.type.categoryRequired')}</p>
        )}
      </div>
    </div>
  );
}
