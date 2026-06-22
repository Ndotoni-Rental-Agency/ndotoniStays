'use client';

import { MediaGrid } from '@/components/media/MediaGrid';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { useLanguage } from '@/contexts/LanguageContext';
import { StepProps } from './types';

interface Props extends StepProps {
  error: string | null;
}

export function StepPhotosContact({ form, setForm, error }: Props) {
  const { t } = useLanguage();
  const totalMedia = form.images.length + form.videos.length;

  function handleMediaChange(images: string[], videos: string[]) {
    setForm(prev => ({ ...prev, images, videos }));
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">{t('create.photos.title')}</h2>
        <p className="text-sm sm:text-base text-ink-500">{t('create.photos.subtitle')}</p>
      </div>

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
