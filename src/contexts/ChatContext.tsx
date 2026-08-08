'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { GraphQLClient } from '@/lib/graphql-client';
import { ChatSubscriptionManager } from '@/lib/subscriptions';
import { AuthBridge } from '@/lib/auth-bridge';
import { useAuth } from './AuthContext';
import { Conversation, ChatMessage, TypingIndicatorEvent } from '@/API';
import {
  getUserConversations,
  getConversationMessages,
  getUnreadCount,
} from '@/graphql/queries';
import {
  sendMessage as sendMessageMutation,
  markAsRead,
  initializePropertyChat,
  toggleMessageReaction as toggleMessageReactionMutation,
  sendTypingIndicator as sendTypingIndicatorMutation,
} from '@/graphql/mutations';

export interface TypingUser {
  userId: string;
  userName: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: ChatMessage[];
  selectedConversation: Conversation | null;
  unreadCount: number;
  loadingConversations: boolean;
  loadingMessages: boolean;
  sendingMessage: boolean;
  isLoading: boolean;
  typingUser: TypingUser | null;
  myUserId: string | undefined;

  loadConversations: () => Promise<Conversation[]>;
  loadMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string, replyToMessageId?: string) => Promise<void>;
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
  toggleReaction: (messageId: string, emoji: string) => Promise<void>;
  sendTypingIndicator: (conversationId: string) => void;
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
  const [typingUser, setTypingUserState] = useState<TypingUser | null>(null);
  const [myUserId, setMyUserId] = useState<string | undefined>(undefined);

  const lastUnreadRefresh = useRef(0);
  const subscriptionRefs = useRef<Array<() => void>>([]);
  const sendingRef = useRef(false);
  const initialLoadDone = useRef(false);
  const typingClearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingSendThrottleRef = useRef(0);

  // The signed-in user's real Cognito sub. UserProfile.userId (from getMe) is always
  // undefined — the Tenant/Landlord/Agent/Admin schema types have no id field at all —
  // so this reads it from the Amplify session directly instead. Used to compute isMine
  // for incoming subscription messages ourselves rather than trusting the server value,
  // since a stale/incomplete identity here would otherwise misflag every message.
  const myUserIdRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!user) {
      myUserIdRef.current = undefined;
      setMyUserId(undefined);
      return;
    }
    AuthBridge.getUserId().then(id => {
      myUserIdRef.current = id;
      setMyUserId(id);
    });
  }, [user]);

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

  const sendMessage = async (conversationId: string, content: string, replyToMessageId?: string): Promise<void> => {
    if (sendingRef.current) return;

    try {
      sendingRef.current = true;
      setSendingMessage(true);

      const data = await GraphQLClient.executeAuthenticated<{ sendMessage: ChatMessage }>(
        sendMessageMutation,
        { input: { conversationId, content, replyToMessageId } }
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

  // Merge a message payload into state — used for both brand-new messages
  // (append) and updates (find-and-replace, e.g. reactions).
  const resolveIncomingMessage = (incoming: ChatMessage): ChatMessage => {
    // Recompute isMine from senderId against the real signed-in user id rather than
    // trusting the server value — see myUserIdRef above for why user?.userId can't
    // be used for this comparison.
    const resolvedIsMine =
      incoming.senderId && myUserIdRef.current
        ? incoming.senderId === myUserIdRef.current
        : incoming.isMine;
    return { ...incoming, isMine: resolvedIsMine };
  };

  const subscribeToConversation = (conversationId: string): void => {
    subscriptionRefs.current.forEach(unsub => unsub());
    subscriptionRefs.current = [];

    const manager = ChatSubscriptionManager.getInstance();

    const unsubNewMessage = manager.subscribe<ChatMessage>('onNewMessage', conversationId, {
      onEvent: (newMessage) => {
        const resolvedMessage = resolveIncomingMessage(newMessage);

        setMessages(prev => {
          const exists = prev.some(msg => msg.id === resolvedMessage.id);
          if (exists) return prev;
          return [...prev, resolvedMessage];
        });

        setConversations(prev =>
          prev.map(conv =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: resolvedMessage.content,
                  lastMessageTime: resolvedMessage.timestamp,
                  unreadCount: resolvedMessage.isMine ? conv.unreadCount : (conv.unreadCount || 0) + 1,
                }
              : conv
          ).sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime())
        );

        if (!resolvedMessage.isMine) {
          refreshUnreadCount();
        }
        // A new message from the other party means they're done typing
        if (resolvedMessage.senderId !== myUserIdRef.current) {
          clearTypingUser();
        }
      },
      onError: (error) => console.error('onNewMessage subscription error:', error),
    });

    const unsubMessageUpdated = manager.subscribe<ChatMessage>('onMessageUpdated', conversationId, {
      onEvent: (updated) => {
        const resolvedMessage = resolveIncomingMessage(updated);
        setMessages(prev => prev.map(m => (m.id === resolvedMessage.id ? resolvedMessage : m)));
      },
      onError: (error) => console.error('onMessageUpdated subscription error:', error),
    });

    const unsubTyping = manager.subscribe<TypingIndicatorEvent>('onTypingIndicator', conversationId, {
      onEvent: (event) => showTypingUser(event),
      onError: (error) => console.error('onTypingIndicator subscription error:', error),
    });

    const unsubRead = manager.subscribe<Conversation>('onConversationRead', conversationId, {
      onEvent: (event) => {
        if (!event.readByUserId || !event.readAt || event.readByUserId === myUserIdRef.current) return;
        const readAt = event.readAt;
        setMessages(prev =>
          prev.map(m =>
            m.conversationId === event.id && m.isMine && m.timestamp <= readAt
              ? { ...m, readAt }
              : m
          )
        );
      },
      onError: (error) => console.error('onConversationRead subscription error:', error),
    });

    subscriptionRefs.current = [unsubNewMessage, unsubMessageUpdated, unsubTyping, unsubRead];
  };

  // Show/clear the live typing indicator. Ignores our own echo and auto-clears
  // a few seconds after the last event, since there's no explicit "stopped typing"
  // signal — the sender just stops re-broadcasting.
  const showTypingUser = (event: TypingIndicatorEvent): void => {
    if (event.userId === myUserIdRef.current) return;

    if (typingClearTimerRef.current) clearTimeout(typingClearTimerRef.current);
    setTypingUserState({ userId: event.userId, userName: event.userName });
    typingClearTimerRef.current = setTimeout(() => setTypingUserState(null), 4000);
  };

  const clearTypingUser = (): void => {
    if (typingClearTimerRef.current) {
      clearTimeout(typingClearTimerRef.current);
      typingClearTimerRef.current = null;
    }
    setTypingUserState(null);
  };

  const toggleReaction = async (messageId: string, emoji: string): Promise<void> => {
    try {
      const data = await GraphQLClient.executeAuthenticated<{ toggleMessageReaction: ChatMessage }>(
        toggleMessageReactionMutation,
        { messageId, emoji }
      );
      const resolvedMessage = resolveIncomingMessage(data.toggleMessageReaction);
      setMessages(prev => prev.map(m => (m.id === resolvedMessage.id ? resolvedMessage : m)));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  };

  // Broadcast a typing event. Fire-and-forget, throttled so rapid keystrokes
  // don't spam a mutation call per character.
  const sendTypingIndicator = (conversationId: string): void => {
    const now = Date.now();
    if (now - typingSendThrottleRef.current < 3000) return;
    typingSendThrottleRef.current = now;

    GraphQLClient.executeAuthenticated(sendTypingIndicatorMutation, { conversationId }).catch(() => {
      // Non-critical — a missed typing event just means the other side doesn't see it this time
    });
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
      subscriptionRefs.current.forEach(unsub => unsub());
      subscriptionRefs.current = [];
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
    typingUser,
    myUserId,
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
    toggleReaction,
    sendTypingIndicator,
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
        typingUser: null,
        myUserId: undefined,
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
        toggleReaction: async () => {},
        sendTypingIndicator: () => {},
      } as ChatContextType;
    }
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
