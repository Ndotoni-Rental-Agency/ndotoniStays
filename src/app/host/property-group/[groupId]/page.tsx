'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeftIcon, MapPinIcon, PlusIcon } from '@heroicons/react/24/outline';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties } from '@/graphql/queries';
import { deactivateShortTermProperty } from '@/graphql/mutations';
import { useLanguage } from '@/contexts/LanguageContext';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { UnitCard } from '@/components/host/dashboard/UnitCard';
import { AddUnitModal } from '@/components/host/dashboard/AddUnitModal';
import { HostProperty } from '@/components/host/dashboard/types';
import toast from 'react-hot-toast';

export default function PropertyGroupPage() {
  const params = useParams();
  const groupId = params.groupId as string;
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
      }>(listMyShortTermProperties, { limit: 100 });
      setProperties(data.listMyShortTermProperties?.properties || []);
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
      toast.error(err?.message || 'Failed to delete');
    } finally {
      setDeletingId(null);
      setDeleteTarget(null);
    }
  }

  const units = properties.filter(p => p.groupId === groupId);
  const primary = units.find(u => u.isPrimaryUnit) || units[0];

  if (loading) {
    return <div className="animate-pulse text-ink-400 py-16 text-center">{t('common.loading')}</div>;
  }

  return (
    <>
      <Link href="/host" className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mb-4">
        <ArrowLeftIcon className="h-4 w-4" />
        {t('host.backToProperties')}
      </Link>

      {primary && (
        <div className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-ink-50/60 p-4 mb-6">
          <MapPinIcon className="h-5 w-5 text-ink-400 shrink-0" />
          <div>
            <h1 className="text-lg font-bold text-ink-900">{primary.title}</h1>
            <p className="text-sm text-ink-500 mt-0.5">
              {t('host.sameAddressUnits')
                .replace('{count}', String(units.length))
                .replace('{location}', `${primary.district}, ${primary.region}`)}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit, i) => (
          <div key={unit.propertyId} className="rounded-2xl border border-ink-100 shadow-sm overflow-hidden bg-white">
            <UnitCard
              property={unit}
              label={unit.unitLabel || `Unit ${i + 1}`}
              onDelete={handleDelete}
              deleting={deletingId === unit.propertyId}
            />
          </div>
        ))}
      </div>

      {primary && (
        <button
          type="button"
          onClick={() => setAddUnitSourceId(primary.propertyId)}
          className="w-full flex items-center justify-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl py-3 text-sm font-semibold transition-colors mt-4"
        >
          <PlusIcon className="h-4 w-4" />
          {t('host.addUnit')}
        </button>
      )}

      <AddUnitModal
        sourcePropertyId={addUnitSourceId}
        onClose={() => setAddUnitSourceId(null)}
        onSuccess={() => { setAddUnitSourceId(null); fetchProperties(); }}
      />

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
