'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';

// Ensure Amplify is configured
import '@/lib/amplify';

export function ClientProviders({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
