'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { ChatSubscriptionManager } from '@/lib/subscriptions';
import { useAuth } from './AuthContext';
import { Conversation, ChatMessage } from '@/API';
import {
  getUserConversations,
  getConversationMessages,
  getUnreadCount,
} from '@/graphql/queries';
import {
  sendMessage as sendMessageMutation,
  markAsRead,
  initializePropertyChat,
} from '@/graphql/mutations';

interface ChatContextType {
  conversations: Conversation[];
  messages: ChatMessage[];
  selectedConversation: Conversation | null;
  unreadCount: number;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  isLoading: boolean;

  loadConversations: () => Promise<Conversation[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  initializeChat: (propertyId: string) => Promise<{
    conversationId: string;
    landlordName: string;
    propertyTitle: string;
  }>;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  subscribeToConversation: (conversationId: string) => void;
  refreshUnreadCount: () => Promise<void>;
  clearMessages: () => void;
  selectConversation: (conversationId: string | null) => void;
  selectTemporaryConversation: (tempConversation: Conversation & { isTemporary?: boolean; propertyId?: string; landlordInfo?: { firstName: string; lastName: string } }) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lastUnreadRefresh = useRef(0);
  const messageSubscriptionRef = useRef<any>(null);
  const sendingRef = useRef(false);
  const initialLoadDone = useRef(false);

  const loadConversations = async (): Promise<Conversation[]> => {
    if (!user) return [];

    try {
      if (!initialLoadDone.current) {
        setLoadingConversations(true);
      }
      const data = await GraphQLClient.executeAuthenticated<{ getUserConversations: Conversation[] }>(
        getUserConversations
      );
      const userConversations = data.getUserConversations;
      setConversations(userConversations);
      initialLoadDone.current = true;
      return userConversations;
    } catch (error) {
      console.error('Error loading conversations:', error);
      return [];
    } finally {
      setLoadingConversations(false);
    }
  };

  const loadMessages = async (conversationId: string): Promise<void> => {
    try {
      setLoadingMessages(true);
      const data = await GraphQLClient.executeAuthenticated<{ getConversationMessages: ChatMessage[] }>(
        getConversationMessages,
        { conversationId }
      );
      setMessages(data.getConversationMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (conversationId: string, content: string): Promise<void> => {
    if (sendingRef.current) return;

    try {
      sendingRef.current = true;
      setSendingMessage(true);

      const data = await GraphQLClient.executeAuthenticated<{ sendMessage: ChatMessage }>(
        sendMessageMutation,
        { input: { conversationId, content } }
      );

      const newMessage = data.sendMessage;
      updateConversationLastMessage(conversationId, content, newMessage.timestamp);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      sendingRef.current = false;
      setSendingMessage(false);
    }
  };

  const initializeChat = async (propertyId: string): Promise<{
    conversationId: string;
    landlordName: string;
    propertyTitle: string;
  }> => {
    try {
      const data = await GraphQLClient.executeAuthenticated<{
        initializePropertyChat: {
          conversationId: string;
          landlordInfo: { firstName: string; lastName: string; businessName?: string; profileImage?: string };
          propertyTitle: string;
          propertyId: string;
        };
      }>(initializePropertyChat, { propertyId });

      const chatData = data.initializePropertyChat;
      if (!chatData) throw new Error('Failed to initialize chat');

      const landlordName = chatData.landlordInfo.businessName ||
        `${chatData.landlordInfo.firstName} ${chatData.landlordInfo.lastName}`;

      await loadConversations();

      return {
        conversationId: chatData.conversationId,
        landlordName,
        propertyTitle: chatData.propertyTitle,
      };
    } catch (error) {
      console.error('Error initializing chat:', error);
      throw error;
    }
  };

  const markConversationAsRead = async (conversationId: string): Promise<void> => {
    try {
      await GraphQLClient.executeAuthenticated<{ markAsRead: any }>(
        markAsRead,
        { conversationId }
      );

      setConversations(prev =>
        prev.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );

      refreshUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
      throw error;
    }
  };

  const subscribeToConversation = (conversationId: string): void => {
    if (messageSubscriptionRef.current) {
      messageSubscriptionRef.current();
      messageSubscriptionRef.current = null;
    }

    const manager = ChatSubscriptionManager.getInstance();

    const unsubscribe = manager.subscribe(conversationId, {
      onMessage: (newMessage: ChatMessage) => {
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });

        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: newMessage.content,
                  lastMessageTime: newMessage.timestamp,
                  unreadCount: newMessage.isMine ? conv.unreadCount : (conv.unreadCount || 0) + 1,
                }
              : conv
          ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
        );

        if (!newMessage.isMine) {
          refreshUnreadCount();
        }
      },
      onError: (error: Error) => {
        console.error('Chat subscription error:', error);
      },
    });

    messageSubscriptionRef.current = unsubscribe;
  };

  const refreshUnreadCount = async (): Promise<void> => {
    if (!user) return;

    const now = Date.now();
    if (now - lastUnreadRefresh.current < 500) return;
    lastUnreadRefresh.current = now;

    try {
      setIsLoading(true);
      const data = await GraphQLClient.executeAuthenticated<{ getUnreadCount: number }>(
        getUnreadCount
      );
      setUnreadCount(data.getUnreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = (): void => {
    setMessages([]);
  };

  const selectConversation = (conversationId: string | null): void => {
    if (conversationId === null) {
      setSelectedConversation(null);
      return;
    }

    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
    } else {
      setSelectedConversation({
        id: conversationId,
        lastMessage: '',
        lastMessageTime: new Date().toISOString(),
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as unknown as Conversation);
    }
  };

  const selectTemporaryConversation = (tempConversation: Conversation & { isTemporary?: boolean; propertyId?: string; landlordInfo?: { firstName: string; lastName: string } }): void => {
    setConversations(prev => {
      const exists = prev.some(c => c.id === tempConversation.id);
      if (!exists) return [...prev, tempConversation];
      return prev;
    });
    setSelectedConversation(tempConversation);
  };

  const updateConversationLastMessage = (conversationId: string, content: string, timestamp: string): void => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, lastMessage: content, lastMessageTime: timestamp, updatedAt: timestamp }
          : conv
      ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
    );
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      setConversations([]);
      setMessages([]);
      return;
    }

    loadConversations();
    refreshUnreadCount();

    const pollInterval = setInterval(() => {
      loadConversations();
      refreshUnreadCount();
    }, 15000);

    return () => clearInterval(pollInterval);
  }, [isAuthenticated, user]);

  useEffect(() => {
    return () => {
      if (messageSubscriptionRef.current) {
        messageSubscriptionRef.current();
        messageSubscriptionRef.current = null;
      }
    };
  }, []);

  const value: ChatContextType = {
    conversations,
    messages,
    selectedConversation,
    unreadCount,
    loadingConversations,
    loadingMessages,
    sendingMessage,
    isLoading,
    loadConversations,
    loadMessages,
    sendMessage,
    initializeChat,
    markConversationAsRead,
    subscribeToConversation,
    refreshUnreadCount,
    clearMessages,
    selectConversation,
    selectTemporaryConversation,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        conversations: [],
        messages: [],
        selectedConversation: null,
        unreadCount: 0,
        loadingConversations: false,
        loadingMessages: false,
        sendingMessage: false,
        isLoading: true,
        loadConversations: async () => [],
        loadMessages: async () => {},
        sendMessage: async () => {},
        initializeChat: async () => ({ conversationId: '', landlordName: '', propertyTitle: '' }),
        markConversationAsRead: async () => {},
        subscribeToConversation: () => {},
        refreshUnreadCount: async () => {},
        clearMessages: () => {},
        selectConversation: () => {},
        selectTemporaryConversation: () => {},
      } as ChatContextType;
    }
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
