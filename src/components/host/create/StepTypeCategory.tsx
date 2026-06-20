'use client';

import { STAY_CATEGORIES } from '@/components/host/constants';
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
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">What type of space is this?</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-5">Choose the option that best describes your property</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => updateField('propertyType', t.value)}
              className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 sm:p-5 transition-all active:scale-95 ${
                form.propertyType === t.value
                  ? 'border-brand-500 bg-brand-50 shadow-md'
                  : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50 hover:shadow-sm'
              }`}
            >
              <span className="text-3xl sm:text-4xl">{t.icon}</span>
              <span className="text-xs sm:text-sm font-medium text-ink-700">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-ink-100 pt-8">
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">What's this space great for?</h2>
        <p className="text-sm sm:text-base text-ink-500 mb-5">Select all that apply — helps guests find your listing</p>
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
          <p className="text-sm text-amber-600 mt-3">Select at least one category</p>
        )}
      </div>
    </div>
  );
}
