'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GroupImport, GroupImportsApi, GroupOutreachSettings } from '@/lib/admin/groupImports';

const STATUS_STYLES: Record<string, string> = {
  queued: 'bg-blue-50 text-blue-800',
  processing: 'bg-blue-50 text-blue-800',
  done: 'bg-green-50 text-green-800',
  failed: 'bg-red-50 text-red-700',
};

/** Admin: WhatsApp group exports → adverts and requests to review and send */
export default function GroupImportsPage() {
  const { user } = useAuth();
  const isAdmin = user?.userType === 'ADMIN';
  const [imports, setImports] = useState<GroupImport[] | null>(null);
  const [settings, setSettings] = useState<GroupOutreachSettings | null>(null);
  const [failed, setFailed] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [contactsGroup, setContactsGroup] = useState('');
  const exportInput = useRef<HTMLInputElement>(null);
  const contactsInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const [list, s] = await Promise.all([GroupImportsApi.list(), GroupImportsApi.settings()]);
      setImports(list);
      setSettings(s);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, []);

  useEffect(() => { if (isAdmin) load(); }, [isAdmin, load]);
  useEffect(() => {
    if (!imports?.some(i => i.status === 'queued' || i.status === 'processing')) return;
    const timer = setInterval(load, 4000);
    return () => clearInterval(timer);
  }, [imports, load]);

  if (!isAdmin) return <p className="text-sm text-ink-500">This page is for Ndotoni admins.</p>;

  async function uploadExport(file?: File) {
    if (!file) return;
    setUploading(true);
    try {
      await GroupImportsApi.upload(file, groupName.trim() || undefined);
      toast.success('Uploaded. New adverts and requests appear in a minute or two.');
      setGroupName('');
      await load();
    } catch (err) {
      toast.error(GroupImportsApi.errorText(err, 'Upload failed.'));
    } finally {
      setUploading(false);
      if (exportInput.current) exportInput.current.value = '';
    }
  }

  async function uploadContacts(file?: File) {
    if (!file) return;
    try {
      const r = await GroupImportsApi.importContacts(await file.text(), file.name, contactsGroup.trim() || undefined);
      if (!r.saved) toast.error('No numbers saved. Each row needs name, phone and group (or fill in the group name).');
      else toast.success(`${r.saved} numbers saved.${r.conflicts.length ? ` ${r.conflicts.length} names match more than one number.` : ''}`);
    } catch (err) {
      toast.error(GroupImportsApi.errorText(err, 'Could not read the contacts file.'));
    } finally {
      if (contactsInput.current) contactsInput.current.value = '';
    }
  }

  async function toggleAutoSend() {
    if (!settings) return;
    const next = !settings.autoSend;
    if (next && !window.confirm('Turn on auto-send? Every advert and request with a number will be messaged right after each import, without review.')) return;
    try {
      setSettings(await GroupImportsApi.setAutoSend(next));
    } catch (err) {
      toast.error(GroupImportsApi.errorText(err, 'Could not change auto-send.'));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">WhatsApp group imports</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">Upload a group export (Export chat → Without media). We find host adverts and guest requests, recommend stays, and you send the first WhatsApp message after checking them.</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-ink-100 p-4">
          <h2 className="font-semibold text-ink-900">Upload an export</h2>
          <p className="mt-1 text-sm text-ink-500">The .zip or .txt WhatsApp makes. Only messages newer than the last import are read.</p>
          <label className="mt-3 block text-xs text-ink-500">Group name (optional)<input className="field-input" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="Dalali Bookings" /></label>
          <input ref={exportInput} type="file" accept=".zip,.txt" hidden onChange={e => uploadExport(e.target.files?.[0])} />
          <button type="button" disabled={uploading} onClick={() => exportInput.current?.click()} className="btn-primary mt-3 text-sm">{uploading ? 'Uploading…' : 'Choose export'}</button>
        </section>
        <section className="rounded-xl border border-ink-100 p-4">
          <h2 className="font-semibold text-ink-900">Group contacts</h2>
          <p className="mt-1 text-sm text-ink-500">The weekly name → number list (CSV with name, phone, group, or JSON).</p>
          <label className="mt-3 block text-xs text-ink-500">Group name (if the file has no group column)<input className="field-input" value={contactsGroup} onChange={e => setContactsGroup(e.target.value)} /></label>
          <input ref={contactsInput} type="file" accept=".csv,.json" hidden onChange={e => uploadContacts(e.target.files?.[0])} />
          <button type="button" onClick={() => contactsInput.current?.click()} className="mt-3 rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50">Choose contacts file</button>
        </section>
        <section className="rounded-xl border border-ink-100 p-4">
          <h2 className="font-semibold text-ink-900">Sending</h2>
          {settings && (
            <>
              <p className="mt-1 text-sm text-ink-500">{settings.sentToday} of {settings.dailyCap} sent today.</p>
              <div className="mt-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-ink-900">Auto-send</p>
                  <p className="text-xs text-ink-500">{settings.autoSend ? 'On: imports send without review.' : 'Off: you review and send.'}</p>
                </div>
                <button type="button" role="switch" aria-checked={settings.autoSend} aria-label="Auto-send" onClick={toggleAutoSend}
                  className={`relative h-6 w-11 rounded-full transition-colors ${settings.autoSend ? 'bg-brand-600' : 'bg-ink-200'}`}>
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${settings.autoSend ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="font-semibold text-ink-900">Imports</h2>
        {failed ? (
          <div role="alert" className="rounded-xl border border-ink-200 p-4 text-sm">Couldn’t load imports. <button onClick={load} className="font-semibold text-brand-700 underline">Retry</button></div>
        ) : !imports ? (
          <div role="status" aria-label="Loading" className="space-y-3">{[0, 1].map(i => <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-50" />)}</div>
        ) : !imports.length ? (
          <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">No imports yet.</p>
        ) : (
          <ul className="space-y-3">
            {imports.map(i => (
              <li key={i.importId}>
                <Link href={`/host/group-imports/${i.importId}`} className="block rounded-xl border border-ink-100 p-4 hover:border-ink-300">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink-900">{i.groupName || i.filename}</p>
                      <p className="text-xs text-ink-500">{new Date(i.createdAt).toLocaleString()} · {i.filename}</p>
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[i.status] || ''}`}>{i.status === 'processing' ? 'reading…' : i.status}</span>
                  </div>
                  <p className={`mt-2 text-sm ${i.status === 'failed' ? 'text-red-700' : 'text-ink-600'}`}>
                    {i.status === 'failed' ? i.error : `${i.newMessages} new messages · ${i.hosts} adverts · ${i.guests} requests · ${i.itemCount} to review${i.withoutPhone ? ` · ${i.withoutPhone} without a number` : ''}${i.refused ? ` · ${i.refused} unreadable` : ''}`}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
