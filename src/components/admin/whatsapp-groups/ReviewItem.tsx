'use client';

import { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, PaperAirplaneIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { GroupImportItem, GroupImportItemInput, STAYS_URL, formatMoney, postedLabel } from '@/lib/admin/groupImports';

const PHONE_SOURCES: Record<string, string> = {
  contacts: 'From the group’s contact list',
  admin: 'Confirmed by an admin',
  sender: 'The sender’s own number',
  'message-text': 'Written in the message, may be an agent',
};

const field = 'field-input w-full text-sm';
const quiet = 'rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-400 disabled:opacity-50';

interface Props {
  item: GroupImportItem;
  busy: boolean;
  onSave: (input: GroupImportItemInput) => Promise<void>;
  onSend: () => void;
  onSkip: () => void;
}

/** One advert or request found in the group: what was posted, what we'll send, and to whom */
export function ReviewItem({ item, busy, onSave, onSend, onSkip }: Props) {
  const [editing, setEditing] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [title, setTitle] = useState(item.draft?.title || '');
  const [area, setArea] = useState(item.draft?.area || '');
  const [rate, setRate] = useState(item.draft?.nightlyRate ? String(item.draft.nightlyRate) : '');
  const [currency, setCurrency] = useState(item.draft?.currency || 'TZS');
  const [summary, setSummary] = useState(item.request?.summary || '');
  const [phone, setPhone] = useState(item.phone ? `0${item.phone.slice(3)}` : '');

  const open = item.status === 'review' || item.status === 'failed';
  const isHost = item.kind === 'host';
  const heading = isHost ? item.draft?.title : item.request?.summary;
  const details = isHost
    ? [item.draft?.area || 'Area not stated', item.draft?.bedrooms != null ? (item.draft.bedrooms ? `${item.draft.bedrooms} bedroom${item.draft.bedrooms > 1 ? 's' : ''}` : 'Studio') : null, item.draft?.nightlyRate ? `${formatMoney(item.draft.nightlyRate, item.draft.currency)} a night` : 'Price not stated']
    : [item.request?.area, item.request?.checkIn ? `${item.request.checkIn} to ${item.request.checkOut || '?'}` : 'Dates not stated', item.request?.guests ? `${item.request.guests} guest${item.request.guests > 1 ? 's' : ''}` : null, item.request?.budget ? `up to ${formatMoney(item.request.budget, item.request.currency)}` : null];
  const longMessage = item.text.length > 220 || item.text.split('\n').length > 4;

  async function saveEdits() {
    const changes: GroupImportItemInput = {};
    if (phone.trim() && phone.replace(/\D/g, '').replace(/^0/, '255') !== (item.phone || '')) changes.phone = phone.trim();
    if (isHost) {
      if (title.trim() && title !== item.draft?.title) changes.title = title.trim();
      if (area.trim() && area !== item.draft?.area) changes.area = area.trim();
      if (rate && Number(rate) !== item.draft?.nightlyRate) Object.assign(changes, { nightlyRate: Number(rate), currency });
    } else if (summary.trim() && summary !== item.request?.summary) {
      changes.summary = summary.trim();
    }
    if (Object.keys(changes).length) await onSave(changes);
    setEditing(false);
  }

  return (
    <li className="grid gap-x-8 gap-y-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_17rem]">
      <div className="min-w-0">
        <p className="text-xs text-ink-500">
          <span className="font-medium text-ink-700">{item.sender.replace(/^~\s*/, '')}</span> · {postedLabel(item.postedAt)}
        </p>
        <h3 className="mt-1 text-[15px] font-semibold leading-snug text-ink-900 [text-wrap:balance]">{heading}</h3>
        <p className="mt-1 text-sm text-ink-600">{details.filter(Boolean).join(' · ')}</p>

        <div className="mt-3 rounded-lg bg-ink-50 px-3.5 py-2.5">
          <p className={`max-w-[70ch] whitespace-pre-wrap text-sm leading-relaxed text-ink-700 ${showAll ? '' : 'line-clamp-4'}`}>{item.text}</p>
          {longMessage && (
            <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-1 text-xs font-medium text-ink-700 hover:underline">
              {showAll ? 'Show less' : 'Show the whole message'}
            </button>
          )}
        </div>

        {!isHost && !!item.matches?.length && (
          <div className="mt-4">
            <p className="text-xs font-medium text-ink-500">Stays we’ll recommend</p>
            <ul className="mt-1.5 space-y-1">
              {item.matches.map((m) => (
                <li key={m.propertyId} className="flex flex-wrap items-baseline gap-x-2 text-sm">
                  <a href={`${STAYS_URL}/property/${m.propertyId}`} target="_blank" rel="noreferrer" className="font-medium text-ink-900 underline decoration-ink-300 underline-offset-2 hover:decoration-ink-500">{m.title}</a>
                  <span className="text-ink-500">{[m.area, m.nightlyRate ? `${formatMoney(m.nightlyRate, m.currency)} a night` : null].filter(Boolean).join(' · ')}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {editing && (
          <div className="mt-4 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-ink-600">Phone number<input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0712 345 678" inputMode="tel" /></label>
            {isHost ? (
              <>
                <label className="space-y-1 text-xs font-medium text-ink-600">Title<input className={field} value={title} onChange={(e) => setTitle(e.target.value)} /></label>
                <label className="space-y-1 text-xs font-medium text-ink-600">Area<input className={field} value={area} onChange={(e) => setArea(e.target.value)} /></label>
                <div className="flex gap-2">
                  <label className="flex-1 space-y-1 text-xs font-medium text-ink-600">Price a night<input className={field} type="number" min={1} inputMode="numeric" value={rate} onChange={(e) => setRate(e.target.value)} /></label>
                  <label className="w-24 space-y-1 text-xs font-medium text-ink-600">Currency
                    <select className={field} value={currency} onChange={(e) => setCurrency(e.target.value)}><option>TZS</option><option>USD</option></select>
                  </label>
                </div>
              </>
            ) : (
              <label className="space-y-1 text-xs font-medium text-ink-600 sm:col-span-1">What they’re looking for (shown in the message)<input className={field} value={summary} onChange={(e) => setSummary(e.target.value)} /></label>
            )}
            <div className="flex justify-end gap-2 sm:col-span-2">
              <button type="button" onClick={() => setEditing(false)} className={quiet}>Cancel</button>
              <button type="button" disabled={busy} onClick={saveEdits} className="rounded-lg bg-ink-900 px-4 py-1.5 text-sm font-medium text-white hover:bg-ink-700 disabled:opacity-50">Save changes</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:border-l lg:border-ink-100 lg:pl-6">
        <div>
          <p className="text-xs font-medium text-ink-500">Send to</p>
          {item.phone ? (
            <>
              <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold tabular-nums text-ink-900">
                <PhoneIcon className="h-4 w-4 text-ink-400" aria-hidden />+{item.phone}
              </p>
              <p className="mt-0.5 text-xs text-ink-500">{PHONE_SOURCES[item.phoneSource || ''] || ''}</p>
            </>
          ) : item.phoneCandidates?.length ? (
            <>
              <p className="mt-1 text-sm text-ink-700">{item.phoneCandidates.length} members share this name. Which one posted?</p>
              <div className="mt-2 flex flex-col gap-1.5">
                {item.phoneCandidates.map((p) => (
                  <button key={p} type="button" disabled={busy || !open} onClick={() => onSave({ phone: p })}
                    className="rounded-lg border border-ink-200 px-3 py-1.5 text-left text-sm tabular-nums text-ink-800 hover:border-ink-500 hover:bg-ink-50 disabled:opacity-50">+{p}</button>
                ))}
              </div>
            </>
          ) : open ? (
            <form className="mt-1.5 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (newPhone.trim()) onSave({ phone: newPhone.trim() }); }}>
              <label className="sr-only" htmlFor={`phone-${item.itemId}`}>Phone number</label>
              <input id={`phone-${item.itemId}`} className={field} value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Add number" inputMode="tel" />
              <button type="submit" disabled={busy || !newPhone.trim()} className="rounded-lg border border-ink-200 px-3 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">Add</button>
            </form>
          ) : (
            <p className="mt-1 text-sm text-ink-500">No number</p>
          )}
        </div>

        {item.sendError && (
          <p className="flex gap-1.5 text-sm text-red-700"><ExclamationTriangleIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />{item.sendError}</p>
        )}

        {open ? (
          <div className="mt-auto flex flex-col gap-2">
            <button type="button" disabled={busy || !item.phone} onClick={onSend}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-ink-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-ink-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
              <PaperAirplaneIcon className="h-4 w-4" aria-hidden />{busy ? 'Working…' : 'Send notification'}
            </button>
            <div className="flex justify-center gap-1">
              <button type="button" disabled={busy} onClick={() => setEditing((e) => !e)} className={quiet}>{editing ? 'Close edit' : 'Edit'}</button>
              <button type="button" disabled={busy} onClick={onSkip} className={quiet}>Skip</button>
            </div>
          </div>
        ) : (
          <p className={`mt-auto flex items-center gap-1.5 text-sm font-medium ${item.status === 'sent' ? 'text-ink-700' : 'text-ink-500'}`}>
            {item.status === 'sent' ? <><CheckCircleIcon className="h-4 w-4" aria-hidden />Sent</> : item.status === 'queued' ? 'Sending…' : 'Skipped'}
          </p>
        )}
      </div>
    </li>
  );
}
