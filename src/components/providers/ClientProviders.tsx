'use client';

import { ReferralPrompt } from '@/components/refer/ReferralPrompt';
import { ReactNode, Suspense } from 'react';
import { ReferralCapture } from '@/components/refer/ReferralCapture';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatProvider } from '@/contexts/ChatContext';

// Ensure Amplify is configured
import '@/lib/amplify';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ChatProvider>{children}<ReferralPrompt /><Suspense fallback={null}><ReferralCapture /></Suspense></ChatProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
