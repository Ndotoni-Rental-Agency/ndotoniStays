'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ChevronRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { GroupImport, GroupImportsApi, GroupOutreachSettings, WhatsAppGroup, timeAgo } from '@/lib/admin/groupImports';
import { UploadExportButton } from '@/components/admin/whatsapp-groups/UploadExportButton';

export const dynamic = 'force-dynamic';

type Notice = { tone: 'success' | 'error'; text: string } | null;

export default function WhatsAppGroupsPage() {
  const [groups, setGroups] = useState<WhatsAppGroup[] | null>(null);
  const [pending, setPending] = useState<GroupImport[]>([]);
  const [settings, setSettings] = useState<GroupOutreachSettings | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice] = useState<Notice>(null);
  const setNotice = (n: Notice) => { if (n) toast[n.tone](n.text); };
  const { user } = useAuth();
  const isAdmin = user?.userType === 'ADMIN';

  const load = useCallback(async () => {
    try {
      const [overview, s] = await Promise.all([GroupImportsApi.listGroups(), GroupImportsApi.settings()]);
      setGroups(overview.groups);
      setPending(overview.pendingUploads);
      setSettings(s);
      setLoadError(null);
    } catch (err) {
      setLoadError(GroupImportsApi.errorText(err, 'Couldn’t load your WhatsApp groups.'));
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);

  // Keep refreshing while an upload is being read or messages are going out
  const busy = pending.some((p) => p.status === 'queued' || p.status === 'processing') || !!groups?.some((g) => g.sending > 0);
  useEffect(() => {
    if (!busy) return;
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [busy, load]);

  async function toggleAutoSend() {
    if (!settings) return;
    const next = !settings.autoSend;
    if (next && !window.confirm('Turn on auto-send? After every import, each advert and request with a number gets its first WhatsApp message straight away, without review.')) return;
    try {
      setSettings(await GroupImportsApi.setAutoSend(next));
    } catch (err) {
      setNotice({ tone: 'error', text: GroupImportsApi.errorText(err, 'Couldn’t change auto-send.') });
    }
  }

  if (!isAdmin) return <p className="text-sm text-ink-500">This page is for Ndotoni admins.</p>;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink-900">WhatsApp groups</h1>
          <p className="mt-1 max-w-2xl text-sm text-ink-600">
            Hosts and guests posting in the groups we’re in. Upload a group’s chat export, check what was found, and send each person their first message.
          </p>
        </div>
        <UploadExportButton
          onUploaded={(text) => { setNotice({ tone: 'success', text }); load(); }}
          onError={(text) => setNotice({ tone: 'error', text })}
        />
      </header>

      {settings && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-600">
          <span className="tabular-nums">{settings.sentToday} of {settings.dailyCap} messages sent today</span>
          <label className="inline-flex cursor-pointer items-center gap-2">
            <button type="button" role="switch" aria-checked={settings.autoSend} onClick={toggleAutoSend}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 ${settings.autoSend ? 'bg-ink-600' : 'bg-ink-300'}`}>
              <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-[left] duration-150 ${settings.autoSend ? 'left-[18px]' : 'left-0.5'}`} />
            </button>
            <span>Auto-send {settings.autoSend ? 'on: imports send without review' : 'off: you review before sending'}</span>
          </label>
        </div>
      )}

      {notice && (
        <p role="status" className={`rounded-lg px-4 py-3 text-sm ${notice.tone === 'success' ? 'bg-ink-50 text-ink-800' : 'bg-red-50 text-red-700'}`}>
          {notice.text}
        </p>
      )}

      {pending.length > 0 && (
        <ul className="space-y-1 text-sm">
          {pending.map((p) => (
            <li key={p.importId} className={p.status === 'failed' ? 'flex gap-1.5 text-red-700' : 'text-ink-600'}>
              {p.status === 'failed'
                ? <><ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{p.filename} couldn’t be read: {p.error}</>
                : <>Reading {p.filename}…</>}
            </li>
          ))}
        </ul>
      )}

      {loadError ? (
        <div role="alert" className="rounded-xl border border-ink-200 bg-white p-5 text-sm">
          {loadError} <button type="button" onClick={load} className="font-medium text-ink-700 underline">Try again</button>
        </div>
      ) : !groups ? (
        <div className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white" aria-busy>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              <div className="h-4 w-48 animate-pulse rounded bg-ink-200" />
              <div className="ml-auto h-4 w-24 animate-pulse rounded bg-ink-100" />
            </div>
          ))}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-ink-300 bg-white px-6 py-10 text-center">
          <h2 className="text-base font-semibold text-ink-900">No groups yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
            In WhatsApp, open a group, tap its name, then Export chat → Without media. Upload the file here, or send it to the Ndotoni WhatsApp number from an admin account.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-ink-100 overflow-hidden rounded-xl border border-ink-200 bg-white">
          {groups.map((g) => (
            <li key={g.groupKey}>
              <Link href={`/host/whatsapp-groups/${g.groupKey}`}
                className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-ink-50 focus:outline-none focus-visible:bg-ink-50">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-ink-900">{g.groupName}</p>
                  <p className="mt-0.5 text-sm text-ink-500">
                    {[g.lastImportAt ? `Imported ${timeAgo(g.lastImportAt)}` : null, `${g.hosts} adverts`, `${g.guests} requests`, `${g.contacts} numbers known`].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${g.toReview
                  ? 'bg-amber-50 text-amber-800 ring-1 ring-inset ring-amber-200'
                  : 'text-ink-500'}`}>
                  {g.sending ? `Sending ${g.sending}…` : g.toReview ? `${g.toReview} to review` : 'All caught up'}
                </span>
                <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-400 transition-transform group-hover:translate-x-0.5" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
