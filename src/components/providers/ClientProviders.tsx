'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ChatProvider } from '@/contexts/ChatContext';

// Ensure Amplify is configured
import '@/lib/amplify';

export function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ChatProvider>{children}</ChatProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
