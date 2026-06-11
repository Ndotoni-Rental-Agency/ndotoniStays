'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { GraphQLClient } from '@/lib/graphql-client';
import { getBooking, getPayment } from '@/graphql/queries';
import { initiatePayment } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, calculateNights } from '@/lib/utils';
import { CheckCircleIcon, ExclamationCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { StripePaymentForm } from '@/components/payment/StripePaymentForm';

type PaymentMethod = 'mobile_money' | 'card';
type PaymentOption = 'full' | 'deposit';
type PageState = 'loading' | 'ready' | 'processing' | 'confirmed' | 'failed' | 'already_paid' | 'error';

const DEPOSIT_PERCENTAGE = 30;

export default function PayBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const bookingId = params?.id as string;
  const token = searchParams?.get('token') || '';

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mobile_money');
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  // Use authenticated client when logged in, public otherwise
  const executeGql = isAuthenticated
    ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
    : GraphQLClient.executePublic.bind(GraphQLClient);
  // Fetch booking details — always public (anyone with the link can pay)
  useEffect(() => {
    if (!bookingId) return;

    async function fetchBooking() {
      try {
        const data = await executeGql<{ getBooking: any }>(getBooking, { bookingId });
        const b = data.getBooking;

        if (!b) {
          setError('Booking not found');
          setState('error');
          return;
        }

        setBooking(b);

        if (b.paymentStatus === 'CAPTURED' || b.paymentStatus === 'AUTHORIZED') {
          setState('already_paid');
        } else if (b.status !== 'CONFIRMED') {
          setError('This booking has not been confirmed yet. Payment is only available after host confirmation.');
          setState('error');
        } else {
          setState('ready');
        }
      } catch (err: any) {
        setError(err?.errors?.[0]?.message || err?.message || 'Failed to load booking');
        setState('error');
      }
    }

    fetchBooking();
  }, [bookingId]);

  // Phone number formatting
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) value = '255' + value.substring(1);
    else if (value.startsWith('7') || value.startsWith('6')) value = '255' + value;
    if (value.length > 12) value = value.substring(0, 12);
    setPhoneNumber(value);
  }

  const isValidPhone = /^255[67]\d{8}$/.test(phoneNumber);

  const total = booking?.pricing?.total || 0;
  const currency = booking?.pricing?.currency || 'TZS';
  const depositAmount = Math.round(total * (DEPOSIT_PERCENTAGE / 100));
  const payNowAmount = paymentOption === 'full' ? total : depositAmount;
  const balanceDue = paymentOption === 'deposit' ? total - depositAmount : 0;
  const nights = booking ? calculateNights(booking.checkInDate, booking.checkOutDate) : 0;
  const guestName = booking?.guestName || booking?.guest?.firstName || 'Guest';

  async function handlePay() {
    if (!isValidPhone) {
      setError('Enter a valid phone number');
      return;
    }

    setState('processing');
    setError('');

    try {
      const response = await executeGql<{ initiatePayment: any }>(initiatePayment, {
        input: {
          bookingId,
          phoneNumber,
        },
      });

      const result = response.initiatePayment;

      if (result.status === 'PENDING') {
        setPaymentMessage('Check your phone for the M-Pesa prompt. Confirm to complete payment.');
        pollPaymentStatus(result.reference);
      } else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') {
        setState('confirmed');
      } else {
        setError(result.message || 'Payment failed');
        setState('failed');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Payment failed. Please try again.');
      setState('failed');
    }
  }

  function pollPaymentStatus(paymentRef: string) {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await executeGql<{ getPayment: any }>(getPayment, { paymentId: paymentRef });
        const payment = response.getPayment;

        if (payment?.status === 'CAPTURED' || payment?.status === 'AUTHORIZED') {
          clearInterval(interval);
          setState('confirmed');
        } else if (payment?.status === 'FAILED') {
          clearInterval(interval);
          setError(payment.errorMessage || 'Payment failed');
          setState('failed');
        }
      } catch {
        // Silent — keep polling
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPaymentMessage('Still waiting for confirmation. Check your M-Pesa and refresh this page.');
      }
    }, 10000);
  }

  // Loading
  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 animate-pulse">
        <div className="h-8 w-48 bg-ink-100 rounded mb-4" />
        <div className="h-48 bg-ink-100 rounded-2xl" />
      </div>
    );
  }

  // Already paid
  if (state === 'already_paid') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Already Paid!</h1>
        <p className="text-ink-500 text-sm mb-6">
          The booking for <strong>{guestName}</strong> has already been paid. The host will share check-in details.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  // Confirmed payment
  if (state === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Payment Confirmed!</h1>
        <p className="text-ink-500 text-sm mb-2">
          Booking for <strong>{guestName}</strong>
        </p>
        <p className="text-ink-500 text-sm mb-6">
          {booking?.property?.title || booking?.propertyTitle} · {booking?.checkInDate} – {booking?.checkOutDate}
        </p>
        {paymentOption === 'deposit' && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2 mb-6">
            Deposit paid. Balance of {formatPrice(balanceDue, currency)} due at check-in.
          </p>
        )}
        <p className="text-sm text-ink-400 mb-8">The host will send check-in details via WhatsApp.</p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to Home
        </button>
      </div>
    );
  }

  // Failed
  if (state === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
          <ExclamationCircleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Payment Failed</h1>
        <p className="text-ink-500 text-sm mb-6">{error || 'Something went wrong.'}</p>
        <button onClick={() => { setState('ready'); setError(''); }} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <ExclamationCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-ink-900 mb-2">Cannot process payment</h1>
        <p className="text-ink-500 text-sm">{error}</p>
      </div>
    );
  }

  // Processing
  if (state === 'processing') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-bold text-ink-900 mb-2">Processing Payment</h2>
        <p className="text-ink-500">{paymentMessage || 'Initiating M-Pesa payment...'}</p>
        {paymentMessage && (
          <p className="text-sm text-ink-400 mt-4">This page will update automatically once confirmed.</p>
        )}
      </div>
    );
  }

  // Ready — show payment form
  return (
    <div className="mx-auto max-w-md px-4 py-10 sm:py-16">
      {/* Compact header */}
      <div className="text-center mb-8">
        <h1 className="text-xl font-bold text-ink-900 mb-1">
          {formatPrice(total, currency)}
        </h1>
        <p className="text-sm text-ink-500">
          {booking?.property?.title || booking?.propertyTitle} · {nights} night{nights > 1 ? 's' : ''}
        </p>
        <p className="text-xs text-ink-400 mt-1">
          for {guestName} · {booking?.checkInDate} → {booking?.checkOutDate}
        </p>
      </div>

      {/* Payment method — big clear choice */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setPaymentMethod('mobile_money')}
          className={`p-5 rounded-2xl border-2 text-center transition-all ${
            paymentMethod === 'mobile_money'
              ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10'
              : 'border-ink-100 hover:border-ink-200'
          }`}
        >
          <span className="text-3xl block mb-2">📱</span>
          <span className="text-sm font-semibold text-ink-900 block">M-Pesa</span>
          <span className="text-xs text-ink-500">Airtel · Tigo · Halotel</span>
        </button>
        <button
          onClick={() => setPaymentMethod('card')}
          className={`p-5 rounded-2xl border-2 text-center transition-all ${
            paymentMethod === 'card'
              ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-500/10'
              : 'border-ink-100 hover:border-ink-200'
          }`}
        >
          <span className="text-3xl block mb-2">💳</span>
          <span className="text-sm font-semibold text-ink-900 block">Card</span>
          <span className="text-xs text-ink-500">Visa · Apple Pay</span>
        </button>
      </div>

      {/* Mobile Money form */}
      {paymentMethod === 'mobile_money' && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-ink-500 mb-1.5">Phone number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="0712 345 678"
              className="input text-lg tracking-wide"
              autoFocus
            />
            {phoneNumber && !isValidPhone && (
              <p className="text-xs text-red-500 mt-1">Enter a valid Tanzanian number</p>
            )}
          </div>

          <button
            onClick={handlePay}
            disabled={!isValidPhone}
            className="btn-primary w-full text-base py-4"
          >
            {isValidPhone
              ? `Send ${formatPrice(total, currency)} request`
              : 'Enter number to continue'
            }
          </button>

          <p className="text-center text-xs text-ink-400">
            You&apos;ll get a prompt on your phone. Anyone can pay this — share the link.
          </p>
        </div>
      )}

      {/* Card form */}
      {paymentMethod === 'card' && (
        <div className="space-y-4">
          <StripePaymentForm
            bookingId={bookingId}
            amount={total}
            currency={currency}
            onSuccess={() => setState('confirmed')}
            onError={(msg) => setError(msg)}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <p className="text-center text-xs text-ink-300 mt-8">
        🔒 Secure · Encrypted · ndotoni
      </p>
    </div>
  );
}
