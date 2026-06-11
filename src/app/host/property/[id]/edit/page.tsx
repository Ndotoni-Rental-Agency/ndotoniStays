'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty } from '@/graphql/queries';
import { updateShortTermProperty, publishShortTermProperty } from '@/graphql/mutations';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PhotoIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';
import { HostCalendar } from '@/components/host/HostCalendar';
import { HostPhotos } from '@/components/host/HostPhotos';
import toast from 'react-hot-toast';

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

type Tab = 'details' | 'photos' | 'calendar' | 'settings';

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'details', label: 'Details', icon: HomeModernIcon },
  { id: 'photos', label: 'Photos', icon: PhotoIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
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
  images: string[];
  minimumStay: number;
  maximumStay: number;
  checkInTime: string;
  checkOutTime: string;
  checkInInstructions: string;
  cancellationPolicy: string;
  houseRules: string[];
  instantBookEnabled: boolean;
  status: string;
}

export default function EditPropertyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState('DRAFT');
  const [images, setImages] = useState<string[]>([]);

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
    amenities: [] as string[],
    minimumStay: '1',
    maximumStay: '365',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    checkInInstructions: '',
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
        toast.error('Property not found');
        router.replace('/host');
        return;
      }

      setStatus(p.status);
      setImages(p.images || []);
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
        amenities: p.amenities || [],
        minimumStay: p.minimumStay?.toString() || '1',
        maximumStay: p.maximumStay?.toString() || '365',
        checkInTime: p.checkInTime || '14:00',
        checkOutTime: p.checkOutTime || '11:00',
        checkInInstructions: p.checkInInstructions || '',
        cancellationPolicy: p.cancellationPolicy || 'FLEXIBLE',
        houseRules: (p.houseRules || []).join('\n'),
        instantBookEnabled: p.instantBookEnabled ?? true,
      });
    } catch (err: any) {
      console.error('Failed to fetch property:', err);
      toast.error('Failed to load property');
    } finally {
      setLoading(false);
    }
  }

  function updateField(field: string, value: any) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function toggleAmenity(amenity: string) {
    setForm((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  }

  async function handleSave() {
    setSaving(true);
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
        checkInInstructions: form.checkInInstructions,
        cancellationPolicy: form.cancellationPolicy,
        houseRules: form.houseRules.split('\n').filter((r) => r.trim()),
        instantBookEnabled: form.instantBookEnabled,
      };

      await GraphQLClient.executeAuthenticated(updateShortTermProperty, {
        propertyId,
        input,
      });

      toast.success('Changes saved');
    } catch (err: any) {
      console.error('Error saving property:', err);
      toast.error(err?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setPublishing(true);
    try {
      const data = await GraphQLClient.executeAuthenticated<{
        publishShortTermProperty: { propertyId: string; status: string };
      }>(publishShortTermProperty, { propertyId });

      setStatus(data.publishShortTermProperty?.status || 'AVAILABLE');
      toast.success('Property is now live!');
    } catch (err: any) {
      console.error('Error publishing property:', err);
      toast.error(err?.message || 'Failed to publish. Check all required fields.');
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/host"
            className="p-2 hover:bg-ink-50 rounded-lg transition"
            aria-label="Back to properties"
          >
            <ArrowLeftIcon className="h-5 w-5 text-ink-500" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink-900 truncate max-w-[300px] sm:max-w-none">
              {form.title || 'Untitled Property'}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {status === 'AVAILABLE' ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-100 px-2 py-0.5 rounded-full font-medium">
                  <CheckCircleIcon className="h-3 w-3" />
                  Live
                </span>
              ) : (
                <span className="text-xs text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-medium">
                  Draft
                </span>
              )}
              <span className="text-xs text-ink-400">ID: {propertyId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
        {status === 'DRAFT' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="btn-primary text-sm"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-ink-100 mb-8">
        <nav className="flex gap-1 -mb-px overflow-x-auto" aria-label="Property sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'details' && (
        <div className="space-y-8 max-w-3xl">
          {/* Basic Info */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="input"
                  placeholder="Give your property a catchy name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="input min-h-[140px]"
                  placeholder="What makes your place special? Mention the vibe, nearby attractions, and unique features."
                  rows={6}
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
            </div>
          </section>

          {/* Location */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Location</h2>
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
          </section>

          {/* Pricing */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Pricing</h2>
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
          </section>

          {/* Capacity */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Capacity</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Max guests</label>
                <select
                  value={form.maxGuests}
                  onChange={(e) => updateField('maxGuests', e.target.value)}
                  className="input"
                >
                  {[1, 2, 3, 4, 5, 6, 8, 10, 15, 20, 30, 50].map((n) => (
                    <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Amenities */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Amenities</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {AMENITIES.map((amenity) => (
                <label
                  key={amenity}
                  className={`flex items-center gap-2 rounded-xl border p-3 cursor-pointer transition-all ${
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
                  <span className="text-sm font-medium text-ink-700">{amenity}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Save */}
          <div className="sticky bottom-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-3 px-8 shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'photos' && (
        <div className="max-w-3xl">
          <HostPhotos propertyId={propertyId} initialImages={images} />
        </div>
      )}

      {activeTab === 'calendar' && (
        <HostCalendar propertyId={propertyId} />
      )}

      {activeTab === 'settings' && (
        <div className="space-y-8 max-w-3xl">
          {/* Booking policies */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Booking Policies</h2>
            <div className="space-y-4">
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
                <label className="block text-sm font-medium text-ink-700 mb-1.5">Check-in instructions</label>
                <textarea
                  value={form.checkInInstructions}
                  onChange={(e) => updateField('checkInInstructions', e.target.value)}
                  className="input min-h-[100px]"
                  placeholder="How guests should find and enter the property. E.g. gate code, key location, contact guard."
                  rows={4}
                />
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
            </div>
          </section>

          {/* House rules */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">House Rules</h2>
            <textarea
              value={form.houseRules}
              onChange={(e) => updateField('houseRules', e.target.value)}
              className="input min-h-[120px]"
              placeholder="No smoking indoors&#10;No parties&#10;Quiet hours after 10 PM&#10;Remove shoes at the door"
              rows={5}
            />
            <p className="text-xs text-ink-400 mt-1.5">One rule per line. These are shown to guests before booking.</p>
          </section>

          {/* Instant booking toggle */}
          <section>
            <h2 className="text-lg font-semibold text-ink-900 mb-4">Booking Settings</h2>
            <label className="flex items-center gap-4 p-4 rounded-xl border border-ink-100 hover:border-ink-200 cursor-pointer transition-colors">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={form.instantBookEnabled}
                  onChange={(e) => updateField('instantBookEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-ink-200 peer-focus:ring-4 peer-focus:ring-brand-100 rounded-full peer peer-checked:bg-brand-600 transition-colors" />
                <div className="absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-transform peer-checked:translate-x-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink-800">Instant booking</p>
                <p className="text-xs text-ink-500">Guests book without waiting for your approval. More bookings, less friction.</p>
              </div>
            </label>
          </section>

          {/* Save */}
          <div className="sticky bottom-4 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary py-3 px-8 shadow-lg"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
