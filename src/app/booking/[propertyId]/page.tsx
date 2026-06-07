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

type PaymentOption = 'full' | 'deposit';
type BookingStep = 'summary' | 'payment' | 'processing' | 'confirmed' | 'failed';

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
  const [step, setStep] = useState<BookingStep>('summary');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [paymentMessage, setPaymentMessage] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

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
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.startsWith('0')) value = '255' + value.substring(1);
    else if (value.startsWith('7') || value.startsWith('6')) value = '255' + value;
    if (value.length > 12) value = value.substring(0, 12);
    setPhoneNumber(value);
  }

  const isValidPhone = /^255[67]\d{8}$/.test(phoneNumber);

  // Create booking + initiate payment
  async function handlePay() {
    if (!isValidPhone) {
      setError('Enter a valid phone number (e.g., 0712 345 678)');
      return;
    }

    setIsProcessing(true);
    setError('');
    setStep('processing');

    try {
      // 1. Create booking
      const bookingResponse = await GraphQLClient.executeAuthenticated<{ createBooking: any }>(
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
          },
        }
      );

      const createdBooking = bookingResponse.createBooking?.booking;
      if (!createdBooking) throw new Error('Failed to create booking');

      setBookingId(createdBooking.bookingId);

      // 2. Initiate payment
      const paymentResponse = await GraphQLClient.executeAuthenticated<{ initiatePayment: any }>(
        initiatePayment,
        {
          input: {
            bookingId: createdBooking.bookingId,
            phoneNumber,
          },
        }
      );

      const result = paymentResponse.initiatePayment;

      if (result.status === 'PENDING') {
        setPaymentMessage('Check your phone for the M-Pesa prompt. Confirm to complete payment.');
        // Start polling
        pollPaymentStatus(result.reference);
      } else if (result.status === 'COMPLETED' || result.status === 'CAPTURED') {
        setStep('confirmed');
      } else {
        setError(result.message || 'Payment failed');
        setStep('failed');
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.message || err?.message || 'Something went wrong. Please try again.';
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

  // Confirmed state
  if (step === 'confirmed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-brand-50 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-brand-600" />
        </div>
        <h1 className="text-3xl font-bold text-ink-900 mb-3">Booking Confirmed!</h1>
        <p className="text-ink-500 mb-2">
          <strong>{property.title}</strong>
        </p>
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

  // Failed state
  if (step === 'failed') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-red-50 mb-6">
          <ExclamationCircleIcon className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-ink-900 mb-3">Payment Failed</h1>
        <p className="text-ink-500 mb-6">{error || 'Something went wrong with your payment.'}</p>
        <button onClick={() => { setStep('summary'); setError(''); }} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  // Processing state
  if (step === 'processing') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="animate-spin h-12 w-12 border-4 border-brand-600 border-t-transparent rounded-full mx-auto mb-6" />
        <h2 className="text-xl font-bold text-ink-900 mb-2">Processing Payment</h2>
        <p className="text-ink-500">{paymentMessage || 'Creating your booking...'}</p>
        {paymentMessage && (
          <p className="text-sm text-ink-400 mt-4">This page will update automatically once payment is confirmed.</p>
        )}
      </div>
    );
  }

  // Summary + Payment step
  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
      <h1 className="text-2xl font-bold text-ink-900 mb-6">Confirm your booking</h1>

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

        {/* Payment option */}
        <div className="rounded-2xl border border-ink-100 p-5">
          <h3 className="font-semibold text-ink-900 mb-3">How would you like to pay?</h3>
          <div className="space-y-2">
            <label
              className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentOption === 'full' ? 'border-brand-500 bg-brand-50' : 'border-ink-100 hover:border-ink-200'
              }`}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentOption === 'full'}
                onChange={() => setPaymentOption('full')}
                className="sr-only"
              />
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
              <input
                type="radio"
                name="payment"
                checked={paymentOption === 'deposit'}
                onChange={() => setPaymentOption('deposit')}
                className="sr-only"
              />
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

        {/* Phone number input */}
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
          disabled={!isValidPhone || isProcessing}
          className="btn-primary w-full text-base py-4"
        >
          {isProcessing ? 'Processing...' : `Pay ${formatPrice(payNowAmount, property.currency)}`}
        </button>

        <p className="text-center text-xs text-ink-400">
          By booking, you agree to the host&apos;s cancellation policy ({property.cancellationPolicy?.toLowerCase() || 'flexible'}).
        </p>
      </div>
    </div>
  );
}
