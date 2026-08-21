'use client';

import { usePathname } from 'next/navigation';
import { Header } from './Header';

const HIDE_HEADER_ROUTES = ['/verify-email', '/reset-password', '/chat', '/app'];

export function ConditionalHeader() {
  const pathname = usePathname();
  const shouldHide = HIDE_HEADER_ROUTES.some((route) => pathname.startsWith(route));

  if (shouldHide) return null;
  return <Header />;
}
