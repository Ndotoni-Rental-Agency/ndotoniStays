'use client';

import { useState, useEffect } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listPropertyBookings } from '@/graphql/queries';
import { calculateEarnings } from '@/lib/earnings';
import { BanknotesIcon, CalendarIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

interface BookingPricing {
  total: number;
  currency: string;
}

interface Booking {
  bookingId: string;
  status: string;
  paymentStatus: string;
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
  const [potentialEarnings, setPotentialEarnings] = useState(0);
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

      // Deduplicated earnings calculation
      const { totalPaid, totalPotential, currency: detCurrency } = calculateEarnings(allBookings, currency);

      const upcoming = allBookings.filter(
        (b) => b.status === 'CONFIRMED' && b.checkInDate >= today
      ).length;

      const paidBookings = allBookings.filter((b) => b.paymentStatus === 'CAPTURED');

      // Build last 6 months of data (only paid bookings for the chart)
      const months = buildMonthlyData(paidBookings);

      setTotalEarnings(totalPaid);
      setPotentialEarnings(totalPotential);
      setUpcomingBookings(upcoming);
      setDetectedCurrency(detCurrency);
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

  const hasData = monthlyData.some((m) => m.earnings > 0);

  return (
    <div className="mb-6 space-y-4">
      {/* Stat cards — compact row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl p-3 border border-green-200 bg-green-50">
          <div className="flex items-center gap-1.5 mb-0.5">
            <BanknotesIcon className="h-3.5 w-3.5 text-green-600" />
            <span className="text-[10px] sm:text-xs text-green-700 font-medium">Earned</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-green-800 truncate">
            {formatPriceFull(totalEarnings)}
          </p>
        </div>
        <div className="rounded-xl p-3 border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-1.5 mb-0.5">
            <ArrowTrendingUpIcon className="h-3.5 w-3.5 text-amber-600" />
            <span className="text-[10px] sm:text-xs text-amber-700 font-medium">Potential</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-amber-800 truncate">
            {formatPriceFull(potentialEarnings)}
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
            <BanknotesIcon className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-[10px] sm:text-xs text-ink-500 font-medium">This Month</span>
          </div>
          <p className="text-sm sm:text-lg font-bold text-ink-900">
            {monthlyData.length > 0 ? formatPrice(monthlyData[monthlyData.length - 1].earnings) : '—'}
          </p>
        </div>
      </div>

      {/* Bar chart — recharts */}
      {hasData && (
        <div className="rounded-xl border border-ink-100 p-4">
          <p className="text-xs font-medium text-ink-500 mb-3">Monthly earnings (last 6 months)</p>
          <div className="h-44 sm:h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#888' }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: '#aaa' }}
                  tickFormatter={(v) => {
                    if (detectedCurrency === 'USD') return `$${v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v}`;
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                    return String(v);
                  }}
                  width={45}
                />
                <Tooltip
                  formatter={(value: number) => [formatPriceFull(value), 'Earned']}
                  labelStyle={{ fontSize: 12, color: '#666' }}
                  contentStyle={{ borderRadius: 12, border: '1px solid #eee', fontSize: 13 }}
                  cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                />
                <Bar
                  dataKey="earnings"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
