'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import { MessageCircle } from 'lucide-react';

interface ChatHeaderProps {
  conversationCount: number;
}

export function ChatHeader({ conversationCount }: ChatHeaderProps) {
  const { t } = useLanguage();

  return (
    <header className="fixed top-0 left-0 right-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-stone-200 dark:border-gray-800">
      <div className="h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-3">
          <Link href="/" className="text-xl font-bold text-brand-600 dark:text-brand-400">
            ndotoni stays
          </Link>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('messages.title') || 'Messages'}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {conversationCount} {conversationCount !== 1 ? 'conversations' : 'conversation'}
            </p>
          </div>
          <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center">
            <MessageCircle className="w-5 h-5 text-brand-600 dark:text-brand-400" strokeWidth={1.75} />
          </div>
        </div>
      </div>
    </header>
  );
}
