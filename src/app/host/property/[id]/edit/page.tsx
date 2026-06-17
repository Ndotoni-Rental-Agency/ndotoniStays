'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty, listMyShortTermProperties } from '@/graphql/queries';
import { updateShortTermProperty, publishShortTermProperty, deactivateShortTermProperty } from '@/graphql/mutations';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  PhotoIcon,
  CalendarDaysIcon,
  Cog6ToothIcon,
  HomeModernIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import { HostCalendar } from '@/components/host/HostCalendar';
import { HostPhotos } from '@/components/host/HostPhotos';
import { HostDetailsTab } from '@/components/host/HostDetailsTab';
import { HostSettingsTab } from '@/components/host/HostSettingsTab';
import { HostCheckInTab } from '@/components/host/HostCheckInTab';
import { PropertyFormData, PropertyData, EMPTY_CHECKIN_INSTRUCTIONS } from '@/components/host/types';
import toast from 'react-hot-toast';

type Tab = 'details' | 'photos' | 'calendar' | 'checkin' | 'settings';

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: 'details', label: 'Details', icon: HomeModernIcon },
  { id: 'photos', label: 'Photos', icon: PhotoIcon },
  { id: 'calendar', label: 'Calendar', icon: CalendarDaysIcon },
  { id: 'checkin', label: 'Check-In', icon: KeyIcon },
  { id: 'settings', label: 'Settings', icon: Cog6ToothIcon },
];

export default function EditPropertyPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    // Check if navigated from dashboard with a specific tab intent
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('host-edit-tab') as Tab | null;
      if (stored && ['details', 'photos', 'calendar', 'checkin', 'settings'].includes(stored)) {
        sessionStorage.removeItem('host-edit-tab');
        return stored;
      }
    }
    return 'details';
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [status, setStatus] = useState('DRAFT');
  const [images, setImages] = useState<string[]>([]);
  const [siblingInstructions, setSiblingInstructions] = useState<Array<{ title: string; instructions: any }>>([]);

  const [form, setForm] = useState<PropertyFormData>({
    title: '',
    description: '',
    propertyType: '',
    stayCategories: ['NIGHTLY_STAY'],
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
    amenities: [],
    minimumStay: '1',
    maximumStay: '365',
    checkInTime: '14:00',
    checkOutTime: '11:00',
    checkInInstructions: EMPTY_CHECKIN_INSTRUCTIONS,
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
        stayCategories: p.stayCategories || ['NIGHTLY_STAY'],
        region: p.region || p.address?.region || '',
        district: p.district || p.address?.district || '',
        street: p.address?.street || '',
        city: p.address?.city || '',
        nightlyRate: p.nightlyRate?.toString() || '',
        currency: p.currency || 'TZS',
        cleaningFee: p.cleaningFee?.toString() || '',
        maxGuests: p.maxGuests?.toString() || '2',
        bedrooms: p.bedrooms?.toString() || '1',
        bathrooms: p.bathrooms?.toString() || '1',
        amenities: p.amenities || [],
        minimumStay: p.minimumStay?.toString() || '1',
        maximumStay: p.maximumStay?.toString() || '365',
        checkInTime: p.checkInTime || '14:00',
        checkOutTime: p.checkOutTime || '11:00',
        checkInInstructions: p.checkInInstructions
          ? {
              wifiName: p.checkInInstructions.wifiName || '',
              wifiPassword: p.checkInInstructions.wifiPassword || '',
              accessCode: p.checkInInstructions.accessCode || '',
              directions: p.checkInInstructions.directions || '',
              parkingInfo: p.checkInInstructions.parkingInfo || '',
              contactPhone: p.checkInInstructions.contactPhone || '',
              contactName: p.checkInInstructions.contactName || '',
              additionalNotes: p.checkInInstructions.additionalNotes || '',
              houseRules: p.checkInInstructions.houseRules || [],
            }
          : EMPTY_CHECKIN_INSTRUCTIONS,
        cancellationPolicy: p.cancellationPolicy || 'FLEXIBLE',
        houseRules: (p.houseRules || []).join('\n'),
        instantBookEnabled: p.instantBookEnabled ?? true,
      });
      // Fetch sibling properties for AI context
      try {
        const siblingData = await GraphQLClient.executeAuthenticated<{
          listMyShortTermProperties: { properties: Array<{ propertyId: string; title: string; checkInInstructions: any }> };
        }>(listMyShortTermProperties, { limit: 10 });

        const siblings = (siblingData.listMyShortTermProperties?.properties || [])
          .filter((p) => p.propertyId !== propertyId && p.checkInInstructions)
          .map((p) => ({ title: p.title, instructions: p.checkInInstructions }));
        setSiblingInstructions(siblings);
      } catch {
        // Non-critical — AI just won't have examples
      }
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
        stayCategories: form.stayCategories,
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
        bedrooms: parseInt(form.bedrooms) || 1,
        bathrooms: parseInt(form.bathrooms) || 1,
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

  async function handleDelete() {
    try {
      await GraphQLClient.executeAuthenticated(deactivateShortTermProperty, { propertyId });
      toast.success('Property deleted');
      router.replace('/host');
    } catch (err: any) {
      console.error('Error deleting property:', err);
      toast.error(err?.message || 'Failed to delete property');
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
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-12 pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/host"
            className="p-2 -ml-2 hover:bg-ink-50 rounded-lg transition shrink-0"
            aria-label="Back to properties"
          >
            <ArrowLeftIcon className="h-5 w-5 text-ink-500" />
          </Link>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-ink-900 truncate">
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
              <span className="text-xs text-ink-400 hidden sm:inline">ID: {propertyId.slice(0, 8)}</span>
            </div>
          </div>
        </div>
        {status === 'DRAFT' && (
          <button
            onClick={handlePublish}
            disabled={publishing}
            className="btn-primary text-sm shrink-0"
          >
            {publishing ? 'Publishing...' : 'Publish'}
          </button>
        )}
      </div>

      {/* Tabs — scrollable on mobile, no visible scrollbar */}
      <div className="border-b border-ink-100 mb-6 sm:mb-8">
        <nav
          className="flex -mb-px overflow-x-auto no-scrollbar gap-1"
          aria-label="Property sections"
        >
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-700 hover:border-ink-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'details' && (
        <HostDetailsTab
          form={form}
          onUpdate={updateField}
          onToggleAmenity={toggleAmenity}
          onSave={handleSave}
          saving={saving}
        />
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
        <HostSettingsTab
          form={form}
          onUpdate={updateField}
          onSave={handleSave}
          saving={saving}
          propertyId={propertyId}
          onDelete={handleDelete}
        />
      )}

      {activeTab === 'checkin' && (
        <HostCheckInTab
          form={form}
          onUpdate={updateField}
          onSave={handleSave}
          saving={saving}
          otherPropertyInstructions={siblingInstructions}
        />
      )}
    </div>
  );
}
