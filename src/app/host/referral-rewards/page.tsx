'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';

interface BookingReward {
  bookingId: string;
  referrerId: string;
  referrerName?: string | null;
  referrerPhone?: string | null;
  propertyId: string;
  checkOutDate: string;
  rewardStatus: string;
  maxAmount?: number | null;
  amount?: number | null;
  reviewNote?: string | null;
}

const STATUSES = [
  { id: 'PENDING_REVIEW', label: 'To review' },
  { id: 'AWAITING_STAY', label: 'Awaiting checkout' },
  { id: 'ELIGIBLE', label: 'Approved' },
  { id: 'REJECTED', label: 'Rejected' },
  { id: 'VOID', label: 'Void' },
];
const LIST = 'query ListBookingReferralRewards($status: String) { listBookingReferralRewards(status: $status) { bookingId referrerId referrerName referrerPhone propertyId checkOutDate rewardStatus maxAmount amount reviewNote } }';
const APPROVE = 'mutation ApproveBookingReferralReward($bookingId: ID!, $amount: Int!) { approveBookingReferralReward(bookingId: $bookingId, amount: $amount) { success } }';
const REJECT = 'mutation RejectBookingReferralReward($bookingId: ID!, $reason: String!) { rejectBookingReferralReward(bookingId: $bookingId, reason: $reason) { success } }';
const errorMessage = (err: any, fallback: string) => err?.errors?.[0]?.message || err?.message || fallback;

/** Admin review of booking referral rewards. Payment is made manually after approval. */
export default function ReferralRewardsPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [rewards, setRewards] = useState<BookingReward[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');

  const load = useCallback(() => {
    setRewards(null);
    setFailed(false);
    GraphQLClient.executeAuthenticated<{ listBookingReferralRewards: BookingReward[] }>(LIST, { status })
      .then(data => setRewards(data.listBookingReferralRewards))
      .catch(() => setFailed(true));
  }, [status]);
  useEffect(() => { if (user?.userType === 'ADMIN') load(); }, [user?.userType, load]);

  if (user?.userType !== 'ADMIN') return <p className="text-sm text-ink-500">This page is for Ndotoni admins.</p>;

  async function review(reward: BookingReward, approve: boolean) {
    setBusy(reward.bookingId);
    try {
      if (approve) await GraphQLClient.executeAuthenticated(APPROVE, { bookingId: reward.bookingId, amount: Number(amounts[reward.bookingId]) });
      else await GraphQLClient.executeAuthenticated(REJECT, { bookingId: reward.bookingId, reason: reasons[reward.bookingId] || '' });
      toast.success(approve ? 'Approved for payment' : 'Rejected');
      setRewards(list => list?.filter(r => r.bookingId !== reward.bookingId) ?? null);
    } catch (err) {
      toast.error(errorMessage(err, 'Review failed. Refresh and retry.'));
    } finally { setBusy(''); }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink-900">Booking referral rewards</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-500">Referred stays appear here the day after checkout, once paid and not cancelled. The maximum is this booking’s internal ceiling (never above TZS 10,000). Ten rewarded guests per referrer; repeat stays by a counted guest don’t use another place. Pay approved rewards manually.</p>
      </div>
      <div role="tablist" className="flex flex-wrap gap-2">
        {STATUSES.map(s => (
          <button key={s.id} role="tab" aria-selected={status === s.id} onClick={() => setStatus(s.id)} className={`rounded-xl px-3.5 py-2 text-sm font-medium transition-colors ${status === s.id ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-700 hover:bg-ink-100'}`}>{s.label}</button>
        ))}
      </div>
      {failed ? (
        <div role="alert" className="rounded-xl border border-ink-200 p-4 text-sm">Couldn’t load rewards. <button onClick={load} className="font-semibold text-brand-700 underline">Retry</button></div>
      ) : !rewards ? (
        <div role="status" aria-label="Loading" className="space-y-3">{[0, 1, 2].map(i => <div key={i} className="h-24 animate-pulse rounded-xl bg-ink-50" />)}</div>
      ) : !rewards.length ? (
        <p className="rounded-xl border border-dashed border-ink-200 p-8 text-center text-sm text-ink-500">Nothing here.</p>
      ) : (
        <ul className="space-y-3">
          {rewards.map(r => (
            <li key={r.bookingId} className="rounded-xl border border-ink-100 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
                <div className="space-y-0.5">
                  <p className="font-semibold text-ink-900">Booking {r.bookingId}</p>
                  <p className="text-ink-500">Checked out {r.checkOutDate} · <Link href={`/property/${r.propertyId}`} className="underline">Stay</Link></p>
                  <p className="text-ink-700">Pay <strong>{r.referrerName || 'Referrer'}</strong>{r.referrerPhone ? <> · <a href={`tel:${r.referrerPhone}`} className="underline">{r.referrerPhone}</a></> : <> · <code className="text-xs">{r.referrerId}</code></>}</p>
                </div>
                <p className="text-right text-ink-700">
                  {r.amount ? <>Approved <strong>TZS {r.amount.toLocaleString()}</strong></> : r.maxAmount ? <>Up to <strong>TZS {r.maxAmount.toLocaleString()}</strong></> : null}
                  {r.reviewNote && <span className="block text-xs text-ink-500">{r.reviewNote}</span>}
                </p>
              </div>
              {r.rewardStatus === 'PENDING_REVIEW' && (
                <div className="mt-4 grid gap-3 border-t border-ink-100 pt-4 sm:grid-cols-2">
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`amount-${r.bookingId}`}>Amount (TZS)</label>
                    <input id={`amount-${r.bookingId}`} type="number" min={1} max={r.maxAmount ?? undefined} step={1} placeholder={`Amount, max ${r.maxAmount?.toLocaleString()}`} value={amounts[r.bookingId] || ''} onChange={e => setAmounts(a => ({ ...a, [r.bookingId]: e.target.value }))} className="field-input" />
                    <button disabled={busy === r.bookingId || !amounts[r.bookingId]} onClick={() => review(r, true)} className="btn-primary shrink-0 text-sm">Approve</button>
                  </div>
                  <div className="flex gap-2">
                    <label className="sr-only" htmlFor={`reason-${r.bookingId}`}>Reason</label>
                    <input id={`reason-${r.bookingId}`} placeholder="Reason to reject" value={reasons[r.bookingId] || ''} onChange={e => setReasons(a => ({ ...a, [r.bookingId]: e.target.value }))} className="field-input" />
                    <button disabled={busy === r.bookingId || !reasons[r.bookingId]?.trim()} onClick={() => review(r, false)} className="shrink-0 rounded-xl border border-ink-200 px-4 text-sm font-medium text-ink-700 hover:bg-ink-50 disabled:opacity-50">Reject</button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
