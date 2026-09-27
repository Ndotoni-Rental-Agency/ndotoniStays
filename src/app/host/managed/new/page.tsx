'use client';

import { useState } from 'react';
import Link from 'next/link';
import { isValidPhoneNumber } from 'react-phone-number-input';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { PhoneInput } from '@/components/ui/PhoneInput';
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

interface OwnerForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  payoutMpesaPhone: string;
  payoutMpesaName: string;
}

interface CreatedListing {
  propertyId: string;
  ownerName: string;
  ownerCreated: boolean;
}

const EMPTY_OWNER: OwnerForm = {
  firstName: '',
  lastName: '',
  phoneNumber: '',
  whatsappNumber: '',
  email: '',
  payoutMpesaPhone: '',
  payoutMpesaName: '',
};

const EMPTY_PROPERTY: CreatePropertyFormData = {
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
};

const inputClass =
  'w-full rounded-xl border border-ink-200 px-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600';

export default function ManagedListingPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [owner, setOwner] = useState<OwnerForm>(EMPTY_OWNER);
  const [form, setForm] = useState<CreatePropertyFormData>(EMPTY_PROPERTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedListing | null>(null);

  if (user?.userType !== 'ADMIN') {
    return <p className="text-ink-500 py-16 text-center">{t('managed.adminOnly')}</p>;
  }

  function updateOwner(field: keyof OwnerForm, value: string) {
    setOwner(prev => ({ ...prev, [field]: value }));
  }

  function updateField(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  const phoneOk = isValidPhoneNumber(owner.phoneNumber || '');
  const optionalPhoneOk = (value: string) => !value || isValidPhoneNumber(value);
  const canSubmit =
    !!owner.firstName.trim() &&
    phoneOk &&
    optionalPhoneOk(owner.whatsappNumber) &&
    optionalPhoneOk(owner.payoutMpesaPhone) &&
    !!form.propertyType &&
    form.stayCategories.length > 0 &&
    !!form.district &&
    !!form.ward.trim() &&
    !!form.street.trim() &&
    !!form.title &&
    parseFloat(form.nightlyRate) > 0 &&
    form.images.length + form.videos.length > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);

    try {
      let thumbnail: string | undefined;
      if (form.images.length === 0 && form.videos.length > 0) {
        thumbnail = (await generateVideoThumbnail(form.videos[0])) || undefined;
      }

      const data = await GraphQLClient.executeAuthenticated<{
        adminCreateManagedStay: {
          ownerUserId: string;
          ownerCreated: boolean;
          property: { propertyId: string };
        };
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
            title: form.title,
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

  function reset() {
    setOwner(EMPTY_OWNER);
    setForm(EMPTY_PROPERTY);
    setCreated(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  if (created) {
    const message = (created.ownerCreated ? t('managed.successNew') : t('managed.successExisting'))
      .replace('{name}', created.ownerName);
    return (
      <div className="max-w-md mx-auto text-center py-12">
        <CheckCircleIcon className="h-14 w-14 text-brand-600 mx-auto mb-4" />
        <h1 className="text-2xl font-semibold text-ink-900">{t('managed.successTitle')}</h1>
        <p className="text-ink-500 mt-3 leading-relaxed">{message}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href={`/property/${created.propertyId}`} className="btn-primary">
            {t('managed.view')}
          </Link>
          <button
            type="button"
            onClick={reset}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors"
          >
            {t('managed.another')}
          </button>
        </div>
      </div>
    );
  }

  const stepProps = { form, updateField, setForm };

  return (
    <form onSubmit={handleSubmit} className="space-y-10 pb-24">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">{t('managed.title')}</h1>
        <p className="text-ink-500 mt-2 max-w-2xl">{t('managed.subtitle')}</p>
      </div>

      {/* Owner */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-8 space-y-5">
        <h2 className="text-lg font-semibold text-ink-900">{t('managed.owner')}</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium text-ink-700 mb-1.5">
              {t('managed.firstName')} <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={owner.firstName}
              onChange={e => updateOwner('firstName', e.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.lastName')}</span>
            <input className={inputClass} value={owner.lastName} onChange={e => updateOwner('lastName', e.target.value)} />
          </label>
        </div>

        <div className="max-w-md">
          <span className="block text-sm font-medium text-ink-700 mb-1.5">
            {t('managed.phone')} <span className="text-red-500">*</span>
          </span>
          <PhoneInput value={owner.phoneNumber} onChange={v => updateOwner('phoneNumber', v)} required />
          <p className="text-sm text-ink-400 mt-2">{t('managed.phoneDesc')}</p>
          {owner.phoneNumber && !phoneOk && (
            <p className="text-sm text-amber-600 mt-1">{t('create.photos.phoneInvalid')}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.whatsapp')}</span>
            <PhoneInput value={owner.whatsappNumber} onChange={v => updateOwner('whatsappNumber', v)} />
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.email')}</span>
            <input
              type="email"
              className={inputClass}
              value={owner.email}
              onChange={e => updateOwner('email', e.target.value)}
            />
          </label>
        </div>

        <div className="border-t border-ink-100 pt-5">
          <h3 className="text-sm font-semibold text-ink-900 mb-3">{t('managed.payout')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.payoutPhone')}</span>
              <PhoneInput value={owner.payoutMpesaPhone} onChange={v => updateOwner('payoutMpesaPhone', v)} />
            </div>
            <label className="block">
              <span className="block text-sm font-medium text-ink-700 mb-1.5">{t('managed.payoutName')}</span>
              <input
                className={inputClass}
                value={owner.payoutMpesaName}
                onChange={e => updateOwner('payoutMpesaName', e.target.value)}
              />
            </label>
          </div>
        </div>
      </section>

      {/* Property — the same sections as the self-serve listing form, on one page */}
      <section className="rounded-2xl border border-ink-100 bg-white p-5 sm:p-8 space-y-12">
        <h2 className="text-lg font-semibold text-ink-900">{t('managed.property')}</h2>
        <StepType {...stepProps} />
        <StepCategory {...stepProps} />
        <StepLocation {...stepProps} />
        <StepPricing {...stepProps} />
        <StepPhotosContact {...stepProps} error={null} hideContact />
      </section>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
      )}

      <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-ink-100 -mx-4 sm:mx-0 px-4 py-4 flex justify-end">
        <button
          type="submit"
          disabled={!canSubmit || loading}
          className="btn-primary px-8 py-3 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading ? t('managed.submitting') : t('managed.submit')}
        </button>
      </div>
    </form>
  );
}
