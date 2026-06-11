'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyBookings } from '@/graphql/queries';
import { createReview } from '@/graphql/mutations';
import { StarIcon as StarSolid } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, CalendarDaysIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BookingProperty {
  propertyId: string;
  title: string;
  thumbnail: string;
  district: string;
  region: string;
}

interface BookingPricing {
  total: number;
  currency: string;
  numberOfNights: number;
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
  PENDING: { label: 'Pending', classes: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', classes: 'bg-blue-100 text-blue-800' },
  COMPLETED: { label: 'Completed', classes: 'bg-green-100 text-green-700' },
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
      setBookings(data.listMyBookings?.bookings || []);
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
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function formatPrice(amount: number, currency: string) {
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    return `TZS ${amount.toLocaleString()}`;
  }

  const today = new Date().toISOString().split('T')[0];

  const filtered = bookings.filter((b) => {
    if (activeTab === 'upcoming') {
      return (b.status === 'CONFIRMED' || b.status === 'PENDING') && b.checkInDate >= today;
    }
    if (activeTab === 'past') {
      return b.status === 'COMPLETED' || (b.status === 'CONFIRMED' && b.checkOutDate < today);
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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-6 sm:py-10">
      <h1 className="text-xl sm:text-2xl font-bold text-ink-900 mb-6">My Bookings</h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar">
        {(['upcoming', 'past', 'cancelled'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap touch-manipulation',
              activeTab === tab
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Bookings */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-ink-100 rounded-xl p-4 h-32" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <CalendarDaysIcon className="h-12 w-12 text-ink-200 mx-auto mb-3" />
          <p className="text-ink-500 text-sm">
            {activeTab === 'upcoming' ? 'No upcoming bookings' : activeTab === 'past' ? 'No past stays yet' : 'No cancelled bookings'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const badge = STATUS_BADGE[booking.status] || STATUS_BADGE.PENDING;
            const canReview = activeTab === 'past' && booking.status === 'COMPLETED';
            const isReviewing = reviewingBooking === booking.bookingId;

            return (
              <div key={booking.bookingId} className="border border-ink-100 rounded-xl overflow-hidden">
                {/* Booking card */}
                <div className="flex gap-3 p-4">
                  {/* Property thumbnail */}
                  {booking.property?.thumbnail && (
                    <Link href={`/property/${booking.propertyId}`} className="shrink-0">
                      <img
                        src={booking.property.thumbnail}
                        alt={booking.property.title || ''}
                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl object-cover"
                      />
                    </Link>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link href={`/property/${booking.propertyId}`}>
                          <h3 className="text-sm font-semibold text-ink-900 truncate hover:text-brand-600 transition-colors">
                            {booking.property?.title || 'Property'}
                          </h3>
                        </Link>
                        {booking.property && (
                          <p className="text-xs text-ink-400 mt-0.5">
                            {booking.property.district}, {booking.property.region}
                          </p>
                        )}
                      </div>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full shrink-0', badge.classes)}>
                        {badge.label}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-ink-500">
                      <span>{formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}</span>
                      <span>{booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}</span>
                      <span>{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
                    </div>

                    <p className="text-sm font-semibold text-ink-800 mt-2">
                      {formatPrice(booking.pricing.total, booking.pricing.currency)}
                    </p>
                  </div>
                </div>

                {/* Review section for completed bookings */}
                {canReview && !isReviewing && (
                  <div className="px-4 pb-4 pt-0">
                    <button
                      onClick={() => setReviewingBooking(booking.bookingId)}
                      className="w-full btn-secondary text-sm py-2 touch-manipulation"
                    >
                      Leave a Review
                    </button>
                  </div>
                )}

                {/* Review form */}
                {isReviewing && (
                  <div className="border-t border-ink-100 p-4 space-y-4 bg-ink-50/50">
                    <p className="text-sm font-medium text-ink-800">How was your stay?</p>

                    {/* Overall rating - stars */}
                    <div>
                      <label className="block text-xs font-medium text-ink-600 mb-1.5">Overall rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewForm((f) => ({ ...f, overallRating: star }))}
                            className="touch-manipulation"
                          >
                            {star <= reviewForm.overallRating ? (
                              <StarSolid className="h-7 w-7 text-amber-400" />
                            ) : (
                              <StarOutline className="h-7 w-7 text-ink-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Category ratings */}
                    <div className="grid grid-cols-2 gap-3">
                      {(['cleanliness', 'accuracy', 'communication', 'location', 'value'] as const).map((cat) => (
                        <div key={cat}>
                          <label className="block text-xs font-medium text-ink-600 mb-1 capitalize">{cat}</label>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                type="button"
                                onClick={() => setReviewForm((f) => ({ ...f, [cat]: star }))}
                                className="touch-manipulation"
                              >
                                {star <= reviewForm[cat] ? (
                                  <StarSolid className="h-4 w-4 text-amber-400" />
                                ) : (
                                  <StarOutline className="h-4 w-4 text-ink-300" />
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Comment */}
                    <div>
                      <label className="block text-xs font-medium text-ink-600 mb-1">Your review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                        placeholder="What did you love? What could be improved?"
                        className="input text-sm min-h-[80px]"
                        rows={3}
                      />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setReviewingBooking(null);
                          setReviewForm({ overallRating: 0, cleanliness: 5, accuracy: 5, communication: 5, location: 5, value: 5, comment: '' });
                        }}
                        className="btn-secondary text-sm py-2 px-4"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSubmitReview(booking.bookingId, booking.propertyId)}
                        disabled={submittingReview || reviewForm.overallRating === 0}
                        className="btn-primary text-sm py-2 px-4 flex-1"
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
