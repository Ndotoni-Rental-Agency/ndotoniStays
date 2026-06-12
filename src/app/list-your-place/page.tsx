'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal';

/**
 * /list-your-place — entry point for hosts.
 * If authenticated, redirect to /host/create.
 * If not, show the auth modal; after sign-in, redirect to /host/create.
 */
export default function ListYourPlacePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      router.replace('/host/create');
    } else {
      setShowAuthModal(true);
    }
  }, [isLoading, isAuthenticated, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      {isAuthenticated ? (
        <div className="animate-pulse text-ink-400">Redirecting...</div>
      ) : (
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ink-900 mb-2">List your property</h1>
          <p className="text-ink-500 mb-4">Sign in to start listing your space on Ndotoni Stays</p>
          <button
            onClick={() => setShowAuthModal(true)}
            className="btn-primary"
          >
            Sign In to Continue
          </button>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => {
          setShowAuthModal(false);
          // After modal closes, if now authenticated → redirect to create
          // The useEffect above will handle this via isAuthenticated change
        }}
      />
    </div>
  );
}
