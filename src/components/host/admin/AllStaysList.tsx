'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MagnifyingGlassIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';

/** Slim listAllProperties for stays; the backend returns up to `limit`, with no next page. */
const listAllStaysForAdmin = /* GraphQL */ `
  query ListAllStaysForAdmin($status: PropertyStatus, $search: String, $limit: Int) {
    listAllProperties(propertyType: "SHORT_TERM", status: $status, search: $search, limit: $limit) {
      shortTermProperties {
        propertyId
        title
        status
        region
        district
        address {
          ward
        }
        nightlyRate
        currency
        thumbnail
        images
        managedBy
        unitLabel
        updatedAt
      }
    }
  }
`;

interface AdminStay {
  propertyId: string;
  title: string;
  status?: string | null;
  region?: string | null;
  district?: string | null;
  address?: { ward?: string | null } | null;
  nightlyRate?: number | null;
  currency?: string | null;
  thumbnail?: string | null;
  images?: string[] | null;
  managedBy?: string | null;
  unitLabel?: string | null;
  updatedAt?: string | null;
}

const LIMIT = 200;
const SEARCH_DELAY_MS = 400;
const TABS = ['AVAILABLE', 'DRAFT', 'INACTIVE'] as const;
type TabStatus = (typeof TABS)[number];

const titleCase = (s?: string | null) =>
  (s || '').replace(/[-_]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

/**
 * Every stay on Ndotoni (admins only), not just the managed ones: find any stay and open the stay
 * editor. The backend lets admins edit, publish, take down and manage the calendar of any stay;
 * the owner stays the owner. Shown as the "All stays" view of /host/managed.
 */
export function AllStaysList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const isAdmin = user?.userType === 'ADMIN';

  const [tab, setTab] = useState<TabStatus>('AVAILABLE');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [stays, setStays] = useState<AdminStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);

  // Search on the server, a moment after typing stops
  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), SEARCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await GraphQLClient.executeAuthenticated<{ listAllProperties: { shortTermProperties: AdminStay[] } }>(
        listAllStaysForAdmin,
        // A search covers every status, so a stay is found whatever state it is in
        query ? { search: query, limit: LIMIT } : { status: tab, limit: LIMIT },
      );
      if (id !== requestId.current) return; // a newer search or tab replaced this one
      setStays([...(data.listAllProperties?.shortTermProperties || [])]
        .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '')));
      setError(null);
    } catch (err: any) {
      if (id !== requestId.current) return;
      setError(err?.errors?.[0]?.message || err?.message || t('allStays.loadError'));
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  }, [tab, query, t]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  if (!isAdmin) {
    return <p className="text-ink-500 py-16 text-center">{t('allStays.adminOnly')}</p>;
  }

  return (
    <div className="space-y-6">
      <p className="text-ink-500 text-sm max-w-2xl">{t('allStays.subtitle')}</p>

      <label className="relative block">
        <MagnifyingGlassIcon className="h-4 w-4 text-ink-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('allStays.search')}
          className="w-full rounded-xl border border-ink-200 bg-white pl-9 pr-3 py-2.5 text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
        />
      </label>

      {!query && (
        <div className="flex flex-wrap gap-2" role="tablist">
          {TABS.map((status) => {
            const active = status === tab;
            return (
              <button
                key={status}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(status)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${active
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-ink-200 bg-white text-ink-700 hover:bg-ink-50'}`}
              >
                {t(`allStays.tab.${status}`)}
              </button>
            );
          })}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-24 rounded-2xl bg-ink-100 animate-pulse" />)}
        </div>
      ) : error ? (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600">{error}</div>
      ) : stays.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 p-10 text-center">
          <p className="text-ink-900 font-medium">{query ? t('allStays.noMatch') : t('allStays.empty')}</p>
          <p className="text-sm text-ink-500 mt-1">{query ? t('allStays.noMatchDesc') : t('allStays.emptyDesc')}</p>
        </div>
      ) : (
        <>
          <p className="text-xs text-ink-400 -mb-3">
            {(query ? t('allStays.found') : t('allStays.count'))
              .replace('{count}', `${stays.length}${stays.length >= LIMIT ? '+' : ''}`)}
            {stays.length >= LIMIT && t('allStays.more')}
          </p>
          <ul className="space-y-3">
            {stays.map((s) => {
              const thumbnail = s.thumbnail || s.images?.[0];
              return (
                <li key={s.propertyId} className="rounded-2xl border border-ink-100 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={thumbnail} alt="" className="h-16 w-16 rounded-xl object-cover flex-shrink-0" />
                      ) : (
                        <div className="h-16 w-16 rounded-xl bg-ink-50 flex items-center justify-center flex-shrink-0">
                          <PhotoIcon className="h-6 w-6 text-ink-300" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-ink-900 truncate">
                            {s.title}{s.unitLabel ? ` · ${s.unitLabel}` : ''}
                          </p>
                          {s.status && <StatusBadge status={s.status}>{statusLabel(s.status, t)}</StatusBadge>}
                          {s.managedBy === 'NDOTONI' && (
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                              {t('allStays.managed')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-ink-500 truncate">
                          {[s.address?.ward, s.district, s.region].filter(Boolean).map(titleCase).join(', ')}
                          {s.nightlyRate != null && ` · ${s.currency || 'TZS'} ${s.nightlyRate.toLocaleString()}${t('managed.perNight')}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:flex-shrink-0 sm:justify-end">
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
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

function statusLabel(status: string, t: (key: string) => string): string {
  return (TABS as readonly string[]).includes(status) ? t(`allStays.tab.${status}`) : titleCase(status);
}

function StatusBadge({ status, children }: { status: string; children: React.ReactNode }) {
  const style = status === 'AVAILABLE'
    ? 'bg-green-100 text-green-700'
    : status === 'DRAFT'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-ink-100 text-ink-600';
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${style}`}>{children}</span>;
}
