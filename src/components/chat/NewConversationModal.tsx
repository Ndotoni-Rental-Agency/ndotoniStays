'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { X, Search, MessageCircle, User } from 'lucide-react';
import { GraphQLClient } from '@/lib/graphql-client';
import { searchChatUsers } from '@/graphql/queries';
import { initializeDirectChat } from '@/graphql/mutations';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatUser {
  userId: string;
  firstName: string;
  lastName: string;
  businessName?: string | null;
  profileImage?: string | null;
  userType: string;
}

interface NewConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConversationCreated: (conversationId: string, otherPartyName: string) => void;
}

export function NewConversationModal({
  isOpen,
  onClose,
  onConversationCreated,
}: NewConversationModalProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatUser[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isInitializing, setIsInitializing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (!isOpen) {
      setQuery('');
      setResults([]);
      setError(null);
    }
  }, [isOpen]);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const variables: any = { query: searchQuery.trim(), limit: 10, source: 'ndotonistays' };
      const data = await GraphQLClient.executeAuthenticated<{ searchChatUsers: ChatUser[] }>(
        searchChatUsers,
        variables
      );
      setResults(data.searchChatUsers || []);
    } catch (err) {
      console.error('Error searching chat users:', err);
      setError('Failed to search users. Please try again.');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 300);
  };

  const handleSelectUser = async (user: ChatUser) => {
    setIsInitializing(user.userId);
    setError(null);

    try {
      const data = await GraphQLClient.executeAuthenticated<{
        initializeDirectChat: { conversationId: string; targetUserInfo: ChatUser };
      }>(initializeDirectChat, { targetUserId: user.userId });

      const { conversationId, targetUserInfo } = data.initializeDirectChat;
      const displayName = targetUserInfo.businessName ||
        `${targetUserInfo.firstName} ${targetUserInfo.lastName}`.trim();

      onConversationCreated(conversationId, displayName);
      onClose();
    } catch (err: any) {
      console.error('Error initializing direct chat:', err);
      setError(err?.message || 'Failed to start conversation. Please try again.');
    } finally {
      setIsInitializing(null);
    }
  };

  const getUserDisplayName = (user: ChatUser): string => {
    if (user.businessName) return user.businessName;
    return `${user.firstName} ${user.lastName}`.trim() || 'Unknown User';
  };

  const getUserTypeLabel = (userType: string): string => {
    switch (userType) {
      case 'LANDLORD': return 'Host';
      case 'ADMIN': return 'Admin';
      default: return userType;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('messages.newConversation') || 'New Conversation'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search by name or business..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition"
            />
          </div>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
        </div>

        <div className="max-h-72 overflow-y-auto px-4 pb-4">
          {isSearching && (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {!isSearching && query.length >= 2 && results.length === 0 && (
            <div className="text-center py-8">
              <User className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">No users found matching &quot;{query}&quot;</p>
            </div>
          )}

          {!isSearching && query.length < 2 && (
            <div className="text-center py-8">
              <MessageCircle className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">Search for a host to start a conversation</p>
            </div>
          )}

          {results.map((user) => (
            <button
              key={user.userId}
              onClick={() => handleSelectUser(user)}
              disabled={isInitializing !== null}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex-shrink-0">
                {user.profileImage ? (
                  <img src={user.profileImage} alt={getUserDisplayName(user)} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
                    <span className="text-sm font-medium text-brand-600 dark:text-brand-400">
                      {(user.firstName || '?')[0]}{(user.lastName || '?')[0]}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getUserDisplayName(user)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{getUserTypeLabel(user.userType)}</p>
              </div>
              {isInitializing === user.userId ? (
                <div className="w-5 h-5 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin" />
              ) : (
                <MessageCircle className="w-4 h-4 text-gray-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
