'use client';

import { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { GraphQLClient } from '@/lib/graphql-client';
import { initiateWhatsAppAssociation, confirmWhatsAppAssociation } from '@/graphql/mutations';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';

// Ndotoni's one WhatsApp number for everyone
const WHATSAPP_NUMBER = '255790720329';
const WHATSAPP_DISPLAY = '+255 790 720 329';

interface Props {
  existingWhatsappNumber?: string;
}

/**
 * input → code (a 5-digit code reached their WhatsApp) or confirmLink (outside the 24-hour window
 * before the code template is approved: a "Confirm number" button there links the account they
 * sign in with) → success
 */
type Step = 'input' | 'code' | 'confirmLink' | 'success';

const digitsOf = (value?: string | null) => (value || '').replace(/\D/g, '');

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
  const { t } = useLanguage();
  const { user, refreshUser } = useAuth();
  const [step, setStep] = useState<Step>('input');
  const [phone, setPhone] = useState(existingWhatsappNumber || '');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notYet, setNotYet] = useState(false);

  // Confirmed from the WhatsApp message: the account now has this number
  useEffect(() => {
    if (step === 'confirmLink' && phone && digitsOf(user?.whatsappNumber) === digitsOf(phone)) {
      setMessage(t('wa.link.success.linked'));
      setStep('success');
    }
  }, [step, phone, user?.whatsappNumber, t]);

  const handleCheckLinked = async () => {
    setLoading(true);
    setNotYet(false);
    try {
      await refreshUser();
    } finally {
      setLoading(false);
      // If the effect above didn't move on to success, it isn't linked yet
      setNotYet(true);
    }
  };

  const handleInitiate = async () => {
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);

    const normalized = normalizePhone(phone);

    if (normalized.length < 10 || normalized.length > 15) {
      setError(t('wa.link.invalidPhone'));
      setLoading(false);
      return;
    }

    try {
      const result = await GraphQLClient.executeAuthenticated<{
        initiateWhatsAppAssociation: { success: boolean; message: string; sentBy?: string | null };
      }>(initiateWhatsAppAssociation, { whatsappNumber: normalized });

      setPhone(normalized);
      setMessage(result.initiateWhatsAppAssociation.message);
      setNotYet(false);
      setStep(result.initiateWhatsAppAssociation.sentBy === 'CONFIRM_LINK' ? 'confirmLink' : 'code');
    } catch (e: any) {
      const raw = e?.errors?.[0]?.message || e?.message || '';
      const msg = raw.includes('non-nullable') || raw.includes('Cannot return null')
        ? t('wa.link.unavailable')
        : raw || t('wa.link.unavailable');
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
        ? t('wa.link.unavailable')
        : raw || t('wa.link.invalidCode');
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const whatsappLink = (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=associate`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-green-600 font-medium hover:underline"
    >
      {WHATSAPP_DISPLAY}
    </a>
  );

  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
        <div className="text-center">
          <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-ink-900 mb-2">{t('wa.link.success.title')}</h3>
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
          <h3 className="font-semibold text-ink-900">{t('wa.link.title')}</h3>
          <p className="text-xs text-ink-500">{t('wa.link.desc')}</p>
        </div>
      </div>

      {step === 'input' && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1">
              {t('wa.link.phoneLabel')}
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t('wa.link.phonePlaceholder')}
            />
            <p className="text-xs text-ink-400 mt-1">{t('wa.link.phoneHint')}</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleInitiate}
            disabled={loading || !phone.trim()}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? t('wa.link.sending') : t('wa.link.sendCode')}
          </button>

          <p className="text-xs text-ink-400 text-center">
            {t('wa.link.codeHint')}{' '}{whatsappLink}
          </p>

          <button
            onClick={() => setStep('code')}
            className="w-full py-2 text-sm text-green-600 hover:text-green-700"
          >
            {t('wa.link.haveCode')}
          </button>
        </div>
      )}

      {step === 'confirmLink' && (
        <div className="space-y-3">
          <p className="text-sm text-ink-600 bg-ink-50 rounded-xl px-4 py-2">
            {t('wa.link.confirmSent').replace('{phone}', phone)}
          </p>

          {notYet && <p className="text-sm text-amber-700">{t('wa.link.notYet')}</p>}

          <button
            onClick={handleCheckLinked}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? t('wa.link.checking') : t('wa.link.confirmed')}
          </button>

          <button
            onClick={() => { setStep('input'); setError(null); setNotYet(false); }}
            className="w-full py-2 text-sm text-ink-500 hover:text-ink-700"
          >
            {t('wa.link.changeNumber')}
          </button>
        </div>
      )}

      {step === 'code' && (
        <div className="space-y-3">
          <p className="text-sm text-ink-600 bg-ink-50 rounded-xl px-4 py-2">
            {t('wa.link.codeSent').replace('{phone}', phone)}{' '}{whatsappLink}
          </p>

          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1">
              {t('wa.link.codeLabel')}
            </label>
            <input
              className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-center text-2xl tracking-widest font-mono"
              type="text"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
              placeholder={t('wa.link.codePlaceholder')}
              autoFocus
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={loading || code.length !== 5}
            className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
          >
            {loading ? t('wa.link.verifying') : t('wa.link.verify')}
          </button>

          <button
            onClick={() => { setStep('input'); setError(null); setCode(''); }}
            className="w-full py-2 text-sm text-ink-500 hover:text-ink-700"
          >
            {t('wa.link.changeNumber')}
          </button>
        </div>
      )}
    </div>
  );
}
