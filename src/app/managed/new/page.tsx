'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { AuthModal } from '@/components/auth/AuthModal';
import { generateVideoThumbnail } from '@/lib/video-thumbnail';
import {
  StepType,
  StepCategory,
  StepLocation,
  StepPricing,
  StepPhotosContact,
  CreatePropertyFormData,
} from '@/components/host/create';

// Admin-only mutation — lists a stay on behalf of an owner with no account.
const adminCreateManagedStay = /* GraphQL */ `
  mutation AdminCreateManagedStay($input: AdminCreateManagedStayInput!) {
    adminCreateManagedStay(input: $input) {
      ownerUserId
      ownerCreated
      property {
        propertyId
        title
        status
      }
    }
  }
`;

const STEPS = [
  { id: 1, labelKey: 'managed.stepOwner' },
  { id: 2, labelKey: 'managed.stepType' },
  { id: 3, labelKey: 'managed.stepCategory' },
  { id: 4, labelKey: 'managed.stepLocation' },
  { id: 5, labelKey: 'managed.stepPrice' },
  { id: 6, labelKey: 'managed.stepPhotos' },
  { id: 7, labelKey: 'managed.stepReview' },
];
const TOTAL_STEPS = STEPS.length;

interface OwnerForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  payoutMpesaPhone: string;
  payoutMpesaName: string;
}

interface Draft {
  step: number;
  owner: OwnerForm;
  form: CreatePropertyFormData;
}

const EMPTY_DRAFT: Draft = {
  step: 1,
  owner: { firstName: '', lastName: '', phoneNumber: '', whatsappNumber: '', email: '', payoutMpesaPhone: '', payoutMpesaName: '' },
  form: {
    title: '',
    propertyType: 'HOTEL',
    stayCategories: ['NIGHTLY_STAY'],
    region: 'Dar es Salaam',
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
  },
};

// Field visits drop connections and tabs get closed; keep the half-filled form on this device.
const DRAFT_KEY = 'ndotoni_managed_stay_draft';

function loadDraft(): Draft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? { ...EMPTY_DRAFT, ...JSON.parse(raw) } : null;
  } catch {
    return null;
  }
}

function saveDraft(draft: Draft | null) {
  try {
    if (draft) localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* private mode or storage full: the form still works, it just isn't remembered */
  }
}

const inputClass =
  'w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600';

const titleCase = (s?: string) =>
  (s || '').replace(/[-_]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Full-page flow for listing a stay on behalf of an owner (admins only). */
export default function NewManagedStayPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { t } = useLanguage();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [resumed, setResumed] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ propertyId: string; ownerName: string; ownerCreated: boolean } | null>(null);

  const { step, owner, form } = draft;

  useEffect(() => {
    const saved = loadDraft();
    if (saved) {
      setDraft(saved);
      setResumed(!!saved.owner.firstName || !!saved.form.title || saved.step > 1);
    }
  }, []);

  useEffect(() => {
    if (!created) saveDraft(draft);
  }, [draft, created]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.userType !== 'ADMIN') {
    return (
      <>
        <p className="text-ink-500 py-16 text-center">{t('managed.adminOnly')}</p>
        <AuthModal isOpen={!isAuthenticated} onClose={() => {}} />
      </>
    );
  }

  const setForm: React.Dispatch<React.SetStateAction<CreatePropertyFormData>> = (action) =>
    setDraft((d) => ({ ...d, form: typeof action === 'function' ? action(d.form) : action }));

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateOwner(field: keyof OwnerForm, value: string) {
    setDraft((d) => ({ ...d, owner: { ...d.owner, [field]: value } }));
  }

  const phoneOk = isValidPhoneNumber(owner.phoneNumber || '');
  const optionalPhoneOk = (value: string) => !value || isValidPhoneNumber(value);

  function stepComplete(n: number): boolean {
    switch (n) {
      case 1:
        return !!owner.firstName.trim() && phoneOk && optionalPhoneOk(owner.whatsappNumber) && optionalPhoneOk(owner.payoutMpesaPhone);
      case 2: return !!form.propertyType;
      case 3: return form.stayCategories.length > 0;
      case 4: return !!form.region && !!form.district && !!form.ward.trim() && !!form.street.trim();
      case 5: return parseFloat(form.nightlyRate) > 0;
      case 6: return !!form.title.trim() && form.images.length + form.videos.length > 0;
      default: return true;
    }
  }

  function goTo(n: number) {
    setDirection(n > step ? 'forward' : 'back');
    setError(null);
    setDraft((d) => ({ ...d, step: n }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function submit() {
    const incomplete = STEPS.find((s) => !stepComplete(s.id));
    if (incomplete) return goTo(incomplete.id);
    setLoading(true);
    setError(null);

    try {
      let thumbnail: string | undefined;
      if (form.images.length === 0 && form.videos.length > 0) {
        thumbnail = (await generateVideoThumbnail(form.videos[0])) || undefined;
      }

      const data = await GraphQLClient.executeAuthenticated<{
        adminCreateManagedStay: { ownerCreated: boolean; property: { propertyId: string } };
      }>(adminCreateManagedStay, {
        input: {
          owner: {
            firstName: owner.firstName.trim(),
            lastName: owner.lastName.trim() || undefined,
            phoneNumber: owner.phoneNumber,
            whatsappNumber: owner.whatsappNumber || undefined,
            email: owner.email.trim() || undefined,
            ...(owner.payoutMpesaPhone && {
              payoutMethod: 'MPESA',
              payoutMpesaPhone: owner.payoutMpesaPhone,
              payoutMpesaName: owner.payoutMpesaName.trim() || undefined,
            }),
          },
          property: {
            title: form.title.trim(),
            propertyType: form.propertyType,
            stayCategories: form.stayCategories,
            region: form.region,
            district: form.district || form.region,
            ward: form.ward.trim(),
            street: form.street.trim(),
            nightlyRate: parseFloat(form.nightlyRate),
            currency: form.currency,
            maxGuests: parseInt(form.maxGuests),
            bedrooms: parseInt(form.bedrooms) || 1,
            bathrooms: parseInt(form.bathrooms) || 1,
            instantBookEnabled: form.instantBookEnabled,
            images: form.images.length > 0 ? form.images : thumbnail ? [thumbnail] : undefined,
            videos: form.videos.length > 0 ? form.videos : undefined,
            googleMapsLink: form.googleMapsLink || undefined,
            ...(form.lat && form.lng && { latitude: form.lat, longitude: form.lng }),
          },
        },
      });

      const result = data.adminCreateManagedStay;
      saveDraft(null);
      setCreated({
        propertyId: result.property.propertyId,
        ownerName: `${owner.firstName} ${owner.lastName}`.trim(),
        ownerCreated: result.ownerCreated,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error creating managed listing:', err);
      setError(err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function startOver() {
    saveDraft(null);
    setDraft(EMPTY_DRAFT);
    setCreated(null);
    setError(null);
    setResumed(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (created) {
    const message = (created.ownerCreated ? t('managed.successNew') : t('managed.successExisting'))
      .replace('{name}', created.ownerName);
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <CheckCircleIcon className="h-14 w-14 text-brand-600 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-ink-900">{t('managed.successTitle')}</h1>
        <p className="text-ink-500 mt-3 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href={`/host/property/${created.propertyId}/edit`} className="btn-primary">
            {t('managed.addDetails')}
          </Link>
          <Link
            href={`/property/${created.propertyId}`}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors"
          >
            {t('managed.view')}
          </Link>
          <button
            type="button"
            onClick={startOver}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors"
          >
            {t('managed.another')}
          </button>
        </div>
        <Link href="/host/managed" className="inline-block mt-6 text-sm text-ink-500 hover:underline">
          {t('managed.backToList')}
        </Link>
      </div>
    );
  }

  const stepProps = { form, updateField, setForm };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink-50/50">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-white border-b border-ink-100 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-3">
          <Link href="/host/managed" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t('managed.backToList')}</span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => (s.id < step || stepComplete(step)) && goTo(s.id)}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all duration-300 ${
                      s.id === step
                        ? 'bg-brand-600 text-white ring-2 ring-brand-200 scale-110'
                        : s.id < step
                        ? 'bg-green-500 text-white'
                        : 'bg-ink-100 text-ink-400'
                    }`}
                  >
                    {s.id < step ? <CheckIcon className="h-3 w-3" /> : s.id}
                  </span>
                  <span className={`hidden lg:inline text-xs font-medium ${
                    s.id === step ? 'text-brand-700' : s.id < step ? 'text-green-600' : 'text-ink-400'
                  }`}>
                    {t(s.labelKey)}
                  </span>
                </button>
                {i < STEPS.length - 1 && <div className={`w-3 sm:w-6 h-0.5 mx-1 rounded ${s.id < step ? 'bg-green-300' : 'bg-ink-100'}`} />}
              </div>
            ))}
          </div>

          <button type="button" onClick={startOver} className="text-xs text-ink-400 hover:text-ink-600 hidden sm:block">
            {t('managed.startOver')}
          </button>
        </div>
        <div className="mt-3 h-1 w-full bg-ink-100 rounded-full overflow-hidden sm:hidden">
          <div className="h-full bg-brand-500 rounded-full transition-[width] duration-500 ease-out" style={{ width: `${(step / TOTAL_STEPS) * 100}%` }} />
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-ink-900">{t('managed.title')}</h1>
          <p className="text-ink-500 mt-1 max-w-2xl text-sm">
            {t('managed.subtitle')} {resumed && <span className="text-brand-700">{t('managed.resumed')}</span>}
          </p>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
          <div key={step} className={`p-5 sm:p-8 lg:p-10 ${direction === 'forward' ? 'animate-step-in-forward' : 'animate-step-in-back'}`}>
            {step === 1 && (
              <div className="space-y-5">
                <h2 className="text-xl sm:text-2xl font-bold text-ink-900">{t('managed.ownerTitle')}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="block text-sm font-medium text-ink-700 mb-1.5">
                      {t('managed.firstName')} <span className="text-red-500">*</span>
                    </span>
                    <input className={inputClass} value={owner.firstName} onChange={(e) => updateOwner('firstName', e.target.value)} autoFocus />
                  </label>
                  <label className="block">
                    <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.lastName')}</span>
                    <input className={inputClass} value={owner.lastName} onChange={(e) => updateOwner('lastName', e.target.value)} />
                  </label>
                </div>
                <div className="max-w-md">
                  <span className="block text-sm font-medium text-ink-700 mb-1.5">
                    {t('managed.phone')} <span className="text-red-500">*</span>
                  </span>
                  <PhoneInput value={owner.phoneNumber} onChange={(v) => updateOwner('phoneNumber', v)} required />
                  <p className="text-sm text-ink-400 mt-2">{t('managed.phoneDesc')}</p>
                  {owner.phoneNumber && !phoneOk && <p className="text-sm text-amber-600 mt-1">{t('create.photos.phoneInvalid')}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.whatsapp')}</span>
                    <PhoneInput value={owner.whatsappNumber} onChange={(v) => updateOwner('whatsappNumber', v)} />
                  </div>
                  <label className="block">
                    <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.email')}</span>
                    <input type="email" className={inputClass} value={owner.email} onChange={(e) => updateOwner('email', e.target.value)} />
                  </label>
                </div>
                <details className="rounded-xl border border-ink-100 p-4" open={!!owner.payoutMpesaPhone}>
                  <summary className="text-sm font-semibold text-ink-900 cursor-pointer">{t('managed.payout')}</summary>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.payoutPhone')}</span>
                      <PhoneInput value={owner.payoutMpesaPhone} onChange={(v) => updateOwner('payoutMpesaPhone', v)} />
                    </div>
                    <label className="block">
                      <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.payoutName')}</span>
                      <input className={inputClass} value={owner.payoutMpesaName} onChange={(e) => updateOwner('payoutMpesaName', e.target.value)} />
                    </label>
                  </div>
                </details>
              </div>
            )}
            {step === 2 && <StepType {...stepProps} />}
            {step === 3 && <StepCategory {...stepProps} />}
            {step === 4 && <StepLocation {...stepProps} />}
            {step === 5 && <StepPricing {...stepProps} />}
            {step === 6 && <StepPhotosContact {...stepProps} error={null} hideContact />}
            {step === 7 && (
              <div className="space-y-4">
                <h2 className="text-xl sm:text-2xl font-bold text-ink-900">{t('managed.reviewTitle')}</h2>
                <ReviewRow label={t('managed.stepOwner')} onEdit={() => goTo(1)} editLabel={t('managed.edit')}>
                  {`${owner.firstName} ${owner.lastName}`.trim()} · {owner.phoneNumber}
                  {owner.payoutMpesaPhone && <span className="block text-ink-500">M-Pesa: {owner.payoutMpesaPhone}</span>}
                </ReviewRow>
                <ReviewRow label={t('managed.stepType')} onEdit={() => goTo(2)} editLabel={t('managed.edit')}>
                  {titleCase(form.propertyType)} · {form.stayCategories.map(titleCase).join(', ')}
                </ReviewRow>
                <ReviewRow label={t('managed.stepLocation')} onEdit={() => goTo(4)} editLabel={t('managed.edit')}>
                  {[form.street, form.ward, form.district, form.region].filter(Boolean).map(titleCase).join(', ')}
                </ReviewRow>
                <ReviewRow label={t('managed.stepPrice')} onEdit={() => goTo(5)} editLabel={t('managed.edit')}>
                  {form.currency} {Number(form.nightlyRate || 0).toLocaleString()}{t('managed.perNight')} · {form.maxGuests} guests · {form.bedrooms} bed · {form.bathrooms} bath
                </ReviewRow>
                <ReviewRow label={t('managed.stepPhotos')} onEdit={() => goTo(6)} editLabel={t('managed.edit')}>
                  <span className="font-medium">{form.title}</span>
                  <div className="flex gap-2 overflow-x-auto mt-2">
                    {form.images.slice(0, 6).map((src) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={src} src={src} alt="" className="h-16 w-16 rounded-lg object-cover flex-shrink-0" />
                    ))}
                    {form.images.length + form.videos.length > 6 && (
                      <span className="self-center text-ink-500">+{form.images.length + form.videos.length - 6}</span>
                    )}
                  </div>
                </ReviewRow>
                <p className="text-xs text-ink-400">{t('managed.reviewNote')}</p>
              </div>
            )}
          </div>
        </div>

        {error && <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 mt-4">{error}</div>}

        <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-ink-100 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 sm:border-0 sm:bg-transparent sm:mt-6 sm:static">
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => goTo(step - 1)}
                className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors py-3 px-4 -ml-4 rounded-xl hover:bg-ink-50"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                {t('create.back')}
              </button>
            ) : <div />}
            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={() => goTo(step + 1)}
                disabled={!stepComplete(step)}
                className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {t('create.continue')}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={loading}
                className="btn-primary inline-flex items-center gap-2 px-6 sm:px-10 py-3 text-sm sm:text-base font-semibold disabled:opacity-40"
              >
                {loading ? t('managed.submitting') : (<><CheckIcon className="h-5 w-5" />{t('managed.submit')}</>)}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewRow({ label, onEdit, editLabel, children }: { label: string; onEdit: () => void; editLabel: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-ink-100 p-4">
      <div className="min-w-0 text-sm text-ink-900">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-400 mb-1">{label}</p>
        {children}
      </div>
      <button type="button" onClick={onEdit} className="text-sm text-brand-600 hover:underline flex-shrink-0">
        {editLabel}
      </button>
    </div>
  );
}
