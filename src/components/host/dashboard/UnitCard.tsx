'use client';

import Link from 'next/link';
import {
  PencilSquareIcon,
  CalendarDaysIcon,
  TrashIcon,
  MapPinIcon,
  ChevronRightIcon,
  HomeModernIcon,
} from '@heroicons/react/24/outline';
import { useLanguage } from '@/contexts/LanguageContext';
import { HostProperty } from './types';
import { locationLine } from '@/lib/location/format';

interface Props {
  property: HostProperty;
  onDelete: (propertyId: string, title: string) => void;
  deleting?: boolean;
  /** Label shown instead of the unit's own title — e.g. "Room 2B" within a group list. */
  label?: string;
}

const STATUS_DOT: Record<string, string> = {
  DRAFT: 'bg-amber-500',
  AVAILABLE: 'bg-green-500',
  INACTIVE: 'bg-ink-400',
};

/** One unit: full-bleed cover photo, title/location/price, then vertical, explicit action rows (Edit, Calendar, Delete). */
export function UnitCard({ property, onDelete, deleting, label }: Props) {
  const { t } = useLanguage();
  const live = property.status === 'AVAILABLE';
  const badge = t(live ? 'host.status.live' : property.status === 'DRAFT' ? 'host.status.draft' : 'host.status.inactive');

  return (
    <div>
      <Link href={`/property/${property.propertyId}`} className="block">
        <div className="relative h-40 bg-ink-100">
          {property.thumbnail ? (
            <img src={property.thumbnail} alt={property.title} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <HomeModernIcon className="h-10 w-10 text-ink-300" />
            </div>
          )}
          <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full shadow-sm">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[property.status] || STATUS_DOT.DRAFT}`} />
            <span className="text-[11px] font-bold text-ink-900 tracking-wide">{badge}</span>
          </span>
        </div>
      </Link>

      <div className="px-4 pt-3.5 pb-1">
        <Link href={`/property/${property.propertyId}`}>
          <h3 className="text-lg font-bold text-ink-900 tracking-tight truncate hover:text-brand-600 transition-colors">
            {label || property.unitLabel || property.title}
          </h3>
        </Link>
        <p className="flex items-center gap-1 text-xs font-medium text-ink-500 mt-1">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{locationLine({ ward: property.address?.ward, district: property.district, region: property.region })}</span>
        </p>
        <p className="mt-2.5">
          <span className="text-xl font-extrabold text-ink-900 tracking-tight">
            {property.currency} {property.nightlyRate?.toLocaleString()}
          </span>
          <span className="text-sm font-medium text-ink-400"> / night</span>
        </p>
      </div>

      <div className="mx-4 mt-3 border-t border-ink-100" />

      <div className="p-3 space-y-1">
        <Link
          href={`/host/property/${property.propertyId}/edit`}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-ink-50 transition-colors"
        >
          <span className="h-8 w-8 shrink-0 rounded-full bg-brand-50 flex items-center justify-center">
            <PencilSquareIcon className="h-4 w-4 text-brand-600" />
          </span>
          <span className="text-sm font-semibold text-ink-900 flex-1">{t('host.edit')}</span>
          <ChevronRightIcon className="h-4 w-4 text-ink-300" />
        </Link>
        <Link
          href={`/host/property/${property.propertyId}/edit`}
          onClick={() => sessionStorage.setItem('host-edit-tab', 'calendar')}
          className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-ink-50 transition-colors"
        >
          <span className="h-8 w-8 shrink-0 rounded-full bg-brand-50 flex items-center justify-center">
            <CalendarDaysIcon className="h-4 w-4 text-brand-600" />
          </span>
          <span className="text-sm font-semibold text-ink-900 flex-1">{t('host.calendar')}</span>
          <ChevronRightIcon className="h-4 w-4 text-ink-300" />
        </Link>
        <button
          type="button"
          onClick={() => onDelete(property.propertyId, label || property.unitLabel || property.title)}
          disabled={deleting}
          className="w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <span className="h-8 w-8 shrink-0 rounded-full bg-red-50 flex items-center justify-center">
            {deleting ? (
              <span className="h-3.5 w-3.5 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <TrashIcon className="h-4 w-4 text-red-500" />
            )}
          </span>
          <span className="text-sm font-semibold text-red-600 flex-1 text-left">{t('common.delete')}</span>
          <ChevronRightIcon className="h-4 w-4 text-red-200" />
        </button>
      </div>
    </div>
  );
}
