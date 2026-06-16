'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { GraphQLClient } from '@/lib/graphql-client';
import { listMyShortTermProperties, listPropertyBookings } from '@/graphql/queries';
import {
  HomeModernIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  StarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

export function HostSidebar() {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(0);

  const fetchPendingCount = useCallback(async () => {
    try {
      const data = await GraphQLClient.executeAuthenticated<{
        listMyShortTermProperties: { properties: Array<{ propertyId: string }> };
      }>(listMyShortTermProperties, { limit: 50 });

      const propertyIds = (data.listMyShortTermProperties?.properties || []).map((p) => p.propertyId);
      if (propertyIds.length === 0) return;

      let count = 0;
      const results = await Promise.allSettled(
        propertyIds.map((propertyId) =>
          GraphQLClient.executeAuthenticated<{
            listPropertyBookings: { bookings: Array<{ status: string }>; count: number };
          }>(listPropertyBookings, { propertyId, limit: 20, status: 'PENDING' })
        )
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          count += result.value.listPropertyBookings?.bookings?.length || 0;
        }
      }

      setPendingCount(count);
    } catch {
      // Silent — non-critical
    }
  }, []);

  useEffect(() => {
    fetchPendingCount();
    const interval = setInterval(fetchPendingCount, 15000);
    return () => clearInterval(interval);
  }, [fetchPendingCount]);

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  const NAV_ITEMS = [
    { name: 'Properties', href: '/host', icon: HomeModernIcon, exact: true, badge: 0 },
    { name: 'Bookings', href: '/host/bookings', icon: ClipboardDocumentListIcon, badge: pendingCount },
    { name: 'Calendar', href: '/host/calendar', icon: CalendarDaysIcon, badge: 0 },
    { name: 'Reviews', href: '/host/reviews', icon: StarIcon, badge: 0 },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-56 lg:fixed lg:inset-y-0 lg:top-16 lg:border-r lg:border-ink-100 lg:bg-white lg:z-30">
        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-800'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="flex-1">{item.name}</span>
                {item.badge > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}

          {/* Add property CTA */}
          <div className="pt-4 mt-4 border-t border-ink-100">
            <Link
              href="/become-host"
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              <span>Add Property</span>
            </Link>
          </div>
        </nav>
      </aside>

      {/* Mobile bottom tab bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-ink-100 z-50 safe-area-pb">
        <div className="flex items-stretch">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 text-[10px] font-medium transition-colors touch-manipulation relative',
                  active ? 'text-brand-600' : 'text-ink-400'
                )}
              >
                <div className="relative">
                  <Icon className={cn('h-5 w-5', active && 'text-brand-600')} />
                  {item.badge > 0 && (
                    <span className="absolute -top-1 -right-1.5 min-w-[16px] h-4 px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
