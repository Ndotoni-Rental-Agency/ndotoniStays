'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const IOS_APP_URL = 'https://apps.apple.com/us/app/ndotoni/id6767931205';
const ANDROID_APP_URL = 'https://play.google.com/store/apps/details?id=com.ndotoni.app';
const FALLBACK_URL = 'https://www.ndotonistays.com';

function getRedirectUrl(): string {
  if (typeof window === 'undefined') return FALLBACK_URL;

  const ua = navigator.userAgent.toLowerCase();

  if (/iphone|ipad|ipod/.test(ua)) {
    return IOS_APP_URL;
  }

  if (/android/.test(ua)) {
    return ANDROID_APP_URL;
  }

  // Desktop or unknown — stay on this page
  return '';
}

export default function AppRedirectPage() {
  useEffect(() => {
    const url = getRedirectUrl();
    if (url) {
      window.location.href = url;
    }
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-50/50 to-white px-6">
      <div className="max-w-sm w-full text-center space-y-8 py-16">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="ndotoni"
            width={56}
            height={56}
            className="rounded-xl"
          />
          <h1 className="text-2xl font-bold text-ink-900">ndotoni</h1>
        </div>

        {/* Description */}
        <p className="text-ink-500 text-sm leading-relaxed">
          Book stays, party venues, and event spaces across Tanzania — right from your phone.
        </p>

        {/* Store buttons */}
        <div className="space-y-3">
          {/* iOS */}
          <a
            href={IOS_APP_URL}
            className="flex items-center gap-3 w-full px-5 py-3.5 border border-ink-200 rounded-xl bg-white hover:border-brand-500 hover:shadow-sm transition-all"
          >
            <svg className="w-8 h-8 text-ink-800 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] text-ink-400 uppercase tracking-wide">Download on the</div>
              <div className="text-base font-semibold text-ink-900">App Store</div>
            </div>
          </a>

          {/* Android */}
          <a
            href={ANDROID_APP_URL}
            className="flex items-center gap-3 w-full px-5 py-3.5 border border-ink-200 rounded-xl bg-white hover:border-brand-500 hover:shadow-sm transition-all"
          >
            <svg className="w-8 h-8 text-ink-800 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.523 2.246l1.392-.812a.5.5 0 00-.504-.864l-1.538.898A5.63 5.63 0 0012 .5a5.63 5.63 0 00-4.873.968L5.59.57a.5.5 0 10-.504.864l1.392.812C4.93 3.54 4 5.6 4 7.876V8.5h16v-.624c0-2.276-.93-4.336-2.477-5.254zM8.5 6a.75.75 0 110-1.5.75.75 0 010 1.5zm7 0a.75.75 0 110-1.5.75.75 0 010 1.5zM4 9.5v8a2.5 2.5 0 002.5 2.5h1v2.5a1.5 1.5 0 003 0V20h3v2.5a1.5 1.5 0 003 0V20h1a2.5 2.5 0 002.5-2.5v-8H4zm-2.5 0a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 003 0v-5a1.5 1.5 0 00-1.5-1.5zm21 0a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 003 0v-5a1.5 1.5 0 00-1.5-1.5z" />
            </svg>
            <div className="text-left">
              <div className="text-[10px] text-ink-400 uppercase tracking-wide">Get it on</div>
              <div className="text-base font-semibold text-ink-900">Google Play</div>
            </div>
          </a>
        </div>

        {/* Web fallback */}
        <Link
          href={FALLBACK_URL}
          className="inline-block text-sm text-brand-600 font-medium hover:text-brand-700 transition"
        >
          Continue on the web &rarr;
        </Link>
      </div>
    </div>
  );
}
