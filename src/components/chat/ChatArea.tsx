'use client';

import React, { useRef, useEffect, useState } from 'react';
import { MessageBubble, ChatInput } from '@/components/chat';
import { Conversation as APIConversation, ChatMessage } from '@/API';
import { UserProfile as User } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';

interface Conversation extends APIConversation {
  isTemporary?: boolean;
  landlordInfo?: { firstName: string; lastName: string };
}

interface ChatAreaProps {
  messages: ChatMessage[];
  loadingMessages: boolean;
  sendingMessage: boolean;
  currentUserId: string;
  currentUser: User | null;
  showConversationList: boolean;
  onBackToConversations: () => void;
  onSendMessage: (content: string) => Promise<void>;
  onDeleteMessage?: (messageId: string) => void;
  getSuggestedMessage: () => string;
  landlordName?: string;
}

export function ChatArea({
  messages,
  loadingMessages,
  sendingMessage,
  currentUser,
  showConversationList,
  onBackToConversations,
  onSendMessage,
  onDeleteMessage,
  getSuggestedMessage,
  landlordName,
}: ChatAreaProps) {
  const { selectedConversation } = useChat();
  const { t } = useLanguage();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set());

  const handleMessageSelect = (messageId: string) => {
    setSelectedMessages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) newSet.delete(messageId);
      else newSet.add(messageId);
      return newSet;
    });
  };

  const handleLongPress = (messageId: string) => {
    setSelectionMode(true);
    setSelectedMessages(new Set([messageId]));
  };

  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedMessages(new Set());
  };

  const handleDeleteSelected = async () => {
    if (!onDeleteMessage || selectedMessages.size === 0) return;
    const confirmed = window.confirm(
      selectedMessages.size === 1 ? 'Delete this message?' : `Delete ${selectedMessages.size} messages?`
    );
    if (confirmed) {
      const messageIds = Array.from(selectedMessages);
      for (const messageId of messageIds) {
        await onDeleteMessage(messageId);
      }
      exitSelectionMode();
    }
  };

  const getOtherPartyDisplayName = () => {
    if (landlordName) return landlordName;
    const extendedConversation = selectedConversation as Conversation;
    if (extendedConversation?.isTemporary && extendedConversation?.landlordInfo) {
      const { firstName, lastName } = extendedConversation.landlordInfo;
      return `${firstName} ${lastName}`.trim();
    }
    return selectedConversation?.otherPartyName || 'User';
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    exitSelectionMode();
  }, [selectedConversation?.id]);

  if (!selectedConversation) {
    return (
      <div className="hidden md:flex items-center justify-center h-full w-full text-center bg-gray-50 dark:bg-gray-800">
        <div className="max-w-md">
          <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-500 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {t('messages.welcomeToChat') || 'Welcome to Messages'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t('messages.selectDescription') || 'Select a conversation to start messaging'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-800 h-full min-h-0 ${
      !showConversationList ? 'block' : 'hidden md:flex'
    }`}>
      {/* Chat Header */}
      <div className="sticky top-0 z-10 flex-shrink-0 px-4 sm:px-6 py-3 border-b border-stone-200 dark:border-gray-700 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg">
        {selectionMode ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button onClick={exitSelectionMode} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">{selectedMessages.size} selected</span>
            </div>
            <button onClick={handleDeleteSelected} disabled={selectedMessages.size === 0} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <button onClick={onBackToConversations} className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">{getOtherPartyDisplayName()}</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate flex items-center space-x-1">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{selectedConversation.propertyTitle}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4 bg-white dark:bg-gray-800" style={{ minHeight: 0 }}>
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-gray-300 border-t-brand-500 rounded-full animate-spin"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">{t('messages.loadingMessages') || 'Loading messages...'}</span>
            </div>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwnMessage={message.isMine}
              senderName={message.senderName}
              onDelete={onDeleteMessage}
              selectionMode={selectionMode}
              isSelected={selectedMessages.has(message.id)}
              onSelect={() => handleMessageSelect(message.id)}
              onLongPress={() => handleLongPress(message.id)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-full text-center px-4">
            <div className="max-w-sm mx-auto">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{t('messages.startConversation') || 'Start a conversation'}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Send a message about <span className="font-medium text-brand-600 dark:text-brand-400">{selectedConversation.propertyTitle}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="sticky bottom-0 z-10 bg-white dark:bg-gray-800">
        <ChatInput
          onSendMessage={onSendMessage}
          placeholder={t('messages.typeYourMessage') || 'Type your message...'}
          initialMessage={getSuggestedMessage()}
          disabled={sendingMessage}
          isEmpty={messages.length === 0}
          messageCount={messages.length}
          sendingMessage={sendingMessage}
        />
      </div>
    </div>
  );
}
