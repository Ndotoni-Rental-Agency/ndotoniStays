'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { GraphQLClient } from '@/lib/graphql-client';
import { getBooking } from '@/graphql/queries';
import { approveBooking, declineBooking } from '@/graphql/mutations';
import type { Booking } from '@/API';
import { formatPrice, calculateNights } from '@/lib/utils';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

type PageState = 'loading' | 'review' | 'confirming' | 'confirmed' | 'declined' | 'error';

export default function ConfirmBookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const bookingId = params?.id as string;
  const token = searchParams?.get('token') || '';

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [error, setError] = useState('');

  // Fetch booking details (public — no auth required)
  useEffect(() => {
    if (!bookingId) return;
    async function fetchBooking() {
      try {
        const data = await GraphQLClient.executePublic<{ getBooking: Booking }>(getBooking, { bookingId });
        const b = data.getBooking;

        if (!b) {
          setError('Booking not found');
          setState('error');
          return;
        }

        setBooking(b);

        if (b.status === 'CONFIRMED') {
          setState('confirmed');
        } else if (b.status === 'DECLINED' || b.status === 'CANCELLED') {
          setState('declined');
        } else {
          setState('review');
        }
      } catch (err: any) {
        setError(err?.errors?.[0]?.message || err?.message || 'Failed to load booking');
        setState('error');
      }
    }

    fetchBooking();
  }, [bookingId]);

  async function handleConfirm() {
    if (!token) {
      setError('Missing action token. Please use the link from your notification.');
      return;
    }

    setState('confirming');
    try {
      await GraphQLClient.executePublic(approveBooking, {
        bookingId,
        hostNotes: '',
        token,
      });
      setState('confirmed');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Failed to confirm booking');
      setState('review');
    }
  }

  async function handleDecline() {
    if (!token) {
      setError('Missing action token. Please use the link from your notification.');
      return;
    }

    setState('confirming');
    try {
      await GraphQLClient.executePublic(declineBooking, {
        bookingId,
        reason: 'Dates not available',
        token,
      });
      setState('declined');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Failed to decline booking');
      setState('review');
    }
  }

  // Loading
  if (state === 'loading') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 animate-pulse">
        <div className="h-8 w-56 bg-ink-100 rounded mb-4" />
        <div className="h-48 bg-ink-100 rounded-2xl" />
      </div>
    );
  }

  // Error
  if (state === 'error') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <XCircleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-ink-900 mb-2">Something went wrong</h1>
        <p className="text-ink-500 text-sm">{error}</p>
      </div>
    );
  }

  // Already confirmed
  if (state === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
          <CheckCircleIcon className="h-8 w-8 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Booking Confirmed!</h1>
        <p className="text-ink-500 text-sm mb-6">
          The guest has been notified and will proceed with payment.
        </p>
        <button onClick={() => router.push('/host')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Already declined
  if (state === 'declined') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-50 mb-4">
          <XCircleIcon className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-2">Booking Declined</h1>
        <p className="text-ink-500 text-sm mb-6">
          The guest has been notified that the property is not available.
        </p>
        <button onClick={() => router.push('/host')} className="btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  // Review state — show booking details + confirm/decline buttons
  const nights = booking ? calculateNights(booking.checkInDate, booking.checkOutDate) : 0;
  const subtotal = booking?.pricing?.subtotal || 0;
  const cleaningFee = booking?.pricing?.cleaningFee || 0;
  const serviceFee = booking?.pricing?.serviceFee || 0;
  const hostPayout = subtotal + cleaningFee;
  const currency = booking?.pricing?.currency || 'TZS';
  const propertyTitle = booking?.property?.title || booking?.propertySnapshot?.title || 'Property';

  return (
    <div className="mx-auto max-w-lg px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-ink-900 mb-6">New Booking Request</h1>

      <div className="rounded-2xl border border-ink-100 p-5 mb-6">
        <h3 className="font-semibold text-ink-900 mb-3">{propertyTitle}</h3>
        <div className="space-y-2 text-sm text-ink-600">
          <div className="flex justify-between">
            <span>👤 Guest</span>
            <span className="font-medium text-ink-900">{booking?.guestName || booking?.guest?.firstName || 'Guest'}</span>
          </div>
          <div className="flex justify-between">
            <span>📅 Dates</span>
            <span>{booking?.checkInDate} → {booking?.checkOutDate}</span>
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
            <span>💰 You receive</span>
            <span>{formatPrice(hostPayout, currency)}</span>
          </div>
          {serviceFee > 0 && (
            <div className="flex justify-between text-xs text-ink-400 mt-1">
              <span>Ndotoni service fee</span>
              <span>{formatPrice(serviceFee, currency)}</span>
            </div>
          )}
        </div>
        {booking?.specialRequests && (
          <div className="mt-3 pt-3 border-t border-ink-100">
            <p className="text-xs text-ink-500">Special requests:</p>
            <p className="text-sm text-ink-700">{booking.specialRequests}</p>
          </div>
        )}
      </div>

      <p className="text-sm text-ink-500 mb-4 text-center">
        Please confirm if your property is available for these dates.
      </p>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleDecline}
          disabled={state === 'confirming'}
          className="rounded-xl border-2 border-red-200 text-red-600 font-medium py-3 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          Decline
        </button>
        <button
          onClick={handleConfirm}
          disabled={state === 'confirming'}
          className="btn-primary py-3 disabled:opacity-50"
        >
          {state === 'confirming' ? 'Processing...' : 'Confirm'}
        </button>
      </div>
    </div>
  );
}
