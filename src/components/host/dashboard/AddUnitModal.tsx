'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/graphql/queries';
import { addUnitToProperty } from '@/graphql/mutations';
import { XMarkIcon, ArrowLeftIcon, ArrowRightIcon, CheckIcon, MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StepPricing, CreatePropertyFormData } from '@/components/host/create';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaLibraryPicker } from '@/components/media/MediaLibraryPicker';
import { ShortTermProperty } from '@/API';

interface Props {
  sourcePropertyId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM: CreatePropertyFormData = {
  title: '',
  propertyType: '',
  stayCategories: [],
  region: '',
  district: '',
  ward: '',
  street: '',
  googleMapsLink: '',
  nightlyRate: '',
  currency: 'TZS',
  maxGuests: '2',
  bedrooms: '1',
  bathrooms: '1',
  instantBookEnabled: false,
  images: [],
  videos: [],
  phoneNumber: '',
  lat: 0,
  lng: 0,
};

/** Overlay dialog for adding another unit to an existing property — not a routed page,
 * since it's a focused, dismissible sub-task rather than a destination of its own. */
export function AddUnitModal({ sourcePropertyId, onClose, onSuccess }: Props) {
  const { t } = useLanguage();
  const isOpen = !!sourcePropertyId;

  const [source, setSource] = useState<ShortTermProperty | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  const [unitLabel, setUnitLabel] = useState('');
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState(false);
  const [form, setForm] = useState<CreatePropertyFormData>(EMPTY_FORM);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sourcePropertyId) return;
    // Reset per-open so re-opening for a different property doesn't carry over state.
    setStep(1);
    setUnitLabel('');
    setCustomTitle(null);
    setEditingTitle(false);
    setForm(EMPTY_FORM);
    setError(null);
    setLoading(true);

    (async () => {
      try {
        const data = await GraphQLClient.executeAuthenticated<{ getShortTermProperty: ShortTermProperty }>(
          getShortTermProperty,
          { propertyId: sourcePropertyId }
        );
        const property = data.getShortTermProperty;
        setSource(property);
        setForm((prev) => ({
          ...prev,
          propertyType: property.propertyType,
          region: property.region,
          district: property.district,
          currency: property.currency,
        }));
      } catch (err) {
        console.error('Failed to load source property:', err);
        setError(t('addUnit.error'));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcePropertyId]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleMediaChange(images: string[], videos: string[]) {
    setForm((prev) => ({ ...prev, images, videos }));
  }

  function handleMediaLibraryAdd(images: string[], videos: string[]) {
    setForm((prev) => ({
      ...prev,
      images: Array.from(new Set([...prev.images, ...images])),
      videos: Array.from(new Set([...prev.videos, ...videos])),
    }));
  }

  const autoTitle = unitLabel.trim() && source ? `${unitLabel.trim()} at ${source.title}` : source?.title || '';
  const effectiveTitle = customTitle ?? autoTitle;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!sourcePropertyId) return;
    setSubmitting(true);
    setError(null);

    try {
      await GraphQLClient.executeAuthenticated<{
        addUnitToProperty: { propertyId: string; success: boolean; message: string };
      }>(addUnitToProperty, {
        sourcePropertyId,
        input: {
          title: effectiveTitle,
          unitLabel: unitLabel.trim() || undefined,
          nightlyRate: parseFloat(form.nightlyRate),
          currency: form.currency,
          maxGuests: parseInt(form.maxGuests) || 2,
          bedrooms: parseInt(form.bedrooms) || undefined,
          bathrooms: parseInt(form.bathrooms) || undefined,
          instantBookEnabled: form.instantBookEnabled,
          images: form.images,
          videos: form.videos,
        },
      });
      onClose();
      onSuccess();
    } catch (err: any) {
      console.error('Failed to add unit:', err);
      setError(err?.message || t('addUnit.error'));
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const canAdvance = unitLabel.trim().length > 0;
  const canSubmit = !!form.nightlyRate && parseFloat(form.nightlyRate) > 0
    && (form.images.length > 0 || form.videos.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-ink-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-ink-900">{t('addUnit.heading')}</h2>
            <p className="text-xs font-medium text-ink-400 mt-0.5">
              <span className={step === 1 ? 'text-brand-600' : ''}>1. {t('addUnit.step1.label')}</span>
              {' · '}
              <span className={step === 2 ? 'text-brand-600' : ''}>2. {t('addUnit.step2.label')}</span>
            </p>
          </div>
          <button type="button" onClick={onClose} className="text-ink-400 hover:text-ink-700 transition-colors" aria-label="Close">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-ink-400 animate-pulse">{t('common.loading')}</div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {source && (
                <div className="flex gap-3 rounded-xl border border-ink-100 bg-ink-50/60 p-3.5 mb-6">
                  <div className="relative h-12 w-12 shrink-0 rounded-lg overflow-hidden bg-ink-100">
                    {source.thumbnail ? (
                      <img src={source.thumbnail} alt={source.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ink-400 uppercase tracking-wide">{t('addUnit.inheritedFrom')}</p>
                    <p className="text-sm font-medium text-ink-900 truncate">{source.title}</p>
                    <p className="text-xs text-ink-500 flex items-center gap-1 mt-0.5">
                      <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
                      {[source.address?.street, source.district, source.region].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-6">
                  <p className="text-sm text-ink-500">
                    {t('addUnit.intro').replace('{title}', source?.title || '')}
                  </p>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-2">{t('addUnit.unitLabel')}</label>
                    <input
                      type="text"
                      value={unitLabel}
                      onChange={(e) => setUnitLabel(e.target.value)}
                      placeholder={t('addUnit.unitLabelPlaceholder')}
                      className="input py-3 text-base"
                      autoFocus
                      required
                    />
                    <p className="text-xs text-ink-400 mt-1.5">{t('addUnit.unitLabelHelp')}</p>
                  </div>

                  {unitLabel.trim() && (
                    <div className="rounded-xl border border-ink-100 p-3.5">
                      <label className="block text-xs font-medium text-ink-400 uppercase tracking-wide mb-1.5">
                        {t('addUnit.titlePreview')}
                      </label>
                      {editingTitle ? (
                        <>
                          <input
                            type="text"
                            value={effectiveTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                            className="input py-2.5"
                          />
                          <button
                            type="button"
                            onClick={() => { setCustomTitle(null); setEditingTitle(false); }}
                            className="text-xs font-medium text-brand-600 hover:text-brand-700 mt-2"
                          >
                            {t('addUnit.useAutoTitle')}
                          </button>
                        </>
                      ) : (
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-ink-900">{effectiveTitle}</p>
                          <button
                            type="button"
                            onClick={() => setEditingTitle(true)}
                            className="text-xs font-medium text-brand-600 hover:text-brand-700 shrink-0"
                          >
                            {t('addUnit.editTitle')}
                          </button>
                        </div>
                      )}
                      {!editingTitle && (
                        <p className="text-xs text-ink-400 mt-1">{t('addUnit.titleAutoNote')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8">
                  <StepPricing form={form} updateField={updateField} setForm={setForm} />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-ink-700">
                        {t('create.photos.label')} <span className="text-red-500">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker(true)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
                      >
                        <PhotoIcon className="h-3.5 w-3.5" />
                        {t('addUnit.reuseFromLibrary')}
                      </button>
                    </div>
                    <MediaGrid images={form.images} videos={form.videos} onChange={handleMediaChange} maxMedia={10} />
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 sm:p-5 border-t border-ink-100 shrink-0">
              {step === 2 ? (
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900 py-2.5 px-3"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  {t('create.back')}
                </button>
              ) : (
                <button type="button" onClick={onClose} className="btn-secondary text-sm px-4 py-2.5">
                  {t('common.cancel')}
                </button>
              )}

              {step === 1 ? (
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canAdvance}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('create.continue')}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('addUnit.submitting')}
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      {t('addUnit.submit')}
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>

      <MediaLibraryPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onAdd={handleMediaLibraryAdd}
      />
    </div>
  );
}
