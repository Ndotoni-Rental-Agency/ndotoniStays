'use client';
import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

type Program = { programVersion: string; status: string; collector: string; purpose: string; allocationPolicy: string; feePolicy: string; feeMode: string; transferSchedule: string; refundContact: string; privacyUrl: string; fundId: string; };
type Attempt = { programVersion: string; idempotencyKey: string; accessToken: string; amountTZS: number; name: string; email: string; phone: string; };
type Receipt = { id: string; status: string; amountTZS: number; currency: string; refundedTZS?: number; transferredTZS?: number; };
const STORAGE = 'ndotoni-education-donation-attempt';
const validProgram = (p: Program) => p?.status === 'active' && /^[0-9a-f]{64}$/.test(p.programVersion || '') && (['collector', 'purpose', 'allocationPolicy', 'feePolicy', 'transferSchedule', 'refundContact', 'fundId'] as const).every(k => typeof p[k] === 'string' && p[k].trim()) && /^https:\/\//.test(p.privacyUrl || '') && ['deduct', 'ndotoni_covers'].includes(p.feeMode);

export default function DonationCheckout() {
  const { language } = useLanguage();
  const sw = language === 'sw';
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('10000');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const attemptRef = useRef<Attempt | null>(null);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    fetch('/api/donations/config', { cache: 'no-store' }).then(r => r.json()).then(p => { if (mounted.current) setProgram(p); }).catch(() => {}).finally(() => { if (mounted.current) setLoading(false); });
    try {
      const stored = JSON.parse(sessionStorage.getItem(STORAGE) || 'null');
      if (stored?.idempotencyKey && stored?.accessToken) { attemptRef.current = stored; setAttempt(stored); }
    } catch { /* A storage error does not block a new checkout. */ }
    return () => { mounted.current = false; };
  }, []);
  const active = program && validProgram(program);
  async function request(saved: Attempt) {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/donations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(saved), signal: AbortSignal.timeout(25000) });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 400 || data.code === 'PROGRAM_CHANGED') { try { sessionStorage.removeItem(STORAGE); } catch {} attemptRef.current = null; setAttempt(null); }
        if (data.code === 'PROGRAM_CHANGED') {
          setProgram(null); setLoading(true);
          try { const updated = await fetch('/api/donations/config', { cache: 'no-store' }); setProgram(await updated.json()); } finally { setLoading(false); }
        }
        throw new Error(data.error || 'Payment could not be verified.');
      }
      setReceipt(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Payment could not be verified.'); }
    finally { setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || attemptRef.current) return;
    const form = new FormData(event.currentTarget);
    const saved: Attempt = { programVersion: program!.programVersion, idempotencyKey: crypto.randomUUID(), accessToken: crypto.randomUUID(), amountTZS: Number(amount), phone: String(form.get('phone')), name: String(form.get('name')), email: String(form.get('email')) };
    attemptRef.current = saved; setAttempt(saved);
    // Preserve the identical request after timeouts/reloads. Contains no PIN/card details.
    try { sessionStorage.setItem(STORAGE, JSON.stringify(saved)); } catch { /* In-memory retry remains available. */ }
    await request(saved);
  }
  async function check() {
    if (!attemptRef.current || busy) return;
    setBusy(true); setError('');
    try {
      const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(attemptRef.current.idempotencyKey));
      const id = Array.from(new Uint8Array(bytes)).map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 30);
      const response = await fetch(`/api/donations/${id}`, { headers: { 'X-Donation-Access-Token': attemptRef.current.accessToken }, cache: 'no-store', signal: AbortSignal.timeout(25000) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Payment could not be verified.');
      setReceipt(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Payment could not be verified.'); }
    finally { setBusy(false); }
  }
  const complete = receipt && ['CONFIRMED', 'FAILED', 'EXPIRED', 'VOIDED'].includes(receipt.status);
  const field = 'mt-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-3 text-gray-900';
  const button = 'rounded-lg bg-green-700 px-5 py-3 font-semibold text-white disabled:opacity-50';
  return (
    <main className="mx-auto max-w-2xl bg-white px-6 py-12 text-gray-900">
      <Link href="/impact" className="text-green-700 underline">{sw ? 'Dhamira yetu ya elimu' : 'Our education mission'}</Link>
      <h1 className="mt-6 text-3xl font-bold">{sw ? 'Saidia mwanafunzi kupata elimu' : 'Help a student access education'}</h1>
      <p className="mt-4 leading-relaxed">{sw ? 'Michango ya wateja ni nyongeza ya ahadi ya Ndotoni ya kutoa 15% ya faida yake ya mwaka.' : 'Customer donations are additional to Ndotoni’s commitment to contribute 15% of its annual profit.'}</p>
      {loading ? <p role="status" className="mt-8">{sw ? 'Inapakia…' : 'Loading…'}</p> : !active && (
        <section className="mt-8 rounded-xl border border-gray-300 p-6">
          <h2 className="text-xl font-semibold">{sw ? 'Michango haijafunguliwa kwa sasa' : 'Donations are not open at this time'}</h2>
          <p className="mt-3">{sw ? 'Taarifa za mpokeaji, matumizi, ada na ratiba ya kuwasilisha michango zitaonekana kabla ya kuchangia.' : 'The collector, use of funds, fees and transfer schedule will be shown before donations open.'}</p>
        </section>
      )}
      {active && (
        <section className="mt-8 rounded-xl border border-gray-300 p-6">
          <h2 className="text-xl font-semibold">{sw ? 'Jinsi mchango wako unavyotumika' : 'How your donation is handled'}</h2>
          <dl className="mt-4 space-y-4">
            {[[sw ? 'Anayekusanya' : 'Collected by', program.collector], [sw ? 'Dhamira' : 'Purpose', program.purpose], [sw ? 'Ugawaji' : 'Allocation', program.allocationPolicy], [sw ? 'Ada' : 'Fees', program.feePolicy], [sw ? 'Ratiba ya kuwasilisha' : 'Transfer schedule', program.transferSchedule], [sw ? 'Msaada na marejesho' : 'Support and refunds', program.refundContact]].map(([label, value]) => <div key={label}><dt className="font-semibold">{label}</dt><dd className="mt-1 leading-relaxed">{value}</dd></div>)}
          </dl>
          <a className="mt-4 inline-block text-green-700 underline" href={program.privacyUrl} target="_blank" rel="noopener noreferrer">{sw ? 'Faragha ya taarifa zako' : 'Privacy information'}</a>
        </section>
      )}
      {active && !attempt && (
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block font-medium">{sw ? 'Kiasi (TZS)' : 'Amount (TZS)'}<input className={field} type="number" min="1000" max="1000000" step="1" required value={amount} onChange={e => setAmount(e.target.value)} /></label>
          <label className="block font-medium">{sw ? 'Jina lako' : 'Your name'}<input className={field} name="name" autoComplete="name" maxLength={100} required /></label>
          <label className="block font-medium">{sw ? 'Barua pepe' : 'Email'}<input className={field} name="email" type="email" autoComplete="email" maxLength={254} required /></label>
          <label className="block font-medium">{sw ? 'Namba ya simu ya malipo' : 'Mobile-money phone number'}<input className={field} name="phone" type="tel" autoComplete="tel" placeholder="0712 345 678" required /></label>
          <p className="text-sm leading-relaxed">{sw ? 'Thibitisha malipo kwenye simu yako. Usiweke PIN yako hapa. Risiti ya malipo si uthibitisho wa punguzo la kodi.' : 'Approve the payment on your phone. Never enter your PIN here. Payment acknowledgement does not establish tax deductibility.'}</p>
          <button className={button} disabled={busy} type="submit">{sw ? `Changia TZS ${Number(amount).toLocaleString()}` : `Donate TZS ${Number(amount).toLocaleString()}`}</button>
        </form>
      )}
      {attempt && (
        <section aria-live="polite" className="mt-8 rounded-xl border border-gray-300 p-6">
          <h2 className="text-xl font-semibold">{receipt?.status === 'CONFIRMED' ? (sw ? 'Asante kwa mchango wako' : 'Thank you for your donation') : complete ? (sw ? 'Malipo hayajakamilika' : 'Payment did not complete') : (sw ? 'Inasubiri uthibitisho wa malipo' : 'Awaiting payment confirmation')}</h2>
          <p className="mt-3">TZS {attempt.amountTZS.toLocaleString()}</p>
          {receipt && <p className="mt-2 break-all text-sm">{sw ? 'Namba ya kumbukumbu' : 'Receipt reference'}: {receipt.id}</p>}
          {!complete && <p className="mt-3">{sw ? 'Thibitisha kwenye simu yako, kisha angalia hali ya malipo. Usianzishe malipo mengine wakati unasubiri.' : 'Approve on your phone, then check payment status. Avoid starting another payment while this one is unresolved.'}</p>}
          {!!receipt?.refundedTZS && <p className="mt-3">{sw ? 'Kiasi kilichorejeshwa' : 'Refund recorded'}: TZS {receipt.refundedTZS.toLocaleString()}</p>}
          <div className="mt-5 flex flex-wrap gap-3">
            <button type="button" className={button} disabled={busy} onClick={check}>{sw ? 'Angalia hali' : 'Check status'}</button>
            {!complete && active && <button type="button" className="rounded-lg border border-gray-300 px-4 py-3" disabled={busy} onClick={() => request(attempt)}>{sw ? 'Jaribu ombi hili tena' : 'Retry this request'}</button>}
            {complete && <button type="button" className="rounded-lg border border-gray-300 px-4 py-3" disabled={busy} onClick={() => { try { sessionStorage.removeItem(STORAGE); } catch {} attemptRef.current = null; setAttempt(null); setReceipt(null); setError(''); }}>{sw ? 'Rudi kwenye fomu' : 'Return to the form'}</button>}
          </div>
          <p className="mt-4 text-sm">{sw ? 'Taarifa za ombi hili zinahifadhiwa kwa muda kwenye kichupo hiki ili kuzuia malipo yanayojirudia.' : 'This request is temporarily saved in this browser tab so retries use the same payment request.'}</p>
        </section>
      )}
      {busy && <p role="status" className="mt-5">{sw ? 'Inathibitisha…' : 'Verifying…'}</p>}
      {error && <p role="alert" className="mt-5 text-red-700">{sw ? 'Hatukuweza kuthibitisha ombi. ' : ''}{error}</p>}
    </main>
  );
}
