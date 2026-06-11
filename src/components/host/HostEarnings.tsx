'use client';

import { useState, useEffect } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { listPropertyBookings } from '@/graphql/queries';
import { BanknotesIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface BookingPricing {
  total: number;
  currency: string;
}

interface Booking {
  bookingId: string;
  status: string;
  checkInDate: string;
  checkOutDate: string;
  pricing: BookingPricing;
  numberOfNights: number;
}

interface Props {
  propertyIds: string[];
  currency?: string;
}

interface EarningsData {
  totalEarnings: number;
  completedBookings: number;
  upcomingBookings: number;
  totalNights: number;
  currency: string;
}

export function HostEarnings({ propertyIds, currency = 'TZS' }: Props) {
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (propertyIds.length === 0) {
      setData({ totalEarnings: 0, completedBookings: 0, upcomingBookings: 0, totalNights: 0, currency });
      setLoading(false);
      return;
    }
    fetchEarnings();
  }, [propertyIds]);

  async function fetchEarnings() {
    try {
      setLoading(true);
      const allBookings: Booking[] = [];

      // Fetch confirmed + completed bookings across all properties
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

      const totalEarnings = confirmed.reduce((sum, b) => sum + (b.pricing?.total || 0), 0);
      const completedBookings = allBookings.filter((b) => b.status === 'COMPLETED').length;
      const upcomingBookings = allBookings.filter(
        (b) => b.status === 'CONFIRMED' && b.checkInDate >= today
      ).length;
      const totalNights = confirmed.reduce((sum, b) => sum + (b.numberOfNights || 0), 0);

      // Detect primary currency from bookings
      const detectedCurrency = confirmed[0]?.pricing?.currency || currency;

      setData({
        totalEarnings,
        completedBookings,
        upcomingBookings,
        totalNights,
        currency: detectedCurrency,
      });
    } catch (err) {
      console.error('Failed to fetch earnings:', err);
      setData({ totalEarnings: 0, completedBookings: 0, upcomingBookings: 0, totalNights: 0, currency });
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(amount: number, cur: string) {
    if (cur === 'USD') return `$${amount.toLocaleString()}`;
    return `TZS ${amount.toLocaleString()}`;
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-ink-50 rounded-xl p-4 h-20" />
        ))}
      </div>
    );
  }

  if (!data) return null;

  const stats = [
    {
      label: 'Total Earnings',
      value: formatPrice(data.totalEarnings, data.currency),
      icon: BanknotesIcon,
      highlight: true,
    },
    {
      label: 'Upcoming',
      value: `${data.upcomingBookings}`,
      icon: CalendarIcon,
      highlight: data.upcomingBookings > 0,
    },
    {
      label: 'Completed',
      value: `${data.completedBookings}`,
      icon: UserGroupIcon,
      highlight: false,
    },
    {
      label: 'Nights Booked',
      value: `${data.totalNights}`,
      icon: CalendarIcon,
      highlight: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className={`rounded-xl p-3 sm:p-4 border ${
              stat.highlight
                ? 'border-brand-200 bg-brand-50'
                : 'border-ink-100 bg-white'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`h-4 w-4 ${stat.highlight ? 'text-brand-600' : 'text-ink-400'}`} />
              <span className="text-xs text-ink-500">{stat.label}</span>
            </div>
            <p className={`text-lg sm:text-xl font-bold ${stat.highlight ? 'text-brand-700' : 'text-ink-900'}`}>
              {stat.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
