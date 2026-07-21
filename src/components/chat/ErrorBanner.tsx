'use client';

import React from 'react';

interface ErrorBannerProps {
  error: string;
  onRetry?: () => void;
  onDismiss: () => void;
  retryDisabled?: boolean;
}

export function ErrorBanner({ error, onRetry, onDismiss, retryDisabled = false }: ErrorBannerProps) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
        <div className="ml-4 flex-shrink-0 flex space-x-2">
          {onRetry && (
            <button
              onClick={onRetry}
              disabled={retryDisabled}
              className={`text-sm font-medium ${
                retryDisabled
                  ? 'text-red-400 dark:text-red-500 cursor-not-allowed'
                  : 'text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200'
              }`}
            >
              {retryDisabled ? 'Please wait...' : 'Retry'}
            </button>
          )}
          <button
            onClick={onDismiss}
            className="text-sm text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
