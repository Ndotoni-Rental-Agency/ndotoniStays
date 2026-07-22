'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/contexts/ChatContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Conversation as APIConversation } from '@/API';

interface Conversation extends APIConversation {
  isTemporary?: boolean;
  propertyId?: string;
  landlordInfo?: { firstName: string; lastName: string };
}

import { useChatLayout } from '@/hooks/useChatLayout';
import { useChatDeletion } from '@/hooks/useChatDeletion';

import { ChatHeader } from '@/components/chat/ChatHeader';
import { ConversationSidebar } from '@/components/chat/ConversationSidebar';
import { ChatArea } from '@/components/chat/ChatArea';
import { LoadingSpinner, UnauthenticatedState } from '@/components/chat/LoadingStates';
import { AuthModal } from '@/components/auth/AuthModal';

function ChatPageContent() {
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { t } = useLanguage();
  const {
    conversations,
    messages,
    selectedConversation,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    loadConversations,
    loadMessages,
    sendMessage,
    initializeChat,
    markConversationAsRead,
    subscribeToConversation,
    clearMessages,
    selectConversation,
    selectTemporaryConversation,
  } = useChat();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);
  const [suggestedMessageShown, setSuggestedMessageShown] = useState(false);

  const {
    showConversationList,
    handleSelectConversation: handleLayoutConversationSelect,
    handleBackToConversations,
  } = useChatLayout();

  const { deleteConversation, deleteMessage } = useChatDeletion();

  const getSuggestedMessage = () => {
    const propertyId = searchParams.get('propertyId');
    const propertyTitle = searchParams.get('propertyTitle');
    const newPropertyInquiry = searchParams.get('newPropertyInquiry');

    if (newPropertyInquiry === 'true' && propertyId && propertyTitle && messages.length === 0 && !suggestedMessageShown) {
      if (typeof window !== 'undefined') {
        const propertyUrl = `${window.location.origin}/property/${propertyId}`;
        return `Hi! I'm interested in your property: ${propertyTitle}\n\nProperty link: ${propertyUrl}`;
      }
    }
    return '';
  };

  const clearSuggestedMessage = () => {
    setSuggestedMessageShown(true);
  };

  const handleDeleteConversation = async (conversationId: string) => {
    const success = await deleteConversation(conversationId);
    if (success) {
      if (selectedConversation?.id === conversationId) {
        selectConversation(null);
        clearMessages();
        handleBackToConversations();
      }
      await loadConversations();
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    const success = await deleteMessage(messageId);
    if (success && selectedConversation) {
      await loadMessages(selectedConversation.id);
    }
  };

  const handleSelectTemporaryConversation = (tempConversation: Conversation) => {
    handleLayoutConversationSelect();
    selectTemporaryConversation(tempConversation);
    clearMessages();
  };

  const handleSelectConversation = async (conversationId: string, landlordName?: string) => {
    if (!user?.email) return;

    handleLayoutConversationSelect();
    selectConversation(conversationId);
    clearMessages();

    await loadMessages(conversationId);
    subscribeToConversation(conversationId);

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation && conversation.unreadCount > 0) {
      try {
        await markConversationAsRead(conversationId);
      } catch (error) {
        console.error('Error marking as read:', error);
      }
    }
  };

  const handleBackToConversationsWithCleanup = () => {
    handleBackToConversations();
    selectConversation(null);
    clearMessages();
    setSuggestedMessageShown(false);
  };

  const handleSendMessage = async (content: string) => {
    if (!selectedConversation || !user?.email) return;

    try {
      const extendedConversation = selectedConversation as Conversation;
      if (extendedConversation.isTemporary) {
        if (!extendedConversation.propertyId) {
          throw new Error('Property ID is missing for temporary conversation');
        }

        const chatData = await initializeChat(extendedConversation.propertyId);

        const realConversation: Conversation = {
          __typename: 'Conversation',
          id: chatData.conversationId,
          propertyId: extendedConversation.propertyId,
          propertyTitle: chatData.propertyTitle,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          otherPartyName: chatData.landlordName,
          otherPartyImage: null,
        };

        selectTemporaryConversation({
          ...realConversation,
          isTemporary: false,
          landlordInfo: {
            firstName: chatData.landlordName.split(' ')[0] || '',
            lastName: chatData.landlordName.split(' ').slice(1).join(' ') || '',
          },
        });

        await sendMessage(chatData.conversationId, content);
        clearSuggestedMessage();
      } else {
        await sendMessage(selectedConversation.id, content);
        clearSuggestedMessage();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  // Process URL parameters
  useEffect(() => {
    if (!urlParamsProcessed && isAuthenticated && !loadingConversations && conversations.length >= 0) {
      const conversationId = searchParams.get('conversationId');
      const propertyId = searchParams.get('propertyId');
      const propertyTitle = searchParams.get('propertyTitle');
      const landlordName = searchParams.get('landlordName');
      const newPropertyInquiry = searchParams.get('newPropertyInquiry');

      if (conversationId) {
        if (newPropertyInquiry !== 'true') clearSuggestedMessage();
        handleSelectConversation(conversationId, landlordName || undefined);
      } else if (propertyId && propertyTitle && landlordName) {
        const tempConversation: Conversation = {
          __typename: 'Conversation',
          id: `temp-${propertyId}`,
          propertyId,
          propertyTitle,
          lastMessage: '',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          otherPartyName: landlordName,
          otherPartyImage: null,
          isTemporary: true,
          landlordInfo: {
            firstName: landlordName.split(' ')[0] || '',
            lastName: landlordName.split(' ').slice(1).join(' ') || '',
          },
        };
        handleSelectTemporaryConversation(tempConversation);
      }

      setUrlParamsProcessed(true);
    }
  }, [searchParams, isAuthenticated, loadingConversations, conversations.length, urlParamsProcessed]);

  if (authLoading) {
    return <LoadingSpinner message={t('common.loading') || 'Loading...'} />;
  }

  if (!isAuthenticated) {
    return (
      <>
        <UnauthenticatedState onSignIn={() => setShowAuthModal(true)} />
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Page Header */}
      <ChatHeader conversationCount={conversations.length} />

      {/* Main Chat Layout */}
      <div className="flex-1 flex overflow-hidden pt-16">
        {/* Conversation Sidebar */}
        <ConversationSidebar
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onDirectChatCreated={(conversationId, otherPartyName) => {
            handleSelectConversation(conversationId, otherPartyName);
          }}
          currentUserId={user?.userId || ''}
          showConversationList={showConversationList}
        />

        {/* Chat Area */}
        <ChatArea
          messages={messages}
          loadingMessages={loadingMessages}
          sendingMessage={sendingMessage}
          currentUserId={user?.userId || ''}
          currentUser={user}
          showConversationList={showConversationList}
          onBackToConversations={handleBackToConversationsWithCleanup}
          onSendMessage={handleSendMessage}
          onDeleteMessage={handleDeleteMessage}
          getSuggestedMessage={getSuggestedMessage}
          landlordName={searchParams.get('landlordName') || undefined}
        />
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <ChatPageContent />
    </Suspense>
  );
}
