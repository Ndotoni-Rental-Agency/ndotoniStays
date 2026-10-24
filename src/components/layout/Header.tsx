'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { unreadCount } = useChat();
  const { t, language } = useLanguage();
  const sw = language === 'sw';
  const pathname = usePathname();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const outside = (event: PointerEvent) => {
      if (!mobileMenuRef.current?.contains(event.target as Node)) setMobileMenuOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMobileMenuOpen(false); mobileButtonRef.current?.focus(); }
    };
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', escape); };
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ink-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 sm:h-20 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5">
              <Image
                src="/images/logo.png"
                alt="ndotoni"
                width={36}
                height={36}
                priority
                className="object-contain"
              />
              <span className="text-lg font-bold text-ink-900 leading-none">
                <span className="text-brand-600">ndotoni</span> Stays
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-5">
              <Link href="/search" className="inline-flex min-h-11 items-center text-sm font-semibold text-brand-900">{t('hero.search.button')}</Link>
              <LanguageToggle />

              {isAuthenticated && (user?.userType === 'LANDLORD' || user?.hasProperties) ? (
                <Link
                  href="/host"
                  className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
                >
                  {t('nav.myProperties')}
                </Link>
              ) : (
                <Link
                  href="/become-host"
                  className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors"
                >
                  {t('nav.becomeHost')}
                </Link>
              )}

              {isAuthenticated ? (
                <div className="relative">
                  <Link
                    href="/chat"
                    className="relative p-2 text-ink-600 hover:text-ink-900 transition-colors"
                    title={t('nav.messages') || 'Messages'}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </Link>
                </div>
              ) : null}

              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 rounded-full border border-ink-200 py-1.5 pl-3 pr-1.5 hover:shadow-md transition-shadow"
                  >
                    <Bars3Icon className="h-4 w-4 text-ink-600" />
                    <div className="h-8 w-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user?.firstName?.charAt(0) || 'U'}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-ink-100 py-2 z-50">
                        <div className="px-4 py-2 border-b border-ink-100">
                          <p className="text-sm font-medium text-ink-900 truncate">{user?.firstName} {user?.lastName}</p>
                          <p className="text-xs text-ink-500 truncate">{user?.email}</p>
                        </div>
                        <Link href="/profile" className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setUserMenuOpen(false)}>
                          {t('nav.profile')}
                        </Link>
                        <Link href="/chat" className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setUserMenuOpen(false)}>
                          {t('nav.messages') || 'Messages'}
                          {unreadCount > 0 && (
                            <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                          )}
                        </Link>
                        <Link href="/bookings" className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setUserMenuOpen(false)}>
                          {t('nav.myBookings')}
                        </Link>
                        {(user?.userType === 'LANDLORD' || user?.hasProperties) && (
                          <Link href="/host/bookings" className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setUserMenuOpen(false)}>
                            {t('nav.hostBookings')}
                          </Link>
                        )}
                        <Link href="/host" className="block px-4 py-2 text-sm text-ink-700 hover:bg-ink-50" onClick={() => setUserMenuOpen(false)}>
                          {t('nav.myProperties')}
                        </Link>
                        <button
                          onClick={() => { signOut(); setUserMenuOpen(false); }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          {t('nav.signOut')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-ink-200 py-1.5 pl-3 pr-1.5 hover:shadow-md transition-shadow"
                >
                  <Bars3Icon className="h-4 w-4 text-ink-600" />
                  <UserCircleIcon className="h-8 w-8 text-ink-400" />
                </button>
              )}
            </div>

            <div ref={mobileMenuRef} className="relative md:hidden" onBlur={event => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setMobileMenuOpen(false);
            }}>
              <button ref={mobileButtonRef} type="button" className="relative flex h-11 w-12 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={sw ? 'Menyu na akaunti' : 'Menu and account'} aria-expanded={mobileMenuOpen} aria-controls="stays-mobile-menu">
                {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
                {unreadCount > 0 && <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-600" />}
              </button>
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div id="stays-mobile-menu" className="absolute right-0 top-full z-50 mt-3 max-h-[calc(100dvh-6rem)] w-72 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-2xl border border-ink-200 bg-white p-2 shadow-xl">
              <Link href="/search" aria-current={pathname === '/search' ? 'page' : undefined} onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-semibold text-brand-800 hover:bg-brand-50">{sw ? 'Tafuta malazi' : 'Find a stay'}</Link>
              <div className="flex flex-col gap-0.5">
                {isAuthenticated && (user?.userType === 'LANDLORD' || user?.hasProperties) ? (
                  <Link
                    href="/host"
                    className="min-h-11 px-4 py-3 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myProperties')}
                  </Link>
                ) : (
                  <Link
                    href="/become-host"
                    className="min-h-11 px-4 py-3 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.becomeHost')}
                  </Link>
                )}



                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="min-h-11 px-4 py-3 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      href="/chat"
                      className="min-h-11 px-4 py-3 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 flex items-center"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.messages') || 'Messages'}
                      {unreadCount > 0 && (
                        <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-brand-500 rounded-full">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </Link>
                    <Link
                      href="/bookings"
                      className="min-h-11 px-4 py-3 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.myBookings')}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="text-left min-h-11 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50"
                    >
                      {t('nav.signOut')} ({user?.firstName})
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false); }}
                    className="btn-primary text-center mt-2"
                  >
                    {t('nav.signIn')}
                  </button>
                )}
                <div className="my-2 border-t border-ink-100" />
                {[{ href: '/refer', label: sw ? 'Pata pesa kwa kututambulisha' : 'Refer & earn' }, { href: '/about', label: sw ? 'Kuhusu sisi' : 'About us' }, { href: '/invest', label: sw ? 'Wekeza' : 'Invest' }].map(item => <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} className="flex min-h-11 items-center rounded-xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-ink-50">{item.label}</Link>)}
                <div className="my-2 border-t border-ink-100" />
                <div className="flex min-h-11 items-center px-2"><LanguageToggle /></div>
              </div>
            </div>
          )}
            </div>
          </div>


        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
