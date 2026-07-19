'use client';

import { useState, useEffect, useCallback } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listPropertyBookings } from '@/graphql/queries';
import { approveBooking, declineBooking } from '@/graphql/mutations';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface BookingGuest {
  firstName: string;
  lastName: string;
  whatsappNumber?: string;
}

interface BookingPricing {
  total: number;
  subtotal: number;
  cleaningFee?: number;
  serviceFee?: number;
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
  bookingType: string;
  paymentStatus: string;
  guest: BookingGuest | null;
  guestName: string | null;
  guestEmail: string | null;
  guestPhone: string | null;
  pricing: BookingPricing;
  specialRequests: string | null;
  createdAt: string;
  property?: { title: string; thumbnail?: string } | null;
}

interface Props {
  propertyIds: string[];
}

type StatusFilter = 'PENDING' | 'CONFIRMED' | 'ALL';

const STATUS_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'Pending', classes: 'bg-amber-100 text-amber-800' },
  CONFIRMED: { label: 'Confirmed', classes: 'bg-blue-100 text-blue-800' },
  CANCELLED: { label: 'Cancelled', classes: 'bg-red-100 text-red-700' },
  DECLINED: { label: 'Declined', classes: 'bg-red-100 text-red-700' },
  COMPLETED: { label: 'Completed', classes: 'bg-ink-100 text-ink-600' },
  NO_SHOW: { label: 'No Show', classes: 'bg-ink-100 text-ink-600' },
};

const PAYMENT_CONFIG: Record<string, { label: string; classes: string }> = {
  PENDING: { label: 'Unpaid', classes: 'bg-gray-100 text-gray-600' },
  AUTHORIZED: { label: 'Authorized', classes: 'bg-blue-50 text-blue-600' },
  CAPTURED: { label: 'Paid', classes: 'bg-green-100 text-green-700' },
  REFUNDED: { label: 'Refunded', classes: 'bg-purple-100 text-purple-700' },
  FAILED: { label: 'Failed', classes: 'bg-red-100 text-red-700' },
};

export function HostBookings({ propertyIds }: Props) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>('ALL');
  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'past'>('upcoming');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [declineTarget, setDeclineTarget] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  const fetchBookings = useCallback(async (isPolling = false) => {
    if (propertyIds.length === 0) {
      console.log('[HostBookings] No property IDs provided');
      setBookings([]);
      setLoading(false);
      return;
    }

    try {
      if (!isPolling) setLoading(true);
      console.log('[HostBookings] Fetching bookings for', propertyIds.length, 'properties:', propertyIds);
      const allBookings: Booking[] = [];

      // Fetch bookings for each property (parallel, max 5 at a time)
      const batchSize = 5;
      for (let i = 0; i < propertyIds.length; i += batchSize) {
        const batch = propertyIds.slice(i, i + batchSize);
        console.log('[HostBookings] Fetching bookings for properties:', batch, 'filter:', filter);
        const results = await Promise.allSettled(
          batch.map((propertyId) =>
            GraphQLClient.executeAuthenticated<{
              listPropertyBookings: { bookings: Booking[]; count: number };
            }>(listPropertyBookings, {
              propertyId,
              limit: 20,
              status: filter === 'ALL' ? undefined : filter,
            })
          )
        );

        for (let j = 0; j < results.length; j++) {
          const result = results[j];
          if (result.status === 'fulfilled') {
            console.log(`[HostBookings] Property ${batch[j]} returned:`, result.value.listPropertyBookings);
            const items = result.value.listPropertyBookings?.bookings || [];
            allBookings.push(...items);
          } else {
            console.error(`[HostBookings] Property ${batch[j]} failed:`, result.reason);
          }
        }
      }

      console.log('[HostBookings] Total bookings found:', allBookings.length, allBookings);

      // Sort by date (newest first)
      allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(allBookings);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  }, [propertyIds, filter]);

  useEffect(() => {
    fetchBookings();

    // Poll every 10 seconds for new booking requests
    const interval = setInterval(() => fetchBookings(true), 10000);
    return () => clearInterval(interval);
  }, [fetchBookings]);

  async function handleApprove(bookingId: string) {
    setActionLoading(bookingId);
    try {
      await GraphQLClient.executeAuthenticated(approveBooking, { bookingId });
      toast.success('Booking approved');
      // Update local state
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? { ...b, status: 'CONFIRMED' } : b))
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to approve booking');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDecline(bookingId: string) {
    if (!declineReason.trim()) {
      toast.error('Please provide a reason for declining');
      return;
    }

    setActionLoading(bookingId);
    try {
      await GraphQLClient.executeAuthenticated(declineBooking, {
        bookingId,
        reason: declineReason.trim(),
      });
      toast.success('Booking declined');
      setBookings((prev) =>
        prev.map((b) => (b.bookingId === bookingId ? { ...b, status: 'DECLINED' } : b))
      );
      setDeclineTarget(null);
      setDeclineReason('');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to decline booking');
    } finally {
      setActionLoading(null);
    }
  }

  function formatDate(dateStr: string) {
    const [y, m, d] = dateStr.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  function formatPrice(amount: number, currency: string) {
    if (currency === 'USD') return `$${amount.toLocaleString()}`;
    return `TZS ${amount.toLocaleString()}`;
  }

  const pendingCount = bookings.filter((b) => b.status === 'PENDING').length;
  const today = new Date().toISOString().split('T')[0];
  const filteredBookings = bookings.filter((b) => {
    if (timeFilter === 'upcoming') return b.checkOutDate >= today;
    return b.checkOutDate < today;
  });

  return (
    <div className="space-y-5 pb-24 sm:pb-0">
      {/* Time toggle */}
      <div className="flex gap-2">
        {(['upcoming', 'past'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTimeFilter(t)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors',
              timeFilter === t
                ? 'bg-ink-900 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            )}
          >
            {t === 'upcoming' ? 'Upcoming' : 'Past'}
          </button>
        ))}
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {(['PENDING', 'CONFIRMED', 'ALL'] as StatusFilter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap touch-manipulation',
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
            )}
          >
            {f === 'PENDING' && pendingCount > 0 && filter !== 'PENDING'
              ? `Pending (${pendingCount})`
              : f === 'ALL'
                ? 'All'
                : f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse border border-ink-100 rounded-xl p-4">
              <div className="flex gap-3">
                <div className="h-12 w-12 rounded-full bg-ink-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-ink-100 rounded w-1/3" />
                  <div className="h-3 bg-ink-100 rounded w-1/2" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-ink-400 text-sm">
            {timeFilter === 'upcoming'
              ? (filter === 'PENDING' ? 'No pending upcoming requests' : 'No upcoming bookings')
              : 'No past bookings'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const statusCfg = STATUS_CONFIG[booking.status] || STATUS_CONFIG.PENDING;
            const guestName = booking.guestName
              || (booking.guest ? `${booking.guest.firstName} ${booking.guest.lastName || ''}`.trim() : null)
              || 'Guest';
            const guestContact = booking.guestPhone || booking.guest?.whatsappNumber || null;
            const isProcessing = actionLoading === booking.bookingId;
            const isPast = booking.checkInDate < today;

            return (
              <div
                key={booking.bookingId}
                className="border border-ink-100 rounded-xl p-4 sm:p-5 hover:border-ink-200 transition-colors"
              >
                {/* Top row: guest + status */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-ink-900">{guestName}</p>
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', statusCfg.classes)}>
                        {statusCfg.label}
                      </span>
                      {booking.paymentStatus && (
                        <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', (PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.PENDING).classes)}>
                          {(PAYMENT_CONFIG[booking.paymentStatus] || PAYMENT_CONFIG.PENDING).label}
                        </span>
                      )}
                    </div>
                    {booking.property?.title && (
                      <p className="text-xs text-ink-400 mt-0.5 truncate">{booking.property.title}</p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-ink-900 whitespace-nowrap">
                    {formatPrice((booking.pricing.subtotal || 0) + (booking.pricing.cleaningFee || 0), booking.pricing.currency)}
                  </p>
                </div>

                {/* Details row */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-500 mb-3">
                  <span>
                    {formatDate(booking.checkInDate)} → {formatDate(booking.checkOutDate)}
                  </span>
                  <span>{booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}</span>
                  <span>{booking.numberOfGuests} guest{booking.numberOfGuests > 1 ? 's' : ''}</span>
                </div>

                {/* Special requests */}
                {booking.specialRequests && (
                  <p className="text-xs text-ink-500 bg-ink-50 rounded-lg p-2 mb-3 italic">
                    &ldquo;{booking.specialRequests}&rdquo;
                  </p>
                )}

                {/* Actions for pending bookings (only upcoming) */}
                {booking.status === 'PENDING' && !isPast && (
                  <div className="pt-2 border-t border-ink-100">
                    {declineTarget === booking.bookingId ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={declineReason}
                          onChange={(e) => setDeclineReason(e.target.value)}
                          placeholder="Reason for declining..."
                          className="input text-sm py-2 w-full"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setDeclineTarget(null);
                              setDeclineReason('');
                            }}
                            className="btn-secondary text-xs py-1.5 px-3"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDecline(booking.bookingId)}
                            disabled={isProcessing || !declineReason.trim()}
                            className="text-xs py-1.5 px-3 rounded-lg font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                          >
                            {isProcessing ? 'Declining...' : 'Confirm Decline'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(booking.bookingId)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none btn-primary text-sm py-2 px-4"
                        >
                          {isProcessing ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setDeclineTarget(booking.bookingId)}
                          disabled={isProcessing}
                          className="flex-1 sm:flex-none btn-secondary text-sm py-2 px-4 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* WhatsApp contact for confirmed */}
                {booking.status === 'CONFIRMED' && guestContact && (
                  <div className="pt-2 border-t border-ink-100">
                    <a
                      href={`https://wa.me/${guestContact.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-green-700 font-medium hover:underline"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                      </svg>
                      Message Guest
                    </a>
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
