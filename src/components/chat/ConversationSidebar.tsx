'use client';

import React, { useState } from 'react';
import { ConversationList } from '@/components/chat/ConversationList';
import { Conversation as APIConversation } from '@/API';
import { useConversationSearch } from '@/hooks/useConversationSearch';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { NewConversationModal } from './NewConversationModal';
import { Plus } from 'lucide-react';

interface ConversationSidebarProps {
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => Promise<void>;
  onDirectChatCreated?: (conversationId: string, otherPartyName: string) => void;
  currentUserId: string;
  showConversationList: boolean;
}

export function ConversationSidebar({
  onSelectConversation,
  onDeleteConversation,
  onDirectChatCreated,
  currentUserId,
  showConversationList,
}: ConversationSidebarProps) {
  const { conversations, selectedConversation, loadConversations } = useChat();
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);

  const { filteredConversations, isSearching } = useConversationSearch({
    conversations,
    searchQuery,
    currentUserId,
  });

  const handleDirectChatCreated = async (conversationId: string, otherPartyName: string) => {
    await loadConversations();
    if (onDirectChatCreated) {
      onDirectChatCreated(conversationId, otherPartyName);
    } else {
      onSelectConversation(conversationId);
    }
  };

  return (
    <div className={`w-full md:w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-full ${
      showConversationList ? 'block' : 'hidden md:flex'
    }`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('messages.searchConversations') || 'Search conversations...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 dark:bg-gray-700/50 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg border border-gray-200 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all duration-200"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              {isSearching ? (
                <div className="w-4 h-4 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
              ) : (
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={() => setShowNewConversation(true)}
            className="flex-shrink-0 p-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white transition shadow-sm"
            title="New conversation"
            aria-label="Start new conversation"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {searchQuery && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {filteredConversations.length} of {conversations.length} conversations
          </p>
        )}
      </div>

      <div className="flex-1 overflow-hidden">
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversation?.id}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          currentUserId={currentUserId}
        />
      </div>

      <NewConversationModal
        isOpen={showNewConversation}
        onClose={() => setShowNewConversation(false)}
        onConversationCreated={handleDirectChatCreated}
      />
    </div>
  );
}
