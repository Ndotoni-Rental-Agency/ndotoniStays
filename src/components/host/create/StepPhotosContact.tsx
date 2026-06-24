'use client';

import { useState } from 'react';
import { MediaGrid } from '@/components/media/MediaGrid';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIService } from '@/lib/ai/AIService';
import { StepProps } from './types';

interface Props extends StepProps {
  error: string | null;
}

export function StepPhotosContact({ form, updateField, setForm, error }: Props) {
  const { t, language } = useLanguage();
  const [generatingTitle, setGeneratingTitle] = useState(false);
  const totalMedia = form.images.length + form.videos.length;

  function handleMediaChange(images: string[], videos: string[]) {
    setForm(prev => ({ ...prev, images, videos }));
  }

  async function handleGenerateTitle() {
    setGeneratingTitle(true);
    try {
      const title = await AIService.generateTitle({
        propertyType: form.propertyType,
        district: form.district,
        region: form.region,
        maxGuests: form.maxGuests,
        bedrooms: form.bedrooms,
        bathrooms: form.bathrooms,
        stayCategories: form.stayCategories,
        currency: form.currency,
        nightlyRate: form.nightlyRate,
        userContext: form.title || undefined,
        language,
      });
      if (title) {
        updateField('title', title);
      }
    } catch (err) {
      console.error('Failed to generate title:', err);
    } finally {
      setGeneratingTitle(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.photos.title')}</h2>
        <p className="text-sm sm:text-base text-ink-500">{t('create.photos.subtitle')}</p>
      </div>

      {/* Title — placed here so AI has full property context */}
      <div className="max-w-2xl">
        <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.pricing.name')}</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => updateField('title', e.target.value)}
          placeholder={t('create.pricing.namePlaceholder')}
          className="input text-base sm:text-lg py-3.5"
          required
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs sm:text-sm text-ink-400">{t('create.pricing.nameTip')}</p>
          <button
            type="button"
            onClick={handleGenerateTitle}
            disabled={generatingTitle || !form.district}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 disabled:text-ink-300 disabled:cursor-not-allowed transition-colors"
          >
            {generatingTitle ? (
              <>
                <span className="h-3 w-3 border-2 border-brand-300 border-t-brand-600 rounded-full animate-spin" />
                {t('create.pricing.generating')}
              </>
            ) : (
              <>{t('create.pricing.suggestTitle')}</>
            )}
          </button>
        </div>
      </div>

      {/* Photos & Videos */}
      <div>
        <label className="block text-sm font-medium text-ink-700 mb-3">
          {t('create.photos.label')} <span className="text-red-500">*</span>
        </label>

        <MediaGrid
          images={form.images}
          videos={form.videos}
          onChange={handleMediaChange}
          maxMedia={10}
        />

        <p className="text-sm text-ink-400 mt-3">
          {totalMedia === 0
            ? t('create.photos.empty')
            : t('create.photos.count').replace('{count}', String(totalMedia))}
        </p>
        {totalMedia === 0 && (
          <p className="text-sm text-amber-600 mt-1">{t('create.photos.required')}</p>
        )}
      </div>

      {/* Phone */}
      <div className="border-t border-ink-100 pt-8 max-w-md">
        <label className="block text-sm font-medium text-ink-700 mb-2">{t('create.photos.phone')}</label>
        <PhoneInput
          value={form.phoneNumber}
          onChange={(val) => setForm(prev => ({ ...prev, phoneNumber: val }))}
          placeholder={t('create.photos.phonePlaceholder')}
          required
        />
        <p className="text-sm text-ink-400 mt-2">{t('create.photos.phoneDesc')}</p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
          {error}
        </div>
      )}
    </div>
  );
}
