'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { GraphQLClient } from '@/lib/graphql-client';
import { getBooking, getPayment } from '@/graphql/queries';
import { initiatePayment } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, calculateNights } from '@/lib/utils';
import { CheckCircleIcon, ExclamationCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';

type PaymentOption = 'full' | 'deposit';
type PageState = 'loading' | 'ready' | 'processing' | 'confirmed' | 'failed' | 'already_paid' | 'error';

const DEPOSIT_PERCENTAGE = 30;

export default function PayBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const bookingId = params?.id as string;
  const token = searchParams?.get('token') || '';

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<any>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');
  const [error, setError] = useState('');
  const [paymentMessage, setPaymentMessage] = useState('');

  // Fetch booking details
  useEffect(() => {
    if (!bookingId || authLoading) return;

    async function fetchBooking() {
      try {
        const executeGql = isAuthenticated
          ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
          : GraphQLClient.executePublic.bind(GraphQLClient);

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
  }, [bookingId, isAuthenticated, authLoading]);

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

  async function handlePay() {
    if (!isValidPhone) {
      setError('Enter a valid phone number');
      return;
    }

    setState('processing');
    setError('');

    try {
      const executeGql = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

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
        const executeGql = isAuthenticated
          ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
          : GraphQLClient.executePublic.bind(GraphQLClient);

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
  if (state === 'loading' || authLoading) {
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
          This booking has already been paid. The host will contact you with check-in details.
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
          <strong>{booking?.property?.title || 'Your stay'}</strong>
        </p>
        <p className="text-ink-500 text-sm mb-6">
          {booking?.checkInDate} – {booking?.checkOutDate} · {nights} night{nights > 1 ? 's' : ''}
        </p>
        {paymentOption === 'deposit' && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2 mb-6">
            Deposit paid. Balance of {formatPrice(balanceDue, currency)} due at check-in.
          </p>
        )}
        <p className="text-sm text-ink-400 mb-8">The host will send you check-in details via WhatsApp.</p>
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
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-brand-50 mb-3">
          <CreditCardIcon className="h-6 w-6 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900">Complete Payment</h1>
        <p className="text-sm text-ink-500 mt-1">Pay to secure your booking</p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* Booking summary */}
        <div className="rounded-2xl border border-ink-100 p-5">
          <h3 className="font-semibold text-ink-900 mb-3">{booking?.property?.title || 'Property'}</h3>
          <div className="space-y-2 text-sm text-ink-600">
            <div className="flex justify-between">
              <span>📅 Dates</span>
              <span>{booking?.checkInDate} – {booking?.checkOutDate}</span>
            </div>
            <div className="flex justify-between">
              <span>🌙 Nights</span>
              <span>{nights}</span>
            </div>
            <div className="flex justify-between">
              <span>👥 Guests</span>
              <span>{booking?.numberOfGuests}</span>
            </div>
            <div className="flex justify-between font-semibold text-ink-900 pt-2 border-t border-ink-100">
              <span>💰 Total</span>
              <span>{formatPrice(total, currency)}</span>
            </div>
          </div>
        </div>

        {/* Payment option */}
        <div className="rounded-2xl border border-ink-100 p-5">
          <h3 className="font-semibold text-ink-900 mb-3">How would you like to pay?</h3>
          <div className="space-y-2">
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentOption === 'full' ? 'border-brand-500 bg-brand-50' : 'border-ink-100 hover:border-ink-200'
              }`}
            >
              <input type="radio" name="payment" checked={paymentOption === 'full'} onChange={() => setPaymentOption('full')} className="sr-only" />
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'full' ? 'border-brand-600' : 'border-ink-300'}`}>
                {paymentOption === 'full' && <div className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">Pay in full</p>
                <p className="text-xs text-ink-500">Pay {formatPrice(total, currency)} now</p>
              </div>
            </label>

            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentOption === 'deposit' ? 'border-brand-500 bg-brand-50' : 'border-ink-100 hover:border-ink-200'
              }`}
            >
              <input type="radio" name="payment" checked={paymentOption === 'deposit'} onChange={() => setPaymentOption('deposit')} className="sr-only" />
              <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center ${paymentOption === 'deposit' ? 'border-brand-600' : 'border-ink-300'}`}>
                {paymentOption === 'deposit' && <div className="h-2.5 w-2.5 rounded-full bg-brand-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-ink-900">Pay deposit ({DEPOSIT_PERCENTAGE}%)</p>
                <p className="text-xs text-ink-500">
                  Pay {formatPrice(depositAmount, currency)} now, {formatPrice(balanceDue, currency)} at check-in
                </p>
              </div>
            </label>
          </div>
        </div>

        {/* M-Pesa number */}
        <div className="rounded-2xl border border-ink-100 p-5">
          <h3 className="font-semibold text-ink-900 mb-1">Mobile Money</h3>
          <p className="text-xs text-ink-500 mb-3">M-Pesa, Airtel Money, Tigo Pesa, or Halotel</p>
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            placeholder="0712 345 678"
            className="input"
          />
          {phoneNumber && !isValidPhone && (
            <p className="text-xs text-red-500 mt-1">Enter a valid Tanzanian number</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Pay button */}
        <button
          onClick={handlePay}
          disabled={!isValidPhone}
          className="btn-primary w-full text-base py-4"
        >
          Pay {formatPrice(payNowAmount, currency)}
        </button>

        <p className="text-center text-xs text-ink-400">
          A payment prompt will be sent to your phone. Confirm on your phone to complete.
        </p>
      </div>
    </div>
  );
}
