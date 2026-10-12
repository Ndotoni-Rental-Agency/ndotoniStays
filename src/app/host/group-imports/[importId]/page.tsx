'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GroupImportDetail, GroupImportItem, GroupImportItemInput, GroupImportsApi } from '@/lib/admin/groupImports';
import { GroupItemCard } from '@/components/host/admin/GroupItemCard';

type Tab = 'host' | 'guest';
type Filter = 'open' | 'sent' | 'all';

/** Admin: review one group import and send the first WhatsApp messages */
export default function GroupImportReviewPage() {
  const { importId } = useParams<{ importId: string }>();
  const { user } = useAuth();
  const isAdmin = user?.userType === 'ADMIN';
  const [detail, setDetail] = useState<GroupImportDetail | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>('host');
  const [filter, setFilter] = useState<Filter>('open');
  const [busyId, setBusyId] = useState('');
  const [sendingAll, setSendingAll] = useState(false);

  const load = useCallback(async () => {
    try {
      setDetail(await GroupImportsApi.get(importId));
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [importId]);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);
  const pending = !!detail && (detail.status === 'queued' || detail.status === 'processing' || detail.items.some(i => i.status === 'queued'));
  useEffect(() => {
    if (!pending) return;
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [pending, load]);

  const shown = useMemo(() => (detail?.items || []).filter(i => i.kind === tab && (
    filter === 'all' ? true : filter === 'sent' ? i.status === 'sent' || i.status === 'queued' : i.status === 'review' || i.status === 'failed'
  )), [detail, tab, filter]);

  if (!isAdmin) return <p className="text-sm text-ink-500">This page is for Ndotoni admins.</p>;
  if (failed) return <div role="alert" className="rounded-xl border border-ink-200 p-4 text-sm">Couldn’t load this import. <button onClick={load} className="font-semibold text-brand-700 underline">Retry</button></div>;
  if (!detail) return <div role="status" aria-label="Loading" className="h-32 animate-pulse rounded-xl bg-ink-50" />;

  const readyToSend = detail.items.filter(i => i.status === 'review' && i.phone);
  const count = (kind: Tab) => detail.items.filter(i => i.kind === kind && (i.status === 'review' || i.status === 'failed')).length;
  const replace = (updated: GroupImportItem[]) =>
    setDetail(d => d && { ...d, items: d.items.map(i => updated.find(u => u.itemId === i.itemId) || i) });

  async function run(itemId: string, action: () => Promise<void>) {
    setBusyId(itemId);
    try { await action(); } catch (err) { toast.error(GroupImportsApi.errorText(err, 'That didn’t work.')); } finally { setBusyId(''); }
  }
  const save = (item: GroupImportItem) => (input: GroupImportItemInput) =>
    run(item.itemId, async () => { if (Object.keys(input).length) replace([await GroupImportsApi.updateItem(item.itemId, input)]); });
  const skip = (item: GroupImportItem) => () => run(item.itemId, async () => replace(await GroupImportsApi.skip([item.itemId])));
  const send = (item: GroupImportItem) => () => run(item.itemId, async () => {
    const r = await GroupImportsApi.send([item.itemId]);
    if (!r.queued) throw new Error('Not sent: it was already handled or has no number.');
    replace([{ ...item, status: 'queued', sendError: null }]);
  });

  async function sendAll() {
    if (!readyToSend.length || !window.confirm(`Send the first WhatsApp message to ${readyToSend.length} people (adverts and requests with a number)?`)) return;
    setSendingAll(true);
    try {
      const r = await GroupImportsApi.sendAll(detail!.importId);
      toast.success(`${r.queued} messages are going out.`);
      await load();
    } catch (err) {
      toast.error(GroupImportsApi.errorText(err, 'Could not send.'));
    } finally {
      setSendingAll(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link href="/host/group-imports" className="text-sm text-ink-500 underline">← Imports</Link>
          <h1 className="mt-1 text-2xl font-semibold text-ink-900">{detail.groupName || detail.filename}</h1>
          <p className="text-sm text-ink-500">
            {detail.status === 'done'
              ? `${detail.newMessages} new messages · ${detail.hosts} adverts · ${detail.guests} requests${detail.refused ? ` · ${detail.refused} unreadable` : ''}`
              : detail.status === 'failed' ? `Failed: ${detail.error}` : 'Reading the export…'}
          </p>
        </div>
        <button type="button" disabled={sendingAll || !readyToSend.length} onClick={sendAll} className="btn-primary text-sm">Send all ({readyToSend.length})</button>
      </div>

      <div className="flex flex-wrap gap-2">
        <div role="tablist" className="flex flex-wrap gap-2">
          {([['host', 'Host adverts'], ['guest', 'Guest requests']] as const).map(([value, label]) => (
            <button key={value} role="tab" aria-selected={tab === value} onClick={() => setTab(value)} className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${tab === value ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-700 hover:bg-ink-100'}`}>
              {label} <span className="opacity-70">{count(value)}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {([['open', 'To review'], ['sent', 'Sent'], ['all', 'All']] as const).map(([value, label]) => (
            <button key={value} onClick={() => setFilter(value)} className={`rounded-xl border px-3.5 py-2 text-sm font-medium ${filter === value ? 'border-ink-900 text-ink-900' : 'border-ink-100 text-ink-500 hover:text-ink-900'}`}>{label}</button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {shown.map(item => (
            <GroupItemCard key={item.itemId} item={item} busy={busyId === item.itemId} onSave={save(item)} onSend={send(item)} onSkip={skip(item)} />
          ))}
        </ul>
      )}
    </div>
  );
}
