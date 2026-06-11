'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty, getPayment } from '@/graphql/queries';
import { createBooking } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, calculateNights, getCdnUrl } from '@/lib/utils';
import { CheckCircleIcon, ExclamationCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';
import { AuthModal } from '@/components/auth/AuthModal';
import { PaymentFlow } from '@/components/payment/PaymentFlow';

type BookingStep = 'form' | 'processing' | 'confirmed' | 'failed';

export default function BookingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const propertyId = params?.propertyId as string;
  const checkIn = searchParams?.get('checkIn') || '';
  const checkOut = searchParams?.get('checkOut') || '';
  const guests = parseInt(searchParams?.get('guests') || '1');

  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<BookingStep>('form');

  // Guest details
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [countryCode, setCountryCode] = useState('255');
  const [detailsExpanded, setDetailsExpanded] = useState(true);

  // Booking state
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingStatus, setBookingStatus] = useState<string>('');

  // Auth
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChoice, setAuthChoice] = useState<'none' | 'guest' | 'signin'>('none');

  // Pre-fill from user — collapse details if filled
  useEffect(() => {
    if (isAuthenticated && user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
      setGuestName(name);
      setGuestEmail(user.email || '');
      setAuthChoice('signin');
      // Collapse details if already filled
      if (name && user.email) {
        setDetailsExpanded(false);
      }
    }
  }, [isAuthenticated, user]);

  // Redirect if missing params
  useEffect(() => {
    if (!checkIn || !checkOut) {
      router.push(`/property/${propertyId}`);
    }
  }, [checkIn, checkOut, propertyId, router]);

  // Fetch property
  useEffect(() => {
    if (!propertyId) return;
    async function fetch() {
      try {
        const data = await GraphQLClient.executePublic<{ getShortTermProperty: any }>(
          getShortTermProperty,
          { propertyId }
        );
        setProperty(data.getShortTermProperty);
      } catch {
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [propertyId]);

  if (loading || authLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 animate-pulse">
        <div className="h-8 w-48 bg-ink-100 rounded mb-6" />
        <div className="h-64 bg-ink-100 rounded-2xl" />
      </div>
    );
  }

  if (!property || !checkIn || !checkOut) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-ink-500">Property not found or missing booking details.</p>
      </div>
    );
  }

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = property.nightlyRate * nights;
  const cleaningFee = property.cleaningFee || 0;
  const serviceFee = Math.round(subtotal * ((property.serviceFeePercentage || 10) / 100));
  const taxes = Math.round((subtotal + cleaningFee + serviceFee) * ((property.taxPercentage || 0) / 100));
  const total = subtotal + cleaningFee + serviceFee + taxes;
  const isInstantBook = property.instantBookEnabled;

  // Phone formatting
  function handleGuestPhoneInput(value: string) {
    setGuestPhone(value.replace(/\D/g, '').slice(0, 12));
  }
  const fullGuestPhone = guestPhone ? `${countryCode}${guestPhone.replace(/^0+/, '')}` : '';

  // Validate form
  const isFormValid = guestName.trim().length > 0 && guestEmail.includes('@');

  // ═══════════════════════════════════════════════
  // Create booking + optionally go straight to payment
  // ═══════════════════════════════════════════════
  async function handleBookAndPay() {
    if (!isFormValid) {
      setDetailsExpanded(true);
      setError('Please fill in your name and email');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const executeGql = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

      const response = await executeGql<{ createBooking: any }>(createBooking, {
        input: {
          propertyId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
          numberOfAdults: guests,
          numberOfChildren: 0,
          numberOfInfants: 0,
          paymentMethodId: 'snippe_mpesa',
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: fullGuestPhone || undefined,
        },
      });

      const booking = response.createBooking?.booking;
      if (!booking) throw new Error('Failed to create booking');

      setBookingId(booking.bookingId);
      setBookingStatus(booking.status);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleSendPaymentLink() {
    if (!isFormValid) {
      setDetailsExpanded(true);
      setError('Please fill in your name and email');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const executeGql = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

      const response = await executeGql<{ createBooking: any }>(createBooking, {
        input: {
          propertyId,
          checkInDate: checkIn,
          checkOutDate: checkOut,
          numberOfGuests: guests,
          numberOfAdults: guests,
          numberOfChildren: 0,
          numberOfInfants: 0,
          paymentMethodId: 'snippe_mpesa',
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: fullGuestPhone || undefined,
        },
      });

      const booking = response.createBooking?.booking;
      if (!booking) throw new Error('Failed to create booking');

      // For "pay later" — just confirm the booking was created and show success
      setBookingId(booking.bookingId);
      setBookingStatus(booking.status);
      setStep('confirmed');
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || err?.message || 'Something went wrong.');
    } finally {
      setIsProcessing(false);
    }
  }

  // ═══════════════════════════════════════════════
  // RENDER: Confirmed
  // ═══════════════════════════════════════════════
  if (step === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-green-50 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-3">
          {bookingStatus === 'CONFIRMED' ? 'Booking Confirmed!' : 'Request Sent!'}
        </h1>
        <p className="text-ink-500 mb-2"><strong>{property.title}</strong></p>
        <p className="text-sm text-ink-500 mb-6">
          {new Date(checkIn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {new Date(checkOut + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {' · '}{nights} night{nights > 1 ? 's' : ''}
        </p>
        <p className="text-sm text-ink-400 mb-8">
          {bookingStatus === 'CONFIRMED'
            ? 'We\'ve sent a payment link to your email and WhatsApp. Pay when you\'re ready.'
            : 'The host will review your request. You\'ll be notified once confirmed.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => router.push('/bookings')} className="btn-primary">
            View My Trips
          </button>
          <button onClick={() => router.push('/')} className="btn-secondary">
            Keep Browsing
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RENDER: Failed
  // ═══════════════════════════════════════════════
  if (step === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
          <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-3">Payment Failed</h1>
        <p className="text-ink-500 mb-6">{error || 'Something went wrong.'}</p>
        <button onClick={() => { setStep('form'); setError(''); }} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RENDER: Main form — single page flow
  // ═══════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-10">
      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mb-6">
        {isInstantBook ? 'Confirm & Pay' : 'Complete your booking'}
      </h1>

      <div className="space-y-5">
        {/* Property summary */}
        <div className="flex gap-4 p-4 rounded-2xl border border-ink-100">
          <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0">
            <Image src={getCdnUrl(property.thumbnail)} alt={property.title} fill className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-ink-900 text-sm truncate">{property.title}</h3>
            <p className="text-xs text-ink-500 mt-0.5">{property.district}, {property.region}</p>
            <p className="text-xs text-ink-500 mt-1">
              {new Date(checkIn + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {new Date(checkOut + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}{nights} night{nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
            </p>
            {isInstantBook && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-600 mt-1">
                <BoltIcon className="h-3 w-3" /> Instant Book
              </span>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="rounded-2xl border border-ink-100 p-4 sm:p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>{formatPrice(property.nightlyRate, property.currency)} × {nights} nights</span>
              <span>{formatPrice(subtotal, property.currency)}</span>
            </div>
            {cleaningFee > 0 && (
              <div className="flex justify-between text-ink-600">
                <span>Cleaning fee</span>
                <span>{formatPrice(cleaningFee, property.currency)}</span>
              </div>
            )}
            {serviceFee > 0 && (
              <div className="flex justify-between text-ink-600">
                <span>Service fee</span>
                <span>{formatPrice(serviceFee, property.currency)}</span>
              </div>
            )}
            {taxes > 0 && (
              <div className="flex justify-between text-ink-600">
                <span>Taxes</span>
                <span>{formatPrice(taxes, property.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-ink-900 pt-2 border-t border-ink-100 text-base">
              <span>Total</span>
              <span>{formatPrice(total, property.currency)}</span>
            </div>
          </div>
        </div>

        {/* Guest details — collapsible if pre-filled */}
        {authChoice === 'none' && !isAuthenticated ? (
          // Auth choice for non-signed-in users
          <div className="rounded-2xl border border-ink-100 p-5">
            <h3 className="font-semibold text-ink-900 mb-3">Sign in or continue as guest</h3>
            <div className="space-y-2">
              <button
                onClick={() => { localStorage.setItem('ndotoni_booking_redirect', window.location.href); setShowAuthModal(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-brand-500 transition-all text-left"
              >
                <div className="h-9 w-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">Sign in</p>
                  <p className="text-xs text-ink-500">Faster checkout, track bookings</p>
                </div>
              </button>
              <button
                onClick={() => { setAuthChoice('guest'); setDetailsExpanded(true); }}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-ink-100 hover:border-ink-200 transition-all text-left"
              >
                <div className="h-9 w-9 rounded-full bg-ink-50 flex items-center justify-center shrink-0">
                  <svg className="h-4 w-4 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">Continue as guest</p>
                  <p className="text-xs text-ink-500">Enter your details below</p>
                </div>
              </button>
            </div>
          </div>
        ) : (
          // Details form — collapsible
          <div className="rounded-2xl border border-ink-100 overflow-hidden">
            <button
              onClick={() => setDetailsExpanded(!detailsExpanded)}
              className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
            >
              <div>
                <h3 className="font-semibold text-ink-900 text-sm">Your details</h3>
                {!detailsExpanded && guestName && (
                  <p className="text-xs text-ink-500 mt-0.5">{guestName} · {guestEmail}</p>
                )}
              </div>
              {detailsExpanded ? (
                <ChevronUpIcon className="h-4 w-4 text-ink-400" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-ink-400" />
              )}
            </button>

            {detailsExpanded && (
              <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">Full name</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="John Doe"
                    className="input text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-500 mb-1">
                    WhatsApp <span className="text-ink-400 font-normal">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="input w-24 text-sm"
                    >
                      <option value="255">🇹🇿 +255</option>
                      <option value="254">🇰🇪 +254</option>
                      <option value="256">🇺🇬 +256</option>
                      <option value="250">🇷🇼 +250</option>
                      <option value="27">🇿🇦 +27</option>
                      <option value="44">🇬🇧 +44</option>
                      <option value="1">🇺🇸 +1</option>
                    </select>
                    <input
                      type="tel"
                      value={guestPhone}
                      onChange={(e) => handleGuestPhoneInput(e.target.value)}
                      placeholder="712 345 678"
                      className="input flex-1 text-base"
                    />
                  </div>
                  <p className="text-xs text-ink-400 mt-1">For booking updates via WhatsApp.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payment section — shows immediately for instant book when booking is created */}
        {bookingId && bookingStatus === 'CONFIRMED' && (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/30 p-4 sm:p-5">
            <div className="text-center mb-4">
              <p className="text-xs text-brand-600 font-medium mb-1">Booking created — pay to secure your dates</p>
              <p className="text-2xl font-bold text-ink-900">{formatPrice(total, property.currency)}</p>
            </div>
            <PaymentFlow
              bookingId={bookingId}
              amount={total}
              currency={property.currency}
              onSuccess={() => setStep('confirmed')}
              onError={(msg) => { setError(msg); setStep('failed'); }}
            />
          </div>
        )}

        {/* Pending (request mode) — show waiting message */}
        {bookingId && bookingStatus === 'PENDING' && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
            <span className="text-2xl mb-2 block">⏳</span>
            <p className="text-sm font-semibold text-amber-800 mb-1">Request sent!</p>
            <p className="text-xs text-amber-700">The host will confirm within 1 hour. We&apos;ll send you a payment link once confirmed.</p>
          </div>
        )}

        {/* Error */}
        {error && !bookingId && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Action buttons — only show before booking is created */}
        {!bookingId && authChoice !== 'none' && (
          <div className="space-y-3">
            {isInstantBook ? (
              <>
                {/* Pay now — creates booking + shows payment inline */}
                <button
                  onClick={handleBookAndPay}
                  disabled={isProcessing || !isFormValid}
                  className="btn-primary w-full text-base py-4"
                >
                  {isProcessing ? 'Creating booking...' : `Pay ${formatPrice(total, property.currency)}`}
                </button>

                {/* Pay later — creates booking + sends link */}
                <button
                  onClick={handleSendPaymentLink}
                  disabled={isProcessing || !isFormValid}
                  className="w-full text-sm py-3 rounded-xl border border-ink-200 text-ink-700 font-medium hover:bg-ink-50 transition-colors"
                >
                  Send me a payment link instead
                </button>
              </>
            ) : (
              // Request mode — single button
              <button
                onClick={handleSendPaymentLink}
                disabled={isProcessing || !isFormValid}
                className="btn-primary w-full text-base py-4"
              >
                {isProcessing ? 'Sending request...' : 'Send Booking Request'}
              </button>
            )}
          </div>
        )}

        {/* Fine print */}
        <p className="text-center text-xs text-ink-400">
          {isInstantBook
            ? 'Your dates are held for 15 minutes. Pay to confirm.'
            : `By requesting, you agree to the host's ${property.cancellationPolicy?.toLowerCase() || 'flexible'} cancellation policy.`}
        </p>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => { setShowAuthModal(false); setAuthChoice('signin'); }} />
    </div>
  );
}
