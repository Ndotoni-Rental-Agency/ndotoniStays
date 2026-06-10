'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { GraphQLClient } from '@/lib/graphql-client';
import { getShortTermProperty, getPayment } from '@/graphql/queries';
import { createBooking, initiatePayment } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, calculateNights, getCdnUrl } from '@/lib/utils';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';
import { AuthModal } from '@/components/auth/AuthModal';

type PaymentOption = 'full' | 'deposit';
type BookingStep = 'details' | 'confirmation' | 'processing' | 'confirmed' | 'failed';

const DEPOSIT_PERCENTAGE = 30;

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
  const [step, setStep] = useState<BookingStep>('details');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [bookingData, setBookingData] = useState<any>(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authChoice, setAuthChoice] = useState<'none' | 'guest' | 'signin'>('none');

  // Pre-fill from user if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setGuestName(`${user.firstName || ''} ${user.lastName || ''}`.trim());
      setGuestEmail(user.email || '');
      setAuthChoice('signin');
    }
  }, [isAuthenticated, user]);

  // On mount, check if we're returning from auth redirect
  useEffect(() => {
    if (isAuthenticated && typeof window !== 'undefined') {
      const saved = localStorage.getItem('ndotoni_booking_redirect');
      if (saved) {
        localStorage.removeItem('ndotoni_booking_redirect');
      }
    }
  }, [isAuthenticated]);

  function handleSignIn() {
    localStorage.setItem('ndotoni_booking_redirect', window.location.href);
    setShowAuthModal(true);
  }

  function handleContinueAsGuest() {
    setAuthChoice('guest');
  }

  function handleAuthSuccess() {
    setShowAuthModal(false);
    setAuthChoice('signin');
  }

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
  const depositAmount = Math.round(total * (DEPOSIT_PERCENTAGE / 100));
  const payNowAmount = paymentOption === 'full' ? total : depositAmount;
  const balanceDue = paymentOption === 'deposit' ? total - depositAmount : 0;

  // Phone number formatting (Tanzania)
  function handlePhoneChange(value: string, setter: (v: string) => void) {
    let cleaned = value.replace(/\D/g, '');
    if (cleaned.startsWith('0')) cleaned = '255' + cleaned.substring(1);
    else if (cleaned.startsWith('7') || cleaned.startsWith('6')) cleaned = '255' + cleaned;
    if (cleaned.length > 12) cleaned = cleaned.substring(0, 12);
    setter(cleaned);
  }

  const isValidGuestPhone = /^255[67]\d{8}$/.test(guestPhone);

  // ═══════════════════════════════════════════════
  // STEP 1: Create booking
  // ═══════════════════════════════════════════════
  async function handleCreateBooking() {
    if (!guestName.trim()) {
      setError('Please enter your name');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    if (authChoice === 'guest' && !isValidGuestPhone) {
      setError('Please enter a valid phone number');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const executeGql = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

      const bookingResponse = await executeGql<{ createBooking: any }>(
        createBooking,
        {
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
            guestPhone: guestPhone || undefined,
          },
        }
      );

      const createdBooking = bookingResponse.createBooking?.booking;
      if (!createdBooking) throw new Error('Failed to create booking');

      setBookingId(createdBooking.bookingId);
      setBookingData(createdBooking);
      setStep('confirmation');
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  }

  // ═══════════════════════════════════════════════
  // STEP 2: Initiate payment
  // ═══════════════════════════════════════════════
  async function handlePay() {
    const payPhone = phoneNumber || guestPhone;
    if (!/^255[67]\d{8}$/.test(payPhone)) {
      setError('Enter a valid M-Pesa phone number (e.g., 0712 345 678)');
      return;
    }

    setIsProcessing(true);
    setError('');
    setStep('processing');

    try {
      const executeGql = isAuthenticated
        ? GraphQLClient.executeAuthenticated.bind(GraphQLClient)
        : GraphQLClient.executePublic.bind(GraphQLClient);

      const paymentResponse = await executeGql<{ initiatePayment: any }>(
        initiatePayment,
        {
          input: {
            bookingId: bookingId!,
            phoneNumber: payPhone,
          },
        }
      );

      const result = paymentResponse.initiatePayment;

      if (result.status === 'PENDING') {
        setPaymentMessage('Check your phone for the M-Pesa prompt. Confirm to complete payment.');
        pollPaymentStatus(result.reference);
      } else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') {
        setStep('confirmed');
      } else {
        setError(result.message || 'Payment failed');
        setStep('failed');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Payment failed. Please try again.';
      setError(msg);
      setStep('failed');
    } finally {
      setIsProcessing(false);
    }
  }

  // Poll payment status
  function pollPaymentStatus(paymentRef: string) {
    let attempts = 0;
    const maxAttempts = 30;

    const interval = setInterval(async () => {
      attempts++;
      try {
        const response = await GraphQLClient.executeAuthenticated<{ getPayment: any }>(
          getPayment,
          { paymentId: paymentRef }
        );

        const payment = response.getPayment;
        if (payment?.status === 'CAPTURED' || payment?.status === 'AUTHORIZED') {
          clearInterval(interval);
          setStep('confirmed');
        } else if (payment?.status === 'FAILED') {
          clearInterval(interval);
          setError(payment.errorMessage || 'Payment failed');
          setStep('failed');
        }
      } catch {
        // Silent — keep polling
      }

      if (attempts >= maxAttempts) {
        clearInterval(interval);
        setPaymentMessage('Still waiting for payment confirmation. Check your M-Pesa and try again if needed.');
      }
    }, 10000);
  }

  // ═══════════════════════════════════════════════
  // RENDER: Confirmed
  // ═══════════════════════════════════════════════
  if (step === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-brand-50 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-ink-900 mb-3">Booking Confirmed!</h1>
        <p className="text-ink-500 mb-2"><strong>{property.title}</strong></p>
        <p className="text-ink-500 mb-6">
          {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
          {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          {' · '}{nights} night{nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
        </p>
        {paymentOption === 'deposit' && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-xl px-4 py-2 mb-6">
            Deposit of {formatPrice(depositAmount, property.currency)} paid. Balance of {formatPrice(balanceDue, property.currency)} due at check-in.
          </p>
        )}
        <p className="text-sm text-ink-400 mb-8">
          The host will send you check-in details on WhatsApp.
        </p>
        <button onClick={() => router.push('/')} className="btn-primary">
          Back to Home
        </button>
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
        <p className="text-ink-500 mb-6">{error || 'Something went wrong with your payment.'}</p>
        <button onClick={() => { setStep('confirmation'); setError(''); }} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RENDER: Processing
  // ═══════════════════════════════════════════════
  if (step === 'processing') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-bold text-ink-900 mb-2">Processing Payment</h2>
        <p className="text-ink-500">{paymentMessage || 'Initiating payment...'}</p>
        {paymentMessage && (
          <p className="text-sm text-ink-400 mt-4">This page will update automatically once payment is confirmed.</p>
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RENDER: Step 2 — Booking Confirmation + Pay
  // ═══════════════════════════════════════════════
  if (step === 'confirmation') {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-50 mb-4">
            <CheckCircleIcon className="h-8 w-8 text-brand-600" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900">
            {bookingData?.status === 'CONFIRMED' ? 'Booking Confirmed!' : 'Booking Request Sent!'}
          </h1>
          <p className="text-ink-500 mt-1 text-sm">
            {bookingData?.status === 'CONFIRMED'
              ? 'Complete payment to secure your dates.'
              : 'The host will confirm availability. You\'ll be notified once confirmed.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Booking summary card */}
          <div className="rounded-2xl border border-ink-100 p-5">
            <div className="flex gap-4 mb-4">
              <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0">
                <Image src={getCdnUrl(property.thumbnail)} alt={property.title} fill className="object-cover" />
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-ink-900 text-sm truncate">{property.title}</h3>
                <p className="text-xs text-ink-500 mt-0.5">{property.district}, {property.region}</p>
                <p className="text-xs text-ink-500 mt-1">
                  {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                  {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' · '}{nights} night{nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="border-t border-ink-100 pt-3 space-y-2 text-sm">
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
              <div className="flex justify-between font-semibold text-ink-900 pt-2 border-t border-ink-100">
                <span>Total</span>
                <span>{formatPrice(total, property.currency)}</span>
              </div>
            </div>
          </div>

          {/* Payment section — only for confirmed/instant bookings */}
          {bookingData?.status === 'CONFIRMED' && (
            <>
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
                      <p className="text-xs text-ink-500">Pay {formatPrice(total, property.currency)} now</p>
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
                        Pay {formatPrice(depositAmount, property.currency)} now, {formatPrice(balanceDue, property.currency)} at check-in
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* M-Pesa number */}
              <div className="rounded-2xl border border-ink-100 p-5">
                <h3 className="font-semibold text-ink-900 mb-1">Pay with Mobile Money</h3>
                <p className="text-xs text-ink-500 mb-3">M-Pesa, Airtel Money, Tigo Pesa, or Halotel</p>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value, setPhoneNumber)}
                  placeholder="0712 345 678"
                  className="input"
                />
                {phoneNumber && !/^255[67]\d{8}$/.test(phoneNumber) && (
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
                disabled={(!phoneNumber || !/^255[67]\d{8}$/.test(phoneNumber)) || isProcessing}
                className="btn-primary w-full text-base py-4"
              >
                {isProcessing ? 'Processing...' : `Pay ${formatPrice(payNowAmount, property.currency)}`}
              </button>

              <p className="text-center text-xs text-ink-400">
                Pay within 2 hours to secure your dates. A payment prompt will be sent to your phone.
              </p>
            </>
          )}

          {/* For pending bookings — inform guest to wait */}
          {bookingData?.status === 'PENDING' && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
              <p className="text-sm text-amber-800 font-medium mb-1">Awaiting host confirmation</p>
              <p className="text-xs text-amber-600">
                The host has 1 hour to confirm. Once confirmed, you&apos;ll receive a notification to complete payment via WhatsApp and email.
              </p>
            </div>
          )}

          <button onClick={() => router.push('/')} className="text-sm text-ink-500 hover:text-ink-700 text-center">
            ← Back to browsing
          </button>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════
  // RENDER: Step 1 — Collect Guest Details
  // ═══════════════════════════════════════════════
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-ink-900 mb-6">Book your stay</h1>

      <div className="grid grid-cols-1 gap-6">
        {/* Property summary card */}
        <div className="flex gap-4 p-4 rounded-2xl border border-ink-100">
          <div className="relative h-20 w-20 rounded-xl overflow-hidden shrink-0">
            <Image src={getCdnUrl(property.thumbnail)} alt={property.title} fill className="object-cover" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-900 text-sm truncate">{property.title}</h3>
            <p className="text-xs text-ink-500 mt-0.5">{property.district}, {property.region}</p>
            <p className="text-xs text-ink-500 mt-1">
              {new Date(checkIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
              {new Date(checkOut).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              {' · '}{nights} night{nights > 1 ? 's' : ''} · {guests} guest{guests > 1 ? 's' : ''}
            </p>
            {property.instantBookEnabled && (
              <span className="inline-flex items-center gap-1 text-xs text-brand-600 mt-1">
                <BoltIcon className="h-3 w-3" /> Instant Book
              </span>
            )}
          </div>
        </div>

        {/* Price breakdown */}
        <div className="rounded-2xl border border-ink-100 p-5">
          <h3 className="font-semibold text-ink-900 mb-3">Price breakdown</h3>
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
            <div className="flex justify-between font-semibold text-ink-900 pt-2 border-t border-ink-100">
              <span>Total</span>
              <span>{formatPrice(total, property.currency)}</span>
            </div>
          </div>
        </div>

        {/* Auth choice — sign in or continue as guest */}
        {authChoice === 'none' && !isAuthenticated && (
          <div className="rounded-2xl border border-ink-100 p-5">
            <h3 className="font-semibold text-ink-900 mb-3">How would you like to book?</h3>
            <div className="space-y-2">
              <button
                onClick={handleSignIn}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-ink-100 hover:border-brand-500 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">Sign in</p>
                  <p className="text-xs text-ink-500">Track your bookings and earn rewards</p>
                </div>
              </button>
              <button
                onClick={handleContinueAsGuest}
                className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-ink-100 hover:border-ink-200 transition-all text-left"
              >
                <div className="h-10 w-10 rounded-full bg-ink-50 flex items-center justify-center shrink-0">
                  <svg className="h-5 w-5 text-ink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-ink-900">Continue as guest</p>
                  <p className="text-xs text-ink-500">Just enter your details below</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Guest details form (shown after choice or if signed in) */}
        {authChoice !== 'none' && (
          <div className="rounded-2xl border border-ink-100 p-5">
            <h3 className="font-semibold text-ink-900 mb-3">Your details</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Full name</label>
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="John Doe"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Email</label>
                <input
                  type="email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-500 mb-1">Phone number (WhatsApp)</label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => handlePhoneChange(e.target.value, setGuestPhone)}
                  placeholder="0712 345 678"
                  className="input"
                  required
                />
                {guestPhone && !isValidGuestPhone && (
                  <p className="text-xs text-red-500 mt-1">Enter a valid Tanzanian number</p>
                )}
              </div>
            </div>
            {authChoice === 'guest' && (
              <p className="text-xs text-ink-400 mt-3">
                We&apos;ll send your booking confirmation via email and WhatsApp.{' '}
                <button type="button" onClick={handleSignIn} className="text-brand-600 hover:underline font-medium">
                  Sign in instead
                </button>
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Book button — only show after auth choice */}
        {authChoice !== 'none' && (
          <button
            onClick={handleCreateBooking}
            disabled={isProcessing || !guestName.trim() || !guestEmail.includes('@')}
            className="btn-primary w-full text-base py-4"
          >
            {isProcessing ? 'Creating booking...' : property.instantBookEnabled ? 'Book Now' : 'Request to Book'}
          </button>
        )}

        <p className="text-center text-xs text-ink-400">
          By booking, you agree to the host&apos;s cancellation policy ({property.cancellationPolicy?.toLowerCase() || 'flexible'}).
        </p>
      </div>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => { setShowAuthModal(false); handleAuthSuccess(); }} />
    </div>
  );
}
