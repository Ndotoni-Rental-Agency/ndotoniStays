import type { Metadata, Viewport } from 'next';
import { DM_Sans } from 'next/font/google';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { ConditionalHeader } from '@/components/layout/ConditionalHeader';
import { ConditionalFooter } from '@/components/layout/ConditionalFooter';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import WhatsAppFAB from '@/components/ui/WhatsAppFAB';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.ndotonistays.com'),
  title: 'ndotoni Stays – Short-Term Rentals in Tanzania',
  description:
    'Book nightly stays, party venues, photoshoot locations, and event spaces across Tanzania. Instant booking, flexible cancellation.',
  keywords: [
    'short-term rentals Tanzania',
    'nightly stays Dar es Salaam',
    'party venue Tanzania',
    'photoshoot location',
    'event space booking',
    'Airbnb Tanzania',
    'vacation rental',
    'daily rental',
  ],
  itunes: {
    appId: '6767931205',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: ['/favicon.ico'],
  },
  openGraph: {
    title: 'ndotoni Stays – Short-Term Rentals in Tanzania',
    description:
      'Book places to stay, celebrate, and create. Nightly stays, party venues, and more.',
    siteName: 'ndotoni Stays',
    type: 'website',
  },
  appLinks: {
    ios: {
      url: 'https://www.ndotonistays.com',
      app_store_id: '6767931205',
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  // Tells supporting mobile browsers to shrink the actual layout viewport when
  // the on-screen keyboard opens (rather than just the visual viewport), so a
  // 100dvh container — like the chat page — correctly resizes and its bottom
  // content stays flush with the keyboard instead of leaving a gap.
  interactiveWidget: 'resizes-content',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSans.variable} font-sans bg-white text-ink-900`}
        suppressHydrationWarning
      >
        <ClientProviders>
          <ConditionalHeader />
          <main className="min-h-screen">{children}</main>
          <ConditionalFooter />
          <WhatsAppFAB />
        </ClientProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
