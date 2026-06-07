'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { PlusIcon, PencilSquareIcon, HomeModernIcon } from '@heroicons/react/24/outline';

interface Property {
  propertyId: string;
  title: string;
  propertyType: string;
  region: string;
  district: string;
  nightlyRate: number;
  currency: string;
  thumbnail: string | null;
  status: string;
  instantBookEnabled: boolean;
  maxGuests: number;
  createdAt: string;
  updatedAt: string;
}

const STATUS_BADGES: Record<string, { label: string; classes: string }> = {
  DRAFT: { label: 'Draft', classes: 'bg-yellow-100 text-yellow-800' },
  AVAILABLE: { label: 'Live', classes: 'bg-green-100 text-green-800' },
  INACTIVE: { label: 'Inactive', classes: 'bg-gray-100 text-gray-600' },
};

export default function HostDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated]);

  async function fetchProperties() {
    try {
      setLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{
        listMyShortTermProperties: { properties: Property[]; nextToken: string | null };
      }>(listMyShortTermProperties, { limit: 50 });
      setProperties(data.listMyShortTermProperties?.properties || []);
    } catch (err: any) {
      console.error('Failed to load properties:', err);
      setError('Failed to load your properties. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading || (!isAuthenticated && !isLoading)) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">My Properties</h1>
          <p className="text-ink-500 mt-1">Manage your short-term rental listings</p>
        </div>
        <Link href="/host/create" className="btn-primary flex items-center gap-2">
          <PlusIcon className="h-4 w-4" />
          Add Property
        </Link>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 mb-6">
          {error}
        </div>
      )}

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-0 animate-pulse">
              <div className="h-40 bg-ink-100 rounded-t-2xl" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-ink-100 rounded w-3/4" />
                <div className="h-3 bg-ink-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="text-center py-16">
          <HomeModernIcon className="h-16 w-16 text-ink-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-ink-700 mb-2">No properties yet</h2>
          <p className="text-ink-500 mb-6">List your first property and start earning from short-term guests.</p>
          <Link href="/host/create" className="btn-primary inline-flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Add Your First Property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {properties.map((property) => {
            const badge = STATUS_BADGES[property.status] || STATUS_BADGES.DRAFT;
            return (
              <div key={property.propertyId} className="card p-0 overflow-hidden hover:shadow-lg transition-shadow">
                {/* Thumbnail */}
                <div className="relative h-40 bg-ink-100">
                  {property.thumbnail ? (
                    <img
                      src={property.thumbnail}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <HomeModernIcon className="h-12 w-12 text-ink-300" />
                    </div>
                  )}
                  <span className={`absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full ${badge.classes}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-ink-900 truncate">{property.title}</h3>
                  <p className="text-sm text-ink-500 mt-0.5">
                    {property.district}, {property.region}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-sm font-medium text-ink-700">
                      {property.currency} {property.nightlyRate?.toLocaleString()}<span className="text-ink-400 font-normal">/night</span>
                    </p>
                    <span className="text-xs text-ink-400">{property.maxGuests} guests</span>
                  </div>
                  <Link
                    href={`/host/property/${property.propertyId}/edit`}
                    className="mt-3 flex items-center justify-center gap-1.5 w-full btn-secondary text-sm py-2"
                  >
                    <PencilSquareIcon className="h-3.5 w-3.5" />
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
