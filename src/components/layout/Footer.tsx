'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/contexts/LanguageContext';

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="bg-white border-t border-ink-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/images/logo.png"
                alt="ndotoni"
                width={32}
                height={32}
                className="object-contain"
              />
              <span className="text-lg font-bold text-ink-900">
                Stays
              </span>
            </div>
            <p className="text-ink-500 text-sm max-w-md">
              {t('footer.description')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm text-ink-900 mb-3">{t('footer.explore')}</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li>
                <Link href="/search" className="hover:text-ink-900 transition-colors">
                  {t('footer.searchPlaces')}
                </Link>
              </li>
              <li>
                <Link href="/become-host" className="hover:text-ink-900 transition-colors">
                  {t('footer.becomeHost')}
                </Link>
              </li>
              <li>
                <Link href="/invest" className="hover:text-ink-900 transition-colors">
                  {t('footer.invest')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-ink-900 transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-sm text-ink-900 mb-3">{t('footer.support')}</h4>
            <ul className="space-y-2 text-sm text-ink-500">
              <li>
                <a
                  href="https://wa.me/255790720329"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink-900 transition-colors"
                >
                  {t('footer.whatsapp')}
                </a>
              </li>
              <li>
                <a href="mailto:info@ndotoni.com" className="hover:text-ink-900 transition-colors">
                  info@ndotoni.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-ink-100 text-center text-sm text-ink-400">
          {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
        </div>
      </div>
    </footer>
  );
}
