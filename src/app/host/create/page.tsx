'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { createShortTermPropertyDraft } from '@/graphql/mutations';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
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

export default function CreatePropertyPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Pre-fill phone from user profile
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
            if (!isAuthenticated) {
              router.replace('/');
            }
            setShowAuthModal(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link href="/host" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-6">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to My Properties
      </Link>

      <div className="bg-white rounded-2xl border border-ink-100 shadow-sm p-6 sm:p-8">
        <h1 className="text-2xl font-bold text-ink-900 mb-1">Add a new property</h1>
        <p className="text-ink-500 mb-6">Start with the basics. You can add more details after.</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Property name</label>
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
            <label className="block text-sm font-medium text-ink-700 mb-2">Property type</label>
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

          {/* Stay Categories */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">What's this space great for?</label>
            <p className="text-xs text-ink-400 mb-2">Select all that apply</p>
            <div className="flex flex-wrap gap-2">
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
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50 text-brand-700 font-medium'
                        : 'border-ink-200 text-ink-600 hover:border-ink-300 hover:bg-ink-50'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Location</label>
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

          {/* Map */}
          {form.region && form.district && (
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-2">Pin location on map</label>
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

          {/* Price + Guests */}
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
                {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-2">Photos</label>
            <ImageUpload
              images={form.images}
              onChange={(imgs) => setForm(prev => ({ ...prev, images: imgs }))}
              maxImages={10}
            />
            <p className="text-xs text-ink-400 mt-1.5">Add at least 1 photo. First photo becomes the cover.</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Your WhatsApp / phone number</label>
            <PhoneInput
              value={form.phoneNumber}
              onChange={(val) => setForm(prev => ({ ...prev, phoneNumber: val }))}
              placeholder="Phone number"
              required
            />
            <p className="text-xs text-ink-400 mt-1">So we can reach you about your listing.</p>
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
            className="btn-primary w-full text-base py-3"
          >
            {loading ? 'Creating...' : 'Create Property'}
          </button>
        </form>
      </div>
    </div>
  );
}
