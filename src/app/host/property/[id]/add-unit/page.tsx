'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/graphql/queries';
import { addUnitToProperty } from '@/graphql/mutations';
import { PartyPopper } from 'lucide-react';
import { ArrowLeftIcon, CheckIcon, ArrowRightIcon, MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { StepPricing, CreatePropertyFormData } from '@/components/host/create';
import { MediaGrid } from '@/components/media/MediaGrid';
import { MediaLibraryPicker } from '@/components/media/MediaLibraryPicker';
import { ShortTermProperty } from '@/API';

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

export default function AddUnitPage() {
  const { t } = useLanguage();
  const router = useRouter();
  const params = useParams();
  const sourcePropertyId = params.id as string;

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
  const [success, setSuccess] = useState(false);

  useEffect(() => {
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
      setSuccess(true);
    } catch (err: any) {
      console.error('Failed to add unit:', err);
      setError(err?.message || t('addUnit.error'));
    } finally {
      setSubmitting(false);
    }
  }

  const canAdvance = unitLabel.trim().length > 0;
  const canSubmit = !!form.nightlyRate && parseFloat(form.nightlyRate) > 0
    && (form.images.length > 0 || form.videos.length > 0);

  if (success) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <PartyPopper className="w-14 h-14 text-brand-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-ink-900 mb-2">{t('addUnit.success.title')}</h1>
          <p className="text-ink-500 mb-6">{t('addUnit.success.desc')}</p>
          <button onClick={() => router.push('/host')} className="btn-primary px-6 py-3">
            {t('addUnit.success.viewAll')}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/host" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4">
        <ArrowLeftIcon className="h-4 w-4" />
        {t('addUnit.back')}
      </Link>

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-5 sm:p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-ink-900">{t('addUnit.heading')}</h1>
          <div className="flex items-center gap-2 text-xs font-medium text-ink-400">
            <span className={step === 1 ? 'text-brand-600' : ''}>1. {t('addUnit.step1.label')}</span>
            <span>·</span>
            <span className={step === 2 ? 'text-brand-600' : ''}>2. {t('addUnit.step2.label')}</span>
          </div>
        </div>

        {/* Inherited-from summary — always visible so the host knows what's shared */}
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

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-6 max-w-2xl">
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

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canAdvance}
                  className="btn-primary inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {t('create.continue')}
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              </div>
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

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900 py-3"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  {t('create.back')}
                </button>
                <button
                  type="submit"
                  disabled={submitting || !canSubmit}
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-10 py-3 text-sm sm:text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
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
              </div>
            </div>
          )}
        </form>
      </div>

      <MediaLibraryPicker
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onAdd={handleMediaLibraryAdd}
      />
    </div>
  );
}
