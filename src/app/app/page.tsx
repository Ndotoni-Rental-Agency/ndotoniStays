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
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-brand-50 via-brand-50/40 to-white px-6 py-12">
      <div className="max-w-sm w-full">
        <div className="animate-fade-in-up rounded-3xl bg-white/80 backdrop-blur-sm border border-ink-100 shadow-xl shadow-ink-900/5 px-8 py-10 text-center">
          {/* Logo */}
          <Link href={FALLBACK_URL} className="flex flex-col items-center gap-3 group">
            <span className="rounded-2xl ring-1 ring-ink-100 shadow-sm overflow-hidden transition-transform group-hover:scale-105">
              <Image
                src="/images/logo.png"
                alt="ndotoni"
                width={64}
                height={64}
              />
            </span>
            <h1 className="text-2xl font-bold text-ink-900 tracking-tight">ndotoni</h1>
          </Link>

          {/* Description */}
          <p className="mt-3 text-ink-500 text-sm leading-relaxed">
            Book stays, party venues, and event spaces across Tanzania — right from your phone.
          </p>

          {/* Store buttons */}
          <div className="mt-8 space-y-3">
            {/* iOS */}
            <a
              href={IOS_APP_URL}
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-ink-200 bg-white text-ink-900 shadow-sm transition-all hover:border-brand-400 hover:shadow-md active:scale-[0.98]"
            >
              <svg className="w-7 h-7 text-ink-800 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-ink-400 uppercase tracking-wide leading-none">Download on the</div>
                <div className="text-base font-semibold leading-tight mt-0.5">App Store</div>
              </div>
            </a>

            {/* Android */}
            <a
              href={ANDROID_APP_URL}
              className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl border border-ink-200 bg-white text-ink-900 shadow-sm transition-all hover:border-brand-400 hover:shadow-md active:scale-[0.98]"
            >
              <svg className="w-7 h-7 text-brand-600 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.523 2.246l1.392-.812a.5.5 0 00-.504-.864l-1.538.898A5.63 5.63 0 0012 .5a5.63 5.63 0 00-4.873.968L5.59.57a.5.5 0 10-.504.864l1.392.812C4.93 3.54 4 5.6 4 7.876V8.5h16v-.624c0-2.276-.93-4.336-2.477-5.254zM8.5 6a.75.75 0 110-1.5.75.75 0 010 1.5zm7 0a.75.75 0 110-1.5.75.75 0 010 1.5zM4 9.5v8a2.5 2.5 0 002.5 2.5h1v2.5a1.5 1.5 0 003 0V20h3v2.5a1.5 1.5 0 003 0V20h1a2.5 2.5 0 002.5-2.5v-8H4zm-2.5 0a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 003 0v-5a1.5 1.5 0 00-1.5-1.5zm21 0a1.5 1.5 0 00-1.5 1.5v5a1.5 1.5 0 003 0v-5a1.5 1.5 0 00-1.5-1.5z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] text-ink-400 uppercase tracking-wide leading-none">Get it on</div>
                <div className="text-base font-semibold leading-tight mt-0.5">Google Play</div>
              </div>
            </a>
          </div>

          {/* Web fallback */}
          <Link
            href={FALLBACK_URL}
            className="mt-6 inline-block text-sm text-brand-600 font-medium hover:text-brand-700 transition"
          >
            Continue on the web &rarr;
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-ink-400">
          &copy; {new Date().getFullYear()} ndotoni Stays
        </p>
      </div>
    </div>
  );
}
