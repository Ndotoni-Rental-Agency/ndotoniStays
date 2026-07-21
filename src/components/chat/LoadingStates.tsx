'use client';

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle } from 'lucide-react';

interface LoadingSpinnerProps {
  message: string;
}

export function LoadingSpinner({ message }: LoadingSpinnerProps) {
  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-brand-100 border-t-brand-500 dark:border-brand-900/30 dark:border-t-brand-400 mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

interface UnauthenticatedStateProps {
  onSignIn: () => void;
}

export function UnauthenticatedState({ onSignIn }: UnauthenticatedStateProps) {
  const { t } = useLanguage();

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MessageCircle className="w-10 h-10 text-brand-500 dark:text-brand-400" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {t('messages.signInRequired') || 'Sign in to view messages'}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          {t('messages.signInDescription') || 'You need to be signed in to access your messages.'}
        </p>
        <button
          onClick={onSignIn}
          className="px-8 py-3 rounded-full text-base bg-brand-500 hover:bg-brand-600 text-white font-medium transition-colors"
        >
          {t('nav.signIn') || 'Sign In'}
        </button>
      </div>
    </div>
  );
}
