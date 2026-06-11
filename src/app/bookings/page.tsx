'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyBookings } from '@/graphql/queries';
import { createReview } from '@/graphql/mutations';
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
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, CalendarDaysIcon, MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

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
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [reviewingBooking, setReviewingBooking] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState({
    overallRating: 0,
    cleanliness: 5,
    accuracy: 5,
    communication: 5,
    location: 5,
    value: 5,
    comment: '',
  });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    }
  }, [isAuthenticated]);

  async function fetchBookings() {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitReview(bookingId: string, propertyId: string) {
    if (reviewForm.overallRating === 0) {
      toast.error('Please select an overall rating');
      return;
    }
    if (!reviewForm.comment.trim()) {
      toast.error('Please write a short comment');
      return;
    }

    setSubmittingReview(true);
    try {
      await GraphQLClient.executeAuthenticated(createReview, {
        input: {
          bookingId,
          propertyId,
          overallRating: reviewForm.overallRating,
          cleanliness: reviewForm.cleanliness,
          accuracy: reviewForm.accuracy,
          communication: reviewForm.communication,
          location: reviewForm.location,
          value: reviewForm.value,
          comment: reviewForm.comment.trim(),
        },
      });
      toast.success('Review submitted! Thank you.');
      setReviewingBooking(null);
      setReviewForm({ overallRating: 0, cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5, comment: '' });
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function formatDateShort(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
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

  const today = new Date().toISOString().split('T')[0];

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return (b.status === 'CONFIRMED' || b.status === 'PENDING') && b.checkInDate >= today;
    }
    if (activeTab === 'past') {
      return b.status === 'COMPLETED'
        || (b.status === 'CONFIRMED' && b.checkOutDate < today);
    }
    return b.status === 'CANCELLED' || b.status === 'DECLINED';
  });

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-2xl sm:text-3xl font-bold text-ink-900 mb-2">Trips</h1>
      <p className="text-ink-500 text-sm mb-6">Your upcoming and past reservations</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-8 border-b border-ink-100 pb-0">
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap touch-manipulation',
              activeTab === tab
                ? 'border-ink-900 text-ink-900'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDaysIcon className="h-16 w-16 text-ink-200 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-ink-700 mb-2">
            {activeTab === 'upcoming' ? 'No trips planned' : activeTab === 'past' ? 'No past trips' : 'No cancellations'}
          </h2>
          <p className="text-ink-400 text-sm mb-6">
            {activeTab === 'upcoming' && 'Time to explore! Find a place to stay.'}
          </p>
          {activeTab === 'upcoming' && (
            <Link href="/search" className="btn-primary inline-flex items-center gap-2">
              Start exploring
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
          {filtered.map((booking) => {
            const badge = STATUS_BADGE[booking.status] || STATUS_BADGE.PENDING;
            const canReview = activeTab === 'past' && (
              booking.status === 'COMPLETED' ||
              (booking.status === 'CONFIRMED' && booking.paymentStatus === 'CAPTURED' && booking.checkOutDate < today)
            );
            const isReviewing = reviewingBooking === booking.bookingId;
            const propertyImage = booking.property?.thumbnail || booking.property?.images?.[0] || '';
            const days = daysUntil(booking.checkInDate);

            return (
              <div key={booking.bookingId} className="rounded-2xl border border-ink-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
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
                        {badge.label}
                      </span>
                    </div>

                    {/* Countdown for upcoming */}
                    {activeTab === 'upcoming' && days >= 0 && days <= 30 && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-ink-800 text-xs font-semibold px-3 py-1.5 rounded-full">
                        {days === 0 ? 'Today!' : days === 1 ? 'Tomorrow' : `In ${days} days`}
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
                      {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="h-3.5 w-3.5" />
                      {booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}
                    </span>
                    <span className="ml-auto text-sm font-bold text-ink-900">
                      {formatPrice(booking.pricing.total, booking.pricing.currency)}
                    </span>
                  </div>
                </div>

                {/* Review CTA for completed bookings */}
                {canReview && !isReviewing && (
                  <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-0">
                    <button
                      onClick={() => setReviewingBooking(booking.bookingId)}
                      className="w-full py-2.5 rounded-xl border-2 border-ink-800 text-xs font-semibold text-ink-800 hover:bg-ink-800 hover:text-white transition-colors touch-manipulation"
                    >
                      Write a review
                    </button>
                  </div>
                )}

                {/* Review form */}
                {isReviewing && (
                  <div className="border-t border-ink-100 p-4 sm:p-5 space-y-4 bg-ink-50/50">
                    <p className="text-base font-semibold text-ink-900">How was your stay?</p>

                    {/* Overall rating */}
                    <div>
                      <label className="block text-sm font-medium text-ink-600 mb-2">Overall rating</label>
                      <div className="flex gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((f) => ({ ...f, overallRating: star }))}
                            className="touch-manipulation"
                          >
                            {star <= reviewForm.overallRating ? (
                              <StarSolid className="h-8 w-8 text-amber-400" />
                            ) : (
                              <StarOutline className="h-8 w-8 text-ink-300 hover:text-amber-300 transition-colors" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category ratings */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(['cleanliness', 'accuracy', 'communication', 'location', 'value'] as const).map((cat) => (
                        <div key={cat}>
                          <label className="block text-xs font-medium text-ink-600 mb-1.5 capitalize">{cat}</label>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm((f) => ({ ...f, [cat]: star }))}
                                className="touch-manipulation"
                              >
                                {star <= reviewForm[cat] ? (
                                  <StarSolid className="h-5 w-5 text-amber-400" />
                                ) : (
                                  <StarOutline className="h-5 w-5 text-ink-200" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-sm font-medium text-ink-600 mb-1.5">Your review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                        placeholder="What did you love? What could be improved?"
                        className="input text-sm min-h-[100px]"
                        rows={4}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          setReviewingBooking(null);
                          setReviewForm({ overallRating: 0, cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5, comment: '' });
                        }}
                        className="btn-secondary text-sm py-2.5 px-5"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReview(booking.bookingId, booking.propertyId)}
                        disabled={submittingReview || reviewForm.overallRating === 0}
                        className="btn-primary text-sm py-2.5 px-5 flex-1"
                      >
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
