'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { deactivateShortTermProperty, updateUser } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { PlusIcon, HomeModernIcon } from '@heroicons/react/24/outline';
import { HostEarnings } from '@/components/host/HostEarnings';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { ListingCard } from '@/components/host/dashboard/ListingCard';
import { AddUnitModal } from '@/components/host/dashboard/AddUnitModal';
import { HostProperty, groupProperties } from '@/components/host/dashboard/types';
import toast from 'react-hot-toast';

export default function HostPropertiesPage() {
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();
  const [properties, setProperties] = useState<HostProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [addUnitSourceId, setAddUnitSourceId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, []);

  async function fetchProperties() {
    try {
      const data = await GraphQLClient.executeAuthenticated<{
        listMyShortTermProperties: { properties: HostProperty[] };
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

  function handleDelete(propertyId: string, title: string) {
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
              <div className="h-40 bg-ink-100" />
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
          {groupProperties(properties).map((item) => (
            <ListingCard
              key={item.kind === 'group' ? item.groupId : item.property.propertyId}
              item={item}
              onDelete={handleDelete}
              onAddUnit={(sourceId) => setAddUnitSourceId(sourceId)}
              deletingId={deletingId}
            />
          ))}
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

      <AddUnitModal
        sourcePropertyId={addUnitSourceId}
        onClose={() => setAddUnitSourceId(null)}
        onSuccess={() => { setAddUnitSourceId(null); fetchProperties(); }}
      />
    </>
  );
}
