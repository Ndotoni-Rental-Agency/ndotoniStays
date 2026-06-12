'use client';

import { useState } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { initiatePayment } from '@/graphql/mutations';
import { getPayment } from '@/graphql/queries';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice } from '@/lib/utils';
import { StripePaymentForm } from './StripePaymentForm';

type PaymentMethod = 'mobile_money' | 'card' | null;

interface PaymentFlowProps {
  bookingId: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
  onError: (message: string) => void;
}

/**
 * Reusable payment flow component.
 * Shows: method selector → form → action
 * Used by both /pay/[id] and /booking/[propertyId] pages.
 */
export function PaymentFlow({ bookingId, amount, currency, onSuccess, onError }: PaymentFlowProps) {
  const [method, setMethod] = useState<PaymentMethod>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { isAuthenticated } = useAuth();

  const isValidPhone = /^255[67]\d{8}$/.test(phoneNumber);

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, '');
    if (v.startsWith('0')) v = '255' + v.substring(1);
    else if (v.startsWith('7') || v.startsWith('6')) v = '255' + v;
    setPhoneNumber(v.slice(0, 12));
  }

  async function handleMobilePay() {
    if (!isValidPhone) return;
    setIsProcessing(true);

    try {
      const executeGql = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

      console.log('[PaymentFlow] Initiating payment:', { bookingId, phoneNumber, amount, currency });

      const response = await executeGql<{ initiatePayment: any }>(initiatePayment, {
        input: { bookingId, phoneNumber },
      });

      console.log('[PaymentFlow] initiatePayment response:', JSON.stringify(response, null, 2));

      const result = response.initiatePayment;

      if (result.status === 'PENDING') {
        console.log('[PaymentFlow] Payment pending, polling reference:', result.reference);
        pollPaymentStatus(result.reference);
      } else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') {
        console.log('[PaymentFlow] Payment completed immediately');
        onSuccess();
      } else {
        console.error('[PaymentFlow] Payment failed with status:', result.status, result.message);
        onError(result.message || 'Payment failed');
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('[PaymentFlow] initiatePayment error:', err);
      console.error('[PaymentFlow] Error details:', JSON.stringify(err?.errors || err?.message || err, null, 2));
      onError(err?.errors?.[0]?.message || err?.message || 'Payment initiation failed');
      setIsProcessing(false);
    }
  }

  function pollPaymentStatus(paymentRef: string) {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const executeGql = isAuthenticated
          ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
          : GraphQLClient.executePublic.bind(GraphQLClient);

        const response = await executeGql<{ getPayment: any }>(getPayment, { paymentId: paymentRef });
        const payment = response.getPayment;

        if (payment?.status === 'CAPTURED' || payment?.status === 'AUTHORIZED') {
          clearInterval(interval);
          onSuccess();
        } else if (payment?.status === 'FAILED') {
          clearInterval(interval);
          onError(payment.errorMessage || 'Payment failed');
          setIsProcessing(false);
        }
      } catch {
        // Silent — keep polling
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setIsProcessing(false);
        onError('Payment is taking longer than expected. Check your phone and refresh.');
      }
    }, 10000);
  }

  // Processing state
  if (isProcessing) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-10 w-10 border-3 border-brand-600 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm font-medium text-ink-900">Waiting for payment...</p>
        <p className="text-xs text-ink-500 mt-1">Check your phone and confirm the M-Pesa prompt</p>
      </div>
    );
  }

  // Method selector — initial state
  if (!method) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setMethod('mobile_money')}
          className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-ink-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
        >
          <span className="text-3xl">📱</span>
          <div className="flex-1">
            <p className="font-semibold text-ink-900 group-hover:text-brand-700">Mobile Money</p>
            <p className="text-xs text-ink-500">M-Pesa, Airtel Money, Tigo Pesa</p>
          </div>
          <svg className="h-5 w-5 text-ink-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>

        <button
          onClick={() => setMethod('card')}
          className="w-full flex items-center gap-4 p-5 rounded-2xl border-2 border-ink-100 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
        >
          <span className="text-3xl">💳</span>
          <div className="flex-1">
            <p className="font-semibold text-ink-900 group-hover:text-brand-700">Card / Apple Pay</p>
            <p className="text-xs text-ink-500">Visa, Mastercard, Google Pay</p>
          </div>
          <svg className="h-5 w-5 text-ink-300 group-hover:text-brand-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
      </div>
    );
  }

  // Mobile Money form
  if (method === 'mobile_money') {
    return (
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-ink-700 mb-2">Phone number</label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0712 345 678"
            className="input text-lg tracking-wide text-center"
            autoFocus
          />
          {phoneNumber && !isValidPhone && (
            <p className="text-xs text-red-500 mt-1.5 text-center">Enter a valid Tanzanian number</p>
          )}
        </div>

        <button
          onClick={handleMobilePay}
          disabled={!isValidPhone}
          className="btn-primary w-full text-base py-4 disabled:opacity-40"
        >
          {isValidPhone
            ? `Send ${formatPrice(amount, currency)} request`
            : 'Enter number to pay'
          }
        </button>

        <button
          onClick={() => setMethod(null)}
          className="w-full text-center text-sm text-ink-500 hover:text-brand-600 transition-colors py-1"
        >
          ← Pay with card instead
        </button>
      </div>
    );
  }

  // Card / Apple Pay form
  return (
    <div className="space-y-5">
      <StripePaymentForm
        bookingId={bookingId}
        amount={amount}
        currency={currency}
        onSuccess={onSuccess}
        onError={onError}
      />

      <button
        onClick={() => setMethod(null)}
        className="w-full text-center text-sm text-ink-500 hover:text-brand-600 transition-colors py-1"
      >
        ← Pay with M-Pesa instead
      </button>
    </div>
  );
}
