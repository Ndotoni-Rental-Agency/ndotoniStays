'use client';

import Link from 'next/link';
import { PlusIcon, ArrowRightIcon, MapPinIcon, HomeModernIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import { CardItem } from './types';
import { UnitCard } from './UnitCard';
import { locationLine } from '@/lib/location/format';

interface Props {
  item: CardItem;
  onDelete: (propertyId: string, title: string) => void;
  onAddUnit: (sourcePropertyId: string) => void;
  deletingId?: string | null;
}

/** One card per listing: a standalone unit renders directly; a group renders a summary
 * that opens a dedicated page rather than expanding inline — a complex can have dozens
 * of units, so listing them all on the dashboard doesn't scale. */
export function ListingCard({ item, onDelete, onAddUnit, deletingId }: Props) {
  const { t } = useLanguage();

  if (item.kind === 'single') {
    return (
      <div className="rounded-2xl border border-ink-100 shadow-sm overflow-hidden bg-white">
        <UnitCard property={item.property} onDelete={onDelete} deleting={deletingId === item.property.propertyId} />
        <div className="px-3 pb-3">
          <button
            type="button"
            onClick={() => onAddUnit(item.property.propertyId)}
            className="w-full flex items-center justify-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl py-2.5 text-sm font-semibold transition-colors"
          >
            <PlusIcon className="h-4 w-4" />
            {t('host.addUnit')}
          </button>
        </div>
      </div>
    );
  }

  const { primary, units, groupId } = item;
  return (
    <div className="rounded-2xl border border-ink-100 shadow-sm overflow-hidden bg-white">
      <Link href={`/host/property-group/${groupId}`} className="block">
        <div className="relative h-40 bg-ink-100">
          {primary.thumbnail ? (
            <img src={primary.thumbnail} alt={primary.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <HomeModernIcon className="h-10 w-10 text-ink-300" />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-black/55 backdrop-blur px-2.5 py-1 rounded-full">
            <Squares2X2Icon className="h-3.5 w-3.5 text-white" />
            <span className="text-[11px] font-bold text-white tracking-wide">{t('host.units').replace('{count}', String(units.length))}</span>
          </span>
        </div>
        <div className="px-4 pt-3.5 pb-1">
          <h3 className="text-lg font-bold text-ink-900 tracking-tight truncate">{primary.title}</h3>
          <p className="flex items-center gap-1 text-xs font-medium text-ink-500 mt-1">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{locationLine({ ward: primary.address?.ward, district: primary.district, region: primary.region })}</span>
          </p>
          <p className="flex items-center gap-1 text-xs font-bold text-brand-600 mt-2.5">
            {t('host.manageUnits')}
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </p>
        </div>
      </Link>

      <div className="mx-4 mt-3 border-t border-ink-100" />

      <div className="p-3">
        <button
          type="button"
          onClick={() => onAddUnit(primary.propertyId)}
          className="w-full flex items-center justify-center gap-1.5 bg-brand-50 text-brand-700 hover:bg-brand-100 rounded-xl py-2.5 text-sm font-semibold transition-colors"
        >
          <PlusIcon className="h-4 w-4" />
          {t('host.addUnit')}
        </button>
      </div>
    </div>
  );
}
