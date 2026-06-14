'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { HostSidebar } from '@/components/host/HostSidebar';

export default function HostLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [showAuthModal, setShowAuthModal] = useState(false);

  // /host/create is allowed without auth — it just redirects to /list-your-place
  const isCreatePage = pathname === '/host/create';

  useEffect(() => {
    if (!isLoading && !isAuthenticated && !isCreatePage) {
      if (typeof window !== 'undefined') {
        localStorage.setItem('ndotoni_booking_redirect', window.location.href);
      }
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated, isCreatePage]);

  // Let the create page pass through without auth — it redirects itself
  if (isCreatePage) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-ink-400">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-ink-500 mb-4">Sign in to access your host dashboard</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="bg-white">
      <HostSidebar />

      {/* Main content */}
      <main className="lg:pl-56 pb-20 lg:pb-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
