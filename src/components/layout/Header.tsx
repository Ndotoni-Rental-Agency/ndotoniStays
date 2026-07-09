'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const { t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-ink-100">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
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
              <span className="text-lg font-bold text-ink-900">
                Stays
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-5">
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

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-ink-600 hover:bg-ink-50"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-ink-100">
              <div className="flex flex-col gap-2">
                {isAuthenticated && (user?.userType === 'LANDLORD' || user?.hasProperties) ? (
                  <Link
                    href="/host"
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.myProperties')}
                  </Link>
                ) : (
                  <Link
                    href="/become-host"
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t('nav.becomeHost')}
                  </Link>
                )}

                <div className="px-3 py-2.5">
                  <LanguageToggle />
                </div>

                {isAuthenticated ? (
                  <>
                    <Link
                      href="/profile"
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.profile')}
                    </Link>
                    <Link
                      href="/bookings"
                      className="px-3 py-2.5 rounded-lg text-sm font-medium text-ink-700 hover:bg-ink-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t('nav.myBookings')}
                    </Link>
                    <button
                      onClick={() => { signOut(); setMobileMenuOpen(false); }}
                      className="text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
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
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
