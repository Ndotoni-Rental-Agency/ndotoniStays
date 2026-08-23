'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { HomeModernIcon } from '@heroicons/react/24/outline';
import { GraphQLClient } from '@/lib/graphql-client';
import { getPropertyGroupUnits } from '@/graphql/queries';

interface GroupUnit {
  propertyId: string;
  unitLabel: string | null;
  title: string;
  thumbnail: string | null;
  nightlyRate: number;
  currency: string;
  maxGuests: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
}

interface Props {
  groupId: string;
  currentPropertyId: string;
}

/** Lets a guest browsing one unit of an apartment complex see and switch to its sibling units. */
export function PropertyGroupUnits({ groupId, currentPropertyId }: Props) {
  const [units, setUnits] = useState<GroupUnit[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await GraphQLClient.executePublic<{
          getPropertyGroupUnits: { properties: GroupUnit[] };
        }>(getPropertyGroupUnits, { groupId });
        if (!cancelled) setUnits(data.getPropertyGroupUnits?.properties || []);
      } catch (err) {
        console.error('Failed to load other units at this property:', err);
        if (!cancelled) setUnits([]);
      }
    })();
    return () => { cancelled = true; };
  }, [groupId]);

  // Nothing else to show yet, or this is the only available unit — stay quiet.
  if (!units || units.length < 2) return null;

  return (
    <div className="space-y-4 py-8 border-t border-ink-100">
      <h2 className="text-xl font-bold text-ink-900">Other rooms at this property</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {units.map((unit) => {
          const isCurrent = unit.propertyId === currentPropertyId;
          const card = (
            <div
              className={`flex gap-3 rounded-xl border p-3 transition-colors ${
                isCurrent ? 'border-brand-300 bg-brand-50' : 'border-ink-100 hover:border-brand-200 hover:bg-ink-50'
              }`}
            >
              <div className="relative h-16 w-16 shrink-0 rounded-lg overflow-hidden bg-ink-100">
                {unit.thumbnail ? (
                  <img src={unit.thumbnail} alt={unit.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <HomeModernIcon className="h-6 w-6 text-ink-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-ink-900 truncate">{unit.unitLabel || unit.title}</p>
                <p className="text-xs text-ink-500 mt-0.5">
                  {unit.currency} {unit.nightlyRate?.toLocaleString()}/night
                  {unit.maxGuests ? ` · ${unit.maxGuests} guests` : ''}
                </p>
                {isCurrent && (
                  <p className="text-xs font-medium text-brand-700 mt-1">Currently viewing</p>
                )}
              </div>
            </div>
          );

          return isCurrent ? (
            <div key={unit.propertyId}>{card}</div>
          ) : (
            <Link key={unit.propertyId} href={`/property/${unit.propertyId}`}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
