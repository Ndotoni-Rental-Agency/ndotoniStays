'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { PlusIcon, MagnifyingGlassIcon, PhotoIcon, ChevronDownIcon, Squares2X2Icon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { publishShortTermProperty } from '@/graphql/mutations';
import { AddUnitModal } from '@/components/host/dashboard/AddUnitModal';
import { AllStaysList } from '@/components/host/admin/AllStaysList';

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
      groupId
      isPrimaryUnit
      unitLabel
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
  groupId?: string | null;
  isPrimaryUnit?: boolean | null;
  unitLabel?: string | null;
}

/** One property: a standalone stay, or every unit of a multi-unit property (primary first). */
interface ManagedGroup {
  key: string;
  primary: ManagedStay;
  units: ManagedStay[];
}

const titleCase = (s?: string) =>
  (s || '').replace(/[-_]+/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

function groupStays(stays: ManagedStay[]): ManagedGroup[] {
  const groups = new Map<string, ManagedStay[]>();
  for (const s of stays) {
    const key = s.groupId || s.propertyId;
    groups.set(key, [...(groups.get(key) || []), s]);
  }
  return Array.from(groups.entries()).map(([key, units]) => {
    const primary = units.find((u) => u.isPrimaryUnit) || units.find((u) => u.propertyId === key) || units[0];
    return { key, primary, units: [primary, ...units.filter((u) => u !== primary)] };
  });
}

const isDraft = (s: ManagedStay) => s.status === 'DRAFT';

/** Stays Ndotoni listed for owners without an account: publish drafts, add units, open the stay editor. */
export default function ManagedStaysPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [stays, setStays] = useState<ManagedStay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [publishingKey, setPublishingKey] = useState<string | null>(null);
  const [addUnitSourceId, setAddUnitSourceId] = useState<string | null>(null);
  const isAdmin = user?.userType === 'ADMIN';
  const [view, setView] = useState<'managed' | 'all'>('managed');

  // ?view=all opens the "All stays" view (read on the client: no Suspense needed for the static build)
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('view') === 'all') setView('all');
  }, []);

  function changeView(next: 'managed' | 'all') {
    setView(next);
    const url = new URL(window.location.href);
    if (next === 'all') url.searchParams.set('view', 'all');
    else url.searchParams.delete('view');
    window.history.replaceState(null, '', url.toString());
  }

  const load = useCallback(() => {
    GraphQLClient.executeAuthenticated<{ listManagedListings: ManagedStay[] }>(listManagedListings, { kind: 'SHORT_TERM' })
      .then((data) => setStays(data.listManagedListings || []))
      .catch((err) => setError(err?.errors?.[0]?.message || err?.message || t('managed.loadError')))
      .finally(() => setLoading(false));
  }, [t]);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const groups = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groupStays(stays).filter((g) =>
      !q || g.units.some((s) =>
        [s.title, s.unitLabel, s.ownerName, s.ownerPhone, s.ward, s.district, s.region, s.propertyId]
          .some((v) => v?.toLowerCase().includes(q))
      )
    );
  }, [stays, search]);

  /** Publishes every draft unit of the property in one go. */
  async function publishGroup(group: ManagedGroup) {
    const published: string[] = [];
    setPublishingKey(group.key);
    try {
      for (const unit of group.units.filter(isDraft)) {
        await GraphQLClient.executeAuthenticated(publishShortTermProperty, { propertyId: unit.propertyId });
        published.push(unit.propertyId);
      }
      toast.success(t('managed.published'));
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || err?.message || t('managed.publishError'));
    } finally {
      setStays((prev) => prev.map((s) => (published.includes(s.propertyId) ? { ...s, status: 'AVAILABLE' } : s)));
      setPublishingKey(null);
    }
  }

  function toggle(key: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

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

      {/* Managed stays, or every stay on Ndotoni (admins can edit any stay) */}
      <div className="inline-flex rounded-xl border border-ink-200 bg-white p-1" role="tablist">
        {(['managed', 'all'] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={view === v}
            onClick={() => changeView(v)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${view === v ? 'bg-brand-600 text-white' : 'text-ink-600 hover:text-ink-900'}`}
          >
            {v === 'managed' ? t('managed.viewManaged') : t('host.nav.allStays')}
          </button>
        ))}
      </div>

      {view === 'all' ? <AllStaysList /> : (<>

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
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-ink-200 p-10 text-center">
          <p className="text-ink-900 font-medium">{stays.length === 0 ? t('managed.empty') : t('managed.noMatch')}</p>
          <p className="text-sm text-ink-500 mt-1">{stays.length === 0 ? t('managed.emptyDesc') : t('managed.noMatchDesc')}</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {groups.map((g) => {
            const { primary: s, units } = g;
            const drafts = units.filter(isDraft);
            const draftMissingPhotos = drafts.find((u) => !u.thumbnail);
            const multi = units.length > 1;
            const open = expanded.has(g.key);
            const thumbnail = s.thumbnail || units.find((u) => u.thumbnail)?.thumbnail;
            // All live, all drafts, or a mix ("2 drafts")
            const groupStatus = drafts.length === 0 ? s.status : 'DRAFT';
            const groupStatusLabel = drafts.length > 0 && drafts.length < units.length
              ? t('managed.draftCount').replace('{count}', String(drafts.length))
              : titleCase(groupStatus);
            return (
              <li key={g.key} className="rounded-2xl border border-ink-100 bg-white">
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
                        <p className="font-medium text-ink-900 truncate">{s.title}</p>
                        {multi && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-ink-100 text-ink-600">
                            <Squares2X2Icon className="h-3 w-3" />
                            {t('managed.unitCount').replace('{count}', String(units.length))}
                          </span>
                        )}
                        {groupStatus && <StatusBadge status={groupStatus}>{groupStatusLabel}</StatusBadge>}
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
                  <div className="flex flex-wrap gap-2 sm:flex-shrink-0 sm:justify-end">
                    {drafts.length > 0 && (draftMissingPhotos ? (
                      <Link
                        href={`/host/property/${draftMissingPhotos.propertyId}/edit`}
                        className="flex-1 sm:flex-none text-center px-4 py-2 rounded-xl text-sm font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        {t('managed.needsPhotos')}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => publishGroup(g)}
                        disabled={publishingKey === g.key}
                        className="btn-primary flex-1 sm:flex-none px-4 py-2 text-sm disabled:opacity-50"
                      >
                        {publishingKey === g.key
                          ? t('managed.publishing')
                          : drafts.length > 1 ? t('managed.publishAll').replace('{count}', String(drafts.length)) : t('managed.publish')}
                      </button>
                    ))}
                    <Link
                      href={`/host/property/${s.propertyId}/edit`}
                      className={`flex-1 sm:flex-none text-center px-4 py-2 text-sm ${drafts.length > 0
                        ? 'rounded-xl font-medium border border-ink-200 text-ink-700 hover:bg-ink-50 transition-colors'
                        : 'btn-primary'}`}
                    >
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

                <div className="flex items-center justify-between gap-3 border-t border-ink-100 px-4 py-2.5">
                  <button
                    type="button"
                    onClick={() => setAddUnitSourceId(s.propertyId)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800"
                  >
                    <PlusIcon className="h-4 w-4" /> {t('managed.addUnit')}
                  </button>
                  {multi && (
                    <button
                      type="button"
                      onClick={() => toggle(g.key)}
                      aria-expanded={open}
                      className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-700"
                    >
                      {t(open ? 'managed.hideUnits' : 'managed.showUnits')}
                      <ChevronDownIcon className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                  )}
                </div>

                {multi && open && (
                  <ul className="border-t border-ink-100 divide-y divide-ink-100">
                    {units.map((u) => (
                      <li key={u.propertyId} className="flex items-center gap-3 px-4 py-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-ink-900 truncate">{u.unitLabel || u.title}</p>
                            {u.status && <StatusBadge status={u.status}>{titleCase(u.status)}</StatusBadge>}
                          </div>
                          {u.price != null && (
                            <p className="text-xs text-ink-500">{u.currency || 'TZS'} {u.price.toLocaleString()}{t('managed.perNight')}</p>
                          )}
                        </div>
                        <Link href={`/host/property/${u.propertyId}/edit`} className="text-sm font-medium text-brand-600 hover:underline">
                          {t('managed.manage')}
                        </Link>
                        <Link href={`/property/${u.propertyId}`} className="text-sm text-ink-500 hover:underline">
                          {t('managed.viewShort')}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}

      </>)}

      <AddUnitModal
        sourcePropertyId={addUnitSourceId}
        onClose={() => setAddUnitSourceId(null)}
        onSuccess={() => { setAddUnitSourceId(null); load(); }}
      />
    </div>
  );
}

function StatusBadge({ status, children }: { status: string; children: React.ReactNode }) {
  const style = status === 'AVAILABLE'
    ? 'bg-green-100 text-green-700'
    : status === 'DRAFT'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-ink-100 text-ink-600';
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${style}`}>{children}</span>;
}
