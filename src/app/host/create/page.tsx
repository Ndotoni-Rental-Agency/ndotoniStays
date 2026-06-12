'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft } from '@/graphql/mutations';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { ImageUpload } from '@/components/media/ImageUpload';
import { PhoneInput } from '@/components/ui/PhoneInput';
import LocationSelector from '@/components/location/LocationSelector';
import LocationMapPicker from '@/components/location/LocationMapPicker';
import { STAY_CATEGORIES } from '@/components/host/constants';
import { AuthModal } from '@/components/auth/AuthModal';

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

const STEPS = [
  { id: 1, label: 'Type & Category' },
  { id: 2, label: 'Location' },
  { id: 3, label: 'Pricing & Details' },
  { id: 4, label: 'Photos & Contact' },
];

export default function CreatePropertyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: '',
    propertyType: '',
    stayCategories: ['NIGHTLY_STAY'] as string[],
    region: 'Dar es Salaam',
    district: '',
    ward: '',
    street: '',
    nightlyRate: '',
    currency: 'TZS',
    maxGuests: '2',
    images: [] as string[],
    phoneNumber: '',
    lat: 0,
    lng: 0,
  });

  useEffect(() => {
    if (user?.phoneNumber && !form.phoneNumber) {
      setForm(prev => ({ ...prev, phoneNumber: user.phoneNumber || '' }));
    }
  }, [user]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function canAdvance(): boolean {
    if (step === 1) return !!form.propertyType && form.stayCategories.length > 0;
    if (step === 2) return !!form.region && !!form.district;
    if (step === 3) return !!form.title && !!form.nightlyRate && parseFloat(form.nightlyRate) > 0;
    return true;
  }

  function nextStep() {
    if (canAdvance() && step < 4) setStep(step + 1);
  }

  function prevStep() {
    if (step > 1) setStep(step - 1);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await GraphQLClient.executeAuthenticated<{
        createShortTermPropertyDraft: { propertyId: string; success: boolean; message: string };
      }>(createShortTermPropertyDraft, {
        input: {
          title: form.title,
          propertyType: form.propertyType,
          stayCategories: form.stayCategories,
          region: form.region,
          district: form.district || form.region,
          nightlyRate: parseFloat(form.nightlyRate),
          currency: form.currency,
          maxGuests: parseInt(form.maxGuests),
          images: form.images.length > 0 ? form.images : undefined,
          guestPhoneNumber: form.phoneNumber || undefined,
          guestWhatsappNumber: form.phoneNumber || undefined,
        },
      });

      const propertyId = data.createShortTermPropertyDraft?.propertyId;
      if (propertyId) {
        router.push(`/host/property/${propertyId}/edit`);
      } else {
        setError('Property created but no ID returned. Check your properties list.');
        router.push('/host');
      }
    } catch (err: any) {
      console.error('Error creating property:', err);
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => {
            if (!isAuthenticated) router.replace('/');
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-ink-50/50">
      {/* Top bar — fixed on mobile */}
      <div className="sticky top-0 z-10 bg-white border-b border-ink-100 px-4 sm:px-6 py-3">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Link href="/host" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700">
            <ArrowLeftIcon className="h-4 w-4" />
            <span className="hidden sm:inline">My Properties</span>
          </Link>

          {/* Step indicator — compact on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <button
                  type="button"
                  onClick={() => { if (s.id < step || canAdvance()) setStep(s.id); }}
                  className="flex items-center gap-1.5"
                >
                  <span
                    className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-[10px] sm:text-xs font-bold transition-all ${
                      s.id === step
                        ? 'bg-brand-600 text-white ring-2 ring-brand-200'
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
                    {s.label}
                  </span>
                </button>
                {i < STEPS.length - 1 && (
                  <div className={`w-4 sm:w-8 h-0.5 mx-1 rounded ${s.id < step ? 'bg-green-300' : 'bg-ink-100'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-xs text-ink-400 hidden sm:block">
            Step {step} of 4
          </div>
        </div>
      </div>

      {/* Main content — full width on mobile, centered on desktop */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <form onSubmit={handleSubmit}>
          {/* Step content card */}
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-ink-100 shadow-sm overflow-hidden">
            <div className="p-5 sm:p-8 lg:p-10">

              {/* Step 1: Property Type & Categories */}
              {step === 1 && (
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
              )}

              {/* Step 2: Location */}
              {step === 2 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Where is your property?</h2>
                    <p className="text-sm sm:text-base text-ink-500 mb-6">Help guests find you by adding your location</p>
                    <div className="max-w-xl">
                      <LocationSelector
                        value={{
                          region: form.region,
                          district: form.district,
                          ward: form.ward,
                          street: form.street,
                        }}
                        onChange={(loc) =>
                          setForm((prev) => ({
                            ...prev,
                            region: loc.region,
                            district: loc.district,
                            ward: loc.ward || '',
                            street: loc.street || '',
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  {form.region && form.district && (
                    <div className="border-t border-ink-100 pt-8">
                      <h3 className="text-base sm:text-lg font-semibold text-ink-900 mb-1">Pin exact location</h3>
                      <p className="text-sm text-ink-500 mb-4">Optional — makes your listing more discoverable on the map</p>
                      <LocationMapPicker
                        location={{
                          region: form.region,
                          district: form.district,
                          ward: form.ward,
                          street: form.street,
                        }}
                        onChange={(coords) =>
                          setForm((prev) => ({ ...prev, lat: coords.lat, lng: coords.lng }))
                        }
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Title, Pricing & Capacity */}
              {step === 3 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Name and price your space</h2>
                    <p className="text-sm sm:text-base text-ink-500 mb-6">A good title and fair price attract more bookings</p>
                  </div>

                  <div className="max-w-2xl space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-ink-700 mb-2">Property name</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => updateField('title', e.target.value)}
                        placeholder="e.g. Cozy Beach Apartment in Msasani"
                        className="input text-base sm:text-lg py-3.5"
                        required
                      />
                      <p className="text-xs sm:text-sm text-ink-400 mt-2">Tip: mention the area and what makes it special</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-ink-700 mb-2">Price per night</label>
                        <div className="flex gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 text-sm font-semibold">
                              {form.currency === 'TZS' ? 'TZS' : '$'}
                            </span>
                            <input
                              type="number"
                              value={form.nightlyRate}
                              onChange={(e) => updateField('nightlyRate', e.target.value)}
                              placeholder={form.currency === 'TZS' ? '50000' : '25'}
                              className="input pl-12 text-lg font-semibold py-3.5"
                              required
                              min="1"
                            />
                          </div>
                          <select
                            value={form.currency}
                            onChange={(e) => updateField('currency', e.target.value)}
                            className="input w-20 sm:w-24 py-3.5"
                          >
                            <option value="TZS">TZS</option>
                            <option value="USD">USD</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-ink-700 mb-2">Max guests</label>
                        <select
                          value={form.maxGuests}
                          onChange={(e) => updateField('maxGuests', e.target.value)}
                          className="input text-base py-3.5 w-full"
                        >
                          {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                            <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Photos & Contact */}
              {step === 4 && (
                <div className="space-y-8">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-ink-900 mb-2">Add photos and your contact</h2>
                    <p className="text-sm sm:text-base text-ink-500">Listings with photos get 5x more bookings</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-3">Photos</label>
                    <ImageUpload
                      images={form.images}
                      onChange={(imgs) => setForm(prev => ({ ...prev, images: imgs }))}
                      maxImages={10}
                    />
                    <p className="text-sm text-ink-400 mt-3">Add at least 1 photo. First photo becomes the cover. You can add more later.</p>
                  </div>

                  <div className="border-t border-ink-100 pt-8 max-w-md">
                    <label className="block text-sm font-medium text-ink-700 mb-2">Your WhatsApp / phone number</label>
                    <PhoneInput
                      value={form.phoneNumber}
                      onChange={(val) => setForm(prev => ({ ...prev, phoneNumber: val }))}
                      placeholder="Phone number"
                      required
                    />
                    <p className="text-sm text-ink-400 mt-2">So guests and our team can reach you about bookings</p>
                  </div>

                  {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Navigation — sticky bottom on mobile */}
          <div className="sticky bottom-0 bg-white/90 backdrop-blur-sm border-t border-ink-100 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-0 sm:border-0 sm:bg-transparent sm:mt-6 sm:static">
            <div className="flex items-center justify-between max-w-5xl mx-auto">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center gap-2 text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors py-3 px-4 -ml-4 rounded-xl hover:bg-ink-50"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
              ) : (
                <div />
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={!canAdvance()}
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-8 py-3 text-sm sm:text-base disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading || !form.propertyType || !form.title || !form.nightlyRate}
                  className="btn-primary inline-flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-3.5 text-sm sm:text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-5 w-5" />
                      Create Property
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
