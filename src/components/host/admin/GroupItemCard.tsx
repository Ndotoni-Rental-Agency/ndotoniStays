'use client';

import { useState } from 'react';
import Link from 'next/link';
import { GroupImportItem, GroupImportItemInput, formatMoney } from '@/lib/admin/groupImports';

const STATUS: Record<string, { label: string; style: string }> = {
  review: { label: 'To review', style: 'bg-amber-50 text-amber-800' },
  queued: { label: 'Sending…', style: 'bg-blue-50 text-blue-800' },
  sent: { label: 'Sent', style: 'bg-green-50 text-green-800' },
  skipped: { label: 'Skipped', style: 'bg-ink-50 text-ink-600' },
  failed: { label: 'Not sent', style: 'bg-red-50 text-red-700' },
};
const PHONE_SOURCES: Record<string, string> = {
  contacts: 'from the group contacts list',
  admin: 'confirmed by an admin',
  sender: 'the sender’s number',
  'message-text': 'written in the message (may be an agent)',
};

interface Props {
  item: GroupImportItem;
  busy: boolean;
  onSave: (input: GroupImportItemInput) => Promise<void>;
  onSend: () => void;
  onSkip: () => void;
}

/** One advert or request from a WhatsApp group export, for an admin to check and send */
export function GroupItemCard({ item, busy, onSave, onSend, onSkip }: Props) {
  const [editing, setEditing] = useState(false);
  const [phone, setPhone] = useState(item.phone ? `+${item.phone}` : '');
  const [title, setTitle] = useState(item.draft?.title || '');
  const [area, setArea] = useState(item.draft?.area || '');
  const [rate, setRate] = useState(item.draft?.nightlyRate ? String(item.draft.nightlyRate) : '');
  const [currency, setCurrency] = useState(item.draft?.currency || 'TZS');
  const [summary, setSummary] = useState(item.request?.summary || '');
  const open = item.status === 'review' || item.status === 'failed';
  const status = STATUS[item.status] || { label: item.status, style: '' };

  async function save() {
    const changes: GroupImportItemInput = {};
    if (phone.trim() && phone.replace(/\D/g, '') !== (item.phone || '')) changes.phone = phone.trim();
    if (item.kind === 'host') {
      if (title.trim() && title !== item.draft?.title) changes.title = title.trim();
      if (area.trim() && area !== item.draft?.area) changes.area = area.trim();
      if (rate && Number(rate) !== item.draft?.nightlyRate) Object.assign(changes, { nightlyRate: Number(rate), currency });
    } else if (summary.trim() && summary !== item.request?.summary) {
      changes.summary = summary.trim();
    }
    await onSave(changes);
    setEditing(false);
  }

  const details = item.kind === 'host' && item.draft
    ? [item.draft.area || 'Area unknown', item.draft.bedrooms != null ? (item.draft.bedrooms ? `${item.draft.bedrooms} bedroom(s)` : 'Studio') : '', item.draft.nightlyRate ? `${formatMoney(item.draft.nightlyRate, item.draft.currency)} / night` : '']
    : [item.request?.area, item.request?.checkIn ? `${item.request.checkIn} → ${item.request.checkOut || '?'}` : '', item.request?.guests ? `${item.request.guests} guest(s)` : '', item.request?.budget ? `budget ${formatMoney(item.request.budget, item.request.currency)}` : ''];

  return (
    <li className="rounded-xl border border-ink-100 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{item.kind === 'host' ? 'Host advert' : 'Guest request'} · {item.sender} · {item.postedAt.replace('T', ' ').slice(0, 16)}</p>
          <p className="mt-1 font-semibold text-ink-900 break-words">{item.kind === 'host' ? item.draft?.title : item.request?.summary}</p>
          <p className="mt-0.5 text-sm text-ink-600">{details.filter(Boolean).join(' · ')}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${status.style}`}>{status.label}</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <p className="max-h-48 overflow-y-auto whitespace-pre-wrap rounded-xl bg-ink-50 p-3 text-sm text-ink-700">{item.text}</p>
        <div className="space-y-3 text-sm">
          {item.kind === 'guest' && (
            <div>
              <p className="mb-1.5 text-xs font-medium text-ink-500">Recommended stays (sent with the message)</p>
              <ul className="space-y-1.5">
                {(item.matches || []).map(m => (
                  <li key={m.propertyId}>
                    <Link href={`/property/${m.propertyId}`} target="_blank" className="font-medium text-brand-700 underline">{m.title}</Link>
                    <span className="text-ink-500"> {[m.area, formatMoney(m.nightlyRate, m.currency)].filter(Boolean).join(' · ')}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {item.phone ? (
            <p className="text-ink-700">📱 +{item.phone} <span className="text-ink-500">{PHONE_SOURCES[item.phoneSource || ''] || ''}</span></p>
          ) : item.phoneCandidates?.length ? (
            <div>
              <p className="text-amber-800">This name matches {item.phoneCandidates.length} numbers in the group. Pick one:</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {item.phoneCandidates.map(p => (
                  <button key={p} type="button" disabled={busy || !open} onClick={() => onSave({ phone: p })} className="rounded-full border border-ink-200 px-3 py-1 text-xs hover:bg-ink-50 disabled:opacity-50">+{p}</button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-amber-800">No number yet: add it before sending.</p>
          )}
          {item.sendError && <p className="text-red-700">{item.sendError}</p>}
        </div>
      </div>

      {editing && (
        <div className="mt-4 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
          <label className="text-xs text-ink-500">Phone number<input className="field-input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0712 345 678" /></label>
          {item.kind === 'host' ? (
            <>
              <label className="text-xs text-ink-500">Title<input className="field-input" value={title} onChange={e => setTitle(e.target.value)} /></label>
              <label className="text-xs text-ink-500">Area<input className="field-input" value={area} onChange={e => setArea(e.target.value)} /></label>
              <div className="flex gap-2">
                <label className="flex-1 text-xs text-ink-500">Nightly rate<input className="field-input" type="number" min={1} value={rate} onChange={e => setRate(e.target.value)} /></label>
                <label className="text-xs text-ink-500">Currency
                  <select className="field-input" value={currency} onChange={e => setCurrency(e.target.value)}><option>TZS</option><option>USD</option></select>
                </label>
              </div>
            </>
          ) : (
            <label className="text-xs text-ink-500">Request summary (shown in the message)<input className="field-input" value={summary} onChange={e => setSummary(e.target.value)} /></label>
          )}
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={() => setEditing(false)} className="px-3 py-2 text-sm text-ink-600">Cancel</button>
            <button type="button" disabled={busy} onClick={save} className="btn-primary text-sm">Save</button>
          </div>
        </div>
      )}

      {open && !editing && (
        <div className="mt-4 flex flex-wrap justify-end gap-2 border-t border-ink-100 pt-4">
          <button type="button" disabled={busy} onClick={() => setEditing(true)} className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">Edit</button>
          <button type="button" disabled={busy} onClick={onSkip} className="rounded-xl border border-ink-200 px-4 py-2 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">Skip</button>
          <button type="button" disabled={busy || !item.phone} onClick={onSend} title={item.phone ? '' : 'Add a number first'} className="btn-primary text-sm">Send notification</button>
        </div>
      )}
    </li>
  );
}
