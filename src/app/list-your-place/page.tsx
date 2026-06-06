'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft } from '@/graphql/mutations';
import { getWhatsAppUrl } from '@/lib/utils';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { CheckCircleIcon, CurrencyDollarIcon, PhotoIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';

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
];

const REGIONS = [
  'Dar es Salaam', 'Arusha', 'Dodoma', 'Mwanza', 'Zanzibar',
  'Mbeya', 'Morogoro', 'Tanga', 'Kilimanjaro', 'Iringa',
];

const BENEFITS = [
  { icon: CurrencyDollarIcon, title: 'Earn daily', description: 'Get paid for every night booked' },
  { icon: BoltIcon, title: 'Instant bookings', description: 'Guests book and pay immediately' },
  { icon: ShieldCheckIcon, title: 'We verify guests', description: 'Only verified users can book' },
  { icon: PhotoIcon, title: 'We help with photos', description: 'Our team can take professional shots' },
];

export default function ListYourPlacePage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    propertyType: '',
    region: 'Dar es Salaam',
    district: '',
    nightlyRate: '',
    currency: 'TZS',
    maxGuests: '2',
    guestPhoneNumber: '',
  });

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await GraphQLClient.execute(createShortTermPropertyDraft, {
        input: {
          title: form.title,
          propertyType: form.propertyType,
          region: form.region,
          district: form.district || form.region,
          nightlyRate: parseFloat(form.nightlyRate),
          currency: form.currency,
          maxGuests: parseInt(form.maxGuests),
          guestPhoneNumber: form.guestPhoneNumber,
          guestWhatsappNumber: form.guestPhoneNumber,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Error creating listing:', err);
      setError('Something went wrong. Try again or message us on WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-brand-50 mb-6">
            <CheckCircleIcon className="h-10 w-10 text-brand-600" />
          </div>
          <h1 className="text-3xl font-bold text-ink-900 mb-3">You&apos;re in!</h1>
          <p className="text-ink-500 text-lg mb-8">
            We&apos;ll reach out on WhatsApp to get photos and finalize your listing.
            Most places go live within 24 hours.
          </p>
          <a
            href={getWhatsAppUrl(`Hi, I just listed my property "${form.title}" on ndotoni Stays. I'd like to complete my listing.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-base px-8 py-4"
          >
            Complete on WhatsApp →
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-600 to-brand-800 text-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 py-14 sm:py-18 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            Turn your space into income
          </h1>
          <p className="mt-3 text-brand-100 text-lg max-w-xl mx-auto">
            List your apartment, villa, or event space. Guests find you, book instantly,
            and you get paid. Takes 2 minutes.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {BENEFITS.map((b) => (
              <div key={b.title} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <b.icon className="h-5 w-5 text-brand-200 mb-1.5 mx-auto" />
                <p className="text-xs font-semibold text-white">{b.title}</p>
                <p className="text-[11px] text-brand-200 mt-0.5">{b.description}</p>
              </div>
            ))}
          </div>
          <a
            href="#listing-form"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors shadow-lg"
          >
            Get Started
            <svg className="h-4 w-4 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </a>
        </div>
      </section>

      {/* Form */}
      <section id="listing-form" className="mx-auto max-w-2xl px-4 sm:px-6 py-10 sm:py-14 -mt-6 scroll-mt-20">
        <div className="bg-white rounded-2xl border border-ink-100 shadow-xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property name */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">
                What do you call your place?
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Cozy Beach Apartment in Msasani"
                className="input"
                required
              />
            </div>

            {/* Property type — visual grid */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">
                What type of space?
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => updateField('propertyType', t.value)}
                    className={`flex flex-col items-center gap-1 rounded-xl border-2 p-3 transition-all ${
                      form.propertyType === t.value
                        ? 'border-brand-500 bg-brand-50 shadow-sm'
                        : 'border-ink-100 hover:border-ink-200 hover:bg-ink-50'
                    }`}
                  >
                    <span className="text-xl">{t.icon}</span>
                    <span className="text-[11px] font-medium text-ink-700">{t.label}</span>
                  </button>
                ))}
              </div>
              {!form.propertyType && (
                <input type="text" required value={form.propertyType} className="sr-only" onChange={() => {}} tabIndex={-1} />
              )}
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Region</label>
                <select
                  value={form.region}
                  onChange={(e) => updateField('region', e.target.value)}
                  className="input"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Area / Neighborhood</label>
                <input
                  type="text"
                  value={form.district}
                  onChange={(e) => updateField('district', e.target.value)}
                  placeholder="e.g. Msasani, Mikocheni"
                  className="input"
                />
              </div>
            </div>

            {/* Price + Guests row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Price per night</label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                      {form.currency === 'TZS' ? 'TZS' : '$'}
                    </span>
                    <input
                      type="number"
                      value={form.nightlyRate}
                      onChange={(e) => updateField('nightlyRate', e.target.value)}
                      placeholder={form.currency === 'TZS' ? '50000' : '25'}
                      className="input pl-12"
                      required
                      min="1"
                    />
                  </div>
                  <select
                    value={form.currency}
                    onChange={(e) => updateField('currency', e.target.value)}
                    className="input w-24"
                  >
                    <option value="TZS">TZS</option>
                    <option value="USD">USD</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Max guests</label>
                <select
                  value={form.maxGuests}
                  onChange={(e) => updateField('maxGuests', e.target.value)}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Your phone number</label>
              <PhoneInput
                value={form.guestPhoneNumber}
                onChange={(val) => updateField('guestPhoneNumber', val)}
                placeholder="Phone number"
                required
              />
              <p className="text-xs text-ink-400 mt-1.5">We&apos;ll WhatsApp you to finalize.</p>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !form.propertyType}
              className="btn-primary w-full text-base py-4"
            >
              {loading ? 'Submitting...' : 'List My Place — Free'}
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
