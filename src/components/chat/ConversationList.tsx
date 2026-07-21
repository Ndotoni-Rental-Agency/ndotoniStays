'use client';

import React from 'react';
import { Conversation } from '@/API';
import { SwipeableConversationItem } from './SwipeableConversationItem';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  currentUserId: string;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
  currentUserId,
}) => {
  const { t } = useLanguage();

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('messages.noConversationsYet') || 'No conversations yet'}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
          {t('messages.startConversationHint') || 'Start a conversation by contacting a property host'}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto h-full py-2">
      {conversations.map((conversation) => (
        <SwipeableConversationItem
          key={conversation.id}
          conversation={conversation}
          isSelected={conversation.id === selectedConversationId}
          currentUserId={currentUserId}
          onSelect={onSelectConversation}
          onDelete={onDeleteConversation}
        />
      ))}
    </div>
  );
};

export default ConversationList;
