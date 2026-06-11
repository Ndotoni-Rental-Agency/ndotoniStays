'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  HomeModernIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  StarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

const NAV_ITEMS = [
  { name: 'Properties', href: '/host', icon: HomeModernIcon, exact: true },
  { name: 'Bookings', href: '/host/bookings', icon: ClipboardDocumentListIcon },
  { name: 'Calendar', href: '/host/calendar', icon: CalendarDaysIcon },
  { name: 'Reviews', href: '/host/reviews', icon: StarIcon },
];

export function HostSidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact = false) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

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
                <span>{item.name}</span>
              </Link>
            );
          })}

          {/* Add property CTA */}
          <div className="pt-4 mt-4 border-t border-ink-100">
            <Link
              href="/host/create"
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
                  'flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 text-[10px] font-medium transition-colors touch-manipulation',
                  active ? 'text-brand-600' : 'text-ink-400'
                )}
              >
                <Icon className={cn('h-5 w-5', active && 'text-brand-600')} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
