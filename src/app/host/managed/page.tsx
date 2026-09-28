'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';

const listManagedListings = /* GraphQL */ `
  query ListManagedListings($kind: String) {
    listManagedListings(kind: $kind) {
      propertyId
      title
      status
      region
      district
      ward
      price
      currency
      thumbnail
      ownerName
      ownerPhone
      listedByAdminName
      listedAt
    }
  }
`;

interface ManagedStay {
  propertyId: string;
  title: string;
  status?: string;
  region?: string;
  district?: string;
  ward?: string;
  price?: number;
  currency?: string;
  thumbnail?: string;
  ownerName?: string;
  ownerPhone?: string;
  listedByAdminName?: string;
  listedAt?: string;
}

const titleCase = (s?: string) =>
  (s || '').replace(/[-_]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/** Stays Ndotoni listed for owners without an account; each opens the stay editor. */
export default function ManagedStaysPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stays, setStays] = useState<ManagedStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const isAdmin = user?.userType === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) return;
    GraphQLClient.executeAuthenticated<{ listManagedListings: ManagedStay[] }>(listManagedListings, { kind: 'SHORT_TERM' })
      .then((data) => setStays(data.listManagedListings || []))
      .catch((err) => setError(err?.errors?.[0]?.message || err?.message || t('managed.loadError')))
      .finally(() => setLoading(false));
  }, [isAdmin]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return stays;
    return stays.filter((s) =>
      [s.title, s.ownerName, s.ownerPhone, s.ward, s.district, s.region, s.propertyId].some((v) => v?.toLowerCase().includes(q))
    );
  }, [stays, search]);

  if (!isAdmin) {
    return <p className="text-ink-500 py-16 text-center">{t('managed.adminOnly')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">{t('managed.listTitle')}</h1>
          <p className="text-ink-500 mt-1 text-sm max-w-2xl">{t('managed.listSubtitle')}</p>
        </div>
        <Link href="/managed/new" className="btn-primary inline-flex items-center gap-1.5 flex-shrink-0">
          <PlusIcon className="h-4 w-4" /> {t('managed.listNew')}
        </Link>
      </div>

      <label className="relative block">
        <MagnifyingGlassIcon className="h-4 w-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('managed.search')}
          className="w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </label>

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-ink-100 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 p-10 text-center">
          <p className="text-ink-900 font-medium">{stays.length === 0 ? t('managed.empty') : t('managed.noMatch')}</p>
          <p className="text-sm text-ink-500 mt-1">{stays.length === 0 ? t('managed.emptyDesc') : t('managed.noMatchDesc')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((s) => (
            <li key={s.propertyId} className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-ink-100 bg-white p-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                {s.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.thumbnail} alt="" className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-ink-50 flex items-center justify-center flex-shrink-0">
                    <PhotoIcon className="h-6 w-6 text-ink-300" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-ink-900 truncate">{s.title}</p>
                    {s.status && (
                      <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                        s.status === 'AVAILABLE' ? 'bg-green-100 text-green-700' : 'bg-ink-100 text-ink-600'
                      }`}>
                        {titleCase(s.status)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-ink-500 truncate">
                    {[s.ward, s.district, s.region].filter(Boolean).map(titleCase).join(', ')}
                    {s.price != null && ` · ${s.currency || 'TZS'} ${s.price.toLocaleString()}${t('managed.perNight')}`}
                  </p>
                  <p className="text-xs text-ink-400 mt-0.5 truncate">
                    {t('managed.ownerLabel')}: {s.ownerName || '—'}{s.ownerPhone && ` · ${s.ownerPhone}`}
                    {s.listedAt && ` · ${t('managed.listedOn').replace('{date}', new Date(s.listedAt).toLocaleDateString())}`}
                    {s.listedByAdminName && ` ${t('managed.by').replace('{name}', s.listedByAdminName)}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:flex-shrink-0">
                <Link href={`/host/property/${s.propertyId}/edit`} className="btn-primary flex-1 sm:flex-none text-center px-4 py-2 text-sm">
                  {t('managed.manage')}
                </Link>
                <Link
                  href={`/property/${s.propertyId}`}
                  className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl text-sm font-medium border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors"
                >
                  {t('managed.viewShort')}
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
