'use client';

import { usePathname } from 'next/navigation';
import { Footer } from './Footer';

const HIDE_FOOTER_ROUTES = ['/host'];

export function ConditionalFooter() {
  const pathname = usePathname();
  const shouldHide = HIDE_FOOTER_ROUTES.some((route) => pathname.startsWith(route));

  if (shouldHide) return null;
  return <Footer />;
}
