'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/graphql/queries';
import { updateShortTermProperty, publishShortTermProperty } from '@/graphql/mutations';
import { ArrowLeftIcon, ChevronDownIcon, ChevronUpIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

const AMENITIES = [
  'WiFi', 'Air Conditioning', 'Pool', 'Kitchen', 'Parking', 'Hot Water',
  'TV', 'Washing Machine', 'Generator', 'Security', 'Garden', 'Beach Access',
  'BBQ', 'Gym', 'Balcony', 'Elevator', 'Workspace', 'Sound System',
  'Breakfast', 'Restaurant',
];

interface PropertyData {
  propertyId: string;
  title: string;
  description: string;
  propertyType: string;
  address: {
    street: string;
    city: string;
    region: string;
    district: string;
    country: string;
  } | null;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  cleaningFee: number;
  maxGuests: number;
  amenities: string[];
  minimumStay: number;
  maximumStay: number;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  houseRules: string[];
  instantBookEnabled: boolean;
  status: string;
}

function CollapsibleSection({ title, defaultOpen = false, children }: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-ink-100 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 bg-ink-50/50 hover:bg-ink-50 transition-colors"
      >
        <span className="text-sm font-semibold text-ink-800">{title}</span>
        {open ? <ChevronUpIcon className="h-4 w-4 text-ink-400" /> : <ChevronDownIcon className="h-4 w-4 text-ink-400" />}
      </button>
      {open && <div className="px-5 py-5 space-y-4">{children}</div>}
    </div>
  );
}

export default function EditPropertyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [status, setStatus] = useState('DRAFT');

  const [form, setForm] = useState({
    title: '',
    description: '',
    propertyType: '',
    region: '',
    district: '',
    street: '',
    city: '',
    nightlyRate: '',
    currency: 'TZS',
    cleaningFee: '',
    maxGuests: '2',
    bedrooms: '1',
    bathrooms: '1',
    amenities: [] as string[],
    minimumStay: '1',
    maximumStay: '365',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    cancellationPolicy: 'FLEXIBLE',
    houseRules: '',
    instantBookEnabled: true,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      fetchProperty();
    }
  }, [isAuthenticated, propertyId]);

  async function fetchProperty() {
    try {
      setLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{
        getShortTermProperty: PropertyData;
      }>(getShortTermProperty, { propertyId });

      const p = data.getShortTermProperty;
      if (!p) {
        setError('Property not found.');
        return;
      }

      setStatus(p.status);
      setForm({
        title: p.title || '',
        description: p.description || '',
        propertyType: p.propertyType || '',
        region: p.region || p.address?.region || '',
        district: p.district || p.address?.district || '',
        street: p.address?.street || '',
        city: p.address?.city || '',
        nightlyRate: p.nightlyRate?.toString() || '',
        currency: p.currency || 'TZS',
        cleaningFee: p.cleaningFee?.toString() || '',
        maxGuests: p.maxGuests?.toString() || '2',
        bedrooms: '1',
        bathrooms: '1',
        amenities: p.amenities || [],
        minimumStay: p.minimumStay?.toString() || '1',
        maximumStay: p.maximumStay?.toString() || '365',
        checkInTime: p.checkInTime || '14:00',
        checkOutTime: p.checkOutTime || '11:00',
        cancellationPolicy: p.cancellationPolicy || 'FLEXIBLE',
        houseRules: (p.houseRules || []).join('\n'),
        instantBookEnabled: p.instantBookEnabled ?? true,
      });
    } catch (err: any) {
      console.error('Failed to fetch property:', err);
      setError('Failed to load property details.');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSuccess(null);
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
    setSuccess(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const input: Record<string, any> = {
        title: form.title,
        description: form.description,
        propertyType: form.propertyType,
        region: form.region,
        district: form.district,
        address: {
          street: form.street,
          city: form.city,
          region: form.region,
          district: form.district,
          country: 'Tanzania',
        },
        nightlyRate: parseFloat(form.nightlyRate) || 0,
        currency: form.currency,
        cleaningFee: parseFloat(form.cleaningFee) || 0,
        maxGuests: parseInt(form.maxGuests) || 2,
        amenities: form.amenities,
        minimumStay: parseInt(form.minimumStay) || 1,
        maximumStay: parseInt(form.maximumStay) || 365,
        checkInTime: form.checkInTime,
        checkOutTime: form.checkOutTime,
        cancellationPolicy: form.cancellationPolicy,
        houseRules: form.houseRules.split('\n').filter((r) => r.trim()),
        instantBookEnabled: form.instantBookEnabled,
      };

      await GraphQLClient.executeAuthenticated(updateShortTermProperty, {
        propertyId,
        input,
      });

      setSuccess('Changes saved successfully.');
    } catch (err: any) {
      console.error('Error saving property:', err);
      setError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    if (!confirm('Publish this property? It will become visible to guests.')) return;

    setPublishing(true);
    setError(null);

    try {
      const data = await GraphQLClient.executeAuthenticated<{
        publishShortTermProperty: { propertyId: string; status: string };
      }>(publishShortTermProperty, { propertyId });

      setStatus(data.publishShortTermProperty?.status || 'AVAILABLE');
      setSuccess('Property published! It\'s now live for guests.');
    } catch (err: any) {
      console.error('Error publishing property:', err);
      setError(err?.message || 'Failed to publish. Make sure all required fields are filled.');
    } finally {
      setPublishing(false);
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading property...</div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Back link */}
      <Link href="/host" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-6">
        <ArrowLeftIcon className="h-4 w-4" />
        Back to My Properties
      </Link>

      {/* Title + Status */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Edit Property</h1>
        <div className="flex items-center gap-3">
          {status === 'DRAFT' && (
            <button
              onClick={handlePublish}
              disabled={publishing}
              className="btn-primary text-sm"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
          {status === 'AVAILABLE' && (
            <span className="inline-flex items-center gap-1 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full font-medium">
              <CheckCircleIcon className="h-4 w-4" />
              Live
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-5">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-sm text-green-700 mb-5">
          {success}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-4">
        {/* Basic Info */}
        <CollapsibleSection title="Basic Info" defaultOpen>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => updateField('title', e.target.value)}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => updateField('description', e.target.value)}
              className="input min-h-[120px]"
              placeholder="Describe your property — what makes it special?"
              rows={5}
            />
          </div>
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
          </div>
        </CollapsibleSection>

        {/* Location */}
        <CollapsibleSection title="Location">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Region</label>
              <select
                value={form.region}
                onChange={(e) => updateField('region', e.target.value)}
                className="input"
              >
                <option value="">Select region</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">District / Area</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => updateField('district', e.target.value)}
                placeholder="e.g. Msasani, Mikocheni"
                className="input"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Street address</label>
              <input
                type="text"
                value={form.street}
                onChange={(e) => updateField('street', e.target.value)}
                placeholder="Street name and number"
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField('city', e.target.value)}
                placeholder="City name"
                className="input"
              />
            </div>
          </div>
        </CollapsibleSection>

        {/* Pricing */}
        <CollapsibleSection title="Pricing">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Nightly rate</label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                    {form.currency === 'TZS' ? 'TZS' : '$'}
                  </span>
                  <input
                    type="number"
                    value={form.nightlyRate}
                    onChange={(e) => updateField('nightlyRate', e.target.value)}
                    className="input pl-12"
                    min="0"
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
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Cleaning fee</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-400 text-sm">
                  {form.currency === 'TZS' ? 'TZS' : '$'}
                </span>
                <input
                  type="number"
                  value={form.cleaningFee}
                  onChange={(e) => updateField('cleaningFee', e.target.value)}
                  className="input pl-12"
                  min="0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        </CollapsibleSection>

        {/* Capacity */}
        <CollapsibleSection title="Capacity">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Bedrooms</label>
              <select
                value={form.bedrooms}
                onChange={(e) => updateField('bedrooms', e.target.value)}
                className="input"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Bathrooms</label>
              <select
                value={form.bathrooms}
                onChange={(e) => updateField('bathrooms', e.target.value)}
                className="input"
              >
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
        </CollapsibleSection>

        {/* Amenities */}
        <CollapsibleSection title="Amenities">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {AMENITIES.map((amenity) => (
              <label
                key={amenity}
                className={`flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer transition-all ${
                  form.amenities.includes(amenity)
                    ? 'border-brand-500 bg-brand-50'
                    : 'border-ink-100 hover:border-ink-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={form.amenities.includes(amenity)}
                  onChange={() => toggleAmenity(amenity)}
                  className="h-4 w-4 rounded border-ink-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-xs font-medium text-ink-700">{amenity}</span>
              </label>
            ))}
          </div>
        </CollapsibleSection>

        {/* Policies */}
        <CollapsibleSection title="Policies">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Minimum stay (nights)</label>
              <input
                type="number"
                value={form.minimumStay}
                onChange={(e) => updateField('minimumStay', e.target.value)}
                className="input"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Maximum stay (nights)</label>
              <input
                type="number"
                value={form.maximumStay}
                onChange={(e) => updateField('maximumStay', e.target.value)}
                className="input"
                min="1"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-in time</label>
              <input
                type="time"
                value={form.checkInTime}
                onChange={(e) => updateField('checkInTime', e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-out time</label>
              <input
                type="time"
                value={form.checkOutTime}
                onChange={(e) => updateField('checkOutTime', e.target.value)}
                className="input"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">Cancellation policy</label>
            <select
              value={form.cancellationPolicy}
              onChange={(e) => updateField('cancellationPolicy', e.target.value)}
              className="input"
            >
              <option value="FLEXIBLE">Flexible — Full refund up to 24h before check-in</option>
              <option value="MODERATE">Moderate — Full refund up to 5 days before</option>
              <option value="STRICT">Strict — 50% refund up to 7 days before</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1.5">House rules (one per line)</label>
            <textarea
              value={form.houseRules}
              onChange={(e) => updateField('houseRules', e.target.value)}
              className="input min-h-[100px]"
              placeholder="No smoking indoors&#10;No parties&#10;Quiet hours after 10 PM"
              rows={4}
            />
          </div>
        </CollapsibleSection>

        {/* Settings */}
        <CollapsibleSection title="Settings">
          <label className="flex items-center gap-3 cursor-pointer">
            <div className="relative">
              <input
                type="checkbox"
                checked={form.instantBookEnabled}
                onChange={(e) => updateField('instantBookEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-ink-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:bg-brand-600 transition-colors"></div>
              <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform peer-checked:translate-x-5"></div>
            </div>
            <div>
              <p className="text-sm font-medium text-ink-800">Instant booking</p>
              <p className="text-xs text-ink-500">Guests can book without waiting for your approval</p>
            </div>
          </label>
        </CollapsibleSection>

        {/* Save button */}
        <div className="flex items-center gap-3 pt-4">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex-1 py-3"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          {status === 'DRAFT' && (
            <button
              type="button"
              onClick={handlePublish}
              disabled={publishing}
              className="btn-secondary py-3 px-6"
            >
              {publishing ? 'Publishing...' : 'Publish'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
