'use client';

import { useState, useEffect } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listPropertyBookings } from '@/graphql/queries';
import { BanknotesIcon, CalendarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';

interface BookingPricing {
  total: number;
  currency: string;
}

interface Booking {
  bookingId: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  createdAt: string;
  pricing: BookingPricing;
  numberOfNights: number;
}

interface Props {
  propertyIds: string[];
  currency?: string;
}

interface MonthlyData {
  month: string; // "Jan", "Feb", etc.
  earnings: number;
  bookings: number;
}

export function HostEarnings({ propertyIds, currency = 'TZS' }: Props) {
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [upcomingBookings, setUpcomingBookings] = useState(0);
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [detectedCurrency, setDetectedCurrency] = useState(currency);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyIds.length === 0) {
      setLoading(false);
      return;
    }
    fetchEarnings();
  }, [propertyIds]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      const allBookings: Booking[] = [];

      const results = await Promise.allSettled(
        propertyIds.map((propertyId) =>
          GraphQLClient.executeAuthenticated<{
            listPropertyBookings: { bookings: Booking[] };
          }>(listPropertyBookings, { propertyId, limit: 50 })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          const items = result.value.listPropertyBookings?.bookings || [];
          allBookings.push(...items);
        }
      }

      const today = new Date().toISOString().split('T')[0];
      const confirmed = allBookings.filter(
        (b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED'
      );

      const total = confirmed.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
      const upcoming = allBookings.filter(
        (b) => b.status === 'CONFIRMED' && b.checkInDate >= today
      ).length;
      const cur = confirmed[0]?.pricing?.currency || currency;

      // Build last 6 months of data
      const months = buildMonthlyData(confirmed);

      setTotalEarnings(total);
      setUpcomingBookings(upcoming);
      setDetectedCurrency(cur);
      setMonthlyData(months);
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
    } finally {
      setLoading(false);
    }
  }

  function buildMonthlyData(bookings: Booking[]): MonthlyData[] {
    const now = new Date();
    const months: MonthlyData[] = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Last 6 months including current
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = monthNames[d.getMonth()];

      const monthBookings = bookings.filter((b) => {
        const bookingMonth = (b.checkInDate || b.createdAt || '').slice(0, 7);
        return bookingMonth === key;
      });

      months.push({
        month: label,
        earnings: monthBookings.reduce((sum, b) => sum + (b.pricing?.total || 0), 0),
        bookings: monthBookings.length,
      });
    }

    return months;
  }

  function formatPrice(amount: number) {
    if (detectedCurrency === 'USD') return `$${amount.toLocaleString()}`;
    if (amount >= 1000000) return `TZS ${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `TZS ${(amount / 1000).toFixed(0)}K`;
    return `TZS ${amount.toLocaleString()}`;
  }

  function formatPriceFull(amount: number) {
    if (detectedCurrency === 'USD') return `$${amount.toLocaleString()}`;
    return `TZS ${amount.toLocaleString()}`;
  }

  if (loading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-ink-50 rounded-xl h-16" />
          ))}
        </div>
        <div className="bg-ink-50 rounded-xl h-40" />
      </div>
    );
  }

  const maxEarnings = Math.max(...monthlyData.map((m) => m.earnings), 1);
  const hasData = monthlyData.some((m) => m.earnings > 0);

  return (
    <div className="mb-6 space-y-4">
      {/* Stat cards — compact row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl p-3 border border-brand-200 bg-brand-50">
          <div className="flex items-center gap-1.5 mb-0.5">
            <BanknotesIcon className="h-3.5 w-3.5 text-brand-600" />
            <span className="text-[10px] sm:text-xs text-brand-600 font-medium">Earnings</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-brand-700 truncate">
            {formatPriceFull(totalEarnings)}
          </p>
        </div>
        <div className="rounded-xl p-3 border border-ink-100">
          <div className="flex items-center gap-1.5 mb-0.5">
            <CalendarIcon className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-[10px] sm:text-xs text-ink-500 font-medium">Upcoming</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-ink-900">{upcomingBookings}</p>
        </div>
        <div className="rounded-xl p-3 border border-ink-100">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-[10px] sm:text-xs text-ink-500 font-medium">This Month</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-ink-900">
            {monthlyData.length > 0 ? formatPrice(monthlyData[monthlyData.length - 1].earnings) : '—'}
          </p>
        </div>
      </div>

      {/* Bar chart */}
      {hasData && (
        <div className="rounded-xl border border-ink-100 p-4">
          <p className="text-xs font-medium text-ink-500 mb-3">Monthly earnings (last 6 months)</p>
          <div className="flex items-end gap-1.5 sm:gap-3 h-28 sm:h-36">
            {monthlyData.map((month, i) => {
              const heightPercent = maxEarnings > 0 ? (month.earnings / maxEarnings) * 100 : 0;
              const isCurrentMonth = i === monthlyData.length - 1;

              return (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-1">
                  {/* Bar */}
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className={`w-full max-w-[40px] rounded-t-md transition-all ${
                        isCurrentMonth ? 'bg-brand-500' : 'bg-brand-200'
                      }`}
                      style={{
                        height: `${Math.max(heightPercent, month.earnings > 0 ? 8 : 2)}%`,
                      }}
                      title={`${month.month}: ${formatPriceFull(month.earnings)} (${month.bookings} booking${month.bookings !== 1 ? 's' : ''})`}
                    />
                  </div>
                  {/* Label */}
                  <span className={`text-[10px] sm:text-xs font-medium ${isCurrentMonth ? 'text-brand-600' : 'text-ink-400'}`}>
                    {month.month}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
