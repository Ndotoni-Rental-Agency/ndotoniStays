'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { GraphQLClient } from '@/lib/graphql-client';
import { getBooking } from '@/graphql/queries';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, calculateNights } from '@/lib/utils';
import { CheckCircleIcon, ExclamationCircleIcon, CreditCardIcon } from '@heroicons/react/24/outline';
import { PaymentFlow } from '@/components/payment/PaymentFlow';

type PageState = 'loading' | 'ready' | 'confirmed' | 'failed' | 'already_paid' | 'error';

export default function PayBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const bookingId = params?.id as string;
  const token = searchParams?.get('token') || '';

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<any>(null);
  const [error, setError] = useState('');

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
        console.log('booking data', data);
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

  const total = booking?.pricing?.total || 0;
  const currency = booking?.pricing?.currency || 'TZS';
  const nights = booking ? calculateNights(booking.checkInDate, booking.checkOutDate) : 0;
  const guestName = booking?.guestName || booking?.guest?.firstName || 'Guest';

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

  // Ready — show payment form
  return (
    <div className="mx-auto max-w-sm px-4 py-10 sm:py-16">
      {/* Property card */}
      {booking?.property && (
        <div className="flex items-center gap-3 bg-ink-50 rounded-xl p-3 mb-6">
          {(booking.property.thumbnail || booking.property.images?.[0]) && (
            <img
              src={booking.property.thumbnail || booking.property.images[0]}
              alt={booking.property.title}
              className="h-14 w-14 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink-900 truncate">
              {booking.property.title}
            </p>
            <p className="text-xs text-ink-500">
              {booking.property.district}, {booking.property.region}
            </p>
            <p className="text-xs text-ink-400 mt-0.5">
              {booking.checkInDate} → {booking.checkOutDate} · {nights} night{nights > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      {/* Amount header */}
      <div className="text-center mb-8">
        <p className="text-3xl font-bold text-ink-900 tracking-tight">
          {formatPrice(total, currency)}
        </p>
        <p className="text-xs text-ink-400 mt-1">
          {guestName} · Total due
        </p>
      </div>

      {/* Reusable payment flow */}
      <PaymentFlow
        bookingId={bookingId}
        amount={total}
        currency={currency}
        onSuccess={() => setState('confirmed')}
        onError={(msg) => setError(msg)}
      />

      {/* Error */}
      {error && (
        <div className="mt-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center">
          {error}
        </div>
      )}

      <p className="text-center text-xs text-ink-300 mt-10">
        🔒 Secure · Encrypted · ndotoni
      </p>
    </div>
  );
}
