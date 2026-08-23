'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { deactivateShortTermProperty, updateUser } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  PlusIcon,
  PencilSquareIcon,
  HomeModernIcon,
  CalendarDaysIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { HostEarnings } from '@/components/host/HostEarnings';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import toast from 'react-hot-toast';

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
  bedrooms: number | null;
  bathrooms: number | null;
  groupId?: string | null;
  isPrimaryUnit?: boolean | null;
  unitLabel?: string | null;
}

type CardItem =
  | { kind: 'single'; property: Property }
  | { kind: 'group'; groupId: string; primary: Property; units: Property[] };

/** Groups properties that share a groupId into one card, primary unit first. Ungrouped properties pass through unchanged. */
function buildCardItems(properties: Property[]): CardItem[] {
  const items: CardItem[] = [];
  const groupUnits = new Map<string, Property[]>();
  const groupOrder: string[] = [];

  for (const property of properties) {
    if (!property.groupId) {
      items.push({ kind: 'single', property });
      continue;
    }
    if (!groupUnits.has(property.groupId)) {
      groupOrder.push(property.groupId);
      groupUnits.set(property.groupId, []);
    }
    groupUnits.get(property.groupId)!.push(property);
  }

  for (const groupId of groupOrder) {
    const units = groupUnits.get(groupId)!;
    const primary = units.find(u => u.isPrimaryUnit) || units[0];
    const rest = units.filter(u => u.propertyId !== primary.propertyId);
    items.push({ kind: 'group', groupId, primary, units: [primary, ...rest] });
  }

  return items;
}

const STATUS_BADGES: Record<string, { labelKey: string; classes: string }> = {
  DRAFT: { labelKey: 'host.status.draft', classes: 'bg-yellow-100 text-yellow-800' },
  AVAILABLE: { labelKey: 'host.status.live', classes: 'bg-green-100 text-green-800' },
  INACTIVE: { labelKey: 'host.status.inactive', classes: 'bg-gray-100 text-gray-600' },
};

export default function HostPropertiesPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const data = await GraphQLClient.executeAuthenticated<{
        listMyShortTermProperties: { properties: Property[] };
      }>(listMyShortTermProperties, { limit: 50 });
      const fetched = data.listMyShortTermProperties?.properties || [];
      setProperties(fetched);

      // Self-heal: if user has properties but hasProperties flag is not set, update it
      if (fetched.length > 0 && !user?.hasProperties) {
        try {
          await GraphQLClient.executeAuthenticated(updateUser, { input: { hasProperties: true } });
          await refreshUser();
        } catch (err) {
          console.warn('Failed to sync hasProperties flag:', err);
        }
      }
    } catch (err) {
      console.error('Failed to load properties:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(propertyId: string, title: string) {
    setDeleteTarget({ id: propertyId, title });
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { id } = deleteTarget;

    setDeletingId(id);
    try {
      await GraphQLClient.executeAuthenticated(deactivateShortTermProperty, { propertyId: id });
      setProperties(prev => prev.filter(p => p.propertyId !== id));
      toast.success(t('host.propertyDeleted'));
    } catch (err: any) {
      console.error('Failed to delete property:', err);
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const allPropertyIds = properties.map((p) => p.propertyId);

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-ink-900">{t('host.myProperties')}</h1>
        {(loading || properties.length > 0) && (
          <Link href="/become-host" className="btn-primary flex items-center gap-1.5 text-sm">
            <PlusIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t('host.nav.addProperty')}</span>
            <span className="sm:hidden">{t('host.add')}</span>
          </Link>
        )}
      </div>

      {/* Earnings */}
      {!loading && properties.length > 0 && (
        <HostEarnings propertyIds={allPropertyIds} />
      )}

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-2xl border border-ink-100 overflow-hidden animate-pulse">
              <div className="h-36 bg-ink-100" />
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
          <h2 className="text-xl font-semibold text-ink-700 mb-2">{t('host.noProperties')}</h2>
          <p className="text-ink-500 mb-6 text-sm">{t('host.noProperties.desc')}</p>
          <Link href="/become-host" className="btn-primary inline-flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            {t('host.addFirst')}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {buildCardItems(properties).map((item) => {
            if (item.kind === 'group') {
              const { primary, units, groupId } = item;
              return (
                <div
                  key={groupId}
                  className="rounded-2xl border border-ink-100 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <Link href={`/property/${primary.propertyId}`}>
                    <div className="relative h-36 bg-ink-100">
                      {primary.thumbnail ? (
                        <img
                          src={primary.thumbnail}
                          alt={primary.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <HomeModernIcon className="h-12 w-12 text-ink-300" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-100 text-brand-800">
                        {t('host.units').replace('{count}', String(units.length))}
                      </span>
                    </div>
                  </Link>

                  <div className="p-3.5">
                    <Link href={`/property/${primary.propertyId}`} className="block">
                      <h3 className="font-semibold text-ink-900 truncate text-sm hover:text-brand-600 transition-colors">{primary.title}</h3>
                      <p className="text-xs text-ink-500 mt-0.5">
                        {primary.district}, {primary.region}
                      </p>
                    </Link>

                    <div className="mt-3 border-t border-ink-100 divide-y divide-ink-100">
                      {units.map((unit) => {
                        const badge = STATUS_BADGES[unit.status] || STATUS_BADGES.DRAFT;
                        return (
                          <Link
                            key={unit.propertyId}
                            href={`/host/property/${unit.propertyId}/edit`}
                            className="flex items-center justify-between gap-2 py-2 text-xs hover:bg-ink-50 -mx-1 px-1 rounded transition-colors"
                          >
                            <span className="truncate text-ink-700">{unit.unitLabel || unit.title}</span>
                            <span className="flex items-center gap-1.5 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded-full ${badge.classes}`}>{t(badge.labelKey)}</span>
                              <span className="text-ink-500">{unit.currency} {unit.nightlyRate?.toLocaleString()}</span>
                            </span>
                          </Link>
                        );
                      })}
                    </div>

                    <Link
                      href={`/host/property/${primary.propertyId}/add-unit`}
                      className="flex items-center justify-center gap-1.5 btn-secondary text-xs py-2 mt-3 touch-manipulation"
                    >
                      <PlusIcon className="h-3.5 w-3.5" />
                      {t('host.addUnit')}
                    </Link>
                  </div>
                </div>
              );
            }

            const property = item.property;
            const badge = STATUS_BADGES[property.status] || STATUS_BADGES.DRAFT;
            return (
              <div
                key={property.propertyId}
                className="rounded-2xl border border-ink-100 overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Thumbnail — clickable to view as guest */}
                <Link href={`/property/${property.propertyId}`}>
                  <div className="relative h-36 bg-ink-100">
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
                      {t(badge.labelKey)}
                    </span>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-3.5">
                  <Link href={`/property/${property.propertyId}`} className="block">
                    <h3 className="font-semibold text-ink-900 truncate text-sm hover:text-brand-600 transition-colors">{property.title}</h3>
                    <p className="text-xs text-ink-500 mt-0.5">
                      {property.district}, {property.region}
                    </p>
                  </Link>
                  <div className="flex items-center justify-between mt-2.5">
                    <p className="text-sm font-medium text-ink-700">
                      {property.currency} {property.nightlyRate?.toLocaleString()}
                      <span className="text-ink-400 font-normal">{t('host.perNight')}</span>
                    </p>
                    <span className="text-xs text-ink-400">
                      {property.bedrooms && `${property.bedrooms} ${t('host.bed')}`}
                      {property.bathrooms && ` · ${property.bathrooms} ${t('host.bath')}`}
                      {' · '}{property.maxGuests} {t('host.guests')}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/host/property/${property.propertyId}/edit`}
                      className="flex-1 flex items-center justify-center gap-1.5 btn-secondary text-xs py-2 touch-manipulation"
                    >
                      <PencilSquareIcon className="h-3.5 w-3.5" />
                      {t('host.edit')}
                    </Link>
                    <Link
                      href={`/host/property/${property.propertyId}/edit`}
                      onClick={() => sessionStorage.setItem('host-edit-tab', 'calendar')}
                      className="flex items-center justify-center btn-secondary text-xs py-2 px-3 touch-manipulation"
                      aria-label="Calendar"
                    >
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(property.propertyId, property.title)}
                      disabled={deletingId === property.propertyId}
                      className="flex items-center justify-center text-xs py-2 px-3 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors touch-manipulation disabled:opacity-50"
                      aria-label="Delete"
                    >
                      {deletingId === property.propertyId ? (
                        <span className="h-3.5 w-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                      ) : (
                        <TrashIcon className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>

                  <Link
                    href={`/host/property/${property.propertyId}/add-unit`}
                    className="flex items-center justify-center gap-1.5 btn-secondary text-xs py-2 mt-2 touch-manipulation"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                    {t('host.addUnit')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title={t('host.delete')}
        message={`"${deleteTarget?.title}" ${t('host.delete.message')}`}
        confirmLabel={t('host.delete.confirm')}
        cancelLabel={t('host.delete.cancel')}
        variant="danger"
        loading={!!deletingId}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
}
