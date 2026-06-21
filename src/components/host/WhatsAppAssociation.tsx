'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { initiateWhatsAppAssociation, confirmWhatsAppAssociation } from '@/graphql/mutations';

interface Props {
  existingWhatsappNumber?: string;
}

type Step = 'input' | 'code' | 'success';

/** Normalize a phone number to international format (Tanzania default for local numbers) */
function normalizePhone(input: string): string {
  let digits = input.replace(/\D/g, '');
  if (digits.startsWith('0') && digits.length === 10) {
    digits = '255' + digits.slice(1);
  } else if (digits.length === 9 && /^[67]/.test(digits)) {
    digits = '255' + digits;
  }
  return digits;
}

export default function WhatsAppAssociation({ existingWhatsappNumber }: Props) {
  const [step, setStep] = useState<Step>('input');
  const [phone, setPhone] = useState(existingWhatsappNumber || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleInitiate = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);

    const normalized = normalizePhone(phone);

    if (normalized.length < 10 || normalized.length > 15) {
      setError('Tafadhali weka nambari sahihi ya simu na country code (mfano 255789123456)');
      setLoading(false);
      return;
    }

    try {
      const result = await GraphQLClient.executeAuthenticated<{
        initiateWhatsAppAssociation: { success: boolean; message: string };
      }>(initiateWhatsAppAssociation, { whatsappNumber: normalized });

      setPhone(normalized);
      setMessage(result.initiateWhatsAppAssociation.message);
      setStep('code');
    } catch (e: any) {
      const raw = e?.errors?.[0]?.message || e?.message || '';
      const msg = raw.includes('non-nullable') || raw.includes('Cannot return null')
        ? 'Huduma hii haipatikani kwa sasa. Jaribu tena baadaye.'
        : raw || 'Imeshindikana kutuma code';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!code.trim() || code.length !== 5) return;
    setLoading(true);
    setError(null);

    try {
      const result = await GraphQLClient.executeAuthenticated<{
        confirmWhatsAppAssociation: { success: boolean; message: string };
      }>(confirmWhatsAppAssociation, { whatsappNumber: phone.trim(), code: code.trim() });

      setMessage(result.confirmWhatsAppAssociation.message);
      setStep('success');
    } catch (e: any) {
      const raw = e?.errors?.[0]?.message || e?.message || '';
      const msg = raw.includes('non-nullable') || raw.includes('Cannot return null')
        ? 'Huduma hii haipatikani kwa sasa. Jaribu tena baadaye.'
        : raw || 'Code si sahihi au imeisha muda. Jaribu tena.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
        <div className="text-center">
          <div className="text-4xl mb-3">✅</div>
          <h3 className="text-lg font-semibold text-ink-900 mb-2">Akaunti Imeunganishwa</h3>
          <p className="text-sm text-ink-500">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">🔗</span>
        <div>
          <h3 className="font-semibold text-ink-900">Unganisha WhatsApp</h3>
          <p className="text-xs text-ink-500">
            Unganisha nambari yako ya WhatsApp ili kuhamisha nyumba ulizosajili kupitia WhatsApp
          </p>
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1">
              Nambari ya WhatsApp
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="mfano 255712345678"
            />
            <p className="text-xs text-ink-400 mt-1">
              Weka country code bila + (mfano 255 kwa Tanzania)
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleInitiate}
            disabled={loading || !phone.trim()}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? 'Inatuma…' : 'Tuma Code'}
          </button>

          <p className="text-xs text-ink-400 text-center">
            Tutajaribu kukutumia code kwenye WhatsApp yako. Kama haijafika, tuma &quot;associate&quot; kwa nambari yetu ya WhatsApp.
          </p>

          <button
            onClick={() => setStep('code')}
            className="w-full py-2 text-sm text-green-600 hover:text-green-700"
          >
            Nina code tayari
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="space-y-3">
          {message && (
            <p className="text-sm text-green-600 bg-green-50 rounded-xl px-4 py-2">{message}</p>
          )}

          {!message && (
            <p className="text-sm text-ink-600 bg-ink-50 rounded-xl px-4 py-2">
              Tumetuma code kwenye <span className="font-medium">{phone}</span>. Kama haijafika, tuma &quot;associate&quot; kwa{' '}
              <a href="https://wa.me/255790720329?text=associate" target="_blank" rel="noopener noreferrer" className="text-green-600 font-medium hover:underline">
                +255 790 720 329
              </a>
            </p>
          )}

          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1">
              Code ya Tarakimu 5
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-center text-2xl tracking-widest font-mono"
              type="text"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder="00000"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            onClick={handleConfirm}
            disabled={loading || code.length !== 5}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? 'Inathibitisha…' : 'Unganisha Akaunti'}
          </button>

          <button
            onClick={() => { setStep('input'); setError(null); setCode(''); }}
            className="w-full py-2 text-sm text-ink-500 hover:text-ink-700"
          >
            ← Badilisha nambari
          </button>
        </div>
      )}
    </div>
  );
}
