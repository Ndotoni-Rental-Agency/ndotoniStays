'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { updateUser } from '@/graphql/mutations';

type PayoutMethod = 'MPESA' | 'BANK';

interface PayoutFormData {
  payoutMethod: PayoutMethod;
  payoutMpesaPhone: string;
  payoutMpesaName: string;
  payoutBankName: string;
  payoutBankAccountName: string;
  payoutBankAccountNumber: string;
  payoutBankBranch: string;
}

const TANZANIA_BANKS = [
  'CRDB Bank',
  'NMB Bank',
  'NBC Bank',
  'Equity Bank',
  'Stanbic Bank',
  'Standard Chartered',
  'DTB Bank',
  'Exim Bank',
  'Absa Bank (Barclays)',
  'Bank of Africa',
  'I&M Bank',
  'KCB Bank',
  'Amana Bank',
  'Azania Bank',
  'BOT (Bank of Tanzania)',
  'PBZ (Peoples Bank of Zanzibar)',
  'TPB (Tanzania Postal Bank)',
  'TIB Development Bank',
  'Maendeleo Bank',
  'Mwalimu Commercial Bank',
];

export default function PayoutsPage() {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<PayoutFormData>({
    payoutMethod: 'MPESA',
    payoutMpesaPhone: '',
    payoutMpesaName: '',
    payoutBankName: '',
    payoutBankAccountName: '',
    payoutBankAccountNumber: '',
    payoutBankBranch: '',
  });

  // Load existing payout preferences
  const savedData = user ? (user as unknown as Record<string, string | undefined>) : null;
  const hasSavedPayout = savedData?.payoutMethod;

  useEffect(() => {
    if (user) {
      console.log('[Payouts] User object:', JSON.stringify(user, null, 2));
      const u = user as unknown as Record<string, string | undefined>;
      setFormData({
        payoutMethod: (u.payoutMethod as PayoutMethod) || 'MPESA',
        payoutMpesaPhone: '',
        payoutMpesaName: u.payoutMpesaName || '',
        payoutBankName: u.payoutBankName || '',
        payoutBankAccountName: u.payoutBankAccountName || '',
        payoutBankAccountNumber: '',
        payoutBankBranch: u.payoutBankBranch || '',
      });
      // If no payout method saved yet, start in editing mode
      if (!u.payoutMethod) {
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (formData.payoutMethod === 'MPESA') {
      const digits = formData.payoutMpesaPhone.replace(/\D/g, '');
      if (digits.length < 9 || digits.length > 12) {
        setError('Tafadhali weka nambari sahihi ya M-Pesa');
        setLoading(false);
        return;
      }
      if (!formData.payoutMpesaName.trim()) {
        setError('Tafadhali weka jina la M-Pesa');
        setLoading(false);
        return;
      }
    } else {
      if (!formData.payoutBankName) {
        setError('Tafadhali chagua benki');
        setLoading(false);
        return;
      }
      if (!formData.payoutBankAccountName.trim()) {
        setError('Tafadhali weka jina la akaunti');
        setLoading(false);
        return;
      }
      if (!formData.payoutBankAccountNumber.trim()) {
        setError('Tafadhali weka nambari ya akaunti');
        setLoading(false);
        return;
      }
    }

    try {
      // Normalize MPESA phone
      let mpesaPhone = formData.payoutMpesaPhone.replace(/\D/g, '');
      if (mpesaPhone.startsWith('0') && mpesaPhone.length === 10) {
        mpesaPhone = '255' + mpesaPhone.slice(1);
      } else if (mpesaPhone.length === 9 && /^[67]/.test(mpesaPhone)) {
        mpesaPhone = '255' + mpesaPhone;
      }

      const input: Record<string, string | null> = {
        payoutMethod: formData.payoutMethod,
      };

      if (formData.payoutMethod === 'MPESA') {
        input.payoutMpesaPhone = mpesaPhone;
        input.payoutMpesaName = formData.payoutMpesaName.trim();
        // Clear bank fields
        input.payoutBankName = null;
        input.payoutBankAccountName = null;
        input.payoutBankAccountNumber = null;
        input.payoutBankBranch = null;
      } else {
        input.payoutBankName = formData.payoutBankName;
        input.payoutBankAccountName = formData.payoutBankAccountName;
        input.payoutBankAccountNumber = formData.payoutBankAccountNumber;
        input.payoutBankBranch = formData.payoutBankBranch || null;
        // Clear MPESA fields
        input.payoutMpesaPhone = null;
        input.payoutMpesaName = null;
      }

      await GraphQLClient.executeAuthenticated(updateUser, { input });
      setSuccess('Maelezo ya malipo yamehifadhiwa');
      setIsEditing(false);
      await refreshUser();
    } catch (e: unknown) {
      const err = e as { errors?: Array<{ message?: string }>; message?: string };
      const msg = err?.errors?.[0]?.message || err?.message || 'Imeshindikana kuhifadhi';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink-900">Malipo (Payouts)</h1>
          <p className="text-ink-500 text-sm mt-1">
            Weka njia unayotaka kulipwa baada ya wageni kukaa kwako
          </p>
        </div>
        {hasSavedPayout && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 text-sm font-medium text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
          >
            Badilisha
          </button>
        )}
      </div>

      {/* Success/Error messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
          ✅ {success}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      {/* Saved payout info display */}
      {hasSavedPayout && !isEditing && (
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">{savedData?.payoutMethod === 'MPESA' ? '📱' : '🏦'}</span>
            <div>
              <h3 className="font-semibold text-ink-900">
                {savedData?.payoutMethod === 'MPESA' ? 'M-Pesa' : 'Benki'}
              </h3>
              <p className="text-xs text-green-600 font-medium">Imeunganishwa ✓</p>
            </div>
          </div>

          {savedData?.payoutMethod === 'MPESA' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-ink-50">
                <span className="text-ink-500">Jina</span>
                <span className="text-ink-800 font-medium">{savedData?.payoutMpesaName || '—'}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-ink-500">Nambari</span>
                <span className="text-ink-800 font-medium font-mono">{savedData?.payoutMpesaPhone || '—'}</span>
              </div>
            </div>
          )}

          {savedData?.payoutMethod === 'BANK' && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-ink-50">
                <span className="text-ink-500">Benki</span>
                <span className="text-ink-800 font-medium">{savedData?.payoutBankName || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-ink-50">
                <span className="text-ink-500">Jina la Akaunti</span>
                <span className="text-ink-800 font-medium">{savedData?.payoutBankAccountName || '—'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-ink-50">
                <span className="text-ink-500">Nambari ya Akaunti</span>
                <span className="text-ink-800 font-medium font-mono">{savedData?.payoutBankAccountNumber || '—'}</span>
              </div>
              {savedData?.payoutBankBranch && (
                <div className="flex justify-between py-2">
                  <span className="text-ink-500">Branch</span>
                  <span className="text-ink-800 font-medium">{savedData?.payoutBankBranch}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Edit form */}
      {isEditing && (
        <div className="bg-white rounded-2xl shadow-sm border border-ink-100 p-6 space-y-6">
          {/* Method selection */}
          <div>
            <label className="block text-sm font-medium text-ink-700 mb-3">
              Njia ya Malipo
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutMethod: 'MPESA' }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  formData.payoutMethod === 'MPESA'
                    ? 'border-green-500 bg-green-50'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className="text-2xl">📱</span>
                <span className="text-sm font-medium text-ink-800">M-Pesa</span>
                <span className="text-xs text-ink-500">Haraka na rahisi</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, payoutMethod: 'BANK' }))}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                  formData.payoutMethod === 'BANK'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-ink-200 hover:border-ink-300'
                }`}
              >
                <span className="text-2xl">🏦</span>
                <span className="text-sm font-medium text-ink-800">Benki</span>
                <span className="text-xs text-ink-500">Bank transfer</span>
              </button>
            </div>
          </div>

          {/* MPESA form */}
          {formData.payoutMethod === 'MPESA' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Jina la M-Pesa (kama lilivyo kwenye M-Pesa)
                </label>
                <input
                  type="text"
                  value={formData.payoutMpesaName}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutMpesaName: e.target.value }))}
                  placeholder="mfano JOHN DOE"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                />
                <p className="text-xs text-ink-400 mt-1">
                  Jina lililoko kwenye akaunti ya M-Pesa (linaweza kuwa tofauti na jina la akaunti yako)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nambari ya M-Pesa
                </label>
                <input
                  type="tel"
                  value={formData.payoutMpesaPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutMpesaPhone: e.target.value }))}
                  placeholder="mfano 0712345678 au 255712345678"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                />
                <p className="text-xs text-ink-400 mt-1.5">
                  Nambari ambayo tutakulipia moja kwa moja kupitia M-Pesa
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div className="text-xs text-green-700 space-y-1">
                    <p className="font-medium">Kuhusu malipo ya M-Pesa:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Malipo yatatumwa ndani ya masaa 24 baada ya mgeni kutoka</li>
                      <li>Hakikisha nambari ni sahihi na ina M-Pesa</li>
                      <li>Unaweza kubadilisha wakati wowote</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank form */}
          {formData.payoutMethod === 'BANK' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Jina la Benki
                </label>
                <select
                  value={formData.payoutBankName}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutBankName: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                >
                  <option value="">Chagua benki...</option>
                  {TANZANIA_BANKS.map(bank => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Jina la Akaunti (Account Name)
                </label>
                <input
                  type="text"
                  value={formData.payoutBankAccountName}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutBankAccountName: e.target.value }))}
                  placeholder="mfano JOHN DOE"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Nambari ya Akaunti (Account Number)
                </label>
                <input
                  type="text"
                  value={formData.payoutBankAccountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutBankAccountNumber: e.target.value }))}
                  placeholder="mfano 0123456789"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ink-700 mb-1.5">
                  Branch (Hiari)
                </label>
                <input
                  type="text"
                  value={formData.payoutBankBranch}
                  onChange={(e) => setFormData(prev => ({ ...prev, payoutBankBranch: e.target.value }))}
                  placeholder="mfano Mlimani City"
                  className="w-full px-4 py-2.5 rounded-xl border border-ink-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none text-sm"
                />
              </div>

              <div className="bg-blue-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <span className="text-lg">💡</span>
                  <div className="text-xs text-blue-700 space-y-1">
                    <p className="font-medium">Kuhusu malipo ya benki:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>Malipo ya benki yanaweza kuchukua siku 1-3</li>
                      <li>Hakikisha jina la akaunti linalingana na ID yako</li>
                      <li>Maelezo yako yanahifadhiwa kwa usalama</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save/Cancel buttons */}
          <div className="flex gap-3">
            {hasSavedPayout && (
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 py-3 rounded-xl border border-ink-200 text-ink-700 text-sm font-semibold transition-colors hover:bg-ink-50"
              >
                Ghairi
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors"
            >
              {loading ? 'Inahifadhi…' : 'Hifadhi Maelezo ya Malipo'}
            </button>
          </div>
        </div>
      )}

      {/* Security note */}
      <div className="bg-ink-50 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <span className="text-lg">🔒</span>
          <p className="text-xs text-ink-500">
            Maelezo yako ya malipo yanahifadhiwa kwa usalama na hayataonyeshwa kwa wageni. 
            Tunatumia maelezo haya tu wakati wa kukulipa baada ya wageni kukaa kwako.
          </p>
        </div>
      </div>
    </div>
  );
}
