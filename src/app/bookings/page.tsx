'use client';

import { useStayCopy } from '@/hooks/useStayCopy';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyBookings } from '@/graphql/queries';
import { createReview, cancelBooking } from '@/graphql/mutations';
import { getCdnUrl } from '@/lib/utils';

// Lightweight query just for property images
const getPropertyImages = /* GraphQL */ `
  query GetPropertyImages($propertyId: ID!) {
    getShortTermProperty(propertyId: $propertyId) {
      propertyId
      title
      thumbnail
      images
      district
      region
      propertyType
    }
  }
`;
import { CalendarDaysIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { AuthModal } from '@/components/auth/AuthModal';
import { ReviewModal, ReviewFormData } from '@/components/booking/ReviewModal';

interface BookingProperty {
  propertyId: string;
  title: string;
  thumbnail: string;
  images: string[];
  district: string;
  region: string;
  propertyType: string;
}

interface BookingPricing {
  total: number;
  currency: string;
  numberOfNights: number;
  nightlyRate: number;
}

interface Booking {
  bookingId: string;
  propertyId: string;
  checkInDate: string;
  checkOutDate: string;
  numberOfGuests: number;
  numberOfNights: number;
  status: string;
  paymentStatus: string;
  pricing: BookingPricing;
  property: BookingProperty | null;
  createdAt: string;
}

type Tab = 'upcoming' | 'past' | 'cancelled';

const STATUS_BADGE: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'Awaiting confirmation', classes: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', classes: 'bg-green-100 text-green-700' },
  COMPLETED: { label: 'Completed', classes: 'bg-ink-100 text-ink-600' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-red-100 text-red-700' },
  DECLINED: { label: 'Declined', classes: 'bg-red-100 text-red-700' },
};

export default function MyBookingsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { copy, sw } = useStayCopy();
  const router = useRouter();
  const [showAuth, setShowAuth] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [reviewedBookingIds, setReviewedBookingIds] = useState<Set<string>>(new Set());
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  async function fetchBookings() {
    try {
      setLoading(true);
      setLoadError(false);
      const data = await GraphQLClient.executeAuthenticated<{
        listMyBookings: { bookings: Booking[]; count: number };
      }>(listMyBookings, { limit: 50 });

      const rawBookings = data.listMyBookings?.bookings || [];

      // Enrich bookings with property details (images may not come from the booking query)
      const uniquePropertyIds = Array.from(new Set(rawBookings.map((b) => b.propertyId)));
      const propertyMap = new Map<string, BookingProperty>();

      // Fetch property details in parallel
      const propertyResults = await Promise.allSettled(
        uniquePropertyIds.map((propertyId) =>
          GraphQLClient.executePublic<{
            getShortTermProperty: BookingProperty;
          }>(getPropertyImages, { propertyId })
        )
      );

      for (const result of propertyResults) {
        if (result.status === 'fulfilled' && result.value.getShortTermProperty) {
          const p = result.value.getShortTermProperty;
          propertyMap.set(p.propertyId, p);
        }
      }

      // Merge property data into bookings
      const enriched = rawBookings.map((b) => ({
        ...b,
        property: propertyMap.get(b.propertyId) || b.property,
      }));

      setBookings(enriched);
    } catch (err) {
      console.error('Failed to load bookings:', err);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(review: ReviewFormData) {
    if (!reviewingBooking) return;
    try {
      const result = await GraphQLClient.executeAuthenticated(createReview, {
        input: {
          bookingId: reviewingBooking.bookingId,
          propertyId: reviewingBooking.propertyId,
          overallRating: review.overallRating,
          cleanliness: review.cleanliness,
          accuracy: review.accuracy,
          communication: review.communication,
          location: review.location,
          value: review.value,
          comment: review.comment.trim(),
        },
      });
      console.log('[ReviewSubmit] Success:', JSON.stringify(result, null, 2));
      toast.success('Review submitted! Thank you.');
      setReviewedBookingIds(prev => new Set([...Array.from(prev), reviewingBooking.bookingId]));
      setReviewingBooking(null);
    } catch (err: any) {
      console.error('[ReviewSubmit] Error:', err);
      const errorMsg = err?.errors?.[0]?.message || err?.message || '';
      if (errorMsg.includes('already reviewed')) {
        toast.error('You have already reviewed this booking.');
        setReviewedBookingIds(prev => new Set([...Array.from(prev), reviewingBooking.bookingId]));
        setReviewingBooking(null);
      } else {
        throw err;
      }
    }
  }

  async function handleCancelBooking(booking: Booking) {
    if (!confirm(`Are you sure you want to cancel your booking at ${booking.property?.title || 'this property'}?`)) return;
    setCancellingId(booking.bookingId);
    try {
      await GraphQLClient.executeAuthenticated(cancelBooking, {
        bookingId: booking.bookingId,
        reason: 'Cancelled by guest',
      });
      toast.success('Booking cancelled.');
      await fetchBookings();
    } catch (err: any) {
      toast.error(err?.errors?.[0]?.message || err?.message || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  }

  function formatDateShort(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(sw ? 'sw-TZ' : 'en-GB', { month: 'short', day: 'numeric' });
  }

  function formatPrice(amount: number, currency: string) {
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    return `TZS ${amount.toLocaleString()}`;
  }

  function daysUntil(dateStr: string): number {
    const target = new Date(dateStr + 'T00:00:00');
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;

  const filtered = bookings.filter((b) => {
    const isCancelled = b.status === 'CANCELLED' || b.status === 'DECLINED' || b.status === 'NO_SHOW';
    const isCompleted = b.status === 'COMPLETED';
    const checkOutPassed = b.checkOutDate <= today;

    if (activeTab === 'cancelled') {
      return isCancelled;
    }
    if (activeTab === 'past') {
      // Past = checkout has passed OR completed, and NOT cancelled
      return !isCancelled && (isCompleted || checkOutPassed);
    }
    // Upcoming = checkout hasn't passed, not completed, and not cancelled
    return !isCancelled && !isCompleted && !checkOutPassed;
  });

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) return <div className="mx-auto max-w-lg px-4 py-16 text-center">
    <CalendarDaysIcon className="mx-auto mb-5 h-12 w-12 text-brand-700" />
    <h1 className="text-3xl font-semibold tracking-tight text-ink-900">{copy("Your trips, in one place")}</h1>
    <p className="mt-3 text-sm leading-6 text-ink-500">{copy("Sign in to see your reservations. Booked as a guest? Use the booking link in your email or WhatsApp.")}</p>
    <button onClick={() => setShowAuth(true)} className="btn-primary mt-6">{copy("Sign in")}</button>
    <Link href="/search" className="block mt-4 text-sm font-medium text-brand-700">{copy("Explore stays")}</Link>
    <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
  </div>;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-900 mb-3">{copy("My trips")}</h1>
      <p className="text-ink-500 text-sm mb-6">{copy("Reservations, payment status and what to do next")}</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-ink-100 pb-0">
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap touch-manipulation',
              activeTab === tab
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            )}
          >
            {copy(tab.charAt(0).toUpperCase() + tab.slice(1))}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-ink-100">
              <div className="h-48 sm:h-56 bg-ink-100" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-ink-100 rounded w-2/3" />
                <div className="h-4 bg-ink-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : loadError ? (
        <div role="alert" className="rounded-2xl border border-ink-200 p-8 text-center"><p className="text-sm text-ink-600">{copy("Your trips could not load. Please try again.")}</p><button onClick={fetchBookings} className="btn-primary mt-4">{copy("Try again")}</button></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 rounded-3xl border border-ink-200 bg-ink-50">
          <CalendarDaysIcon className="h-16 w-16 text-ink-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-ink-700 mb-2">
            {copy(activeTab === 'upcoming' ? 'No trips planned' : activeTab === 'past' ? 'No past trips' : 'No cancellations')}
          </h2>
          <p className="text-ink-400 text-sm mb-6">
            {activeTab === 'upcoming' && copy('Time to explore! Find a place to stay.')}
          </p>
          {activeTab === 'upcoming' && (
            <Link href="/search" className="btn-primary inline-flex items-center gap-2">
              {copy("Start exploring")}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {filtered.map((booking) => {
            const isPaid = booking.paymentStatus === 'CAPTURED' || booking.paymentStatus === 'AUTHORIZED';
            const badge = booking.status === 'CONFIRMED' && !isPaid
              ? { label: 'Confirmed — Pay now', classes: 'bg-brand-50 text-brand-800' }
              : booking.status === 'CONFIRMED' && isPaid
              ? { label: 'Confirmed & Paid', classes: 'bg-green-100 text-green-700' }
              : STATUS_BADGE[booking.status] || STATUS_BADGE.PENDING;
            const canReview = (
              !reviewedBookingIds.has(booking.bookingId) &&
              (booking.status === 'COMPLETED' ||
              (booking.status === 'CONFIRMED' && booking.paymentStatus === 'CAPTURED' && booking.checkInDate <= today))
            );
            const propertyImage = booking.property?.thumbnail || booking.property?.images?.[0] || '';
            const days = daysUntil(booking.checkInDate);

            return (
              <div key={booking.bookingId} className="rounded-2xl border border-ink-200 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                {/* Property image — large, clickable */}
                <Link href={`/property/${booking.propertyId}`} className="block relative">
                  <div className="relative aspect-[16/10] bg-ink-100">
                    {propertyImage ? (
                      <Image
                        src={getCdnUrl(propertyImage)}
                        alt={booking.property?.title || 'Property'}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 800px"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <CalendarDaysIcon className="h-12 w-12 text-ink-300" />
                      </div>
                    )}

                    {/* Status overlay */}
                    <div className="absolute top-4 left-4">
                      <span className={cn('text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm', badge.classes)}>
                        {copy(badge.label)}
                      </span>
                    </div>

                    {/* Countdown for upcoming */}
                    {activeTab === 'upcoming' && days >= 0 && days <= 30 && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-ink-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {days === 0 ? copy('Today!') : days === 1 ? copy('Tomorrow') : sw ? `Baada ya siku ${days}` : `In ${days} days`}
                      </div>
                    )}

                    {/* Date bar at bottom of image */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pt-10 pb-4 px-5">
                      <p className="text-white font-semibold text-sm">
                        {formatDateShort(booking.checkInDate)} – {formatDateShort(booking.checkOutDate)}
                      </p>
                    </div>
                  </div>
                </Link>

                {/* Booking details */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col">
                  <Link href={`/property/${booking.propertyId}`}>
                    <h3 className="text-sm sm:text-base font-semibold text-ink-900 hover:text-brand-600 transition-colors line-clamp-1">
                      {booking.property?.title || 'Property'}
                    </h3>
                  </Link>

                  {booking.property && (
                    <p className="flex items-center gap-1 mt-1 text-xs text-ink-500">
                      <MapPinIcon className="h-3 w-3" />
                      {booking.property.district}, {booking.property.region}
                    </p>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mt-auto pt-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <CalendarDaysIcon className="h-3.5 w-3.5" />
                      {booking.numberOfNights} {copy(booking.numberOfNights > 1 ? 'nights' : 'night')}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="h-3.5 w-3.5" />
                      {booking.numberOfGuests} {copy(booking.numberOfGuests > 1 ? 'guests' : 'guest')}
                    </span>
                    <span className="ml-auto text-sm font-bold text-ink-900">
                      {formatPrice(booking.pricing.total, booking.pricing.currency)}
                    </span>
                  </div>
                </div>

                {activeTab === 'upcoming' && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                  <div className="mx-4 sm:mx-5 mb-5 rounded-xl bg-ink-50 p-4">
                    <p className="text-sm font-semibold text-ink-900">{copy(booking.status === 'PENDING' ? 'Waiting for your host' : isPaid ? 'Your stay is booked' : 'Complete your payment')}</p>
                    <p className="mt-1 text-xs leading-5 text-ink-500">{copy(booking.status === 'PENDING' ? 'We will notify you when the host responds. Payment follows confirmation.' : isPaid ? 'Keep your booking reference handy and check your messages for arrival details.' : 'The host has confirmed your stay. Continue to payment to secure your dates.')}</p>
                    <p className="mt-2 break-all text-[11px] text-ink-500">{copy("Booking reference:")} {booking.bookingId}</p>
                    {booking.status === 'CONFIRMED' && !isPaid && <Link href={`/pay/${booking.bookingId}`} className="btn-primary mt-3 w-full text-sm">{copy("Continue to payment")}</Link>}
                  </div>
                )}
                {/* Review CTA for completed bookings */}
                {canReview && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <button
                      onClick={() => setReviewingBooking(booking)}
                      className="w-full py-2.5 rounded-xl border-2 border-ink-800 text-xs font-semibold text-ink-800 hover:bg-ink-800 hover:text-white transition-colors touch-manipulation"
                    >
                      <Star className="w-3.5 h-3.5 inline mr-1" /> {copy("Write a review")}
                    </button>
                  </div>
                )}

                {/* Cancel button for upcoming unpaid bookings */}
                {activeTab === 'upcoming' && (booking.status === 'PENDING' || booking.status === 'CONFIRMED') && booking.paymentStatus !== 'CAPTURED' && booking.paymentStatus !== 'AUTHORIZED' && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <button
                      onClick={() => handleCancelBooking(booking)}
                      disabled={cancellingId === booking.bookingId}
                      className="w-full py-2.5 rounded-xl border-2 border-red-400 text-xs font-semibold text-red-600 hover:bg-red-600 hover:text-white transition-colors touch-manipulation disabled:opacity-50"
                    >
                      {copy(cancellingId === booking.bookingId ? 'Cancelling...' : 'Cancel booking')}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={!!reviewingBooking}
        onClose={() => setReviewingBooking(null)}
        onSubmit={handleSubmitReview}
        property={reviewingBooking?.property || null}
        checkInDate={reviewingBooking?.checkInDate || ''}
        checkOutDate={reviewingBooking?.checkOutDate || ''}
      />
    </div>
  );
}
