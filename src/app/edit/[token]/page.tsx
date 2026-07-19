'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { HostDetailsTab } from '@/components/host/HostDetailsTab';
import { HostSettingsTab } from '@/components/host/HostSettingsTab';
import { HostCheckInTab } from '@/components/host/HostCheckInTab';
import { MediaGrid } from '@/components/media/MediaGrid';
import { PropertyFormData, EMPTY_CHECKIN_INSTRUCTIONS } from '@/components/host/types';
import { ShortTermProperty } from '@/API';
import {
  HomeModernIcon,
  PhotoIcon,
  Cog6ToothIcon,
  KeyIcon,
} from '@heroicons/react/24/outline';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_WHATSAPP_API_URL || '';

type Tab = 'details' | 'photos' | 'checkin' | 'settings';

const TABS: Array<{ id: Tab; label: string; labelSw: string; icon: React.ElementType }> = [
  { id: 'details', label: 'Details', labelSw: 'Maelezo', icon: HomeModernIcon },
  { id: 'photos', label: 'Photos', labelSw: 'Picha', icon: PhotoIcon },
  { id: 'checkin', label: 'Check-In', labelSw: 'Check-In', icon: KeyIcon },
  { id: 'settings', label: 'Settings', labelSw: 'Mipangilio', icon: Cog6ToothIcon },
];

export default function TokenEditPage() {
  const params = useParams();
  const token = params?.token as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<ShortTermProperty[]>([]);
  const [editingProperty, setEditingProperty] = useState<ShortTermProperty | null>(null);
  const [expiresAt, setExpiresAt] = useState<number>(0);

  useEffect(() => {
    if (!token) return;
    console.log('[EditToken] Fetching token:', token);
    console.log('[EditToken] API URL:', `${API_BASE}/edit-token/${token}`);
    fetch(`${API_BASE}/edit-token/${token}`)
      .then(async (res) => {
        const body = await res.json().catch(() => ({}));
        console.log('[EditToken] Response status:', res.status);
        console.log('[EditToken] Response body:', JSON.stringify(body, null, 2));
        if (!res.ok) throw new Error(body.error || 'Kiungo hakipatikani au kimeisha');
        return body;
      })
      .then((d) => {
        setProperties(d.properties || []);
        setExpiresAt(d.expiresAt);
        // Auto-select if only one property
        if (d.properties?.length === 1) {
          setEditingProperty(d.properties[0]);
        }
      })
      .catch((e) => {
        console.error('[EditToken] Error:', e.message);
        setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader />;
  if (error) return <ErrorState message={error} />;

  const expiryText = expiresAt ? `Kiungo kitaisha: ${new Date(expiresAt).toLocaleString('sw-TZ')}` : '';

  if (editingProperty) {
    return (
      <>
        <Toaster position="top-center" />
        <PropertyEditorFull
          property={editingProperty}
          token={token}
          expiryText={expiryText}
          onBack={properties.length > 1 ? () => setEditingProperty(null) : undefined}
        />
      </>
    );
  }

  // Property list
  return (
    <>
      <Toaster position="top-center" />
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🏡</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Nyumba Zako</h1>
            <p className="text-sm text-gray-500 mt-1">Chagua nyumba unayotaka kuhariri</p>
            {expiryText && <p className="text-xs text-gray-400 mt-1">{expiryText}</p>}
          </div>

          {properties.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Hakuna nyumba zilizopatikana.</div>
          ) : (
            <div className="space-y-3">
              {properties.map((prop) => (
                <div key={prop.propertyId} className="bg-white rounded-2xl border border-stone-200 p-3 flex items-center gap-3 shadow-sm">
                  {prop.images?.[0] ? (
                    <img src={prop.images[0]} alt={prop.title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-stone-100 flex items-center justify-center flex-shrink-0 text-2xl">🏠</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate text-sm">{prop.title}</p>
                    <p className="text-xs text-gray-500 truncate">{prop.district}, {prop.region}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        prop.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>{prop.status === 'AVAILABLE' ? 'INAPATIKANA' : prop.status}</span>
                      <span className="text-[11px] text-gray-400">{prop.currency} {prop.nightlyRate?.toLocaleString()}/usiku</span>
                    </div>
                  </div>
                  <button onClick={() => setEditingProperty(prop)}
                    className="flex-shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors">
                    Hariri
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}


// ── Full Property Editor (mirrors host edit page) ──────────────────────────
function PropertyEditorFull({
  property,
  token,
  expiryText,
  onBack,
}: {
  property: ShortTermProperty;
  token: string;
  expiryText: string;
  onBack?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>(property.images || []);
  const [videos, setVideos] = useState<string[]>(property.videos || []);
  const [hasMediaChanges, setHasMediaChanges] = useState(false);

  const [form, setForm] = useState<PropertyFormData>({
    title: property.title || '',
    description: property.description || '',
    propertyType: property.propertyType || '',
    stayCategories: property.stayCategories || ['NIGHTLY_STAY'],
    region: property.region || property.address?.region || '',
    district: property.district || property.address?.district || '',
    street: property.address?.street || '',
    city: property.address?.city || '',
    googleMapsUrl: property.googleMapsUrl || '',
    nightlyRate: property.nightlyRate?.toString() || '',
    currency: property.currency || 'TZS',
    cleaningFee: property.cleaningFee?.toString() || '',
    maxGuests: property.maxGuests?.toString() || '2',
    bedrooms: property.bedrooms?.toString() || '1',
    bathrooms: property.bathrooms?.toString() || '1',
    amenities: property.amenities || [],
    minimumStay: property.minimumStay?.toString() || '1',
    maximumStay: property.maximumStay?.toString() || '365',
    checkInTime: property.checkInTime || '14:00',
    checkOutTime: property.checkOutTime || '11:00',
    checkInInstructions: property.checkInInstructions
      ? {
          wifiName: property.checkInInstructions.wifiName || '',
          wifiPassword: property.checkInInstructions.wifiPassword || '',
          accessCode: property.checkInInstructions.accessCode || '',
          directions: property.checkInInstructions.directions || '',
          parkingInfo: property.checkInInstructions.parkingInfo || '',
          contactPhone: property.checkInInstructions.contactPhone || '',
          contactName: property.checkInInstructions.contactName || '',
          additionalNotes: property.checkInInstructions.additionalNotes || '',
          houseRules: property.checkInInstructions.houseRules || [],
        }
      : EMPTY_CHECKIN_INSTRUCTIONS,
    cancellationPolicy: property.cancellationPolicy || 'FLEXIBLE',
    houseRules: (property.houseRules || []).join('\n'),
    instantBookEnabled: property.instantBookEnabled ?? true,
  });

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

  async function saveViaToken(updates: Record<string, any>) {
    const res = await fetch(`${API_BASE}/edit-token/${token}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ propertyId: property.propertyId, ...updates }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save');
    }
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

      await saveViaToken(input);
      toast.success('Imehifadhiwa!');
    } catch (err: any) {
      toast.error(err?.message || 'Imeshindikana kuhifadhi');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveMedia() {
    setSaving(true);
    try {
      await saveViaToken({ images, videos, thumbnail: images[0] || '' });
      toast.success('Picha zimehifadhiwa!');
      setHasMediaChanges(false);
    } catch (err: any) {
      toast.error(err?.message || 'Imeshindikana kuhifadhi picha');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      await saveViaToken({ status: 'INACTIVE' });
      toast.success('Nyumba imefutwa');
      if (onBack) onBack();
    } catch (err: any) {
      toast.error(err?.message || 'Imeshindikana kufuta');
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6 sm:py-12 pb-24 sm:pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBack && (
            <button onClick={onBack} className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition shrink-0" aria-label="Rudi">
              <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">{form.title || 'Nyumba'}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                property.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
              }`}>{property.status === 'AVAILABLE' ? 'Inapatikana' : property.status}</span>
              {expiryText && <span className="text-xs text-gray-400 hidden sm:inline">{expiryText}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6 sm:mb-8">
        <nav className="flex -mb-px overflow-x-auto no-scrollbar gap-1" aria-label="Sections">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                  isActive ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{tab.labelSw}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'details' && (
        <HostDetailsTab form={form} onUpdate={updateField} onToggleAmenity={toggleAmenity} onSave={handleSave} saving={saving} />
      )}

      {activeTab === 'photos' && (
        <div className="max-w-3xl space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Picha na Video</h2>
            <p className="text-sm text-gray-500 mb-4">Ongeza au ondoa picha na video za nyumba yako. Picha ya kwanza itatumika kama thumbnail.</p>
          </div>
          <MediaGrid
            images={images}
            videos={videos}
            onChange={(newImages, newVideos) => { setImages(newImages); setVideos(newVideos); setHasMediaChanges(true); }}
          />
          {hasMediaChanges && (
            <button onClick={handleSaveMedia} disabled={saving}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-semibold rounded-xl transition-colors">
              {saving ? 'Inahifadhi...' : 'Hifadhi Picha'}
            </button>
          )}
        </div>
      )}

      {activeTab === 'checkin' && (
        <HostCheckInTab form={form} onUpdate={updateField} onSave={handleSave} saving={saving} />
      )}

      {activeTab === 'settings' && (
        <HostSettingsTab form={form} onUpdate={updateField} onSave={handleSave} saving={saving} propertyId={property.propertyId} onDelete={handleDelete} />
      )}
    </div>
  );
}

// ── Helpers ────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Inapakia nyumba zako…</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white rounded-2xl shadow p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Kiungo Kimeisha au Si Sahihi</h1>
        <p className="text-gray-500 mb-4 text-sm">{message}</p>
        <p className="text-xs text-gray-400">Rudi WhatsApp na bonyeza <strong>Hariri</strong> kupata kiungo kipya.</p>
      </div>
    </div>
  );
}
